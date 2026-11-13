# Revisão técnica da v1 (uso interno da equipe)

> Documento para a equipe, não para a banca. Objetivo: registrar o que a v1 acertou, o que precisou ser corrigido e por quê. A v1 foi um **ótimo ponto de partida**: a maior parte da estrutura foi mantida.

## O que a v1 acertou (e foi mantido)

- Cobertura dos **6 itens** exigidos na 1ª entrega.
- **Personas** bem escolhidas (Ana, João, María, Pedro e Carla foram mantidos).
- Ideia central de **grafo com pesos por perfil** e **Dijkstra**.
- **Offline-first**, **QR em totens e mesas**, **KPIs**, **LGPD** e **WCAG 2.2 AA** como meta.
- Uso da **Planta Mix** como fonte real; o script de extração de rótulos (`build_grafo.py`) foi aproveitado para o catálogo.
- Stack TypeScript + Next.js + Tailwind + shadcn/Radix.

## Problemas encontrados (verificados) e correções

| # | Problema na v1 | Evidência | Correção na v2 |
|---|---|---|---|
| 1 | **Grafo sem elevadores e desconexo** | Análise do `grafo-planta.json`: 219 nós, 593 arestas (98% por “proximidade estimada” dos rótulos), **9 componentes desconexos**, **0 elevadores**, 0 transições de piso detectadas automaticamente | Grafo de circulação desenhado com editor + validação no CI (ADR-0004) |
| 2 | **Rota do perfil motor subindo por escada rolante** (T05) | Wireframe T05: “Perfil: motório, sem degraus… Suba pela escada rolante”. No JSON, escada tem peso 5 e escada rolante peso 1, ou seja, permitidas | Escada e escada rolante **proibidas** (∞) nos perfis com restrição; teste automatizado (CT-03) |
| 3 | Semântica de `pesoAcessivel` contraditória | Documento: “0 = proibido”. JSON: 0 = livre, 5 = barreira | Custo explícito por tipo de aresta e perfil (Cap. 10.4) |
| 4 | **Dados de lojas incorretos** | Wireframes: “C&A, Loja 147” e “Outback, Loja 104, 364 m²”. Na planta: **C&A = Loja Âncora A9 (2.099,02 m²)** e **Outback = Loja 32 (499,33 m²)**. A âncora 01 foi associada a “Resolve Palmas”, mas na planta a **Âncora 01 é a Renner (2.027,51 m²)** | Catálogo conferido na planta (Cap. 1.2 e 10.1) |
| 5 | Cardápio com pratos e preços inventados para uma marca real | T03: itens e preços fictícios do Outback | Itens marcados como **ilustrativos**; cardápio real é fornecido pela loja (RN-06) |
| 6 | **Contraste declarado errado** | “#0B4F8A sobre branco (10,6:1)”. Cálculo WCAG: **8,40:1** (ainda passa AAA). Vermelho #B3261E: 6,54:1 | Valores corrigidos; contraste dos tokens testado automaticamente |
| 7 | **Português de Portugal** num projeto para Palmas/TO | “ecrã”, “telemóvel”, “planeamento”, “guardar”, “utilizador”, “contacto”, “âmbito”, “sinónimos”, “alergénios”, “Necessito de apoio”, “Levar-me até aqui” | Tudo em **pt-BR** |
| 8 | Erros de digitação e inconsistências nos wireframes | “OUIR MAPA”; “A− A A+ A+”; T06 com cabeçalho “EN ↔ PT” numa conversa ES ↔ PT; “Passo 1 de 2” sem passo 2 | Corrigidos nos wireframes v2 |
| 9 | Perfil por **categoria de deficiência** enviado automaticamente à central | T01 e T07 | Preferências **funcionais**, só no aparelho; envio só com consentimento (ADR-0007) |
| 10 | “Botão de pânico” mistura emergência com orientação | T07 | **Pedir ajuda** (tipos) + números **192/193/190** + confirmação em 2 etapas |
| 11 | Promessa de **tradução simultânea Libras ↔ fala por API** | Seções 5 e 6 da v1 | VLibras (PT → Libras) + **intérprete humano** (Libras → PT) (ADR-0006) |
| 12 | “Geolocation API para aproximar o piso” | Seção 5.2 da v1 | GPS não funciona bem dentro do prédio nem informa o piso → **âncoras QR/NFC** (ADR-0003) |
| 13 | Rota calculada no servidor | Seção 6.1 da v1 | Rota no **cliente** (offline); o grafo tem poucos KB (ADR-0003) |
| 14 | Página 1 do PDF tratada como piso “mix-l2” | `build_grafo.py` | A folha 1/1 é uma visão geral (inclui subsolos e a planta baixa L2). Os pisos públicos são **Térreo** e **Praça de Alimentação** |
| 15 | Versões desatualizadas | “Next.js 14/15, React 18/19, Tailwind 3/4” | **Next.js 16.4.6, React 19.3, Tailwind 4.3**, versões verificadas no npm em 13/11/2026 |
| 16 | Inconsistência de alvo de toque | RNF: “≥ 44 px”; wireframes: “≥ 48 px” | Padronizado em **48 px** |
| 17 | Cronograma de 7 semanas | Seção 7 da v1 | Plano realista de **24 h** para o MVP + roadmap de 30/60/90 dias (Cap. 13) |
| 18 | Faltavam Central da equipe, prancha de pictogramas, status de elevadores, declaração de acessibilidade, estratégia de testes e ADRs | — | Incluídos (T07, T12, RF-23, Cap. 11 e 12, ADRs) |

## Como reaproveitar o script `build_grafo.py`

- Usar a extração de **rótulos e áreas** (que funciona bem) para gerar `dados/locais.json` (número da loja, área). Os caminhos fixos do Windows devem virar argumentos de linha de comando.
- **Não** usar as arestas por proximidade como grafo de navegação.
- Adicionar as marcas âncora pela leitura visual da planta (tabela do Cap. 1.2).
