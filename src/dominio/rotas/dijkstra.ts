import type { Aresta, Grafo, No, OpcoesRota, ResultadoRota, TrechoRota } from '../tipos';
import { HeapMinimo } from './heap';
import { custoAresta, VELOCIDADE_M_POR_MIN } from './pesos';

/** Índice do grafo com adjacência pronta. Arestas são bidirecionais, salvo `bidirecional: false`. */
export class IndiceGrafo {
  readonly nos = new Map<string, No>();
  private readonly adjacencia = new Map<string, Aresta[]>();

  constructor(grafo: Grafo) {
    for (const no of grafo.nos) this.nos.set(no.id, no);
    for (const a of grafo.arestas) {
      this.adicionar(a);
      if (a.bidirecional !== false) this.adicionar({ ...a, de: a.para, para: a.de });
    }
  }

  private adicionar(a: Aresta): void {
    const lista = this.adjacencia.get(a.de);
    if (lista) lista.push(a);
    else this.adjacencia.set(a.de, [a]);
  }

  vizinhos(id: string): readonly Aresta[] {
    return this.adjacencia.get(id) ?? [];
  }
}

const MINUTOS_ESPERA_ELEVADOR = 1;

/**
 * Menor caminho por custo (Dijkstra com heap binário), respeitando o perfil e os
 * equipamentos inativos. Determinístico e sem I/O: roda no cliente (offline) e no servidor.
 */
export function calcularRota(
  indice: IndiceGrafo,
  origem: string,
  destino: string,
  opcoes: OpcoesRota,
): ResultadoRota {
  if (!indice.nos.has(origem)) return { ok: false, motivo: 'origem_invalida' };
  if (!indice.nos.has(destino)) return { ok: false, motivo: 'destino_invalido' };

  const custo = new Map<string, number>([[origem, 0]]);
  const anterior = new Map<string, Aresta>();
  const visitados = new Set<string>();
  const fila = new HeapMinimo<string>();
  fila.inserir(origem, 0);

  while (fila.tamanho > 0) {
    const { valor: atual, prioridade } = fila.remover()!;
    if (visitados.has(atual)) continue;
    visitados.add(atual);
    if (atual === destino) break;

    for (const aresta of indice.vizinhos(atual)) {
      const c = custoAresta(aresta, opcoes);
      if (!Number.isFinite(c)) continue;
      const novo = prioridade + c;
      if (novo < (custo.get(aresta.para) ?? Infinity)) {
        custo.set(aresta.para, novo);
        anterior.set(aresta.para, aresta);
        fila.inserir(aresta.para, novo);
      }
    }
  }

  const custoFinal = custo.get(destino);
  if (custoFinal === undefined) return { ok: false, motivo: 'sem_caminho' };

  const trechos: TrechoRota[] = [];
  for (let id = destino; id !== origem; ) {
    const a = anterior.get(id)!;
    trechos.push({ aresta: a, de: indice.nos.get(a.de)!, para: indice.nos.get(a.para)! });
    id = a.de;
  }
  trechos.reverse();

  const distanciaM = trechos.reduce((soma, t) => soma + t.aresta.distanciaM, 0);
  const elevadores = trechos.filter((t) => t.aresta.tipo === 'elevador').length;
  const minutos = Math.max(
    1,
    Math.round(distanciaM / VELOCIDADE_M_POR_MIN[opcoes.perfil] + elevadores * MINUTOS_ESPERA_ELEVADOR),
  );
  return { ok: true, trechos, distanciaM, minutos, custo: custoFinal };
}
