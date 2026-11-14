import { describe, expect, it } from 'vitest';
import {
  avisos,
  confirmarPonto,
  darPasso,
  estadoInicial,
  indoAoContrario,
  iniciarRota,
  type Aviso,
  type EstadoPosicao,
  type PontoPercurso,
} from './posicao';
import { carregarBase, criarConfirmador, lerMarcacoes, palpitar, quantizar, rotuloNoTempo } from './reconhecer';

const entrada: PontoPercurso = { id: 'entrada', passos: 0, destino: true, trecho: false };
const escada: PontoPercurso = { id: 'escada', passos: 15, destino: false, trecho: false, perigo: 'escada' };
const elevador: PontoPercurso = { id: 'elevador', passos: 20, destino: true, trecho: false };
const sala: PontoPercurso = { id: 'sala', passos: 30, destino: true, trecho: false };
const pontos = [entrada, escada, elevador, sala];
const limites = [-6, 36] as const;

function andar(e: EstadoPosicao, n: number, destino: PontoPercurso, ja: Set<string>) {
  const ditos: Aviso[] = [];
  for (let i = 0; i < n; i++) {
    e = darPasso(e, limites);
    ditos.push(...avisos(e, destino, pontos, ja));
  }
  return { e, ditos };
}

describe('Farol · posição', () => {
  it('avisa distância, perigo, ponto à frente, ficou para trás, chegando e chegou', () => {
    const ja = new Set<string>();
    let e = iniciarRota(confirmarPonto(entrada), sala.passos);
    const todos = [...avisos(e, sala, pontos, ja)];
    const r = andar(e, 30, sala, ja);
    e = confirmarPonto(sala, r.e);
    todos.push(...r.ditos, ...avisos(e, sala, pontos, ja));
    const tipos = todos.map((a) => a.tipo);
    expect(tipos[0]).toBe('faltam');
    expect(tipos).toContain('perigo');
    expect(todos).toContainEqual({ tipo: 'proximo', pontoId: 'elevador', passos: 5 });
    expect(todos).toContainEqual({ tipo: 'ficouPraTras', pontoId: 'elevador' });
    expect(tipos.filter((t) => t === 'chegando')).toHaveLength(1);
    expect(todos.filter((a) => a.tipo === 'chegou')).toEqual([
      { tipo: 'chegou', porCamera: false },
      { tipo: 'chegou', porCamera: true },
    ]);
  });

  it('não anda antes de a câmera reconhecer o primeiro ponto nem sem rota', () => {
    expect(darPasso(estadoInicial(), limites).passos).toBe(0);
    expect(darPasso(confirmarPonto(entrada), limites).passos).toBe(0);
  });

  it('percebe quando a pessoa passa do destino e manda voltar', () => {
    const ja = new Set<string>();
    const e = iniciarRota(confirmarPonto(entrada), elevador.passos);
    const { e: depois, ditos } = andar(e, 23, elevador, ja);
    expect(depois.passos).toBe(23);
    expect(ditos).toContainEqual({ tipo: 'passou', passos: 3 });
    // A rota de volta inverte o sentido.
    expect(iniciarRota(depois, elevador.passos).sentidoRota).toBe(-1);
  });

  it('reconhece quando a câmera mostra que a pessoa vai no sentido contrário', () => {
    expect(indoAoContrario(20, 15, 30)).toBe(true);
    expect(indoAoContrario(20, 25, 30)).toBe(false);
  });
});

describe('Farol · reconhecimento', () => {
  const unit = (i: number) => {
    const v = new Float32Array(8);
    v[i] = 1;
    return v;
  };
  const base = carregarBase({
    versao: 1,
    percurso: 'teste',
    criadoEm: '',
    dimensao: 8,
    rotulos: ['a', 'b'],
    itens: [0, 0, 0, 1, 1, 1].map((r) => ({ r, v: quantizar(unit(r)) })),
  });

  it('reconhece o ponto mais parecido e recusa imagem desconhecida', () => {
    const p = palpitar(base, unit(1));
    expect(p.rotulo).toBe('b');
    expect(p.aceito).toBe(true);
    expect(palpitar(base, unit(5)).aceito).toBe(false);
  });

  it('só confirma após análises seguidas iguais', () => {
    const confirmar = criarConfirmador(2);
    const p = palpitar(base, unit(0));
    expect(confirmar(p)).toBeNull();
    expect(confirmar(p)).toBe('a');
  });

  it('lê as marcações do vídeo narrado', () => {
    const m = lerMarcacoes('0:10 b\n0:00 a\n1:05,5 -');
    expect(rotuloNoTempo(m, 5)).toBe('a');
    expect(rotuloNoTempo(m, 70)).toBe('-');
  });
});
