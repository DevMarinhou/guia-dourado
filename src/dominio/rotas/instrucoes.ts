import type { Idioma, PisoId, TrechoRota } from '../tipos';

/** Um passo da rota, já pronto para texto, voz e vibração (padrão Wayfindr / ITU-T F.921). */
export interface Passo {
  tipo: 'seguir' | 'virar_esquerda' | 'virar_direita' | 'retornar' | 'elevador' | 'escada_rolante' | 'escada' | 'chegada';
  texto: string;
  distanciaM?: number;
  pisoId: PisoId;
  noId: string;
}

export interface ContextoInstrucoes {
  idioma: Idioma;
  nomeDoPiso: (piso: PisoId) => string;
  nomeDoMarco?: (localId: string) => string | undefined;
  nomeDoDestino: string;
}

type Modelos = {
  seguir: (m: number) => string;
  virar: (lado: 'esquerda' | 'direita', m: number) => string;
  retornar: (m: number) => string;
  marco: (nome: string) => string;
  elevador: (rotulo: string, piso: string) => string;
  rolante: (sobe: boolean, piso: string) => string;
  escada: (sobe: boolean, piso: string) => string;
  chegada: (destino: string) => string;
};

const minuscula = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

const MODELOS: Record<Idioma, Modelos> = {
  'pt-BR': {
    seguir: (m) => `Siga em frente por ${m} metros.`,
    virar: (l, m) => `Vire à ${l}. Siga ${m} metros.`,
    retornar: (m) => `Volte pelo mesmo caminho. Siga ${m} metros.`,
    marco: (n) => ` Referência: ${n}.`,
    elevador: (r, p) => `Pegue o ${minuscula(r)} até o ${p}.`,
    rolante: (s, p) => `${s ? 'Suba' : 'Desça'} pela escada rolante até o ${p}.`,
    escada: (s, p) => `${s ? 'Suba' : 'Desça'} a escada até o ${p}.`,
    chegada: (d) => `Você chegou: ${d}.`,
  },
  en: {
    seguir: (m) => `Go straight ahead for ${m} meters.`,
    virar: (l, m) => `Turn ${l === 'esquerda' ? 'left' : 'right'}. Continue for ${m} meters.`,
    retornar: (m) => `Turn back. Continue for ${m} meters.`,
    marco: (n) => ` Landmark: ${n}.`,
    elevador: (r, p) => `Take the ${minuscula(r).replace(/^elevador/, 'elevator')} to ${p}.`,
    rolante: (s, p) => `Take the escalator ${s ? 'up' : 'down'} to ${p}.`,
    escada: (s, p) => `Take the stairs ${s ? 'up' : 'down'} to ${p}.`,
    chegada: (d) => `You have arrived: ${d}.`,
  },
  es: {
    seguir: (m) => `Siga recto ${m} metros.`,
    virar: (l, m) => `Gire a la ${l === 'esquerda' ? 'izquierda' : 'derecha'}. Siga ${m} metros.`,
    retornar: (m) => `Vuelva por el mismo camino. Siga ${m} metros.`,
    marco: (n) => ` Referencia: ${n}.`,
    elevador: (r, p) => `Tome el ${minuscula(r).replace(/^elevador/, 'ascensor')} hasta ${p}.`,
    rolante: (s, p) => `${s ? 'Suba' : 'Baje'} por la escalera mecánica hasta ${p}.`,
    escada: (s, p) => `${s ? 'Suba' : 'Baje'} la escalera hasta ${p}.`,
    chegada: (d) => `Ha llegado: ${d}.`,
  },
};

/** Arredonda para múltiplos de 5 m (mínimo 5), como recomenda o padrão Wayfindr. */
export const arredondar = (m: number): number => Math.max(5, Math.round(m / 5) * 5);

const ORDINAL: Record<PisoId, number> = { 'subsolo-2': -2, 'subsolo-1': -1, terreo: 0, 'praca-alimentacao': 1 };

