# 5. Requisitos

Prioridade **MoSCoW**: **M** = Must (MVP), **S** = Should (MVP se der tempo), **C** = Could (pós-hackathon), **W** = Won't (fora do escopo atual).

## 5.1 Requisitos funcionais

| ID | Requisito | Prior. | Tela |
|---|---|---|---|
| RF-01 | Resolver o código de um ponto (QR, NFC ou código curto digitado) em **contexto de localização** (ponto, piso, nó do grafo) e redirecionar ao início | M | `/q`, T00 |
| RF-02 | Permitir **“Onde estou?”** manual, escolhendo um ponto de referência em lista com busca | M | T00 |
| RF-03 | Gerenciar **preferências funcionais** (ver, ouvir, entender, comunicar, locomover, sentir), salvas **somente no aparelho** e aplicadas antes da primeira pintura | M | T01 |
| RF-04 | Oferecer **pt-BR, en e es**, com detecção automática pelo idioma do aparelho e troca em 1 toque | M | Global |
| RF-05 | **Ler em voz alta** a tela atual e conteúdos específicos, com controle de velocidade | M | Global, T04, T05 |
| RF-06 | Ativar **Libras sob demanda** (VLibras) para o texto da tela e exibir **vídeo em Libras** quando existir | M | Global, T04 |
| RF-07 | Exibir **mapa por piso** (SVG) com botões de zoom/deslocamento, camadas e marcadores focáveis | M | T02 |
| RF-08 | Oferecer **alternativa textual completa** do mapa (lista por setor e distância) | M | T02 |
| RF-09 | **Buscar** por nome, número, categoria e sinônimos, tolerando acentos e erros de digitação, com entrada por voz | M | T03 |
| RF-10 | Exibir **detalhe do local**: nome, número, piso, categoria, horário, aberto/fechado, recursos de acessibilidade e descrição em linguagem simples | M | T04 |
| RF-11 | **Calcular rota acessível por perfil**, considerando o **status dos equipamentos** (elevadores e escadas rolantes) | M | T05 |
| RF-12 | Apresentar **instruções passo a passo** em texto, voz e vibração (padrão Wayfindr), com “repetir/próximo/anterior” | M | T05 |
| RF-13 | **Recalcular** a rota quando o perfil ou um equipamento mudar, explicando o motivo | S | T05 |
| RF-14 | **Modo conversa** frente a frente com **legenda ao vivo** (reconhecimento de fala) | M | T06 |
| RF-15 | **“Digite e o celular fala”** e **frases prontas** disponíveis offline | M | T06 |
| RF-16 | **Traduzir** entre PT, EN e ES os dois lados da conversa | M | T06 |
| RF-17 | Atalho **“Chamar intérprete de Libras”** (videochamada, URL configurável pelo shopping) | S | T06 |
| RF-18 | **Prancha de pictogramas** com fala, texto em destaque, tradução e montagem de frase | M | T07 |
| RF-19 | **Pedido de ajuda** em 2 etapas: tipo, local (editável) e modo de comunicação, com **consentimento explícito** | M | T08 |
| RF-20 | Exibir **números de emergência** (192, 193, 190) com discagem direta | M | T08 |
| RF-21 | **Acompanhar o pedido** com anúncios acessíveis e vibração; permitir cancelar e atualizar o local | M | T09 |
| RF-22 | **Central:** fila em tempo real com alerta sonoro e visual, priorização e ciclo de vida do pedido (aceitar, a caminho, concluir, trote) | M | T12 |
| RF-23 | **Central:** alternar status de elevadores e escadas rolantes, refletindo no cálculo de rotas | M | T12 |
| RF-24 | **Avaliar a rota** e **reportar barreira** georreferenciada; o formulário funciona sem JavaScript | S | T10 |
| RF-25 | **Central:** triagem e resolução de barreiras reportadas | S | T12 |
| RF-26 | **Serviços acessíveis:** lista com rota em 1 toque | S | T11 |
| RF-27 | Camadas **sensorial** (ruído/tranquilidade) e **mesas reservadas PcD** no mapa | S | T02 |
| RF-28 | **Funcionamento offline** de mapa, busca, rotas, prancha e frases prontas (PWA) | S | Global |
| RF-29 | **Modo totem:** reinício automático com aviso, limpeza de dados entre usuários e layout na faixa de alcance | C | T13 |
| RF-30 | **Declaração de acessibilidade** e **aviso de privacidade** em linguagem simples | M | Institucional |

