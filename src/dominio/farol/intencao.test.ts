import { describe, expect, it } from 'vitest';
import { interpretar, type DestinoFalavel, type VocabularioIntencao } from './intencao';

const v: VocabularioIntencao = {
  numeros: 'zero,um,dois,tres,quatro,cinco'.split(','),
  ordinais: '-,primeiro,segundo,terceiro'.split(','),
  ondeEstou: ['onde estou', 'onde eu to', 'onde eu estou'],
  quantoFalta: ['quanto falta', 'falta muito'],
  repetir: ['repete', 'repetir', 'de novo'],
  parar: ['parar', 'pare', 'para tudo'],
};
const destinos: DestinoFalavel[] = [
  { id: 'entrada', nome: 'Entrada, hall', apelidos: ['saida', 'inicio'] },
  { id: 'lixeira', nome: 'Lixeiras de reciclagem', apelidos: ['lixo'] },
  { id: 'elevador-1', nome: 'Elevador 1' },
  { id: 'elevador-2', nome: 'Elevador 2' },
  { id: 'sala-1', nome: 'Sala 1' },
  { id: 'sala-2', nome: 'Sala 2' },
];
const destino = (t: string) => {
  const r = interpretar(t, destinos, v);
  return r?.tipo === 'destino' ? r.id : r?.tipo ?? null;
};

describe('Agente de voz · entende o pedido', () => {
  it('destino em frases naturais, com número por extenso ou ordinal', () => {
    expect(destino('quero ir para o elevador um')).toBe('elevador-1');
    expect(destino('me leva no primeiro elevador')).toBe('elevador-1');
    expect(destino('vou pra sala dois')).toBe('sala-2');
    expect(destino('Sala 2, por favor')).toBe('sala-2');
    expect(destino('onde fica o lixo')).toBe('lixeira');
    expect(destino('quero voltar pra saída')).toBe('entrada');
  });

  it('aceita palavra um pouco errada (reconhecimento de voz)', () => {
    expect(destino('elevadô dois')).toBe('elevador-2');
    expect(destino('a lixera')).toBe('lixeira');
  });

  it('não confunde o número', () => {
    expect(destino('sala um')).toBe('sala-1');
    expect(destino('elevador dois')).not.toBe('elevador-1');
  });

  it('comandos', () => {
    expect(destino('onde eu tô')).toBe('ondeEstou');
    expect(destino('quanto falta')).toBe('quantoFalta');
    expect(destino('repete por favor')).toBe('repetir');
    expect(destino('pare')).toBe('parar');
    expect(destino('bom dia tudo bem')).toBeNull();
  });
});
