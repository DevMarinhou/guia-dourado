import { describe, expect, it } from 'vitest';
import locaisJson from '../../../dados/locais.json';
import { esquemaArquivoLocais } from '../esquemas';
import { buscarLocais, distanciaEdicao, normalizar } from './buscar';

const { locais } = esquemaArquivoLocais.parse(locaisJson);
const primeiro = (q: string) => buscarLocais(q, locais)[0]?.local.nome;

describe('normalizar', () => {
  it('remove acentos, pontuação e caixa', () => {
    expect(normalizar('C&A')).toBe('ca');
    expect(normalizar('  Divino   Fogão! ')).toBe('divino fogao');
  });
});

describe('buscarLocais (CT-05)', () => {
  it('"ca" encontra a C&A primeiro', () => expect(primeiro('ca')).toBe('C&A'));
  it('"loja 32" encontra o Outback', () => expect(primeiro('loja 32')).toBe('Outback Steakhouse'));
  it('"âncora 02" encontra a Riachuelo', () => expect(primeiro('âncora 02')).toBe('Riachuelo'));
  it('"banheiro" encontra sanitários', () => {
    const r = buscarLocais('banheiro', locais);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((x) => x.local.categoria === 'sanitario')).toBe(true);
  });
  it('"cinema" encontra o Cinemark', () => expect(primeiro('cinema')).toBe('Cinemark'));
  it('tolera erro de digitação: "outbak"', () => expect(primeiro('outbak')).toBe('Outback Steakhouse'));
  it('consulta vazia não retorna nada', () => expect(buscarLocais('   ', locais)).toEqual([]));
});

describe('distanciaEdicao', () => {
  it('calcula com limite', () => {
    expect(distanciaEdicao('outbak', 'outback')).toBe(1);
    expect(distanciaEdicao('abc', 'xyz', 1)).toBe(2);
  });
});
