# AGENTS.md — Regras do projeto Guia Dourado

> **Lê este ficheiro antes de escrever qualquer código.**
> Aplica-se a **todos os agentes de IA** (OpenCode, Claude Code, Cursor, Copilot…)
> e serve de referência para os **colaboradores humanos**.
> Regra de ouro: **não quebrar o que já funciona** — evoluir sem reescrever.

---

## 1. Contexto do projeto

| Campo | Valor |
|---|---|
| Projeto | **Guia Dourado** — acessibilidade e comunicação universal no Capim Dourado Shopping (Palmas/TO) |
| Desafio | Desafio 01 · Hackathon |
| Estado atual | **MVP funcional** — telas T00–T08 (parcial) + Easter Egg |
| Entrega final | **Sábado 14/11/2026 até 12h** (MVP + repo + docs + instruções) |
| Stack | **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 4** |
| Repo | `github.com/DevMarinhou/guia-dourado` · branch principal: `main` |

### Fontes oficiais (não alterar)
- `docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf` — documento oficial da entrega (91 págs). **Fonte da verdade.**
- `docs/PLANEJAMENTO_TECNICO_INICIAL_v2.md` — transcrição gerada do PDF (regenerável, não editar à mão).
- `wireframes/wireframe.html` — wireframes v2 das 14 telas (T00–T13).
- `data/grafo-planta.json` — grafo da planta (219 nós, 593 arestas). Gerado por `data/build_grafo.py`.

---

## 2. Regras de ouro (obrigatórias)

1. **Acessibilidade primeiro.** Toda tela/novo componente precisa:
   - `lang` correto, skip-link, headings hierárquicos (h1 → h2 → h3)
   - Alvos de toque **≥ 48×48 px**
   - Foco visível (`:focus-visible` já global em `globals.css`)
   - Informação **nunca só por cor** — sempre texto/ícone
   - Atualizações dinâmicas com `aria-live`
   - Botões com `aria-pressed`/`aria-current` quando aplicável
   - Testar contraste **4.5:1** (texto) — tema claro e escuro

2. **Não remover funcionalidade existente.** Se precisar mudar comportamento, primeiro comente no PR/issue o *porquê*.

3. **O Easter Egg é intocável.** `src/components/DetalheLocal.tsx` — 13 toques no ♡ → combo secreto. Não renomear, não simplificar, não "limpar". É requisito da missão sexta-feira 13 e precisa continuar **demonstrável ao vivo**.

4. **Português do Brasil** em todo texto visível ao usuário (comentários de código podem ser PT ou EN — manter coerência dentro do ficheiro).

5. **Sem novas dependências sem justificativa.** Preferir Web APIs nativas (Speech, Vibration, Geolocation). Se precisar de pacote, justificar em 1 linha no PR.

6. **Nunca commitar:** `node_modules/`, `.next/`, `.env*`, credenciais, tokens.

7. **Build tem de passar antes do push:** `npm run build` sem erros de tipo/lint.

---

## 3. Mapa do código — onde mexer (e onde NÃO)

```
guia-dourado/
├── src/
│   ├── app/                        # ROTAS (App Router) — cada pasta = uma tela
│   │   ├── layout.tsx              # layout raiz: html lang, skip-link, provider global
│   │   ├── globals.css             # tema (CSS vars), .btn, .card, foco — cuidado ao editar
│   │   ├── page.tsx                # T00 Início
│   │   ├── buscar/page.tsx         # T03 Buscar
│   │   ├── mapa/[piso]/page.tsx    # T02 Mapa (dinâmico)
│   │   ├── locais/[slug]/page.tsx  # T04 Detalhe (SSG)
│   │   ├── conversar/page.tsx      # T06 Conversar
│   │   ├── ajuda/page.tsx          # T08 Pedir ajuda
│   │   └── not-found.tsx           # 404
│   ├── components/                 # componentes reutilizáveis ("use client" quando têm estado)
│   │   ├── DetalheLocal.tsx        # 🥚 T04 + EASTER EGG (não alterar a lógica do egg)
│   │   ├── PreferenciasProvider.tsx# perfil global (localStorage: chave "gd-perfil")
│   │   ├── BarraAcessibilidade.tsx # barra fixa: contraste, fonte, voz
│   │   └── Voz.tsx                 # Web Speech API (BotaoOuvir, LeituraAutomatica)
│   └── data/locais.ts              # catálogo de locais (tipo Local + LOCAIS[])
├── data/grafo-planta.json          # DADOS da planta (gerado — não editar à mão)
├── data/build_grafo.py             # gerador do grafo (requer pdfplumber)
├── docs/                           # documentação oficial (só leitura)
├── wireframes/                     # wireframes de referência (só leitura)
├── AGENTS.md                       # este ficheiro
├── CONTRIBUTING.md                 # guia para colaboradores humanos
└── README.md                       # visão geral + instruções de execução
```