## 5.2 Requisitos não funcionais

| ID | Categoria | Requisito |
|---|---|---|
| RNF-01 | Acessibilidade | **WCAG 2.2 AA** (ABNT NBR 17225:2025) em todos os fluxos; AAA selecionados: contraste ≥ 7:1 no tema de alto contraste, alvos ≥ 48 px, linguagem simples |
| RNF-02 | Tecnologia assistiva | Compatível com **TalkBack** (Android/Chrome), **VoiceOver** (iOS/Safari), **NVDA** (Windows), teclado e acionadores (*switch*) |
| RNF-03 | Desempenho | p75 em 4G: **LCP ≤ 2,5 s**, **INP ≤ 200 ms**, **CLS ≤ 0,1**; JS inicial ≤ 170 KB gzip por rota do visitante |
| RNF-04 | Disponibilidade | 99,5% no piloto; funções críticas **offline** |
| RNF-05 | Privacidade | Nenhum dado sensível sai do aparelho sem consentimento explícito; sem cookies de rastreamento; **sem gravação de áudio** |
| RNF-06 | Segurança | HTTPS, CSP, validação **zod** em todas as entradas, limite de requisições, autenticação da equipe, **RLS** no banco, segredos só no servidor |
| RNF-07 | Internacionalização | 100% dos textos em arquivos de mensagens (pt-BR, en, es); `lang` correto na página e em trechos em outro idioma |
| RNF-08 | Compatibilidade | Últimas 2 versões de Chrome, Safari, Edge e Firefox; Android ≥ 10, iOS ≥ 16; largura mínima de 320 px |
| RNF-09 | Usabilidade | SUS ≥ 80; tarefa crítica em ≤ 3 interações; teste com ≥ 5 pessoas com deficiência de perfis diferentes antes do piloto |
| RNF-10 | Manutenibilidade | TypeScript `strict`; domínio puro com cobertura ≥ 90%; ESLint sem erros; decisões registradas em ADR |
| RNF-11 | Qualidade contínua | CI em cada PR: lint, typecheck, testes unitários, E2E com **axe** e **Lighthouse CI** |
| RNF-12 | Dados atualizáveis | Planta, grafo e catálogo **versionados e validados por esquema**; trocar loja sem mudar código (fase 2: CMS) |
| RNF-13 | Observabilidade | Logs estruturados **sem dados pessoais**; métricas agregadas (scans por ponto, pedidos, tempo de atendimento) |
| RNF-14 | Tempo real | Novo pedido aparece na Central em **≤ 2 s**; status chega ao visitante em **≤ 5 s** |
| RNF-15 | Governança de conteúdo | Traduções e versões em linguagem simples feitas com apoio de IA passam por **revisão humana** antes de publicar |
| RNF-16 | Custos | MVP em planos gratuitos; custo variável de tradução com **orçamento mensal e corte automático** |

## 5.3 Regras de negócio

| ID | Regra |
|---|---|
| RN-01 | Com o perfil **“evitar escadas”**, arestas de escada e escada rolante são **proibidas**. Sem rota possível, o app informa e oferece **acompanhamento** (T08) |
| RN-02 | Equipamento em **manutenção** ou **fora de serviço** sai do grafo para todos os perfis até ser reativado na Central |
| RN-03 | No máximo **1 pedido de ajuda aberto por aparelho** e **3 pedidos a cada 10 min** por aparelho/IP. Tipos *saúde* e *criança perdida* têm prioridade máxima |
| RN-04 | Pedido sem aceite em **2 min** gera alerta escalonado na Central (supervisor) |
| RN-05 | Pedidos são **anonimizados após 30 dias**; ficam só estatísticas agregadas |
| RN-06 | Conteúdo de loja e cardápio é de responsabilidade da loja; o app mostra a **data da última atualização** |
| RN-07 | Código de ponto inexistente ou desativado abre T00 com “Onde estou?” e registra o código para manutenção |
| RN-08 | A rota termina ao tocar em “Cheguei” ou após 30 min sem interação; então o Wake Lock é liberado |

