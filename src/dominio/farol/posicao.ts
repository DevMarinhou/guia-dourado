// Farol: posição ao longo de um percurso juntando câmera + passos (domínio puro).
// - Câmera confirma um ponto → a posição "encaixa" na distância desse ponto.
// - Entre pontos → a posição avança pelos passos, no sentido da rota (pode passar do destino).
// - Avisos: "faltam N passos", "em N passos, X à esquerda", "ficou para trás", "está chegando",
//   "chegou", "passou do destino" e perigo.
// Unidade do piloto: passos (1 passo ≈ 1 m), igual à contagem do vídeo narrado.

export type PontoPercurso = {
  id: string;
  /** distância desde o início do percurso, em passos */
  passos: number;
  destino: boolean;
  /** trecho longo (ex.: corredor): reconhecido, mas sem posição fixa */
  trecho: boolean;
  /** texto curto do perigo (ex.: "escada à direita"); ausente = sem perigo */
  perigo?: string;
};

export type EstadoPosicao = {
  passos: number;
  ultimoPonto: string | null;
  passosDesdePonto: number;
  passosDoPonto: number;
  /** +1 ou -1 enquanto há rota; 0 sem rota */
  sentidoRota: number;
  /** de onde a rota atual começou (para saber quais pontos estão "no caminho") */
  inicioRota: number;
};

export const RAIO_CHEGANDO = 5;
export const RAIO_CHEGOU_POR_PASSOS = 1;
export const AVISO_A_CADA = 10;
export const RAIO_PERIGO = 4;
/** avisa o próximo ponto do caminho quando faltam até N passos */
export const RAIO_PROXIMO = 5;
/** passou do destino por pelo menos N passos → manda voltar */
export const RAIO_PASSOU = 3;
/** um ponto do caminho "ficou para trás" depois de N passos além dele */
export const RAIO_FICOU_PRA_TRAS = 2;

export function estadoInicial(): EstadoPosicao {
  return { passos: 0, ultimoPonto: null, passosDesdePonto: 0, passosDoPonto: 0, sentidoRota: 0, inicioRota: 0 };
}

/** A câmera confirmou um ponto: a posição encaixa nele (mantém a rota atual). */
export function confirmarPonto(p: PontoPercurso, anterior: EstadoPosicao = estadoInicial()): EstadoPosicao {
  return { ...anterior, passos: p.passos, ultimoPonto: p.id, passosDesdePonto: 0, passosDoPonto: p.passos };
}

/** Começa (ou recomeça) a rota até `destino` a partir da posição atual. */
export function iniciarRota(e: EstadoPosicao, destino: number): EstadoPosicao {
  return {
    ...e,
    passosDoPonto: e.passos,
    passosDesdePonto: 0,
    sentidoRota: Math.sign(destino - e.passos),
    inicioRota: e.passos,
  };
}

/** Avança um passo no sentido da rota, sem sair do percurso (pode passar do destino). */
export function darPasso(e: EstadoPosicao, limites: readonly [number, number], tamanhoDoPasso = 1): EstadoPosicao {
  if (e.ultimoPonto === null || e.sentidoRota === 0) return e; // sem posição ou sem rota
  const dados = e.passosDesdePonto + 1;
  const passos = e.passosDoPonto + e.sentidoRota * dados * tamanhoDoPasso;
  return { ...e, passosDesdePonto: dados, passos: Math.min(Math.max(passos, limites[0]), limites[1]) };
}

/** A câmera viu um ponto mais longe do destino que o anterior → a pessoa está indo para o lado errado. */
export function indoAoContrario(anterior: number, novo: number, destino: number): boolean {
  return Math.abs(novo - destino) > Math.abs(anterior - destino) + RAIO_CHEGOU_POR_PASSOS;
}

