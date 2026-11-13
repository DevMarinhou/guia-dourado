"use client";

import { useRef, useState } from "react";
import type { Local } from "@/data/locais";
import { BotaoOuvir } from "./Voz";
import { usePreferencias } from "./PreferenciasProvider";

/**
 * MISSÃO EASTER EGG — SEXTA-FEIRA 13
 * "Prato Secreto: Poção Anti-Azar"
 * Ativação: 13 toques no ícone de favoritar (♡) no cabeçalho do T04.
 * Efeito: insere temporariamente "Combo Sexta-feira 13 Sem Sustos — R$ 13,00"
 * no cardápio ilustrativo, compatível com Ouvir / Libras / Linguagem simples.
 */
const COMBO_SECRETO = {
  item: "Combo Sexta-feira 13 Sem Sustos — R$ 13,00",
  preco: "R$ 13,00",
  simples:
    "Combo especial: hambúrguer, batata e bebida por treze reais. Sem sustos!",
};

export function DetalheLocal({ local }: { local: Local }) {
  const { perfil, setPerfil } = usePreferencias();
  const [favoritos, setFavoritos] = useState(0);
  const [eggAtivado, setEggAtivado] = useState(false);
  const [mostrarLibras, setMostrarLibras] = useState(false);
  const [toast, setToast] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function tocarFavorito() {
    const n = favoritos + 1;
    setFavoritos(n);

    // Easter Egg: 13 toques
    if (n === 13 && !eggAtivado) {
      setEggAtivado(true);
      setToast("🥚 Prato secreto revelado: Poção Anti-Azar!");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(""), 5000);
      if (perfil.vozLigada && "speechSynthesis" in window) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(
            "Prato secreto revelado: Combo Sexta-feira treze, sem sustos!"
          )
        );
      }
    } else if (n < 13 && !eggAtivado) {
      const faltam = 13 - n;
      setToast(faltam <= 3 ? `✨ ${faltam} toque${faltam > 1 ? "s" : ""}...` : "");
      if (timerRef.current) clearTimeout(timerRef.current);
      if (faltam <= 3) {
        timerRef.current = setTimeout(() => setToast(""), 1200);
      }
    }
  }

  const cardapio = eggAtivado
    ? [...(local.cardapio ?? []), COMBO_SECRETO]
    : (local.cardapio ?? []);

  const descricaoVisivel = perfil.cognitivo
    ? local.descricaoSimples
    : local.descricao;

  return (
    <article>
      {/* ——— Cabeçalho com botão favorito (gatilho do Easter Egg) ——— */}
      <header className="card mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--laranja)" }}>
              {local.categoria} · {local.piso}
            </p>
            <h1 className="text-2xl font-extrabold">{local.nome}</h1>
            <p className="mt-1 opacity-80">🕐 {local.horario}</p>
          </div>

          <button
            onClick={tocarFavorito}
            aria-label={
              eggAtivado
                ? "Favorito — prato secreto revelado"
                : `Favoritar (toque ${favoritos} de 13)`
            }
            aria-pressed={favoritos > 0}
            className="shrink-0 rounded-full border-2 p-3 text-2xl leading-none transition active:scale-90"
            style={{
              borderColor: eggAtivado ? "var(--vermelho)" : "var(--azul)",
              background: eggAtivado ? "#ffe0de" : "#fff",
              minWidth: 48,
              minHeight: 48,
            }}
          >
            {favoritos > 0 ? "❤️" : "♡"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <BotaoOuvir texto={`${local.nome}. ${descricaoVisivel}`} />
          <button
            className="btn"
            onClick={() => setPerfil({ ...perfil, libras: !perfil.libras })}
            aria-pressed={perfil.libras}
          >
            🤟 Libras {perfil.libras ? "ligado" : ""}
          </button>
          <button
            className="btn"
            aria-pressed={perfil.cognitivo}
            onClick={() =>
              setPerfil({ ...perfil, cognitivo: !perfil.cognitivo })
            }
          >
            🧩 Linguagem simples
          </button>
        </div>

        {/* Vídeo/avatar Libras simulado (integração VLibras na fase de produção) */}
        {perfil.libras && (
          <div
            className="mt-3 rounded-lg p-3 text-center"
            style={{ background: "var(--azul-claro)" }}
            role="status"
          >
            🤟 <strong>Libras:</strong> tradução em vídeo de “{local.nome}”
          </div>
        )}
      </header>

      {/* ——— Descrição ——— */}
      <section aria-labelledby="sobre" className="card mb-4">
        <h2 id="sobre" className="mb-2 text-lg font-bold">
          Sobre o local
        </h2>
        <p>{descricaoVisivel}</p>
        {local.areaM2 && (
          <p className="mt-2 text-sm opacity-70">Área: {local.areaM2} m²</p>
        )}
      </section>

      {/* ——— Cardápio ilustrativo (+ Easter Egg) ——— */}
      {local.cardapio && (
        <section aria-labelledby="cardapio" className="card mb-4">
          <h2 id="cardapio" className="mb-2 text-lg font-bold">
            Cardápio (ilustrativo, fornecido pela loja)
          </h2>
          <ul className="divide-y" role="list">
            {cardapio.map((c) => {
              const secreto = c.item === COMBO_SECRETO.item;
              return (
                <li
                  key={c.item}
                  className="flex flex-wrap items-center justify-between gap-2 py-3"
                  style={
                    secreto
                      ? {
                          background: "#fff0f0",
                          color: "#1c2430",
                          border: "2px dashed var(--vermelho)",
                          borderRadius: 10,
                          padding: "0.7rem",
                          margin: "0.4rem 0",
                        }
                      : undefined
                  }
                >
                  <div className="flex-1 min-w-[180px]">
                    <strong>
                      {secreto && "🥚 "}
                      {perfil.cognitivo ? c.simples : c.item}
                      {secreto && " 🥚"}
                    </strong>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <BotaoOuvir
                        texto={`${c.item}: ${c.simples}. ${c.preco}`}
                        rotulo="Ouvir"
                      />
                      <button
                        className="btn"
                        onClick={() => setMostrarLibras(!mostrarLibras)}
                      >
                        🤟 Libras
                      </button>
                      {perfil.cognitivo && (
                        <span
                          className="self-center text-sm opacity-70"
                          aria-label="Texto em linguagem simples ativa"
                        >
                          🧩 em simples
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-lg font-extrabold"
                    style={{ color: secreto ? "var(--vermelho)" : "var(--azul)" }}
                  >
                    {c.preco}
                  </span>
                </li>
              );
            })}
          </ul>

          {mostrarLibras && (
            <div
              className="mt-3 rounded-lg p-3 text-center"
              style={{ background: "var(--azul-claro)" }}
              role="status"
            >
              🤟 Vídeo em Libras do item selecionado (integração VLibras)
            </div>
          )}
        </section>
      )}

      {/* ——— Ações ——— */}
      <div className="flex flex-wrap gap-3">
        <a className="btn btn-primario" href={`/rota?para=${local.slug}`}>
          🧭 Levar-me até aqui
        </a>
        <a className="btn" href="/ajuda">
          🆘 Pedir ajuda
        </a>
      </div>

      {/* ——— Toast do Easter Egg ——— */}
      <div aria-live="polite" className="mt-4">
        {toast && (
          <p
            className="rounded-lg px-4 py-3 font-bold"
            style={{
              background: eggAtivado ? "var(--vermelho)" : "var(--azul-claro)",
              color: eggAtivado ? "#fff" : "var(--texto)",
            }}
          >
            {toast}
          </p>
        )}
      </div>
    </article>
  );
}
