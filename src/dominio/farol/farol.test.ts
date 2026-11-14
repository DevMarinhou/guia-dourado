import { describe, expect, it } from 'vitest';
import { avisos, confirmarPonto, darPasso, estadoInicial, type PontoPercurso } from './posicao';
import { carregarBase, criarConfirmador, lerMarcacoes, palpitar, quantizar, rotuloNoTempo } from './reconhecer';

const entrada: PontoPercurso = { id: 'entrada', passos: 0, destino: true, trecho: false };
const escada: PontoPercurso = { id: 'escada', passos: 15, destino: false, trecho: false, perigo: 'escada' };
const sala: PontoPercurso = { id: 'sala', passos: 30, destino: true, trecho: false };
const pontos = [entrada, escada, sala];
const limites = [0, 30] as const;

describe('Farol · posição', () => {
  it('avisa distância, perigo, chegando e chegou uma única vez', () => {
    const destino = sala;
    let e = confirmarPonto(entrada);
    const ja = new Set<string>();
    const todos = [...avisos(e, destino, pontos, ja)];
    for (let i = 0; i < 40; i++) {
      e = darPasso(e, destino.passos, limites);
      todos.push(...avisos(e, destino, pontos, ja));
    }
    e = confirmarPonto(destino);
    todos.push(...avisos(e, destino, pontos, ja));
    const tipos = todos.map((a) => a.tipo);
    expect(tipos[0]).toBe('faltam');
    expect(tipos).toContain('perigo');
    expect(tipos.filter((t) => t === 'chegando')).toHaveLength(1);
    expect(todos.filter((a) => a.tipo === 'chegou')).toEqual([
      { tipo: 'chegou', porCamera: false },
      { tipo: 'chegou', porCamera: true },
    ]);
  });

  it('não anda antes de a câmera reconhecer o primeiro ponto', () => {
    expect(darPasso(estadoInicial(), 30, limites).passos).toBe(0);
  });

  it('não passa do destino', () => {
    let e = confirmarPonto(entrada);
    for (let i = 0; i < 100; i++) e = darPasso(e, 30, limites);
    expect(e.passos).toBe(30);
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
