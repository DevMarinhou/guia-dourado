// Contrato dos dados versionados (Cap. 10.3). Roda no CI a cada PR.
import { describe, expect, it } from 'vitest';
import equipamentosJson from '../dados/equipamentos.json';
import grafoJson from '../dados/grafo.json';
import locaisJson from '../dados/locais.json';
import pontosJson from '../dados/pontos.json';
import { esquemaArquivoEquipamentos, esquemaArquivoLocais, esquemaArquivoPontos, esquemaGrafo } from '../src/dominio/esquemas';
import { calcularRota, IndiceGrafo } from '../src/dominio/rotas/dijkstra';

const grafo = esquemaGrafo.parse(grafoJson);
const { locais } = esquemaArquivoLocais.parse(locaisJson);
const { pontos } = esquemaArquivoPontos.parse(pontosJson);
const { equipamentos } = esquemaArquivoEquipamentos.parse(equipamentosJson);
const ids = new Set(grafo.nos.map((n) => n.id));
const indice = new IndiceGrafo(grafo);

describe('dados: esquemas e referências', () => {
  it('ids de nós são únicos', () => expect(ids.size).toBe(grafo.nos.length));
  it('arestas ligam nós existentes', () => {
    for (const a of grafo.arestas) {
      expect(ids.has(a.de), a.de).toBe(true);
      expect(ids.has(a.para), a.para).toBe(true);
    }
  });
  it('entradas dos locais existem no grafo', () => {
    for (const l of locais) if (l.entradaNoId) expect(ids.has(l.entradaNoId), l.slug).toBe(true);
  });
  it('slugs e códigos de ponto são únicos', () => {
    expect(new Set(locais.map((l) => l.slug)).size).toBe(locais.length);
    expect(new Set(pontos.map((p) => p.codigo)).size).toBe(pontos.length);
  });
  it('pontos ativos apontam para nós existentes', () => {
    for (const p of pontos.filter((x) => x.ativo)) expect(p.noId && ids.has(p.noId), p.codigo).toBe(true);
  });
  it('arestas de equipamento referenciam equipamentos cadastrados', () => {
    const eq = new Set(equipamentos.map((e) => e.id));
    for (const a of grafo.arestas) if (a.equipamentoId) expect(eq.has(a.equipamentoId), a.equipamentoId).toBe(true);
  });
  it('toda aresta vertical (elevador/escada rolante) tem equipamento', () => {
    for (const a of grafo.arestas) {
      if (a.tipo === 'elevador' || a.tipo === 'escada_rolante') expect(a.equipamentoId, `${a.de}→${a.para}`).toBeTruthy();
    }
  });
});

describe('dados: acessibilidade garantida pelo grafo', () => {
  it('todo local com entrada é alcançável sem degraus a partir da Entrada Av. JK', () => {
    for (const l of locais.filter((x) => x.entradaNoId)) {
      const r = calcularRota(indice, 'T-ENT-JK', l.entradaNoId!, { perfil: 'sem_degraus' });
      expect(r.ok, `${l.nome} inalcançável sem degraus`).toBe(true);
    }
  });
});
