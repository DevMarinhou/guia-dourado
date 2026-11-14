// Tipos compartilhados pela API de pedidos de ajuda (RF-19 a RF-23).
// O domínio continua puro: estes tipos descrevem o contrato das rotas, não regras.

export type StatusPedido = 'aberto' | 'aceito' | 'a_caminho' | 'concluido' | 'cancelado' | 'trote';

/** De onde vêm os dados: Supabase real, modo demonstração (memória) ou JSON offline. */
export type FonteDados = 'supabase' | 'demonstracao' | 'padrao-offline';

export interface Pedido {
  id: string;
  criadoEm: string;
  tipo: string;
  /** RN-10: saúde e criança perdida primeiro (mesma regra da coluna gerada). */
  prioridade: number;
  pontoCodigo: string;
  pisoId: string;
  modoComunicacao: string;
  idioma: string;
  observacao: string | null;
  status: StatusPedido;
  atendente: string | null;
  previsaoMin: number | null;
}

export interface EntradaPedido {
  tipo: string;
  pontoCodigo: string;
  modoComunicacao: string;
  idioma: string;
  observacao?: string;
  /** UUID do aparelho, guardado no dispositivo; vira aparelho_hash no servidor. */
  tokenAparelho: string;
}

export interface StatusEquipamento {
  id: string;
  tipo: string;
  status: 'operando' | 'manutencao' | 'fora';
  atualizadoEm: string | null;
}

/** Status que encerram o acompanhamento (T09 para de consultar). */
export const STATUS_FINAIS: readonly StatusPedido[] = ['concluido', 'cancelado', 'trote'];
