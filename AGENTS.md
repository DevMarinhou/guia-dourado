<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Regras do projeto Guia Dourado

> **Lê este ficheiro antes de escrever qualquer código.** Aplica-se a **todos os agentes de IA**
> (OpenCode, Claude Code, Cursor, Copilot…) e serve de referência para **colaboradores humanos**.
> Regra de ouro: **evoluir sem reescrever** — não quebrar o que já funciona.

---

## 1. Contexto do projeto

| Campo | Valor |
|---|---|
| Projeto | **Guia Dourado** — acessibilidade e comunicação universal no Capim Dourado Shopping (Palmas/TO) |
| Desafio | Desafio 01 · Hackathon · FASEC |
| Estado atual | **MVP integrado** — estrutura completa (rotas `[locale]`, domínio, dados validados, CI) + Easter Egg |
| Entrega final | **Sábado 14/11/2026 até 12h** (MVP funcional + repo organizado + docs + instruções de execução) |
| Stack | **Next.js 16.4 (App Router) · React 19.3 · TypeScript estrito · next-intl (pt-BR/en/es) · Tailwind 4** |
| Repo | `github.com/DevMarinhou/guia-dourado` · branch principal (padrão no GitHub): `producao` (espelhada em `main`) |
| Trilhas da equipe | [`PROXIMOS_PASSOS.md`](PROXIMOS_PASSOS.md) — cada pessoa tem uma trilha (A front-end, B rotas, C comunicação, D ajuda/central/deploy) |

### Fontes oficiais (não alterar)
- `docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf` — planeamento técnico v2.0 (91 págs). **Fonte da verdade.**
- `docs/` (00–15) + `docs/adr/` — documentação e decisões de arquitetura.
- `wireframes/` — wireframes v2 das 14 telas (T00–T13).
- `entrega/` — PDF/DOCX da 1ª entrega.
- `dados/*.json` — dados versionados da planta (gerados/validados; **não inventar dados de lojas**).

---

## 2. Regras de ouro (obrigatórias)

1. **Acessibilidade primeiro.** Toda tela/novo componente precisa: um único `h1` + `generateMetadata`,
   alvos de toque **≥ 48 px** (classe `alvo`), foco visível, informação **nunca só por cor**,
   atualizações dinâmicas via `useAnunciador()` (região aria-live única), textos nos **3 idiomas**
   (`src/mensagens/*..json` — nada de texto fixo na interface), contraste 4.5:1 nos 3 temas.
2. **Não remover funcionalidade existente.** Mudança de comportamento → justificar no PR/issue.
3. **O Easter Egg é intocável.** "Prato Secreto: Poção Anti-Azar" — 13 toques no ♡ do T04 insere
   "Combo Sexta-feira 13 Sem Sustos — R$ 13,00" no cardápio, compatível com Ouvir/Libras/Linguagem
   simples. Implementado em `src/funcionalidades/detalhe/detalhe-local.tsx` + chaves `local.*` de
   `src/mensagens/*.json`. Não renomear, não simplificar, não "limpar". É requisito da missão
   sexta-feira 13 e precisa continuar **demonstrável ao vivo**.
4. **Não inventar dados de lojas** (cardápio, horário, recursos). Use `"não informado"` ou marque
   como ilustrativo (regra de `PROXIMOS_PASSOS.md` §5).
5. **Domínio puro:** nada de React/Next em `src/dominio/` (o lint bloqueia).
6. **Segredos só em `.env.local`/Vercel.** Commitar apenas `.env.example`. Nunca chaves no código.
7. **Nunca commitar:** `node_modules/`, `.next/`, `.env*`, credenciais.
8. **`npm run verificar` verde antes de cada push** (lint + tipos + testes + build).

---

## 3. Mapa do código — onde mexer (e onde NÃO)

```text
guia-dourado/
├── dados/                 dados versionados (pisos, locais, grafo, pontos, equipamentos…) — validados por zod
├── docs/                  documentação 00–15 + ADRs (referência; não editar a entrega em entrega/)
├── entrega/               PDF/DOCX da 1ª entrega + QR impressos
├── ferramentas/           scripts (documento de entrega, wireframes, QR)
├── supabase/              migração SQL (pedidos de ajuda, equipamentos, RLS)
├── tests/                 dados.test.ts (vitest) + e2e/a11y.spec.ts (Playwright + axe)
├── wireframes/            wireframes v2 navegáveis
├── src/
│   ├── app/
│   │   ├── [locale]/      ROTAS DO VISITANTE (pt-BR, en, es): page.tsx por tela T00–T11
│   │   ├── central/       T12 Central da equipe (interna)
│   │   ├── api/           route handlers (ajuda, barreiras, equipamentos, tradução)
│   │   ├── q/[codigo]/    resolve QR/NFC → ponto
│   │   └── totem/[ponto]/ modo totem
│   ├── dominio/           TypeScript PURO: tipos, zod, Dijkstra, instruções, busca (+ testes)
│   ├── funcionalidades/   código por funcionalidade
│   │   ├── detalhe/       🥚 T04 + EASTER EGG (detalhe-local.tsx) — não alterar a lógica do egg
│   │   ├── preferencias/  tema/fonte/movimento aplicados antes da 1ª pintura
│   │   └── localizacao/   cartão "Você está em…"
│   ├── adaptadores/       voz (Web Speech), tradução, Libras (VLibras), tempo real
│   ├── componentes/       layout (cabeçalho, rodapé, ajuda fixa) + a11y (anunciador, ouvir, libras)
│   ├── i18n/              routing/request/navigation (next-intl)
│   ├── mensagens/         pt-BR.json · en.json · es.json — manter chaves iguais nos 3
│   └── lib/dados.ts       carrega e VALIDA dados/*.json no build (dado inválido = build quebra)
└── AGENTS.md / CONTRIBUTING.md / PROXIMOS_PASSOS.md / README.md
```

