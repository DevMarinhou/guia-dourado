// Serviço de pedidos de ajuda: usa o Supabase quando as credenciais existem e cai
// para a loja em memória (demonstração) quando não existem. As Route Handlers falam
// só com este módulo — elas não conhecem o banco.
//
// Regras cobertas aqui (não nas rotas):
// - RN-03: 1 pedido aberto por aparelho e 3 envios a cada 10 min;
// - token de acompanhamento: guardado como hash (nunca em texto puro);
// - LGPD: consentimento é obrigatório (validado no esquema zod da rota).

import { equipamentos as equipamentosOffline, pontos } from '@/lib/dados';
import { supabaseConfigurado, supabaseServico } from '@/lib/supabase/servidor';
import {
  alterarEquipamentoDemo,
  cancelarPedidoDemo,
  consultarPedidoDemo,
  criarPedidoDemo,
  hashSegredo,
  listarEquipamentosDemo,
  listarFilaDemo,
  mudarStatusDemo,
  podeEnviar,
} from './loja-demonstracao';
import type { EntradaPedido, FonteDados, Pedido, StatusEquipamento, StatusPedido } from './tipos';

export type ResultadoCriacao =
  | { ok: true; id: string; token: string; fonte: FonteDados }
  | { ok: false; erro: 'limite'; motivo: 'aberto' | 'frequencia' }
  | { ok: false; erro: 'falha' };

const COLUNAS_PEDIDO =
  'id, criado_em, tipo, prioridade, ponto_codigo, piso_id, modo_comunicacao, idioma, observacao, status, atendente_id, previsao_min';

interface LinhaPedido {
  id: string;
  criado_em: string;
  tipo: string;
  prioridade: number;
  ponto_codigo: string;
  piso_id: string;
  modo_comunicacao: string;
  idioma: string;
  observacao: string | null;
  status: StatusPedido;
  atendente_id: string | null;
  previsao_min: number | null;
}

function paraPedido(l: LinhaPedido): Pedido {
  return {
    id: l.id,
    criadoEm: l.criado_em,
    tipo: l.tipo,
    prioridade: l.prioridade,
    pontoCodigo: l.ponto_codigo,
    pisoId: l.piso_id,
    modoComunicacao: l.modo_comunicacao,
    idioma: l.idioma,
    observacao: l.observacao,
    status: l.status,
    // Sem join na equipe (RLS exige auth): mostra que alguém assumiu, sem expor nome.
    atendente: l.atendente_id ? 'Equipe do shopping' : null,
    previsaoMin: l.previsao_min,
  };
}

function pisoDoPonto(codigo: string): string {
  return pontos.find((p) => p.codigo === codigo)?.pisoId ?? 'terreo';
}

