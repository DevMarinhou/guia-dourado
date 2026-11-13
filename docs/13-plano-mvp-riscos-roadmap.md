# 13. Plano do MVP (24 h), riscos e roadmap

## 13.1 Escopo do MVP (entrega final: 14/11, 10h)

| Prioridade | Itens |
|---|---|
| **Must** (demo obrigatória) | T00 Início com contexto do QR · T01 Preferências (tema, fonte, voz, “evitar escadas”) · T02 Mapa dos 2 pisos + lista · T03 Buscar · T04 Detalhe com “Ouvir” e VLibras · T05 Rota com Dijkstra e elevador · T06 Conversar (legenda, digitar e falar, frases prontas, tradução) · T07 Prancha · T08/T09 Pedir e acompanhar ajuda · T12 Central em tempo real (fila + status de elevador) · PT/EN/ES · Declaração de acessibilidade |
| **Should** | T10 Avaliar/reportar · T11 Serviços acessíveis · PWA offline · camada de mesas reservadas e camada sensorial |
| **Could** | T13 Totem · editor visual de grafo · “Onde estacionei?” |
| **Won’t (agora)** | Posicionamento indoor contínuo, app nativo, contas de visitante, reconhecimento de Libras por IA, integração com estacionamento/CFTV |

## 13.2 Divisão da equipe (para 4 pessoas; adaptar se forem 3 ou 5)

| Papel | Responsabilidades | Entregáveis |
|---|---|---|
| **A: Front-end e acessibilidade** (líder de UI) | Layout, tokens/temas, componentes a11y (Anunciador, LerEmVoz, BotaoAjuda), T00, T01, T03, T04, i18n | Casca do app acessível + telas de conteúdo |
| **B: Mapa e rotas** | SVG simplificado dos 2 pisos, grafo (editor ou JSON à mão), Dijkstra, instruções, T02 e T05 | Rota Entrada JK → Praça de Alimentação via elevador funcionando |
| **C: Comunicação** | Hooks de voz, T06 Conversar (tela dividida, frases, tradução), T07 Prancha, VLibras | Conversa ao vivo e prancha |
| **D: Ajuda, Central e deploy** | Supabase (SQL, RLS), `/api/ajuda`, T08, T09, T12 (Realtime), status de equipamentos, deploy Vercel, QR de demo | Pedido de ajuda ponta a ponta + URL pública |

Com 3 pessoas, C e A se dividem a parte de comunicação. Com 5, a 5ª pessoa cuida de **conteúdo** (textos em linguagem simples, traduções, catálogo, roteiro da demo) e **testes**.

## 13.3 Cronograma (sexta 13/11 → sábado 14/11)

| Horário | Marco | Responsáveis |
|---|---|---|
| **Sex 12:00** | ✅ 1ª entrega (este planejamento) | Todos |
| 12:00–13:00 | Almoço + leitura deste documento + divisão final das tarefas | Todos |
| 13:00–15:00 | **Fundação:** projeto Next.js 16 (já criado), layout, temas, i18n, componentes a11y; Supabase criado e migração aplicada; dados mínimos (locais âncora + praça de alimentação) | A, D, C; B inicia o SVG |
| 15:00–19:00 | **Funcionalidades núcleo:** busca + detalhe; grafo + rota; conversa + prancha; pedido de ajuda + Central | A, B, C, D (em paralelo) |
| 19:00 | 🔁 **Checkpoint 1:** integração na `main`, deploy de preview, primeira passada de axe | Todos |
| 19:00–23:00 | Mapa interativo + lista, instruções em voz, tradução, Realtime, status de elevador na rota | B, C, D |
| 23:00 | 🔁 **Checkpoint 2:** fluxo da demo completo (QR → rota → conversa → ajuda → Central) | Todos |
| 23:00–03:00 | Offline (PWA), T10/T11, textos EN/ES, linguagem simples, correções de acessibilidade | Revezamento (metade descansa) |
| 03:00–07:00 | Descanso em turnos; quem estiver acordado: testes manuais (teclado, TalkBack) e correções | Revezamento |
| 07:00–08:30 | **Congelamento de funcionalidades.** Só correções. Lighthouse e axe. Imprimir QR de demo | Todos |
| 08:30–09:30 | Ensaios do pitch e da demo (3×), plano B (vídeo gravado da demo) | Todos |
| **Sáb 10:00** | ✅ **Entrega final do MVP** | Todos |

