import type { Idioma } from '@/dominio/tipos';

export interface ResultadoTraducao {
  texto: string;
  /** De onde veio a tradução: mostrado na interface ("tradução automática" quando não for revisada). */
  fonte: 'frases-prontas' | 'no-aparelho' | 'nuvem';
  revisada: boolean;
}

/** Porta de tradução (ADR-0009). Adaptadores em cascata: frases prontas → no aparelho → nuvem. */
export interface ProvedorTraducao {
  nome: string;
  traduzir(texto: string, de: Idioma, para: Idioma): Promise<ResultadoTraducao | null>;
}

/** Tenta cada provedor em ordem e devolve a primeira tradução obtida. */
export async function traduzirEmCascata(
  provedores: readonly ProvedorTraducao[],
  texto: string,
  de: Idioma,
  para: Idioma,
): Promise<ResultadoTraducao | null> {
  if (de === para) return { texto, fonte: 'frases-prontas', revisada: true };
  for (const p of provedores) {
    try {
      const r = await p.traduzir(texto, de, para);
      if (r) return r;
    } catch {
      // segue para o próximo provedor
    }
  }
  return null;
}
