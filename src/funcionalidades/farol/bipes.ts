'use client';
// Bipes do Farol (Web Audio, API nativa). Funciona no iPhone (que não vibra pela web).

let contexto: AudioContext | null = null;

/** Precisa ser chamado dentro de um toque (exigência do iPhone). */
export function liberarAudio(): void {
  if (typeof window === 'undefined') return;
  // webkitAudioContext: Safari antigo (API do navegador sem tipo oficial).
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  if (!contexto) contexto = new AC();
  if (contexto.state === 'suspended') void contexto.resume();
}

/** "ding" = chegou num ponto · "alerta" = perigo (grave) · "bipe" = curto. lado: -1 esquerda, 1 direita. */
export function tocar(tipo: 'ding' | 'alerta' | 'bipe', lado: -1 | 0 | 1 = 0): void {
  if (!contexto) return;
  const osc = contexto.createOscillator();
  const ganho = contexto.createGain();
  const pan = contexto.createStereoPanner();
  pan.pan.value = lado;
  const duracao = tipo === 'alerta' ? 0.35 : 0.15;
  osc.frequency.value = tipo === 'ding' ? 1046 : tipo === 'alerta' ? 220 : 880;
  ganho.gain.setValueAtTime(0.25, contexto.currentTime);
  ganho.gain.exponentialRampToValueAtTime(0.001, contexto.currentTime + duracao);
  osc.connect(ganho).connect(pan).connect(contexto.destination);
  osc.start();
  osc.stop(contexto.currentTime + duracao);
}
