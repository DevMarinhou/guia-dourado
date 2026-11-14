// Adaptador de FALA com a Web Speech API (SpeechSynthesis): gratuito e funciona offline com vozes locais.
// A ESCUTA (SpeechRecognition) está em ./escuta-web.ts — provedorEscuta implementa ProvedorEscuta.

export function vozDisponivel(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** aoPalavra (opcional): recebe até que letra já foi dita — serve para legendas que acompanham a voz. */
export function falar(
  texto: string,
  idioma: string,
  aoTerminar?: () => void,
  velocidade = 1,
  aoPalavra?: (ateLetra: number) => void,
): void {
  if (!vozDisponivel() || !texto.trim()) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = idioma;
  fala.rate = velocidade;
  const voz = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(idioma.toLowerCase().slice(0, 2)));
  if (voz) fala.voice = voz;
  if (aoTerminar) {
    fala.onend = aoTerminar;
    fala.onerror = aoTerminar;
  }
  if (aoPalavra) {
    fala.onboundary = (e) => {
      if (e.name === 'word' || !e.name) aoPalavra(e.charIndex + (e.charLength || 1));
    };
  }
  window.speechSynthesis.speak(fala);
}

export function pararFala(): void {
  if (vozDisponivel()) window.speechSynthesis.cancel();
}
