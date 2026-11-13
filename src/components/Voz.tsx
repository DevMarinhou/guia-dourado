"use client";

import { useEffect, useRef, useState } from "react";

/** Fala o texto via Web Speech API (com botão Ouvir reutilizável). */
export function BotaoOuvir({
  texto,
  rotulo = "Ouvir",
}: {
  texto: string;
  rotulo?: string;
}) {
  const [falando, setFalando] = useState(false);

  function falar() {
    if (!("speechSynthesis" in window)) return;
    if (falando) {
      window.speechSynthesis.cancel();
      setFalando(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR";
    u.rate = 0.95;
    u.onend = () => setFalando(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setFalando(true);
  }

  return (
    <button className="btn" onClick={falar} aria-pressed={falando}>
      {falando ? "⏹ Parar" : `🔊 ${rotulo}`}
    </button>
  );
}

/** Lê o texto automaticamente quando montado (modo voz ligada). */
export function LeituraAutomatica({ texto }: { texto: string }) {
  const feito = useRef(false);
  useEffect(() => {
    if (feito.current) return;
    feito.current = true;
    try {
      const salvo = localStorage.getItem("gd-perfil");
      const voz = salvo ? JSON.parse(salvo).vozLigada : true;
      if (!voz || !("speechSynthesis" in window)) return;
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      u.onend = () => {
        feito.current = false;
      };
      window.speechSynthesis.speak(u);
    } catch {
      /* sem voz */
    }
    return () => window.speechSynthesis?.cancel();
  }, [texto]);
  return null;
}
