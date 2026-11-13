// T13: Modo totem (RF-29). Abre o início com o ponto do totem e o modo quiosque.
// TODO(RF-29): no cliente, modo=totem ativa layout na faixa de alcance, áudio por fone,
// reinício automático com aviso (WCAG 2.2.1) e limpeza de dados entre usuários.
import { NextResponse, type NextRequest } from 'next/server';
import { esquemaCodigoPonto } from '@/dominio/esquemas';

export async function GET(req: NextRequest, ctx: RouteContext<'/totem/[ponto]'>) {
  const { ponto } = await ctx.params;
  const destino = new URL('/', req.url);
  const codigo = esquemaCodigoPonto.safeParse(ponto);
  if (codigo.success) destino.searchParams.set('ponto', codigo.data);
  destino.searchParams.set('modo', 'totem');
  return NextResponse.redirect(destino, 307);
}