## 5.4 Histórias de usuário críticas (com critérios de aceite)

**US-01: Chegar já localizado (RF-01)**
*Como* visitante, *quero* que o app abra sabendo onde estou *para* não precisar procurar no mapa.
```gherkin
Dado que estou na Entrada Av. JK
Quando escaneio o QR ou encosto o celular na placa "ENT-JK"
Então o app abre o Início em até 2,5 s no 4G
E mostra "Você está em: Entrada Av. JK · 1º pavimento"
E, se a voz estiver ativada, anuncia o local
```

**US-02: Rota sem degraus com elevador parado (RF-11, RF-13, RN-01, RN-02)**
```gherkin
Dado que minha preferência é "evitar escadas"
E que a Central marcou o elevador ELV-01 como "manutenção"
Quando peço rota da Entrada Av. JK ao Mundo Imersivo (2º pavimento)
Então a rota não contém escada nem escada rolante
E usa outro elevador disponível
E o app informa "Elevador ELV-01 em manutenção, rota ajustada"
E, se não houver elevador disponível, oferece "Pedir acompanhamento"
```

**US-03: Conversa com atendente (surdo) (RF-14, RF-15)**
```gherkin
Dado que estou na tela Conversar com o lado do atendente em português
Quando a atendente fala "Temos no tamanho M"
Então a frase aparece na minha metade da tela em até 2 s, em letras grandes
Quando eu digito "Posso experimentar?" e toco em Falar
Então o celular fala a frase em voz alta e mostra o texto na metade da atendente
```

**US-04: Pedir ajuda (RF-19, RF-21, RF-22)**
```gherkin
Dado que estou na Mesa 07 da Praça de Alimentação (via QR)
Quando toco em Ajuda, escolho "Comunicação" e confirmo "Prefiro texto/Libras"
Então a Central recebe o pedido em até 2 s com local, tipo e modo de comunicação
E quando a atendente aceita, ouço/vejo "Luana está a caminho" em até 5 s
```

**US-05: Mapa para quem usa leitor de tela (RF-08)**
```gherkin
Dado que uso o TalkBack
Quando abro o Mapa e ativo "Ver como lista"
Então todos os locais do piso estão acessíveis por navegação linear, com nome, setor e distância
E cada item tem as ações "Detalhes" e "Como chegar"
```

**US-06: Prancha de pictogramas (RF-18)**
```gherkin
Dado que estou na Prancha
Quando toco em "Banheiro" e depois em "Onde?"
Então o app mostra "Onde fica o banheiro?" em destaque, fala a frase
E oferece "Como chegar ao sanitário mais próximo"
```

## 5.5 Rastreabilidade (resumo)

| Requisito | Tela | Módulo (`src/`) | Teste principal |
|---|---|---|---|
| RF-01, RF-02 | T00 | `funcionalidades/localizacao`, `app/q/[codigo]` | E2E `qr-contexto.spec.ts` |
| RF-03 | T01 | `funcionalidades/preferencias` | Unit + E2E `preferencias.spec.ts` |
| RF-07, RF-08, RF-27 | T02 | `funcionalidades/mapa` | E2E + axe `mapa.spec.ts` |
| RF-09 | T03 | `dominio/busca` | Unit `busca.test.ts` |
| RF-11 a RF-13 | T05 | `dominio/rotas`, `funcionalidades/rotas` | Unit `dijkstra.test.ts`, `instrucoes.test.ts` |
| RF-14 a RF-17 | T06 | `funcionalidades/conversa`, `adaptadores/voz`, `adaptadores/traducao` | E2E com mocks de voz |
| RF-18 | T07 | `funcionalidades/prancha` | E2E `prancha.spec.ts` |
| RF-19 a RF-23 | T08, T09, T12 | `funcionalidades/ajuda`, `funcionalidades/central` | E2E `ajuda-central.spec.ts` |
