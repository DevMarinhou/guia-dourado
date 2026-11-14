// Status de elevadores e escadas rolantes (RF-23). Usado pela rota (timeout de 2 s no
// cliente) e alterado pela Central. Lê o Supabase quando configurado; sem credenciais,
// usa o status alternado na memória (demonstração) sobre o JSON offline.
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { alterarEquipamento, listarEquipamentos } from '@/lib/ajuda/servico';

export async function GET() {
  const { equipamentos, fonte } = await listarEquipamentos();
  return NextResponse.json({ fonte, atualizadoEm: null, equipamentos: equipamentos.map(({ id, tipo, status }) => ({ id, tipo, status })) });
}

const esquemaTroca = z.object({ id: z.string().min(1), status: z.enum(['operando', 'manutencao', 'fora']) });

/** Alternância de status pela Central (RF-23): o T05 vê a mudança no próximo reload. */
export async function PATCH(req: NextRequest) {
  const chave = process.env.CENTRAL_CHAVE;
  if (chave && req.headers.get('x-central-chave') !== chave) {
    return NextResponse.json({ erro: 'nao_autorizado' }, { status: 401 });
  }
  const r = esquemaTroca.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 });
  const atualizado = await alterarEquipamento(r.data.id, r.data.status);
  if (!atualizado) return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 });
  return NextResponse.json(atualizado);
}
