// Criar pedido de ajuda (RF-19). Valida com zod, aplica RN-03 no serviço e grava
// no Supabase (ou no modo demonstração, quando não há credenciais). Devolve o token
// de acompanhamento uma única vez — ele não pode ser guardado no banco em texto puro.
import { NextResponse, type NextRequest } from 'next/server';
import { esquemaNovoPedidoAjuda } from '@/dominio/esquemas';
import { criarPedido } from '@/lib/ajuda/servico';

export async function POST(req: NextRequest) {
  const corpo = await req.json().catch(() => null);
  const r = esquemaNovoPedidoAjuda.safeParse(corpo);
  if (!r.success) {
    return NextResponse.json({ erro: 'dados_invalidos', detalhes: r.error.flatten().fieldErrors }, { status: 400 });
  }
  const resultado = await criarPedido(r.data);
  if (!resultado.ok) {
    if (resultado.erro === 'limite') return NextResponse.json({ erro: 'limite', motivo: resultado.motivo }, { status: 429 });
    return NextResponse.json({ erro: 'falha' }, { status: 500 });
  }
  return NextResponse.json(
    { id: resultado.id, token: resultado.token, fonte: resultado.fonte, acompanhar: `/ajuda/${resultado.id}?token=${resultado.token}` },
    { status: 201 },
  );
}
