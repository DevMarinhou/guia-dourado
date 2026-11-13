// Porta de tempo real da Central (ADR-0008). Implementação prevista: Supabase Realtime
// (postgres_changes na tabela pedidos_ajuda), com plano B de polling a cada 3 s.
export interface EventoPedido {
  id: string;
  status: 'aberto' | 'aceito' | 'a_caminho' | 'concluido' | 'cancelado' | 'trote';
  tipo: string;
  pontoCodigo: string;
  modoComunicacao: string;
  idioma: string;
  criadoEm: string;
}

export interface CanalCentral {
  assinar(aoMudar: (evento: EventoPedido) => void): () => void; // retorna a função de cancelamento
}
