// Reporte de barreira (RF-24). A tela T10 usará uma Server Action com o mesmo esquema.
import { NextResponse, type NextRequest } from 'next/server';
import { esquemaBarreira } from '@/dominio/esquemas';

export async function POST(req: NextRequest) {
  const r = esquemaBarreira.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 });
  // TODO(RF-24): inserir na tabela barreiras (Supabase) e notificar a Central.
  return NextResponse.json({ erro: 'central_nao_configurada' }, { status: 503 });
}
