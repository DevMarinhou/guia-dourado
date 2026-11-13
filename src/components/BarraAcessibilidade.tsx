"use client";

import { useEffect, useState } from "react";
import { usePreferencias } from "./PreferenciasProvider";

/** Barra de acessibilidade fixa: contraste, tamanho de fonte e voz. */
export function BarraAcessibilidade() {
  const { perfil, setPerfil } = usePreferencias();
  const [fonte, setFonte] = useState(100);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fonte}%`;
  }, [fonte]);

  return (
    <div
      role="toolbar"
      aria-label="Ajustes de acessibilidade"
      className="sticky top-0 z-40 flex flex-wrap items-center gap-2 border-b px-3 py-2"
      style={{ background: "var(--azul-claro)", borderColor: "#c7ccd3" }}
    >
      <button
        className="btn"
        aria-pressed={perfil.altoContraste}
        onClick={() =>
          setPerfil({ ...perfil, altoContraste: !perfil.altoContraste })
        }
      >
        {perfil.altoContraste ? "🔆 Contraste: alto" : "🔆 Contraste"}
      </button>
      <button
        className="btn"
        onClick={() => setFonte((f) => Math.min(f + 10, 160))}
        aria-label="Aumentar letra"
      >
        A+
      </button>
      <button
        className="btn"
        onClick={() => setFonte((f) => Math.max(f - 10, 80))}
        aria-label="Diminuir letra"
      >
        A−
      </button>
      <button
        className="btn"
        aria-pressed={perfil.vozLigada}
        onClick={() => setPerfil({ ...perfil, vozLigada: !perfil.vozLigada })}
      >
        {perfil.vozLigada ? "🔊 Voz ligada" : "🔇 Voz desligada"}
      </button>
    </div>
  );
}
