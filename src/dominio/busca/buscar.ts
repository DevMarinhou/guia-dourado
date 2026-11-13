import type { Local } from '../tipos';

/** Minúsculas, sem acentos e sem pontuação: "C&A" → "ca", "Pernambucanas!" → "pernambucanas". */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Palavras do dia a dia → categoria do catálogo (Cap. 10.6). */
const SINONIMOS_CATEGORIA: Record<string, Local['categoria']> = {
  banheiro: 'sanitario',
  sanitario: 'sanitario',
  wc: 'sanitario',
  comida: 'alimentacao',
  lanche: 'alimentacao',
  restaurante: 'alimentacao',
  almoco: 'alimentacao',
  roupa: 'moda',
  roupas: 'moda',
  diversao: 'lazer',
  mercado: 'mercado',
};

/** Distância de edição (Levenshtein) com limite, para tolerar erros de digitação. */
export function distanciaEdicao(a: string, b: string, limite = 2): number {
  if (Math.abs(a.length - b.length) > limite) return limite + 1;
  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    let menorDaLinha = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(anterior[j]! + 1, atual[j - 1]! + 1, anterior[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      atual.push(v);
      menorDaLinha = Math.min(menorDaLinha, v);
    }
    if (menorDaLinha > limite) return limite + 1;
    anterior = atual;
  }
  return anterior[b.length]!;
}

export interface ResultadoBusca {
  local: Local;
  pontuacao: number;
}

/** Busca tolerante a acentos, sinônimos, número da loja e pequenos erros. */
export function buscarLocais(consulta: string, locais: readonly Local[]): ResultadoBusca[] {
  const q = normalizar(consulta);
  if (!q) return [];
  const categoria = SINONIMOS_CATEGORIA[q];

  const resultados: ResultadoBusca[] = [];
  for (const local of locais) {
    const nome = normalizar(local.nome);
    const numero = normalizar(local.numero);
    const sinonimos = local.sinonimos.map(normalizar);
    let p = 0;
    if (nome === q) p = 100;
    else if (numero === q) p = 95;
    else if (nome.startsWith(q)) p = 80;
    else if (sinonimos.includes(q)) p = 70;
    else if (nome.split(' ').some((palavra) => palavra.startsWith(q))) p = 65;
    else if (sinonimos.some((s) => s.startsWith(q) || s.includes(` ${q}`))) p = 55;
    else if (categoria && local.categoria === categoria) p = 50;
    else if (q.length >= 4 && [nome, ...sinonimos].some((t) => distanciaEdicao(q, t, q.length >= 7 ? 2 : 1) <= (q.length >= 7 ? 2 : 1))) p = 30;
    if (p > 0) resultados.push({ local, pontuacao: p });
  }
  return resultados.sort((a, b) => b.pontuacao - a.pontuacao || a.local.nome.localeCompare(b.local.nome, 'pt-BR'));
}
