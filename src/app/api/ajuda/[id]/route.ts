// Status de um pedido de ajuda (RF-21), consultado pelo visitante a cada 5 s com o token
// de acompanhamento. Sem token, ou com token errado, responde 404 — não revela se o id existe.
import { NextResponse, type NextRequest } from 'next/server';
import { consultarPedido } from '@/lib/ajuda/servico';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/ajuda/[id]'>) {
  const { id } = await ctx.params;
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ erro: 'token_obrigatorio' }, { status: 401 });
  const pedido = await consultarPedido(id, token);
  if (!pedido) return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 });
  return NextResponse.json(pedido);
}

/** Cancelar pelo visitante (RF-21): idem, exige o token. */
export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/ajuda/[id]'>) {
  const { id } = await ctx.params;
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ erro: 'token_obrigatorio' }, { status: 401 });
  const { cancelarPedido } = await import('@/lib/ajuda/servico');
  const pedido = await cancelarPedido(id, token);
  if (!pedido) return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 });
  return NextResponse.json(pedido);
}
