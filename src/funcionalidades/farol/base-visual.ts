'use client';
// Onde a base visual fica guardada: neste aparelho (treino local) ou no app.
import type { BaseVisual } from '@/dominio/farol/reconhecer';

export const CHAVE_BASE = 'gd-farol-base';
export const URL_BASE_PADRAO = '/farol/base-corredor.json';

export async function obterBase(): Promise<{ base: BaseVisual; origem: string } | null> {
  try {
    const local = localStorage.getItem(CHAVE_BASE);
    if (local) return { base: JSON.parse(local) as BaseVisual, origem: 'treinada neste aparelho' };
  } catch {
    /* sem localStorage */
  }
  try {
    const r = await fetch(URL_BASE_PADRAO, { cache: 'no-store' });
    if (!r.ok) return null;
    const base = (await r.json()) as BaseVisual;
    if (!base.itens?.length) return null;
    return { base, origem: 'publicada no app' };
  } catch {
    return null;
  }
}

export function salvarBaseLocal(base: BaseVisual): boolean {
  try {
    localStorage.setItem(CHAVE_BASE, JSON.stringify(base));
    return true;
  } catch {
    return false;
  }
}

export function apagarBaseLocal() {
  try {
    localStorage.removeItem(CHAVE_BASE);
  } catch {
    /* nada */
  }
}