/** Ângulo de giro (graus, -180..180) entre dois trechos. Coordenadas de tela: y cresce para baixo. */
export function anguloDeGiro(a: TrechoRota, b: TrechoRota): number {
  const v1 = { x: a.para.x - a.de.x, y: a.para.y - a.de.y };
  const v2 = { x: b.para.x - b.de.x, y: b.para.y - b.de.y };
  const cruz = v1.x * v2.y - v1.y * v2.x; // > 0 = direita (y para baixo)
  const ponto = v1.x * v2.x + v1.y * v2.y;
  return (Math.atan2(cruz, ponto) * 180) / Math.PI;
}

/** Converte os trechos de uma rota em passos falados/escritos. */
export function gerarInstrucoes(trechos: readonly TrechoRota[], ctx: ContextoInstrucoes): Passo[] {
  const t = MODELOS[ctx.idioma];
  const passos: Passo[] = [];
  let i = 0;

  while (i < trechos.length) {
    const atual = trechos[i]!;
    const tipo = atual.aresta.tipo;

    if (tipo === 'elevador' || tipo === 'escada_rolante' || tipo === 'escada') {
      const sobe = ORDINAL[atual.para.pisoId] > ORDINAL[atual.de.pisoId];
      const piso = ctx.nomeDoPiso(atual.para.pisoId);
      const texto =
        tipo === 'elevador'
          ? t.elevador(atual.de.rotulo, piso)
          : tipo === 'escada_rolante'
            ? t.rolante(sobe, piso)
            : t.escada(sobe, piso);
      passos.push({ tipo, texto, pisoId: atual.para.pisoId, noId: atual.para.id });
      i += 1;
      continue;
    }

    // Agrupa trechos planos quase retos (|giro| < 30°) num único passo.
    let distancia = atual.aresta.distanciaM;
    const marcos = new Set(atual.aresta.marcos ?? []);
    let j = i + 1;
    while (j < trechos.length) {
      const prox = trechos[j]!;
      if (prox.aresta.tipo !== 'plano' && prox.aresta.tipo !== 'rampa') break;
      if (Math.abs(anguloDeGiro(trechos[j - 1]!, prox)) >= 30) break;
      distancia += prox.aresta.distanciaM;
      for (const m of prox.aresta.marcos ?? []) marcos.add(m);
      j += 1;
    }

    const anterior = i > 0 ? trechos[i - 1] : undefined;
    const giro = anterior && anterior.aresta.tipo !== 'elevador' ? anguloDeGiro(anterior, atual) : 0;
    const m = arredondar(distancia);
    let passo: Passo;
    if (Math.abs(giro) > 150) passo = { tipo: 'retornar', texto: t.retornar(m), distanciaM: m, pisoId: atual.de.pisoId, noId: atual.de.id };
    else if (giro >= 30) passo = { tipo: 'virar_direita', texto: t.virar('direita', m), distanciaM: m, pisoId: atual.de.pisoId, noId: atual.de.id };
    else if (giro <= -30) passo = { tipo: 'virar_esquerda', texto: t.virar('esquerda', m), distanciaM: m, pisoId: atual.de.pisoId, noId: atual.de.id };
    else passo = { tipo: 'seguir', texto: t.seguir(m), distanciaM: m, pisoId: atual.de.pisoId, noId: atual.de.id };

    const nomesMarcos = [...marcos].map((id) => ctx.nomeDoMarco?.(id)).filter((n): n is string => Boolean(n));
    if (nomesMarcos.length > 0) passo.texto += t.marco(nomesMarcos.join(', '));
    passos.push(passo);
    i = j;
  }

  const ultimo = trechos[trechos.length - 1];
  if (ultimo) {
    passos.push({ tipo: 'chegada', texto: t.chegada(ctx.nomeDoDestino), pisoId: ultimo.para.pisoId, noId: ultimo.para.id });
  }
  return passos;
}
