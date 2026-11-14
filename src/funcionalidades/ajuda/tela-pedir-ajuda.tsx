'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import type { Idioma } from '@/dominio/tipos';

type Tipo = 'orientacao' | 'acompanhamento' | 'comunicacao' | 'saude' | 'crianca_perdida' | 'seguranca';
type Modo = 'texto' | 'libras' | 'voz' | 'idioma' | 'pictogramas';

interface PontoResumo {
  codigo: string;
  nome: Partial<Record<Idioma, string>>;
}

interface Props {
  pontos: readonly PontoResumo[];
  idioma: Idioma;
}

const TIPOS: readonly Tipo[] = ['orientacao', 'acompanhamento', 'comunicacao', 'saude', 'crianca_perdida', 'seguranca'];
const MODOS: readonly Modo[] = ['texto', 'libras', 'voz', 'idioma', 'pictogramas'];
const ROTULO_TIPO: Record<Tipo, string> = {
  orientacao: 'tipoOrientacao',
  acompanhamento: 'tipoAcompanhamento',
  comunicacao: 'tipoComunicacao',
  saude: 'tipoSaude',
  crianca_perdida: 'tipoCrianca',
  seguranca: 'tipoSeguranca',
} as const;
const ROTULO_MODO: Record<Modo, string> = {
  texto: 'modoTexto',
  libras: 'modoLibras',
  voz: 'modoVoz',
  idioma: 'modoIdioma',
  pictogramas: 'modoPictogramas',
} as const;

/**
 * T08 — Pedir ajuda (RF-19, RF-20): formulário em 2 etapas (tipo + modo de comunicação;
 * local + observação + consentimento LGPD). Envia para POST /api/ajuda e leva o
 * visitante ao T09 com o token de acompanhamento.
 */
