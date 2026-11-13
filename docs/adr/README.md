# Registros de Decisão de Arquitetura (ADRs)

Cada decisão relevante fica registrada num arquivo curto, com contexto, decisão, alternativas e consequências. Uma ADR aceita só muda por outra ADR que a substitua.

| ADR | Decisão | Status |
|---|---|---|
| [0001](0001-plataforma-nextjs-pwa.md) | Plataforma web/PWA com Next.js 16 (App Router), sem app nativo | Aceita |
| [0002](0002-monolito-modular-hexagonal.md) | Monólito modular por funcionalidades, domínio puro, portas e adaptadores | Aceita |
| [0003](0003-rotas-no-cliente-e-ancoras.md) | Rotas calculadas no cliente (Dijkstra) e localização por âncoras QR/NFC | Aceita |
| [0004](0004-dados-imdf-e-editor-de-grafo.md) | Modelo de dados inspirado no IMDF; grafo desenhado com editor e validado no CI | Aceita |
| [0005](0005-pontos-qr-nfc-braille.md) | Pontos de acesso com QR + NFC + Braille e códigos curtos (`/q/CODIGO`) | Aceita |
| [0006](0006-libras-vlibras-e-interprete.md) | Libras com VLibras + vídeos + intérprete humano; sem reconhecimento automático de Libras | Aceita |
| [0007](0007-preferencias-locais-sem-conta.md) | Preferências só no aparelho, sem conta e sem dado sensível no servidor | Aceita |
| [0008](0008-supabase-ajuda-e-central.md) | Supabase (Postgres, Realtime, Auth) para pedidos de ajuda e Central | Aceita |
| [0009](0009-portas-de-voz-e-traducao.md) | Voz e tradução atrás de portas, com adaptadores em cascata | Aceita |
| [0010](0010-ui-shadcn-tailwind-tokens.md) | UI com shadcn/ui (Radix) + Tailwind 4, tokens de tema e Atkinson Hyperlegible | Aceita |
| [0011](0011-ia-generativa-assistiva.md) | IA generativa só como apoio, com revisão humana; nunca em rotas ou emergência | Aceita |

## Modelo

```markdown
# ADR-NNNN: Título
- **Status:** Proposta | Aceita | Substituída por ADR-XXXX
- **Data:** AAAA-MM-DD
## Contexto
## Decisão
## Alternativas consideradas
## Consequências
```
