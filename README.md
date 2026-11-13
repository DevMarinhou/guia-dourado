# Guia Dourado — Acessibilidade e Comunicação Universal no Capim Dourado Shopping

**Desafio 01 · MVP funcional** · Tecnologia sorteada: **React + Next.js (TypeScript)** · Palmas/TO — Av. JK, Av. NS-05, Av. LO 2A · 38.800,50 m²

O **Guia Dourado** é um PWA que o visitante abre por **QR Code + NFC + Braille** (sem instalar nada, sem cadastro) para **encontrar** (mapa, busca e rotas acessíveis por perfil), **entender** (voz, linguagem simples, Libras, alto contraste), **conversar** (voz ↔ texto ↔ idiomas) e **pedir ajuda** (pedido com localização automática à Central da equipe).

---

## 🚀 Instruções de execução

### Pré-requisitos
- **Node.js ≥ 18** (testado com Node 24) — https://nodejs.org
- **npm** (instalado junto com o Node)
- Git (opcional, para clonar o repositório)

### Passo a passo

```powershell
# 1. Clonar o repositório
git clone https://github.com/DevMarinhou/guia-dourado.git
cd guia-dourado

# 2. Instalar dependências
npm install

# 3. Iniciar em modo desenvolvimento
npm run dev
```

Abra **http://localhost:3000** no navegador.

### Build de produção

```powershell
npm run build   # compila
npm start       # inicia em produção
```

### Não há variáveis de ambiente obrigatórias
O projeto roda sem `.env`. (Integrações futuras — VLibras, API de tradução, Supabase — usarão `.env.local` na fase de produção.)

---

## 🥚 Easter Egg — "Prato Secreto: Poção Anti-Azar"

> **Missão sexta-feira 13** — implementado no produto, não só na documentação.

| | |
|---|---|
| **Onde** | T04 — Detalhe do local (`/locais/outback`) |
| **Como ativar** | Tocar **13 vezes** no ícone de favoritar **♡** (canto superior direito do cabeçalho) |
| **O que acontece** | Insere temporariamente o item **"Combo Sexta-feira 13 Sem Sustos — R$ 13,00"** na seção *Cardápio (ilustrativo, fornecido pela loja)* |
| **Acessibilidade** | O item é compatível com os botões **🔊 Ouvir**, **🤟 Libras** e **🧩 Linguagem simples** da mesma tela; ativação anunciada em `aria-live` + fala (Web Speech API) |

*Detalhes da missão em `src/components/DetalheLocal.tsx` (busque por `EASTER EGG`).*

---

## 📱 Telas implementadas no MVP

| ID | Tela | Rota | Estado |
|---|---|---|---|
| T00 | Início (atalhos + destaques) | `/` | ✅ |
| T01 | Preferências (barra fixa) | barra global | ✅ |
| T02 | Mapa por piso | `/mapa/[piso]` | ✅ (simplificado) |
| T03 | Buscar | `/buscar` | ✅ |
| T04 | Detalhe do local + cardápio | `/locais/[slug]` | ✅ **+ Easter Egg** |
| T06 | Conversar (voz/idiomas) | `/conversar` | ✅ (ilustrativo) |
| T08 | Pedir ajuda | `/ajuda` | ✅ |

**Recursos de acessibilidade ativos:** skip-link, foco visível, contraste alto (alternável), tamanho de fonte A+/A−, voz lida (Web Speech API), linguagem simples, Libras (painel), `aria-live`, alvos de toque ≥ 48 px, tema escuro automático.

---

## 📦 Conteúdo do repositório

| Ficheiro | Descrição |
|---|---|
| `src/` | **Código-fonte do MVP** (Next.js App Router + TypeScript + Tailwind) |
| [`docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf`](docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf) | Documento oficial — planeamento técnico v2.0, 91 páginas |
| [`docs/PLANEJAMENTO_TECNICO_INICIAL_v2.md`](docs/PLANEJAMENTO_TECNICO_INICIAL_v2.md) | Transcrição em Markdown (gerada do PDF) |
| [`wireframes/wireframe.html`](wireframes/wireframe.html) | Wireframes das 14 telas (T00–T13) — abrir no browser |
| [`data/grafo-planta.json`](data/grafo-planta.json) | Grafo de navegação da Planta Mix: 219 nós, 593 arestas |
| [`data/build_grafo.py`](data/build_grafo.py) | Script que regenera o grafo (requer `pdfplumber`) |

---

## 🗺️ Estrutura completa das 14 telas (v2)

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

---

## 🗂️ Estrutura do código

```
guia-dourado/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout raiz + skip-link + provider
│   │   ├── page.tsx            # T00 Início
│   │   ├── globals.css         # Tema + componentes base (.btn, .card)
│   │   ├── buscar/page.tsx     # T03 Buscar
│   │   ├── mapa/[piso]/        # T02 Mapa
│   │   ├── locais/[slug]/      # T04 Detalhe (Easter Egg)
│   │   ├── conversar/page.tsx  # T06 Conversar
│   │   └── ajuda/page.tsx      # T08 Pedir ajuda
│   ├── components/
│   │   ├── DetalheLocal.tsx    # 🥚 Easter Egg aqui
│   │   ├── PreferenciasProvider.tsx  # Perfil global (localStorage)
│   │   ├── BarraAcessibilidade.tsx   # Contraste/fonte/voz
│   │   └── Voz.tsx             # Web Speech API
│   └── data/locais.ts          # Catálogo de locais
├── data/                       # Grafo da planta + script Python
├── docs/                       # Documentação oficial (PDF + MD)
└── wireframes/                 # Wireframes v2
```

---

## 🌐 Dados da planta

`data/grafo-planta.json` foi extraído de `2026_11_CDS_MIX.pdf` (Planta Mix, nov/2026) — 219 nós, 593 arestas (139 lojas, 31 quiosques, escadas E2/E3, docas, sanitários, sub-solos). Pendências declaradas em `meta.pendencias` (vetorização oficial na Fase 2, validação com operações).

```powershell
python data\build_grafo.py   # regenera o JSON (requer pdfplumber)
```

---

## 🛠️ Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 4 · Web Speech API · WCAG 2.2 AA

**Roadmap de produção:** VLibras · Supabase/PostgreSQL · Dijkstra no cliente (usando `grafo-planta.json`) · i18n pt/en/es · GitHub Actions (axe-core + Lighthouse CI)

---

## 📅 Entregas

| Data | Entrega |
|---|---|
| 13/11 (sex) | Planeamento técnico v2 + wireframes + Easter Egg implementado ✅ |
| 14/11 (sáb) até 12h | MVP funcional + repositório + documentação + instruções ✅ |

---

## 🤝 Contribuir

**Colaboradores humanos e agentes de IA:** leiam primeiro o **[`AGENTS.md`](AGENTS.md)** (regras do projeto, mapa do código, checklist antes de cada push) e o **[`CONTRIBUTING.md`](CONTRIBUTING.md)** (guia prático de contribuição).

> Regra de ouro: **evoluir sem reescrever** — o que já funciona não se mexe; o Easter Egg é intocável.

---
*Guia Dourado · Equipe do Desafio 01 · MVP de 13/11/2026.*
