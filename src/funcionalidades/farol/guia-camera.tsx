'use client';

// Guia Dourado · guia por câmera para pessoas cegas ou com baixa visão (só ao vivo).
// Abertura: um toque libera o som → o guia PERGUNTA por voz "voz ou tela?" e espera fala ou toque.
// Câmera → reconhece o ponto → fala onde a pessoa está. Com destino: câmera + passos →
// "faltam N passos", "em N passos, X à esquerda", "vire agora", "ficou para trás", "está chegando",
// "você chegou", "passou do destino", "sentido contrário", perigos.
// Tudo roda no aparelho; nada é gravado. Textos chegam do servidor (3 idiomas) por props.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ImageEmbedder } from '@mediapipe/tasks-vision';
import { useAnunciador } from '@/componentes/a11y/anunciador';
import { falar, pararFala } from '@/adaptadores/voz/web-speech';
import {
  avisos,
  confirmarPonto,
  darPasso,
  estadoInicial,
  indoAoContrario,
  iniciarRota,
  posicaoAoReconhecer,
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
import { contemAlguma, escutaDisponivel, normalizarFala, ouvirUmaVez } from './escuta';
import { BotaoTema } from './botao-tema';
import { velocidadeDaVoz } from './velocidade-voz';
import './guia.css';

/** Classes do guia.css (prefixo guia-). */
const estilos = {
  raiz: 'guia-raiz',
  vidro: 'guia-vidro',
  radar: 'guia-radar',
  anel: 'guia-anel',
  anelFixo: 'guia-anelFixo',
  seta: 'guia-seta',
  camera: 'guia-camera',
  abertura: 'guia-abertura',
  ouro: 'guia-ouro',
  bordaOuro: 'guia-bordaOuro',
} as const;

const INTERVALO_ANALISE_MS = 450;
/** Margem além do primeiro/último ponto, para conseguir perceber que a pessoa passou deles. */
const MARGEM_PERCURSO = RAIO_PASSOU + 3;

/** Ponto já traduzido para o idioma da página. */
export type PontoGuia = PontoPercurso & {
  nome: string;
  esquerda?: string;
  direita?: string;
  /** o que fica à frente de quem chega da entrada */
  frente?: string;
  perigoTexto?: string;
};

export type TextosGuia = Record<
  | 'percurso' | 'comecar' | 'ondeEstou' | 'parar' | 'paraOnde' | 'situacao' | 'pontoReconhecido'
  | 'destino' | 'faltam' | 'passos' | 'contadorDesligado' | 'unidade' | 'tecnico' | 'base' | 'semAnalise'
  | 'aviso' | 'imagemCamera' | 'f_inicio' | 'f_preparando' | 'f_semBase' | 'f_semModelo' | 'f_cameraLigada'
  | 'f_semCamera' | 'f_parado' | 'f_voceEsta' | 'f_esquerda' | 'f_direita' | 'f_trecho' | 'f_naoSei'
  | 'f_destino' | 'f_destinoSemPosicao' | 'f_faltam' | 'f_chegando' | 'f_chegouCamera' | 'f_chegouPassos'
  | 'f_perigo' | 'f_semMovimento' | 'f_movimentoNegado' | 'f_proximo' | 'f_proximoEsquerda' | 'f_proximoDireita'
  | 'f_ficouPraTras' | 'f_passou' | 'f_contramao' | 'f_vireEsquerda' | 'f_vireDireita'
  | 'f_frente' | 'f_virarEm' | 'f_virarEmFrente' | 'f_virarAgora' | 'ladoEsquerda' | 'ladoDireita'
  | 'aberturaToque' | 'aberturaSub' | 'f_pergunta' | 'f_naoEntendiModo' | 'modoVoz' | 'modoVozDesc' | 'modoTela'
  | 'modoTelaDesc' | 'ouvindo' | 'falarComando' | 'f_digaDestino' | 'f_naoEntendiDestino' | 'escurecer' | 'clarear'
  | 'silenciar' | 'ativarSom' | 'comecarDeNovo' | 'semDestino' | 'procurando' | 'sigaEmFrente' | 'chegou'
  | 'volte' | 'palavrasVoz' | 'palavrasTela' | 'palavrasOndeEstou' | 'palavrasParar' | 'numeros',
  string
>;

type Fase = 'abertura' | 'pergunta' | 'preparando' | 'ativo' | 'parado';
type Modo = 'voz' | 'tela';
type Direcao = 'procurando' | 'semDestino' | 'frente' | 'esquerda' | 'direita' | 'chegou' | 'voltar';

/**
 * Lados e "à frente" valem para quem anda da entrada para o fundo (sentido crescente).
 * Na volta, esquerda e direita trocam e o que estava "à frente" fica para trás.
 */
function ladosNoSentido(p: PontoGuia, sentido: number): { esquerda?: string; direita?: string; frente?: string } {
  if (sentido < 0) return { esquerda: p.direita, direita: p.esquerda };
  return { esquerda: p.esquerda, direita: p.direita, frente: p.frente };
}

function preencher(modelo: string, valores: Record<string, string | number>): string {
  return modelo.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ''));
}

