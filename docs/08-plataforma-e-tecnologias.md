# 8. Plataforma e tecnologias adotadas

## 8.1 Plataforma

| Decisão | Escolha | Justificativa |
|---|---|---|
| **Plataforma principal** | **Web responsiva / PWA**, mobile-first | Abre direto do QR/NFC, sem loja de apps, sem instalação e sem cadastro. Funciona em Android e iPhone com o leitor de tela nativo |
| **Acesso sem celular** | **Modo totem** (mesma aplicação no Chrome em modo quiosque) | Atende quem não tem celular, tem pouca familiaridade digital ou está sem bateria |
| **Central da equipe** | Web (desktop, tablet ou celular do SAC) | Mesma base de código; login só para a equipe |
| **Hospedagem** | **Vercel**, região **gru1** (São Paulo) | Plataforma nativa do Next.js, CDN, previews por PR, latência baixa em Palmas |
| **Banco, tempo real e autenticação** | **Supabase** (PostgreSQL), região São Paulo | Postgres padrão (sem aprisionamento), Realtime para a Central, Auth para a equipe e plano gratuito |
| **Por que não app nativo** | — | Barreira de instalação, duas bases de código, revisão em lojas. Um app nativo pode ser só um “invólucro” no futuro, se houver demanda |

## 8.2 Stack (versões verificadas em 13/11/2026)

| Camada | Tecnologia | Versão | Papel no projeto |
|---|---|---|---|
| Linguagem | **TypeScript** | 5.x | Tipagem de ponta a ponta (Cap. 6) |
| Framework | **Next.js** (App Router) | **16.4.6** | **Tecnologia sorteada**: RSC, páginas estáticas, Route Handlers, Server Actions, Proxy, Cache Components |
| UI | **React** | **19.3** | Componentes acessíveis, Context, `useActionState`, `useOptimistic` |
| Estilo | Tailwind CSS | 4.3 | Tokens de design em variáveis CSS (temas padrão, escuro e alto contraste) |
| Componentes | shadcn/ui + Radix UI | radix-ui 1.8 | Primitivos acessíveis (Dialog, Tabs, RadioGroup, Switch) com foco e ARIA corretos |
| Ícones | lucide-react | 1.x | Sempre acompanhados de texto |
| Tipografia | **Atkinson Hyperlegible Next** via `next/font` | — | Fonte do Braille Institute desenhada para baixa visão |
| Internacionalização | **next-intl** | 4.15 | pt-BR, en, es; roteamento por idioma; mensagens tipadas |
| PWA / offline | `app/manifest.ts` + **Serwist** | 9.5 | Manifesto e Service Worker com pré-cache |
| Mapa | **SVG inline** + react-zoom-pan-pinch | 4.2 | Leve, vetorial, acessível; sem servidor de mapas |
| Rotas | **Dijkstra próprio** (`src/dominio/rotas`) | — | Determinístico e testável; grafo pequeno (< 1.000 nós) |
| Busca | Índice próprio (normalização + sinônimos) | — | Funciona offline e ocupa poucos KB |
| Voz | **Web Speech API** (SpeechSynthesis / SpeechRecognition) | nativa | Leitura em voz e legenda ao vivo sem custo |
| Tradução | **Porta + adaptadores**: frases prontas (offline) → Translator API do Chrome (no aparelho, desktop/totem) → provedor em nuvem via `/api/traducao` | — | Funciona sem internet nas frases mais comuns; nuvem só quando precisa |
| IA generativa (opcional) | Claude via `@anthropic-ai/sdk` | 1.8 | Tradução contextual e rascunho de **linguagem simples**, sempre com revisão humana. Ver 8.4 |
| Libras | **VLibras** (widget gov.br) + vídeos com intérpretes + **intérprete humano** por vídeo | — | Gratuito e oficial; humano para Libras → português |
| Pictogramas | **Mulberry Symbols** | CC BY-SA | Uso comercial permitido com atribuição (ARASAAC é não comercial) |
| Validação | **zod** | 4.6 | Esquemas compartilhados (formulários, APIs, dados) |
| Back-end | Route Handlers + Server Actions (Node.js 22) | — | Sem servidor separado |
| Banco / tempo real / auth | **Supabase** + `@supabase/supabase-js` / `@supabase/ssr` | 2.119 / 0.12 | Pedidos de ajuda, status, barreiras, login da equipe |
| QR Codes | `qrcode` | 1.5 | Geração das artes das placas (SVG/PDF) em `ferramentas/` |
| NFC | Etiquetas NTAG213/215 com registro NDEF de URL | — | Celulares Android com NFC e iPhones recentes abrem a URL ao encostar, sem app |
| Testes | Vitest · Testing Library · jest-axe · **Playwright + @axe-core/playwright** · **Lighthouse CI** | 5.1 · 16.3 · 11 · 1.65 + 4.14 · 0.16 | Pirâmide de testes com acessibilidade automatizada (Cap. 12) |
| Qualidade | ESLint (`eslint-config-next` 16.4, com `jsx-a11y`) · Prettier 3 · GitHub Actions | — | Regras de acessibilidade já no editor |
| Observabilidade | Vercel Web Analytics (sem cookies) + logs estruturados | — | Métricas agregadas, sem dados pessoais |

