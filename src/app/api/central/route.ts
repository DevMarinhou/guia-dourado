// Central da equipe (RF-22): fila de pedidos e ações (aceitar, a caminho, concluir, trote).
// Autenticação por CENTRAL_CHAVE em .env.local (header x-central-chave). Sem a chave
// configurada (modo demonstração), responde com fonte: 'demonstracao' e a interface
// mostra o aviso — nunca finge que é produção.
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { listarFila, mudarStatus } from '@/lib/ajuda/servico';

const esquemaAcao = z.object({
  id: z.uuid(),
  acao: z.enum(['aceito', 'a_caminho', 'concluido', 'trote']),
  previsaoMin: z.number().int().min(0).max(120).optional(),
});

function autorizado(req: NextRequest): boolean {
  const chave = process.env.CENTRAL_CHAVE;
  if (!chave) return true; // modo demonstração: sem credencial, fila aberta na demo
  return req.headers.get('x-central-chave') === chave;
}

export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ erro: 'nao_autorizado' }, { status: 401 });
  const { pedidos, fonte } = await listarFila();
  return NextResponse.json({ pedidos, fonte, autenticado: Boolean(process.env.CENTRAL_CHAVE) });
}

export async function POST(req: NextRequest) {
  if (!autorizado(req)) return NextResponse.json({ erro: 'nao_autorizado' }, { status: 401 });
  const r = esquemaAcao.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 });
  const { id, acao, previsaoMin } = r.data;
  const pedido = await mudarStatus(id, acao, acao === 'aceito' ? { atendente: 'Equipe do shopping', previsaoMin: previsaoMin ?? 5 } : {});
  if (!pedido) return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 });
  return NextResponse.json(pedido);
}
