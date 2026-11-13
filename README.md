# Guia Dourado — Acessibilidade e Comunicação Universal no Capim Dourado Shopping

**Desafio 01 · 1.ª entrega — planeamento técnico inicial (13/11/2026, até 12h)**
Tecnologia sorteada: **React + Next.js (TypeScript)** · Palmas/TO — Av. JK, Av. NS-05, Av. LO 2A · 38.800,50 m²

O **Guia Dourado** é um PWA que o visitante abre por **QR Code + NFC + Braille** (sem instalar nada, sem cadastro) para **encontrar** (mapa, busca e rotas acessíveis por perfil), **entender** (voz, linguagem simples, Libras, PT/EN/ES, alto contraste), **conversar** (modo frente a frente, prancha de pictogramas, intérprete de Libras) e **pedir ajuda** (pedido com localização automática à Central da equipe).

## Entregas desta fase

| Ficheiro | Descrição |
|---|---|
| [`docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf`](docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf) | **Documento oficial** — planeamento técnico v2.0, 91 páginas (fonte em caso de divergência) |
| [`docs/PLANEJAMENTO_TECNICO_INICIAL_v2.md`](docs/PLANEJAMENTO_TECNICO_INICIAL_v2.md) | Transcrição em Markdown para leitura no GitHub (gerada do PDF) |
| [`wireframes/wireframe.html`](wireframes/wireframe.html) | Wireframes de baixa fidelidade das **14 telas (T00–T13)** + T12 Central — abrir no browser |
| [`data/grafo-planta.json`](data/grafo-planta.json) | Grafo de navegação extraído da Planta Mix (nov/2026): 219 nós, 593 arestas |
| [`data/build_grafo.py`](data/build_grafo.py) | Script que regenera o grafo a partir do PDF da planta (pdfplumber) |

## Estrutura das 14 telas (v2)

| ID | Tela | Rota | Prioridade |
|---|---|---|---|
| T00 | Início (local + atalhos) | `/[locale]` | Must |
| T01 | Preferências funcionais | `/[locale]/preferencias` | Must |
| T02 | Mapa por piso | `/[locale]/mapa/[piso]` | Must |
| T03 | Buscar | `/[locale]/buscar` | Must |
| T04 | Detalhe do local | `/[locale]/locais/[slug]` | Must |
| T05 | Rota passo a passo | `/[locale]/rota?de=&para=` | Must |
| T06 | Conversar (frente a frente) | `/[locale]/conversar` | Must |
| T07 | Prancha de pictogramas | `/[locale]/prancha` | Must · nova |
| T08 | Pedir ajuda | `/[locale]/ajuda` | Must |
| T09 | Acompanhar pedido | `/[locale]/ajuda/[id]` | Must |
| T10 | Avaliar / reportar barreira | `/[locale]/avaliar` | Should |
| T11 | Serviços acessíveis | `/[locale]/servicos` | Should · nova |
| T12 | Central da equipe (interno) | `/central` | Must · nova |
| T13 | Modo totem | `/totem/[ponto]` | Could · nova |

## Como ver os wireframes

```powershell
start wireframes\wireframe.html
```

O ficheiro é autocontido (HTML + CSS), acessível (skip-link, foco visível, contraste, `prefers-reduced-motion`) e mostra o fluxo, cada tela com objetivo/nota de acessibilidade e a tabela de mudanças v1 → v2.

## Dados da planta

`data/grafo-planta.json` foi extraído de `2026_11_CDS_MIX.pdf` (Planta Mix, Operações Capim Dourado Shopping, nov/2026) — 139 lojas, 31 quiosques, escadas E2/E3, docas, sanitários e sub-solos. **Pendências declaradas** (ver `meta.pendencias`): mapear âncoras (C&A, Riachuelo, Marisa, Cinemark, Centauro, Pernambucanas, STZ) para números de loja, substituir coordenadas por vetorização oficial (ADR-0004) e validar adjacências com operações.

```powershell
python data\build_grafo.py   # regenera o JSON (requer pdfplumber)
```

## Stack (definida no documento v2)

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 + shadcn/ui (Radix) · Supabase/PostgreSQL · VLibras · Web Speech API · Dijkstra no cliente · GitHub Actions (axe-core + Lighthouse CI) · WCAG 2.2 AA (ABNT NBR 17225:2025).

---
*Guia Dourado · Equipe do Desafio 01 · Documento v2.0 de 13/11/2026.*
