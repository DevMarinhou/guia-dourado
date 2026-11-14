'use client';

// Farol: guia por câmera para pessoas cegas ou com baixa visão.
// Câmera (ou vídeo de demonstração) → reconhece o ponto → fala onde a pessoa está.
// Com destino: câmera + passos → "faltam N passos", "em N passos, X à esquerda", "ficou para trás",
// "está chegando", "você chegou", "passou do destino", "sentido contrário", perigos.
// No vídeo de demonstração não há acelerômetro: os passos são simulados pelo tempo do vídeo.
// Tudo roda no aparelho; nada é gravado. Textos chegam do servidor (3 idiomas) por props.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ImageEmbedder } from '@mediapipe/tasks-vision';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar } from '@/adaptadores/voz/web-speech';
import {
  avisos,
  confirmarPonto,
  darPasso,
  estadoInicial,
  indoAoContrario,
  iniciarRota,
  AVISO_A_CADA,
  RAIO_PASSOU,
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
/** Ritmo de caminhada do vídeo do piloto (≈ 70 passos em ~93 s), usado só na demonstração. */
const PASSOS_POR_SEGUNDO_DEMO = 0.75;
/** Margem além do primeiro/último ponto, para conseguir perceber que a pessoa passou deles. */
const MARGEM_PERCURSO = RAIO_PASSOU + 3;

/** Ponto já traduzido para o idioma da página. */
export type PontoGuia = PontoPercurso & { nome: string; esquerda?: string; direita?: string; perigoTexto?: string };

export type TextosGuia = Record<
  | 'percurso' | 'comecar' | 'demo' | 'ondeEstou' | 'parar' | 'paraOnde' | 'situacao' | 'pontoReconhecido'
  | 'destino' | 'faltam' | 'passos' | 'contadorDesligado' | 'unidade' | 'tecnico' | 'base' | 'semAnalise'
  | 'aviso' | 'imagemCamera' | 'f_inicio' | 'f_preparando' | 'f_semBase' | 'f_semModelo' | 'f_cameraLigada'
  | 'f_semCamera' | 'f_demo' | 'f_parado' | 'f_voceEsta' | 'f_esquerda' | 'f_direita' | 'f_trecho' | 'f_naoSei'
  | 'f_destino' | 'f_destinoSemPosicao' | 'f_faltam' | 'f_chegando' | 'f_chegouCamera' | 'f_chegouPassos'
  | 'f_perigo' | 'f_semMovimento' | 'f_movimentoNegado' | 'f_proximo' | 'f_proximoEsquerda' | 'f_proximoDireita'
  | 'f_ficouPraTras' | 'f_passou' | 'f_contramao' | 'f_vireEsquerda' | 'f_vireDireita' | 'simulados',
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
  /** demonstração: depois de chegar, a pessoa para (não simula mais passos até a câmera ver outro ponto) */
  const paradoRef = useRef(false);
  /** demonstração: o vídeo nunca dá meia-volta, então depois de "passou" só a câmera guia */
  const voltandoRef = useRef(false);

  const [ativo, setAtivo] = useState(false);
  const [status, setStatus] = useState(t.f_inicio);
  const [origemBase, setOrigemBase] = useState<string | null>(null);
  const [pontoAtual, setPontoAtual] = useState<PontoGuia | null>(null);
  const [destino, setDestino] = useState<PontoGuia | null>(null);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [passosDados, setPassosDados] = useState(0);
  const [demo, setDemo] = useState(false);
  const [diagnostico, setDiagnostico] = useState('');

  const porId = useMemo(() => new Map(pontos.map((p) => [p.id, p])), [pontos]);
  const limites = useMemo(() => {
    const fixos = pontos.filter((p) => !p.trecho).map((p) => p.passos);
    return [Math.min(...fixos) - MARGEM_PERCURSO, Math.max(...fixos) + MARGEM_PERCURSO] as const;
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
            d.esquerda ? preencher(t.f_vireEsquerda, { texto: d.esquerda }) : '',
            d.direita ? preencher(t.f_vireDireita, { texto: d.direita }) : '',
          ]
            .filter(Boolean)
            .join(' ');
        case 'passou':
          return preencher(t.f_passou, { nome: d.nome, passos: a.passos });
        case 'proximo': {
          const p = porId.get(a.pontoId);
          const modelo = p?.esquerda ? t.f_proximoEsquerda : p?.direita ? t.f_proximoDireita : t.f_proximo;
          return preencher(modelo, { passos: a.passos, nome: p?.nome ?? '' });
        }
        case 'ficouPraTras':
          return preencher(t.f_ficouPraTras, { nome: porId.get(a.pontoId)?.nome ?? '' });
        case 'perigo':
          return preencher(t.f_perigo, { texto: porId.get(a.pontoId)?.perigoTexto ?? '', passos: a.passos });
      }
    },
    [t, porId],
  );

  // Junta tudo numa fala só: a voz nova cancela a anterior, então avisos separados se cortariam.
  const processarAvisos = useCallback(
    (antes: string[] = []) => {
      const d = destinoRef.current;
      const falas = [...antes];
      let urgente = false;
      if (d) {
        for (const a of avisos(posRef.current, d, pontos, avisadosRef.current)) {
          if (a.tipo === 'perigo' || a.tipo === 'passou') {
            tocar('alerta');
            urgente = true;
          }
          if (a.tipo === 'chegou') {
            tocar('ding');
            if (a.porCamera) paradoRef.current = true;
          }
          falas.push(textoDoAviso(a, d));
          if (a.tipo === 'passou') {
            // Rota de volta até o destino, começando do zero.
            posRef.current = iniciarRota(posRef.current, d.passos);
            avisadosRef.current = new Set(['chegando', 'passou']);
            voltandoRef.current = true;
          }
        }
      }
      if (falas.length) anunciar(falas.join(' '), urgente);
    },
    [anunciar, pontos, textoDoAviso],
  );

  const textosPassos = useMemo(
    () => ({ semMovimento: t.f_semMovimento, movimentoNegado: t.f_movimentoNegado }),
    [t],
  );
  const aoPassar = useCallback(() => {
    setPassosDados((n) => n + 1);
    posRef.current = darPasso(posRef.current, limites);
    setPosicao(posRef.current.passos);
    processarAvisos();
  }, [limites, processarAvisos]);
  const passos = usePassos(aoPassar, textosPassos);

  // Demonstração: sem acelerômetro, um passo a cada 1/0,75 s de vídeo tocando (respeita pausa e velocidade).
  useEffect(() => {
    if (!ativo || !demo) return;
    let ultimoTempo = videoRef.current?.currentTime ?? 0;
    let acumulado = 0;
    const id = window.setInterval(() => {
      const v = videoRef.current;
      if (!v) return;
      const delta = v.currentTime - ultimoTempo;
      ultimoTempo = v.currentTime;
      if (delta <= 0 || delta > 2 || paradoRef.current || voltandoRef.current) return; // pausado, pulou, chegou ou passou
      acumulado += delta * PASSOS_POR_SEGUNDO_DEMO;
      while (acumulado >= 1) {
        acumulado -= 1;
        aoPassar();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [ativo, demo, aoPassar]);

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
      if (!confirmado || confirmado === '-') return;
      const ponto = porId.get(confirmado);
      if (!ponto) return;
      if (confirmado === posRef.current.ultimoPonto) {
        // Ainda vendo o mesmo ponto: corrige a deriva dos passos, sem falar de novo.
        if (!ponto.trecho && Math.abs(posRef.current.passos - ponto.passos) > RAIO_PASSOU) {
          posRef.current = confirmarPonto(ponto, posRef.current);
          setPosicao(ponto.passos);
        }
        return;
      }
      if (ponto.trecho) {
        // Corredor: avisa uma vez, mas não "encaixa" a posição (é um trecho longo).
        if (trechoRef.current !== ponto.id) {
          trechoRef.current = ponto.id;
          anunciar(preencher(t.f_trecho, { nome: ponto.nome.toLowerCase() }));
        }
        return;
      }
      trechoRef.current = null;
      paradoRef.current = false;
      const anterior = posRef.current;
      const d = destinoRef.current;
      posRef.current = confirmarPonto(ponto, anterior);
      if (!anterior.ultimoPonto && d) posRef.current = iniciarRota(posRef.current, d.passos);
      setPontoAtual(ponto);
      setPosicao(ponto.passos);
      tocar('ding');
      const falas = [textoOndeEstou(ponto)];
      const passouDoDestino =
        d && (ponto.passos - d.passos) * posRef.current.sentidoRota >= RAIO_PASSOU;
      if (d && anterior.ultimoPonto && !passouDoDestino && indoAoContrario(anterior.passos, ponto.passos, d.passos)) {
        posRef.current = iniciarRota(posRef.current, d.passos);
        const distancia = Math.round(Math.abs(d.passos - ponto.passos));
        avisadosRef.current = new Set([`faltam:${Math.ceil(distancia / AVISO_A_CADA) * AVISO_A_CADA}`]);
        tocar('alerta');
        falas.push(preencher(t.f_contramao, { nome: d.nome, passos: distancia }));
      }
      processarAvisos(falas);
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
    setPassosDados(0);
    paradoRef.current = false;
    voltandoRef.current = false;
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
      setDemo(false);
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
    setDemo(true);
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
    paradoRef.current = false;
    voltandoRef.current = false;
    avisadosRef.current = new Set();
    if (posRef.current.ultimoPonto) {
      posRef.current = iniciarRota(posRef.current, p.passos);
      const distancia = Math.round(Math.abs(p.passos - posRef.current.passos));
      avisadosRef.current.add(`faltam:${Math.ceil(distancia / AVISO_A_CADA) * AVISO_A_CADA}`); // já dito acima
      processarAvisos([preencher(t.f_destino, { nome: p.nome, passos: distancia })]);
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
            {demo ? ` (${t.simulados})` : passos.ativo ? '' : ` (${t.contadorDesligado})`}
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
