# 3. Personas e jornadas

> As personas são **hipóteses** a validar com pessoas reais (ver Cap. 12, testes com usuários em parceria com a Associação dos Surdos de Palmas e a Associação dos Deficientes Visuais do Estado do Tocantins, ambas com assento no Conselho Municipal dos Direitos da Pessoa com Deficiência de Palmas). Princípio: **“Nada sobre nós sem nós.”**

## 3.1 Personas

| # | Persona | Perfil | Necessidades principais | Frustrações atuais | Recursos do Guia Dourado |
|---|---|---|---|---|---|
| P1 | **Ana**, 68 | Baixa visão (glaucoma); usa o celular com fonte grande | Ler sem esforço, rota por elevador, cardápio em voz | Placas pequenas, cardápios impressos, reflexo nas vitrines | Alto contraste, fonte 200%, leitura em voz, rota com elevador |
| P2 | **Marcos**, 30 | Cego; usa TalkBack e bengala | Saber onde está, rota por áudio com referências táteis, ajuda humana rápida | Não acha o QR, apps com botões sem rótulo, mapas só visuais | NFC + Braille, lista textual do mapa, instruções Wayfindr, botão de ajuda acessível |
| P3 | **João**, 34 | Surdo; Libras é sua 1ª língua; lê português com alguma dificuldade | Comunicar-se com atendentes, entender avisos | Atendimento só oral, vergonha de pedir para repetir | Modo conversa (legenda), VLibras, vídeos em Libras, intérprete por vídeo, pictogramas |
| P4 | **María**, 41 | Turista argentina; fala espanhol e um pouco de inglês | Achar lojas, perguntar preços e tamanhos | Sinalização só em português, equipe não fala espanhol | App em espanhol, tradução na conversa, frases prontas |
| P5 | **Pedro**, 27 | Usuário de cadeira de rodas | Rotas sem degraus, elevador funcionando, sanitário PNE, mesa adequada | Escada rolante como caminho aparente, elevador parado sem aviso | Perfil “sem degraus”, status de elevadores, mesas reservadas no mapa |
| P6 | **Carla**, 9, com o avô **Seu Raimundo**, 72 | Carla é autista (hipersensível a ruído). Seu Raimundo tem pouca familiaridade com tecnologia e mobilidade reduzida | Áreas tranquilas, previsibilidade, comunicação por imagens; para ele, botões grandes, sem cadastro | Barulho, multidão, apps complexos | Mapa sensorial, prancha de pictogramas, linguagem simples, modo totem |
| P7 | **Luana**, 26 | Atendente do SAC (operadora da Central) | Saber **quem** precisa de ajuda, **onde** e **como se comunicar** com a pessoa | Recebe pedidos por rádio sem contexto; não sabe Libras | Central em tempo real com local, tipo de ajuda e modo de comunicação; roteiros de atendimento |

## 3.2 Jornadas principais

### J1: Ana vai almoçar na Praça de Alimentação (baixa visão, mobilidade reduzida)

| Etapa | Ação | Tela | Recurso |
|---|---|---|---|
| 1 | Escaneia o QR do totem da entrada Av. JK | T00 | O app abre já dizendo “Você está na Entrada Av. JK” (voz, se ativada) |
| 2 | Toca em “Ler em voz alta” e “Letra grande” | T01 (atalho) | Preferências aplicadas na hora, sem cadastro |
| 3 | Busca “comida caseira” | T03 | Busca por sinônimos → Divino Fogão (Loja 209, 2º pavimento) |
| 4 | “Como chegar”, preferindo elevador | T05 | Rota com elevador; cada passo em voz e texto grande |
| 5 | Chega e avalia a rota | T10 | Avaliação por voz ou toque |

### J2: Marcos procura o sanitário mais próximo (cego, TalkBack)

| Etapa | Ação | Tela | Recurso |
|---|---|---|---|
| 1 | Encontra a placa pelo relevo e encosta o celular (NFC) | — | Abre o app sem precisar mirar |
| 2 | Ouve “Você está na Praça de Eventos central. Destaques: Sanitários, Ajuda” | T00 | Título único, foco no `h1`, ordem lógica |
| 3 | Escolhe “Sanitários” | T03 | Lista ordenada por distância, em texto |
| 4 | Segue as instruções por áudio | T05 | Padrão Wayfindr: “Siga em frente 20 metros. A loja Riachuelo fica à sua esquerda.” Vibração ao virar |
| 5 | Se perder, toca em “Pedir ajuda” | T08 | Pedido com local da última placa lida |

### J3: João troca um produto numa loja (surdo, Libras)

| Etapa | Ação | Tela | Recurso |
|---|---|---|---|
| 1 | Na loja, abre “Conversar” | T06 | Tela dividida: metade para ele, metade (girada) para a atendente |
| 2 | Atendente fala; João lê a legenda ao vivo (com avatar VLibras opcional) | T06 | Reconhecimento de fala → texto grande |
| 3 | João digita a resposta ou usa frases prontas (“Quero trocar”, “Tem outro tamanho?”) | T06 | O celular fala em voz alta para a atendente |
| 4 | Assunto complexo → “Chamar intérprete” | T06 | Videochamada com intérprete de Libras (parceria) |

### J4: María encontra a C&A e pergunta sobre tamanhos (turista)

| Etapa | Ação | Tela | Recurso |
|---|---|---|---|
| 1 | QR na mesa da praça de alimentação → app em espanhol (idioma do celular) | T00 | Negociação automática de idioma |
| 2 | Busca “C&A” | T03/T04 | Ficha da loja em espanhol; Âncora A9, 1º pavimento |
| 3 | Rota | T05 | Instruções em espanhol |
| 4 | Na loja, “Conversar” ES ↔ PT | T06 | Tradução + frases prontas (“¿Tienen talla M?”) |

### J5: Pedro e o elevador fora de serviço (cadeira de rodas)

| Etapa | Ação | Tela | Recurso |
|---|---|---|---|
| 1 | Perfil “sem degraus” ativado | T01 | Pesos de rota: escadas e escadas rolantes **proibidas** |
| 2 | Pede rota para o Mundo Imersivo (2º pavimento) | T05 | O elevador principal está “em manutenção” (marcado pela equipe na T12) → rota usa o outro elevador |
| 3 | Chega à praça de alimentação; vê no mapa as **mesas reservadas** | T02 | Camada de acessibilidade |

### J6: Luana atende um pedido de ajuda (Central)

| Etapa | Ação | Tela | Recurso |
|---|---|---|---|
| 1 | Novo pedido toca na Central: “Orientação · Mesa 07 · 2º pavimento · Comunicação: **texto/Libras**” | T12 | Tempo real, alerta sonoro e visual |
| 2 | Luana aceita e informa a previsão | T12 | O visitante vê “Luana está a caminho (≈ 3 min)” (T09) |
| 3 | No local, usa o modo conversa ou chama intérprete | T06 | Roteiro de atendimento por modo de comunicação (Cap. 14) |
| 4 | Encerra o pedido | T12 | Métrica de tempo de atendimento |
