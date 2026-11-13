import type { Aresta, OpcoesRota, PerfilRota } from '../tipos';

/** Inclinação máxima de rampa aceitável para cadeira de rodas (referência ABNT NBR 9050). */
export const INCLINACAO_MAXIMA_PCT = 8.33;

/** Penalidade de espera do elevador, em "metros equivalentes" (Cap. 10.4). */
const ESPERA_ELEVADOR_M: Record<PerfilRota, number> = {
  padrao: 40,
  sem_degraus: 30,
  mobilidade_reduzida: 20,
  visual: 30,
  sensorial: 60, // espaço fechado e imprevisível
};

/**
 * Custo de percorrer uma aresta para um perfil. `Infinity` = proibida.
 * RN-01: com "evitar escadas", escada e escada rolante são proibidas.
 * RN-02: equipamento inativo sai do grafo para todos os perfis.
 */
export function custoAresta(a: Aresta, o: OpcoesRota): number {
  if (a.equipamentoId && o.equipamentosInativos?.has(a.equipamentoId)) return Infinity;
  const d = a.distanciaM;

  switch (a.tipo) {
    case 'plano': {
      let fator = 1;
      if (o.perfil === 'visual' && a.pisoTatil) fator = 0.8;
      if (o.perfil === 'sensorial' && (o.zonasRuidosas?.has(a.de) || o.zonasRuidosas?.has(a.para))) fator = 2;
      return d * fator;
    }
    case 'rampa': {
      const ingreme = (a.inclinacaoPct ?? 0) > INCLINACAO_MAXIMA_PCT;
      if (o.perfil === 'sem_degraus') return ingreme ? Infinity : d;
      if (o.perfil === 'mobilidade_reduzida') return d * (ingreme ? 2 : 1.2);
      return d * (ingreme ? 1.1 : 1);
    }
    case 'escada': {
      if (o.perfil === 'sem_degraus' || o.perfil === 'mobilidade_reduzida') return Infinity;
      return d * (o.perfil === 'visual' ? 1.5 : 1.1);
    }
    case 'escada_rolante': {
      if (o.perfil === 'sem_degraus') return Infinity;
      if (o.perfil === 'mobilidade_reduzida') return o.comCarrinhoDeBebe ? Infinity : d * 3;
      if (o.perfil === 'visual') return d * 1.3;
      if (o.perfil === 'sensorial') return d * 1.2;
      return d;
    }
    case 'elevador':
      return d + ESPERA_ELEVADOR_M[o.perfil];
  }
}

/** Velocidade média de caminhada (m/min) por perfil, para estimar o tempo. */
export const VELOCIDADE_M_POR_MIN: Record<PerfilRota, number> = {
  padrao: 70,
  sem_degraus: 45,
  mobilidade_reduzida: 40,
  visual: 50,
  sensorial: 60,
};
