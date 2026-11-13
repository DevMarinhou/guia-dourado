# ADR-0002: Monólito modular por funcionalidades, com domínio puro e portas/adaptadores
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
Equipe pequena, prazo curto e necessidade de testar regras críticas (rotas sem degraus) sem depender de navegador ou rede.

## Decisão
- Um repositório e um deploy (**monólito modular**).
- `src/dominio/`: TypeScript puro (tipos, esquemas, grafo, rotas, instruções, busca), sem React, Next.js ou I/O.
- `src/funcionalidades/<nome>/`: componentes, hooks e ações de cada funcionalidade.
- `src/adaptadores/`: implementações das **portas** (voz, tradução, Libras, tempo real, armazenamento).
- Regra de lint `no-restricted-imports` impede que o domínio importe camadas externas.

## Alternativas consideradas
- **Microsserviços:** complexidade operacional injustificável para o MVP.
- **Organização por tipo técnico** (`components/`, `hooks/`, `services/`): espalha uma funcionalidade por várias pastas e gera mais conflitos de merge.

## Consequências
- (+) Domínio 100% testável com Vitest; mesmo código no cliente (offline) e no servidor.
- (+) Cada pessoa da equipe “é dona” de pastas distintas.
- (−) Exige disciplina nas fronteiras (garantida por lint e revisão).
