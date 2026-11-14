'use client';
// Velocidade da fala do guia e da pergunta de entrada. 1 (padrão do navegador) soa lento demais
// para avisos de caminhada; usamos 1,3. Se a pessoa escolheu uma velocidade nas Preferências
// (velocidadeVoz, T01), ela vale.
import { CHAVE_PREFERENCIAS, type Preferencias } from '@/funcionalidades/preferencias/script-preferencias';

export const VELOCIDADE_PADRAO = 1.3;

export function velocidadeDaVoz(): number {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? '{}') as Preferencias;
    if (typeof p.velocidadeVoz === 'number' && p.velocidadeVoz >= 0.5 && p.velocidadeVoz <= 2) return p.velocidadeVoz;
  } catch {
    // sem armazenamento: usa o padrão
  }
  return VELOCIDADE_PADRAO;
}
