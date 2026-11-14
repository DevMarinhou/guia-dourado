# Próximos passos: do planejamento ao MVP (entrega sáb 14/11, 10h)

> Leia isto primeiro. Cada pessoa tem uma trilha com tarefas em ordem de prioridade, os arquivos a editar e o critério de “pronto”. O plano completo e os riscos estão em `docs/13-plano-mvp-riscos-roadmap.md`.

## 1. O que já está pronto (13/11)

| Item | Estado | Onde |
|---|---|---|
| 1ª entrega (planejamento, 91 p.) | ✅ PDF + DOCX | `entrega/` |
| Wireframes v2 (14 telas) | ✅ | `wireframes/index.html` |
| Projeto Next.js 16.4 + React 19.3 + TS estrito | ✅ build ok | `src/` |
| Idiomas pt-BR / en / es (next-intl), negociação pelo aparelho | ✅ | `src/i18n`, `src/mensagens`, `src/proxy.ts` |
| Layout acessível: pular link, cabeçalho, botão Ajuda fixo, anunciador aria-live, temas (padrão/escuro/alto contraste) sem “piscar” | ✅ | `src/app/[locale]/layout.tsx`, `src/componentes/` |
| Botões **Ouvir** (voz) e **Libras** (VLibras sob demanda) | ✅ funcionando | `src/componentes/a11y/` |
| **Domínio de rotas**: Dijkstra + pesos por perfil + instruções PT/EN/ES (Wayfindr) | ✅ testado | `src/dominio/rotas/` |
| **Busca** com acentos, sinônimos, número da loja e erro de digitação | ✅ testada | `src/dominio/busca/` |
| `/q/[CODIGO]` (QR/NFC) → início no idioma do celular com “Você está em…” | ✅ | `src/app/q/[codigo]/route.ts` |
| `/api/traducao` com frases prontas revisadas (offline, custo zero) | ✅ | `src/app/api/traducao/route.ts` |
| Páginas: T00 Início, T02 (lista por piso), T04 (local), T06 (frases), T07 (grade), T08 (emergência), declaração de acessibilidade, privacidade | ✅ parcial | `src/app/[locale]/` |
| Dados semente conferidos na Planta Mix (33 locais, 7 pontos, 3 equipamentos, grafo da demo) | ✅ (grafo ilustrativo) | `dados/` |
| Banco (SQL + RLS + tempo real) | ✅ pronto para aplicar | `supabase/migrations/0001_inicial.sql` |
| Testes: 28 unitários/dados + 66 E2E/axe (10 telas × 3 temas × celular/desktop) | ✅ todos passando | `src/**/*.test.ts`, `tests/` |
| CI (lint, tipos, testes, build, E2E + axe) | ✅ | `.github/workflows/ci.yml` |

### Estado das trilhas (atualizado em 14/11, manhã da entrega)

| Trilha | Itens | Estado |
|---|---|---|
| **A** — Front-end | T01 Preferências, T03 Buscar, T04 completo (+ 🥚 Easter Egg), T11 Serviços | ✅ integrada |
| **B** — Mapa e rotas | T05 Rota (elevador em manutenção), T02 MapaDoPiso (SVG por piso) | ✅ integrada (`e4bf8e3`) |
| **C** — Comunicação | Escuta, T06 Conversar (legenda/tradução/intérprete), T07 Prancha | ✅ integrada (`9fa6185`) |
| **D** — Ajuda e Central | API de ajuda (RN-03, modo demo/Supabase), T08 + T09, T12 Central (polling 3 s), alternância de equipamentos | ✅ integrada (`362a4cf`) |

- `npm run verificar` **verde** · **78 testes E2E/axe** passando (inclui o egg: 13 toques no ♡).
- Modo demo do Supabase ativo por padrão: tudo funciona sem credenciais; com `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` passa a persistir (ver README).
- **Pendências da trilha D:** deploy na Vercel + `URL_BASE=<url> npm run qr:gerar` + impressão das placas (itens 5 do plano).
- Branches `main`, `producao`, `feature/0001`, `feature/0002` sincronizadas em `d991861`.

## 2. Preparar o ambiente (10 min, todos)

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Abra `http://localhost:3000/q/ENT-JK` (QR da entrada) e `http://localhost:3000/es` (espanhol). Antes de cada PR: `npm run verificar`.

## 3. Trilhas por pessoa (estimativas para a maratona)

### A: Front-end e acessibilidade
1. **T01 Preferências** (1h30). `src/app/[locale]/preferencias/page.tsx` + novo Client Component em `src/funcionalidades/preferencias/`. Salvar em `localStorage['gd:preferencias:v1']` (tipo `Preferencias` em `script-preferencias.ts`), aplicar na hora (`data-tema`, `--escala-fonte`), botão “Pular”. **Pronto quando:** recarregar a página mantém o tema sem piscar (CT-07).
2. **T03 Buscar** (1h). Client Component usando `buscarLocais()` (`src/dominio/busca/buscar.ts`) com `locais` vindos do servidor; anunciar “N resultados” com `useAnunciador()`. **Pronto quando:** “ca” → C&A, “banheiro” → sanitários.
3. **T04 completo** (1h). Ouvir (`falar()`), Libras, alternar linguagem simples, recursos de acessibilidade do local (`null` = “não informado”).
4. **T11 Serviços** (30 min) e textos EN/ES das páginas institucionais (30 min).

