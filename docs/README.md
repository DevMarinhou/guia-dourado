# Documentação do Guia Dourado

| # | Documento | Para quem | Item da 1ª entrega |
|---|---|---|---|
| 0 | [Sumário executivo](00-sumario-executivo.md) | Banca, equipe | — |
| 1 | [Contexto, problema e objetivos](01-contexto-problema-objetivos.md) | Banca, equipe | Documentação inicial |
| 2 | [Pesquisa e benchmark](02-pesquisa-e-benchmark.md) | Banca, equipe | Documentação inicial |
| 3 | [Personas e jornadas](03-personas-e-jornadas.md) | Equipe, UX | Documentação inicial |
| 4 | [Telas e fluxos](04-telas-e-fluxos.md) + [wireframes](../wireframes/index.html) | Banca, front-end | **Proposta e estrutura das telas** |
| 5 | [Requisitos](05-requisitos.md) | Equipe | Documentação inicial |
| 6 | [Linguagem: TypeScript](06-linguagem.md) | Banca, equipe | **Linguagem escolhida** |
| 7 | [Arquitetura](07-arquitetura.md) | Banca, equipe | **Arquitetura proposta** |
| 8 | [Plataforma e tecnologias](08-plataforma-e-tecnologias.md) | Banca, equipe | **Plataforma e tecnologias** |
| 9 | [Tecnologia sorteada: React + Next.js](09-tecnologia-sorteada-react-nextjs.md) | Banca | **Incorporação da tecnologia sorteada** |
| 10 | [Dados, grafo e rotas](10-dados-e-rotas.md) | Back-end, dados | Documentação inicial |
| 11 | [Acessibilidade, legal, LGPD e segurança](11-acessibilidade-legal-lgpd.md) | Todos | Documentação inicial |
| 12 | [Qualidade e testes](12-qualidade-e-testes.md) | Equipe | Documentação inicial |
| 13 | [Plano do MVP, riscos e roadmap](13-plano-mvp-riscos-roadmap.md) | Equipe | Documentação inicial |
| 14 | [Operação no shopping](14-operacao-no-shopping.md) | Shopping, banca | Documentação inicial |
| 15 | [Pitch e demo](15-pitch-e-demo.md) | Equipe | — |
| — | [ADRs](adr/README.md) | Equipe | Arquitetura |
| — | [Revisão da v1](revisao-da-v1.md) (interno) | Equipe | — |
| — | [Glossário](glossario.md) · [Referências](referencias.md) | Todos | — |

## Documento consolidado para entrega

O arquivo `entrega/PLANEJAMENTO_TECNICO_INICIAL_v2.docx` (e o `.pdf`) junta os capítulos 0 a 14, as ADRs, o glossário e as referências num único documento com sumário. Para gerar de novo após editar os `.md`:

```bash
npm run docs:entrega
```