> **Regra de corte:** se às 23h algum “Must” não estiver funcionando, ele vira **simulado na demo** (ex.: tradução com frases prontas apenas) e o tempo vai para polir o fluxo principal. Melhor 5 telas impecáveis e acessíveis do que 14 quebradas.

## 13.4 Backlog inicial (estimativas para a maratona)

| Épico | Tarefas | Estimativa |
|---|---|---|
| Fundação | Tokens CSS e temas; fonte; layout `[locale]`; cabeçalho; botão Ajuda; anunciador; next-intl; manifest | 3 h |
| Dados | `pisos`, `locais` (âncoras + praça de alimentação + sanitários + elevadores), `pontos`, `equipamentos`, `frases-prontas`, `prancha` | 2 h |
| Mapa | SVG simplificado (2 pisos) + marcadores + zoom por botões + lista | 4 h |
| Rotas | Grafo (~60–100 nós), Dijkstra, pesos, instruções, T05 com voz/vibração | 5 h |
| Busca/local | Índice com sinônimos, T03, T04, ouvir, VLibras | 3 h |
| Conversa/prancha | Tela dividida, STT/TTS, frases, tradução (porta + 1 adaptador), prancha com 24 pictogramas | 5 h |
| Ajuda/Central | SQL + RLS, `/api/ajuda`, T08, T09 (polling), T12 (Realtime, status de equipamentos), login | 5 h |
| Qualidade | Playwright + axe nas rotas principais; Lighthouse; testes do Dijkstra | 2 h |
| Demo | QR impressos, roteiro, vídeo de backup | 1 h |

## 13.5 Riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| Desenhar o grafo/mapa leva mais tempo que o previsto | Alta | Alto | Começar pelo **trajeto da demo** (Entrada JK → elevador → Praça de Alimentação) e ampliar depois; o mapa pode ser um SVG simplificado |
| Reconhecimento de fala falha no local da apresentação (rede/ruído) | Média | Alto | Frases prontas e digitação; demo com fone; vídeo de backup |
| Posição real dos elevadores incerta na planta | Alta | Médio | Marcar como “a validar”; usar posição provável na demo e declarar a premissa |
| Supabase Realtime não configurado a tempo | Média | Alto | Plano B: polling a cada 3 s na Central (mesma experiência na demo) |
| VLibras indisponível (serviço do governo fora do ar) | Média | Médio | Vídeo curto em Libras gravado para a demo; mensagem de indisponibilidade |
| Cansaço da equipe e conflitos de merge | Alta | Médio | Turnos de descanso; PRs pequenos; dono por pasta (13.2); checkpoints |
| Escopo grande demais | Alta | Alto | MoSCoW rígido + regra de corte às 23h |
| Dados de lojas desatualizados | Média | Baixo | Usar só o que foi conferido na Planta Mix; marcar o restante como ilustrativo |

## 13.6 Roadmap pós-hackathon

| Fase | Prazo | Entregas |
|---|---|---|
| **Piloto controlado** | 30 dias | Grafo completo validado em visita técnica; 20 placas QR+NFC+Braille (entradas, elevadores, SAC, praça de alimentação); Central no SAC; treinamento da equipe; testes com ASP e associação de deficientes visuais |
| **Piloto aberto** | 60 dias | CMS na Central (lojas, cardápios, avisos); vídeos em Libras; parceria com central de intérpretes; totem na entrada principal; camada sensorial validada; hora silenciosa divulgada |
| **Consolidação** | 90 dias | Indicadores (Cap. 1); declaração de acessibilidade auditada; inscrição em prêmios (Abrasce, Líderes de Acessibilidade); subsolos no mapa (“do carro ao destino”) |
| **Escala** | 6–12 meses | Posicionamento contínuo (beacons ou câmera); NaviLens; exportação IMDF; replicação para outros shoppings da administradora (multi-tenant); certificação sensorial (KultureCity/IBCCES) de áreas do shopping |
