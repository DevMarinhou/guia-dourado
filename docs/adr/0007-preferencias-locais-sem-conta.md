# ADR-0007: Preferências só no aparelho, sem conta
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
Saber que alguém usa cadeira de rodas ou leitor de tela é **dado sensível** (LGPD, art. 5º, II). A v1 enviava o “perfil do visitante” automaticamente à central.

## Decisão
- Preferências **funcionais** (“o que facilita para você?”) salvas em `localStorage` e aplicadas antes da pintura por script inline.
- **Sem cadastro e sem login** para visitantes.
- Ao pedir ajuda, só **forma de comunicação**, tipo e local são enviados, com **consentimento explícito**, e anonimizados em 30 dias.

## Alternativas consideradas
- **Conta de usuário:** barreira de uso e risco de dados.
- **Cookie com perfil:** seria enviado ao servidor em cada requisição.

## Consequências
- (+) Privacidade por concepção; menos responsabilidade legal para o shopping.
- (−) Preferências não sincronizam entre aparelhos (aceitável).
