"use client";

import { useState } from "react";

export default function Conversar() {
  const [texto, setTexto] = useState("");
  const [traducao, setTraducao] = useState("");
  const [idioma, setIdioma] = useState<"en" | "es">("en");

  function falar() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Reconhecimento de voz não disponível neste navegador.");
      return;
    }
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const r = new SR();
    r.lang = idioma === "en" ? "en-US" : "es-ES";
    r.onresult = (e: any) => setTexto(e.results[0][0].transcript);
    r.start();
  }

  function traduzir() {
    // Tradução ilustrativa (integração com API real na fase de produção)
    const mapa: Record<string, string> = {
      en: "Where is the C&A store?",
      es: "¿Dónde está la tienda C&A?",
    };
    setTraducao(texto ? `[${idioma}] ${texto}` : mapa[idioma]);
  }

  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
      <a href="/" className="btn btn-fantasma mb-4">
        ← Início
      </a>
      <h1 className="mb-4 text-2xl font-extrabold">🗣️ Conversar</h1>

      <div className="card mb-4">
        <label htmlFor="fala" className="mb-1 block font-bold">
          Idioma de quem fala
        </label>
        <select
          id="fala"
          value={idioma}
          onChange={(e) => setIdioma(e.target.value as "en" | "es")}
          className="w-full rounded-lg border-2 p-3"
          style={{ borderColor: "var(--azul)", minHeight: 48 }}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn" onClick={falar}>
            🎤 Segurar para falar
          </button>
          <button className="btn" onClick={traduzir}>
            ↔ Traduzir
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <strong>Original:</strong>
            <p aria-live="polite">{texto || "—"}</p>
          </div>
          <div>
            <strong>Português:</strong>
            <p aria-live="polite">{traducao || "—"}</p>
          </div>
          <div>
            <strong>🤟 Libras:</strong>
            <p>Vídeo do tradutor (integração VLibras)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
