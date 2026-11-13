'use client';

import { useState } from 'react';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar, pararFala, vozDisponivel } from '@/adaptadores/voz/web-speech';

/** Lê em voz alta o conteúdo principal da tela (RF-05). Não substitui o leitor de tela do sistema. */
export function BotaoOuvir({ rotulo }: { rotulo: string }) {
  const [falando, setFalando] = useState(false);
  const anunciar = useAnunciador();

  function alternar() {
    if (!vozDisponivel()) {
      anunciar('Leitura em voz indisponível neste navegador.');
      return;
    }
    if (falando) {
      pararFala();
      setFalando(false);
      return;
    }
    const texto = document.getElementById('conteudo')?.innerText ?? '';
    setFalando(true);
    falar(texto, document.documentElement.lang || 'pt-BR', () => setFalando(false));
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={falando}
      className="alvo rounded border border-borda px-3 text-sm aria-pressed:bg-primaria aria-pressed:text-primaria-texto"
    >
      <span aria-hidden="true">🔊 </span>
      {rotulo}
    </button>
  );
}
