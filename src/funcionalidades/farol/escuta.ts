'use client';
// Escuta curta por voz (SpeechRecognition, API do navegador) — só para o guia por câmera:
// a pergunta de abertura ("voz ou tela?") e os comandos/destinos falados.
// Mínima de propósito: a escuta geral do app é da Trilha C (AGENTS.md §7, src/adaptadores/voz/);
// quando ela existir, este arquivo deve passar a usá-la.
// Funciona bem no Chrome do Android (usa internet); no iPhone é instável → os botões continuam valendo.

type ResultadoReconhecimento = { 0: { transcript: string } };
type EventoReconhecimento = { results: ArrayLike<ResultadoReconhecimento> };
type Reconhecedor = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: EventoReconhecimento) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type ConstrutorReconhecedor = new () => Reconhecedor;

function construtor(): ConstrutorReconhecedor | null {
  if (typeof window === 'undefined') return null;
  // API sem tipo oficial no TypeScript (webkit no Chrome/Safari).
  const w = window as unknown as {
    SpeechRecognition?: ConstrutorReconhecedor;
    webkitSpeechRecognition?: ConstrutorReconhecedor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function escutaDisponivel(): boolean {
  return construtor() !== null;
}

/** Escuta uma frase (até `limiteMs`). Devolve o texto ou null (sem suporte, silêncio, erro). */
export function ouvirUmaVez(idioma: string, limiteMs = 7000): Promise<string | null> {
  const C = construtor();
  if (!C) return Promise.resolve(null);
  return new Promise((resolver) => {
    let feito = false;
    const fim = (texto: string | null) => {
      if (feito) return;
      feito = true;
      window.clearTimeout(tempo);
      resolver(texto);
    };
    const r = new C();
    r.lang = idioma;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => fim(e.results[0]?.[0].transcript ?? null);
    r.onerror = () => fim(null);
    r.onend = () => fim(null);
    const tempo = window.setTimeout(() => {
      r.stop();
      fim(null);
    }, limiteMs);
    try {
      r.start();
    } catch {
      fim(null);
    }
  });
}

/** minúsculas, sem acento, números por extenso viram dígitos ("sala dois" → "sala 2"). */
export function normalizarFala(texto: string, numeros: readonly string[]): string {
  const limpo = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ');
  const mapa = new Map(numeros.map((n, i) => [n.normalize('NFD').replace(/[̀-ͯ]/g, ''), String(i)]));
  return limpo
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => mapa.get(p) ?? p)
    .join(' ');
}

/** A fala contém alguma das palavras (lista separada por vírgula, já no idioma da página)? */
export function contemAlguma(fala: string, lista: string, numeros: readonly string[]): boolean {
  return lista
    .split(',')
    .map((p) => normalizarFala(p, numeros))
    .some((p) => p && ` ${fala} `.includes(` ${p} `));
}
