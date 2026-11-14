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
import { criarEscutador, preCarregarEscuta, type Escutador } from './agente-voz';
import { interpretar, type DestinoFalavel, type VocabularioIntencao } from '@/dominio/farol/intencao';
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
  | 'aberturaToque' | 'aberturaSub' | 'ouvindo' | 'f_digaDestino' | 'f_naoEntendiDestino' | 'escurecer' | 'clarear'
  | 'silenciar' | 'ativarSom' | 'comecarDeNovo' | 'semDestino' | 'procurando' | 'sigaEmFrente' | 'chegou'
  | 'volte' | 'palavrasOndeEstou' | 'palavrasParar' | 'numeros' | 'ordinais' | 'palavrasQuantoFalta'
  | 'palavrasRepetir' | 'apelidos' | 'marca' | 'subtituloMarca' | 'vamosJuntos' | 'paraOndeHoje' | 'falando'
  | 'carregandoVoz' | 'toqueRepetir' | 'voceDisse' | 'f_faltamSo' | 'f_semDestinoAinda' | 'f_semEscuta',
  string
>;

type Fase = 'abertura' | 'preparando' | 'ativo' | 'parado';
type EstadoVoz = 'parado' | 'ouvindo' | 'falando';
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

/** Veio da página inicial com ?modo=… (a pessoa já escolheu "voz" lá). */
function veioDaEntrada(): boolean {
  return new URLSearchParams(window.location.search).has('modo');
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
  const escutadorRef = useRef<Escutador | null>(null);
  const falaIdRef = useRef(0);
  const fimDaFalaRef = useRef(0);

  const [fase, setFase] = useState<Fase>('abertura');
  const [estadoVoz, setEstadoVoz] = useState<EstadoVoz>('parado');
  const [volume, setVolume] = useState(0);
  const [voceDisse, setVoceDisse] = useState<string | null>(null);
  const [semEscuta, setSemEscuta] = useState(false);
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
  const vocabulario = useMemo<VocabularioIntencao>(
    () => ({
      numeros: t.numeros.split(','),
      ordinais: t.ordinais.split(','),
      ondeEstou: t.palavrasOndeEstou.split(','),
      quantoFalta: t.palavrasQuantoFalta.split(','),
      repetir: t.palavrasRepetir.split(','),
      parar: t.palavrasParar.split(','),
    }),
    [t],
  );
  const porId = useMemo(() => new Map(pontos.map((p) => [p.id, p])), [pontos]);
  const destinos = useMemo(() => pontos.filter((p) => p.destino), [pontos]);
  /** "lixeira:lixo,reciclagem;entrada:saida,hall" → apelidos por ponto */
  const destinosFalaveis = useMemo<DestinoFalavel[]>(() => {
    const apelidos = new Map(
      t.apelidos.split(';').map((par) => {
        const [id = '', lista = ''] = par.split(':');
        return [id.trim(), lista.split(',').map((x) => x.trim())] as const;
      }),
    );
    return destinos.map((p) => ({ id: p.id, nome: p.nome, apelidos: apelidos.get(p.id) ?? [] }));
  }, [destinos, t.apelidos]);
  const limites = useMemo(() => {
    const fixos = pontos.filter((p) => !p.trecho).map((p) => p.passos);
    return [Math.min(...fixos) - MARGEM_PERCURSO, Math.max(...fixos) + MARGEM_PERCURSO] as const;
  }, [pontos]);

  // Fala do guia: pausa a escuta enquanto fala (para não ouvir a si mesmo) e anima a esfera.
  const anunciar = useCallback(
    (texto: string, urgente = false, aoTerminar?: () => void) => {
      setStatus(texto);
      anunciarAria(texto, urgente ? 'assertive' : 'polite');
      if (mudoRef.current) return aoTerminar?.();
      const id = ++falaIdRef.current;
      escutadorRef.current?.pausar();
      setEstadoVoz('falando');
      falar(
        texto,
        idioma,
        () => {
          if (id !== falaIdRef.current) return; // uma fala mais nova cancelou esta
          fimDaFalaRef.current = performance.now();
          escutadorRef.current?.retomar();
          setEstadoVoz(escutadorRef.current ? 'ouvindo' : 'parado');
          aoTerminar?.();
        },
        velocidadeDaVoz(),
      );
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
      escutadorRef.current?.parar();
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

  /** Tudo o que o guia precisa entender: nomes e apelidos dos destinos, comandos e números. */
  const palavrasDoGuia = [
    ...destinosFalaveis.flatMap((d) => [d.nome, ...(d.apelidos ?? [])]),
    ...vocabulario.numeros,
    ...vocabulario.ordinais.filter((o) => o !== '-'),
    ...vocabulario.ondeEstou,
    ...vocabulario.quantoFalta,
    ...vocabulario.repetir,
    ...vocabulario.parar,
  ].flatMap((f) => f.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean));

  /** O agente ouviu uma frase: entende o pedido e age, sem precisar tocar em nada. */
  function aoOuvir(texto: string) {
    if (performance.now() - fimDaFalaRef.current < 400) return; // eco do fim da própria fala
    setVoceDisse(texto);
    const intencao = interpretar(texto, destinosFalaveis, vocabulario);
    if (!intencao) {
      if (texto.split(' ').length >= 2) anunciar(t.f_naoEntendiDestino);
      return;
    }
    switch (intencao.tipo) {
      case 'parar':
        return parar();
      case 'ondeEstou':
        return ondeEstou();
      case 'repetir':
        return anunciar(status);
      case 'quantoFalta':
        return anunciar(
          destinoRef.current && restante !== null
            ? preencher(t.f_faltamSo, { passos: restante, nome: destinoRef.current.nome })
            : t.f_semDestinoAinda,
        );
      case 'destino': {
        const d = porId.get(intencao.id);
        if (d) escolherDestino(d);
      }
    }
  }

  async function ligarEscuta() {
    if (escutadorRef.current) return;
    const e = await criarEscutador({
      idioma,
      aoOuvir: (texto) => aoOuvirRef.current(texto),
      aoOuvirParcial: (texto) => setVoceDisse(texto),
      aoMudarVolume: setVolume,
      palavras: palavrasDoGuia,
    });
    escutadorRef.current = e;
    if (!e) setSemEscuta(true);
    else if (estadoVozRef.current !== 'falando') setEstadoVoz('ouvindo');
    else e.pausar();
  }

  const aoOuvirRef = useRef(aoOuvir);
  const estadoVozRef = useRef(estadoVoz);
  useEffect(() => {
    aoOuvirRef.current = aoOuvir;
    estadoVozRef.current = estadoVoz;
  });

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

  async function comecar() {
    liberarAudio();
    preCarregarEscuta(idioma);
    if (!(await preparar())) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      const v = videoRef.current!;
      v.srcObject = stream;
      await v.play();
      setFase('ativo');
      void passos.ligar();
      anunciar(`${t.vamosJuntos} ${t.f_digaDestino}`);
      await ligarEscuta();
    } catch {
      anunciar(t.f_semCamera);
      setFase('parado');
    }
  }

  // Veio da página inicial (a pessoa já tocou lá, então o som está liberado): começa sozinho.
  useEffect(() => {
    const jaTocou = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation
      ?.hasBeenActive;
    if (!veioDaEntrada() || !jaTocou) return;
    const id = window.setTimeout(() => void comecar(), 0);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao abrir a tela
  }, []);

  /** Toque em QUALQUER lugar da tela: começa; depois, repete a última instrução. */
  function tocarTela() {
    if (fase === 'abertura' || fase === 'parado') return void comecar();
    if (fase === 'ativo') anunciar(status);
  }

  function parar() {
    const v = videoRef.current;
    if (v?.srcObject instanceof MediaStream) v.srcObject.getTracks().forEach((tr) => tr.stop());
    if (v) {
      v.pause();
      v.srcObject = null;
    }
    passos.desligar();
    escutadorRef.current?.parar();
    escutadorRef.current = null;
    setEstadoVoz('parado');
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

  const rotuloVoz =
    fase === 'abertura' || fase === 'parado'
      ? t.aberturaToque
      : estadoVoz === 'falando'
        ? t.falando
        : estadoVoz === 'ouvindo'
          ? t.ouvindo
          : t.toqueRepetir;
  const guiando = ativo && destino !== null;
  const titulo = fase === 'preparando' ? t.carregandoVoz : guiando ? rotuloDirecao[direcao] : t.paraOndeHoje;

  return (
    <div className={`${estilos.raiz} space-y-5`}>
      {/* marca + tema + som */}
      <div className="flex items-center gap-2">
        <p className="mr-auto">
          <span className={`${estilos.ouro} text-lg font-bold`}>◆ {t.marca}</span>
          <span className="block text-xs tracking-[0.25em] text-texto-suave uppercase">
            {t.subtituloMarca} · {nomePercurso}
          </span>
        </p>
        <BotaoTema escurecer={t.escurecer} clarear={t.clarear} />
        <button
          type="button"
          onClick={alternarSom}
          className="alvo inline-flex items-center gap-2 rounded-full border border-borda bg-superficie px-3 font-bold"
        >
          <span aria-hidden="true">{mudo ? '🔊' : '🔇'}</span>
          <span className="sr-only sm:not-sr-only">{mudo ? t.ativarSom : t.silenciar}</span>
        </button>
      </div>

      {/* PALCO: a tela inteira é o botão — quem não enxerga toca em qualquer lugar. */}
      <button
        type="button"
        onClick={tocarTela}
        aria-describedby="guia-instrucao"
        className="guia-palco alvo flex min-h-[64vh] w-full flex-col items-center justify-center gap-4 rounded-[2rem] px-4 py-8 text-center"
      >
        <span className="sr-only">{rotuloVoz}</span>
        <span className={`guia-orb guia-orb-${fase === 'ativo' ? estadoVoz : fase === 'preparando' ? 'falando' : 'parado'}`} aria-hidden="true">
          <span className="guia-orb-anel" />
          <span className="guia-orb-anel" />
          {guiando && estadoVoz === 'parado' && ROTACAO[direcao] !== undefined ? (
            <svg viewBox="0 0 100 100" className="guia-orb-seta" style={{ transform: `rotate(${ROTACAO[direcao]}deg)` }}>
              <path d="M50 8 L86 54 L62 54 L62 92 L38 92 L38 54 L14 54 Z" fill="currentColor" />
            </svg>
          ) : (
            <span className="guia-orb-ondas" style={{ ['--vol' as string]: String(0.35 + volume) }}>
              {Array.from({ length: 9 }, (_, k) => (
                <span key={k} className="guia-orb-barra" style={{ animationDelay: `${(k % 5) * 0.11}s` }} />
              ))}
            </span>
          )}
        </span>
        <span className={`${estilos.ouro} text-sm font-bold tracking-[0.2em] uppercase`} aria-hidden="true">
          {rotuloVoz}
        </span>
        <span className="block text-lg text-texto-suave">
          {guiando && destino ? `${figuraDoPonto(destino.id)} ${destino.nome}` : t.vamosJuntos}
        </span>
        <span className="block text-3xl leading-tight font-bold sm:text-4xl">{titulo}</span>
        {guiando && restante !== null && (
          <span className="block">
            <span className="text-6xl font-bold">{restante}</span>{' '}
            <span className="text-texto-suave">{t.unidade}</span>
          </span>
        )}
        <span id="guia-instrucao" className="block max-w-md text-base text-texto-suave">
          {status}
        </span>
        {voceDisse && (
          <span className="block rounded-full border border-borda px-4 py-1 text-sm">
            {t.voceDisse} “{voceDisse}”
          </span>
        )}
      </button>
      {semEscuta && <p className="text-center text-texto-suave">{t.f_semEscuta}</p>}

      {/* destinos: também dá para tocar (para quem enxerga) */}
      <section aria-labelledby="guia-destino">
        <h2 id="guia-destino" className="mb-2 text-lg font-bold">
          {t.paraOnde}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {destinos.map((p) => {
            const escolhido = destino?.id === p.id;
            const dist = distanciaAte(p);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={escolhido}
                  onClick={() => (ativo ? escolherDestino(p) : tocarTela())}
                  className={`alvo inline-flex items-center gap-2 rounded-full border-2 px-4 font-bold ${
                    escolhido ? `${estilos.bordaOuro} bg-primaria text-primaria-texto` : `border-borda ${estilos.vidro}`
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {figuraDoPonto(p.id)}
                  </span>
                  {p.nome}
                  {dist !== null && <span className="text-sm font-normal">· {dist}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {ativo && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={ondeEstou}
            className="alvo inline-flex items-center justify-center gap-2 rounded-full bg-primaria px-4 font-bold text-primaria-texto"
          >
            <span aria-hidden="true">📍</span>
            {t.ondeEstou}
          </button>
          <button
            type="button"
            onClick={parar}
            className="alvo inline-flex items-center justify-center gap-2 rounded-full border-2 border-perigo bg-superficie px-4 font-bold"
          >
            <span aria-hidden="true">⏹️</span>
            {t.parar}
          </button>
        </div>
      )}

      {/* câmera (só aparece ligada) */}
      <div className={`${estilos.camera} ${ativo ? 'block' : 'hidden'} rounded-2xl`}>
        <video
          ref={videoRef}
          playsInline
          muted
          aria-label={t.imagemCamera}
          className="max-h-40 w-full rounded-2xl bg-black object-cover"
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
          <dt>Voz</dt>
          <dd className="font-bold">{escutadorRef.current?.motor ?? '—'}</dd>
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
