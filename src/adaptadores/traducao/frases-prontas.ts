import { normalizar } from '@/dominio/busca/buscar';
import type { Idioma } from '@/dominio/tipos';
import type { ProvedorTraducao } from './porta';

type Frase = { id: string } & Partial<Record<Idioma, string>>;

/** Tradução offline a partir do banco de frases revisadas por humanos (dados/frases-prontas.json). */
export function criarProvedorFrasesProntas(frases: readonly Frase[]): ProvedorTraducao {
  return {
    nome: 'frases-prontas',
    async traduzir(texto, de, para) {
      const alvo = normalizar(texto);
      const frase = frases.find((f) => f[de] && normalizar(f[de]!) === alvo);
      const traducao = frase?.[para];
      return traducao ? { texto: traducao, fonte: 'frases-prontas', revisada: true } : null;
    },
  };
}
