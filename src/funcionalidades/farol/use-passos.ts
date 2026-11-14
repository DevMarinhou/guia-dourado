'use client';
/**
 * Contador de passos pelo acelerômetro (DeviceMotion, Web API nativa).
 * Detecta picos da aceleração total com intervalo mínimo entre passos.
 * No iPhone é preciso pedir permissão a partir de um toque do usuário.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const LIMIAR = 11.2; // m/s² (gravidade ≈ 9,8 + balanço do passo)
const INTERVALO_MIN_MS = 320;

type DeviceMotionComPermissao = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

export type TextosPassos = { semMovimento: string; movimentoNegado: string };

export function usePassos(aoPassar: () => void, textos: TextosPassos) {
  const [ativo, setAtivo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ultimo = useRef(0);
  const acimaDoLimiar = useRef(false);
  const suave = useRef(9.8);
  const cb = useRef(aoPassar);
  useEffect(() => {
    cb.current = aoPassar;
  }, [aoPassar]);

  useEffect(() => {
    if (!ativo) return;
    function aoMover(ev: DeviceMotionEvent) {
      const a = ev.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      suave.current = suave.current * 0.6 + mag * 0.4; // filtro passa-baixa
      const agora = performance.now();
      if (suave.current > LIMIAR && !acimaDoLimiar.current) {
        acimaDoLimiar.current = true;
        if (agora - ultimo.current > INTERVALO_MIN_MS) {
          ultimo.current = agora;
          cb.current();
        }
      } else if (suave.current < LIMIAR - 0.8) {
        acimaDoLimiar.current = false;
      }
    }
    window.addEventListener('devicemotion', aoMover);
    return () => window.removeEventListener('devicemotion', aoMover);
  }, [ativo]);

  const ligar = useCallback(async () => {
    setErro(null);
    if (typeof DeviceMotionEvent === 'undefined') {
      setErro(textos.semMovimento);
      return;
    }
    const D = DeviceMotionEvent as DeviceMotionComPermissao;
    if (typeof D.requestPermission === 'function') {
      try {
        const r = await D.requestPermission();
        if (r !== 'granted') {
          setErro(textos.movimentoNegado);
          return;
        }
      } catch {
        setErro(textos.movimentoNegado);
        return;
      }
    }
    setAtivo(true);
  }, [textos]);

  const desligar = useCallback(() => setAtivo(false), []);

  return { ativo, erro, ligar, desligar };
}