export function TelaPedirAjuda({ pontos, idioma }: Props) {
  const t = useTranslations('pedidoAjuda');
  const anunciar = useAnunciador();
  const router = useRouter();

  const [etapa, setEtapa] = useState(1);
  const [tipo, setTipo] = useState<Tipo>('orientacao');
  const [modo, setModo] = useState<Modo>('texto');
  const [ponto, setPonto] = useState('');
  const [observacao, setObservacao] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // Origem do QR/sessão como sugestão de "onde você está" (mesma chave do T01/T05).
  useEffect(() => {
    const carregar = setTimeout(() => {
      try {
        const salvo = sessionStorage.getItem('gd:ponto');
        if (salvo && pontos.some((p) => p.codigo === salvo)) setPonto(salvo);
      } catch {
        // armazenamento indisponível (modo privado): deixa a pessoa escolher
      }
    }, 0);
    return () => clearTimeout(carregar);
  }, [pontos]);

  async function enviar(): Promise<void> {
    if (!consentimento || !ponto || enviando) return;
    setEnviando(true);
    setErro('');
    try {
      // UUID do aparelho: identifica o aparelho sem identificar a pessoa (RN-03/LGPD).
      let aparelho = '';
      try {
        aparelho = localStorage.getItem('gd:aparelho') ?? '';
        if (!aparelho) {
          aparelho = crypto.randomUUID();
          localStorage.setItem('gd:aparelho', aparelho);
        }
      } catch {
        aparelho = crypto.randomUUID(); // modo privado: um por sessão, sem persistir
      }

      const resposta = await fetch('/api/ajuda', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          tipo,
          pontoCodigo: ponto,
          modoComunicacao: modo,
          idioma,
          observacao: observacao.trim() || undefined,
          tokenAparelho: aparelho,
          consentimento: true,
        }),
      });
      const dados = await resposta.json().catch(() => null);

      if (resposta.status === 201 && dados?.id && dados?.token) {
        anunciar(t('sucesso'));
        router.push(`/ajuda/${dados.id}?token=${dados.token}`);
        return;
      }
      if (resposta.status === 429) {
        setErro(t('limite'));
        anunciar(t('limite'), 'assertive');
      } else if (resposta.status === 503 || dados?.erro === 'central_nao_configurada') {
        setErro(t('centralOff'));
        anunciar(t('centralOff'), 'assertive');
      } else {
        setErro(t('erro'));
        anunciar(t('erro'), 'assertive');
      }
    } catch {
      setErro(t('erro'));
      anunciar(t('erro'), 'assertive');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-4">
      <p aria-live="polite" className="rounded-lg border border-borda bg-superficie px-3 py-2 font-bold">
        {t('etapa', { n: etapa, total: 2 })}
      </p>

      {etapa === 1 ? (
        <section aria-labelledby="etapa-1" className="space-y-4">
          <h2 id="etapa-1" className="text-xl font-bold">
            {t('tipo')}
          </h2>
          <fieldset className="space-y-2">
            <legend className="sr-only">{t('tipo')}</legend>
            {TIPOS.map((op) => (
              <label key={op} className="alvo flex cursor-pointer items-center gap-3 rounded-lg border-2 border-borda px-3">
                <input
                  type="radio"
                  name="tipo"
                  value={op}
                  checked={tipo === op}
                  onChange={() => setTipo(op)}
                  className="h-6 w-6 accent-[var(--cor-primaria)]"
                />
                <span>{t(ROTULO_TIPO[op])}</span>
              </label>
            ))}
          </fieldset>

          <h2 className="text-xl font-bold">{t('modo')}</h2>
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">{t('modo')}</legend>
            {MODOS.map((op) => (
              <label key={op} className="alvo flex cursor-pointer items-center gap-2 rounded-lg border-2 border-borda px-3">
                <input
                  type="radio"
                  name="modo"
                  value={op}
                  checked={modo === op}
                  onChange={() => setModo(op)}
                  className="h-6 w-6 accent-[var(--cor-primaria)]"
                />
                <span>{t(ROTULO_MODO[op])}</span>
              </label>
            ))}
          </fieldset>

          <button
            type="button"
            className="alvo w-full rounded-lg border-2 border-primaria bg-primaria px-4 text-primaria-texto"
            onClick={() => setEtapa(2)}
          >
            {t('proxima')}
          </button>
        </section>
      ) : (
        <section aria-labelledby="etapa-2" className="space-y-4">
          <h2 id="etapa-2" className="text-xl font-bold">
            {t('local')}
          </h2>
          <label className="block space-y-1">
            <span className="font-bold">{t('local')}</span>
            <select
              className="alvo w-full rounded-lg border-2 border-borda bg-fundo px-3"
              value={ponto}
              onChange={(e) => setPonto(e.target.value)}
            >
              <option value="">—</option>
              {pontos.map((p) => (
                <option key={p.codigo} value={p.codigo}>
                  {p.nome[idioma] ?? p.nome['pt-BR'] ?? p.codigo}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-bold">{t('observacao')}</span>
            <textarea
              className="alvo min-h-24 w-full rounded-lg border-2 border-borda bg-fundo px-3 py-2"
              maxLength={280}
              placeholder={t('observacaoPlaceholder')}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </label>

          {/* Consentimento específico e destacado (LGPD art. 11, I). */}
          <label className="alvo flex cursor-pointer items-start gap-3 rounded-lg border-2 border-perigo p-3">
            <input
              type="checkbox"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mt-1 h-6 w-6 accent-[var(--cor-perigo)]"
            />
            <span>{t('consentimento')}</span>
          </label>

          {erro && (
            <p role="alert" className="rounded-lg border-2 border-perigo p-3">
              {erro}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" className="alvo flex-1 rounded-lg border-2 border-borda px-4" onClick={() => setEtapa(1)} disabled={enviando}>
              {t('voltar')}
            </button>
            <button
              type="button"
              className="alvo flex-1 rounded-lg border-2 border-primaria bg-primaria px-4 text-primaria-texto disabled:opacity-60"
              disabled={!consentimento || !ponto || enviando}
              onClick={() => void enviar()}
            >
              {enviando ? t('enviando') : t('enviar')}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
