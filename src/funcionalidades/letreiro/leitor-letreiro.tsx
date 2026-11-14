'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar } from '@/adaptadores/voz/web-speech';
import { capturarQuadro, encerrarOcr, lerTexto, prepararOcr } from '@/adaptadores/ocr/tesseract';
import { CHAVE_PREFERENCIAS, type Preferencias } from '@/funcionalidades/preferencias/script-preferencias';
import { confirmarLeitura, ESQUECER_APOS_MS, reconhecerLetreiro } from '@/dominio/letreiro/reconhecer';
import type { Local } from '@/dominio/tipos';

/**
 * Leitor de letreiro: câmera traseira + OCR no próprio celular (Tesseract.js).
 * Enquanto a câmera está ligada, lê o centro da imagem a cada ~1,8 s e FALA a loja quando
 * tem certeza (nome inteiro, ou o mesmo nome em 2 de 3 leituras). Não repete a mesma loja
 * enquanto a pessoa continua apontando para ela; depois de 10 s sem vê-la, pode anunciar de novo.
 * "Ler agora" lê na hora e sempre responde (inclusive "não reconheci").
 */

type Erro = 'inseguro' | 'semSuporte' | 'negada' | 'naoEncontrada' | 'emUso' | 'ocr' | 'desconhecido';
type Estado = 'desligada' | 'ligando' | 'ligada';

const INTERVALO_MS = 1800;

function erroDaCamera(erro: unknown): Erro {
  if (!(erro instanceof DOMException)) return 'desconhecido';
  if (erro.name === 'NotAllowedError' || erro.name === 'SecurityError') return 'negada';
  if (erro.name === 'NotFoundError' || erro.name === 'OverconstrainedError') return 'naoEncontrada';
  if (erro.name === 'NotReadableError' || erro.name === 'AbortError') return 'emUso';
  return 'desconhecido';
}

function lerPreferencias(): Preferencias {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PREFERENCIAS) ?? '{}') as Preferencias;
  } catch {
    return {};
  }
}

