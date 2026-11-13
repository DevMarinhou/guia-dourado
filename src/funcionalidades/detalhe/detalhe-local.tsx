'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { BotaoLibras } from '@/componentes/a11y/botao-libras';
import { BotaoOuvir } from '@/componentes/a11y/botao-ouvir';
import { falar, vozDisponivel } from '@/adaptadores/voz/web-speech';

/**
 * T04 — Detalhe do local (RF-10) com compreensão (RF-05, RF-06):
 * Ouvir, Libras (VLibras sob demanda) e alternar linguagem simples.
 *
 * ═══ EASTER EGG — MISSÃO SEXTA-FEIRA 13: "Prato Secreto: Poção Anti-Azar" ═══
 * Ativação: 13 toques no ícone de favoritar (♡) no cabeçalho.
 * Efeito: insere temporariamente o item "Combo Sexta-feira 13 Sem Sustos — R$ 13,00"
 * na seção "Cardápio (ilustrativo, fornecido pela loja)", compatível com os botões
 * Ouvir, Libras e Linguagem simples da mesma tela.
 * NÃO renomear, nem simplificar, nem "limpar" esta lógica — é requisito da missão
 * e precisa continuar demonstrável ao vivo (ver AGENTS.md).
 */
const TOTAL_TOQUES = 13;

export interface DadosT04 {
  slug: string;
  locale: string;
  nome: string;
  numero: string;
  pisoNome: string;
  categoria: string;
  areaM2?: number;
  descricao?: string;
  simples?: string;
  ruido?: 'baixo' | 'medio' | 'alto';
  acessibilidade?: Record<string, boolean | null>;
}

/** Textos vindos do servidor (next-intl) — mantém o cliente sem dependência de mensagens. */
export interface TextosT04 {
  comoChegar: string;
  naoInformado: string;
  area: string;
  cardapio: string;
  favoritar: string;
  /** Frases já formatadas para 3, 2 e 1 toques restantes (ordem: [3, 2, 1]). */
  dicasToques: [string, string, string];
  ovosTitulo: string;
  itemSecreto: string;
  precoSecreto: string;
  itemSecretoSimples: string;
  linguagemSimples: string;
  recursos: string;
  recursoSanitarioPne: string;
  ruido: string;
  rotulosRuido: { baixo: string; medio: string; alto: string };
  sim: string;
  nao: string;
  ouvir: string;
  libras: string;
}

