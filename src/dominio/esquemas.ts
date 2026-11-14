// Esquemas zod: fonte única da verdade para os dados versionados em /dados
// e para as entradas das APIs. O domínio não depende de React, Next.js nem de I/O.
import { z } from 'zod';

export const IDIOMAS = ['pt-BR', 'en', 'es'] as const;
export const esquemaIdioma = z.enum(IDIOMAS);

export const esquemaTextoI18n = z.object({
  'pt-BR': z.string().min(1),
  en: z.string().min(1).optional(),
  es: z.string().min(1).optional(),
});

export const esquemaPisoId = z.enum(['subsolo-2', 'subsolo-1', 'terreo', 'praca-alimentacao']);

const idDeNo = z.string().regex(/^[A-Z0-9]+(-[A-Z0-9]+)+$/, 'id de nó inválido (ex.: T-C01)');

export const esquemaNo = z.object({
  id: idDeNo,
  pisoId: esquemaPisoId,
  x: z.number(),
  y: z.number(),
  tipo: z.enum(['corredor', 'porta', 'elevador', 'escada', 'escada_rolante', 'rampa', 'entrada', 'ponto']),
  rotulo: z.string().min(1),
});

export const esquemaAresta = z.object({
  de: idDeNo,
  para: idDeNo,
  tipo: z.enum(['plano', 'rampa', 'escada', 'escada_rolante', 'elevador']),
  distanciaM: z.number().positive(),
  pisoTatil: z.boolean(),
  equipamentoId: z.string().optional(),
  inclinacaoPct: z.number().min(0).optional(),
  marcos: z.array(z.string()).optional(),
  bidirecional: z.boolean().optional(),
});

export const esquemaGrafo = z.object({
  versao: z.string(),
  observacao: z.string().optional(),
  nos: z.array(esquemaNo).min(1),
  arestas: z.array(esquemaAresta),
});

export const esquemaCategoria = z.enum([
  'moda',
  'alimentacao',
  'lazer',
  'casa',
  'acessorios',
  'servicos',
  'mercado',
  'sanitario',
  'acessibilidade',
  'informacao',
]);

export const esquemaLocal = z.object({
  id: z.string().regex(/^loc-[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  nome: z.string().min(1),
  numero: z.string().min(1),
  categoria: esquemaCategoria,
  pisoId: esquemaPisoId,
  areaM2: z.number().positive().nullable(),
  entradaNoId: idDeNo.nullable(),
  sinonimos: z.array(z.string()),
  sensorial: z.object({ ruido: z.enum(['baixo', 'medio', 'alto']) }).optional(),
  // null = "não informado" (diferente de false). Só afirmamos o que foi verificado.
  acessibilidade: z.record(z.string(), z.boolean().nullable()).optional(),
  textos: z
    .partialRecord(esquemaIdioma, z.object({ descricao: z.string().optional(), simples: z.string().optional() }))
    .optional(),
});

export const esquemaArquivoLocais = z.object({
  versao: z.string(),
  fonte: z.string(),
  locais: z.array(esquemaLocal),
});

export const esquemaCodigoPonto = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{1,8}(-[A-Z0-9]{1,8}){0,3}$/, 'código de ponto inválido');

export const esquemaPonto = z.object({
  codigo: esquemaCodigoPonto,
  noId: idDeNo.nullable(),
  pisoId: esquemaPisoId,
  tipo: z.enum(['totem', 'entrada', 'loja', 'mesa', 'estacionamento', 'sanitario', 'elevador', 'sac']),
  nfc: z.boolean(),
  braille: z.boolean(),
  ativo: z.boolean(),
  nome: esquemaTextoI18n,
});

export const esquemaArquivoPontos = z.object({
  versao: z.string(),
  observacao: z.string().optional(),
  pontos: z.array(esquemaPonto),
});

export const esquemaEquipamento = z.object({
  id: z.string().regex(/^[A-Z]{3}-\d{2}$/),
  tipo: z.enum(['elevador', 'escada_rolante']),
  pisos: z.array(esquemaPisoId).min(2),
  status: z.enum(['operando', 'manutencao', 'fora']),
  descricao: z.string(),
});

export const esquemaArquivoEquipamentos = z.object({
  versao: z.string(),
  observacao: z.string().optional(),
  equipamentos: z.array(esquemaEquipamento),
});

// Entradas das APIs (RF-19, RF-24)
export const esquemaNovoPedidoAjuda = z.object({
  tipo: z.enum(['orientacao', 'acompanhamento', 'comunicacao', 'saude', 'crianca_perdida', 'seguranca']),
  pontoCodigo: esquemaCodigoPonto,
  modoComunicacao: z.enum(['texto', 'libras', 'voz', 'idioma', 'pictogramas']),
  idioma: esquemaIdioma,
  observacao: z.string().max(280).optional(),
  tokenAparelho: z.uuid(),
  consentimento: z.literal(true), // LGPD art. 11, I: consentimento específico e destacado
});

export const esquemaBarreira = z.object({
  tipo: z.enum(['elevador_parado', 'escada_sem_alternativa', 'caminho_bloqueado', 'sinalizacao', 'app', 'outro']),
  pontoCodigo: esquemaCodigoPonto.optional(),
  descricao: z.string().max(500).optional(),
});

// Farol (piloto de navegação por câmera para pessoas cegas): percurso medido em passos.
export const esquemaPontoPercurso = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id de ponto do percurso inválido (ex.: sala-1)'),
  passos: z.number().min(0),
  destino: z.boolean(),
  trecho: z.boolean(),
  nome: esquemaTextoI18n,
  esquerda: esquemaTextoI18n.optional(),
  direita: esquemaTextoI18n.optional(),
  perigo: esquemaTextoI18n.optional(),
});

export const esquemaArquivoPercurso = z.object({
  versao: z.string().min(1),
  nome: esquemaTextoI18n,
  unidade: z.literal('passos'),
  observacao: z.string(),
  pontos: z.array(esquemaPontoPercurso).min(2),
});
