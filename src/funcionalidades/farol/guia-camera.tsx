'use client';

// Farol: guia por câmera para pessoas cegas ou com baixa visão.
// Câmera (ou vídeo de demonstração) → reconhece o ponto → fala onde a pessoa está.
// Com destino: câmera + passos → "faltam N passos", "está chegando", "você chegou", perigos.
// Tudo roda no aparelho; nada é gravado. Textos chegam do servidor (3 idiomas) por props.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ImageEmbedder } from '@mediapipe/tasks-vision';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar } from '@/adaptadores/voz/web-speech';
import {
  ancorarNaPosicaoAtual,
  avisos,
  confirmarPonto,
  darPasso,
  estadoInicial,
  type Aviso,
  type EstadoPosicao,
  type PontoPercurso,
} from '@/dominio/farol/posicao';
import { carregarBase, criarConfirmador, palpitar, type BaseCarregada } from '@/dominio/farol/reconhecer';
import { carregarEmbedder, embedQuadro } from './embedder';
import { liberarAudio, tocar } from './bipes';
import { obterBase } from './base-visual';
import { usePassos } from './use-passos';

const INTERVALO_ANALISE_MS = 450;

/** Ponto já traduzido para o idioma da página. */
export type PontoGuia = PontoPercurso & { nome: string; esquerda?: string; direita?: string; perigoTexto?: string };

export type TextosGuia = Record<
  | 'percurso' | 'comecar' | 'demo' | 'ondeEstou' | 'parar' | 'paraOnde' | 'situacao' | 'pontoReconhecido'
  | 'destino' | 'faltam' | 'passos' | 'contadorDesligado' | 'unidade' | 'tecnico' | 'base' | 'semAnalise'
  | 'aviso' | 'imagemCamera' | 'f_inicio' | 'f_preparando' | 'f_semBase' | 'f_semModelo' | 'f_cameraLigada'
  | 'f_semCamera' | 'f_demo' | 'f_parado' | 'f_voceEsta' | 'f_esquerda' | 'f_direita' | 'f_trecho' | 'f_naoSei'
  | 'f_destino' | 'f_destinoSemPosicao' | 'f_faltam' | 'f_chegando' | 'f_chegouCamera' | 'f_chegouPassos'
  | 'f_perigo' | 'f_semMovimento' | 'f_movimentoNegado',
  string
>;

function preencher(modelo: string, valores: Record<string, string | number>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ''));
}

