'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar, vozDisponivel } from '@/adaptadores/voz/web-speech';
import type { Idioma } from '@/dominio/tipos';

/** Ação do item (dados/prancha.json): 'rota' leva à T05 e 'ajuda' à T08. */
type Acao = { tipo: string; categoria?: string };

interface ItemPrancha {
  id: string;
  emoji: string;
  rotulo: Record<Idioma, string>;
  frase: Record<Idioma, string>;
  acao?: Acao;
}

interface CategoriaPrancha {
  id: string;
  nome: Record<Idioma, string>;
  itens: ItemPrancha[];
}

interface Props {
  categorias: readonly CategoriaPrancha[];
  idioma: Idioma;
}

const MAX_ITENS = 3;

/**
 * T07 — Prancha de comunicação (RF-18): tocar num pictograma fala a frase e abre
 * em tela cheia; no modo "Montar frase" os toques juntam 2 a 3 pictogramas que
 * podem ser falados de uma vez. Ações dos itens levam à T05 (rota) e à T08 (ajuda).
 */
export function TelaPrancha({ categorias, idioma }: Props) {
  const t = useTranslations('prancha');
  const anunciar = useAnunciador();
  const router = useRouter();

  const [montando, setMontando] = useState(false);
  const [frase, setFrase] = useState<ItemPrancha[]>([]);
  const [telaCheia, setTelaCheia] = useState<ItemPrancha | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const anteriorRef = useRef<HTMLElement | null>(null);

  // Tela cheia: foca o botão Fechar ao abrir e devolve o foco ao item ao fechar.
  // A origem vem do toque (e.currentTarget) — nem todo clique programático foca o botão.
  useEffect(() => {
    if (!telaCheia) return;
    fecharRef.current?.focus();
    return () => anteriorRef.current?.focus();
  }, [telaCheia]);

  // Esc fecha a tela cheia (atalho de teclado, além do botão).
  useEffect(() => {
    if (!telaCheia) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') setTelaCheia(null);
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [telaCheia]);

  function ouvir(texto: string): void {
    if (vozDisponivel()) falar(texto, idioma);
    else anunciar(texto);
  }

  function tocar(item: ItemPrancha, origem: HTMLElement): void {
    const texto = item.frase[idioma];
    if (montando) {
      if (frase.length >= MAX_ITENS) {
        anunciar(t('maxItens'), 'assertive');
        return;
      }
      const nova = [...frase, item];
      setFrase(nova);
      anunciar(t('itemAdicionado', { nome: item.rotulo[idioma] }));
      ouvir(texto);
      return;
    }
    anteriorRef.current = origem;
    setTelaCheia(item);
    ouvir(texto);
  }

  function executarAcao(item: ItemPrancha): void {
    setTelaCheia(null);
    if (item.acao?.tipo === 'rota') router.push('/rota');
    else if (item.acao?.tipo === 'ajuda') router.push('/ajuda');
  }

  function falarFraseMontada(): void {
    if (frase.length === 0) {
      anunciar(t('semItens'), 'assertive');
      return;
    }
    ouvir(frase.map((i) => i.frase[idioma]).join(' '));
  }

  return (
    <div className="space-y-4">
      {/* --------------------------------------------------------- montar frase */}
      <section aria-labelledby="montar-frase" className="rounded-xl border-2 border-primaria p-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="montar-frase" className="text-lg font-bold">
            {t('fraseMontada')}
          </h2>
          <button
            type="button"
            className="alvo ml-auto rounded-lg border-2 border-borda px-4 aria-pressed:bg-primaria aria-pressed:text-primaria-texto"
            aria-pressed={montando}
            onClick={() => {
              setMontando((m) => !m);
              if (montando) setFrase([]);
            }}
          >
            🧩 {t('montar')}
          </button>
        </div>

        {montando && frase.length === 0 && <p className="mt-2 text-sm text-texto-suave">{t('semItens')}</p>}

        {frase.length > 0 && (
          <>
            <ul className="mt-2 flex flex-wrap gap-2">
              {frase.map((item, i) => (
                <li key={`${item.id}-${i}`} className="rounded-lg border-2 border-primaria bg-primaria/10 px-3 py-2">
                  <span aria-hidden="true">{item.emoji}</span> {item.rotulo[idioma]}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="alvo rounded-lg border-2 border-primaria bg-primaria px-4 text-primaria-texto" onClick={falarFraseMontada}>
                🔊 {t('falarFrase')}
              </button>
              <button
                type="button"
                className="alvo rounded-lg border-2 border-borda px-4"
                onClick={() => {
                  setFrase([]);
                  anunciar(t('limpar'));
                }}
              >
                🧹 {t('limpar')}
              </button>
            </div>
          </>
        )}
      </section>

      {/* --------------------------------------------------------------- categorias */}
      {categorias.map((cat) => (
        <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
          <h2 id={`cat-${cat.id}`} className="mb-2 text-xl font-bold">
            {cat.nome[idioma]}
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {cat.itens.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="alvo flex min-h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-borda p-2 text-center"
                  onClick={(e) => tocar(item, e.currentTarget)}
                  aria-label={montando ? t('adicionar', { nome: item.rotulo[idioma] }) : t('ouvirItem', { frase: item.frase[idioma] })}
                >
                  <span aria-hidden="true" className="text-3xl">
                    {item.emoji}
                  </span>
                  <span className="text-sm font-bold">{item.rotulo[idioma]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* --------------------------------------------------------------- tela cheia */}
      {telaCheia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('telaCheia')}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-superficie p-6 text-center"
        >
          <p className="text-7xl" aria-hidden="true">
            {telaCheia.emoji}
          </p>
          <p className="text-3xl font-bold">{telaCheia.frase[idioma]}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="alvo rounded-lg border-2 border-primaria bg-primaria px-6 text-primaria-texto"
              onClick={() => ouvir(telaCheia.frase[idioma])}
            >
              🔊 {t('falar')}
            </button>
            {telaCheia.acao && (
              <button
                type="button"
                className="alvo rounded-lg border-2 border-ajuda bg-ajuda px-6 text-ajuda-texto"
                onClick={() => executarAcao(telaCheia)}
              >
                {telaCheia.acao.tipo === 'rota' ? `🧭 ${t('irParaRota')}` : `🙋 ${t('irParaAjuda')}`}
              </button>
            )}
            <button
              ref={fecharRef}
              type="button"
              className="alvo rounded-lg border-2 border-borda px-6"
              onClick={() => setTelaCheia(null)}
            >
              ✖ {t('fechar')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
