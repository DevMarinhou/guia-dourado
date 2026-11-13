// Criar pedido de ajuda (RF-19). Valida a entrada; a gravação no Supabase é o próximo passo do MVP.
import { NextResponse, type NextRequest } from 'next/server';
import { esquemaNovoPedidoAjuda } from '@/dominio/esquemas';

export async function POST(req: NextRequest) {
  const corpo = await req.json().catch(() => null);
  const r = esquemaNovoPedidoAjuda.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: 'dados_invalidos', detalhes: r.error.flatten().fieldErrors }, { status: 400 });
  }
  // TODO(RF-19, RN-03): limite de 1 pedido aberto por aparelho e 3 a cada 10 min (hash do token + IP);
  // inserir em pedidos_ajuda com consentimento_em = now(); devolver { id, token } de acompanhamento.
  return NextResponse.json({ erro: 'central_nao_configurada' }, { status: 503 });
}
