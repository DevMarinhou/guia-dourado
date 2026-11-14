import { describe, expect, it } from 'vitest';
import locaisJson from '@dados/locais.json';
import { esquemaArquivoLocais } from '../esquemas';
import { confirmarLeitura, nomesDoLetreiro, normalizarLetreiro, reconhecerLetreiro } from './reconhecer';

const { locais } = esquemaArquivoLocais.parse(locaisJson);
const slug = (texto: string) => reconhecerLetreiro(texto, locais)?.local.slug ?? null;

describe('normalizarLetreiro', () => {
  it('tira acentos, pontuação e troca & por E', () => {
    expect(normalizarLetreiro('C&A')).toBe('C E A');
    expect(normalizarLetreiro("McDonald's")).toBe('MCDONALD S');
    expect(normalizarLetreiro('  Divino   Fogão!! ')).toBe('DIVINO FOGAO');
  });
});

describe('nomesDoLetreiro', () => {
  it('usa nome e sinônimos que fazem parte do nome, não os genéricos', () => {
    const outback = locais.find((l) => l.slug === 'outback-steakhouse')!;
    expect(nomesDoLetreiro(outback)).toEqual(['OUTBACK STEAKHOUSE', 'OUTBACK', 'STEAKHOUSE']);
    const renner = locais.find((l) => l.slug === 'renner')!;
    expect(nomesDoLetreiro(renner)).toEqual(['RENNER']); // "roupas" e "moda" ficam de fora
  });
  it('ignora sanitários (a placa não identifica o local)', () => {
    const wc = locais.find((l) => l.categoria === 'sanitario')!;
    expect(nomesDoLetreiro(wc)).toEqual([]);
  });
});

describe('reconhecerLetreiro', () => {
  it('reconhece o nome inteiro, com ruído em volta', () => {
    expect(slug('OUTBACK\nSTEAKHOUSE')).toBe('outback-steakhouse');
    expect(slug('| = Renner ~')).toBe('renner');
    expect(slug('Divino Fogão comida mineira')).toBe('divino-fogao');
  });
  it('reconhece só parte do nome quando ela identifica a loja', () => {
    expect(slug('OUTBACK')).toBe('outback-steakhouse');
    expect(slug('C&A')).toBe('c-e-a');
    expect(slug("McDONALD'S")).toBe('mcdonalds');
  });
  it('tolera pequenos erros de leitura do OCR', () => {
    expect(slug('RIACHUEL0')).toBe('riachuelo');
    expect(slug('PERNAMBUCANAS')).toBe('pernambucanas');
    expect(slug('CAMlCADO')).toBe('camicado');
  });
  it('prefere o nome mais específico ("BIG LAR" não é o Super Big)', () => {
    expect(slug('BIG LAR')).toBe('big-lar');
    expect(slug('SUPER BIG')).toBe('super-big');
  });
  it('não anuncia nada quando não há certeza', () => {
    expect(slug('')).toBeNull();
    expect(slug('PROMOÇÃO 50% OFF')).toBeNull();
    expect(slug('ROUPAS')).toBeNull();
    expect(slug('SANITÁRIO')).toBeNull();
  });
});

describe('confirmarLeitura', () => {
  const outback = reconhecerLetreiro('OUTBACK STEAKHOUSE', locais)!;
  const quase = { local: outback.local, pontuacao: 0.8 };

  it('nome lido por inteiro confirma na hora', () => {
    expect(confirmarLeitura([], outback).confirmado).toBe(true);
  });
  it('leitura parcial precisa aparecer 2 vezes nas últimas 3', () => {
    const r1 = confirmarLeitura([], quase);
    expect(r1.confirmado).toBe(false);
    const r2 = confirmarLeitura([...r1.recentes, null].slice(-3), quase);
    expect(r2.confirmado).toBe(true);
    expect(r2.recentes).toEqual([]);
  });
  it('leitura vazia não confirma', () => {
    expect(confirmarLeitura(['loc-renner'], null)).toEqual({ confirmado: false, recentes: ['loc-renner', null] });
  });
});
