// Adaptador de NUVEM (último da cascata). A chave do provedor fica só no servidor:
// o cliente chama /api/traducao, que decide o provedor configurado (TRADUCAO_PROVEDOR).
//
// TODO(T06/MVP): implementar no servidor o provedor escolhido pela equipe. Opção documentada
// (docs/08 §8.4 e ADR-0011): Claude via @anthropic-ai/sdk, modelo `claude-opus-5-5` (variável LLM_MODEL;
// `claude-haiku-5-5` como alternativa de menor custo), esforço baixo, saída estruturada,
// fallbacks no servidor e tratamento de recusa. Não enviar identificadores nem guardar o texto.
import type { ProvedorTraducao } from './porta';

export const provedorNuvem: ProvedorTraducao = {
  nome: 'nuvem',
  async traduzir(texto, de, para) {
    const resposta = await fetch('/api/traducao', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ texto, de, para }),
    });
    if (!resposta.ok) return null;
    const dados = (await resposta.json()) as { traducao?: string; fonte?: string };
    if (!dados.traducao) return null;
    return { texto: dados.traducao, fonte: dados.fonte === 'frases-prontas' ? 'frases-prontas' : 'nuvem', revisada: dados.fonte === 'frases-prontas' };
  },
};
