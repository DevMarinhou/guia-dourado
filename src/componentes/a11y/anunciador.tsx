'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type Prioridade = 'polite' | 'assertive';
type Anunciar = (mensagem: string, prioridade?: Prioridade) => void;

const ContextoAnunciador = createContext<Anunciar>(() => {});

/**
 * Região aria-live ÚNICA do app (WCAG 4.1.3). Use para rota, pedido de ajuda e erros.
 * Evita anúncios duplicados de vários componentes ao mesmo tempo.
 */
export function AnunciadorProvider({ children }: { children: React.ReactNode }) {
  const [educado, setEducado] = useState('');
  const [assertivo, setAssertivo] = useState('');

  const anunciar = useCallback<Anunciar>((mensagem, prioridade = 'polite') => {
    const definir = prioridade === 'assertive' ? setAssertivo : setEducado;
    definir('');
    // Pequeno atraso para o leitor de tela perceber a troca mesmo com texto repetido.
    window.setTimeout(() => definir(mensagem), 50);
  }, []);

  return (
    <ContextoAnunciador.Provider value={anunciar}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {educado}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertivo}
      </div>
    </ContextoAnunciador.Provider>
  );
}

export const useAnunciador = (): Anunciar => useContext(ContextoAnunciador);
