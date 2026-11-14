'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar, vozDisponivel } from '@/adaptadores/voz/web-speech';
import { resolverPonto } from '@/dominio/pontos';
import { calcularRota, IndiceGrafo } from '@/dominio/rotas/dijkstra';
import { gerarInstrucoes, type Passo } from '@/dominio/rotas/instrucoes';
import type { Grafo, Idioma, Local, PerfilRota, Ponto } from '@/dominio/tipos';
import { CHAVE_PREFERENCIAS, type Preferencias } from '@/funcionalidades/preferencias/script-preferencias';

/** Mesma chave do cartão "Você está em…" (RF-01/RF-02): a origem vem do QR da sessão. */
const CHAVE_PONTO = 'gd:ponto';

const PERFIS: readonly PerfilRota[] = ['padrao', 'sem_degraus', 'mobilidade_reduzida', 'visual', 'sensorial'];
const ROTULO_PERFIL = {
  padrao: 'perfilPadrao',
  sem_degraus: 'perfilSemDegraus',
  mobilidade_reduzida: 'perfilMobilidade',
  visual: 'perfilVisual',
  sensorial: 'perfilSensorial',
} as const;
const ROTULO_STATUS = { operando: 'statusOperando', manutencao: 'statusManutencao', fora: 'statusFora' } as const;

/** Padrões de vibração por tipo de passo (RF-12). */
const VIBRAR: Partial<Record<Passo['tipo'], number[]>> = {
  seguir: [100],
  virar_esquerda: [150, 80, 150],
  virar_direita: [150, 80, 150],
  retornar: [80, 40, 80, 40, 80],
  elevador: [120],
  escada_rolante: [120],
  escada: [120],
  chegada: [400],
};

interface EquipamentoApi {
  id: string;
  tipo: string;
  status: 'operando' | 'manutencao' | 'fora';
}

interface Props {
  grafo: Grafo;
  pontos: readonly Ponto[];
  locais: readonly Local[];
  idioma: Idioma;
}

/**
 * T05 — Rota (RF-11, RF-12, RF-13): origem do QR/sessão, destino em 1 toque,
 * perfil das preferências, status dos equipamentos (timeout de 2 s), passos com
 * texto + voz + vibração e recálculo explicando o motivo.
 */
