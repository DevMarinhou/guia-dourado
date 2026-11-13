// Resolvedor de QR/NFC (RF-01, ADR-0005): https://<domínio>/q/<CÓDIGO> → início com o ponto como contexto.
// O código é estável; mudar o local de uma placa não exige reimpressão.
import { NextResponse, type NextRequest } from 'next/server';
import { resolverPonto } from '@/dominio/pontos';
import { routing } from '@/i18n/routing';
import { pontos } from '@/lib/dados';

function escolherIdioma(req: NextRequest): string {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && (routing.locales as readonly string[]).includes(cookie)) return cookie;
  const preferidos = (req.headers.get('accept-language') ?? '')
    .split(',')
    .map((p) => (p.split(';')[0] ?? '').trim().toLowerCase());
  for (const p of preferidos) {
    if (p.startsWith('pt')) return 'pt-BR';
    if (p.startsWith('es')) return 'es';
    if (p.startsWith('en')) return 'en';
  }
  return routing.defaultLocale;
}

export async function GET(req: NextRequest, ctx: RouteContext<'/q/[codigo]'>) {
  const { codigo } = await ctx.params;
  const ponto = resolverPonto(codigo, pontos);
  const idioma = escolherIdioma(req);
  const destino = new URL(idioma === routing.defaultLocale ? '/' : `/${idioma}`, req.url);
  if (ponto) destino.searchParams.set('ponto', ponto.codigo);
  else destino.searchParams.set('onde-estou', '1'); // RN-07: código inválido ou desativado
  // TODO(RNF-13): incrementar leituras_ponto_diarias (Supabase), sem IP nem identificador.
  return NextResponse.redirect(destino, 307);
}
