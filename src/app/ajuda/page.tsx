"use client";

import { useState } from "react";

const TIPOS = [
  "Preciso de apoio (Libras / idioma)",
  "Ajuda médica",
  "Elevador / escada avariados",
  "Outro motivo",
];

export default function Ajuda() {
  const [enviado, setEnviado] = useState(false);
  const [tipo, setTipo] = useState(TIPOS[0]);

  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
      <a href="/" className="btn btn-fantasma mb-4">
        ← Início
      </a>
      <h1 className="mb-4 text-2xl font-extrabold">🆘 Pedir ajuda</h1>

      {!enviado ? (
        <div className="card">
          <p className="mb-3">
            <strong>Localização detectada:</strong> 1º Pavimento — Térreo
            (via QR).
          </p>

          <fieldset className="mb-4">
            <legend className="mb-2 font-bold">Tipo de ajuda</legend>
            {TIPOS.map((t) => (
              <label key={t} className="mb-2 flex items-center gap-2">
                <input
                  type="radio"
                  name="tipo"
                  value={t}
                  checked={tipo === t}
                  onChange={() => setTipo(t)}
                  style={{ width: 22, height: 22 }}
                />
                {t}
              </label>
            ))}
          </fieldset>

          <button
            className="btn btn-primario w-full"
            style={{
              background: "var(--vermelho)",
              borderColor: "var(--vermelho)",
              fontSize: "1.15rem",
              minHeight: 60,
            }}
            onClick={() => setEnviado(true)}
          >
            🆘 ENVIAR PEDIDO AGORA
          </button>
          <p className="mt-3 text-sm opacity-70">
            Resposta estimada: 2 min · A equipe recebe piso, ponto QR e o teu
            perfil de acessibilidade.
          </p>
        </div>
      ) : (
        <div
          className="card text-center"
          role="status"
          aria-live="assertive"
          style={{ borderColor: "var(--verde)" }}
        >
          <p style={{ fontSize: "2.5rem" }} aria-hidden="true">
            ✅
          </p>
          <h2 className="text-xl font-bold">Pedido enviado!</h2>
          <p>
            Tipo: <strong>{tipo}</strong>
          </p>
          <p>Fila: 1 pessoa · resposta estimada 2 min</p>
          <button className="btn mt-4" onClick={() => setEnviado(false)}>
            Cancelar pedido
          </button>
        </div>
      )}
    </main>
  );
}
