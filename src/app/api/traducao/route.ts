// Tradução (RF-16, ADR-0009). Primeiro tenta as frases prontas revisadas (custo zero);
// o provedor em nuvem só entra quando configurado (TRADUCAO_PROVEDOR), com a chave apenas no servidor.
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { criarProvedorFrasesProntas } from '@/adaptadores/traducao/frases-prontas';
import { traduzirEmCascata } from '@/adaptadores/traducao/porta';
import { esquemaIdioma } from '@/dominio/esquemas';
import { frasesProntas } from '@/lib/dados';

const esquemaPedido = z.object({ texto: z.string().trim().min(1).max(500), de: esquemaIdioma, para: esquemaIdioma });
const frases = criarProvedorFrasesProntas(frasesProntas.flatMap((g) => g.frases));

export async function POST(req: NextRequest) {
  const r = esquemaPedido.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ erro: 'dados_invalidos' }, { status: 400 });
  const { texto, de, para } = r.data;
  // TODO(ADR-0011): adicionar o adaptador de nuvem à cascata quando TRADUCAO_PROVEDOR estiver definido.
  const resultado = await traduzirEmCascata([frases], texto, de, para);
  if (!resultado) return NextResponse.json({ erro: 'sem_traducao_disponivel' }, { status: 404 });
  return NextResponse.json({ traducao: resultado.texto, fonte: resultado.fonte, revisada: resultado.revisada });
}
