// Carrega e VALIDA os dados versionados (dados/*.json) no build. Erro de dado = build quebra.
import equipamentosJson from '@dados/equipamentos.json';
import frasesJson from '@dados/frases-prontas.json';
import grafoJson from '@dados/grafo.json';
import locaisJson from '@dados/locais.json';
import pisosJson from '@dados/pisos.json';
import percursoJson from '@dados/percurso-piloto.json';
import pontosJson from '@dados/pontos.json';
import pranchaJson from '@dados/prancha.json';
import {
  esquemaArquivoEquipamentos,
  esquemaArquivoLocais,
  esquemaArquivoPercurso,
  esquemaArquivoPontos,
  esquemaGrafo,
} from '@/dominio/esquemas';
import type { Local, PisoId } from '@/dominio/tipos';

export const grafo = esquemaGrafo.parse(grafoJson);
export const { locais } = esquemaArquivoLocais.parse(locaisJson);
export const { pontos } = esquemaArquivoPontos.parse(pontosJson);
export const { equipamentos } = esquemaArquivoEquipamentos.parse(equipamentosJson);
export const pisos = pisosJson.pisos;
export const percursoPiloto = esquemaArquivoPercurso.parse(percursoJson);
export const pisosPublicos = pisos.filter((p) => p.publico).map((p) => p.id as PisoId);
export const frasesProntas = frasesJson.grupos;
export const prancha = pranchaJson.categorias;

export function buscarLocalPorSlug(slug: string): Local | undefined {
  return locais.find((l) => l.slug === slug);
}
