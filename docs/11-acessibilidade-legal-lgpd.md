# 11. Acessibilidade, conformidade legal, LGPD e segurança

## 11.1 Meta de conformidade

- **WCAG 2.2, nível AA**, em todas as telas, alinhada à **ABNT NBR 17225:2025**.
- Critérios **AAA selecionados**: contraste aprimorado (1.4.6) no tema de alto contraste, tamanho de alvo (2.5.5), sem limite de tempo (2.2.3), localização (2.4.8), leitura e pronúncia simples (3.1.5, via linguagem simples) e **Libras para conteúdo pré-gravado** (1.2.6) nos vídeos institucionais.
- **Declaração de acessibilidade** publicada no app (`/acessibilidade`): nível atingido, limitações conhecidas, data da última avaliação e canal para reportar problemas.

## 11.2 Critérios WCAG 2.2 críticos e como o projeto atende

| Critério | Nível | Como atendemos |
|---|---|---|
| 1.1.1 Conteúdo não textual | A | `alt` obrigatório (lint); mapa com título + **lista equivalente**; pictogramas com rótulo |
| 1.2.2 / 1.2.4 Legendas | A / AA | Vídeos com legenda; conversa com legenda ao vivo |
| 1.2.6 Língua de sinais (pré-gravado) | AAA | Vídeos institucionais com intérprete de Libras |
| 1.3.1 Informações e relações | A | HTML semântico (`header`, `nav`, `main`, listas, `fieldset`/`legend`) |
| 1.3.4 Orientação | AA | Retrato e paisagem |
| 1.4.1 Uso de cor | A | Ícone + texto em status (aberto/fechado, elevador operando/parado) |
| 1.4.3 / 1.4.6 Contraste | AA / AAA | Tokens validados: texto ≥ 4,5:1 (padrão) e ≥ 7:1 (alto contraste). Azul #0B4F8A sobre branco = **8,40:1**; vermelho #B3261E = **6,54:1** |
| 1.4.4 / 1.4.10 Redimensionar / reflow | AA | Escala de fonte até 200%; layout fluido a 320 px |
| 1.4.11 Contraste não textual | AA | Bordas de botões, foco e linhas da rota ≥ 3:1 |
| 1.4.12 Espaçamento de texto | AA | Nenhum texto cortado com espaçamento ampliado |
| 2.1.1 Teclado | A | Tudo operável por teclado e acionadores; mapa com botões |
| 2.2.1 Ajuste de tempo | A | Sem limites; totem avisa antes de reiniciar e permite continuar |
| 2.3.3 Animação por interação | AAA | Respeita `prefers-reduced-motion`; nada pisca |
| 2.4.1 Pular blocos | A | Link “Pular para o conteúdo” |
| 2.4.2 Título da página | A | Metadata API com título único (o anunciador de rotas do Next lê) |
| 2.4.3 / 2.4.7 Ordem e foco visível | A / AA | Ordem lógica; anel de foco de 3 px com contraste ≥ 3:1 |
| 2.4.11 Foco não obscurecido | AA | Botão Ajuda fixo não cobre o elemento focado (`scroll-padding`) |
| 2.5.7 Movimentos de arrastar | AA | Zoom/deslocamento do mapa também por botões |
| 2.5.8 Tamanho do alvo | AA | Mínimo de **48 × 48 px** (acima dos 24 px exigidos) |
| 3.1.1 / 3.1.2 Idioma da página e das partes | A / AA | `lang` dinâmico por idioma; trechos traduzidos marcados com `lang` |
| 3.2.3 / 3.2.6 Navegação consistente / ajuda consistente | AA / A | Cabeçalho e botão Ajuda iguais e no mesmo lugar |
| 3.3.1 / 3.3.3 Erros | A / AA | Mensagens com como corrigir, anunciadas e ligadas ao campo |
| 3.3.7 Entrada redundante | A | Local do pedido preenchido automaticamente |
| 3.3.8 Autenticação acessível | AA | Visitante não faz login; equipe usa senha com gerenciador ou link mágico, **sem CAPTCHA** |
| 4.1.2 Nome, função, valor | A | Radix/shadcn + revisão de ARIA; testes com axe |
| 4.1.3 Mensagens de status | AA | Anunciador `aria-live` único (rota, pedido, erros) |

## 11.3 Estratégias por público

| Público | Estratégia |
|---|---|
| **Surdos (Libras)** | Português → Libras: VLibras (texto dinâmico) + vídeos com intérpretes (conteúdo fixo). Libras → português: **intérprete humano** por vídeo, digitação e pictogramas. Avisos sempre visuais e com vibração. **Não prometemos tradução automática de Libras para português** |
| **Cegos e baixa visão** | Leitores de tela nativos; NFC + Braille nas placas; lista textual do mapa; instruções Wayfindr; voz própria do app opcional (não substitui o leitor de tela); alto contraste e fonte ampliada |
| **Deficiência motora** | Perfil sem degraus, status de elevadores, mesas reservadas, alvos grandes, sem gestos complexos, totem na faixa de alcance |
| **Autismo / deficiência intelectual** | Linguagem simples (W3C COGA), pictogramas, previsibilidade (“o que vai acontecer”), informação sensorial, nada de surpresas sonoras, modo de baixa estimulação (tema calmo, sem animação) |
| **Deficiências ocultas (Lei 14.624/2023)** | Equipe treinada para reconhecer o cordão de girassol; pedido de ajuda sem exigir explicação |
| **Estrangeiros** | Interface e instruções em EN/ES; frases prontas; tradução na conversa |
| **Pessoas idosas** | Sem cadastro, fonte grande, voz, totem, ajuda humana |

