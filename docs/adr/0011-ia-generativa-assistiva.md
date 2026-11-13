# ADR-0011: IA generativa só como apoio, com revisão humana
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
IA generativa ajuda a traduzir e a reescrever em linguagem simples, mas pode errar. Num contexto de acessibilidade e segurança física, erros têm custo alto.

## Decisão
- **Nunca** usar IA para rotas, instruções de navegação, status de equipamentos ou emergência.
- Usar IA para **rascunhos** de linguagem simples e traduções de conteúdo, **revisados por humanos** antes de publicar (RNF-15).
- Na conversa ao vivo, IA só como **último adaptador** de tradução, com aviso “tradução automática” e sem guardar texto.
- Adaptador Claude opcional: modelo padrão `claude-opus-5-5` (configurável por `LLM_MODEL`; `claude-haiku-5-5` como alternativa de menor custo, a critério da equipe), esforço `low`, saída estruturada, *fallbacks* no servidor e tratamento de recusa.

## Alternativas consideradas
- **IA como “assistente” que responde tudo:** risco de respostas inventadas sobre lojas e caminhos.

## Consequências
- (+) Benefício da IA sem comprometer segurança e confiança.
- (−) Exige fluxo editorial de revisão.
