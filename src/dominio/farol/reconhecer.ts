/**
 * Farol: reconhecimento do lugar por semelhança de imagem (domínio puro, sem servidor).
 *
 * A base é um conjunto de 'impressões digitais' (embeddings L2-normalizados do
 * MediaPipe Image Embedder) de quadros do vídeo narrado, cada um com o ponto
 * onde foi gravado. Ao vivo, comparamos a câmera com a base (k vizinhos mais
 * parecidos) e só confirmamos um ponto quando há semelhança, maioria e
 * repetição em análises seguidas. Funções puras: fáceis de testar.
 */

export type BaseVisual = {
  versao: 1;
  percurso: string;
  criadoEm: string;
  dimensao: number;
  /** ids dos pontos (inclui '-' para transição) */
  rotulos: string[];
  /** cada item: índice do rótulo + vetor quantizado int8 em base64 */
  itens: { r: number; v: string }[];
};

export type BaseCarregada = {
  rotulos: string[];
  dimensao: number;
  vetores: Float32Array[];
  indices: number[];
};

export const AJUSTES = {
  /** quantos vizinhos votam */
  k: 7,
  /** semelhança mínima (cosseno) do vizinho mais parecido */
  semelhancaMinima: 0.78,
  /** fração mínima dos votos para o ponto vencedor */
  maioriaMinima: 0.6,
  /** análises seguidas iguais para confirmar */
  confirmacoes: 2,
};

// ---------- quantização (deixa a base ~10x menor) ----------

export function quantizar(v: ArrayLike<number>): string {
  const bytes = new Int8Array(v.length);
  for (let i = 0; i < v.length; i++) {
    bytes[i] = Math.max(-127, Math.min(127, Math.round((v[i] ?? 0) * 127)));
  }
  let bin = '';
  const u = new Uint8Array(bytes.buffer);
  for (let i = 0; i < u.length; i++) bin += String.fromCharCode(u[i] ?? 0);
  return btoa(bin);
}

export function desquantizar(b64: string): Float32Array {
  const bin = atob(b64);
  const out = new Float32Array(bin.length);
  let norma = 0;
  for (let i = 0; i < bin.length; i++) {
    const byte = bin.charCodeAt(i);
    const val = (byte > 127 ? byte - 256 : byte) / 127;
    out[i] = val;
    norma += val * val;
  }
  norma = Math.sqrt(norma) || 1;
  for (let i = 0; i < out.length; i++) out[i] = (out[i] ?? 0) / norma;
  return out;
}

export function carregarBase(base: BaseVisual): BaseCarregada {
  return {
    rotulos: base.rotulos,
    dimensao: base.dimensao,
    vetores: base.itens.map((it) => desquantizar(it.v)),
    indices: base.itens.map((it) => it.r),
  };
}

// ---------- comparação ----------

function cosseno(a: ArrayLike<number>, b: Float32Array): number {
  let s = 0;
  for (let i = 0; i < b.length; i++) s += (a[i] ?? 0) * (b[i] ?? 0);
  return s;
}

export type Palpite = {
  /** id do ponto mais votado (pode ser '-' = transição) */
  rotulo: string | null;
  /** semelhança do vizinho mais parecido */
  semelhanca: number;
  /** fração dos votos do vencedor */
  maioria: number;
  /** passou nos limites? */
  aceito: boolean;
};

export function palpitar(
  base: BaseCarregada,
  vetor: ArrayLike<number>,
  ajustes = AJUSTES,
): Palpite {
  if (base.vetores.length === 0) {
    return { rotulo: null, semelhanca: 0, maioria: 0, aceito: false };
  }
  const sims = base.vetores.map((v, i) => ({ s: cosseno(vetor, v), r: base.indices[i] ?? -1 }));
  sims.sort((a, b) => b.s - a.s);
  const vizinhos = sims.slice(0, ajustes.k);
  const votos = new Map<number, number>();
  let total = 0;
  for (const v of vizinhos) {
    const peso = Math.max(0, v.s);
    votos.set(v.r, (votos.get(v.r) ?? 0) + peso);
    total += peso;
  }
  let melhor = -1;
  let melhorPeso = -1;
  for (const [r, p] of votos) {
    if (p > melhorPeso) {
      melhor = r;
      melhorPeso = p;
    }
  }
  const maioria = total > 0 ? melhorPeso / total : 0;
  const semelhanca = vizinhos[0]?.s ?? 0;
  const rotulo = base.rotulos[melhor] ?? null;
  const aceito =
    semelhanca >= ajustes.semelhancaMinima && maioria >= ajustes.maioriaMinima;
  return { rotulo, semelhanca, maioria, aceito };
}

/** Confirma um ponto só depois de N palpites aceitos e iguais em sequência. */
export function criarConfirmador(n = AJUSTES.confirmacoes) {
  let ultimo: string | null = null;
  let repeticoes = 0;
  return (p: Palpite): string | null => {
    if (!p.aceito || !p.rotulo) {
      ultimo = null;
      repeticoes = 0;
      return null;
    }
    if (p.rotulo === ultimo) repeticoes++;
    else {
      ultimo = p.rotulo;
      repeticoes = 1;
    }
    return repeticoes >= n ? p.rotulo : null;
  };
}

// ---------- marcações do vídeo narrado ----------

export type Marcacao = { inicio: number; rotulo: string };

/**
 * Lê linhas no formato `m:ss id` (ou `ss id`). Cada marcação vale até a
 * próxima. Use `-` para trechos de transição. Linhas com # são comentários.
 *   0:00 entrada
 *   0:06 -
 *   0:09 bebedouro
 */
export function lerMarcacoes(texto: string): Marcacao[] {
  const out: Marcacao[] = [];
  for (const bruta of texto.split(/\r?\n/)) {
    const linha = (bruta.split('#')[0] ?? '').trim();
    if (!linha) continue;
    const m = linha.match(/^(?:(\d+):)?(\d{1,2}(?:[.,]\d+)?)\s+(\S+)/);
    if (!m) throw new Error(`Linha inválida: '${bruta}'`);
    const min = m[1] ? Number(m[1]) : 0;
    const seg = Number((m[2] ?? '0').replace(',', '.'));
    out.push({ inicio: min * 60 + seg, rotulo: m[3] ?? '' });
  }
  out.sort((a, b) => a.inicio - b.inicio);
  return out;
}

export function rotuloNoTempo(marcacoes: Marcacao[], t: number): string | null {
  let atual: string | null = null;
  for (const m of marcacoes) {
    if (m.inicio <= t) atual = m.rotulo;
    else break;
  }
  return atual;
}
