import { describe, expect, it } from 'vitest';
import grafoJson from '../../../dados/grafo.json';
import { esquemaGrafo } from '../esquemas';
import type { OpcoesRota, PisoId } from '../tipos';
import { calcularRota, IndiceGrafo } from './dijkstra';
import { anguloDeGiro, arredondar, gerarInstrucoes } from './instrucoes';

const grafo = esquemaGrafo.parse(grafoJson);
const indice = new IndiceGrafo(grafo);
const tiposDaRota = (opcoes: OpcoesRota, de = 'T-ENT-JK', para = 'P-P215') => {
  const r = calcularRota(indice, de, para, opcoes);
  if (!r.ok) throw new Error(`sem rota: ${r.motivo}`);
  return r.trechos.map((t) => t.aresta.tipo);
};

describe('calcularRota (CT-03, RN-01, RN-02)', () => {
  it('perfil sem degraus nunca usa escada nem escada rolante', () => {
    const tipos = tiposDaRota({ perfil: 'sem_degraus' });
    expect(tipos).toContain('elevador');
    expect(tipos).not.toContain('escada');
    expect(tipos).not.toContain('escada_rolante');
  });

  it('com o ELV-01 em manutenção, usa o ELV-02', () => {
    const r = calcularRota(indice, 'T-ENT-JK', 'P-P215', {
      perfil: 'sem_degraus',
      equipamentosInativos: new Set(['ELV-01']),
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.trechos.some((t) => t.aresta.equipamentoId === 'ELV-02')).toBe(true);
  });

  it('sem elevador disponível, informa que não há caminho (oferecer acompanhamento)', () => {
    const r = calcularRota(indice, 'T-ENT-JK', 'P-P215', {
      perfil: 'sem_degraus',
      equipamentosInativos: new Set(['ELV-01', 'ELV-02']),
    });
    expect(r).toEqual({ ok: false, motivo: 'sem_caminho' });
  });

  it('com carrinho de bebê, a mobilidade reduzida não usa escada rolante', () => {
    const tipos = tiposDaRota({ perfil: 'mobilidade_reduzida', comCarrinhoDeBebe: true }, 'T-ENT-JK', 'P-P209');
    expect(tipos).not.toContain('escada_rolante');
    expect(tipos).not.toContain('escada');
  });

  it('perfil padrão encontra caminho e estima tempo', () => {
    const r = calcularRota(indice, 'T-ENT-JK', 'P-MESA-07', { perfil: 'padrao' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.distanciaM).toBeGreaterThan(0);
      expect(r.minutos).toBeGreaterThanOrEqual(1);
    }
  });

  it('escada rolante parada sai do grafo também para o perfil padrão', () => {
    const tipos = tiposDaRota({ perfil: 'padrao', equipamentosInativos: new Set(['ROL-01']) }, 'T-ENT-JK', 'P-P209');
    expect(tipos).not.toContain('escada_rolante');
  });

  it('valida origem e destino', () => {
    expect(calcularRota(indice, 'X-NAO-EXISTE', 'P-P215', { perfil: 'padrao' })).toEqual({ ok: false, motivo: 'origem_invalida' });
    expect(calcularRota(indice, 'T-ENT-JK', 'X-NAO-EXISTE', { perfil: 'padrao' })).toEqual({ ok: false, motivo: 'destino_invalido' });
  });
});

describe('gerarInstrucoes (CT-04)', () => {
  const nomes: Record<PisoId, string> = {
    'subsolo-2': 'Subsolo 2',
    'subsolo-1': 'Subsolo 1',
    terreo: '1º pavimento',
    'praca-alimentacao': '2º pavimento, Praça de Alimentação',
  };

  it('gera passo de elevador e termina com a chegada', () => {
    const r = calcularRota(indice, 'T-ENT-JK', 'P-P215', { perfil: 'sem_degraus' });
    if (!r.ok) throw new Error('sem rota');
    const passos = gerarInstrucoes(r.trechos, {
      idioma: 'pt-BR',
      nomeDoPiso: (p) => nomes[p],
      nomeDoDestino: 'Mundo Imersivo (Loja 215)',
    });
    expect(passos.some((p) => p.tipo === 'elevador' && p.texto.includes('elevador ELV-01'))).toBe(true);
    expect(passos.at(-1)).toMatchObject({ tipo: 'chegada', texto: 'Você chegou: Mundo Imersivo (Loja 215).' });
  });

  it('fala em espanhol', () => {
    const r = calcularRota(indice, 'T-ENT-JK', 'P-P215', { perfil: 'sem_degraus' });
    if (!r.ok) throw new Error('sem rota');
    const passos = gerarInstrucoes(r.trechos, { idioma: 'es', nomeDoPiso: (p) => nomes[p], nomeDoDestino: 'Mundo Imersivo' });
    expect(passos.some((p) => p.texto.startsWith('Tome el ascensor ELV-01'))).toBe(true);
  });

  it('curva de 90° em coordenadas de tela: leste → sul é à direita', () => {
    const no = (id: string, x: number, y: number) => ({ id, pisoId: 'terreo' as const, x, y, tipo: 'corredor' as const, rotulo: id });
    const aresta = { de: 'A-1', para: 'B-1', tipo: 'plano' as const, distanciaM: 10, pisoTatil: false };
    const leste = { aresta, de: no('A-1', 0, 0), para: no('B-1', 10, 0) };
    const sul = { aresta, de: no('B-1', 10, 0), para: no('C-1', 10, 10) };
    expect(anguloDeGiro(leste, sul)).toBeCloseTo(90);
  });

  it('arredonda distâncias para múltiplos de 5 m', () => {
    expect(arredondar(2)).toBe(5);
    expect(arredondar(22)).toBe(20);
    expect(arredondar(38)).toBe(40);
  });
});