export type Aviso =
  | { tipo: 'faltam'; passos: number }
  | { tipo: 'chegando'; passos: number }
  | { tipo: 'chegou'; porCamera: boolean }
  | { tipo: 'passou'; passos: number }
  | { tipo: 'proximo'; pontoId: string; passos: number }
  | { tipo: 'ficouPraTras'; pontoId: string }
  | { tipo: 'perigo'; pontoId: string; passos: number };

/** Decide o que avisar. `jaAvisado` guarda o que já foi dito na rota atual (sem repetir). */
export function avisos(
  e: EstadoPosicao,
  destino: PontoPercurso | null,
  pontos: readonly PontoPercurso[],
  jaAvisado: Set<string>,
): Aviso[] {
  const saida: Aviso[] = [];
  if (e.ultimoPonto === null || !destino) return saida;

  const sentido = e.sentidoRota || Math.sign(destino.passos - e.passos);
  const alem = (e.passos - destino.passos) * sentido; // > 0 = já passou do destino

  if (sentido !== 0 && alem >= RAIO_PASSOU) {
    if (!jaAvisado.has('passou')) {
      jaAvisado.add('passou');
      saida.push({ tipo: 'passou', passos: Math.round(alem) });
    }
    return saida;
  }

  for (const p of pontos) {
    if (p.trecho || p.id === destino.id) continue;
    const distancia = (p.passos - e.passos) * sentido; // > 0 = à frente
    if (p.perigo) {
      const chave = `perigo:${p.id}`;
      if (distancia >= 0 && distancia <= RAIO_PERIGO && !jaAvisado.has(chave)) {
        jaAvisado.add(chave);
        saida.push({ tipo: 'perigo', pontoId: p.id, passos: Math.round(distancia) });
      }
    }
    // Pontos de referência entre o início da rota e o destino.
    const noCaminho =
      (p.passos - e.inicioRota) * sentido > 0 && (destino.passos - p.passos) * sentido > 0;
    if (!noCaminho) continue;
    if (distancia > 0 && distancia <= RAIO_PROXIMO && !jaAvisado.has(`proximo:${p.id}`)) {
      jaAvisado.add(`proximo:${p.id}`);
      saida.push({ tipo: 'proximo', pontoId: p.id, passos: Math.round(distancia) });
    }
    const atras = -distancia;
    if (atras >= RAIO_FICOU_PRA_TRAS && atras <= RAIO_FICOU_PRA_TRAS + 3 && !jaAvisado.has(`atras:${p.id}`)) {
      jaAvisado.add(`atras:${p.id}`);
      jaAvisado.add(`proximo:${p.id}`);
      saida.push({ tipo: 'ficouPraTras', pontoId: p.id });
    }
  }

  const restante = Math.abs(destino.passos - e.passos);
  if (e.ultimoPonto === destino.id && e.passosDesdePonto === 0) {
    if (!jaAvisado.has('chegou-camera')) {
      jaAvisado.add('chegou-camera');
      jaAvisado.add('chegou-passos');
      saida.push({ tipo: 'chegou', porCamera: true });
    }
    return saida;
  }
  if (restante <= RAIO_CHEGOU_POR_PASSOS) {
    if (!jaAvisado.has('chegou-passos') && !jaAvisado.has('chegou-camera')) {
      jaAvisado.add('chegou-passos');
      saida.push({ tipo: 'chegou', porCamera: false });
    }
    return saida;
  }
  if (restante <= RAIO_CHEGANDO) {
    if (!jaAvisado.has('chegando') && alem < 0) {
      jaAvisado.add('chegando');
      saida.push({ tipo: 'chegando', passos: Math.round(restante) });
    }
    return saida;
  }
  const faixa = Math.ceil(restante / AVISO_A_CADA) * AVISO_A_CADA;
  if (!jaAvisado.has(`faltam:${faixa}`)) {
    jaAvisado.add(`faltam:${faixa}`);
    saida.push({ tipo: 'faltam', passos: Math.round(restante) });
  }
  return saida;
}
