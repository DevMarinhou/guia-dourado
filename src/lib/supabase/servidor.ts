// Cliente Supabase SÓ no servidor, com a chave de serviço (ADR-0008).
// O visitante nunca fala com o banco direto: apenas Route Handlers usam este módulo.
// Sem SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY em .env.local, `supabaseConfigurado()`
// é false e a API cai no modo demonstração (loja-demonstracao.ts) — a interface avisa.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cliente: SupabaseClient | null = null;

export function supabaseConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Cliente com service role (ignora RLS). Null quando as credenciais não existem. */
export function supabaseServico(): SupabaseClient | null {
  if (!supabaseConfigurado()) return null;
  if (!cliente) {
    cliente = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cliente;
}
