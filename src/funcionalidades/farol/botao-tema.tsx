'use client';
// Claro ⇄ escuro direto no guia. Usa a MESMA preferência do app (T01, gd:preferencias:v1),
// então a escolha vale para todas as telas e é reaplicada antes da 1ª pintura.
import { useSyncExternalStore } from 'react';
import { CHAVE_PREFERENCIAS, type Preferencias } from '@/funcionalidades/preferencias/script-preferencias';

function assinar(aoMudar: () => void) {
  const obs = new MutationObserver(aoMudar);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  return () => obs.disconnect();
}
const temaAtual = () => document.documentElement.dataset.tema ?? 'padrao';
const temaServidor = () => 'padrao';

export function BotaoTema({ escurecer, clarear }: { escurecer: string; clarear: string }) {
  const tema = useSyncExternalStore(assinar, temaAtual, temaServidor);
  const escuro = tema !== 'padrao';

  function alternar() {
    const novo: Preferencias['tema'] = escuro ? 'padrao' : 'escuro';
    if (novo === 'escuro') document.documentElement.dataset.tema = 'escuro';
    else delete document.documentElement.dataset.tema;
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? '{}') as Preferencias;
      localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify({ ...salvo, tema: novo }));
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className="alvo inline-flex items-center gap-2 rounded-full border border-borda bg-superficie px-4 font-bold"
    >
      <span aria-hidden="true">{escuro ? '☀️' : '🌙'}</span>
      {escuro ? clarear : escurecer}
    </button>
  );
}
