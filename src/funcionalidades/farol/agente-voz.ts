'use client';
// Guia Dourado · ouvido do agente de voz: escuta CONTÍNUA, no próprio aparelho.
// pt-BR: Vosk (vosk-browser, WASM) com o modelo pequeno em português servido em /vosk — funciona
// sem internet depois de baixado uma vez e nada sai do celular. Outros idiomas (ou se o Vosk falhar):
// reconhecimento do navegador (Web Speech). O guia PAUSA a escuta enquanto fala, para não ouvir a si mesmo.
// A escuta geral do app é da Trilha C (AGENTS.md §7); isto serve só ao guia e à pergunta de entrada.
import type { Model } from 'vosk-browser';

const URL_MODELO_PT = '/vosk/vosk-model-small-pt-0.3.tar.gz';

export type MotorEscuta = 'vosk' | 'navegador';
export type Escutador = {
  motor: MotorEscuta;
  pausar: () => void;
  retomar: () => void;
  parar: () => void;
};
type Opcoes = {
  idioma: string;
  aoOuvir: (texto: string) => void;
  aoOuvirParcial?: (texto: string) => void;
  /** chamado quando a pessoa começa/para de falar (para animar a esfera) */
  aoMudarVolume?: (nivel: number) => void;
  /**
   * Palavras que o guia precisa entender (destinos, comandos, números). No Vosk viram uma "gramática":
   * o reconhecimento fica restrito a elas e erra muito menos (testado: "sala dois", "quanto falta", "lixeira").
   */
  palavras?: readonly string[];
};

/** Palavras de ligação comuns nos pedidos em português. */
const LIGACAO_PT = 'quero ir para o a os as pro pra me leva levar no na ao aos vou por favor fica onde eu';

let modeloPt: Promise<Model> | null = null;
function carregarModeloPt(): Promise<Model> {
  if (!modeloPt) {
    modeloPt = import('vosk-browser').then((m) => m.createModel(URL_MODELO_PT, -1));
    modeloPt.catch(() => {
      modeloPt = null;
    });
  }
  return modeloPt;
}

/** Começa a baixar o modelo cedo (ex.: na abertura), para a escuta ficar pronta mais rápido. */
export function preCarregarEscuta(idioma: string): void {
  if (idioma.startsWith('pt')) void carregarModeloPt().catch(() => undefined);
}

async function escutadorVosk(o: Opcoes): Promise<Escutador> {
  const modelo = await carregarModeloPt();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    video: false,
  });
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const ctx = new AC!();
  const fonte = ctx.createMediaStreamSource(stream);
  // ScriptProcessor: simples e suportado em todos os navegadores móveis (o AudioWorklet exigiria outro arquivo).
  const proc = ctx.createScriptProcessor(4096, 1, 1);
  const gramatica = o.palavras?.length
    ? JSON.stringify([[LIGACAO_PT, ...o.palavras].join(' ').toLowerCase(), '[unk]'])
    : undefined;
  const rec = new modelo.KaldiRecognizer(ctx.sampleRate, gramatica);
  let pausado = false;
  rec.on('result', (m) => {
    const texto = (m as { result?: { text?: string } }).result?.text?.trim();
    if (texto && !pausado) o.aoOuvir(texto);
  });
  rec.on('partialresult', (m) => {
    const texto = (m as { result?: { partial?: string } }).result?.partial?.trim();
    if (texto && !pausado) o.aoOuvirParcial?.(texto);
  });
  proc.onaudioprocess = (e) => {
    if (pausado) return;
    const dados = e.inputBuffer.getChannelData(0);
    let soma = 0;
    for (let i = 0; i < dados.length; i += 16) soma += (dados[i] ?? 0) * (dados[i] ?? 0);
    o.aoMudarVolume?.(Math.min(1, Math.sqrt(soma / (dados.length / 16)) * 8));
    rec.acceptWaveform(e.inputBuffer);
  };
  fonte.connect(proc);
  proc.connect(ctx.destination);
  if (ctx.state === 'suspended') await ctx.resume();
  return {
    motor: 'vosk',
    pausar: () => {
      pausado = true;
      o.aoMudarVolume?.(0);
    },
    retomar: () => {
      pausado = false;
    },
    parar: () => {
      pausado = true;
      proc.disconnect();
      fonte.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      rec.remove();
      void ctx.close();
    },
  };
}

type Reconhecedor = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function escutadorNavegador(o: Opcoes): Escutador | null {
  // API sem tipo oficial no TypeScript (webkit no Chrome/Safari).
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecedor; webkitSpeechRecognition?: new () => Reconhecedor };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = o.idioma;
  r.continuous = true;
  r.interimResults = true;
  let pausado = false;
  let ligado = true;
  const iniciar = () => {
    try {
      r.start();
    } catch {
      // já estava escutando
    }
  };
  r.onresult = (e) => {
    if (pausado) return;
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (!res) continue;
      const texto = res[0].transcript.trim();
      if (res.isFinal) o.aoOuvir(texto);
      else o.aoOuvirParcial?.(texto);
    }
  };
  r.onend = () => {
    if (ligado && !pausado) iniciar(); // o navegador encerra sozinho de tempos em tempos
  };
  r.onerror = () => undefined;
  iniciar();
  return {
    motor: 'navegador',
    pausar: () => {
      pausado = true;
      r.stop();
    },
    retomar: () => {
      pausado = false;
      iniciar();
    },
    parar: () => {
      ligado = false;
      pausado = true;
      r.stop();
    },
  };
}

/** Liga a escuta contínua. Devolve null se o aparelho não permitir escutar. */
export async function criarEscutador(o: Opcoes): Promise<Escutador | null> {
  if (o.idioma.startsWith('pt')) {
    try {
      return await escutadorVosk(o);
    } catch {
      // sem modelo/microfone/WASM: tenta o reconhecimento do navegador
    }
  }
  return escutadorNavegador(o);
}
