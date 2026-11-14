// Farol: posição ao longo de um percurso juntando câmera + passos (domínio puro).
// - Câmera confirma um ponto → a posição "encaixa" na distância desse ponto.
// - Entre pontos → a posição avança pelos passos, no sentido do destino.
// - Distância até o destino → avisos "faltam N passos", "está chegando", "chegou", perigo.
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
};

export const RAIO_CHEGANDO = 5;
export const RAIO_CHEGOU_POR_PASSOS = 1;
export const AVISO_A_CADA = 10;
export const RAIO_PERIGO = 4;

export function estadoInicial(): EstadoPosicao {
  return { passos: 0, ultimoPonto: null, passosDesdePonto: 0, passosDoPonto: 0 };
}

export function confirmarPonto(p: PontoPercurso): EstadoPosicao {
  return { passos: p.passos, ultimoPonto: p.id, passosDesdePonto: 0, passosDoPonto: p.passos };
}

/** Recomeça a contagem de passos a partir da posição atual (ex.: ao trocar de destino). */
export function ancorarNaPosicaoAtual(e: EstadoPosicao): EstadoPosicao {
  return { ...e, passosDoPonto: e.passos, passosDesdePonto: 0 };
}

/** Avança um passo no sentido do destino, sem passar dele nem sair do percurso. */
export function darPasso(
  e: EstadoPosicao,
  destino: number | null,
  limites: readonly [number, number],
  tamanhoDoPasso = 1,
): EstadoPosicao {
  if (e.ultimoPonto === null) return e; // ainda não sabemos onde a pessoa está
  const sentido = destino === null ? 0 : Math.sign(destino - e.passosDoPonto);
  const dados = e.passosDesdePonto + 1;
  let passos = e.passosDoPonto + sentido * dados * tamanhoDoPasso;
  if (destino !== null) passos = sentido > 0 ? Math.min(passos, destino) : Math.max(passos, destino);
  passos = Math.min(Math.max(passos, limites[0]), limites[1]);
  return { ...e, passosDesdePonto: dados, passos };
}

export type Aviso =
  | { tipo: 'faltam'; passos: number }
  | { tipo: 'chegando'; passos: number }
  | { tipo: 'chegou'; porCamera: boolean }
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

  const sentido = Math.sign(destino.passos - e.passos);
  for (const p of pontos) {
    if (!p.perigo || p.trecho) continue;
    const distancia = (p.passos - e.passos) * sentido;
    const chave = `perigo:${p.id}`;
    if (distancia >= 0 && distancia <= RAIO_PERIGO && !jaAvisado.has(chave)) {
      jaAvisado.add(chave);
      saida.push({ tipo: 'perigo', pontoId: p.id, passos: Math.round(distancia) });
    }
  }

  const restante = Math.abs(destino.passos - e.passos);
  if (e.ultimoPonto === destino.id) {
    if (!jaAvisado.has('chegou-camera')) {
      jaAvisado.add('chegou-camera');
      jaAvisado.add('chegou-passos');
      saida.push({ tipo: 'chegou', porCamera: true });
    }
    return saida;
  }
  if (restante <= RAIO_CHEGOU_POR_PASSOS) {
    if (!jaAvisado.has('chegou-passos')) {
      jaAvisado.add('chegou-passos');
      saida.push({ tipo: 'chegou', porCamera: false });
    }
    return saida;
  }
  if (restante <= RAIO_CHEGANDO) {
    if (!jaAvisado.has('chegando')) {
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
