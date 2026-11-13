# 6. Linguagem de programação escolhida: TypeScript

## 6.1 Decisão

| Item | Escolha |
|---|---|
| **Linguagem** | **TypeScript 5.x** em modo `strict`, no cliente e no servidor (uma só linguagem) |
| **Runtime** | Node.js 22 LTS (build e Route Handlers) + navegador (React 19) |
| **Framework (tecnologia sorteada)** | React 19.3 + Next.js 16.4 (App Router) |
| **Validação em tempo de execução** | zod 4 (esquemas compartilhados entre cliente, servidor e scripts de dados) |
| **Banco de dados** | SQL (PostgreSQL via Supabase) para pedidos de ajuda, status e barreiras |

## 6.2 Por que TypeScript

| Critério | Benefício concreto no Guia Dourado |
|---|---|
| **Segurança de tipos no domínio** | Planta, grafo, perfis de rota e pedidos de ajuda são estruturas ricas. Um erro silencioso (ex.: aresta de escada sem tipo) pode mandar um cadeirante para uma escada. Tipos discriminados (`tipo: 'elevador' \| 'escada' \| ...`) tornam esse erro **impossível de compilar** |
| **Uma linguagem de ponta a ponta** | O **mesmo módulo de rotas** roda no navegador (offline) e no servidor (validação), e os mesmos esquemas zod validam formulários, APIs e os arquivos de dados no CI |
| **Ecossistema de acessibilidade** | Radix UI / shadcn/ui, axe-core, Testing Library, eslint-plugin-jsx-a11y (já incluso no `eslint-config-next`) e tipos das Web APIs (Speech, Vibration, Wake Lock, NFC) |
| **Exigência da tecnologia sorteada** | React + Next.js têm suporte nativo e de primeira classe a TypeScript (`PageProps`, rotas tipadas, `next.config.ts`) |
| **Equipe e mercado** | Linguagem mais usada no front-end brasileiro; curva curta para quem já sabe JavaScript |

**Alternativas avaliadas:** JavaScript puro (sem garantias de tipo no grafo), Dart/Flutter Web (acessibilidade web mais fraca, já que o conteúdo é desenhado em canvas e depende de uma árvore semântica paralela), Kotlin Multiplatform (exigiria app nativo, o que cria barreira de instalação), Python no back-end (duas linguagens e duas bases de tipos para um MVP de 24 h).

## 6.3 Convenções de código

| Tema | Convenção |
|---|---|
| Idioma do código | **Domínio, componentes e dados em português** (linguagem ubíqua do shopping: `piso`, `local`, `rota`, `pedidoDeAjuda`). Termos técnicos consagrados ficam em inglês (`useX`, `page.tsx`, `route.ts`) |
| Nomes | Componentes em `PascalCase` (`MapaDoPiso`), funções e variáveis em `camelCase`, arquivos em `kebab-case` (`mapa-do-piso.tsx`), tipos em `PascalCase` |
| `tsconfig` | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes` (no domínio) |
| Fronteiras | **Toda entrada externa** (URL, formulário, JSON de dados, resposta de API) passa por um esquema zod |
| Erros | Funções do domínio retornam resultados tipados (`{ ok: true, rota } \| { ok: false, motivo }`); nada de `throw` para fluxo esperado (ex.: “sem rota possível”) |
| Estilo | Prettier + ESLint (config do Next + regras de acessibilidade); `import type` para tipos |
| Comentários | Explicam o **porquê** e citam o requisito (`// RN-01: perfil sem escadas proíbe escada rolante`) |
| Commits | Conventional Commits em português (`feat(rotas): recalcula ao mudar status do elevador`) |

## 6.4 Exemplo: tipos do domínio de rotas

```ts
// src/dominio/tipos.ts (esboço)
export type PisoId = 'subsolo-2' | 'subsolo-1' | 'terreo' | 'praca-alimentacao';

export type TipoAresta =
  | 'plano'
  | 'rampa'
  | 'escada'
  | 'escada_rolante'
  | 'elevador';

export interface Aresta {
  de: string;
  para: string;
  tipo: TipoAresta;
  distanciaM: number;
  pisoTatil: boolean;
  equipamentoId?: string;   // elevador/escada rolante cujo status afeta a rota
  inclinacaoPct?: number;   // rampas: > 8,33% é proibida para cadeira de rodas
  marcos?: string[];        // ids de locais usados como referência na instrução
}

export type PerfilRota = 'padrao' | 'sem_degraus' | 'mobilidade_reduzida' | 'visual' | 'sensorial';

export type ResultadoRota =
  | { ok: true; passos: Passo[]; distanciaM: number; minutos: number }
  | { ok: false; motivo: 'sem_caminho' | 'origem_invalida' | 'destino_invalido' };
```