/** CREATE (RF-19). Devolve o token de acompanhamento uma única vez. */
export async function criarPedido(entrada: EntradaPedido): Promise<ResultadoCriacao> {
  const aparelhoHash = hashSegredo(entrada.tokenAparelho);

  if (!supabaseConfigurado()) {
    const limite = podeEnviar(aparelhoHash);
    if (!limite.permitido) return { ok: false, erro: 'limite', motivo: limite.motivo ?? 'frequencia' };
    const { id, token } = criarPedidoDemo(entrada, pisoDoPonto(entrada.pontoCodigo));
    return { ok: true, id, token, fonte: 'demonstracao' };
  }

  const sb = supabaseServico();
  if (!sb) return { ok: false, erro: 'falha' };
  try {
    // RN-03 no banco: pedidos abertos do aparelho + envios na janela de 10 min.
    const [abertos, janela] = await Promise.all([
      sb.from('pedidos_ajuda').select('id', { count: 'exact', head: true }).eq('aparelho_hash', aparelhoHash).in('status', ['aberto', 'aceito', 'a_caminho']),
      sb.from('pedidos_ajuda').select('id', { count: 'exact', head: true }).eq('aparelho_hash', aparelhoHash).gte('criado_em', new Date(Date.now() - 10 * 60_000).toISOString()),
    ]);
    if (abertos.error || janela.error) return { ok: false, erro: 'falha' };
    if ((abertos.count ?? 0) >= 1) return { ok: false, erro: 'limite', motivo: 'aberto' };
    if ((janela.count ?? 0) >= 3) return { ok: false, erro: 'limite', motivo: 'frequencia' };

    const token = crypto.randomUUID();
    const { data, error } = await sb
      .from('pedidos_ajuda')
      .insert({
        tipo: entrada.tipo,
        ponto_codigo: entrada.pontoCodigo,
        piso_id: pisoDoPonto(entrada.pontoCodigo),
        modo_comunicacao: entrada.modoComunicacao,
        idioma: entrada.idioma,
        observacao: entrada.observacao ?? null,
        token_hash: hashSegredo(token),
        aparelho_hash: aparelhoHash,
        consentimento_em: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error || !data) return { ok: false, erro: 'falha' };
    return { ok: true, id: String(data.id), token, fonte: 'supabase' };
  } catch {
    return { ok: false, erro: 'falha' };
  }
}

/** READ (RF-21): só quem tem o token vê o pedido. */
export async function consultarPedido(id: string, token: string): Promise<Pedido | null> {
  if (!supabaseConfigurado()) return consultarPedidoDemo(id, token);
  const sb = supabaseServico();
  if (!sb) return null;
  const { data } = await sb.from('pedidos_ajuda').select(COLUNAS_PEDIDO).eq('id', id).eq('token_hash', hashSegredo(token)).maybeSingle();
  return data ? paraPedido(data as LinhaPedido) : null;
}

/** Fila da Central (RF-22): prioridade 1 primeiro (saúde/criança), depois ordem de chegada. */
export async function listarFila(): Promise<{ pedidos: Pedido[]; fonte: FonteDados }> {
  if (!supabaseConfigurado()) return { pedidos: listarFilaDemo(), fonte: 'demonstracao' };
  const sb = supabaseServico();
  if (!sb) return { pedidos: [], fonte: 'demonstracao' };
  const { data } = await sb.from('pedidos_ajuda').select(COLUNAS_PEDIDO).order('prioridade').order('criado_em');
  return { pedidos: ((data as LinhaPedido[] | null) ?? []).map(paraPedido), fonte: 'supabase' };
}

/** Mudança de status pela Central (aceitar, a caminho, concluir, trote). */
export async function mudarStatus(
  id: string,
  status: StatusPedido,
  opcoes: { atendente?: string; previsaoMin?: number } = {},
): Promise<Pedido | null> {
  if (!supabaseConfigurado()) return mudarStatusDemo(id, status, opcoes);
  const sb = supabaseServico();
  if (!sb) return null;
  const { data } = await sb
    .from('pedidos_ajuda')
    .update({
      status,
      previsao_min: status === 'concluido' || status === 'cancelado' || status === 'trote' ? null : (opcoes.previsaoMin ?? null),
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)
    .select(COLUNAS_PEDIDO)
    .maybeSingle();
  return data ? paraPedido(data as LinhaPedido) : null;
}

/** Cancelamento pelo visitante (RF-21): exige o token de acompanhamento. */
export async function cancelarPedido(id: string, token: string): Promise<Pedido | null> {
  if (!supabaseConfigurado()) return cancelarPedidoDemo(id, token);
  const pedido = await consultarPedido(id, token);
  if (!pedido) return null;
  return mudarStatus(id, 'cancelado');
}

/** Status dos equipamentos (RF-23): Supabase quando existe, senão o JSON offline. */
export async function listarEquipamentos(): Promise<{ equipamentos: StatusEquipamento[]; fonte: FonteDados }> {
  const base = equipamentosOffline.map(({ id, tipo, status }) => ({
    id,
    tipo,
    status: status as StatusEquipamento['status'],
    atualizadoEm: null as string | null,
  }));
  if (!supabaseConfigurado()) return { equipamentos: listarEquipamentosDemo(base), fonte: 'demonstracao' };
  const sb = supabaseServico();
  if (!sb) return { equipamentos: base, fonte: 'padrao-offline' };
  const { data } = await sb.from('equipamentos').select('id, tipo, status, atualizado_em');
  if (!data) return { equipamentos: base, fonte: 'padrao-offline' };
  const porId = new Map(data.map((e) => [String(e.id), e]));
  return {
    equipamentos: base.map((e) => {
      const linha = porId.get(e.id);
      return linha ? { ...e, status: linha.status as StatusEquipamento['status'], atualizadoEm: linha.atualizado_em as string } : e;
    }),
    fonte: 'supabase',
  };
}

/** Ação da Central (RF-23): alterna o status que a rota do T05 consulta. */
export async function alterarEquipamento(id: string, status: StatusEquipamento['status']): Promise<StatusEquipamento | null> {
  if (!supabaseConfigurado()) return alterarEquipamentoDemo(id, status);
  const sb = supabaseServico();
  if (!sb) return null;
  const { data } = await sb
    .from('equipamentos')
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq('id', id)
    .select('id, tipo, status, atualizado_em')
    .maybeSingle();
  if (!data) return null;
  return { id: String(data.id), tipo: String(data.tipo), status: data.status as StatusEquipamento['status'], atualizadoEm: String(data.atualizado_em) };
}