**Pendências (trilhas de `PROXIMOS_PASSOS.md`):** T05 rota com elevador, T07 prancha, T09 acompanhar
pedido, T10 avaliar, T11 serviços, T12 Central, T13 totem, SVG dos pisos, Supabase, deploy Vercel.

---

## 4. Convenções de código

- **TypeScript estrito** — props e retornos tipados; `any` só em API do browser com comentário.
- **Server components por omissão**; `"use client"` só quando houver estado/evento.
- **Textos:** sempre via `src/mensagens/*.json` + `getTranslations` (server) — os textos do T04 são
  passados ao componente cliente como props (`TextosT04`), sem `useTranslations` no cliente.
- **Estilos:** Tailwind + tokens do tema (`bg-superficie`, `text-texto-suave`, `bg-primaria`,
  `border-borda`, `border-perigo`…) — nunca cores fixas inline. Alvo de toque: classe `alvo`.
- **Avisos:** `useAnunciador()` (região aria-live única do app). Fala: `falar()` de
  `@/adaptadores/voz/web-speech`. Libras: `BotaoLibras` (VLibras sob demanda).
- **Dados:** só em `dados/*.json` com o esquema de `src/dominio/esquemas.ts` + `npm run dados:validar`.
- **Ícones:** emojis (sem lib de ícones). Rotas em minúsculas; componentes em PascalCase.

### Padrão de nova tela T0x
1. Criar `src/app/[locale]/<tela>/page.tsx` com `generateStaticParams`, `generateMetadata`
   (título único) e um único `h1`.
2. Textos novos nos **3** ficheiros de `src/mensagens/`.
3. Lógica em `src/funcionalidades/<tela>/` (ou `src/dominio/` se for regra pura).
4. Testar: teclado, temas claro/escuro/alto contraste, mobile ~360 px, e `npm run verificar`.

---

## 5. Como rodar e verificar

```bash
npm install
cp .env.example .env.local     # opcional em dev; obrigatório em produção
npm run dev                    # http://localhost:3000
npm run verificar              # lint + tipos + testes + build — OBRIGATÓRIO antes do push
npm run test:e2e               # Playwright + axe (requer: npx playwright install chromium)
```

**Checklist antes de cada push:**
- [ ] `npm run verificar` verde
- [ ] Um `h1` por tela; textos nos 3 idiomas
- [ ] Teclado + temas (padrão/escuro/alto contraste) + mobile
- [ ] Easter Egg ainda funciona: `/locais/outback-steakhouse` → 13 toques no ♡
- [ ] Nenhum dado de loja inventado; nenhum segredo no código

---

## 6. Fluxo Git

1. Ramos curtos: `feat/…`, `fix/…`, `docs/…` (ex.: `feat/rota-elevador`).
2. Commits Conventional Commits **em português**: `feat(rotas): recalcula com elevador em manutenção`.
3. PRs pequenos (~300 linhas), revisados; integrar com frequência.
4. `src/mensagens/*.json` e `dados/*.json` são compartilhados → mudanças **pequenas e atômicas**.

---

## 7. Integrações planeadas (NÃO implementar sem combinar)

| Integração | Estado | Onde entra |
|---|---|---|
| VLibras (Libras em vídeo) | `BotaoLibras` sob demanda (ADR-0006) | `src/adaptadores/libras/` |
| Tradução em cascata | frase-pronta + nuvem simulada | `/api/traducao` (ADR-0011) |
| Escuta (SpeechRecognition) | TODO em `src/adaptadores/voz/` | Trilha C |
| Supabase (ajuda/Central) | SQL pronto em `supabase/`; sem `.env` | Trilha D |
| Deploy Vercel + QR | pendente | Trilha D (checkpoint 19h: `npm run verificar` verde) |

---

## 8. Emergência (dia da entrega)

- **Prioridade 1:** `npm run verificar` verde + Easter Egg funcionando.
- **Prioridade 2:** README com instruções de execução + demo do fluxo QR → rota → ajuda.
- **Prioridade 3:** telas novas (T05…) — só se não arriscar o acima.
- **Proibido na véspera:** refators grandes, trocar de framework, "limpar" código alheio.
- **Regra de corte (23h):** o que não estiver pronto vira simulação na demo.

---

*Dúvida? Ler `PROXIMOS_PASSOS.md` (plano da equipe) e `docs/13-plano-mvp-riscos-roadmap.md`
antes de inventar — a decisão já está documentada.*
