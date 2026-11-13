'use client';

import { useState } from 'react';
import { ativarVLibras } from '@/adaptadores/libras/vlibras';

/**
 * Ativa o VLibras (widget gratuito do governo federal) SOB DEMANDA: o script só é baixado
 * quando a pessoa pede Libras (desempenho e privacidade). ADR-0006.
 */
export function BotaoLibras({ rotulo }: { rotulo: string }) {
  const [estado, setEstado] = useState<'inativo' | 'carregando' | 'ativo' | 'erro'>('inativo');

  async function ativar() {
    if (estado === 'ativo' || estado === 'carregando') return;
    setEstado('carregando');
    setEstado((await ativarVLibras()) ? 'ativo' : 'erro');
  }

  return (
    <>
      <button
        type="button"
        onClick={ativar}
        aria-pressed={estado === 'ativo'}
        aria-busy={estado === 'carregando'}
        className="alvo rounded border border-borda px-3 text-sm aria-pressed:bg-primaria aria-pressed:text-primaria-texto"
      >
        <span aria-hidden="true">🤟 </span>
        {rotulo}
      </button>
      {estado === 'erro' && (
        <p role="status" className="w-full text-sm">
          VLibras indisponível no momento.
        </p>
      )}
    </>
  );
}
