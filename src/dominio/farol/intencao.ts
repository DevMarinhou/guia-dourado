// Guia Dourado · agente de voz: entende o pedido falado sem exigir as palavras exatas (domínio puro).
// "quero ir pro elevador um", "me leva no primeiro elevador", "sala dois", "lixo", "quanto falta?",
// "onde eu tô", "repete", "para". Sem IA na nuvem: regras + comparação aproximada de palavras.

export type Intencao =
  | { tipo: 'destino'; id: string }
  | { tipo: 'ondeEstou' }
  | { tipo: 'quantoFalta' }
  | { tipo: 'repetir' }
  | { tipo: 'parar' };

export type VocabularioIntencao = {
  /** números por extenso na posição do valor: "zero,um,dois,…" */
  numeros: readonly string[];
  /** ordinais na posição do valor: "-,primeiro,segundo,…" */
  ordinais: readonly string[];
  ondeEstou: readonly string[];
  quantoFalta: readonly string[];
  repetir: readonly string[];
  parar: readonly string[];
};

export type DestinoFalavel = {
  id: string;
  nome: string;
  /** outras formas de pedir (ex.: lixeira → "lixo", "reciclagem") */
  apelidos?: readonly string[];
};

/** Palavras que não ajudam a achar o destino. */
const VAZIAS = new Set(
  'a o as os um uma de do da dos das no na nos nas pro pra para ate ao aos e me eu quero ir vou levar leva leve por favor the to go i want take me el la los las al del ir quiero llevame lleva'.split(
    ' ',
  ),
);

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** minúsculas, sem acento nem pontuação; números e ordinais por extenso viram dígitos. */
export function normalizar(texto: string, v: Pick<VocabularioIntencao, 'numeros' | 'ordinais'>): string {
  const mapa = new Map<string, string>();
  v.numeros.forEach((n, i) => mapa.set(semAcento(n.toLowerCase()), String(i)));
  v.ordinais.forEach((n, i) => {
    if (n && n !== '-') mapa.set(semAcento(n.toLowerCase()), String(i));
  });
  return semAcento(texto.toLowerCase())
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => mapa.get(p) ?? p)
    .join(' ');
}

/** Distância de edição (Levenshtein), para aceitar "elevadô", "lixera", "sala dos"… */
export function distancia(a: string, b: string): number {
  if (a === b) return 0;
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0] ?? 0;
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const guardado = linha[j] ?? 0;
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      linha[j] = Math.min((linha[j] ?? 0) + 1, (linha[j - 1] ?? 0) + 1, anterior + custo);
      anterior = guardado;
    }
  }
  return linha[b.length] ?? 0;
}

/** Palavra falada "bate" com a palavra-chave? Exata, mesma raiz (lixo/lixeira) ou com 1–2 letras erradas. */
export function parecida(falada: string, chave: string): boolean {
  if (falada === chave) return true;
  if (/^\d+$/.test(falada) || /^\d+$/.test(chave)) return false;
  if (chave.length >= 4 && falada.length >= 4 && falada.slice(0, 4) === chave.slice(0, 4)) return true;
  const limite = chave.length >= 7 ? 2 : chave.length >= 4 ? 1 : 0;
  return distancia(falada, chave) <= limite;
}

function contemFrase(fala: string, frases: readonly string[], v: VocabularioIntencao): boolean {
  return frases.some((f) => {
    const alvo = normalizar(f, v);
    return alvo.length > 0 && ` ${fala} `.includes(` ${alvo} `);
  });
}

/** Entende o pedido. Devolve null se não reconheceu nada (aí o guia pede para repetir). */
export function interpretar(
  texto: string,
  destinos: readonly DestinoFalavel[],
  v: VocabularioIntencao,
): Intencao | null {
  const fala = normalizar(texto, v);
  if (!fala) return null;
  if (contemFrase(fala, v.parar, v)) return { tipo: 'parar' };
  if (contemFrase(fala, v.quantoFalta, v)) return { tipo: 'quantoFalta' };
  if (contemFrase(fala, v.ondeEstou, v)) return { tipo: 'ondeEstou' };
  if (contemFrase(fala, v.repetir, v)) return { tipo: 'repetir' };

  const palavras = fala.split(' ').filter((p) => !VAZIAS.has(p));
  const numerosFalados = palavras.filter((p) => /^\d+$/.test(p));
  let melhor: { id: string; pontos: number } | null = null;
  for (const d of destinos) {
    const chaves = normalizar(`${d.nome} ${d.id.replace(/-/g, ' ')} ${(d.apelidos ?? []).join(' ')}`, v)
      .split(' ')
      .filter((p) => p && !VAZIAS.has(p) && !/^\d+$/.test(p));
    const numero = d.id.match(/\d+/)?.[0];
    // "elevador 1" ≠ "elevador 2": se o destino tem número, o número falado tem de bater.
    if (numero && numerosFalados.length > 0 && !numerosFalados.includes(numero)) continue;
    let pontos = 0;
    for (const c of new Set(chaves)) if (palavras.some((p) => parecida(p, c))) pontos += 1;
    if (numero && numerosFalados.includes(numero)) pontos += 0.5;
    if (pontos >= 1 && (!melhor || pontos > melhor.pontos)) melhor = { id: d.id, pontos };
  }
  return melhor ? { tipo: 'destino', id: melhor.id } : null;
}
