# ADR-0010: UI com shadcn/ui (Radix), Tailwind 4 e tokens de tema
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
Precisamos de componentes acessíveis (foco, teclado, ARIA) rapidamente, com 3 temas (padrão, escuro, alto contraste) e escala de fonte.

## Decisão
- **shadcn/ui** (código copiado para o repositório) sobre **Radix UI**.
- **Tailwind CSS 4** com **tokens em variáveis CSS** (`--cor-texto`, `--cor-foco`, `--escala-fonte`) trocados por `data-tema` no `<html>`.
- Fonte **Atkinson Hyperlegible Next** via `next/font`.
- Contraste de cada token verificado por teste automatizado.

## Alternativas consideradas
- **React Aria Components:** excelente acessibilidade, mas curva maior para a equipe no prazo.
- **MUI:** pesado e mais difícil de ajustar aos temas.

## Consequências
- (+) Velocidade de desenvolvimento e acessibilidade de base.
- (−) Componentes copiados precisam ser mantidos pela equipe.
