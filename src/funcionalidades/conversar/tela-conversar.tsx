'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar, vozDisponivel } from '@/adaptadores/voz/web-speech';
import { provedorEscuta } from '@/adaptadores/voz/escuta-web';
import { criarProvedorFrasesProntas } from '@/adaptadores/traducao/frases-prontas';
import { provedorNuvem } from '@/adaptadores/traducao/nuvem';
import { traduzirEmCascata } from '@/adaptadores/traducao/porta';
import type { Idioma } from '@/dominio/tipos';

/** Nomes de idioma no próprio idioma (mesmo padrão do cabeçalho). */
const ROTULO_IDIOMA: Record<Idioma, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
};

type Lado = 'visitante' | 'atendente';

interface Frase {
  id: string;
  'pt-BR': string;
  en: string;
  es: string;
}

interface GrupoFrases {
  id: string;
  nome: Record<Idioma, string>;
  frases: Frase[];
}

interface Mensagem {
  id: number;
  autor: Lado;
  original: string;
  traducao: string | null;
  fonte: 'frases-prontas' | 'nuvem' | 'no-aparelho' | null;
  traduzindo: boolean;
}

interface Props {
  frases: readonly GrupoFrases[];
  /** Idioma da tela (lado do visitante, que segura o aparelho). */
  idioma: Idioma;
  /** URL da videochamada com intérprete, configurada pelo shopping (RF-17). */
  urlInterprete: string;
}

/**
 * T06 — Conversar (RF-14 a RF-17): metade de cima girada 180° para o atendente
 * sentado do outro lado, legenda ao vivo por lado (ProvedorEscuta, sem gravação),
 * "digite e o celular fala", frases prontas offline e tradução em cascata
 * (frases prontas revisadas → nuvem), com atalho para intérprete de Libras.
 */
