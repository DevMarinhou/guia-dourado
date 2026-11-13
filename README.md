# Guia Dourado

**Acessibilidade e comunicação universal no Capim Dourado Shopping (Palmas/TO).** Desafio 01 do hackathon · Tecnologia sorteada: **React + Next.js (TypeScript)**.

PWA que o visitante abre por **QR Code ou NFC** (sem instalar e sem cadastro) para **encontrar** lojas e serviços com **rotas acessíveis por perfil**, **entender** tudo em voz, linguagem simples, **Libras** e PT/EN/ES, **conversar** com a equipe (legenda ao vivo, tradução, pictogramas, intérprete) e **pedir ajuda** com localização automática para a **Central** do shopping.

> 👉 **Equipe: comece por [`PROXIMOS_PASSOS.md`](PROXIMOS_PASSOS.md).**

## Rodar localmente

Requisitos: Node.js 22+.

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Experimente: `http://localhost:3000/q/ENT-JK` (QR da entrada), `/es` (espanhol), `/locais/outback-steakhouse`, `/mapa/praca-alimentacao`, `/prancha`, `/central`.

## Scripts

| Comando | Para quê |
|---|---|
| `npm run dev` / `build` / `start` | Desenvolvimento, build e servidor de produção |
| `npm run verificar` | Lint + tipos + testes + build (rode antes de cada PR) |
| `npm test` | Testes do domínio (rotas, busca) e dos dados |
| `npm run test:e2e` | Playwright + axe (acessibilidade) em 3 temas, celular e desktop |
| `npm run dados:validar` | Valida `dados/*.json` (esquemas, conectividade, rota sem degraus) |
| `npm run qr:gerar` | Gera as placas QR para impressão (`entrega/qr/placas.html`) |
| `npm run docs:entrega` | Regera o PDF/DOCX do planejamento a partir de `docs/*.md` |

## 🥚 Easter Egg — "Prato Secreto: Poção Anti-Azar"

> Missão **sexta-feira 13** — implementado no produto, não só na documentação.

| | |
|---|---|
| **Onde** | T04 — Detalhe do local (`/locais/outback-steakhouse`) |
| **Como ativar** | Tocar **13 vezes** no ícone de favoritar **♡** (canto superior direito do cabeçalho) |
| **O que acontece** | Insere temporariamente o item **"Combo Sexta-feira 13 Sem Sustos — R$ 13,00"** na seção *Cardápio (ilustrativo, fornecido pela loja)* |
| **Acessibilidade** | O item é compatível com os botões **🔊 Ouvir**, **🤟 Libras** e **🧩 Linguagem simples** da mesma tela; ativação anunciada (aria-live) e falada (Web Speech API) |
| **Código** | `src/funcionalidades/detalhe/detalhe-local.tsx` (busque por `EASTER EGG`) + chaves `local.*` em `src/mensagens/*.json` |

## Estrutura

```text
dados/            dados versionados: pisos, locais, grafo, pontos QR, equipamentos, frases, prancha
docs/             documentação (00–15), ADRs, glossário, referências, revisão da v1
entrega/          PDF/DOCX da 1ª entrega e imagens
ferramentas/      scripts: documento de entrega, wireframes, QR
src/app/          rotas Next.js: [locale]/ (visitante), central/, q/[codigo], totem/, api/
src/dominio/      TypeScript puro: tipos, esquemas zod, Dijkstra, instruções, busca
src/funcionalidades/  código por funcionalidade (preferências, localização…)
src/adaptadores/  voz, tradução, Libras (VLibras), tempo real
src/componentes/  layout e componentes de acessibilidade
supabase/         migração SQL (pedidos de ajuda, equipamentos, RLS)
tests/            testes de dados e E2E (Playwright + axe)
wireframes/       wireframes v2 navegáveis
```

## Documentação

Índice em [`docs/README.md`](docs/README.md). Destaques: [telas](docs/04-telas-e-fluxos.md) · [arquitetura](docs/07-arquitetura.md) · [tecnologia sorteada](docs/09-tecnologia-sorteada-react-nextjs.md) · [dados e rotas](docs/10-dados-e-rotas.md) · [acessibilidade e LGPD](docs/11-acessibilidade-legal-lgpd.md) · [plano do MVP](docs/13-plano-mvp-riscos-roadmap.md) · [pitch](docs/15-pitch-e-demo.md).

## 🤝 Contribuir

**Colaboradores humanos e agentes de IA:** leiam primeiro o **[`AGENTS.md`](AGENTS.md)**
(regras do projeto, mapa do código, checklist antes de cada push) e o **[`CONTRIBUTING.md`](CONTRIBUTING.md)**
(fluxo de PRs e definição de pronto). O plano da equipe está em [`PROXIMOS_PASSOS.md`](PROXIMOS_PASSOS.md).

> Regra de ouro: **evoluir sem reescrever** — o que já funciona não se mexe; o Easter Egg é intocável.

## Créditos e licenças de terceiros

- Planta Mix nov/2026: Operações Capim Dourado Shopping (uso no contexto do hackathon).
- VLibras: Governo Federal (gratuito, código aberto).
- Pictogramas previstos: Mulberry Symbols (CC BY-SA, com atribuição).
- Fonte Atkinson Hyperlegible Next: Braille Institute (SIL Open Font License).
