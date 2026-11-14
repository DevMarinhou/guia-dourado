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

### 🆘 Pedir ajuda e Central (T08 → T09 → T12)

```bash
# 1) Visitante: /ajuda — formulário em 2 etapas com consentimento LGPD
#    → gera o link de acompanhamento /ajuda/<id>?token=... (T09, atualiza a cada 5 s)
# 2) Equipe: /central — fila em tempo real (atualiza a cada 3 s), aceitar,
#    ir a caminho, concluir, marcar como trote e alternar elevadores/escadas
```

- **Sem Supabase configurado (demo):** tudo funciona em **modo demonstração** — os pedidos
  ficam na memória do servidor (não persistem entre reinícios) e a Central mostra o aviso.
- **Com Supabase (produção):** preencha `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
  no `.env.local` e aplique `supabase/migrations/0001_inicial.sql` no SQL Editor.
- **Chave da Central (opcional):** defina `CENTRAL_CHAVE` no `.env.local` para exigir login
  em `/central`; sem ela, a fila fica aberta (modo demo).
- **Limites (RN-03):** 1 pedido aberto por aparelho e 3 envios a cada 10 min (HTTP 429).

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
entrega/          PDF/DOCX da 1ª entrega, resumo para os mentores, pitch em vídeo e imagens
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

## 🎥 Pitch e materiais da entrega

| Material | Arquivo | O quê |
|---|---|---|
| **Pitch em vídeo (90 s)** | [`entrega/Pitch-90s-v1.mp4`](entrega/Pitch-90s-v1.mp4) | Vídeo de apresentação do produto — roteiro e passo a passo da demo em [`docs/15-pitch-e-demo.md`](docs/15-pitch-e-demo.md) |
| **Resumo para os mentores** | [`entrega/Resumo_para_os_mentores_-_Heracross.pdf`](entrega/Resumo_para_os_mentores_-_Heracross.pdf) | Resumo executivo do produto, do time e das entregas |

> Os dois arquivos estão versionados no repositório: baixe pelo link acima ou abra
> a pasta [`entrega/`](entrega/) direto no GitHub. O vídeo é a **rede de segurança**
> da demo — se o sinal do local falhar, é só dar play.

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