**Pendências do MVP** (próximas telas, se houver tempo): T05 rota passo-a-passo, T07 prancha de pictogramas, T09 acompanhar pedido, T10 avaliar, T11 serviços, T12 Central, T13 totem.

---

## 4. Convenções de código

- **TypeScript estrito** — tipar props e retornos; `any` só em APIs do browser com comentário justificativo.
- **Componentes de página** são `server components` por omissão; adicionar `"use client"` **só** quando houver estado/evento.
- **Dados** ficam em `src/data/*.ts` com tipos exportados (ex.: `Local`). Se for dado da planta → `data/grafo-planta.json`.
- **Estilos:** Tailwind utilities + CSS vars do tema (`var(--azul)`, `var(--vermelho)`…). Classes custom (`.btn`, `.card`) só em `globals.css`.
- **Estado global:** usar `usePreferencias()` (não criar outro context sem necessidade).
- **Ícones:** emojis (não instalar lib de ícones).
- **Nomes:** pastas de rota em minúsculas sem espaços; componentes em PascalCase; rotas dinâmicas `[param]`.

### Padrão de nova tela (copiar e adaptar)

```tsx
// src/app/nova-tela/page.tsx
import Link from "next/link";
import { BarraAcessibilidade } from "@/components/BarraAcessibilidade";

export default function NovaTela() {
  return (
    <>
      <BarraAcessibilidade />
      <main id="conteudo" className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/" className="btn btn-fantasma mb-4">← Início</Link>
        <h1 className="mb-4 text-2xl font-extrabold">Titulo</h1>
        {/* … */}
      </main>
    </>
  );
}
```

---

## 5. Como rodar e verificar

```powershell
npm install          # 1ª vez
npm run dev          # http://localhost:3000
npm run build        # OBRIGATÓRIO antes de push (deve compilar sem erros)
npm start            # produção
```

**Checklist antes de cada push:**
- [ ] `npm run build` passa
- [ ] Testado no navegador (desktop + largura mobile ~360px)
- [ ] Navegável por **teclado** (Tab/Enter percorre tudo)
- [ ] Tema **claro e escuro** verificados
- [ ] Easter Egg ainda funciona: `/locais/outback` → 13 toques no ♡
- [ ] Textos em PT-BR, sem placeholders "lorem"

---

## 6. Fluxo Git

1. Branch por tarefa: `feat/…`, `fix/…`, `docs/…` (ex.: `feat/rota-passo-a-passo`)
2. Commits pequenos e descritivos em PT-BR: `feat: adiciona T05 rota passo-a-passo`
3. Antes de push: `npm run build` ✅
4. Push para `main` (equipe pequena) — **se for mudança arriscada**, abrir PR e pedir revisão a 1 colega
5. Conflitos: preferir **manter a versão local** e re-aplicar a remoto manualmente (equipe pequena, mudanças são lineares)

---

## 7. Integrações planeadas (NÃO implementar sem combinar)

| Integração | Estado | Onde entra |
|---|---|---|
| VLibras (Libras em vídeo) | Painel **simulado** | `DetalheLocal.tsx`, `conversar/page.tsx` |
| API de tradução (DeepL/Google) | **Simulada** | `conversar/page.tsx` |
| Dijkstra com `grafo-planta.json` | Dados prontos, **sem rota T05** | nova `app/rota/` |
| Supabase/PostgreSQL | **Não usado** (sem .env) | fase de produção |
| QR Code / NFC | Fora do MVP (landing lê `?piso=&loja=`) | fase futura |

Se a integração exigir chave secreta → usar `.env.local` + `.env.example` (commitar só o exemplo) e **nunca** chaves reais.

---

## 8. Emergência (dia da entrega)

- **Prioridade 1:** `npm run build` verde + Easter Egg funcionando
- **Prioridade 2:** README com instruções de execução atualizado
- **Prioridade 3:** telas novas (T05…) — só se não arriscar o acima
- **Proibido na véspera:** refators grandes, trocar de framework, "limpar" código alheio

---

*Dúvida? Ler `docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf` antes de inventar arquitetura — a decisão já está lá documentada.*
