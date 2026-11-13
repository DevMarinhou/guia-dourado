# ADR-0009: Voz e tradução atrás de portas, com adaptadores em cascata
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
O suporte a Web Speech e à tradução varia por navegador e aparelho. Serviços em nuvem custam dinheiro e exigem rede.

## Decisão
- Portas `ProvedorFala`, `ProvedorEscuta` e `ProvedorTraducao` em `src/adaptadores/`.
- **Tradução em cascata:** (1) **frases prontas** pré-traduzidas e revisadas (offline); (2) **Translator API do Chrome** no próprio aparelho (desktop/totem); (3) **nuvem** via `/api/traducao` (provedor configurável, chave só no servidor, orçamento com corte).
- Adaptadores *mock* para testes e desenvolvimento.

## Alternativas consideradas
- **Uma única API em nuvem:** sem offline e com custo por uso.

## Consequências
- (+) Funciona offline nas frases mais comuns; troca de fornecedor sem mexer nas telas.
- (−) Mais código de integração; a qualidade varia por adaptador (indicada na interface).
