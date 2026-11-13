import { esquemaCodigoPonto } from './esquemas';
import type { Ponto } from './tipos';

/**
 * Resolve o código de uma placa QR/NFC (ex.: "mesa-07" → ponto MESA-07).
 * Retorna undefined para código inválido, inexistente ou desativado (RN-07).
 */
export function resolverPonto(codigo: string, pontos: readonly Ponto[]): Ponto | undefined {
  const r = esquemaCodigoPonto.safeParse(codigo);
  if (!r.success) return undefined;
  const ponto = pontos.find((p) => p.codigo === r.data);
  return ponto?.ativo && ponto.noId ? ponto : undefined;
}
