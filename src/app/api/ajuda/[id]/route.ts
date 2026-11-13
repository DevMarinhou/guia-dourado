// Status de um pedido de ajuda (RF-21), consultado pelo visitante a cada 5 s com o token de acompanhamento.
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/ajuda/[id]'>) {
  const { id } = await ctx.params;
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ erro: 'token_obrigatorio' }, { status: 401 });
  // TODO(RF-21): buscar pedido por id + hash(token) no Supabase e devolver { status, atendente, previsaoMin }.
  return NextResponse.json({ id, erro: 'central_nao_configurada' }, { status: 503 });
}
