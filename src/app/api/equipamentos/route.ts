// Status de elevadores e escadas rolantes (RF-23). Usado pela rota (timeout de 2 s no cliente).
// TODO(ADR-0008): ler da tabela "equipamentos" do Supabase; o JSON abaixo é o padrão offline.
import { NextResponse } from 'next/server';
import { equipamentos } from '@/lib/dados';

export async function GET() {
  return NextResponse.json({
    fonte: 'padrao-offline',
    atualizadoEm: null,
    equipamentos: equipamentos.map(({ id, tipo, status }) => ({ id, tipo, status })),
  });
}