export function DetalheLocal({ local, textos }: { local: DadosT04; textos: TextosT04 }) {
  const anunciar = useAnunciador();
  const [toques, setToques] = useState(0);
  const [eggAtivado, setEggAtivado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [linguagemSimples, setLinguagemSimples] = useState(false);

  const descricaoVisivel = linguagemSimples
    ? (local.simples ?? local.descricao)
    : (local.descricao ?? local.simples);
  const itemSecreto = linguagemSimples ? textos.itemSecretoSimples : textos.itemSecreto;
  // Loja de alimentação sempre mostra a seção; as demais revelam-na com o Easter Egg.
  const mostrarCardapio = local.categoria === 'alimentacao' || eggAtivado;
  const recursos = Object.entries(local.acessibilidade ?? {});

  function falarTexto(texto: string) {
    if (!vozDisponivel()) {
      anunciar('Leitura em voz indisponível neste navegador.');
      return;
    }
    falar(texto, document.documentElement.lang || 'pt-BR');
  }

  /** Gatilho do Easter Egg: 13 toques no ♡ do cabeçalho. */
  function tocarFavorito() {
    if (eggAtivado) return;
    const n = toques + 1;
    setToques(n);
    if (n === TOTAL_TOQUES) {
      setEggAtivado(true);
      setAviso(textos.ovosTitulo);
      anunciar(textos.ovosTitulo, 'assertive');
      falarTexto(textos.ovosTitulo);
    } else if (n >= TOTAL_TOQUES - 3) {
      const dica = textos.dicasToques[n - (TOTAL_TOQUES - 3)] ?? '';
      if (dica) {
        setAviso(dica);
        anunciar(dica);
      }
    }
  }

  function rotuloRecurso(chave: string): string {
    return chave === 'sanitarioPNE' ? textos.recursoSanitarioPne : chave;
  }

  return (
    <article aria-labelledby="titulo-local" className="space-y-4">
      {/* Cabeçalho — o favorito (♡) é o gatilho do Easter Egg */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 id="titulo-local" className="text-2xl font-bold">
            {local.nome}
          </h1>
          <p className="text-lg">
            {local.numero} · {local.pisoNome}
          </p>
        </div>
        <button
          type="button"
          onClick={tocarFavorito}
          aria-pressed={toques > 0}
          aria-label={`${textos.favoritar} (${toques} de ${TOTAL_TOQUES})`}
          className="alvo shrink-0 rounded-full border-2 border-borda px-4 text-2xl leading-none aria-pressed:border-perigo"
        >
          <span aria-hidden="true">{toques > 0 ? '❤️' : '♡'}</span>
        </button>
      </div>

      {/* Botões de compreensão da mesma tela (compatíveis com o item secreto) */}
      <div className="flex flex-wrap gap-2">
        <BotaoOuvir rotulo={textos.ouvir} />
        <BotaoLibras rotulo={textos.libras} />
        <button
          type="button"
          onClick={() => setLinguagemSimples((v) => !v)}
          aria-pressed={linguagemSimples}
          className="alvo rounded border border-borda px-3 text-sm aria-pressed:bg-primaria aria-pressed:text-primaria-texto"
        >
          <span aria-hidden="true">🧩</span> {textos.linguagemSimples}
        </button>
      </div>

      {descricaoVisivel && <p className="rounded-lg bg-superficie p-3">{descricaoVisivel}</p>}

      {local.areaM2 != null && (
        <p className="text-sm text-texto-suave">
          {textos.area}: {local.areaM2.toLocaleString(local.locale)} m²
        </p>
      )}

      {/* Recursos de acessibilidade informados (null = "não informado") */}
      {(local.ruido || recursos.length > 0) && (
        <section aria-labelledby="recursos-titulo" className="rounded-xl border-2 border-borda p-4">
          <h2 id="recursos-titulo" className="font-bold">
            {textos.recursos}
          </h2>
          <ul className="mt-2 space-y-1">
            {local.ruido && (
              <li>
                <span aria-hidden="true">🔊</span> {textos.ruido}: {textos.rotulosRuido[local.ruido]}
              </li>
            )}
            {recursos.map(([chave, valor]) => (
              <li key={chave}>
                {rotuloRecurso(chave)}:{' '}
                {valor === null ? textos.naoInformado : valor ? textos.sim : textos.nao}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cardápio ilustrativo — guarda o Easter Egg ("Prato Secreto") */}
      {mostrarCardapio && (
        <section aria-labelledby="cardapio-titulo" className="rounded-xl border-2 border-borda p-4">
          <h2 id="cardapio-titulo" className="font-bold">
            {textos.cardapio}
          </h2>
          {eggAtivado ? (
            <ul className="mt-2">
              <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-dashed border-perigo p-3">
                <div className="min-w-[12rem] flex-1">
                  <strong>
                    <span aria-hidden="true">🥚</span> {itemSecreto}{' '}
                    <span aria-hidden="true">🥚</span>
                  </strong>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => falarTexto(`${itemSecreto}. ${textos.precoSecreto}`)}
                      className="alvo rounded border border-borda px-3 text-sm"
                    >
                      <span aria-hidden="true">🔊</span> {textos.ouvir}
                    </button>
                  </div>
                </div>
                <span className="font-bold">{textos.precoSecreto}</span>
              </li>
            </ul>
          ) : (
            <p className="mt-2">{textos.naoInformado}</p>
          )}
        </section>
      )}

      <Link
        href={{ pathname: '/rota', query: { para: local.slug } }}
        className="alvo flex items-center justify-center rounded-lg bg-primaria p-3 font-bold text-primaria-texto"
      >
        <span aria-hidden="true">🧭</span> {textos.comoChegar}
      </Link>

      {/* Avisos do Easter Egg (o anúncio para leitores de tela é feito pelo Anunciador) */}
      <p className={aviso ? 'rounded-lg bg-superficie p-3 font-bold' : undefined}>{aviso}</p>
    </article>
  );
}