export function GuiaCamera({
  pontos,
  nomePercurso,
  idioma,
  textos: t,
}: {
  pontos: PontoGuia[];
  nomePercurso: string;
  idioma: string;
  textos: TextosGuia;
}) {
  const anunciarAria = useAnunciador();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embRef = useRef<ImageEmbedder | null>(null);
  const baseRef = useRef<BaseCarregada | null>(null);
  const confirmar = useRef(criarConfirmador());
  const posRef = useRef<EstadoPosicao>(estadoInicial());
  const avisadosRef = useRef(new Set<string>());
  const destinoRef = useRef<PontoGuia | null>(null);
  const trechoRef = useRef<string | null>(null);

  const [ativo, setAtivo] = useState(false);
  const [status, setStatus] = useState(t.f_inicio);
  const [origemBase, setOrigemBase] = useState<string | null>(null);
  const [pontoAtual, setPontoAtual] = useState<PontoGuia | null>(null);
  const [destino, setDestino] = useState<PontoGuia | null>(null);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [passosDados, setPassosDados] = useState(0);
  const [diagnostico, setDiagnostico] = useState('');

  const porId = useMemo(() => new Map(pontos.map((p) => [p.id, p])), [pontos]);
  const limites = useMemo(() => {
    const fixos = pontos.filter((p) => !p.trecho).map((p) => p.passos);
    return [Math.min(...fixos), Math.max(...fixos)] as const;
  }, [pontos]);

  const anunciar = useCallback(
    (texto: string, urgente = false) => {
      setStatus(texto);
      anunciarAria(texto, urgente ? 'assertive' : 'polite');
      falar(texto, idioma);
    },
    [anunciarAria, idioma],
  );

  const textoOndeEstou = useCallback(
    (p: PontoGuia) =>
      [
        preencher(t.f_voceEsta, { nome: p.nome }),
        p.esquerda ? preencher(t.f_esquerda, { texto: p.esquerda }) : '',
        p.direita ? preencher(t.f_direita, { texto: p.direita }) : '',
      ]
        .filter(Boolean)
        .join(' '),
    [t],
  );

  const textoDoAviso = useCallback(
    (a: Aviso, d: PontoGuia): string => {
      switch (a.tipo) {
        case 'faltam':
          return preencher(t.f_faltam, { passos: a.passos, nome: d.nome });
        case 'chegando':
          return preencher(t.f_chegando, { passos: a.passos, nome: d.nome });
        case 'chegou':
          return [
            preencher(a.porCamera ? t.f_chegouCamera : t.f_chegouPassos, { nome: d.nome }),
            a.porCamera && d.esquerda ? preencher(t.f_esquerda, { texto: d.esquerda }) : '',
            a.porCamera && d.direita ? preencher(t.f_direita, { texto: d.direita }) : '',
          ]
            .filter(Boolean)
            .join(' ');
        case 'perigo':
          return preencher(t.f_perigo, { texto: porId.get(a.pontoId)?.perigoTexto ?? '', passos: a.passos });
      }
    },
    [t, porId],
  );

  const processarAvisos = useCallback(() => {
    const d = destinoRef.current;
    if (!d) return;
    for (const a of avisos(posRef.current, d, pontos, avisadosRef.current)) {
      if (a.tipo === 'perigo') tocar('alerta');
      if (a.tipo === 'chegou') tocar('ding');
      anunciar(textoDoAviso(a, d), a.tipo === 'perigo');
    }
  }, [anunciar, pontos, textoDoAviso]);

  const textosPassos = useMemo(
    () => ({ semMovimento: t.f_semMovimento, movimentoNegado: t.f_movimentoNegado }),
    [t],
  );
  const passos = usePassos(() => {
    setPassosDados((n) => n + 1);
    const d = destinoRef.current;
    posRef.current = darPasso(posRef.current, d ? d.passos : null, limites);
    setPosicao(posRef.current.passos);
    processarAvisos();
  }, textosPassos);

  // Análise contínua da imagem enquanto o guia está ativo.
  useEffect(() => {
    if (!ativo) return;
    const id = window.setInterval(() => {
      const v = videoRef.current;
      const c = canvasRef.current;
      const emb = embRef.current;
      const base = baseRef.current;
      if (!v || !c || !emb || !base || v.readyState < 2 || v.paused) return;
      c.width = 224;
      c.height = Math.round((224 * v.videoHeight) / Math.max(1, v.videoWidth)) || 224;
      c.getContext('2d')?.drawImage(v, 0, 0, c.width, c.height);
      const vetor = embedQuadro(emb, c);
      if (!vetor) return;
      const p = palpitar(base, vetor);
      setDiagnostico(`${p.rotulo ?? '—'} · ${p.semelhanca.toFixed(2)} · ${Math.round(p.maioria * 100)}%`);
      const confirmado = confirmar.current(p);
      if (!confirmado || confirmado === '-' || confirmado === posRef.current.ultimoPonto) return;
      const ponto = porId.get(confirmado);
      if (!ponto) return;
      if (ponto.trecho) {
        // Corredor: avisa uma vez, mas não "encaixa" a posição (é um trecho longo).
        if (trechoRef.current !== ponto.id) {
          trechoRef.current = ponto.id;
          anunciar(preencher(t.f_trecho, { nome: ponto.nome.toLowerCase() }));
        }
        return;
      }
      trechoRef.current = null;
      posRef.current = confirmarPonto(ponto);
      setPontoAtual(ponto);
      setPosicao(ponto.passos);
      tocar('ding');
      anunciar(textoOndeEstou(ponto));
      processarAvisos();
    }, INTERVALO_ANALISE_MS);
    return () => window.clearInterval(id);
  }, [ativo, anunciar, porId, processarAvisos, t, textoOndeEstou]);

  async function preparar(): Promise<boolean> {
    liberarAudio();
    setStatus(t.f_preparando);
    const b = await obterBase();
    if (!b) {
      anunciar(t.f_semBase);
      return false;
    }
    baseRef.current = carregarBase(b.base);
    setOrigemBase(`${b.base.percurso} · ${b.base.itens.length} · ${b.origem}`);
    try {
      embRef.current = await carregarEmbedder();
    } catch {
      anunciar(t.f_semModelo);
      return false;
    }
    confirmar.current = criarConfirmador();
    posRef.current = estadoInicial();
    avisadosRef.current = new Set();
    trechoRef.current = null;
    return true;
  }

  async function comecarCamera() {
    if (!(await preparar())) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setAtivo(true);
      anunciar(t.f_cameraLigada);
      void passos.ligar();
    } catch {
      anunciar(t.f_semCamera);
    }
  }

  async function comecarVideo(arquivo: File) {
    if (!(await preparar())) return;
    const v = videoRef.current!;
    v.srcObject = null;
    v.src = URL.createObjectURL(arquivo);
    await v.play();
    setAtivo(true);
    anunciar(t.f_demo);
  }

  function parar() {
    const v = videoRef.current;
    if (v?.srcObject instanceof MediaStream) v.srcObject.getTracks().forEach((tr) => tr.stop());
    if (v) {
      v.pause();
      v.removeAttribute('src');
      v.srcObject = null;
    }
    passos.desligar();
    setAtivo(false);
    anunciar(t.f_parado);
  }

  function escolherDestino(p: PontoGuia) {
    setDestino(p);
    destinoRef.current = p;
    avisadosRef.current = new Set();
    if (posRef.current.ultimoPonto) {
      posRef.current = ancorarNaPosicaoAtual(posRef.current);
      const distancia = Math.round(Math.abs(p.passos - posRef.current.passos));
      anunciar(preencher(t.f_destino, { nome: p.nome, passos: distancia }));
      processarAvisos();
    } else {
      anunciar(preencher(t.f_destinoSemPosicao, { nome: p.nome }));
    }
  }

  const restante =
    destino && posicao !== null && pontoAtual ? Math.round(Math.abs(destino.passos - posicao)) : null;

  return (
    <div className="space-y-4">
      <p className="text-texto-suave">
        {t.percurso}: {nomePercurso}
      </p>

      <p className="rounded-xl border-2 border-borda bg-superficie p-4 text-lg font-bold">{status}</p>

      {!ativo ? (
        <div className="grid gap-3">
          <button
            type="button"
            onClick={comecarCamera}
            className="alvo min-h-24 rounded-xl bg-primaria p-4 text-xl font-bold text-primaria-texto"
          >
            <span aria-hidden="true">📷 </span>
            {t.comecar}
          </button>
          <label className="alvo flex cursor-pointer items-center justify-center rounded-xl border-2 border-borda p-3 font-bold">
            <span aria-hidden="true">🎬&nbsp;</span>
            {t.demo}
            <input
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void comecarVideo(f);
              }}
            />
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => anunciar(pontoAtual ? textoOndeEstou(pontoAtual) : t.f_naoSei)}
            className="alvo rounded-xl bg-primaria p-3 font-bold text-primaria-texto"
          >
            <span aria-hidden="true">📍 </span>
            {t.ondeEstou}
          </button>
          <button type="button" onClick={parar} className="alvo rounded-xl border-2 border-perigo p-3 font-bold">
            <span aria-hidden="true">⏹ </span>
            {t.parar}
          </button>
        </div>
      )}

      <section aria-labelledby="guia-destino" className="rounded-xl border border-borda p-4">
        <h2 id="guia-destino" className="mb-3 text-xl font-bold">
          {t.paraOnde}
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {pontos
            .filter((p) => p.destino)
            .map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={destino?.id === p.id}
                  onClick={() => escolherDestino(p)}
                  className={`alvo w-full rounded-xl border-2 p-3 font-bold ${
                    destino?.id === p.id ? 'border-primaria bg-primaria text-primaria-texto' : 'border-borda'
                  }`}
                >
                  {p.nome}
                </button>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="guia-situacao" className="rounded-xl border border-borda p-4">
        <h2 id="guia-situacao" className="mb-2 text-xl font-bold">
          {t.situacao}
        </h2>
        <dl className="grid grid-cols-2 gap-1">
          <dt>{t.pontoReconhecido}</dt>
          <dd className="font-bold">{pontoAtual?.nome ?? '—'}</dd>
          <dt>{t.destino}</dt>
          <dd className="font-bold">{destino?.nome ?? '—'}</dd>
          <dt>{t.faltam}</dt>
          <dd className="font-bold">{restante !== null ? `${restante} ${t.unidade}` : '—'}</dd>
          <dt>{t.passos}</dt>
          <dd className="font-bold">
            {passosDados}
            {passos.ativo ? '' : ` (${t.contadorDesligado})`}
          </dd>
        </dl>
        {passos.erro && <p className="mt-2 text-texto-suave">{passos.erro}</p>}
      </section>

      <video
        ref={videoRef}
        playsInline
        muted
        aria-label={t.imagemCamera}
        className={`w-full rounded-xl bg-black ${ativo ? 'block' : 'hidden'}`}
      />
      <canvas ref={canvasRef} hidden />

      <details className="rounded-xl border border-borda p-4 text-sm">
        <summary className="alvo cursor-pointer font-bold">{t.tecnico}</summary>
        <p className="mt-2">
          {t.base}: {origemBase ?? '—'}
        </p>
        <p data-diagnostico>{diagnostico || t.semAnalise}</p>
        <p className="mt-2">{t.aviso}</p>
      </details>
    </div>
  );
}