export function TelaRota({ grafo, pontos, locais, idioma }: Props) {
  const t = useTranslations('rota');
  const tp = useTranslations('preferencias');
  const ts = useTranslations('servicos');
  const tf = useTranslations('pisos');
  const anunciar = useAnunciador();
  const params = useSearchParams();

  const deDaUrl = params.get('de');
  const paraDaUrl = params.get('para');

  const [origemCodigo, setOrigemCodigo] = useState<string | null>(null);
  const [destinoSlug, setDestinoSlug] = useState<string | null>(paraDaUrl);
  const [perfil, setPerfil] = useState<PerfilRota>('padrao');
  const [vibracao, setVibracao] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const [equipamentos, setEquipamentos] = useState<EquipamentoApi[] | null>(null);
  const [statusEquip, setStatusEquip] = useState<'consultando' | 'ok' | 'indisponivel'>('consultando');
  const [inativos, setInativos] = useState<ReadonlySet<string> | null>(null);
  const [indice, setIndice] = useState(0);
  const [chegou, setChegou] = useState(false);

  const indiceGrafo = useMemo(() => new IndiceGrafo(grafo), [grafo]);
  const nomesDosLocais = useMemo(() => new Map(locais.map((l) => [l.id, l.nome])), [locais]);

  // Preferências e ponto da sessão: lidos depois da hidratação (sem divergência de SSR).
  useEffect(() => {
    // setTimeout (e não rAF): tem de carregar mesmo com a aba em segundo plano —
    // mesmo padrão do T01; evita o lint react-hooks/set-state-in-effect.
    const carregar = setTimeout(() => {
      try {
        const p = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) || '{}') as Preferencias;
        if (p.perfilRota) setPerfil(p.perfilRota);
        setVibracao(Boolean(p.vibracao));
        if (typeof p.velocidadeVoz === 'number' && p.velocidadeVoz >= 0.5 && p.velocidadeVoz <= 2) {
          setVelocidade(p.velocidadeVoz);
        }
        const codigoUrl = deDaUrl ?? sessionStorage.getItem(CHAVE_PONTO);
        if (codigoUrl && resolverPonto(codigoUrl, pontos)) setOrigemCodigo(codigoUrl);
      } catch {
        // armazenamento indisponível (modo privado): segue com os padrões
      }
    }, 0);
    return () => clearTimeout(carregar);
  }, [deDaUrl, pontos]);

  // Status dos elevadores/escadas rolantes (RF-23) com timeout de 2 s.
  useEffect(() => {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 2000);
    fetch('/api/equipamentos', { signal: controle.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http'))))
      .then((dados: { equipamentos: EquipamentoApi[] }) => {
        setEquipamentos(dados.equipamentos);
        setInativos(new Set(dados.equipamentos.filter((e) => e.status !== 'operando').map((e) => e.id)));
        setStatusEquip('ok');
      })
      .catch(() => setStatusEquip('indisponivel'))
      .finally(() => clearTimeout(limite));
    return () => {
      clearTimeout(limite);
      controle.abort();
    };
  }, []);

  const origemNo = origemCodigo ? (resolverPonto(origemCodigo, pontos)?.noId ?? null) : null;
  const destinoLocal = destinoSlug ? locais.find((l) => l.slug === destinoSlug) : undefined;
  const destinoNo = destinoLocal?.entradaNoId ?? null;

  const zonasRuidosas = useMemo(() => {
    if (perfil !== 'sensorial') return undefined;
    return new Set(
      locais.filter((l) => l.sensorial?.ruido === 'alto' && l.entradaNoId).map((l) => l.entradaNoId as string),
    );
  }, [perfil, locais]);

  const resultado = useMemo(() => {
    if (!origemNo || !destinoNo) return null;
    return calcularRota(indiceGrafo, origemNo, destinoNo, {
      perfil,
      equipamentosInativos: inativos ?? undefined,
      zonasRuidosas,
    });
  }, [indiceGrafo, origemNo, destinoNo, perfil, inativos, zonasRuidosas]);

  const passos = useMemo(() => {
    if (!resultado?.ok || !destinoLocal) return [];
    return gerarInstrucoes(resultado.trechos, {
      idioma,
      nomeDoPiso: (piso) => tf(piso as 'terreo'),
      nomeDoMarco: (id) => nomesDosLocais.get(id),
      nomeDoDestino: destinoLocal.nome,
    });
  }, [resultado, destinoLocal, idioma, tf, nomesDosLocais]);

  // Anúncio + reinício dos passos quando a rota muda (RF-13: explicar o motivo).
  const chaveRota = `${origemNo ?? ''}|${destinoNo ?? ''}|${perfil}|${inativos?.size ?? 'x'}`;
  const anunciadoRef = useRef('');
  const motivoRef = useRef<string | null>(null);
  useEffect(() => {
    if (!resultado?.ok || anunciadoRef.current === chaveRota) return;
    const inicial = anunciadoRef.current === '';
    anunciadoRef.current = chaveRota;
    setIndice(0);
    setChegou(false);
    if (inicial) anunciar(`${t('distancia', { m: resultado.distanciaM })}, ${t('tempo', { n: resultado.minutos })}`);
    else anunciar(t('recalculado', { motivo: motivoRef.current ?? t('motivoPerfil') }));
    motivoRef.current = null;
  }, [chaveRota, resultado, anunciar, t]);

  function ouvir(texto: string) {
    if (vozDisponivel()) falar(texto, idioma, undefined, velocidade);
    else anunciar(texto);
  }

  function irParaPasso(novo: number) {
    const passo = passos[novo];
    if (!passo) return;
    setIndice(novo);
    setChegou(false);
    const padrao = VIBRAR[passo.tipo];
    if (vibracao && padrao && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(padrao);
    ouvir(passo.texto);
  }

  function aoMudarPerfil(novo: PerfilRota) {
    motivoRef.current = t('motivoPerfil');
    setPerfil(novo);
  }

  function aoChegar() {
    setChegou(true);
    const ultimo = passos[passos.length - 1];
    if (vibracao && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([400]);
    ouvir(ultimo?.tipo === 'chegada' ? ultimo.texto : t('chegou'));
    anunciar(t('chegou'), 'assertive');
  }

  const locaisRoutable = locais
    .filter((l) => l.entradaNoId)
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const pontosAtivos = pontos.filter((p) => p.ativo && p.noId);

  return (
    <div className="space-y-4">
      {/* ---------------------------------------------------- origem e destino */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="origem" className="mb-1 block font-bold">
            {t('origem')}
          </label>
          <select
            id="origem"
            className="alvo w-full rounded-lg border-2 border-borda bg-fundo p-3"
            value={origemCodigo ?? ''}
            onChange={(e) => setOrigemCodigo(e.target.value || null)}
          >
            <option value="">{origemCodigo ? t('origemSalva') : t('semOrigem')}</option>
            {pontosAtivos.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.nome[idioma] ?? p.nome['pt-BR']}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="destino" className="mb-1 block font-bold">
            {t('para')}
          </label>
          <select
            id="destino"
            className="alvo w-full rounded-lg border-2 border-borda bg-fundo p-3"
            value={destinoSlug ?? ''}
            onChange={(e) => setDestinoSlug(e.target.value || null)}
          >
            <option value="">{t('escolherDestino')}</option>
            {locaisRoutable.map((l) => (
              <option key={l.id} value={l.slug}>
                {l.nome} ({l.numero})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --------------------------------------------------------------- perfil */}
      <div>
        <label htmlFor="perfil" className="mb-1 block font-bold">
          {t('perfilRota')}
        </label>
        <select
          id="perfil"
          className="alvo w-full rounded-lg border-2 border-borda bg-fundo p-3 md:w-80"
          value={perfil}
          onChange={(e) => aoMudarPerfil(e.target.value as PerfilRota)}
        >
          {PERFIS.map((p) => (
            <option key={p} value={p}>
              {tp(ROTULO_PERFIL[p])}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-texto-suave">{t('dicaPerfil')}</p>
      </div>

      {/* -------------------------------------------------- status equipamentos */}
      <section aria-labelledby="status-equip" className="rounded-xl border border-borda p-4">
        <h2 id="status-equip" className="text-lg font-bold">
          {t('statusEquip')}
        </h2>
        {statusEquip === 'consultando' && <p className="mt-2 text-texto-suave">{t('consultando')}</p>}
        {statusEquip === 'indisponivel' && <p className="mt-2 text-texto-suave">{t('statusIndisponivel')}</p>}
        {statusEquip === 'ok' && equipamentos && (
          <ul className="mt-2 space-y-1">
            {equipamentos.map((e) => (
              <li key={e.id} className="flex items-center gap-2">
                <span aria-hidden="true">{e.status === 'operando' ? '✅' : '⚠️'}</span>
                <span>
                  {e.id} — {ts(ROTULO_STATUS[e.status])}
                </span>
              </li>
            ))}
            {(inativos?.size ?? 0) > 0 && (
              <li className="text-sm text-texto-suave">
                {[...inativos!].map((id) => (
                  <span key={id}>{t('equipManutencao', { id })} </span>
                ))}
              </li>
            )}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------- mensagens/rota */}
      {!origemNo && <p className="rounded-lg border border-borda p-3">{t('semOrigem')}</p>}
      {destinoSlug && !destinoLocal && <p className="rounded-lg border border-perigo p-3">{t('destinoInvalido')}</p>}
      {destinoLocal && !destinoNo && <p className="rounded-lg border border-perigo p-3">{t('semRota')}</p>}
      {resultado && !resultado.ok && (
        <p className="rounded-lg border border-perigo p-3" role="alert">
          {resultado.motivo === 'origem_invalida' ? t('origemInvalida') : t('semRota')}
        </p>
      )}

      {/* --------------------------------------------------------- resumo+passos */}
      {resultado?.ok && passos.length > 0 && (
        <section aria-labelledby="resumo-rota" className="rounded-xl border-2 border-primaria p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="resumo-rota" className="text-lg font-bold">
              {t('distancia', { m: resultado.distanciaM })} · {t('tempo', { n: resultado.minutos })}
            </h2>
            <p className="text-sm text-texto-suave" aria-live="polite">
              {t('passo', { n: indice + 1, total: passos.length })}
            </p>
          </div>

          <ol className="mt-3 space-y-2">
            {passos.map((p, i) => (
              <li
                key={`${p.noId}-${i}`}
                aria-current={i === indice ? 'step' : undefined}
                className={`rounded-lg border p-3 ${
                  i === indice ? 'border-primaria bg-primaria/10 font-bold' : 'border-borda'
                } ${i > indice ? 'text-texto-suave' : ''}`}
              >
                <span className="mr-1">{i + 1}.</span>
                {p.texto}
              </li>
            ))}
          </ol>

          {chegou && (
            <p className="mt-3 rounded-lg border-2 border-ajuda p-3 font-bold" role="status">
              {t('chegou')}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="alvo rounded-lg border-2 border-borda px-4"
              onClick={() => irParaPasso(indice - 1)}
              disabled={indice === 0}
            >
              ← {t('anterior')}
            </button>
            <button
              type="button"
              className="alvo rounded-lg border-2 border-borda px-4"
              onClick={() => irParaPasso(indice)}
            >
              🔁 {t('repetir')}
            </button>
            <button
              type="button"
              className="alvo rounded-lg border-2 border-borda px-4"
              onClick={() => irParaPasso(indice + 1)}
              disabled={indice >= passos.length - 1}
            >
              {t('proximo')} →
            </button>
            <button type="button" className="alvo rounded-lg border-2 border-ajuda bg-ajuda px-4 text-ajuda-texto" onClick={aoChegar}>
              ✔ {t('cheguei')}
            </button>
            <Link
              href={`/mapa/${passos[indice]?.pisoId ?? 'terreo'}`}
              className="alvo flex items-center rounded-lg border-2 border-borda px-4"
            >
              🗺 {t('verNoMapa')}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
