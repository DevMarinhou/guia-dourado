// Modo demonstração (sem Supabase): pedidos e status de equipamentos na memória do
// servidor. Vale para dev e para a demo ao vivo com `next start` (processo único).
// Em produção com várias instâncias (Vercel), configure o Supabase — os dados não
// atravessam instâncias. A resposta carrega fonte: 'demonstracao' para a interface
// mostrar o aviso, em vez de fingir que é produção.

import { createHash, randomUUID } from 'node:crypto';
import type { EntradaPedido, Pedido, StatusEquipamento, StatusPedido } from './tipos';

interface Registro extends Pedido {
  tokenHash: string;
  aparelhoHash: string;
}

const pedidos = new Map<string, Registro>();
const envios: { aparelhoHash: string; criadoEm: number }[] = [];
const statusEquipamentos = new Map<string, StatusEquipamento['status']>();

/** RN-03: 1 pedido aberto por aparelho e 3 envios a cada 10 min. */
const JANELA_MS = 10 * 60_000;
const MAX_POR_JANELA = 3;
const ABERTOS: readonly StatusPedido[] = ['aberto', 'aceito', 'a_caminho'];

export const hashSegredo = (valor: string): string => createHash('sha256').update(valor).digest('hex');

/** RN-03 de propósito: devolve o motivo para a interface mostrar a mensagem certa. */
export function podeEnviar(aparelhoHash: string, agora = Date.now()): { permitido: boolean; motivo?: 'aberto' | 'frequencia' } {
  for (const p of pedidos.values()) {
    if (p.aparelhoHash === aparelhoHash && ABERTOS.includes(p.status)) return { permitido: false, motivo: 'aberto' };
  }
  const recentes = envios.filter((e) => e.aparelhoHash === aparelhoHash && agora - e.criadoEm < JANELA_MS).length;
  if (recentes >= MAX_POR_JANELA) return { permitido: false, motivo: 'frequencia' };
  return { permitido: true };
}

export function criarPedidoDemo(entrada: EntradaPedido, pisoId: string): { id: string; token: string } {
  const token = randomUUID();
  const agora = new Date();
  const id = randomUUID();
  pedidos.set(id, {
    id,
    criadoEm: agora.toISOString(),
    tipo: entrada.tipo,
    prioridade: entrada.tipo === 'saude' || entrada.tipo === 'crianca_perdida' ? 1 : 2,
    pontoCodigo: entrada.pontoCodigo,
    pisoId,
    modoComunicacao: entrada.modoComunicacao,
    idioma: entrada.idioma,
    observacao: entrada.observacao ?? null,
    status: 'aberto',
    atendente: null,
    previsaoMin: null,
    tokenHash: hashSegredo(token),
    aparelhoHash: hashSegredo(entrada.tokenAparelho),
  });
  envios.push({ aparelhoHash: hashSegredo(entrada.tokenAparelho), criadoEm: agora.getTime() });
  return { id, token };
}

export function consultarPedidoDemo(id: string, token: string): Pedido | null {
  const p = pedidos.get(id);
  if (!p || p.tokenHash !== hashSegredo(token)) return null;
  return semSegredos(p);
}

export function listarFilaDemo(): Pedido[] {
  return [...pedidos.values()]
    .sort((a, b) => a.prioridade - b.prioridade || a.criadoEm.localeCompare(b.criadoEm))
    .map(semSegredos);
}

export function mudarStatusDemo(
  id: string,
  status: StatusPedido,
  opcoes: { atendente?: string; previsaoMin?: number } = {},
): Pedido | null {
  const p = pedidos.get(id);
  if (!p) return null;
  p.status = status;
  if (opcoes.atendente !== undefined) p.atendente = opcoes.atendente;
  if (opcoes.previsaoMin !== undefined) p.previsaoMin = opcoes.previsaoMin;
  if (status === 'concluido' || status === 'cancelado' || status === 'trote') p.previsaoMin = null;
  return semSegredos(p);
}

/** Cancelamento pelo visitante: só com o token de acompanhamento. */
export function cancelarPedidoDemo(id: string, token: string): Pedido | null {
  const p = pedidos.get(id);
  if (!p || p.tokenHash !== hashSegredo(token)) return null;
  return mudarStatusDemo(id, 'cancelado');
}

export function listarEquipamentosDemo(base: readonly StatusEquipamento[]): StatusEquipamento[] {
  return base.map((e) => {
    const status = statusEquipamentos.get(e.id);
    return status ? { ...e, status, atualizadoEm: new Date().toISOString() } : e;
  });
}

export function alterarEquipamentoDemo(id: string, status: StatusEquipamento['status']): StatusEquipamento | null {
  statusEquipamentos.set(id, status);
  return { id, tipo: '', status, atualizadoEm: new Date().toISOString() };
}

function semSegredos(reg: Registro): Pedido {
  const { tokenHash, aparelhoHash, ...p } = reg;
  void tokenHash;
  void aparelhoHash;
  return p;
}
