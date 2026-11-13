# CONTRIBUTING.md — Guia do colaborador

Bem-vindo(a) à equipe do **Guia Dourado**! 👋

Este repositório é o **MVP do Desafio 01** (entrega final: **sáb 14/11 até 12h**).
Antes de contribuir, leia o **[`AGENTS.md`](AGENTS.md)** — é a fonte das regras do projeto
(para humanos **e** agentes de IA).

## Primeiros passos

```powershell
git clone https://github.com/DevMarinhou/guia-dourado.git
cd guia-dourado
npm install
npm run dev        # http://localhost:3000
```

Requisitos: **Node.js ≥ 18** e npm.

## O que já está pronto (não reescrever)

| Área | Estado |
|---|---|
| T00 Início · T03 Buscar · T02 Mapa · T04 Detalhe · T06 Conversar · T08 Ajuda | ✅ funcionando |
| Easter Egg "Poção Anti-Azar" (13× no ♡ do T04) | ✅ **intocável** — requisito da missão |
| Barra de acessibilidade (contraste, fonte A+/A−, voz) | ✅ global |
| Perfil do visitante (localStorage `gd-perfil`) | ✅ `PreferenciasProvider` |
| Grafo da planta (219 nós) | ✅ `data/grafo-planta.json` |
| T05 rota · T07 prancha · T09–T13 | ❌ pendente |

## Como contribuir

1. **Crie uma branch** por tarefa: `feat/…`, `fix/…`, `docs/…`
2. **Siga as convenções** do `AGENTS.md` §4 (TypeScript estrito, PT-BR, Tailwind + vars do tema)
3. **Checklist antes do push** (AGENTS.md §5):
   - `npm.run build` sem erros
   - testar teclado + tema claro/escuro + mobile
   - confirmar que o **Easter Egg** ainda funciona
4. **Commit descritivo** em PT-BR: `feat: adiciona prancha de pictogramas (T07)`
5. **Push** para `main` (ou PR se a mudança for arriscada)

## Acessibilidade — não negociável

Toda tela nova precisa de: alvos ≥ 48px, foco visível, `aria-live` em atualizações,
contraste 4.5:1, informação nunca só por cor, navegação por teclado.
Na dúvida, teste com **leitor de ecrã** (NVDA/VoiceOver) ou com o botão "🔊 Ouvir" do próprio app.

## O que NÃO fazer

- ❌ Alterar o PDF/MD oficiais em `docs/` ou os wireframes (referência da entrega)
- ❌ Editar `data/grafo-planta.json` à mão (regenerar com `python data/build_grafo.py`)
- ❌ Remover/simplificar o Easter Egg em `DetalheLocal.tsx`
- ❌ Adicionar dependências sem justificar
- ❌ Commitar `.env` com chaves, `node_modules/`, `.next/`
- ❌ Deixar `npm run build` quebrado no `main`

## Dúvidas?

- Arquitetura/decisões → `docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf` (fonte da verdade)
- Regras de código → `AGENTS.md`
- Estrutura das telas → `wireframes/wireframe.html`

---
*Guia Dourado · Equipe do Desafio 01 · FASEC — Faculdade Serra do Carmo*