function modoDaUrl(): Modo | null {
  const m = new URLSearchParams(window.location.search).get('modo');
  return m === 'voz' || m === 'tela' ? m : null;
}

/** Figura de cada tipo de ponto (o projeto usa emojis como ícones). */
function figuraDoPonto(id: string): string {
  if (id.startsWith('elevador')) return '🛗';
  if (id.startsWith('lixeira')) return '♻️';
  if (id.startsWith('sala')) return '🚪';
  if (id.startsWith('entrada')) return '🏛️';
  return '📍';
}

const ROTACAO: Partial<Record<Direcao, number>> = { frente: 0, esquerda: -90, direita: 90, voltar: 180 };

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
  const mudoRef = useRef(false);

  const [fase, setFase] = useState<Fase>('abertura');
  const [modo, setModo] = useState<Modo>('voz');
  const [ouvindo, setOuvindo] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [direcao, setDirecaoBruta] = useState<Direcao>('procurando');
  /** curva anunciada com antecedência: quantos passos faltam até ela (null = "vire agora" ou sem curva) */
  const [passosAteVirar, setPassosAteVirar] = useState<number | null>(null);
  const setDirecao = useCallback((d: Direcao, passosAte: number | null = null) => {
    setDirecaoBruta(d);
    setPassosAteVirar(passosAte);
  }, []);
  const [status, setStatus] = useState(t.f_inicio);
  const [origemBase, setOrigemBase] = useState<string | null>(null);
  const [pontoAtual, setPontoAtual] = useState<PontoGuia | null>(null);
  const [destino, setDestino] = useState<PontoGuia | null>(null);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [passosDados, setPassosDados] = useState(0);
  const [diagnostico, setDiagnostico] = useState('');

  const ativo = fase === 'ativo';
  const numeros = useMemo(() => t.numeros.split(','), [t.numeros]);
  const porId = useMemo(() => new Map(pontos.map((p) => [p.id, p])), [pontos]);
  const destinos = useMemo(() => pontos.filter((p) => p.destino), [pontos]);
  const limites = useMemo(() => {
    const fixos = pontos.filter((p) => !p.trecho).map((p) => p.passos);
    return [Math.min(...fixos) - MARGEM_PERCURSO, Math.max(...fixos) + MARGEM_PERCURSO] as const;
  }, [pontos]);

  const anunciar = useCallback(
    (texto: string, urgente = false, aoTerminar?: () => void) => {
      setStatus(texto);
      anunciarAria(texto, urgente ? 'assertive' : 'polite');
      if (mudoRef.current) aoTerminar?.();
      else falar(texto, idioma, aoTerminar, velocidadeDaVoz());
    },
    [anunciarAria, idioma],
  );

  const textoOndeEstou = useCallback(
    (p: PontoGuia) => {
      const l = ladosNoSentido(p, posRef.current.sentidoRota);
      return [
        preencher(t.f_voceEsta, { nome: p.nome }),
        l.frente ? preencher(t.f_frente, { texto: l.frente }) : '',
        l.esquerda ? preencher(t.f_esquerda, { texto: l.esquerda }) : '',
        l.direita ? preencher(t.f_direita, { texto: l.direita }) : '',
      ]
        .filter(Boolean)
        .join(' ');
    },
    [t],
  );

  const textoDoAviso = useCallback(
    (a: Aviso, d: PontoGuia): string => {
      switch (a.tipo) {
        case 'faltam':
          return preencher(t.f_faltam, { passos: a.passos, nome: d.nome });
        case 'chegando':
          return preencher(t.f_chegando, { passos: a.passos, nome: d.nome });
        case 'chegou': {
          const l = ladosNoSentido(d, posRef.current.sentidoRota);
          return [
            preencher(a.porCamera ? t.f_chegouCamera : t.f_chegouPassos, { nome: d.nome }),
            l.esquerda ? preencher(t.f_vireEsquerda, { texto: l.esquerda }) : '',
            l.direita ? preencher(t.f_vireDireita, { texto: l.direita }) : '',
          ]
            .filter(Boolean)
            .join(' ');
        }
        case 'passou':
          return preencher(t.f_passou, { nome: d.nome, passos: a.passos });
        case 'proximo': {
          const p = porId.get(a.pontoId);
          const l = p ? ladosNoSentido(p, posRef.current.sentidoRota) : {};
          const modelo = l.esquerda ? t.f_proximoEsquerda : l.direita ? t.f_proximoDireita : t.f_proximo;
          return preencher(modelo, { passos: a.passos, nome: p?.nome ?? '' });
        }
        case 'virar': {
          const p = porId.get(a.pontoId);
          const lado = a.lado === 'esquerda' ? t.ladoEsquerda : t.ladoDireita;
          if (a.agora) return preencher(t.f_virarAgora, { lado });
          // "à frente" só vale para quem chega pelo lado da entrada (sentido crescente).
          const deFrente = p?.frente && a.lado === p.virar;
          return preencher(deFrente ? t.f_virarEmFrente : t.f_virarEm, {
            passos: a.passos,
            lado,
            texto: p?.frente ?? '',
          });
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
          if (a.tipo === 'virar') {
            setDirecao(a.lado, a.agora ? null : a.passos);
            if (a.agora) tocar('bipe', a.lado === 'esquerda' ? -1 : 1);
          } else if (a.tipo === 'chegou') {
            tocar('ding');
            setDirecao('chegou');
          } else if (a.tipo === 'passou') {
            setDirecao('voltar');
          } else if (a.tipo !== 'perigo') {
            setDirecao('frente');
          }
          falas.push(textoDoAviso(a, d));
          if (a.tipo === 'passou') {
            // Rota de volta até o destino, começando do zero.
            posRef.current = iniciarRota(posRef.current, d.passos);
            avisadosRef.current = new Set(['chegando', 'passou']);
          }
        }
      }
      if (falas.length) anunciar(falas.join(' '), urgente);
    },
    [anunciar, pontos, textoDoAviso, setDirecao],
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
        // Vale todo o trecho de onde o ponto começa a ser visto até ele (pontos vistos de longe).
        const alvo = posicaoAoReconhecer(ponto, posRef.current.sentidoRota);
        const minimo = Math.min(alvo, ponto.passos) - RAIO_PASSOU;
        const maximo = Math.max(alvo, ponto.passos) + RAIO_PASSOU;
        const pos = posRef.current.passos;
        if (!ponto.trecho && (pos < minimo || pos > maximo)) {
          // Antes do trecho: encaixa onde o ponto começa a ser visto. Depois: no máximo até o próprio ponto.
          const encaixe = confirmarPonto(ponto, posRef.current);
          posRef.current =
            pos > maximo ? { ...encaixe, passos: ponto.passos, passosDoPonto: ponto.passos } : encaixe;
          setPosicao(posRef.current.passos);
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
      const anterior = posRef.current;
      const d = destinoRef.current;
      posRef.current = confirmarPonto(ponto, anterior);
      if (!anterior.ultimoPonto && d) posRef.current = iniciarRota(posRef.current, d.passos);
      setPontoAtual(ponto);
      setPosicao(posRef.current.passos);
      if (!d) setDirecao('semDestino');
      tocar('ding');
      const falas = [textoOndeEstou(ponto)];
      const passouDoDestino = d && (ponto.passos - d.passos) * posRef.current.sentidoRota >= RAIO_PASSOU;
      if (d && anterior.ultimoPonto && !passouDoDestino && indoAoContrario(anterior.passos, ponto.passos, d.passos)) {
        posRef.current = iniciarRota(posRef.current, d.passos);
        const distancia = Math.round(Math.abs(d.passos - ponto.passos));
        avisadosRef.current = new Set([`faltam:${Math.ceil(distancia / AVISO_A_CADA) * AVISO_A_CADA}`]);
        tocar('alerta');
        setDirecao('voltar');
        falas.push(preencher(t.f_contramao, { nome: d.nome, passos: distancia }));
      }
      processarAvisos(falas);
    }, INTERVALO_ANALISE_MS);
    return () => window.clearInterval(id);
  }, [ativo, anunciar, porId, processarAvisos, t, textoOndeEstou, setDirecao]);

  // Para a câmera e a fala se a pessoa sair da tela.
  useEffect(() => {
    const v = videoRef.current;
    return () => {
      if (v?.srcObject instanceof MediaStream) v.srcObject.getTracks().forEach((tr) => tr.stop());
      pararFala();
    };
  }, []);

  function escolherDestino(p: PontoGuia) {
    setDestino(p);
    destinoRef.current = p;
    avisadosRef.current = new Set();
    if (posRef.current.ultimoPonto) {
      posRef.current = iniciarRota(posRef.current, p.passos);
      const distancia = Math.round(Math.abs(p.passos - posRef.current.passos));
      avisadosRef.current.add(`faltam:${Math.ceil(distancia / AVISO_A_CADA) * AVISO_A_CADA}`); // já dito abaixo
      setDirecao(distancia <= 1 ? 'chegou' : 'frente');
      processarAvisos([preencher(t.f_destino, { nome: p.nome, passos: distancia })]);
    } else {
      setDirecao('procurando');
      anunciar(preencher(t.f_destinoSemPosicao, { nome: p.nome }));
    }
  }

  function ondeEstou() {
    anunciar(pontoAtual ? textoOndeEstou(pontoAtual) : t.f_naoSei);
  }

  /** Destino falado: "sala dois", "elevador 1", "lixeira"… */
  function destinoDaFala(fala: string): PontoGuia | null {
    let melhor: PontoGuia | null = null;
    let pontosMelhor = 0;
    for (const p of destinos) {
      const palavras = normalizarFala(`${p.nome} ${p.id.replace(/-/g, ' ')}`, numeros).split(' ');
      const acertos = palavras.filter((w) => w.length > 0 && ` ${fala} `.includes(` ${w} `)).length;
      // O número tem de bater ("sala 2" ≠ "sala 1").
      const numero = p.id.match(/\d+/)?.[0];
      if (numero && !` ${fala} `.includes(` ${numero} `)) continue;
      if (acertos > pontosMelhor) {
        melhor = p;
        pontosMelhor = acertos;
      }
    }
    return melhor;
  }

  async function ouvirComando(tentativa = 0) {
    setOuvindo(true);
    const bruto = await ouvirUmaVez(idioma);
    setOuvindo(false);
    if (!bruto) {
      if (tentativa === 0 && modo === 'voz') anunciar(t.f_naoEntendiDestino, false, () => void ouvirComando(1));
      return;
    }
    const fala = normalizarFala(bruto, numeros);
    if (contemAlguma(fala, t.palavrasParar, numeros)) return parar();
    if (contemAlguma(fala, t.palavrasOndeEstou, numeros)) return ondeEstou();
    const d = destinoDaFala(fala);
    if (d) return escolherDestino(d);
    if (tentativa === 0) anunciar(t.f_naoEntendiDestino, false, () => void ouvirComando(1));
  }

  async function preparar(): Promise<boolean> {
    setFase('preparando');
    setStatus(t.f_preparando);
    const b = await obterBase();
    if (!b) {
      anunciar(t.f_semBase);
      setFase('parado');
      return false;
    }
    baseRef.current = carregarBase(b.base);
    setOrigemBase(`${b.base.percurso} · ${b.base.itens.length} · ${b.origem}`);
    try {
      embRef.current = await carregarEmbedder();
    } catch {
      anunciar(t.f_semModelo);
      setFase('parado');
      return false;
    }
    confirmar.current = criarConfirmador();
    setPassosDados(0);
    posRef.current = estadoInicial();
    avisadosRef.current = new Set();
    trechoRef.current = null;
    setPontoAtual(null);
    setPosicao(null);
    setDirecao('procurando');
    return true;
  }

  async function comecarCamera(m: Modo) {
    if (!(await preparar())) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setFase('ativo');
      void passos.ligar();
      if (m === 'voz') {
        // Modo voz: já pergunta o destino e escuta.
        anunciar(`${t.f_cameraLigada} ${t.f_digaDestino}`, false, () => {
          if (escutaDisponivel()) void ouvirComando();
        });
      } else {
        anunciar(t.f_cameraLigada);
      }
    } catch {
      anunciar(t.f_semCamera);
      setFase('parado');
    }
  }

  function escolherModo(m: Modo) {
    setModo(m);
    void comecarCamera(m);
  }

  // Veio da página inicial já com o modo escolhido (?modo=voz|tela)? Se a página já recebeu um toque,
  // o som está liberado e o guia começa sozinho; senão, o toque na abertura começa direto nesse modo.
  useEffect(() => {
    const m = modoDaUrl();
    const jaTocou = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
      ?.hasBeenActive;
    if (!m || !jaTocou) return;
    const id = window.setTimeout(() => {
      liberarAudio();
      escolherModo(m);
    }, 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao abrir a tela
  }, []);

  /** Abertura: o toque libera o som (exigência dos navegadores) e o guia pergunta como se comunicar. */
  function abrir() {
    liberarAudio();
    const m = modoDaUrl();
    if (m) return escolherModo(m);
    setFase('pergunta');
    anunciar(t.f_pergunta, false, async () => {
      if (!escutaDisponivel()) return;
      setOuvindo(true);
      const bruto = await ouvirUmaVez(idioma);
      setOuvindo(false);
      if (!bruto) return; // sem fala: os botões continuam na tela
      const fala = normalizarFala(bruto, numeros);
      if (contemAlguma(fala, t.palavrasTela, numeros)) escolherModo('tela');
      else if (contemAlguma(fala, t.palavrasVoz, numeros)) escolherModo('voz');
      else anunciar(t.f_naoEntendiModo);
    });
  }

  function parar() {
    const v = videoRef.current;
    if (v?.srcObject instanceof MediaStream) v.srcObject.getTracks().forEach((tr) => tr.stop());
    if (v) {
      v.pause();
      v.srcObject = null;
    }
    passos.desligar();
    setFase('parado');
    anunciar(t.f_parado);
  }

  function alternarSom() {
    const novo = !mudo;
    mudoRef.current = novo;
    setMudo(novo);
    if (novo) pararFala();
  }

  const restante =
    destino && posicao !== null && pontoAtual ? Math.round(Math.abs(destino.passos - posicao)) : null;
  const distanciaAte = (p: PontoGuia) =>
    posicao !== null && pontoAtual ? Math.round(Math.abs(p.passos - posicao)) : null;
  const rotuloDirecao: Record<Direcao, string> = {
    procurando: t.procurando,
    semDestino: t.semDestino,
    frente: t.sigaEmFrente,
    esquerda:
      passosAteVirar !== null
        ? preencher(t.f_virarEm, { passos: passosAteVirar, lado: t.ladoEsquerda })
        : preencher(t.f_virarAgora, { lado: t.ladoEsquerda }),
    direita:
      passosAteVirar !== null
        ? preencher(t.f_virarEm, { passos: passosAteVirar, lado: t.ladoDireita })
        : preencher(t.f_virarAgora, { lado: t.ladoDireita }),
    chegou: t.chegou,
    voltar: t.volte,
  };

  // ───────────────────────── telas ─────────────────────────

  if (fase === 'abertura') {
    return (
      <div className={`${estilos.raiz} space-y-4`}>
        <button
          type="button"
          onClick={abrir}
          className={`${estilos.abertura} ${estilos.vidro} alvo flex w-full flex-col items-center justify-center gap-6 rounded-3xl p-6 text-center`}
        >
          <span className={estilos.radar} aria-hidden="true">
            <span className={estilos.anel} />
            <span className={estilos.anel} />
            <span className={estilos.anel} />
            <span className={estilos.anelFixo} />
            <span className="text-6xl">👆</span>
          </span>
          <span className="text-2xl font-bold">{t.aberturaToque}</span>
          <span className="text-lg text-texto-suave">{t.aberturaSub}</span>
        </button>
        <div className="flex justify-end">
          <BotaoTema escurecer={t.escurecer} clarear={t.clarear} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${estilos.raiz} space-y-5`}>
      {/* barra: percurso + tema + som */}
      <div className="flex flex-wrap items-center gap-2">
        <p className={`${estilos.vidro} mr-auto rounded-full px-4 py-2 text-sm`}>
          <span aria-hidden="true">🧭 </span>
          {t.percurso}: <strong>{nomePercurso}</strong>
        </p>
        <BotaoTema escurecer={t.escurecer} clarear={t.clarear} />
        <button
          type="button"
          onClick={alternarSom}
          className="alvo inline-flex items-center gap-2 rounded-full border border-borda bg-superficie px-4 font-bold"
        >
          <span aria-hidden="true">{mudo ? '🔊' : '🔇'}</span>
          {mudo ? t.ativarSom : t.silenciar}
        </button>
      </div>

      {fase === 'pergunta' && (
        <section aria-labelledby="guia-pergunta" className="space-y-4">
          <h2 id="guia-pergunta" className="text-center text-2xl font-bold">
            {status}
          </h2>
          {ouvindo && (
            <p className={`${estilos.ouro} text-center text-lg font-bold`}>
              <span aria-hidden="true">🎙️ </span>
              {t.ouvindo}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ['voz', '🔊', t.modoVoz, t.modoVozDesc],
                ['tela', '👁️', t.modoTela, t.modoTelaDesc],
              ] as const
            ).map(([m, figura, nome, desc]) => (
              <button
                key={m}
                type="button"
                onClick={() => escolherModo(m)}
                className={`${estilos.vidro} alvo flex min-h-48 flex-col items-center justify-center gap-2 rounded-3xl p-4 text-center`}
              >
                <span aria-hidden="true" className="text-6xl">
                  {figura}
                </span>
                <span className="text-2xl font-bold">{nome}</span>
                <span className="text-texto-suave">{desc}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {(fase === 'preparando' || fase === 'ativo' || fase === 'parado') && (
        <>
          {/* radar: direção grande + quanto falta */}
          <section
            aria-labelledby="guia-situacao"
            className={`${estilos.vidro} flex flex-col items-center gap-3 rounded-3xl p-5 text-center`}
          >
            <h2 id="guia-situacao" className="sr-only">
              {t.situacao}
            </h2>
            <div className={estilos.radar} aria-hidden="true">
              {ativo && direcao === 'procurando' && (
                <>
                  <span className={estilos.anel} />
                  <span className={estilos.anel} />
                  <span className={estilos.anel} />
                </>
              )}
              <span className={estilos.anelFixo} />
              {ROTACAO[direcao] !== undefined ? (
                <svg
                  viewBox="0 0 100 100"
                  className={`${estilos.seta} h-2/5 w-2/5`}
                  style={{ transform: `rotate(${ROTACAO[direcao]}deg)` }}
                >
                  <path d="M50 6 L88 56 L62 56 L62 94 L38 94 L38 56 L12 56 Z" fill="currentColor" />
                </svg>
              ) : (
                <span className="text-7xl">
                  {direcao === 'chegou' ? '✅' : direcao === 'semDestino' ? '📍' : '🔎'}
                </span>
              )}
            </div>
            <p className={`${estilos.ouro} text-xl font-bold`}>{rotuloDirecao[direcao]}</p>
            {restante !== null && destino && (
              <p className="text-texto-suave">
                <span className="text-5xl font-bold text-texto">{restante}</span> {t.unidade} ·{' '}
                {figuraDoPonto(destino.id)} {destino.nome}
              </p>
            )}
            {/* Última fala, em texto grande (a mesma frase vai para o leitor de tela pelo anunciador). */}
            <p className="w-full rounded-2xl border border-borda bg-superficie p-4 text-lg font-bold">{status}</p>
            {ouvindo && (
              <p className={`${estilos.ouro} font-bold`}>
                <span aria-hidden="true">🎙️ </span>
                {t.ouvindo}
              </p>
            )}
          </section>

          {/* ações principais */}
          {fase === 'parado' ? (
            <button
              type="button"
              onClick={() => void comecarCamera(modo)}
              className={`${estilos.bordaOuro} alvo w-full rounded-2xl border-4 bg-primaria p-5 text-xl font-bold text-primaria-texto`}
            >
              <span aria-hidden="true">📷 </span>
              {t.comecarDeNovo}
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={ondeEstou}
                disabled={!ativo}
                className="alvo flex flex-col items-center gap-1 rounded-2xl bg-primaria p-3 font-bold text-primaria-texto disabled:opacity-60"
              >
                <span aria-hidden="true" className="text-3xl">
                  📍
                </span>
                {t.ondeEstou}
              </button>
              <button
                type="button"
                onClick={() => void ouvirComando()}
                disabled={!ativo || ouvindo}
                className={`${estilos.bordaOuro} alvo flex flex-col items-center gap-1 rounded-2xl border-2 bg-superficie p-3 font-bold disabled:opacity-60`}
              >
                <span aria-hidden="true" className="text-3xl">
                  🎙️
                </span>
                {t.falarComando}
              </button>
              <button
                type="button"
                onClick={parar}
                disabled={!ativo}
                className="alvo flex flex-col items-center gap-1 rounded-2xl border-2 border-perigo bg-superficie p-3 font-bold disabled:opacity-60"
              >
                <span aria-hidden="true" className="text-3xl">
                  ⏹️
                </span>
                {t.parar}
              </button>
            </div>
          )}

          {/* destinos com figuras */}
          <section aria-labelledby="guia-destino">
            <h2 id="guia-destino" className="mb-3 text-xl font-bold">
              {t.paraOnde}
            </h2>
            <ul className="grid grid-cols-2 gap-3">
              {destinos.map((p) => {
                const escolhido = destino?.id === p.id;
                const dist = distanciaAte(p);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={escolhido}
                      onClick={() => escolherDestino(p)}
                      className={`alvo flex w-full flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center font-bold ${
                        escolhido ? `${estilos.bordaOuro} bg-primaria text-primaria-texto` : `border-borda ${estilos.vidro}`
                      }`}
                    >
                      <span aria-hidden="true" className="text-4xl">
                        {figuraDoPonto(p.id)}
                      </span>
                      <span>{p.nome}</span>
                      {dist !== null && (
                        <span className="text-sm font-normal">
                          {dist} {t.unidade}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      {/* câmera (só aparece ligada) */}
      <div className={`${estilos.camera} ${ativo ? 'block' : 'hidden'} rounded-2xl`}>
        <video
          ref={videoRef}
          playsInline
          muted
          aria-label={t.imagemCamera}
          className="max-h-48 w-full rounded-2xl bg-black object-cover"
        />
      </div>
      <canvas ref={canvasRef} hidden />

      <details className="rounded-2xl border border-borda p-4 text-sm">
        <summary className="alvo cursor-pointer font-bold">{t.tecnico}</summary>
        <dl className="mt-2 grid grid-cols-2 gap-1">
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
        <p className="mt-2">
          {t.base}: {origemBase ?? '—'}
        </p>
        <p data-diagnostico>{diagnostico || t.semAnalise}</p>
        <p className="mt-2">{t.aviso}</p>
      </details>
    </div>
  );
}