## 8.3 Suporte das Web APIs (e alternativa quando não há)

| API | Onde funciona | Sem suporte, o app… |
|---|---|---|
| SpeechSynthesis (falar) | Chrome, Edge, Safari, Firefox (vozes variam por aparelho) | Mostra o texto em destaque |
| SpeechRecognition (ouvir) | Chrome/Edge; Safari (com prefixo `webkit`). Firefox não | Oferece “digitar” no lugar de “falar” |
| Vibration | Chrome no Android. **Safari/iOS não** | Usa som curto + aviso visual |
| Screen Wake Lock (tela acesa na rota) | Chrome no Android; Safari 16.4+ | Pede para tocar na tela de tempos em tempos |
| Web NFC | Só Chrome no Android | **Não dependemos dela**: a etiqueta abre a URL pelo sistema |
| Translator API (tradução no aparelho) | Chrome **desktop** (nov/2026, não no celular) | Usada no **totem**; no celular, frases prontas ou nuvem |

## 8.4 IA generativa: onde entra e onde **não** entra

| Uso | Entra? | Como |
|---|---|---|
| Rotas, instruções, status de equipamentos, emergência | **Não** | Algoritmo determinístico e dados oficiais |
| Tradução de frases livres na conversa (T06) | Opcional | `/api/traducao` → adaptador em nuvem (LLM ou API de tradução). Só a frase é enviada, sem identificadores e sem guardar nada |
| Linguagem simples e traduções de conteúdo de lojas | Sim, **no momento da edição** | Rascunho gerado com apoio de IA → **revisão humana** → publicado como dado estático (RNF-15) |
| Descrição de imagens (pratos, lojas) | Fase 2 | Rascunho de texto alternativo revisado por humanos |

**Adaptador Claude (opcional):** modelo padrão `claude-opus-5-5`, configurável pela variável `LLM_MODEL`. Esforço `low` (`output_config.effort`) para reduzir a latência, saída estruturada com zod (`client.messages.parse`), *fallbacks* do lado do servidor habilitados e tratamento de `stop_reason: "refusal"`. Se a equipe priorizar custo e latência após testar a qualidade, pode trocar para `claude-haiku-5-5`. **Custo estimado** (preços de tabela, nov/2026) para uma frase de cerca de 300 tokens de entrada e 60 de saída:

| Modelo | Entrada / saída (US$ por milhão de tokens) | Custo por frase | 1.000 frases/dia |
|---|---|---|---|
| `claude-opus-5-5` | 4,00 / 20,00 | ≈ US$ 0,0024 | ≈ US$ 2,40 |
| `claude-haiku-5-5` | 0,10 / 0,50 | ≈ US$ 0,00006 | ≈ US$ 0,06 |

> No MVP, a maior parte das conversas usa **frases prontas** (custo zero e offline). A tradução em nuvem é o último recurso e tem **orçamento mensal com corte automático** (RNF-16).

## 8.5 Compatibilidade e tecnologia assistiva

| Plataforma | Navegador | Leitor de tela | Prioridade de teste |
|---|---|---|---|
| Android 10+ | Chrome | TalkBack | **Alta** (maioria dos celulares no Brasil) |
| iOS 16+ | Safari | VoiceOver | **Alta** |
| Totem (Windows ou Linux) | Chrome em modo quiosque | NVDA / Narrador | Média |
| Desktop | Chrome, Edge, Firefox | NVDA, JAWS | Média |

## 8.6 Custos estimados

| Item | MVP (hackathon) | Piloto no shopping |
|---|---|---|
| Hospedagem (Vercel) | Plano gratuito (uso não comercial) | Plano pago por membro da equipe |
| Banco / tempo real (Supabase) | Plano gratuito | Plano pago mensal (backups e sem pausa) |
| VLibras, Web Speech, pictogramas Mulberry | Gratuito | Gratuito |
| Tradução em nuvem / IA | Créditos de teste | Centavos de dólar por dia na escala do piloto (8.4), com teto |
| Placas QR + NFC + Braille | — | Produção gráfica + etiquetas NFC (baixo custo unitário) |
| Intérprete de Libras por vídeo | — | Contrato ou parceria (maior custo recorrente, maior impacto) |
