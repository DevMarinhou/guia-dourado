// Adaptador de ESCUTA com a Web Speech API (SpeechRecognition/kit do navegador).
// A áudio NÃO é gravada nem enviada para o nosso servidor (RNF-05): o reconhecimento
// roda no próprio aparelho e só o TEXTO parcial/final sai daqui.
//
// `any` comentado só nas interfaces do navegador, que não existem no lib.dom padrão.

import type { ProvedorEscuta } from './porta';

/** Resultado parcial ou final de uma utterance. */
interface ResultadoSpeech {
  isFinal: boolean;
  0: { transcript: string };
}

interface EventoSpeech {
  resultIndex: number;
  results: { length: number; [i: number]: ResultadoSpeech };
}

interface EventoErroSpeech {
  error: string;
}

/** Contrato mínimo do SpeechRecognition (Chrome/Edge/Safari via prefixo webkit). */
interface SpeechReconhecimento {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: EventoSpeech) => void) | null;
  onerror: ((e: EventoErroSpeech) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type FabricaSpeech = new () => SpeechReconhecimento;

/** Erros que não devem virar aviso para a pessoa (silêncio e cancelamento). */
const ERROS_MENORES = new Set(['no-speech', 'aborted']);

function criarReconhecimento(): SpeechReconhecimento | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: FabricaSpeech; webkitSpeechRecognition?: FabricaSpeech };
  const Fabrica = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Fabrica ? new Fabrica() : null;
}

// Só existe um reconhecimento ativo por vez (o microfone é exclusivo).
let ativo: SpeechReconhecimento | null = null;

/**
 * ProvedorEscuta do navegador: legenda ao vivo em tempo real, sem gravação.
 * Enquanto `iniciar` não for chamado de novo ou `parar()` não for chamado,
 * reinicia sozinho após silêncio para a conversa não morrer no meio.
 */
export const provedorEscuta: ProvedorEscuta = {
  disponivel(): boolean {
    return criarReconhecimento() !== null;
  },

  iniciar(idioma, aoReceber, aoErro): void {
    provedorEscuta.parar();
    const rec = criarReconhecimento();
    if (!rec) {
      aoErro?.('voz_indisponivel');
      return;
    }

    rec.lang = idioma;
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (evento) => {
      let texto = '';
      let final = false;
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const item = evento.results[i];
        if (!item) continue;
        texto += item[0]?.transcript ?? '';
        if (item.isFinal) final = true;
      }
      if (texto) aoReceber(texto, final);
    };

    rec.onerror = (evento) => {
      if (ERROS_MENORES.has(evento.error)) return;
      aoErro?.(evento.error);
    };

    rec.onend = () => {
      // Silêncio natural do navegador: reinicia só enquanto for o ativo (não após parar()).
      if (ativo !== rec) return;
      try {
        rec.start();
      } catch {
        // já em andamento ou microfone ocupado: a próxima oportunidade resolve
      }
    };

    ativo = rec;
    try {
      rec.start();
    } catch {
      ativo = null;
      aoErro?.('nao_iniciou');
    }
  },

  parar(): void {
    const rec = ativo;
    ativo = null;
    if (!rec) return;
    rec.onend = null;
    try {
      rec.abort();
    } catch {
      // já parado
    }
  },
};