### B: Mapa e rotas
1. **SVG dos 2 pisos** (2h). Desenhe por cima da Planta Mix (Figma, Inkscape ou retângulos simples) e salve em `public/plantas/terreo.svg` e `praca-alimentacao.svg`. Use o **mesmo sistema de coordenadas** do grafo.
2. **Grafo do trajeto da demo** (1h30). Ajuste `dados/grafo.json` (Entrada JK → ELV-01 → Praça de Alimentação → Mundo Imersivo / Divino Fogão / Mesa 07) com coordenadas do SVG e distâncias calibradas (escala 1:500). Valide com `npm run dados:validar`.
3. **T05 Rota** (2h). Client Component em `src/app/[locale]/rota/`: ler `?para=<slug>` e a origem (`sessionStorage['gd:ponto']` → `pontos.json` → `noId`); buscar `/api/equipamentos` (timeout 2 s); `calcularRota()` + `gerarInstrucoes()`; lista `<ol>` de passos; botões Anterior/Repetir/Próximo com voz; vibração; “Cheguei”. **Pronto quando:** perfil sem degraus usa o elevador e, com ELV-01 em manutenção, usa o ELV-02 (já coberto pelos testes do domínio).
4. **T02 MapaDoPiso** (2h). SVG inline + marcadores como `<button>` + zoom por botões; a lista atual continua como alternativa.

### C: Comunicação
1. **Escuta** (45 min). Implementar `ProvedorEscuta` com `webkitSpeechRecognition` em `src/adaptadores/voz/`.
2. **T06 Conversar** (2h30). Tela dividida (metade de cima girada 180°), idioma por lado, Falar (legenda ao vivo), Digitar (o celular fala), Frases prontas, tradução em cascata (`traduzirEmCascata` com `criarProvedorFrasesProntas` + `provedorNuvem`), botão “Chamar intérprete” (`URL_INTERPRETE_LIBRAS`).
3. **T07 Prancha interativa** (1h30). Tocar → fala a frase + mostra em tela cheia; montar frase com 2–3 pictogramas; ações (`acao.tipo === 'rota'` leva à T05).
4. *(Opcional)* adaptador de nuvem em `/api/traducao` (ADR-0011).

### D: Ajuda, Central e deploy
1. **Supabase** (30 min). Projeto na região São Paulo → SQL Editor → rodar `supabase/migrations/0001_inicial.sql` → criar usuário da equipe (Auth) e inserir a linha em `equipe`.
2. **API de ajuda** (1h30). `src/lib/supabase/` (cliente com chave de serviço, só no servidor); implementar `POST /api/ajuda` (limite RN-03 pelo `aparelho_hash`) e `GET /api/ajuda/[id]?token=`.
3. **T08 + T09** (1h30). Formulário em 2 etapas com consentimento; página de acompanhamento com polling de 5 s e anúncios.
4. **T12 Central** (2h30). Login, assinatura Realtime de `pedidos_ajuda`, ações (aceitar, a caminho, concluir, trote) e alternância de `equipamentos`. Plano B: polling a cada 3 s.
5. **Deploy e placas** (1h). Vercel com as variáveis do `.env.example`; `URL_BASE=<url> npm run qr:gerar` → imprimir `entrega/qr/placas.html`; testar em celulares reais (Android + iPhone).

## 4. Checkpoints

| Hora | O que precisa estar funcionando |
|---|---|
| **19h** | `main` integrada, deploy de preview, `npm run verificar` verde |
| **23h** | Fluxo da demo completo: QR → rota com elevador → conversa → pedir ajuda → aparece na Central |
| **07h** | Congelamento: só correções; `npm run test:e2e` verde; QR impressos |
| **08h30** | Ensaio do pitch 3× + vídeo de backup da demo (`docs/15-pitch-e-demo.md`) |

**Regra de corte (23h):** o que não estiver pronto vira simulação na demo. Melhor 5 telas impecáveis do que 14 quebradas.

## 5. Cuidados

- **Não invente dados de lojas** (cardápio, horário, recursos). Use “não informado” ou marque como ilustrativo.
- **Toda tela nova:** um `h1`, título único (`generateMetadata`), textos em `src/mensagens/*.json`, alvos ≥ 48 px, testada com teclado e TalkBack/VoiceOver.
- **Domínio puro:** nada de React/Next em `src/dominio` (o lint bloqueia).
- **Segredos** só em `.env.local` / Vercel. Nunca no código.
