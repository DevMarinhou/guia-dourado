# 0. Sumário executivo

| Campo | Detalhe |
|---|---|
| **Produto (nome de trabalho)** | **Guia Dourado**: acessibilidade e comunicação universal no Capim Dourado Shopping |
| **Desafio** | 01. Acessibilidade e comunicação universal |
| **Cliente / local** | Capim Dourado Shopping, Palmas/TO (acessos pelas Avenidas JK, NS-05 e LO 2A) |
| **Tecnologia sorteada** | React + Next.js (linguagem TypeScript) |
| **Entrega** | 1ª entrega: planejamento e definição técnica (sexta-feira, 13/11/2026, até 12h). **Não** é o MVP final |
| **Versão do documento** | 2.0, de 13/11/2026 (substitui a v1.0 da equipe) |
| **Fonte dos dados físicos** | `2026_11_CDS_MIX.pdf`: Planta Mix, Operações Capim Dourado Shopping, nov/2026, 38.800,50 m² |

## 0.1 O desafio em três frases

- **Contexto:** o shopping recebe visitantes com diferentes necessidades de comunicação: pessoas surdas, cegas, com deficiência e estrangeiros.
- **Problemática:** nem todos conseguem acessar informações, entender orientações ou se comunicar com os profissionais do shopping com a mesma facilidade e autonomia.
- **Objetivo:** tornar a experiência no shopping mais acessível, inclusiva e independente das limitações de comunicação dos visitantes.

## 0.2 A solução em um parágrafo

O **Guia Dourado** é um aplicativo web progressivo (PWA). O visitante o abre apontando a câmera para um **QR Code** ou encostando o celular numa **etiqueta NFC** com marcação em Braille, presentes nos totens, nas entradas, nas lojas, nas mesas da praça de alimentação e no estacionamento. **Não é preciso instalar nada nem fazer cadastro.** O app já sabe onde a pessoa está, pelo ponto escaneado, e oferece quatro coisas:

1. **Encontrar:** mapa dos dois pavimentos, busca e **rotas acessíveis calculadas por perfil** (por exemplo, sem escadas para cadeira de rodas), com o **status dos elevadores em tempo real** e instruções passo a passo em texto, voz e vibração.
2. **Entender:** toda informação em **voz**, **linguagem simples**, **Libras** (VLibras e vídeos com intérpretes), **português, inglês e espanhol**, com alto contraste e fonte ampliada.
3. **Conversar:** **modo conversa** frente a frente com o atendente, com legenda ao vivo, “digite e o celular fala”, tradução e frases prontas; **prancha de comunicação com pictogramas**; e **videochamada com intérprete de Libras humano**, via parceria.
4. **Pedir ajuda:** um pedido com **localização automática** e **forma de comunicação preferida** chega à **Central da equipe** em tempo real. Para emergências, o app mostra os números 192, 193 e 190.

## 0.3 Diferenciais

| # | Diferencial | Por que importa |
|---|---|---|
| 1 | **Zero instalação, zero cadastro, funciona offline** (mapa, rotas, prancha e frases prontas) | Elimina a barreira de entrada e funciona onde o sinal é fraco |
| 2 | **Perfis por preferência funcional**, não por diagnóstico. Os dados ficam **no aparelho** | Respeito e LGPD por concepção: deficiência é dado sensível (art. 5º, II, e art. 11) |
| 3 | **Rotas determinísticas e auditáveis** (Dijkstra) com pesos por perfil e status de equipamentos | Segurança: rota nunca é “inventada” por IA. Uma rota para cadeira de rodas jamais passa por escada |
| 4 | **Instruções no padrão Wayfindr** (Recomendação ITU-T F.921) | Padrão internacional de navegação por áudio para pessoas com deficiência visual |
| 5 | **Libras de verdade:** VLibras (gratuito, do governo federal) + vídeos com intérpretes + **intérprete humano por vídeo** | Não promete o que a tecnologia ainda não entrega com segurança (reconhecimento de Libras por IA) |
| 6 | **QR + NFC + Braille + código curto** em cada ponto | Pessoa cega não precisa “mirar” um QR (lição da NaviLens, premiada no Tech4Good 2021) |
| 7 | **Central da equipe** (painel web) | O shopping atende pedidos, atualiza elevadores, recebe barreiras reportadas e mede resultados |
| 8 | **IA generativa apenas como apoio** (tradução e linguagem simples, com revisão humana) | Qualidade e responsabilidade: nada crítico depende de IA |

## 0.4 Como este documento atende à 1ª entrega

| Item exigido no edital | Onde está |
|---|---|
| Proposta e estrutura inicial das telas | Capítulo 4 (14 telas, fluxos e rotas) + **Apêndice A** (wireframes) |
| Documentação inicial do projeto | Capítulos 1, 2, 3, 5, 10 a 14 + ADRs (Apêndice B) |
| Linguagem de programação escolhida | Capítulo 6 (TypeScript) |
| Arquitetura proposta | Capítulo 7 (modelo C4, sequências, offline, segurança, implantação) |
| Plataforma e tecnologias adotadas | Capítulo 8 |
| Como a tecnologia sorteada será incorporada | Capítulo 9 (React + Next.js, recurso por recurso) |

## 0.5 Números do planejamento

| Indicador | Valor |
|---|---|
| Telas especificadas | 14 (T00–T13) + 2 páginas institucionais (acessibilidade e privacidade) |
| Requisitos funcionais / não funcionais | 30 / 16 |
| Decisões de arquitetura registradas (ADRs) | 11 |
| Personas / jornadas | 7 / 6 |
| Idiomas no MVP | Português (pt-BR), Inglês, Espanhol + Libras |
| Meta de conformidade | WCAG 2.2 nível AA (alinhada à ABNT NBR 17225:2025), com critérios AAA selecionados |

## 0.6 Histórico de versões

| Versão | Data | Principais mudanças |
|---|---|---|
| 1.0 | 13/11/2026 | Planejamento inicial da equipe: 9 telas (T00–T08), requisitos, arquitetura, stack e grafo extraído da planta |
| 2.0 | 13/11/2026 | Pesquisa de referências premiadas, telas reorganizadas (14), pilar **Conversar** (modo conversa, prancha de pictogramas, intérprete humano), **Central da equipe**, status de elevadores, roteamento no cliente (offline), perfis sem dados sensíveis, QR + NFC + Braille, dados das lojas âncora conferidos na planta, Next.js 16.4 / React 19.3, plano de 24 h para o MVP, ADRs, estratégia de testes e LGPD |