## 11.4 Marco legal aplicável

| Norma | O que exige / orienta | Atendimento no projeto |
|---|---|---|
| Lei 13.146/2015 (LBI) | Acessibilidade na informação e comunicação; sites de empresas acessíveis | Meta WCAG 2.2 AA + declaração de acessibilidade |
| Lei 10.436/2002 + Decreto 5.626/2005 | Libras como meio legal de comunicação | VLibras + intérpretes + vídeos |
| Lei 14.624/2023 | Cordão de girassol (deficiências ocultas) | Treinamento + linguagem do app |
| Lei 12.764/2012 + Lei 13.977/2020 | Direitos da pessoa com TEA; CIPTEA | Recursos sensoriais e prancha |
| Lei 10.048/2000 | Atendimento prioritário | Priorização na Central para saúde e criança perdida |
| Lei TO 3.964/2022 (a confirmar) | 3% das mesas da praça de alimentação para PcD/mobilidade reduzida | Camada “mesas reservadas” no mapa |
| ABNT NBR 17225:2025 | Acessibilidade em conteúdo e aplicações web | Checklist de testes |
| ABNT NBR 9050 / NBR 16537 | Acessibilidade em edificações / sinalização tátil | Placas QR/NFC/Braille e totem |
| LGPD (Lei 13.709/2018) | Proteção de dados; dados de saúde são sensíveis | Seção 11.5 |

## 11.5 LGPD: privacidade por concepção

**Princípio:** dados sobre deficiência são **dados pessoais sensíveis** (art. 5º, II), e seu tratamento exige hipóteses específicas (art. 11). Por isso o Guia Dourado **não precisa saber quem a pessoa é nem qual é a sua deficiência** para funcionar.

| Dado | Onde fica | Finalidade | Base legal | Retenção |
|---|---|---|---|---|
| Preferências (tema, voz, perfil de rota…) | **Só no aparelho** | Personalizar a interface | Não há tratamento pelo controlador (não sai do aparelho) | Até o usuário limpar |
| Idioma | Cookie `NEXT_LOCALE` | Exibir no idioma escolhido | Legítimo interesse (essencial ao serviço) | 1 ano |
| Ponto atual (QR) | `sessionStorage` | Contexto de localização | — (local) | Sessão |
| **Pedido de ajuda**: tipo, local, modo de comunicação, idioma, observação opcional | Supabase (São Paulo) | Prestar o atendimento solicitado | **Consentimento específico e destacado** (art. 11, I); em saúde e risco à vida, **proteção da vida e da incolumidade física** (art. 11, II, “e”) | 30 dias → anonimização (RN-05) |
| Hash do token do aparelho | Supabase | Limitar abuso (trote) | Legítimo interesse (segurança) | 30 dias |
| Áudio da conversa | **Não é armazenado** | Legenda ao vivo | — | — |
| Barreira reportada (texto, foto opcional) | Supabase | Corrigir barreiras | Legítimo interesse; orientação para não fotografar pessoas | Até resolver + 90 dias |
| Contadores de leitura de QR | Supabase (agregado por dia) | Medir uso dos pontos | Legítimo interesse (sem dado pessoal) | Indeterminado (agregado) |

**Textos de consentimento (linguagem simples):**
- *Ao pedir ajuda:* “Vamos enviar à equipe do shopping **onde você está** e **como prefere se comunicar** (por exemplo, Libras). Isso serve só para te atender e é apagado em 30 dias. [Enviar pedido] [Voltar]”
- *Na conversa:* “O texto falado é transformado em legenda pelo seu navegador e **não é gravado**. No Chrome, o reconhecimento de fala pode usar servidores do Google.”

**Outras medidas:** aviso de privacidade em `/privacidade`; contato do encarregado (DPO) do shopping; **sem cookies de rastreamento**; analytics sem cookies e agregado; **Relatório de Impacto (RIPD)** simplificado antes do piloto; cuidado com dados de **crianças** (art. 14): o tipo “criança perdida” não coleta nome nem foto da criança no app, e a descrição é feita pessoalmente à equipe.

## 11.6 Ameaças e mitigação (STRIDE simplificado)

| Ameaça | Exemplo | Mitigação |
|---|---|---|
| **Falsificação** | QR falso colado sobre a placa leva a site de golpe | Domínio e código curto impressos; placas com lacre; inspeção semanal; NFC dentro da placa; campanha “confira o endereço” |
| **Adulteração** | Alterar status de elevador | Apenas equipe autenticada (RLS); registro de autoria |
| **Repúdio** | Atendente nega ter aceitado um pedido | Tabela `eventos_pedido` imutável |
| **Divulgação de informação** | Vazamento de pedidos | Visitante não acessa o banco; dados mínimos; anonimização em 30 dias; chave de serviço só no servidor |
| **Negação de serviço** | Robô cria pedidos falsos | Limite por aparelho/IP, confirmação em 2 etapas, marcação de trote, alertas de volume |
| **Elevação de privilégio** | Visitante acessa `/central` | Auth + papéis; Proxy não expõe rotas internas; testes de autorização |
| **XSS** | Script em descrição de barreira | React escapa por padrão; CSP; zod limita tamanho e formato; sem `dangerouslySetInnerHTML` com dados externos |
