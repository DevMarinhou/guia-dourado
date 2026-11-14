import type { Local } from '../tipos';

// Reconhecimento de letreiro: compara o texto lido pela câmera (OCR) com os nomes dos locais.
// Domínio puro (sem React/Next). Regra: na dúvida, NÃO anunciar — melhor "não reconheci" do que
// dizer a loja errada para uma pessoa cega.

/** Maiúsculas, sem acentos, "&" vira "E", só letras/números e espaços simples. */
export function normalizarLetreiro(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/&/g, ' E ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const atual = [i];
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      atual.push(Math.min(anterior[j]! + 1, atual[j - 1]! + 1, anterior[j - 1]! + custo));
    }
    anterior = atual;
  }
  return anterior[b.length]!;
}

/** 1 = idêntico, 0 = nada em comum. */
export function semelhanca(a: string, b: string): number {
  const maior = Math.max(a.length, b.length);
  return maior === 0 ? 1 : 1 - levenshtein(a, b) / maior;
}

const semEspacos = (s: string) => s.replace(/ /g, '');

/**
 * Nomes que podem aparecer escritos no letreiro: o nome oficial e os sinônimos que são
 * parte do próprio nome ("outback" de "Outback Steakhouse", "cea" de "C&A").
 * Sinônimos genéricos ("roupas", "restaurante") NÃO entram: não estão escritos na fachada.
 * Sanitários ficam de fora (mesma placa em vários lugares — não identifica o local).
 */
export function nomesDoLetreiro(local: Local): string[] {
  if (local.categoria === 'sanitario') return [];
  const nome = normalizarLetreiro(local.nome);
  const palavrasDoNome = new Set(nome.split(' '));
  const extras = local.sinonimos
    .map(normalizarLetreiro)
    .filter((s) => s.length >= 3)
    .filter((s) => semEspacos(s) === semEspacos(nome) || s.split(' ').every((p) => palavrasDoNome.has(p)));
  return [...new Set([nome, ...extras])].filter((n) => n.length >= 2);
}

/** Melhor semelhança entre `candidato` e algum trecho do texto lido com tamanho parecido. */
function melhorJanela(palavras: string[], candidato: string): number {
  const n = candidato.split(' ').length;
  const compacto = semEspacos(candidato);
  let melhor = 0;
  for (let tamanho = Math.max(1, n - 1); tamanho <= n + 1; tamanho++) {
    for (let i = 0; i + tamanho <= palavras.length; i++) {
      const janela = palavras.slice(i, i + tamanho).join(' ');
      melhor = Math.max(melhor, semelhanca(janela, candidato), semelhanca(semEspacos(janela), compacto));
      if (melhor === 1) return 1;
    }
  }
  return melhor;
}

export interface LetreiroReconhecido {
  local: Local;
  /** 0–1; 1 = nome lido por inteiro. */
  pontuacao: number;
}

export interface OpcoesReconhecimento {
  /** Semelhança mínima para aceitar (padrão 0,75). */
  minimo?: number;
  /** Vantagem mínima sobre o 2º colocado (padrão 0,08): evita confundir nomes parecidos. */
  margem?: number;
}

/** Devolve o local cujo nome aparece no texto lido, ou null se não houver certeza. */
export function reconhecerLetreiro(
  textoLido: string,
  locais: readonly Local[],
  { minimo = 0.75, margem = 0.08 }: OpcoesReconhecimento = {},
): LetreiroReconhecido | null {
  const texto = normalizarLetreiro(textoLido);
  if (texto.length < 2) return null;
  const palavras = texto.split(' ');

  const ranking = locais
    .map((local) => {
      let pontuacao = 0;
      let inteiro = 0; // tamanho do maior nome lido por inteiro (desempate: "BIG LAR" vence "BIG")
      for (const n of nomesDoLetreiro(local)) {
        if (` ${texto} `.includes(` ${n} `)) {
          pontuacao = 1;
          inteiro = Math.max(inteiro, semEspacos(n).length);
        } else {
          pontuacao = Math.max(pontuacao, melhorJanela(palavras, n));
        }
      }
      return { local, pontuacao, inteiro };
    })
    .filter((r) => r.pontuacao > 0)
    .sort((a, b) => b.pontuacao - a.pontuacao || b.inteiro - a.inteiro);

  const primeiro = ranking[0];
  if (!primeiro || primeiro.pontuacao < minimo) return null;
  const segundo = ranking[1];
  if (segundo && primeiro.pontuacao < 1 && primeiro.pontuacao - segundo.pontuacao < margem) return null;
  // Dois nomes lidos por inteiro e do mesmo tamanho: ambíguo.
  if (segundo && primeiro.pontuacao === 1 && segundo.pontuacao === 1 && primeiro.inteiro === segundo.inteiro) return null;
  return { local: primeiro.local, pontuacao: primeiro.pontuacao };
}

/** Leitura automática: no máx. este tempo sem ver a loja anunciada antes de poder anunciá-la de novo. */
export const ESQUECER_APOS_MS = 10_000;
/** Pontuação a partir da qual anuncia já na 1ª leitura (nome lido por inteiro). */
export const PONTUACAO_IMEDIATA = 0.97;

/**
 * Confirmação da leitura automática: anuncia quando a pontuação é quase perfeita ou quando o
 * mesmo local aparece em 2 das últimas 3 leituras (tolera a mão tremendo e corta falsos positivos).
 */
export function confirmarLeitura(
  recentes: readonly (string | null)[],
  atual: LetreiroReconhecido | null,
): { confirmado: boolean; recentes: (string | null)[] } {
  const id = atual?.local.id ?? null;
  const janela = [...recentes, id].slice(-3);
  if (!atual) return { confirmado: false, recentes: janela };
  const vezes = janela.filter((x) => x === id).length;
  const confirmado = atual.pontuacao >= PONTUACAO_IMEDIATA || vezes >= 2;
  return { confirmado, recentes: confirmado ? [] : janela };
}