export function TelaConversar({ frases, idioma, urlInterprete }: Props) {
  const t = useTranslations('conversar');
  const anunciar = useAnunciador();

  const [idiomaVisitante, setIdiomaVisitante] = useState<Idioma>(idioma);
  const [idiomaAtendente, setIdiomaAtendente] = useState<Idioma>(idioma === 'pt-BR' ? 'en' : 'pt-BR');
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [ouvindo, setOuvindo] = useState<Lado | null>(null);
  const [legenda, setLegenda] = useState<{ lado: Lado; texto: string } | null>(null);
  const [digitando, setDigitando] = useState<{ visitante: string; atendente: string }>({ visitante: '', atendente: '' });
  const [aviso, setAviso] = useState('');
  const contador = useRef(0);

  // Cascata de tradução: primeiro o banco de frases revisadas (custo zero e offline),
  // depois a nuvem via /api/traducao (só entra se TRADUCAO_PROVEDOR estiver configurado).
  const cascata = useMemo(() => [criarProvedorFrasesProntas(frases.flatMap((g) => g.frases)), provedorNuvem], [frases]);

  useEffect(() => () => provedorEscuta.parar(), []);

  /** Publica uma fala/digitação de um lado: mostra, traduz para o outro lado e fala em voz alta. */
  async function publicar(autor: Lado, texto: string): Promise<void> {
    const limpo = texto.trim();
    if (!limpo) return;
    const de = autor === 'visitante' ? idiomaVisitante : idiomaAtendente;
    const para = autor === 'visitante' ? idiomaAtendente : idiomaVisitante;
    contador.current += 1;
    const id = contador.current;
    setMensagens((atual) => [...atual, { id, autor, original: limpo, traducao: null, fonte: null, traduzindo: true }]);

    const r = await traduzirEmCascata(cascata, limpo, de, para);
    setMensagens((atual) =>
      atual.map((m) => (m.id === id ? { ...m, traducao: r?.texto ?? null, fonte: r?.fonte ?? null, traduzindo: false } : m)),
    );

    // O celular fala o que o OUTRO lado precisa ouvir (RF-15).
    const paraFalar = r?.texto ?? limpo;
    if (vozDisponivel()) falar(paraFalar, r ? para : de);
    anunciar(r ? `${paraFalar} — ${r.fonte === 'frases-prontas' ? t('fonteFrases') : t('fonteNuvem')}` : t('semTraducao'));
  }

  function alternarEscuta(lado: Lado): void {
    if (ouvindo === lado) {
      provedorEscuta.parar();
      setOuvindo(null);
      setLegenda(null);
      return;
    }
    if (!provedorEscuta.disponivel()) {
      setAviso(t('vozIndisponivel'));
      anunciar(t('vozIndisponivel'), 'assertive');
      return;
    }
    setAviso('');
    setOuvindo(lado);
    setLegenda(null);
    provedorEscuta.iniciar(
      lado === 'visitante' ? idiomaVisitante : idiomaAtendente,
      (texto, final) => {
        if (final) {
          setLegenda(null);
          void publicar(lado, texto);
        } else {
          setLegenda({ lado, texto });
        }
      },
      () => {
        setOuvindo(null);
        setLegenda(null);
        setAviso(t('vozIndisponivel'));
      },
    );
  }

  function enviar(lado: Lado): void {
    const texto = digitando[lado];
    setDigitando((d) => ({ ...d, [lado]: '' }));
    void publicar(lado, texto);
  }

  function chamarInterprete(): void {
    if (!urlInterprete) {
      setAviso(t('semInterprete'));
      anunciar(t('semInterprete'), 'assertive');
      return;
    }
    window.open(urlInterprete, '_blank', 'noopener,noreferrer');
    anunciar(t('interpretarAberto'));
  }

  function limpar(): void {
    provedorEscuta.parar();
    setOuvindo(null);
    setLegenda(null);
    setMensagens([]);
    setAviso('');
    anunciar(t('limpar'));
  }

  const frasesDoVisitante = frases.find((g) => g.id === 'visitante');
  const frasesDoAtendente = frases.find((g) => g.id === 'atendente');

  /** Painel de um lado: idioma, falar, digitar, frases prontas e a conversa vista daquele lado. */
  function painel(lado: Lado) {
    const eVisitante = lado === 'visitante';
    const idiomaLado = eVisitante ? idiomaVisitante : idiomaAtendente;
    const setIdiomaLado = eVisitante ? setIdiomaVisitante : setIdiomaAtendente;
    const rotuloLado = eVisitante ? t('ladoVisitante') : t('ladoAtendente');
    const grupo = eVisitante ? frasesDoVisitante : frasesDoAtendente;
    const idPainel = `lado-${lado}`;
    const escutandoAqui = ouvindo === lado;

    return (
      <section
        aria-labelledby={idPainel}
        className={`space-y-3 rounded-xl border-2 p-3 ${eVisitante ? 'border-primaria bg-superficie' : 'border-borda bg-fundo'} ${eVisitante ? '' : 'rotate-180'}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={idPainel} className="text-lg font-bold">
            {rotuloLado}
          </h2>
          <label className="ml-auto flex items-center gap-2 text-sm">
            <span>{t('idiomaLado')}</span>
            <select
              className="alvo rounded-lg border-2 border-borda bg-fundo px-2"
              value={idiomaLado}
              onChange={(e) => setIdiomaLado(e.target.value as Idioma)}
            >
              {(Object.keys(ROTULO_IDIOMA) as Idioma[]).map((l) => (
                <option key={l} value={l}>
                  {ROTULO_IDIOMA[l]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`alvo rounded-lg border-2 px-4 ${escutandoAqui ? 'border-perigo bg-perigo text-perigo-texto' : 'border-borda'}`}
            aria-pressed={escutandoAqui}
            onClick={() => alternarEscuta(lado)}
          >
            {escutandoAqui ? `⏹ ${t('parar')}` : `🎙 ${t('falar')}`}
          </button>
          <button type="button" className="alvo rounded-lg border-2 border-borda px-4" onClick={limpar}>
            🧹 {t('limpar')}
          </button>
        </div>

        {/* Legenda ao vivo (RF-14): texto parcial do reconhecimento, sem gravar áudio. */}
        <p role="status" className="min-h-12 rounded-lg border border-dashed border-borda p-2">
          {escutandoAqui
            ? (legenda?.lado === lado ? legenda.texto : t('ouvindo'))
            : t('semLegenda')}
        </p>

        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            enviar(lado);
          }}
        >
          <label className="sr-only" htmlFor={`digitar-${lado}`}>
            {t('digitar')}
          </label>
          <input
            id={`digitar-${lado}`}
            className="alvo min-w-40 flex-1 rounded-lg border-2 border-borda bg-fundo px-3"
            placeholder={t('placeholder')}
            value={digitando[lado]}
            onChange={(e) => setDigitando((d) => ({ ...d, [lado]: e.target.value }))}
          />
          <button type="submit" className="alvo rounded-lg border-2 border-primaria bg-primaria px-4 text-primaria-texto">
            {t('enviar')}
          </button>
        </form>

        {grupo && grupo.frases.length > 0 && (
          <details className="rounded-lg border border-borda p-2">
            <summary className="alvo cursor-pointer rounded px-1 font-bold">{t('frasesProntas')}</summary>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {grupo.frases.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="alvo w-full rounded-lg border-2 border-borda bg-fundo p-2 text-left"
                    onClick={() => void publicar(lado, f[idiomaLado])}
                  >
                    {f[idiomaLado]}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Conversa vista deste lado: minhas palavras em original, as do outro lado traduzidas. */}
        <div aria-label={t('historico')} className="space-y-2">
          {mensagens.length === 0 && <p className="text-sm text-texto-suave">{t('semMensagens')}</p>}
          {mensagens.map((m) => {
            const meu = m.autor === lado;
            const texto = meu ? m.original : (m.traducao ?? m.original);
            return (
              <p
                key={m.id}
                className={`rounded-lg border p-2 ${meu ? 'border-primaria bg-primaria/10' : 'border-borda'}`}
              >
                {meu ? (
                  <strong>{texto}</strong>
                ) : m.traduzindo ? (
                  <span className="text-texto-suave">{t('traduzindo')}</span>
                ) : m.traducao ? (
                  <>
                    {texto}{' '}
                    <span className="text-sm text-texto-suave">
                      ({m.fonte === 'frases-prontas' ? t('fonteFrases') : t('fonteNuvem')})
                    </span>
                  </>
                ) : (
                  <>
                    {texto} <span className="text-sm text-texto-suave">— {t('semTraducao')}</span>
                  </>
                )}
              </p>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metade de cima girada 180°: quem está do outro lado da mesa lê de pé virado. */}
      {painel('atendente')}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="alvo rounded-lg border-2 border-ajuda bg-ajuda px-4 text-ajuda-texto" onClick={chamarInterprete}>
          🤟 {t('interpretar')}
        </button>
        {aviso && (
          <p role="alert" className="flex-1 rounded-lg border border-perigo p-2">
            {aviso}
          </p>
        )}
      </div>

      {painel('visitante')}
    </div>
  );
}
