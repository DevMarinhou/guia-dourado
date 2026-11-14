# Como contribuir

> Antes de qualquer coisa: leia o **[`AGENTS.md`](AGENTS.md)** — regras do projeto para humanos **e**
> agentes de IA (mapa do código, convenções, checklist). Este ficheiro é o fluxo prático.

## Primeiros passos
```bash
npm install
cp .env.example .env.local   # opcional em dev
npm run dev                   # http://localhost:3000
```
Requisitos: **Node.js 22+**.

## Fluxo
- `producao` (padrão no GitHub) e `main` sempre funcionando e idênticas. Trabalhe em ramos curtos: `feat/rotas-tela`, `fix/contraste-ajuda`.
- PRs pequenos (até ~300 linhas) e revisados por outra pessoa. Integre com frequência para evitar conflitos.
- Cada pessoa é dona das suas pastas (trilhas em `PROXIMOS_PASSOS.md`). Arquivos compartilhados (`src/mensagens/*.json`, `dados/*.json`) têm mudanças pequenas e atômicas.

## Commits (Conventional Commits, em português)
`feat(rotas): recalcula quando o elevador entra em manutenção` · `fix(a11y): contraste do botão Ajuda no alto contraste` · `docs: atualiza plano do MVP`

## Checklist do PR (Definição de Pronto, docs/12 §12.6)
- [ ] `npm run verificar` verde (lint, tipos, testes, build)
- [ ] `npm run test:e2e` sem violações axe nas telas alteradas
- [ ] Testei **só com teclado** e com **um leitor de tela** (TalkBack ou VoiceOver)
- [ ] Um `h1` por tela e título único (`generateMetadata`)
- [ ] Textos em `src/mensagens/` nos **3 idiomas**; nada de texto fixo na interface
- [ ] Alvos de toque ≥ 48 px; nenhuma informação só por cor
- [ ] Nenhum dado de loja inventado; nenhum segredo no código
- [ ] **Easter Egg intacto**: T04 → 13 toques no ♡ → "Combo Sexta-feira 13 Sem Sustos" aparece no cardápio (não renomear nem simplificar — ver `AGENTS.md` §2.3)

## Como adicionar…
- **Uma loja:** edite `dados/locais.json` (veja o esquema em `src/dominio/esquemas.ts`) e rode `npm run dados:validar`.
- **Um ponto QR/NFC:** adicione em `dados/pontos.json` (código curto em maiúsculas, `noId` existente) e gere a placa com `npm run qr:gerar`.
- **Um trecho de caminho:** adicione nós/arestas em `dados/grafo.json`. Toda escada/escada rolante/elevador precisa do tipo correto e, se for equipamento, de `equipamentoId`.
- **Uma decisão de arquitetura:** crie `docs/adr/00NN-titulo.md` com o modelo de `docs/adr/README.md`.