export function LeitorLetreiro({ locais }: { locais: readonly Local[] }) {
  const t = useTranslations('letreiro');
  const tPisos = useTranslations('pisos');
  const idioma = useLocale();
  const anunciar = useAnunciador();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const ocupadoRef = useRef(false);
  const recentesRef = useRef<(string | null)[]>([]);
  const anunciadoRef = useRef<{ id: string; vistoEm: number } | null>(null);
  const cicloRef = useRef<() => Promise<void>>(async () => {});

  const [estado, setEstado] = useState<Estado>('desligada');
  const [erro, setErro] = useState<Erro | null>(null);
  const [lendo, setLendo] = useState(false);
  const [preparando, setPreparando] = useState(false);
  const [ultimo, setUltimo] = useState<Local | null>(null);

  const frase = useCallback(
    (local: Local) => t('emFrente', { nome: local.nome, numero: local.numero, piso: tPisos(local.pisoId) }),
    [t, tPisos],
  );

  const avisar = useCallback(
    (mensagem: string) => {
      anunciar(mensagem, 'assertive');
      const p = lerPreferencias();
      falar(mensagem, idioma, undefined, p.velocidadeVoz ?? 1);
    },
    [anunciar, idioma],
  );

  const anunciarLocal = useCallback(
    (local: Local) => {
      anunciadoRef.current = { id: local.id, vistoEm: Date.now() };
      setUltimo(local);
      avisar(frase(local));
      if (lerPreferencias().vibracao) navigator.vibrate?.([80, 60, 80]);
    },
    [avisar, frase],
  );

  const parar = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((faixa) => faixa.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    recentesRef.current = [];
    anunciadoRef.current = null;
    setEstado('desligada');
  }, []);

  /** Uma leitura automática: só anuncia com confirmação e sem repetir a mesma loja. */
  const ciclo = useCallback(async () => {
    const video = videoRef.current;
    if (!streamRef.current || !video) return;
    const a = anunciadoRef.current;
    if (a && Date.now() - a.vistoEm > ESQUECER_APOS_MS) anunciadoRef.current = null;

    if (!ocupadoRef.current && document.visibilityState === 'visible') {
      const quadro = capturarQuadro(video);
      if (quadro) {
        ocupadoRef.current = true;
        try {
          const achado = reconhecerLetreiro(await lerTexto(quadro), locais);
          const atual = anunciadoRef.current;
          if (achado && atual && achado.local.id === atual.id) {
            atual.vistoEm = Date.now(); // continua vendo a mesma loja: não repete
            recentesRef.current = [];
          } else {
            const r = confirmarLeitura(recentesRef.current, achado);
            recentesRef.current = r.recentes;
            if (r.confirmado && achado) anunciarLocal(achado.local);
          }
        } catch {
          // motor ainda não disponível (ex.: sem internet na 1ª vez): tenta no próximo ciclo
        } finally {
          ocupadoRef.current = false;
        }
      }
    }
    if (streamRef.current) timerRef.current = window.setTimeout(() => void cicloRef.current(), INTERVALO_MS);
  }, [anunciarLocal, locais]);

  useEffect(() => {
    cicloRef.current = ciclo;
  }, [ciclo]);

  const ligar = useCallback(async () => {
    setErro(null);
    if (!window.isSecureContext) return setErro('inseguro');
    if (!navigator.mediaDevices?.getUserMedia) return setErro('semSuporte');
    if (streamRef.current) return;
    setEstado('ligando');
    try {
      // getUserMedia chamado direto no clique (gesto do usuário), sem await antes.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true; // iOS: sem isso abre o vídeo em tela cheia nativa
        await video.play();
      }
      setEstado('ligada');
      avisar(t('ligada'));
      // Carrega o OCR em paralelo; o loop começa já e tenta de novo até o motor ficar pronto.
      setPreparando(true);
      prepararOcr()
        .catch(() => setErro('ocr'))
        .finally(() => setPreparando(false));
      timerRef.current = window.setTimeout(() => void ciclo(), INTERVALO_MS);
    } catch (e) {
      streamRef.current?.getTracks().forEach((faixa) => faixa.stop());
      streamRef.current = null;
      setEstado('desligada');
      setErro(erroDaCamera(e));
    }
  }, [avisar, ciclo, t]);

  const desligar = useCallback(() => {
    parar();
    anunciar(t('desligada'));
  }, [anunciar, parar, t]);

  /** Leitura sob demanda: sempre dá uma resposta. */
  const lerAgora = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    const quadro = capturarQuadro(video, 1600, false);
    if (!quadro) return;
    setLendo(true);
    ocupadoRef.current = true;
    anunciar(t('lendo'));
    try {
      const achado = reconhecerLetreiro(await lerTexto(quadro), locais);
      recentesRef.current = [];
      if (achado) anunciarLocal(achado.local);
      else avisar(t('naoReconheci'));
    } catch {
      setErro('ocr');
    } finally {
      ocupadoRef.current = false;
      setLendo(false);
    }
  }, [anunciar, anunciarLocal, avisar, locais, t]);

  // Libera a câmera e o OCR ao sair da tela ou quando o app vai para segundo plano.
  useEffect(() => {
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'hidden') parar();
    };
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    return () => {
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      parar();
      void encerrarOcr();
    };
  }, [parar]);

  const ligada = estado === 'ligada';

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border-2 border-borda bg-black" hidden={!ligada}>
        <video ref={videoRef} aria-label={t('video')} muted playsInline className="block aspect-[3/4] w-full object-cover" />
        {/* Moldura da área lida (centro 80% × 60%) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[10%] inset-y-[20%] rounded-lg border-4 border-dashed border-white/90" />
      </div>

      {ligada && <p className="rounded-lg bg-superficie p-3 font-bold">{t('guia')}</p>}
      {preparando && <p role="status">{t('carregando')}</p>}

      <div className="flex flex-wrap gap-2">
        {!ligada ? (
          <button
            type="button"
            onClick={() => void ligar()}
            disabled={estado === 'ligando'}
            className="alvo flex-1 rounded-lg bg-primaria px-4 text-lg font-bold text-primaria-texto"
          >
            <span aria-hidden="true">📷 </span>
            {t('ligar')}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void lerAgora()}
              disabled={lendo}
              className="alvo flex-1 rounded-lg bg-primaria px-4 text-lg font-bold text-primaria-texto"
            >
              <span aria-hidden="true">🔎 </span>
              {lendo ? t('lendo') : t('lerAgora')}
            </button>
            <button type="button" onClick={desligar} className="alvo rounded-lg border-2 border-borda px-4 font-bold">
              <span aria-hidden="true">⏹ </span>
              {t('desligar')}
            </button>
          </>
        )}
      </div>

      {erro && (
        <p role="alert" className="rounded-lg border-2 border-perigo p-3">
          {t(`erros.${erro}`)}
        </p>
      )}

      {ultimo && (
        <section aria-labelledby="ultima-loja" className="space-y-2 rounded-xl border-2 border-borda bg-superficie p-4">
          <h2 id="ultima-loja" className="text-sm font-bold text-texto-suave">
            {t('ultimaLoja')}
          </h2>
          <p className="text-xl font-bold">{frase(ultimo)}</p>
          <Link href={`/locais/${ultimo.slug}`} className="alvo inline-flex items-center rounded-lg border-2 border-borda px-3 font-bold">
            {t('verDetalhes', { nome: ultimo.nome })}
          </Link>
        </section>
      )}

      <p className="text-sm text-texto-suave">{t('aviso')}</p>
      <p className="text-sm text-texto-suave">{t('internet')}</p>
      <p>
        <Link href="/buscar" className="alvo inline-flex items-center underline">
          {t('alternativa')}
        </Link>
      </p>
    </div>
  );
}
