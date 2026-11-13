---
title: "Guia Dourado — Planejamento Técnico Inicial v2"
subtitle: "Acessibilidade e comunicação universal no Capim Dourado Shopping (Palmas/TO)"
desafio: "Desafio 01 — 1.ª entrega (13/11/2026)"
tecnologia: "React + Next.js (TypeScript)"
versao: "2.0 — 13/11/2026"
fonte: "PLANEJAMENTO_TECNICO_INICIAL_v2.pdf (91 páginas)"
---

> **Nota:** transcrição automática do PDF oficial desta entrega.
> Em caso de divergência, o PDF em `docs/PLANEJAMENTO_TECNICO_INICIAL_v2.pdf` prevalece.

## Sumário

0. Sumário executivo
1. Contexto, problema e objetivos
2. Pesquisa e benchmark
3. Personas e jornadas
4. Proposta e estrutura inicial das telas
5. Requisitos
6. Linguagem de programação escolhida
7. Arquitetura proposta
8. Plataforma e tecnologias adotadas
9. Como a tecnologia sorteada
10. Modelo de dados, grafo e algoritmo de rotas
11. Acessibilidade, conformidade legal, LGPD e segurança
12. Qualidade e estratégia de testes
13. Plano do MVP
14. Operação no shopping

**Apêndices:** A. Wireframes das telas · B. Registros de decisão (ADRs) · C. Glossário · D. Referências

---

## Página 4


# 0. Sumário executivo

Campo Detalhe
Produto (nome de Guia Dourado: acessibilidade e comunicação universal no Capim Dourado Shopping
trabalho)
Desafio 01. Acessibilidade e comunicação universal
Cliente / local Capim Dourado Shopping, Palmas/TO (acessos pelas Avenidas JK, NS-05 e LO 2A)
Tecnologia sorteada React + Next.js (linguagem TypeScript)
Entrega 1ª entrega: planejamento e definição técnica (sexta-feira, 13/11/2026, até 12h). Não é o MVP
final
Versão do documento 2.0, de 13/11/2026 (substitui a v1.0 da equipe)
Fonte dos dados físicos 2026_11_CDS_MIX.pdf: Planta Mix, Operações Capim Dourado Shopping, nov/2026,
38.800,50 m²

## 0.1 O desafio em três frases

Contexto: o shopping recebe visitantes com diferentes necessidades de comunicação: pessoas
surdas, cegas, com deficiência e estrangeiros.
Problemática: nem todos conseguem acessar informações, entender orientações ou se comunicar
com os profissionais do shopping com a mesma facilidade e autonomia.
Objetivo: tornar a experiência no shopping mais acessível, inclusiva e independente das limitações
de comunicação dos visitantes.

## 0.2 A solução em um parágrafo

O Guia Dourado é um aplicativo web progressivo (PWA). O visitante o abre apontando a câmera para um
QR Code ou encostando o celular numa etiqueta NFC com marcação em Braille, presentes nos totens, nas
entradas, nas lojas, nas mesas da praça de alimentação e no estacionamento. Não é preciso instalar
nada nem fazer cadastro. O app já sabe onde a pessoa está, pelo ponto escaneado, e oferece quatro
coisas:
1. Encontrar: mapa dos dois pavimentos, busca e rotas acessíveis calculadas por perfil (por
exemplo, sem escadas para cadeira de rodas), com o status dos elevadores em tempo real e
instruções passo a passo em texto, voz e vibração.
2. Entender: toda informação em voz, linguagem simples, Libras (VLibras e vídeos com intérpretes),
português, inglês e espanhol, com alto contraste e fonte ampliada.
3. Conversar: modo conversa frente a frente com o atendente, com legenda ao vivo, “digite e o celular
fala”, tradução e frases prontas; prancha de comunicação com pictogramas; e videochamada
com intérprete de Libras humano, via parceria.
4. Pedir ajuda: um pedido com localização automática e forma de comunicação preferida chega à
Central da equipe em tempo real. Para emergências, o app mostra os números 192, 193 e 190.

---

## Página 5


## 0.3 Diferenciais

# Diferencial Por que importa
1 Zero instalação, zero cadastro, funciona offline (mapa, Elimina a barreira de entrada e funciona onde o sinal é
rotas, prancha e frases prontas) fraco
2 Perfis por preferência funcional, não por diagnóstico. Os Respeito e LGPD por concepção: deficiência é dado
dados ficam no aparelho sensível (art. 5º, II, e art. 11)
3 Rotas determinísticas e auditáveis (Dijkstra) com pesos por Segurança: rota nunca é “inventada” por IA. Uma rota
perfil e status de equipamentos para cadeira de rodas jamais passa por escada
4 Instruções no padrão Wayfindr (Recomendação ITU-T Padrão internacional de navegação por áudio para
F.921) pessoas com deficiência visual
5 Libras de verdade: VLibras (gratuito, do governo federal) + Não promete o que a tecnologia ainda não entrega com
vídeos com intérpretes + intérprete humano por vídeo segurança (reconhecimento de Libras por IA)
6 QR + NFC + Braille + código curto em cada ponto Pessoa cega não precisa “mirar” um QR (lição da
NaviLens, premiada no Tech4Good 2021)
7 Central da equipe (painel web) O shopping atende pedidos, atualiza elevadores,
recebe barreiras reportadas e mede resultados
8 IA generativa apenas como apoio (tradução e linguagem Qualidade e responsabilidade: nada crítico depende de
simples, com revisão humana) IA

## 0.4 Como este documento atende à 1ª entrega

Item exigido no edital Onde está
Proposta e estrutura inicial das telas Capítulo 4 (14 telas, fluxos e rotas) + Apêndice A (wireframes)
Documentação inicial do projeto Capítulos 1, 2, 3, 5, 10 a 14 + ADRs (Apêndice B)
Linguagem de programação escolhida Capítulo 6 (TypeScript)
Arquitetura proposta Capítulo 7 (modelo C4, sequências, offline, segurança, implantação)
Plataforma e tecnologias adotadas Capítulo 8
Como a tecnologia sorteada será incorporada Capítulo 9 (React + Next.js, recurso por recurso)

## 0.5 Números do planejamento

Indicador Valor
Telas especificadas 14 (T00–T13) + 2 páginas institucionais (acessibilidade e privacidade)
Requisitos funcionais / não funcionais 30 / 16
Decisões de arquitetura registradas 11
(ADRs)
Personas / jornadas 7 / 6
Idiomas no MVP Português (pt-BR), Inglês, Espanhol + Libras

---

## Página 6

Indicador Valor
Meta de conformidade WCAG 2.2 nível AA (alinhada à ABNT NBR 17225:2025), com critérios AAA
selecionados

## 0.6 Histórico de versões

Versão Data Principais mudanças
1.0 13/11/2026 Planejamento inicial da equipe: 9 telas (T00–T08), requisitos, arquitetura, stack e grafo extraído da
planta
2.0 13/11/2026 Pesquisa de referências premiadas, telas reorganizadas (14), pilar Conversar (modo conversa,
prancha de pictogramas, intérprete humano), Central da equipe, status de elevadores, roteamento
no cliente (offline), perfis sem dados sensíveis, QR + NFC + Braille, dados das lojas âncora
conferidos na planta, Next.js 16.4 / React 19.3, plano de 24 h para o MVP, ADRs, estratégia de testes
e LGPD

---

## Página 7


# 1. Contexto, problema e objetivos


## 1.1 O desafio (texto oficial)

01. Acessibilidade e comunicação universal Contexto: O shopping recebe visitantes com
diferentes necessidades de comunicação, incluindo pessoas surdas, cegas, pessoas com deficiência
e estrangeiros. Problemática: Nem todos conseguem acessar informações, compreender orientações
ou se comunicar com os profissionais do shopping com a mesma facilidade e autonomia. Objetivo:
Tornar a experiência no shopping mais acessível, inclusiva e independente das limitações de
comunicação dos visitantes.

## 1.2 O Capim Dourado Shopping (o que a planta e as fontes públicas

mostram)
Aspecto Dado Fonte
Localização Palmas/TO, entre as Avenidas JK, NS-05 e LO 2A Planta Mix
nov/2026
Inauguração 17/08/2010 Conexão
Tocantins
(2010)
Área (Planta Mix) 38.800,50 m² Planta Mix
nov/2026
Administração Operações Capim Dourado Shopping / Soul Malls (logotipo na planta) Planta Mix;
Abrasce
Pavimentos de uso 1º Pavimento – Térreo (lojas, âncoras, praças de eventos, Alameda das Cores) e Planta Mix
público 2º Pavimento – Praça de Alimentação (13 operações de alimentação, Mundo (folhas 1/2 e
Imersivo, Evento Imerso Mar) 2/2)
Estacionamento Subsolo 1: 140 vagas (3 PNE, 11 idoso, 2 neurodiverso, 4 gestante e criança). Planta Mix
coberto Subsolo 2: 216 vagas (5 PNE, 8 idoso, 1 neurodiverso, 4 gestante e criança)
Âncoras (conferidas Renner (Âncora 01, 2.027,51 m²), Riachuelo (Âncora 02, 2.342,06 m²), Marisa Planta Mix
na planta) (Âncora 03, 1.319,52 m²), Cinemark (Âncora 04, 3.090,00 m²), Centauro (Âncora
05, 871,76 m²), C&A (Âncora A9, 2.099,02 m²)
Megalojas Morofit (PC01A), Wow Park (PC01B), Super Big (PC 001C), Zig Zag Play (PC 02), Planta Mix
Big Lar (PC 03), Pernambucanas (PC 04), Avenida (PC 05), STZ (PC 06)
Circulação vertical Escadas (E2, E3, E7…), escadas rolantes entre pavimentos e elevadores. Planta Mix
Posição exata dos elevadores a validar em visita técnica
Sinais de Vagas para neurodivergentes, idosos, gestantes e PNE; sanitários PNE; brigada Planta Mix
compromisso
existente

---

## Página 8

Leitura estratégica: o shopping já sinaliza preocupação com neurodiversidade (vagas dedicadas) e
mobilidade. O que falta é a camada de informação e comunicação, exatamente o foco do desafio.

## 1.3 Quem é afetado (dimensão do problema)

14,4 milhões de pessoas com deficiência no Brasil (7,3% da população com 2 anos ou mais),
segundo o Censo 2022 do IBGE (divulgado em maio/2025), com concentração na população idosa.
2,4 milhões de pessoas com diagnóstico de autismo (1,2% da população), primeira medição do
Censo (IBGE, 2025).
Turistas e visitantes de outros estados e países: Palmas é porta de entrada para destinos como o
Jalapão. A língua (espanhol e inglês) é barreira de comunicação tanto quanto a surdez.
Deficiências ocultas: surdez, autismo e deficiências cognitivas, entre outras, reconhecidas pela Lei
14.624/2023 (cordão de girassol).
Limitações situacionais e temporárias: pessoa idosa, gestante, pessoa com carrinho de bebê ou
com o pé engessado. Projetar para o extremo beneficia todos (desenho universal).

## 1.4 Barreiras observadas por grupo

Grupo Barreiras de informação/comunicação no O que o Guia Dourado oferece
shopping
Pessoas surdas (Libras Atendimento oral, avisos sonoros, ninguém Modo conversa (legenda ao vivo + digitar),
como 1ª língua) sinaliza Libras, português escrito pode ser 2ª VLibras, vídeos em Libras, intérprete humano
língua por vídeo, avisos visuais
Pessoas com deficiência Ambientes ruidosos, falas rápidas Legendas grandes, transcrição ao vivo,
auditiva/ensurdecidas vibração
Pessoas cegas Sinalização apenas visual, cardápios NFC + Braille + código curto, leitor de tela
impressos, QR difícil de localizar e mirar (TalkBack/VoiceOver), rota por áudio com
referências (padrão Wayfindr)
Baixa visão Letras pequenas, baixo contraste, reflexo Alto contraste, fonte até 200%, fonte Atkinson
Hyperlegible, ampliação do mapa
Mobilidade reduzida / Escadas como caminho aparente, elevador Rotas sem degraus, status de elevadores,
cadeira de rodas sem sinalização ou parado mesas reservadas na praça de alimentação
Autismo / deficiência Excesso de estímulos, informação Linguagem simples, prancha de pictogramas,
intelectual / cognitiva complexa, imprevisibilidade informação sensorial (áreas ruidosas e
tranquilas), rotas previsíveis
Estrangeiros Língua, sinalização só em português PT/EN/ES em todo o app, tradução na
conversa, frases prontas
Pessoas idosas / baixa Apps complicados, cadastro, letras Sem cadastro, botões grandes, modo totem,
letramento digital pequenas voz
Equipe do shopping Não sabe Libras, não fala espanhol/inglês, Central com localização, forma de
não sabe onde o visitante está comunicação preferida e roteiros de
atendimento

---

## Página 9


## 1.5 Objetivos

Objetivo geral: permitir que qualquer visitante encontre, entenda e se comunique no Capim Dourado
Shopping com autonomia, independentemente de deficiência, idioma ou familiaridade com tecnologia.
Objetivos específicos (verificáveis no MVP):
1. Localizar qualquer loja, quiosque ou serviço dos dois pavimentos em até 3 interações a partir do
ponto escaneado.
2. Traçar rotas acessíveis por perfil (sem degraus, preferência por elevador, referências
táteis/sonoras), considerando o status dos equipamentos.
3. Oferecer toda informação essencial em pelo menos 3 formatos: texto em linguagem simples, voz
e Libras, em 3 idiomas (pt-BR, en, es).
4. Viabilizar conversa sem barreira entre visitante e atendente (legenda, digitação com voz, tradução,
pictogramas e encaminhamento para intérprete).
5. Garantir ajuda humana com localização automática e registro da forma de comunicação preferida.
6. Atender WCAG 2.2 nível AA (ABNT NBR 17225:2025) em 100% dos fluxos críticos.

## 1.6 Indicadores de sucesso (KPIs)

KPI Meta Como medir
Conclusão de tarefa sem ajuda (chegar ao ≥ 85% Teste de usabilidade moderado com PcD +
destino) evento “cheguei” no app
Tempo para encontrar um local (mediana) ≤ 45 s Teste de usabilidade (cronometrado)
Tempo da Central para aceitar um pedido ≤ 2 min Registro de eventos do pedido (criado → aceito)
de ajuda (mediana)
Satisfação (SUS) com pessoas com ≥ 80 Questionário SUS após teste
deficiência
Violações automáticas de acessibilidade 0 críticas ou sérias axe-core no CI (todas as rotas, todos os temas)
Conformidade WCAG 2.2 AA nos fluxos 100% Checklist manual (Cap. 11)
críticos
Desempenho mobile (p75, 4G) LCP ≤ 2,5 s; INP ≤ 200 Lighthouse CI + Web Vitals
ms; CLS ≤ 0,1
Barreiras físicas reportadas e tratadas ≤ 7 dias Painel da Central

## 1.7 Escopo

No MVP (entrega final, 14/11, 10h): perfil/preferências, mapa dos dois pavimentos, busca, detalhe do local
com voz e Libras, rota acessível passo a passo, modo conversa, prancha de pictogramas, pedido de ajuda
+ Central em tempo real, avaliação e reporte de barreira, PT/EN/ES.
Fora do MVP (roadmap, Cap. 13): posicionamento indoor contínuo (beacons/câmera), aplicativo nativo,
integração com estacionamento e CFTV, reconhecimento automático de Libras, contas de usuário, CMS
completo para o shopping, certificações sensoriais.

---

## Página 10


## 1.8 Premissas e restrições

Tipo Descrição
Premissa A Planta Mix (nov/2026) é a fonte oficial da geometria; elevadores e rampas serão confirmados em visita técnica
Premissa O shopping instala placas QR/NFC e mantém uma equipe de atendimento (SAC/segurança/brigada) para
receber pedidos
Premissa Wi-Fi para visitantes ou 4G disponível na maior parte da área; o app tolera quedas
Restrição Prazo do hackathon: MVP em menos de 24 h. Escopo precisa caber no tempo (Cap. 13)
Restrição Sem orçamento: só serviços com plano gratuito ou de baixo custo no MVP
Restrição Posição indoor precisa (metro a metro) exige infraestrutura. O MVP usa âncoras (QR/NFC) e “Onde estou?”
manual

---

## Página 11


# 2. Pesquisa e benchmark

Método: pesquisa documental feita em 13/11/2026 sobre (a) soluções de acessibilidade premiadas ou
reconhecidas internacionalmente, (b) shoppings e espaços de varejo com práticas de acessibilidade, (c)
prêmios em que esta solução poderia concorrer e (d) normas e leis aplicáveis no Brasil. Cada referência
gerou uma lição e uma decisão de projeto. Os links completos estão em Referências.

## 2.1 Soluções premiadas e reconhecidas

Solução Reconhecimento O que faz Lição para o Guia Dourado
NaviLens Vencedora do Tech4Good Códigos visuais Pessoa cega não consegue
(Espanha) Accessibility Award 2021 (AbilityNet); coloridos lidos a mirar um QR comum → cada
a MTA (metrô de Nova York) recebeu distância e em ponto terá NFC + relevo/Braille +
US$ 2 milhões do programa SMART ângulo, sem foco, com QR grande; NaviLens fica como
do Departamento de Transportes dos informação falada integração futura
EUA (2023) para expandir o uso
Wayfindr Open Aprovado como Recomendação ITU-T Padrão de navegação Instruções de rota seguem o
Standard (Reino F.921 (2017); licença CC BY-SA 4.0 por áudio em padrão: frases curtas, referências
Unido) ambientes internos (“marcos”), distância, aviso antes
para pessoas com de mudanças de direção e de
deficiência visual piso
Be My Eyes Apple Design Award 2021 (impacto Videochamada com O melhor atendimento combina
(Dinamarca) social); Golden Apple da AppleVis 2023; voluntários + descrição humano + tecnologia → botão
prêmio App Store 2025 (Impacto por IA (“Be My AI”) “falar com intérprete/atendente
Cultural, segundo a empresa) por vídeo”
Hand Talk (Brasil, Premiada pela ONU no World Summit Tradução de texto e voz Avatar de Libras ajuda no texto
AL) Award Mobile 2013 (inclusão social) para Libras com avatar dinâmico; a empresa também
(Hugo); plugin para criou o Prêmio Líderes de
sites Acessibilidade
VLibras (Governo Suíte gratuita e de código aberto; Widget que traduz o Adotado no MVP (custo zero).
Federal) usada no gov.br texto da página para Atenção: depende do serviço
Libras com avatar 3D vlibras.gov.br e de internet
Central de CIL da Prefeitura de São Paulo Intérprete de Libras Intérprete humano é o padrão-
Intermediação reconhecida no Prêmio Líderes de humano por ouro para Libras → português. O
em Libras (CIL) Acessibilidade; TSE lançou CIL videochamada, em app terá o atalho “Chamar
nacional em nov/2026 com acesso por tempo real intérprete” (parceria a firmar)
QR Code
GoodMaps (EUA) CES 2021 Innovation Award Navegação indoor por Posicionamento preciso é caro e
(homenageada) câmera, sem beacons complexo → MVP usa âncoras
QR/NFC; posicionamento
contínuo vai para o roadmap
Zero Project 75 soluções de 51 países premiadas Banco internacional de Fonte de padrões e possível
Awards 2026 (foco: Acessibilidade, TIC e Resposta a boas práticas em vitrine futura para o projeto
(Áustria) Crises) deficiência

---

## Página 12


## 2.2 Shoppings e espaços de varejo de referência

Referência Prática Lição / decisão
Mall of America Guia sensorial e de acessibilidade 2026; parceria com a Fraser Publicar informação sensorial
(EUA) (abr/2026) para ampliar iniciativas sensoriais; sala sensorial no (ruído, luz, multidão) e localizar
Nickelodeon Universe (isolamento acústico, assentos, apoios espaços tranquilos no mapa.
táteis); SEA LIFE certificado pela KultureCity; atrações com Capa “sensorial” no mapa (Cap. 4)
certificação IBCCES (Certified Autism Center)
Dubai (Emaar / Cinema do Dubai Mall certificado IBCCES (equipe treinada, Treinamento da equipe +
Reel Cinemas iluminação reduzida); cidade em busca da designação Certified certificação de operações (cinema,
Dubai Mall) Autism Destination parque infantil) como passo do
roadmap
Lei paulista Salas de regulação sensorial obrigatórias em shoppings com Tendência regulatória → o Capim
18.183/2025 mais de 2.000 pessoas/dia; decreto de abr/2026, prazo de 180 Dourado pode se antecipar; o app
dias, fiscalização do Procon-SP; TJSP declarou a lei constitucional já prevê a sala/área tranquila no
mapa
Mauá Plaza (SP) Espaço sensorial com sala de descompressão, vagas exclusivas e Alinhar app + espaço físico +
equipe treinada equipe
Salvador Hora Silenciosa permanente (redução de estímulos) O app divulga horários silenciosos
Shopping (BA) e eventos inclusivos
Park Shopping “Sala do Bem” Idem
Campo Grande
(RJ)
Tocantins: Lei Reserva de 3% das mesas da praça de alimentação para O app mostra e localiza as
3.964/2022 pessoas com deficiência ou mobilidade reduzida (texto a confirmar mesas reservadas (camada de
no portal oficial) acessibilidade no 2º pavimento)
Capim Dourado Vagas para neurodivergentes, idosos, gestantes e PNE nos Ponto de partida forte → rota “do
(planta subsolos estacionamento ao destino” com
nov/2026) QR nos pilares

## 2.3 Prêmios em que a solução poderia concorrer

Prêmio Quem organiza Categoria/encaixe
Prêmio Abrasce Associação Brasileira de Shopping Categoria Newton Rique ESG – Ações de Impacto
Centers Social (o shopping inscreve o projeto)
Prêmio Líderes de Hand Talk Melhores Iniciativas de Acessibilidade Web –
Acessibilidade Organizações Públicas e Privadas
Zero Project Award Fundação Essl (Áustria), Soluções inovadoras em acessibilidade/TIC
conferência na ONU em Viena
Tech4Good Awards AbilityNet (Reino Unido) Categoria Acessibilidade (a NaviLens venceu em 2021)
World Summit Awards WSA Inclusão social (a Hand Talk venceu em 2013)
Access City Award Comissão Europeia Só para cidades; serve de referência de critérios
(Zaragoza venceu em 2026)
Apple Design Awards: Apple Só para apps nativos; referência de qualidade de design
Inclusivity inclusivo

---

## Página 13

Uso prático: os critérios desses prêmios (impacto mensurável, coprojeto com pessoas com
deficiência, escalabilidade, custo, replicabilidade) foram usados como checklist de qualidade do
projeto e do pitch (Cap. 15).

## 2.4 Normas, leis e padrões técnicos aplicáveis

Referência Aplicação no projeto
WCAG 2.2 (W3C) Meta de conformidade nível AA + critérios AAA selecionados
ABNT NBR 17225:2025 (acessibilidade em Primeira norma brasileira de acessibilidade digital, alinhada à WCAG 2.2 e de
conteúdo e aplicações web) consulta gratuita no site da ABNT
Lei Brasileira de Inclusão (Lei Acessibilidade na comunicação e na informação; obrigatoriedade de
13.146/2015) acessibilidade em sites de empresas com sede ou representação no país
Lei 10.436/2002 e Decreto 5.626/2005 Libras como meio legal de comunicação e expressão
Lei 14.624/2023 Cordão de girassol como símbolo nacional das deficiências ocultas (uso
opcional)
Lei 12.764/2012 e Lei 13.977/2020 Pessoa com TEA é pessoa com deficiência para todos os efeitos legais;
CIPTEA
Lei 10.048/2000 Atendimento prioritário
ABNT NBR 9050 e NBR 16537 Acessibilidade física e sinalização tátil no piso: orientam placas QR/NFC/Braille
e rotas táteis
LGPD (Lei 13.709/2018) Dados de deficiência são dados sensíveis: minimização e consentimento
(Cap. 11)
IMDF (Apple → OGC Community Standard, Modelo de dados de mapas internos em GeoJSON (venue, level, unit, opening,
2021) amenity…) que inspira nosso modelo
ITU-T F.921 (Wayfindr) Padrão de instruções de navegação por áudio
W3C COGA (Making Content Usable) Boas práticas para deficiências cognitivas e de aprendizagem (linguagem
simples, previsibilidade)

## 2.5 Síntese: das lições às decisões

Lição Decisão no Guia Dourado Onde
QR comum é difícil para pessoas cegas Ponto = QR grande + NFC + Braille + código curto ADR-0005,
Cap. 14
Áudio de navegação precisa de padrão Gerador de instruções no estilo Wayfindr/ITU-T F.921 Cap. 10
Libras por IA ainda não é confiável no sentido VLibras (PT → Libras) + vídeos + intérprete ADR-0006
Libras → português humano
Melhor atendimento = humano + tecnologia Central da equipe + pedido de ajuda com modo de T08, T09, T12
comunicação
Autismo e sobrecarga sensorial são tema Informação sensorial no mapa, prancha de T02, T07, T11
regulatório crescente pictogramas, hora silenciosa

---

## Página 14

Lição Decisão no Guia Dourado Onde
Posicionamento indoor é caro Âncoras QR/NFC + “Onde estou?” manual; beacons ADR-0003
no roadmap
Dados de mapa precisam de padrão Modelo inspirado no IMDF + editor de grafo ADR-0004
Dados de deficiência são sensíveis Perfil local no aparelho, sem conta ADR-0007
Elevador parado inviabiliza a rota Status de equipamentos em tempo real no cálculo RF-11, T12
da rota

---

## Página 15


# 3. Personas e jornadas

As personas são hipóteses a validar com pessoas reais (ver Cap. 12, testes com usuários em
parceria com a Associação dos Surdos de Palmas e a Associação dos Deficientes Visuais do Estado
do Tocantins, ambas com assento no Conselho Municipal dos Direitos da Pessoa com Deficiência de
Palmas). Princípio: “Nada sobre nós sem nós.”

## 3.1 Personas

# Persona Perfil Necessidades Frustrações Recursos do Guia
principais atuais Dourado
P1 Ana, 68 Baixa visão (glaucoma); Ler sem esforço, rota Placas pequenas, Alto contraste, fonte
usa o celular com fonte por elevador, cardápio cardápios 200%, leitura em voz,
grande em voz impressos, reflexo rota com elevador
nas vitrines
P2 Marcos, 30 Cego; usa TalkBack e Saber onde está, rota Não acha o QR, NFC + Braille, lista
bengala por áudio com apps com botões textual do mapa,
referências táteis, ajuda sem rótulo, mapas instruções Wayfindr,
humana rápida só visuais botão de ajuda
acessível
P3 João, 34 Surdo; Libras é sua 1ª Comunicar-se com Atendimento só Modo conversa
língua; lê português com atendentes, entender oral, vergonha de (legenda), VLibras,
alguma dificuldade avisos pedir para repetir vídeos em Libras,
intérprete por vídeo,
pictogramas
P4 María, 41 Turista argentina; fala Achar lojas, perguntar Sinalização só em App em espanhol,
espanhol e um pouco de preços e tamanhos português, equipe tradução na conversa,
inglês não fala espanhol frases prontas
P5 Pedro, 27 Usuário de cadeira de Rotas sem degraus, Escada rolante Perfil “sem degraus”,
rodas elevador funcionando, como caminho status de elevadores,
sanitário PNE, mesa aparente, elevador mesas reservadas no
adequada parado sem aviso mapa
P6 Carla, 9, com Carla é autista Áreas tranquilas, Barulho, multidão, Mapa sensorial,
o avô Seu (hipersensível a ruído). previsibilidade, apps complexos prancha de
Raimundo, 72 Seu Raimundo tem comunicação por pictogramas,
pouca familiaridade com imagens; para ele, linguagem simples,
tecnologia e mobilidade botões grandes, sem modo totem
reduzida cadastro
P7 Luana, 26 Atendente do SAC Saber quem precisa de Recebe pedidos Central em tempo real
(operadora da Central) ajuda, onde e como se por rádio sem com local, tipo de
comunicar com a contexto; não sabe ajuda e modo de
pessoa Libras comunicação; roteiros
de atendimento

---

## Página 16


## 3.2 Jornadas principais

J1: Ana vai almoçar na Praça de Alimentação (baixa visão, mobilidade reduzida)
Etapa Ação Tela Recurso
1 Escaneia o QR do totem da entrada T00 O app abre já dizendo “Você está na Entrada Av. JK” (voz, se
Av. JK ativada)
2 Toca em “Ler em voz alta” e “Letra T01 Preferências aplicadas na hora, sem cadastro
grande” (atalho)
3 Busca “comida caseira” T03 Busca por sinônimos → Divino Fogão (Loja 209, 2º
pavimento)
4 “Como chegar”, preferindo elevador T05 Rota com elevador; cada passo em voz e texto grande
5 Chega e avalia a rota T10 Avaliação por voz ou toque
J2: Marcos procura o sanitário mais próximo (cego, TalkBack)
Etapa Ação Tela Recurso
1 Encontra a placa pelo relevo e encosta o — Abre o app sem precisar mirar
celular (NFC)
2 Ouve “Você está na Praça de Eventos central. T00 Título único, foco no h1, ordem lógica
Destaques: Sanitários, Ajuda”
3 Escolhe “Sanitários” T03 Lista ordenada por distância, em texto
4 Segue as instruções por áudio T05 Padrão Wayfindr: “Siga em frente 20 metros. A loja
Riachuelo fica à sua esquerda.” Vibração ao virar
5 Se perder, toca em “Pedir ajuda” T08 Pedido com local da última placa lida
J3: João troca um produto numa loja (surdo, Libras)
Etapa Ação Tela Recurso
1 Na loja, abre “Conversar” T06 Tela dividida: metade para ele, metade (girada)
para a atendente
2 Atendente fala; João lê a legenda ao vivo (com avatar T06 Reconhecimento de fala → texto grande
VLibras opcional)
3 João digita a resposta ou usa frases prontas (“Quero T06 O celular fala em voz alta para a atendente
trocar”, “Tem outro tamanho?”)
4 Assunto complexo → “Chamar intérprete” T06 Videochamada com intérprete de Libras
(parceria)
J4: María encontra a C&A e pergunta sobre tamanhos (turista)
Etapa Ação Tela Recurso
1 QR na mesa da praça de alimentação → app em espanhol T00 Negociação automática de idioma
(idioma do celular)

---

## Página 17

Etapa Ação Tela Recurso
2 Busca “C&A” T03/T04 Ficha da loja em espanhol; Âncora A9, 1º
pavimento
3 Rota T05 Instruções em espanhol
4 Na loja, “Conversar” ES ↔ PT T06 Tradução + frases prontas (“¿Tienen talla
M?”)
J5: Pedro e o elevador fora de serviço (cadeira de rodas)
Etapa Ação Tela Recurso
1 Perfil “sem degraus” ativado T01 Pesos de rota: escadas e escadas rolantes proibidas
2 Pede rota para o Mundo Imersivo (2º T05 O elevador principal está “em manutenção” (marcado pela
pavimento) equipe na T12) → rota usa o outro elevador
3 Chega à praça de alimentação; vê no T02 Camada de acessibilidade
mapa as mesas reservadas
J6: Luana atende um pedido de ajuda (Central)
Etapa Ação Tela Recurso
1 Novo pedido toca na Central: “Orientação · Mesa 07 · 2º T12 Tempo real, alerta sonoro e visual
pavimento · Comunicação: texto/Libras”
2 Luana aceita e informa a previsão T12 O visitante vê “Luana está a caminho (≈ 3
min)” (T09)
3 No local, usa o modo conversa ou chama intérprete T06 Roteiro de atendimento por modo de
comunicação (Cap. 14)
4 Encerra o pedido T12 Métrica de tempo de atendimento

---

## Página 18


# 4. Proposta e estrutura inicial das telas

Atende ao item “Proposta e estrutura inicial das telas” da 1ª entrega. Os esboços de baixa
fidelidade estão no Apêndice A e, em versão navegável, em wireframes/index.html.

## 4.1 Princípios de UX inclusiva (valem para todas as telas)

1. Uma ação principal por tela, com título (h1) único e descritivo, que o leitor de tela anuncia na
navegação.
2. No máximo 3 interações para qualquer tarefa crítica: encontrar um local, pedir ajuda, mudar idioma,
ativar voz.
3. Redundância multimodal: tudo o que é falado também é escrito, e vice-versa. Ícone sempre
acompanhado de texto. Nunca informar só por cor.
4. Alvos de toque ≥ 48 × 48 px com espaçamento ≥ 8 px (acima do mínimo de 24 px da WCAG 2.2
AA).
5. Linguagem simples em pt-BR: frases curtas, voz ativa, sem jargão (“Pedir ajuda”, e não “Abrir
chamado”).
6. Ajuda sempre no mesmo lugar (WCAG 3.2.6): botão “Ajuda” fixo no rodapé, em todas as telas.
7. Sem limite de tempo para o visitante. No totem, aviso antes do reinício, com opção de continuar.
8. Movimento mínimo: respeita “reduzir movimento” do sistema; nada pisca.
9. Sem gestos complexos obrigatórios: o mapa tem botões de zoom e deslocamento, além da pinça
(WCAG 2.5.7).
10. Funciona em retrato e paisagem, com zoom de 200% e reflow a 320 px de largura sem rolagem
horizontal.
11. Erros dizem como corrigir e são anunciados (aria-live).
12. Preferências aplicadas antes da primeira pintura (sem “piscar” o tema), via script inline (ver Cap.
9).

---

## Página 19


## 4.2 Mapa de navegação

Diagrama 1: 4.2 Mapa de navegação

## 4.3 Inventário de telas

ID Tela Rota (App Router) Objetivo MVP
T00 Início /[locale] Mostrar onde a pessoa está (pelo QR) e os 6 Must
atalhos principais
T01 Preferências /[locale]/preferencias Configurar como a pessoa quer receber Must
informação. Opcional e pulável
T02 Mapa por piso /[locale]/mapa/[piso] Ver a planta com camadas; alternativa em lista Must
T03 Buscar /[locale]/buscar Achar lojas, serviços e sanitários por nome, Must
categoria, sinônimo ou voz
T04 Detalhe do local /[locale]/locais/[slug] Informações do local em texto, voz, linguagem Must
simples e Libras
T05 Rota /[locale]/rota?de=&para= Rota acessível por perfil, passo a passo, com Must
status de elevadores
T06 Conversar /[locale]/conversar Conversa frente a frente: legenda, digitar e falar, Must
tradução, frases prontas, intérprete

---

## Página 20

ID Tela Rota (App Router) Objetivo MVP
T07 Prancha /[locale]/prancha Comunicação por pictogramas (CAA), com fala e Must
tradução
T08 Pedir ajuda /[locale]/ajuda Pedido com tipo, local e modo de comunicação; Must
números de emergência
T09 Acompanhar pedido /[locale]/ajuda/[id] Status do pedido em tempo real (anunciado) Must
T10 Avaliar / reportar /[locale]/avaliar Avaliar a rota e reportar barreira física ou digital Should
T11 Serviços acessíveis /[locale]/servicos Sanitários PNE, fraldário, empréstimo de cadeira de Should
rodas, área tranquila, mesas reservadas, horários
T12 Central da equipe /central (equipe, pt-BR) Fila de pedidos em tempo real, status de Must
equipamentos, barreiras
T13 Modo totem /totem/[ponto] Versão quiosque: alcance para cadeira de rodas, Could
áudio por fone, reinício automático
— Declaração de /[locale]/acessibilidade Nível de conformidade, limitações conhecidas, Must
acessibilidade canal de contato
— Privacidade /[locale]/privacidade Aviso LGPD em linguagem simples Must
— Resolvedor de /q/[codigo] (Route Converte o código do ponto em contexto de Must
QR/NFC Handler) localização e redireciona

## 4.4 Componentes transversais (presentes em todas as telas do visitante)

Componente Descrição Acessibilidade
Cabeçalho Voltar · título da tela · idioma (PT/EN/ES) · Landmark header; botões com nome acessível;
Libras (ativa o VLibras) · Ouvir (lê a tela) ordem de foco fixa
Botão “Ajuda” Fixo no rodapé (zona do polegar); abre T08 Mesmo lugar em todas as telas (WCAG 3.2.6); 2
etapas para evitar acionamento acidental
Anunciador Região aria-live única (polite/assertive) Evita anúncios duplicados; mensagens curtas
usada por todo o app
Indicador de “Sem internet: mapa, rotas e prancha Texto + ícone; anunciado uma vez (useOffline)
conexão continuam funcionando”
Atalhos de leitura Aa− / Aa+ / contraste Afetam tokens CSS globais
Link “Pular para o Primeiro elemento focável WCAG 2.4.1
conteúdo”
Rodapé Acessibilidade · Privacidade · versão dos —
dados

---

## Página 21


## 4.5 Detalhamento das telas

T00: Início
Estrutura (de cima para baixo): cabeçalho → cartão “Você está em: Entrada Av. JK · 1º
pavimento”, com botão “Não é aqui? Escolher onde estou” → 6 atalhos grandes: Buscar, Mapa,
Conversar, Prancha, Serviços acessíveis, Preferências → aviso do dia (ex.: “Hora silenciosa sábado,
9h–10h”) → botão Ajuda.
Entrada: via /q/[codigo] (contexto pré-carregado) ou acesso direto (pede “Onde estou?” com lista
de pontos de referência).
Acessibilidade: anuncia o local ao abrir (se “voz” estiver ativa); atalhos em grade com rótulos
textuais.
Diferença da v1: o app não pede para escanear de novo (a pessoa já escaneou para chegar). O
scanner interno serve só para trocar de ponto. A antiga T04 “Menu” foi fundida aqui (menos telas,
menos toques).
T01: Preferências
Pergunta-guia: “O que facilita para você?” (e não “Qual sua deficiência?”).
Blocos: Ver (letra grande, alto contraste, tema escuro) · Ouvir (ler telas em voz alta, velocidade da
voz) · Entender (linguagem simples, pictogramas) · Comunicar (Libras, texto, idioma) · Locomover
(evitar escadas, evitar escadas rolantes, preferir elevador, evitar áreas ruidosas) · Sentir (vibração).
Prévia ao vivo; botão “Pular” sempre visível; atalho “Restaurar padrão”.
Privacidade: “Suas preferências ficam só neste celular” (localStorage). Nenhum dado vai para o
servidor.
T02: Mapa por piso
Seletor de piso fixo: 1º pavimento – Térreo · 2º pavimento – Praça de Alimentação (subsolos na fase
2).
Mapa SVG vetorizado da Planta Mix com botões + / − / centralizar / “onde estou”; toque num local
abre T04.
Camadas: Lojas · Alimentação · Sanitários (PNE, família) · Elevadores e escadas rolantes (com
status) · Mesas reservadas PcD · Sensorial (áreas ruidosas e tranquilas) · Ajuda (SAC, brigada).
Alternativa textual obrigatória: botão “Ver como lista”, com locais agrupados por setor e distância.
Acessibilidade: o SVG tem role="img" e título; os marcadores são botões focáveis; a lista é
equivalente completo do mapa.
T03: Buscar
Campo com busca por voz, tolerante a acentos e erros (“ca” → C&A; “banheiro” → sanitário;
“lanche” → alimentação).
Categorias em chips: Alimentação, Moda, Serviços, Lazer, Sanitários, Acessibilidade.
Resultados com distância a partir do ponto atual, piso e ícone; 1 toque leva à T04 ou direto à rota.
Estado vazio útil: “Não achei ‘xyz’. Quer pedir ajuda a um atendente?”

---

## Página 22

T04: Detalhe do local
Cabeçalho do local: nome, número da loja (ex.: “Outback Steakhouse · Loja 32 · 1º pavimento”),
categoria, horário, status aberto/fechado.
Ações: Como chegar (primária) · Ouvir · Ver em Libras · Linguagem simples · Traduzir.
Acessibilidade do local (quando informado): balcão rebaixado, cardápio em Braille/QR, atendimento
em Libras, nível de ruído.
Cardápio (restaurantes): conteúdo fornecido pela loja. No protótipo, itens marcados como
ilustrativos.
T05: Rota passo a passo
Resumo: origem → destino, distância, tempo estimado e perfil aplicado (“sem degraus”).
Passos numerados no padrão Wayfindr: ação + distância + referência (“Siga em frente 40 m pela
Alameda das Cores. A Camicado fica à sua esquerda.”).
Mudança de piso sempre por elevador quando o perfil exige; se o elevador estiver fora de serviço, a
rota é recalculada e o motivo é informado.
Modo áudio (lê passo a passo, com botões “Repetir”, “Próximo” e “Anterior”); vibração antes de
cada curva; tela não apaga (Wake Lock) durante a rota.
Mini-mapa opcional (pode ser ocultado); a lista de passos é a interface principal.
Botões: “Cheguei” (→ T10) · “Estou perdido” (→ T08 com local do último passo).
T06: Conversar
Tela dividida frente a frente: a metade de cima, girada 180°, é a do atendente; a de baixo é do
visitante. Cada lado tem seu idioma (PT, EN, ES) e modo (falar, digitar, frases prontas).
Legenda ao vivo (reconhecimento de fala) em letras grandes; “digite e o celular fala” (síntese de
voz); tradução automática entre os lados.
Libras: avatar VLibras para o texto do atendente + botão “Chamar intérprete de Libras”
(videochamada; parceria).
Frases prontas offline (exemplos): “Quanto custa?”, “Tem outro tamanho?”, “Posso pagar com
cartão?”, “Onde fica o caixa?”, “Pode escrever, por favor?”, “Sou surdo(a)”.
Privacidade: nada é gravado; o histórico some ao sair. Aviso de que o reconhecimento de fala do
navegador pode usar servidores do fabricante.
T07: Prancha de comunicação (CAA)
Grades de pictogramas por tema: Necessidades (banheiro, água, ajuda, dor, cansado), Sentimentos
(barulho demais, com medo, quero sair), Compras (quanto custa, outro tamanho, pagar), Lugares
(praça de alimentação, saída, estacionamento).
Tocar num pictograma fala a frase, mostra o texto em destaque para o atendente e traduz se o
idioma for diferente.
Montar frase (2–3 pictogramas) e “Mostrar em tela cheia” para o atendente.
Pictogramas Mulberry Symbols (licença CC BY-SA, uso comercial permitido com atribuição).

---

## Página 23

T08: Pedir ajuda
Etapa 1: “Que tipo de ajuda?” Orientação · Acompanhamento até um local · Comunicação
(Libras/idioma) · Mal-estar/saúde · Criança perdida · Segurança.
Etapa 2: confirmação, mostrando local detectado (“Mesa 07, Praça de Alimentação”), editável, e
como prefere se comunicar (texto, Libras, voz, idioma, pictogramas), com consentimento explícito
para enviar essa informação.
Sempre visível: SAMU 192 · Bombeiros 193 · Polícia 190 (links tel:), para emergências reais.
Sem CAPTCHA (barreira de acessibilidade); proteção por limite de envios e confirmação.
T09: Acompanhar pedido
Linha do tempo: Enviado → Aceito por Luana → A caminho (≈ 3 min) → Concluído, com anúncio
aria-live e vibração a cada mudança.
Ações: Cancelar · Atualizar meu local · Abrir conversa (T06) para quando a atendente chegar.
Sem internet: instrução para ir ao SAC mais próximo, com rota offline.
T10: Avaliar / reportar barreira
“Chegou bem?” com 5 estrelas ou respostas por voz/botões grandes (“Sim”, “Com dificuldade”,
“Não”).
Reportar barreira: Elevador parado, Escada sem alternativa, Caminho bloqueado, Sinalização ruim,
Problema no app, Outro. Local preenchido automaticamente; foto opcional (aviso para não fotografar
pessoas).
Formulário que funciona sem JavaScript (Server Action) e com erros anunciados.
T11: Serviços acessíveis
Lista com rota em 1 toque: sanitários PNE e família, fraldário, SAC, empréstimo de cadeira de rodas
(se houver), mesas reservadas PcD na praça de alimentação, área tranquila / sala sensorial (se
houver), vagas especiais nos subsolos, horários do shopping, eventos inclusivos (hora silenciosa).
Conteúdo mantido pela equipe do shopping (fase 2: CMS).
T12: Central da equipe (uso interno)
Fila em tempo real (som + destaque visual): tipo, local, piso, modo de comunicação, idioma, tempo
de espera; prioridade automática para saúde e criança perdida.
Ações: Aceitar, informar previsão, a caminho, concluir, marcar trote.
Equipamentos: alternar status de elevadores e escadas rolantes (operando, manutenção, fora de
serviço). Atualiza as rotas dos visitantes.
Barreiras reportadas: triagem e resolução; indicadores do dia.
Acesso com login da equipe (Supabase Auth); a interface segue as mesmas regras de acessibilidade
(a equipe também pode ter deficiência).

---

## Página 24

T13: Modo totem
Mesma aplicação em modo quiosque (Chrome em tela cheia): layout com elementos interativos na
faixa de alcance de cadeira de rodas (ABNT NBR 9050), áudio por fone de ouvido, teclado na
tela, reinício automático após inatividade (com aviso e opção de continuar) e limpeza de dados
entre usuários.
Permite tradução on-device (Translator API do Chrome desktop), pois o totem roda Chrome
desktop.

## 4.6 Estados globais de cada tela

Estado Comportamento padrão
Carregando Esqueleto com texto “Carregando…” anunciado uma única vez; nunca só
spinner
Sem internet Funções offline continuam (mapa, rota, busca, prancha, frases); funções
online explicam a limitação e oferecem alternativa
Erro Mensagem em linguagem simples + ação (“Tentar de novo”, “Pedir ajuda”)
Sem permissão (câmera/microfone) Explica para que serve e oferece alternativa (digitar código curto, digitar
texto)
Recurso não suportado (ex.: Esconde o botão e oferece alternativa equivalente
reconhecimento de fala no Firefox)

## 4.7 Mudanças em relação às telas da v1

v1 v2 Motivo
T00 Landing + T04 Menu T00 Início Menos uma tela e menos um toque; o QR já
informa o local
T01 Perfil T01 Preferências funcionais, Respeito, LGPD e melhor ajuste (necessidades se
“visual/auditivo/motório/cognitivo” puláveis combinam)
T03 Lojas & cardápios T03 Buscar + T04 Detalhe Separar descoberta de detalhe; deep link para
cada local
T05 Rota (perfil motor usando T05 Rota com elevador Correção de segurança
escada rolante) obrigatório no perfil, status e
recálculo
T06 Tradutor T06 Conversar (frente a Libras → português por IA não é confiável; frases
frente, offline, intérprete prontas funcionam sem internet
humano)
— T07 Prancha de pictogramas Autismo, afasia, surdez e estrangeiros
(comunicação universal)
T07 Suporte/Pânico T08 Pedir ajuda + T09 “Pânico” confunde emergência com orientação;
Acompanhar agora há números 192/193/190, confirmação e
acompanhamento
T08 Feedback T10 Avaliar / reportar Mantida e ampliada

---

## Página 25

v1 v2 Motivo
— T11 Serviços acessíveis, Operação real do shopping e acesso sem celular
T12 Central, T13 Totem

---

## Página 26


# 5. Requisitos

Prioridade MoSCoW: M = Must (MVP), S = Should (MVP se der tempo), C = Could (pós-hackathon), W =
Won’t (fora do escopo atual).

## 5.1 Requisitos funcionais

ID Requisito Prior. Tela
RF- Resolver o código de um ponto (QR, NFC ou código curto digitado) em contexto de M /q, T00
01 localização (ponto, piso, nó do grafo) e redirecionar ao início
RF- Permitir “Onde estou?” manual, escolhendo um ponto de referência em lista com busca M T00
02
RF- Gerenciar preferências funcionais (ver, ouvir, entender, comunicar, locomover, sentir), M T01
03 salvas somente no aparelho e aplicadas antes da primeira pintura
RF- Oferecer pt-BR, en e es, com detecção automática pelo idioma do aparelho e troca em 1 M Global
04 toque
RF- Ler em voz alta a tela atual e conteúdos específicos, com controle de velocidade M Global, T04,
05 T05
RF- Ativar Libras sob demanda (VLibras) para o texto da tela e exibir vídeo em Libras M Global, T04
06 quando existir
RF- Exibir mapa por piso (SVG) com botões de zoom/deslocamento, camadas e marcadores M T02
07 focáveis
RF- Oferecer alternativa textual completa do mapa (lista por setor e distância) M T02
08
RF- Buscar por nome, número, categoria e sinônimos, tolerando acentos e erros de digitação, M T03
09 com entrada por voz
RF- Exibir detalhe do local: nome, número, piso, categoria, horário, aberto/fechado, recursos M T04
10 de acessibilidade e descrição em linguagem simples
RF- Calcular rota acessível por perfil, considerando o status dos equipamentos M T05
11 (elevadores e escadas rolantes)
RF- Apresentar instruções passo a passo em texto, voz e vibração (padrão Wayfindr), com M T05
12 “repetir/próximo/anterior”
RF- Recalcular a rota quando o perfil ou um equipamento mudar, explicando o motivo S T05
13
RF- Modo conversa frente a frente com legenda ao vivo (reconhecimento de fala) M T06
14
RF- “Digite e o celular fala” e frases prontas disponíveis offline M T06
15
RF- Traduzir entre PT, EN e ES os dois lados da conversa M T06
16
RF- Atalho “Chamar intérprete de Libras” (videochamada, URL configurável pelo shopping) S T06
17

---

## Página 27

ID Requisito Prior. Tela
RF- Prancha de pictogramas com fala, texto em destaque, tradução e montagem de frase M T07
18
RF- Pedido de ajuda em 2 etapas: tipo, local (editável) e modo de comunicação, com M T08
19 consentimento explícito
RF- Exibir números de emergência (192, 193, 190) com discagem direta M T08
20
RF- Acompanhar o pedido com anúncios acessíveis e vibração; permitir cancelar e atualizar o M T09
21 local
RF- Central: fila em tempo real com alerta sonoro e visual, priorização e ciclo de vida do M T12
22 pedido (aceitar, a caminho, concluir, trote)
RF- Central: alternar status de elevadores e escadas rolantes, refletindo no cálculo de rotas M T12
23
RF- Avaliar a rota e reportar barreira georreferenciada; o formulário funciona sem JavaScript S T10
24
RF- Central: triagem e resolução de barreiras reportadas S T12
25
RF- Serviços acessíveis: lista com rota em 1 toque S T11
26
RF- Camadas sensorial (ruído/tranquilidade) e mesas reservadas PcD no mapa S T02
27
RF- Funcionamento offline de mapa, busca, rotas, prancha e frases prontas (PWA) S Global
28
RF- Modo totem: reinício automático com aviso, limpeza de dados entre usuários e layout na C T13
29 faixa de alcance
RF- Declaração de acessibilidade e aviso de privacidade em linguagem simples M Institucional
30

## 5.2 Requisitos não funcionais

ID Categoria Requisito
RNF- Acessibilidade WCAG 2.2 AA (ABNT NBR 17225:2025) em todos os fluxos; AAA selecionados: contraste
01 ≥ 7:1 no tema de alto contraste, alvos ≥ 48 px, linguagem simples
RNF- Tecnologia assistiva Compatível com TalkBack (Android/Chrome), VoiceOver (iOS/Safari), NVDA (Windows),
02 teclado e acionadores (switch)
RNF- Desempenho p75 em 4G: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; JS inicial ≤ 170 KB gzip por rota do
03 visitante
RNF- Disponibilidade 99,5% no piloto; funções críticas offline
04
RNF- Privacidade Nenhum dado sensível sai do aparelho sem consentimento explícito; sem cookies de
05 rastreamento; sem gravação de áudio
RNF- Segurança HTTPS, CSP, validação zod em todas as entradas, limite de requisições, autenticação da
06 equipe, RLS no banco, segredos só no servidor

---

## Página 28

ID Categoria Requisito
RNF- Internacionalização 100% dos textos em arquivos de mensagens (pt-BR, en, es); lang correto na página e em
07 trechos em outro idioma
RNF- Compatibilidade Últimas 2 versões de Chrome, Safari, Edge e Firefox; Android ≥ 10, iOS ≥ 16; largura
08 mínima de 320 px
RNF- Usabilidade SUS ≥ 80; tarefa crítica em ≤ 3 interações; teste com ≥ 5 pessoas com deficiência de
09 perfis diferentes antes do piloto
RNF- Manutenibilidade TypeScript strict; domínio puro com cobertura ≥ 90%; ESLint sem erros; decisões
10 registradas em ADR
RNF- Qualidade contínua CI em cada PR: lint, typecheck, testes unitários, E2E com axe e Lighthouse CI
11
RNF- Dados atualizáveis Planta, grafo e catálogo versionados e validados por esquema; trocar loja sem mudar
12 código (fase 2: CMS)
RNF- Observabilidade Logs estruturados sem dados pessoais; métricas agregadas (scans por ponto, pedidos,
13 tempo de atendimento)
RNF- Tempo real Novo pedido aparece na Central em ≤ 2 s; status chega ao visitante em ≤ 5 s
14
RNF- Governança de Traduções e versões em linguagem simples feitas com apoio de IA passam por revisão
15 conteúdo humana antes de publicar
RNF- Custos MVP em planos gratuitos; custo variável de tradução com orçamento mensal e corte
16 automático

## 5.3 Regras de negócio

ID Regra
RN- Com o perfil “evitar escadas”, arestas de escada e escada rolante são proibidas. Sem rota possível, o app informa
01 e oferece acompanhamento (T08)
RN- Equipamento em manutenção ou fora de serviço sai do grafo para todos os perfis até ser reativado na Central
02
RN- No máximo 1 pedido de ajuda aberto por aparelho e 3 pedidos a cada 10 min por aparelho/IP. Tipos saúde e
03 criança perdida têm prioridade máxima
RN- Pedido sem aceite em 2 min gera alerta escalonado na Central (supervisor)
04
RN- Pedidos são anonimizados após 30 dias; ficam só estatísticas agregadas
05
RN- Conteúdo de loja e cardápio é de responsabilidade da loja; o app mostra a data da última atualização
06
RN- Código de ponto inexistente ou desativado abre T00 com “Onde estou?” e registra o código para manutenção
07
RN- A rota termina ao tocar em “Cheguei” ou após 30 min sem interação; então o Wake Lock é liberado
08

---

## Página 29


## 5.4 Histórias de usuário críticas (com critérios de aceite)

US-01: Chegar já localizado (RF-01) Como visitante, quero que o app abra sabendo onde estou para não
precisar procurar no mapa.
Dado que estou na Entrada Av. JK
Quando escaneio o QR ou encosto o celular na placa "ENT-JK"
Então o app abre o Início em até 2,5 s no 4G
E mostra "Você está em: Entrada Av. JK · 1º pavimento"
E, se a voz estiver ativada, anuncia o local
US-02: Rota sem degraus com elevador parado (RF-11, RF-13, RN-01, RN-02)
Dado que minha preferência é "evitar escadas"
E que a Central marcou o elevador ELV-01 como "manutenção"
Quando peço rota da Entrada Av. JK ao Mundo Imersivo (2º pavimento)
Então a rota não contém escada nem escada rolante
E usa outro elevador disponível
E o app informa "Elevador ELV-01 em manutenção, rota ajustada"
E, se não houver elevador disponível, oferece "Pedir acompanhamento"
US-03: Conversa com atendente (surdo) (RF-14, RF-15)
Dado que estou na tela Conversar com o lado do atendente em português
Quando a atendente fala "Temos no tamanho M"
Então a frase aparece na minha metade da tela em até 2 s, em letras grandes
Quando eu digito "Posso experimentar?" e toco em Falar
Então o celular fala a frase em voz alta e mostra o texto na metade da atendente
US-04: Pedir ajuda (RF-19, RF-21, RF-22)
Dado que estou na Mesa 07 da Praça de Alimentação (via QR)
Quando toco em Ajuda, escolho "Comunicação" e confirmo "Prefiro texto/Libras"
Então a Central recebe o pedido em até 2 s com local, tipo e modo de comunicação
E quando a atendente aceita, ouço/vejo "Luana está a caminho" em até 5 s
US-05: Mapa para quem usa leitor de tela (RF-08)
Dado que uso o TalkBack
Quando abro o Mapa e ativo "Ver como lista"
Então todos os locais do piso estão acessíveis por navegação linear, com nome, setor e distância
E cada item tem as ações "Detalhes" e "Como chegar"
US-06: Prancha de pictogramas (RF-18)
Dado que estou na Prancha
Quando toco em "Banheiro" e depois em "Onde?"
Então o app mostra "Onde fica o banheiro?" em destaque, fala a frase
E oferece "Como chegar ao sanitário mais próximo"

---

## Página 30


## 5.5 Rastreabilidade (resumo)

Requisito Tela Módulo (src/) Teste principal
RF-01, RF-02 T00 funcionalidades/localizacao, app/q/[codigo] E2E qr-contexto.spec.ts
RF-03 T01 funcionalidades/preferencias Unit + E2E preferencias.spec.ts
RF-07, RF-08, T02 funcionalidades/mapa E2E + axe mapa.spec.ts
RF-27
RF-09 T03 dominio/busca Unit busca.test.ts
RF-11 a RF-13 T05 dominio/rotas, funcionalidades/rotas Unit dijkstra.test.ts,
instrucoes.test.ts
RF-14 a RF-17 T06 funcionalidades/conversa, adaptadores/voz, E2E com mocks de voz
adaptadores/traducao
RF-18 T07 funcionalidades/prancha E2E prancha.spec.ts
RF-19 a RF-23 T08, funcionalidades/ajuda, E2E ajuda-central.spec.ts
T09, T12 funcionalidades/central

---

## Página 31


# 6. Linguagem de programação escolhida: TypeScript


## 6.1 Decisão

Item Escolha
Linguagem TypeScript 5.x em modo strict, no cliente e no servidor (uma só linguagem)
Runtime Node.js 22 LTS (build e Route Handlers) + navegador (React 19)
Framework (tecnologia sorteada) React 19.3 + Next.js 16.4 (App Router)
Validação em tempo de execução zod 4 (esquemas compartilhados entre cliente, servidor e scripts de dados)
Banco de dados SQL (PostgreSQL via Supabase) para pedidos de ajuda, status e barreiras

## 6.2 Por que TypeScript

Critério Benefício concreto no Guia Dourado
Segurança de tipos Planta, grafo, perfis de rota e pedidos de ajuda são estruturas ricas. Um erro silencioso (ex.: aresta
no domínio de escada sem tipo) pode mandar um cadeirante para uma escada. Tipos discriminados (tipo:
'elevador' \| 'escada' \| ...) tornam esse erro impossível de compilar
Uma linguagem de O mesmo módulo de rotas roda no navegador (offline) e no servidor (validação), e os mesmos
ponta a ponta esquemas zod validam formulários, APIs e os arquivos de dados no CI
Ecossistema de Radix UI / shadcn/ui, axe-core, Testing Library, eslint-plugin-jsx-a11y (já incluso no eslint-config-
acessibilidade next) e tipos das Web APIs (Speech, Vibration, Wake Lock, NFC)
Exigência da React + Next.js têm suporte nativo e de primeira classe a TypeScript (PageProps, rotas tipadas,
tecnologia sorteada next.config.ts)
Equipe e mercado Linguagem mais usada no front-end brasileiro; curva curta para quem já sabe JavaScript
Alternativas avaliadas: JavaScript puro (sem garantias de tipo no grafo), Dart/Flutter Web (acessibilidade
web mais fraca, já que o conteúdo é desenhado em canvas e depende de uma árvore semântica paralela),
Kotlin Multiplatform (exigiria app nativo, o que cria barreira de instalação), Python no back-end (duas
linguagens e duas bases de tipos para um MVP de 24 h).

## 6.3 Convenções de código

Tema Convenção
Idioma do Domínio, componentes e dados em português (linguagem ubíqua do shopping: piso, local, rota,
código pedidoDeAjuda). Termos técnicos consagrados ficam em inglês (useX, page.tsx, route.ts)
Nomes Componentes em PascalCase (MapaDoPiso), funções e variáveis em camelCase, arquivos em kebab-
case (mapa-do-piso.tsx), tipos em PascalCase
tsconfig strict, noUncheckedIndexedAccess, noImplicitOverride, exactOptionalPropertyTypes (no
domínio)
Fronteiras Toda entrada externa (URL, formulário, JSON de dados, resposta de API) passa por um esquema zod

---

## Página 32

Tema Convenção
Erros Funções do domínio retornam resultados tipados ({ ok: true, rota } \| { ok: false, motivo });
nada de throw para fluxo esperado (ex.: “sem rota possível”)
Estilo Prettier + ESLint (config do Next + regras de acessibilidade); import type para tipos
Comentários Explicam o porquê e citam o requisito (// RN-01: perfil sem escadas proíbe escada rolante)
Commits Conventional Commits em português (feat(rotas): recalcula ao mudar status do elevador)

## 6.4 Exemplo: tipos do domínio de rotas

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
equipamentoId?: string; // elevador/escada rolante cujo status afeta a rota
inclinacaoPct?: number; // rampas: > 8,33% é proibida para cadeira de rodas
marcos?: string[]; // ids de locais usados como referência na instrução
}
export type PerfilRota = 'padrao' | 'sem_degraus' | 'mobilidade_reduzida' | 'visual' | 'sensorial';
export type ResultadoRota =
| { ok: true; passos: Passo[]; distanciaM: number; minutos: number }
| { ok: false; motivo: 'sem_caminho' | 'origem_invalida' | 'destino_invalido' };

---

## Página 33


# 7. Arquitetura proposta


## 7.1 Princípios

1. Offline-first nas funções críticas. Mapa, busca, rotas, prancha e frases prontas funcionam sem
internet.
2. Domínio puro e determinístico. Grafo, rotas, instruções e busca ficam em TypeScript sem I/O,
rodam igual no cliente e no servidor e são 100% testáveis. Nenhuma rota é gerada por IA.
3. Portas e adaptadores (arquitetura hexagonal) para tudo que é externo: voz, tradução, Libras, tempo
real e armazenamento. Trocar de fornecedor não mexe nas telas.
4. Renderização no servidor por padrão (React Server Components). Client Components só onde há
interação. Menos JavaScript no celular.
5. Privacidade por concepção. Preferências (que podem revelar deficiência) nunca saem do
aparelho. O servidor só recebe o mínimo, com consentimento.
6. Monólito modular. Um repositório e um deploy, organizados por funcionalidades com fronteiras
claras. Simples para 24 h, pronto para crescer.
7. Aprimoramento progressivo. Formulários funcionam sem JavaScript (Server Actions); o mapa tem
lista equivalente; a voz tem alternativa em texto.
8. Dados como código. Planta, grafo, locais e pontos são versionados no Git e validados por esquema
no CI.

## 7.2 Contexto (C4, nível 1)

Diagrama 2: 7.2 Contexto (C4, nível 1)

---

## Página 34


## 7.3 Contêineres (C4, nível 2)

Diagrama 3: 7.3 Contêineres (C4, nível 2)

---

## Página 35

Contêiner Responsabilidade Tecnologia
Interface do visitante Telas T00–T11 e T13, preferências, mapa, rotas, React 19, Next.js 16, Tailwind 4,
conversa, prancha shadcn/ui (Radix)
Service Worker Cache do app e dos dados; funcionamento offline Serwist (ou SW próprio) +
app/manifest.ts
Next.js (servidor) Páginas estáticas por idioma e local; Proxy de Next.js 16 App Router, next-intl 4
idioma; metadados
Route Handlers / Server Resolver QR, criar e consultar pedidos, traduzir, Node.js 22, zod
Actions receber barreiras
Dados versionados Planta SVG, grafo, locais, pontos, equipamentos, JSON validado por zod no CI
frases, prancha
Central da equipe Fila em tempo real, status de equipamentos, React + Supabase Realtime + Auth
barreiras
Banco Pedidos, eventos, status, barreiras, avaliações, PostgreSQL (Supabase) com RLS
contadores

---

## Página 36


## 7.4 Componentes (C4, nível 3) e organização do código

Diagrama 4: 7.4 Componentes (C4, nível 3) e organização do código

---

## Página 37

Regras de dependência: dominio/ não importa nada de React, Next.js ou adaptadores.
funcionalidades/ usa dominio/, adaptadores/ e componentes/. app/ só compõe. Uma regra de lint
(no-restricted-imports) garante isso.
capim-dourado-acessivel/
├── dados/ # dados versionados (validados no CI)
│ ├── pisos.json locais.json grafo.json pontos.json
│ ├── equipamentos.json frases-prontas.json prancha.json
├── docs/ # esta documentação + ADRs
├── public/
│ ├── plantas/ # terreo.svg, praca-alimentacao.svg
│ ├── pictogramas/ # Mulberry Symbols (CC BY-SA)
│ └── libras/ # vídeos curtos com intérpretes
├── src/
│ ├── app/
│ │ ├── [locale]/ # visitante (pt-BR, en, es)
│ │ │ ├── layout.tsx page.tsx (T00)
│ │ │ ├── preferencias/ mapa/[piso]/ buscar/ locais/[slug]/
│ │ │ ├── rota/ conversar/ prancha/ ajuda/ ajuda/[id]/
│ │ │ ├── avaliar/ servicos/ acessibilidade/ privacidade/
│ │ ├── central/ # T12 (equipe)
│ │ ├── totem/[ponto]/ # T13 (ativa modo quiosque)
│ │ ├── q/[codigo]/route.ts # resolvedor de QR/NFC
│ │ ├── api/ # ajuda, traducao, equipamentos, barreiras
│ │ └── manifest.ts
│ ├── proxy.ts # negociação de idioma (Next.js 16)
│ ├── i18n/ mensagens/ # next-intl + pt-BR.json, en.json, es.json
│ ├── dominio/ # tipos, esquemas, grafo, rotas, instruções, busca
│ ├── funcionalidades/ # uma pasta por funcionalidade
│ ├── adaptadores/ # voz, traducao, libras, tempo-real, armazenamento
│ ├── componentes/ # ui (shadcn), a11y, layout
│ └── lib/ # env, supabase, utilidades
├── supabase/migrations/ # SQL versionado
├── ferramentas/ # scripts: validar dados, gerar QR, extrair planta
├── tests/e2e/ # Playwright + axe
└── wireframes/index.html

## 7.5 Fluxos principais

7.5.1 Chegada pelo QR/NFC
Diagrama 5: 7.5.1 Chegada pelo QR/NFC

---

## Página 38

7.5.2 Rota acessível (funciona offline)
Diagrama 6: 7.5.2 Rota acessível (funciona offline)
7.5.3 Pedido de ajuda em tempo real
Diagrama 7: 7.5.3 Pedido de ajuda em tempo real

---

## Página 39

7.5.4 Conversa com tradução
Diagrama 8: 7.5.4 Conversa com tradução

## 7.6 Estratégia offline

Recurso Estratégia de cache Observação
Casca do app (HTML, JS, Pré-cache na instalação do Service Worker Versionado por build
CSS, fontes)
Plantas SVG, grafo, locais, Pré-cache Pequenos (meta < 1,5 MB
pontos, frases, pictogramas no total)
Páginas de locais (T04) Stale-while-revalidate + prefetch do Next.js Ficam disponíveis depois
da 1ª visita
Status de equipamentos Rede primeiro (timeout 2 s) → último valor conhecido Mostra “atualizado há X
min”
Pedido de ajuda Exige conexão; offline mostra rota até o SAC e orientação Sem promessas falsas
VLibras e tradução em nuvem Só online Frases prontas e prancha
cobrem o offline
Navegações e Server Actions experimental.useOffline do Next.js 16.4 mantém a Hook useOffline()
requisição pendente e repete quando a rede volta mostra o aviso ao usuário

## 7.7 Estado no cliente

Estado Onde fica Duração Vai para o servidor?
Preferências (voz, contraste, perfil localStorage Até o usuário Nunca
de rota…) (gd:preferencias:v1) limpar
Ponto atual (contexto do QR) sessionStorage (gd:ponto) Sessão Só ao pedir ajuda (com
consentimento)
Sessão de rota Estado React + sessionStorage Sessão Não

---

## Página 40

Estado Onde fica Duração Vai para o servidor?
Idioma Cookie NEXT_LOCALE (next-intl) 1 ano Sim (não é sensível)
Token do aparelho (limite de localStorage (UUID aleatório) Até limpar Sim (pseudônimo)
pedidos)
Pedido ativo sessionStorage (id + token) Até concluir Sim

## 7.8 Segurança em camadas (detalhes no Cap. 11)

Camada Controles
Borda HTTPS/HSTS, CSP com lista de origens (VLibras, Supabase), cabeçalhos de segurança, limite de requisições
Aplicação zod em todas as entradas; Server Actions com verificação de origem; segredos só em variáveis de servidor
Dados RLS no Postgres: visitante não lê a tabela; equipe autenticada; chave de serviço só no servidor
Abuso Confirmação em 2 etapas, limite por aparelho/IP, marcação de “trote”, sem CAPTCHA (barreira de
acessibilidade)
Físico Placas com código curto e domínio visíveis, lacre anti-adulteração, inspeção periódica contra QR falso colado
por cima

## 7.9 Implantação e ambientes

Diagrama 9: 7.9 Implantação e ambientes
Ambiente Uso Dados
Local Desenvolvimento Supabase local (CLI) ou projeto de teste; adaptadores mock de
voz e tradução
Preview Cada PR com URL própria; testes E2E e Projeto Supabase de teste
Lighthouse
Produção Piloto no shopping Projeto Supabase de produção (região São Paulo)

---

## Página 41


## 7.10 Cenários de atributos de qualidade

Atributo Cenário Resposta da arquitetura
Disponibilidade Wi-Fi cai na praça de alimentação Service Worker + roteamento no cliente: a rota continua
no meio da rota
Segurança física Elevador quebra Status na Central → sai do grafo → rotas recalculadas
Desempenho QR escaneado em 4G fraco Página estática na CDN em São Paulo, pouco JS (RSC) → LCP ≤
2,5 s
Privacidade Visitante ativa “evitar escadas” Preferência fica só no aparelho; o servidor nunca recebe
Modificabilidade Loja muda de lugar Editar dados/locais.json (fase 2: CMS) → validação no CI →
deploy, sem mexer em código
Interoperabilidade Shopping troca de provedor de Novo adaptador implementa a porta; telas intactas
tradução
Usabilidade Pessoa sem celular ou sem Modo totem + ajuda humana + linguagem simples
familiaridade
Abuso Trote no botão de ajuda 2 etapas, limite por aparelho/IP, marcação de trote

## 7.11 Evolução prevista

Fase Arquitetura
MVP (14/11) Monólito Next.js + dados em JSON + Supabase para pedidos e status
Piloto (30– CMS leve para lojas, cardápios e avisos (tabelas no Supabase + telas na Central); vídeos em Libras; placas
90 dias) NFC/Braille; integração com intérpretes; totens
Escala Posicionamento contínuo (beacons no padrão Wayfindr ou câmera); NaviLens; exportação IMDF para mapas
de terceiros; multi-shopping (multi-tenant) para outros empreendimentos da administradora

---

## Página 42


# 8. Plataforma e tecnologias adotadas


## 8.1 Plataforma

Decisão Escolha Justificativa
Plataforma principal Web responsiva / PWA, mobile- Abre direto do QR/NFC, sem loja de apps, sem instalação e
first sem cadastro. Funciona em Android e iPhone com o leitor de
tela nativo
Acesso sem celular Modo totem (mesma aplicação Atende quem não tem celular, tem pouca familiaridade digital
no Chrome em modo quiosque) ou está sem bateria
Central da equipe Web (desktop, tablet ou celular Mesma base de código; login só para a equipe
do SAC)
Hospedagem Vercel, região gru1 (São Paulo) Plataforma nativa do Next.js, CDN, previews por PR, latência
baixa em Palmas
Banco, tempo real e Supabase (PostgreSQL), região Postgres padrão (sem aprisionamento), Realtime para a
autenticação São Paulo Central, Auth para a equipe e plano gratuito
Por que não app — Barreira de instalação, duas bases de código, revisão em lojas.
nativo Um app nativo pode ser só um “invólucro” no futuro, se houver
demanda

## 8.2 Stack (versões verificadas em 13/11/2026)

Camada Tecnologia Versão Papel no projeto
Linguagem TypeScript 5.x Tipagem de ponta a ponta (Cap. 6)
Framework Next.js (App Router) 16.4.6 Tecnologia sorteada: RSC,
páginas estáticas, Route Handlers,
Server Actions, Proxy, Cache
Components
UI React 19.3 Componentes acessíveis, Context,
useActionState, useOptimistic
Estilo Tailwind CSS 4.3 Tokens de design em variáveis
CSS (temas padrão, escuro e alto
contraste)
Componentes shadcn/ui + Radix UI radix-ui 1.8 Primitivos acessíveis (Dialog, Tabs,
RadioGroup, Switch) com foco e
ARIA corretos
Ícones lucide-react 1.x Sempre acompanhados de texto
Tipografia Atkinson Hyperlegible Next via next/font — Fonte do Braille Institute
desenhada para baixa visão
Internacionalização next-intl 4.15 pt-BR, en, es; roteamento por
idioma; mensagens tipadas
PWA / offline app/manifest.ts + Serwist 9.5 Manifesto e Service Worker com
pré-cache

---

## Página 43

Camada Tecnologia Versão Papel no projeto
Mapa SVG inline + react-zoom-pan-pinch 4.2 Leve, vetorial, acessível; sem
servidor de mapas
Rotas Dijkstra próprio (src/dominio/rotas) — Determinístico e testável; grafo
pequeno (< 1.000 nós)
Busca Índice próprio (normalização + sinônimos) — Funciona offline e ocupa poucos
KB
Voz Web Speech API (SpeechSynthesis / nativa Leitura em voz e legenda ao vivo
SpeechRecognition) sem custo
Tradução Porta + adaptadores: frases prontas (offline) — Funciona sem internet nas frases
→ Translator API do Chrome (no aparelho, mais comuns; nuvem só quando
desktop/totem) → provedor em nuvem via precisa
/api/traducao
IA generativa Claude via @anthropic-ai/sdk 1.8 Tradução contextual e rascunho de
(opcional) linguagem simples, sempre com
revisão humana. Ver 8.4
Libras VLibras (widget gov.br) + vídeos com — Gratuito e oficial; humano para
intérpretes + intérprete humano por vídeo Libras → português
Pictogramas Mulberry Symbols CC BY-SA Uso comercial permitido com
atribuição (ARASAAC é não
comercial)
Validação zod 4.6 Esquemas compartilhados
(formulários, APIs, dados)
Back-end Route Handlers + Server Actions (Node.js 22) — Sem servidor separado
Banco / tempo real / Supabase + @supabase/supabase-js / 2.119 / 0.12 Pedidos de ajuda, status, barreiras,
auth @supabase/ssr login da equipe
QR Codes qrcode 1.5 Geração das artes das placas
(SVG/PDF) em ferramentas/
NFC Etiquetas NTAG213/215 com registro NDEF de — Celulares Android com NFC e
URL iPhones recentes abrem a URL ao
encostar, sem app
Testes Vitest · Testing Library · jest-axe · Playwright + 5.1 · 16.3 · Pirâmide de testes com
@axe-core/playwright · Lighthouse CI 11 · 1.65 + acessibilidade automatizada (Cap.
4.14 · 0.16 12)
Qualidade ESLint (eslint-config-next 16.4, com jsx- — Regras de acessibilidade já no
a11y) · Prettier 3 · GitHub Actions editor
Observabilidade Vercel Web Analytics (sem cookies) + logs — Métricas agregadas, sem dados
estruturados pessoais

## 8.3 Suporte das Web APIs (e alternativa quando não há)

API Onde funciona Sem suporte, o app…
SpeechSynthesis (falar) Chrome, Edge, Safari, Firefox (vozes Mostra o texto em destaque
variam por aparelho)

---

## Página 44

API Onde funciona Sem suporte, o app…
SpeechRecognition (ouvir) Chrome/Edge; Safari (com prefixo Oferece “digitar” no lugar de “falar”
webkit). Firefox não
Vibration Chrome no Android. Safari/iOS não Usa som curto + aviso visual
Screen Wake Lock (tela acesa Chrome no Android; Safari 16.4+ Pede para tocar na tela de tempos em
na rota) tempos
Web NFC Só Chrome no Android Não dependemos dela: a etiqueta abre a
URL pelo sistema
Translator API (tradução no Chrome desktop (nov/2026, não no Usada no totem; no celular, frases prontas
aparelho) celular) ou nuvem

## 8.4 IA generativa: onde entra e onde não entra

Uso Entra? Como
Rotas, instruções, status de Não Algoritmo determinístico e dados oficiais
equipamentos, emergência
Tradução de frases livres na Opcional /api/traducao → adaptador em nuvem (LLM ou API de
conversa (T06) tradução). Só a frase é enviada, sem identificadores e sem guardar
nada
Linguagem simples e traduções Sim, no momento Rascunho gerado com apoio de IA → revisão humana →
de conteúdo de lojas da edição publicado como dado estático (RNF-15)
Descrição de imagens (pratos, Fase 2 Rascunho de texto alternativo revisado por humanos
lojas)
Adaptador Claude (opcional): modelo padrão claude-opus-5-5, configurável pela variável LLM_MODEL.
Esforço low (output_config.effort) para reduzir a latência, saída estruturada com zod
(client.messages.parse), fallbacks do lado do servidor habilitados e tratamento de stop_reason:
"refusal". Se a equipe priorizar custo e latência após testar a qualidade, pode trocar para claude-haiku-
5-5. Custo estimado (preços de tabela, nov/2026) para uma frase de cerca de 300 tokens de entrada e 60
de saída:
Modelo Entrada / saída (US$ por milhão de tokens) Custo por frase 1.000 frases/dia
claude-opus-5-5 4,00 / 20,00 ≈ US$ 0,0024 ≈ US$ 2,40
claude-haiku-5-5 0,10 / 0,50 ≈ US$ 0,00006 ≈ US$ 0,06
No MVP, a maior parte das conversas usa frases prontas (custo zero e offline). A tradução em nuvem
é o último recurso e tem orçamento mensal com corte automático (RNF-16).

---

## Página 45


## 8.5 Compatibilidade e tecnologia assistiva

Plataforma Navegador Leitor de tela Prioridade de teste
Android 10+ Chrome TalkBack Alta (maioria dos celulares no Brasil)
iOS 16+ Safari VoiceOver Alta
Totem (Windows ou Linux) Chrome em modo quiosque NVDA / Narrador Média
Desktop Chrome, Edge, Firefox NVDA, JAWS Média

## 8.6 Custos estimados

Item MVP (hackathon) Piloto no shopping
Hospedagem (Vercel) Plano gratuito (uso não Plano pago por membro da equipe
comercial)
Banco / tempo real (Supabase) Plano gratuito Plano pago mensal (backups e sem pausa)
VLibras, Web Speech, pictogramas Gratuito Gratuito
Mulberry
Tradução em nuvem / IA Créditos de teste Centavos de dólar por dia na escala do piloto
(8.4), com teto
Placas QR + NFC + Braille — Produção gráfica + etiquetas NFC (baixo custo
unitário)
Intérprete de Libras por vídeo — Contrato ou parceria (maior custo recorrente,
maior impacto)

---

## Página 46


# 9. Como a tecnologia sorteada (React + Next.js) será

incorporada
Atende ao item “Descrição de como a tecnologia ou prática sorteada será incorporada à
solução”. A tecnologia sorteada é React + Next.js (TypeScript). Este capítulo mostra, recurso por
recurso, onde cada um entra no Guia Dourado e qual barreira de acessibilidade ele ajuda a
remover. Versões: Next.js 16.4.6 e React 19.3 (as mais recentes em 13/11/2026). Os trechos de
código são esboços de planejamento.

## 9.1 Visão geral: recurso → uso → ganho de acessibilidade

Recurso Uso no Guia Dourado Ganho para o visitante
App Router + layouts aninhados Layout do visitante ([locale]) com Navegação consistente em todas
cabeçalho, botão Ajuda e anunciador; as telas (WCAG 3.2.3 e 3.2.6)
layout próprio para a Central
React Server Components (padrão) Fichas de loja, listas, textos e planta SVG Menos JavaScript no celular → abre
renderizados no servidor rápido no 4G (LCP ≤ 2,5 s)
Geração estática Uma página por local e por piso, em cada O QR abre uma página pronta na
(generateStaticParams) idioma, gerada no build CDN de São Paulo
Cache Components + Partial Casca estática das páginas + partes A página aparece na hora; só o “ao
Prefetching (padrão do Next 16.4) dinâmicas (status de elevadores) em vivo” espera a rede
<Suspense>
Route Handlers (route.ts) /q/[codigo] (resolver QR/NFC), Entrada por QR/NFC; chaves de API
/api/ajuda, /api/traducao, ficam só no servidor
/api/equipamentos
Server Actions + <form action> Avaliação, reporte de barreira e Formulários funcionam até sem
preferências da Central JavaScript; erros anunciados com
useActionState
Proxy (proxy.ts, antigo middleware) Negociação de idioma (pt-BR, en, es) via O turista já abre o app no seu
next-intl idioma
Metadata API Título único e descritivo por tela (“Rota até O anunciador de rotas do Next lê o
Outback · Guia Dourado”) título a cada navegação
Anunciador de rotas embutido Anuncia a nova página em navegações do Usuário de leitor de tela sabe que a
lado do cliente tela mudou
next/font Atkinson Hyperlegible Next servida Leitura melhor para baixa visão;
localmente, sem salto de layout CLS ≈ 0
next/image Fotos de lojas e pratos com alt obrigatório Imagem leve e com descrição
e tamanhos responsivos
next/script Carrega o VLibras sob demanda (só Desempenho e privacidade
quando a pessoa ativa Libras)

---

## Página 47

Recurso Uso no Guia Dourado Ganho para o visitante
app/manifest.ts + Service Worker PWA instalável (opcional) com cache de Offline em mapa, rotas, prancha e
app e dados frases
experimental.useOffline + Navegações e Server Actions esperam a Nada “quebra” quando o Wi-Fi cai
useOffline() (next/offline) rede voltar; aviso de “sem internet”
Loading, error e not-found loading.tsx, error.tsx, not-found.tsx Estados claros e anunciados
com mensagens em linguagem simples
ESLint do Next com jsx-a11y Lint obrigatório no CI Erros de ARIA, alt e rótulos
detectados no editor

## 9.2 Onde entra o React

Recurso do React 19 Uso
Componentes reutilizáveis e BotaoAjuda, LerEmVoz, BotaoLibras, Anunciador, MapaDoPiso, ListaDeLocais,
acessíveis PassoDaRota, CartaoPictograma, TelaDividida. Uma correção de acessibilidade num
componente vale para o app inteiro
Context PreferenciasProvider (tema, fonte, voz, perfil de rota), LocalizacaoProvider (ponto
atual), AnunciadorProvider (região aria-live única)
useSyncExternalStore Ler preferências do localStorage sem divergência entre servidor e cliente
useActionState Formulários com erros anunciados e foco no primeiro campo inválido
useOptimistic Pedido de ajuda aparece como “Enviando…” na hora, antes da confirmação
useTransition / Suspense Busca e rota sem travar a interface; carregamento progressivo
Hooks próprios para Web useFala (SpeechSynthesis), useEscuta (SpeechRecognition), useVibracao,
APIs useTelaAcesa (Wake Lock), useMovimentoReduzido, useConexao
Error Boundaries Uma falha no módulo de voz não derruba a rota

## 9.3 Esboços de código

9.3.1 Preferências aplicadas antes da primeira pintura (sem “piscar” o tema)
O Next.js 16 recomenda um script inline que roda antes da pintura para estados que só o cliente conhece
(guia Preventing Flash). É essencial para alto contraste e fonte grande.
// src/app/[locale]/layout.tsx (trecho)
const scriptPreferencias = `
try {
var p = JSON.parse(localStorage.getItem('gd:preferencias:v1') || '{}');
var r = document.documentElement;
if (p.tema) r.dataset.tema = p.tema; // padrao | escuro | alto-contraste
if (p.escalaFonte) r.style.setProperty('--escala-fonte', String(p.escalaFonte));
if (p.reduzirMovimento) r.dataset.movimento = 'reduzido';
} catch (e) {}
`;
export default async function LayoutVisitante({ children, params }: LayoutProps<'/[locale]'>) {
const { locale } = await params;

---

## Página 48

return (
<html lang={locale} suppressHydrationWarning>
<head>
<script dangerouslySetInnerHTML={{ __html: scriptPreferencias }} />
</head>
<body>
<a href="#conteudo" className="pular-link">Pular para o conteúdo</a>
<PreferenciasProvider>
<AnunciadorProvider>
<Cabecalho />
<main id="conteudo" tabIndex={-1}>{children}</main>
<BotaoAjuda />
</AnunciadorProvider>
</PreferenciasProvider>
</body>
</html>
);
}
9.3.2 Página estática por local (Server Component)
// src/app/[locale]/locais/[slug]/page.tsx (esboço)
import dados from '@dados/locais.json';
export function generateStaticParams() {
return dados.locais.map((l) => ({ slug: l.slug })); // × 3 idiomas no layout
}
export async function generateMetadata({ params }: PageProps<'/[locale]/locais/[slug]'>) {
const { slug } = await params;
const local = buscarLocal(slug);
return { title: `${local.nome} · ${local.numero} · Guia Dourado` };
}
export default async function PaginaLocal({ params }: PageProps<'/[locale]/locais/[slug]'>) {
const { slug, locale } = await params;
const local = buscarLocal(slug);
return (
<article aria-labelledby="titulo-local">
<h1 id="titulo-local">{local.nome}</h1>
<p>{local.numero} · {nomeDoPiso(local.piso, locale)}</p>
<AcoesDoLocal local={local} /> {/* Client Component: Ouvir, Libras, Como chegar */}
<Suspense fallback={<p>Verificando horário…</p>}>
<StatusAberto localId={local.id} /> {/* parte dinâmica */}
</Suspense>
<DescricaoAcessivel local={local} /> {/* texto + linguagem simples */}
</article>
);
}
9.3.3 Resolver o QR/NFC (Route Handler)
// src/app/q/[codigo]/route.ts (esboço)
import { NextResponse, type NextRequest } from 'next/server';
import { esquemaCodigo, buscarPonto } from '@/dominio/pontos';
export async function GET(req: NextRequest, ctx: RouteContext<'/q/[codigo]'>) {
const { codigo } = await ctx.params;
const valido = esquemaCodigo.safeParse(codigo.toUpperCase());
const ponto = valido.success ? buscarPonto(valido.data) : undefined;

---

## Página 49

const idioma = escolherIdioma(req); // cookie NEXT_LOCALE ou Accept-Language
const destino = new URL(`/${idioma}`, req.url);
if (ponto) destino.searchParams.set('ponto', ponto.codigo);
else destino.searchParams.set('onde-estou', '1'); // RN-07
registrarLeitura(ponto?.codigo ?? 'invalido'); // contador agregado, sem IP
return NextResponse.redirect(destino, 307);
}
9.3.4 Reporte de barreira com Server Action (funciona sem JavaScript)
// src/funcionalidades/feedback/acoes.ts
'use server';
export async function reportarBarreira(_: Estado, dados: FormData): Promise<Estado> {
const r = esquemaBarreira.safeParse(Object.fromEntries(dados));
if (!r.success) return { ok: false, erros: r.error.flatten().fieldErrors };
await repositorioBarreiras.criar(r.data);
return { ok: true, mensagem: 'Obrigado! A equipe vai verificar.' };
}
// src/funcionalidades/feedback/formulario-barreira.tsx
'use client';
export function FormularioBarreira() {
const [estado, acao, enviando] = useActionState(reportarBarreira, { ok: false });
return (
<form action={acao} aria-describedby="status-barreira">
{/* campos com <label>, erros ligados por aria-describedby */}
<button disabled={enviando}>Enviar</button>
<p id="status-barreira" role="status">{estado.mensagem}</p>
</form>
);
}
9.3.5 Idioma no Proxy (Next.js 16)
// src/proxy.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing'; // locales: ['pt-BR','en','es'], localePrefix: 'as-
needed'
export default createMiddleware(routing);
export const config = {
// não aplica o proxy em API, QR, Central, totem e arquivos estáticos
matcher: ['/((?!api|q|central|totem|_next|_vercel|.*\\..*).*)'],
};

---

## Página 50


## 9.4 Mapa de dependências

Diagrama 10: 9.4 Mapa de dependências

## 9.5 Resumo para a banca

1. React organiza a acessibilidade em componentes reutilizáveis. Um único BotaoAjuda ou
LerEmVoz correto garante o comportamento em todas as 14 telas.
2. Next.js entrega velocidade (páginas estáticas e RSC), robustez (formulários sem JavaScript,
useOffline) e organização (rotas, Route Handlers, Proxy de idioma) num único projeto: app do
visitante, API e Central.
3. Os recursos nativos do Next.js (anunciador de rotas, jsx-a11y, Metadata) já trabalham a favor da
acessibilidade. O projeto os usa de forma deliberada.

---

## Página 51


# 10. Modelo de dados, grafo e algoritmo de rotas


## 10.1 Modelo de dados (inspirado no IMDF)

O IMDF (Indoor Mapping Data Format, criado pela Apple e publicado pela OGC como Community Standard
em 2021) descreve mapas internos em GeoJSON com entidades como venue, level, unit, opening e
amenity. Adotamos um subconjunto simplificado e compatível, em JSON versionado, para poder
exportar para IMDF no futuro.

---

## Página 52

Diagrama 11: 10.1 Modelo de dados (inspirado no IMDF)
Exemplo real (conferido na Planta Mix):
{
"id": "loc-outback",
"slug": "outback-steakhouse",

---

## Página 53

"nome": "Outback Steakhouse",
"numero": "Loja 32",
"categoria": "alimentacao",
"pisoId": "terreo",
"areaM2": 499.33,
"entradaNoId": "T-P32",
"sinonimos": ["outback", "steakhouse", "restaurante", "carne"],
"acessibilidade": { "balcaoRebaixado": null, "cardapioBraille": null, "atendimentoLibras": null },
"sensorial": { "ruido": "medio" },
"textos": {
"pt-BR": { "descricao": "…", "simples": "Restaurante. Fica no 1º piso, perto da Camicado." }
},
"fonte": "Planta Mix nov/2026 (folha 1/2)"
}
null significa não informado (diferente de false). O app só afirma um recurso de acessibilidade
quando ele foi verificado.

## 10.2 Do PDF ao grafo: método de construção

O grafo da v1 foi gerado a partir da posição dos rótulos no PDF, ligando cada rótulo aos 3 vizinhos mais
próximos. Os testes mostraram 9 componentes desconexos, nenhum elevador e ligações que
atravessam paredes. Por isso, a v2 adota um processo semiautomático com validação:
1. Vetorizar a planta (folhas 1/2 e 2/2) em SVG simplificado: contorno, corredores e lojas como
polígonos (camada visual do mapa).
2. Extrair rótulos automaticamente (script Python da v1, aproveitado e melhorado) para obter o
catálogo: número da loja, área e marca.
3. Desenhar o grafo de circulação com o Editor de Grafo (ferramenta interna em /central/editor):
nós nos cruzamentos de corredores, portas, elevadores, escadas, rampas, entradas e pontos
QR, e arestas ao longo dos corredores, nunca atravessando lojas.
4. Escala: a planta está em 1:500. Calibração por uma medida conhecida (ex.: largura de um corredor
cotado) converte unidades do SVG em metros.
5. Ligar cada local à sua porta (entradaNoId) e cada equipamento às arestas verticais.
6. Validar automaticamente no CI (10.3) e validar em campo (visita técnica com a equipe de
operações).

## 10.3 Regras de validação (CI)

Regra Por quê
Todo LOCAL tem entradaNoId existente Toda loja é alcançável
O grafo de cada piso é conexo Sem “ilhas” como na v1
Para o perfil sem degraus, todo local é alcançável a partir Garantia de acessibilidade (RN-01)
de todas as entradas
Todo elevador tem nós nos dois pisos e equipamentoId Transição de piso válida

---

## Página 54

Regra Por quê
Arestas rampa com inclinacaoPct informada Rampas acima de 8,33% são proibidas para cadeira de rodas
(referência NBR 9050)
distanciaM > 0 e coerente com as coordenadas (±20%) Detecta erro de desenho
Todo PONTO_QR aponta para um nó existente; códigos QR nunca leva a lugar inválido
únicos
Textos obrigatórios nos 3 idiomas i18n completa (RNF-07)

## 10.4 Algoritmo de rotas

Algoritmo: Dijkstra com fila de prioridade (heap binário), O((V + E) log V). Com menos de 1.000
nós, o cálculo leva poucos milissegundos no celular. A* com heurística euclidiana é uma otimização
opcional.
Onde roda: no cliente (offline). O mesmo módulo roda no servidor para testes e validação.
Custo de uma aresta: custo = distanciaM × fator(tipo, perfil) + penalidades. Fator ∞
significa proibido.
Tipo de padrão sem_degraus mobilidade_reduzida visual sensorial
aresta (cadeira de rodas) (idoso, muleta, carrinho)
plano 1,0 1,0 1,0 1,0 (0,8 se 1,0 (×2 em
pisoTatil) zona ruidosa)
rampa ≤ 1,0 1,0 1,2 1,0 1,0
8,33%
rampa > 1,1 ∞ 2,0 1,1 1,1
8,33%
escada 1,1 ∞ ∞ 1,5 1,1
escada rolante 1,0 ∞ 3,0 (∞ com carrinho de bebê) 1,3 1,2
elevador +40 m +30 m +20 m +30 m +60 m
equivalentes (espaço
(espera) fechado)
equipamento ∞ ∞ ∞ ∞ ∞
inativo
Correção em relação à v1: na v1, escada e escada rolante tinham peso finito (5 e 1) para todos, e o
wireframe mostrava o perfil motor subindo por escada rolante. Na v2, essas arestas são proibidas
para os perfis com restrição. O CI testa essa regra (RN-01).
// src/dominio/rotas/dijkstra.ts (esboço)
export function calcularRota(g: Grafo, origem: string, destino: string, opcoes: OpcoesRota):
ResultadoRota {
const dist = new Map<string, number>([[origem, 0]]);
const anterior = new Map<string, Aresta>();
const fila = new HeapMinimo<string>((a, b) => (dist.get(a) ?? Infinity) - (dist.get(b) ?? Infinity));
fila.inserir(origem);

---

## Página 55

while (!fila.vazia()) {
const atual = fila.remover()!;
if (atual === destino) break;
for (const aresta of g.vizinhos(atual)) {
const custo = custoAresta(aresta, opcoes); // ∞ = proibida (perfil ou equipamento
inativo)
if (!Number.isFinite(custo)) continue;
const novo = dist.get(atual)! + custo;
if (novo < (dist.get(aresta.para) ?? Infinity)) {
dist.set(aresta.para, novo);
anterior.set(aresta.para, aresta);
fila.inserirOuAtualizar(aresta.para);
}
}
}
if (!anterior.has(destino) && origem !== destino) return { ok: false, motivo: 'sem_caminho' };
return montarResultado(reconstruir(anterior, origem, destino), opcoes);
}

## 10.5 Gerador de instruções (padrão Wayfindr / ITU-T F.921)

1. Agrupar arestas consecutivas quase retas (|Δângulo| < 30°) num único passo.
2. Classificar a mudança de direção pelo ângulo entre segmentos: < 30° “siga em frente”; 30°–150°
“vire à esquerda/direita”; > 150° “retorne”.
3. Anunciar com antecedência: “Em 10 metros, vire à direita”.
4. Usar marcos (lojas âncora, praças, pisos táteis) em vez de pontos cardeais: “A Riachuelo fica à sua
esquerda”.
5. Distâncias em metros arredondados (5 m) e, no perfil visual, também em passos aproximados.
6. Mudança de piso: “Pegue o elevador ELV-01 até o 2º pavimento. Ao sair, a Praça de Alimentação
fica à frente.”
7. Chegada: “Você chegou. A entrada do Outback está à sua direita.”
8. Modelos de frase em pt-BR, en e es, com linguagem simples e sem abreviações.
Exemplo (perfil sem degraus, Entrada Av. JK → Mundo Imersivo):
# Instrução
1 Siga em frente por 35 metros pela Alameda das Cores. A Camicado fica à sua direita.
2 Vire à esquerda na Praça de Eventos. Siga 20 metros.
3 Pegue o elevador ELV-01 até o 2º pavimento, Praça de Alimentação.
4 Ao sair do elevador, siga 15 metros. Você chegou ao Mundo Imersivo (Loja 215), à sua frente.
(Distâncias ilustrativas até a calibração do grafo.)

## 10.6 Busca

Normalização: minúsculas, sem acentos e sem pontuação (“C&A” → “ca”, “Pernambucanas” →
“pernambucanas”).
Sinônimos e categorias: banheiro → sanitário, lanche/comida → alimentação, cinema →
Cinemark, academia → Morofit, mercado → Super Big, brinquedo → Ri Happy/Zig Zag Play.
Tolerância a erro: distância de edição ≤ 1 para termos curtos e ≤ 2 para longos.

---

## Página 56

Ordenação: relevância textual → distância a partir do ponto atual → aberto agora.
Busca por número: “loja 32”, “âncora 02”, “Q 15” (quiosque).

## 10.7 Pontos QR/NFC (códigos curtos)

Tipo Formato Exemplos
Entrada / totem ENT-<via> ENT-JK, ENT-NS, ENT-LO
Loja LOJA-<número> / ANC-<número> LOJA-32, ANC-02
Mesa da praça de alimentação MESA-<nn> MESA-07
Estacionamento S<n>-P<pilar> S1-P12
Sanitário WC-<piso>-<n> WC-2-1
URL gravada no QR e na etiqueta NFC: https://<domínio>/q/<CÓDIGO>. O código curto também é
impresso (com Braille) para digitação manual em “Onde estou?”.

## 10.8 Banco de dados (Supabase / PostgreSQL)

-- supabase/migrations/0001_inicial.sql (esboço)
create type tipo_ajuda as enum
('orientacao','acompanhamento','comunicacao','saude','crianca_perdida','seguranca');
create type modo_comunic as enum ('texto','libras','voz','idioma','pictogramas');
create type status_ajuda as enum ('aberto','aceito','a_caminho','concluido','cancelado','trote');
create table pedidos_ajuda (
id uuid primary key default gen_random_uuid(),
criado_em timestamptz not null default now(),
tipo tipo_ajuda not null,
ponto_codigo text not null,
piso_id text not null,
modo_comunicacao modo_comunic not null,
idioma text not null check (idioma in ('pt-BR','en','es')),
observacao text check (char_length(observacao) <= 280),
status status_ajuda not null default 'aberto',
atendente_id uuid references auth.users(id),
previsao_min int,
token_hash text not null, -- hash do token de acompanhamento
aparelho_hash text not null, -- hash do UUID do aparelho (limite de envios)
consentimento_em timestamptz not null -- LGPD: consentimento para enviar o modo de comunicação
);
create table eventos_pedido (
id bigserial primary key,
pedido_id uuid references pedidos_ajuda(id) on delete cascade,
criado_em timestamptz not null default now(),
status status_ajuda not null,
autor text not null -- 'visitante' | 'equipe'
);
create table equipamentos (
id text primary key, -- ELV-01, ROL-01…
tipo text not null check (tipo in ('elevador','escada_rolante')),
status text not null default 'operando' check (status in ('operando','manutencao','fora')),
atualizado_em timestamptz not null default now(),
atualizado_por uuid references auth.users(id)

---

## Página 57

);
create table barreiras (
id uuid primary key default gen_random_uuid(),
criado_em timestamptz not null default now(),
tipo text not null,
ponto_codigo text,
descricao text check (char_length(descricao) <= 500),
status text not null default 'nova' check (status in ('nova','em_analise','resolvida','descartada'))
);
create table leituras_ponto_diarias (
codigo text not null,
dia date not null,
total int not null default 0,
primary key (codigo, dia)
);
alter table pedidos_ajuda enable row level security;
alter table equipamentos enable row level security;
alter table barreiras enable row level security;
-- políticas: somente usuários autenticados da equipe leem/atualizam;
-- o visitante nunca acessa as tabelas diretamente (só via Route Handlers no servidor).

## 10.9 Governança dos dados

Dado Dono Atualização Validação
Planta e grafo Operações do shopping + A cada mudança física (obras, CI (10.3) + visita técnica
equipe do projeto mudança de loja)
Catálogo de lojas e horários Operações / marketing Semanal ou quando houver Esquema zod + revisão
mudança
Cardápios Cada loja Pela loja (fase 2: portal do Data da última
lojista) atualização visível
Status de equipamentos Manutenção / segurança Em tempo real, na Central Registro de quem alterou
Textos em linguagem simples, Conteúdo + intérpretes A cada mudança de texto Revisão humana
traduções, Libras obrigatória (RNF-15)

---

## Página 58


# 11. Acessibilidade, conformidade legal, LGPD e

segurança

## 11.1 Meta de conformidade

WCAG 2.2, nível AA, em todas as telas, alinhada à ABNT NBR 17225:2025.
Critérios AAA selecionados: contraste aprimorado (1.4.6) no tema de alto contraste, tamanho de
alvo (2.5.5), sem limite de tempo (2.2.3), localização (2.4.8), leitura e pronúncia simples (3.1.5, via
linguagem simples) e Libras para conteúdo pré-gravado (1.2.6) nos vídeos institucionais.
Declaração de acessibilidade publicada no app (/acessibilidade): nível atingido, limitações
conhecidas, data da última avaliação e canal para reportar problemas.

## 11.2 Critérios WCAG 2.2 críticos e como o projeto atende

Critério Nível Como atendemos
1.1.1 Conteúdo não textual A alt obrigatório (lint); mapa com título + lista equivalente; pictogramas com
rótulo
1.2.2 / 1.2.4 Legendas A / AA Vídeos com legenda; conversa com legenda ao vivo
1.2.6 Língua de sinais (pré- AAA Vídeos institucionais com intérprete de Libras
gravado)
1.3.1 Informações e relações A HTML semântico (header, nav, main, listas, fieldset/legend)
1.3.4 Orientação AA Retrato e paisagem
1.4.1 Uso de cor A Ícone + texto em status (aberto/fechado, elevador operando/parado)
1.4.3 / 1.4.6 Contraste AA / Tokens validados: texto ≥ 4,5:1 (padrão) e ≥ 7:1 (alto contraste). Azul
AAA #0B4F8A sobre branco = 8,40:1; vermelho #B3261E = 6,54:1
1.4.4 / 1.4.10 Redimensionar / AA Escala de fonte até 200%; layout fluido a 320 px
reflow
1.4.11 Contraste não textual AA Bordas de botões, foco e linhas da rota ≥ 3:1
1.4.12 Espaçamento de texto AA Nenhum texto cortado com espaçamento ampliado
2.1.1 Teclado A Tudo operável por teclado e acionadores; mapa com botões
2.2.1 Ajuste de tempo A Sem limites; totem avisa antes de reiniciar e permite continuar
2.3.3 Animação por interação AAA Respeita prefers-reduced-motion; nada pisca
2.4.1 Pular blocos A Link “Pular para o conteúdo”
2.4.2 Título da página A Metadata API com título único (o anunciador de rotas do Next lê)
2.4.3 / 2.4.7 Ordem e foco visível A / AA Ordem lógica; anel de foco de 3 px com contraste ≥ 3:1
2.4.11 Foco não obscurecido AA Botão Ajuda fixo não cobre o elemento focado (scroll-padding)
2.5.7 Movimentos de arrastar AA Zoom/deslocamento do mapa também por botões
2.5.8 Tamanho do alvo AA Mínimo de 48 × 48 px (acima dos 24 px exigidos)

---

## Página 59

Critério Nível Como atendemos
3.1.1 / 3.1.2 Idioma da página e A / AA lang dinâmico por idioma; trechos traduzidos marcados com lang
das partes
3.2.3 / 3.2.6 Navegação AA / A Cabeçalho e botão Ajuda iguais e no mesmo lugar
consistente / ajuda consistente
3.3.1 / 3.3.3 Erros A / AA Mensagens com como corrigir, anunciadas e ligadas ao campo
3.3.7 Entrada redundante A Local do pedido preenchido automaticamente
3.3.8 Autenticação acessível AA Visitante não faz login; equipe usa senha com gerenciador ou link mágico,
sem CAPTCHA
4.1.2 Nome, função, valor A Radix/shadcn + revisão de ARIA; testes com axe
4.1.3 Mensagens de status AA Anunciador aria-live único (rota, pedido, erros)

## 11.3 Estratégias por público

Público Estratégia
Surdos (Libras) Português → Libras: VLibras (texto dinâmico) + vídeos com intérpretes (conteúdo fixo). Libras →
português: intérprete humano por vídeo, digitação e pictogramas. Avisos sempre visuais e com
vibração. Não prometemos tradução automática de Libras para português
Cegos e baixa visão Leitores de tela nativos; NFC + Braille nas placas; lista textual do mapa; instruções Wayfindr; voz
própria do app opcional (não substitui o leitor de tela); alto contraste e fonte ampliada
Deficiência motora Perfil sem degraus, status de elevadores, mesas reservadas, alvos grandes, sem gestos
complexos, totem na faixa de alcance
Autismo / deficiência Linguagem simples (W3C COGA), pictogramas, previsibilidade (“o que vai acontecer”), informação
intelectual sensorial, nada de surpresas sonoras, modo de baixa estimulação (tema calmo, sem animação)
Deficiências ocultas Equipe treinada para reconhecer o cordão de girassol; pedido de ajuda sem exigir explicação
(Lei 14.624/2023)
Estrangeiros Interface e instruções em EN/ES; frases prontas; tradução na conversa
Pessoas idosas Sem cadastro, fonte grande, voz, totem, ajuda humana

## 11.4 Marco legal aplicável

Norma O que exige / orienta Atendimento no projeto
Lei 13.146/2015 (LBI) Acessibilidade na informação e comunicação; sites Meta WCAG 2.2 AA + declaração de
de empresas acessíveis acessibilidade
Lei 10.436/2002 + Decreto Libras como meio legal de comunicação VLibras + intérpretes + vídeos
5.626/2005
Lei 14.624/2023 Cordão de girassol (deficiências ocultas) Treinamento + linguagem do app
Lei 12.764/2012 + Lei Direitos da pessoa com TEA; CIPTEA Recursos sensoriais e prancha
13.977/2020
Lei 10.048/2000 Atendimento prioritário Priorização na Central para saúde e
criança perdida

---

## Página 60

Norma O que exige / orienta Atendimento no projeto
Lei TO 3.964/2022 (a 3% das mesas da praça de alimentação para Camada “mesas reservadas” no
confirmar) PcD/mobilidade reduzida mapa
ABNT NBR 17225:2025 Acessibilidade em conteúdo e aplicações web Checklist de testes
ABNT NBR 9050 / NBR Acessibilidade em edificações / sinalização tátil Placas QR/NFC/Braille e totem
16537
LGPD (Lei 13.709/2018) Proteção de dados; dados de saúde são sensíveis Seção 11.5

## 11.5 LGPD: privacidade por concepção

Princípio: dados sobre deficiência são dados pessoais sensíveis (art. 5º, II), e seu tratamento exige
hipóteses específicas (art. 11). Por isso o Guia Dourado não precisa saber quem a pessoa é nem qual é
a sua deficiência para funcionar.
Dado Onde fica Finalidade Base legal Retenção
Preferências (tema, voz, Só no aparelho Personalizar a Não há tratamento pelo controlador Até o usuário
perfil de rota…) interface (não sai do aparelho) limpar
Idioma Cookie Exibir no Legítimo interesse (essencial ao 1 ano
NEXT_LOCALE idioma serviço)
escolhido
Ponto atual (QR) sessionStorage Contexto de — (local) Sessão
localização
Pedido de ajuda: tipo, Supabase (São Prestar o Consentimento específico e 30 dias →
local, modo de Paulo) atendimento destacado (art. 11, I); em saúde e anonimização
comunicação, idioma, solicitado risco à vida, proteção da vida e da (RN-05)
observação opcional incolumidade física (art. 11, II, “e”)
Hash do token do Supabase Limitar abuso Legítimo interesse (segurança) 30 dias
aparelho (trote)
Áudio da conversa Não é Legenda ao — —
armazenado vivo
Barreira reportada Supabase Corrigir Legítimo interesse; orientação para Até resolver + 90
(texto, foto opcional) barreiras não fotografar pessoas dias
Contadores de leitura de Supabase Medir uso dos Legítimo interesse (sem dado Indeterminado
QR (agregado por dia) pontos pessoal) (agregado)
Textos de consentimento (linguagem simples): - Ao pedir ajuda: “Vamos enviar à equipe do shopping
onde você está e como prefere se comunicar (por exemplo, Libras). Isso serve só para te atender e é
apagado em 30 dias. [Enviar pedido] [Voltar]” - Na conversa: “O texto falado é transformado em legenda
pelo seu navegador e não é gravado. No Chrome, o reconhecimento de fala pode usar servidores do
Google.”
Outras medidas: aviso de privacidade em /privacidade; contato do encarregado (DPO) do shopping;
sem cookies de rastreamento; analytics sem cookies e agregado; Relatório de Impacto (RIPD)
simplificado antes do piloto; cuidado com dados de crianças (art. 14): o tipo “criança perdida” não coleta
nome nem foto da criança no app, e a descrição é feita pessoalmente à equipe.

---

## Página 61


## 11.6 Ameaças e mitigação (STRIDE simplificado)

Ameaça Exemplo Mitigação
Falsificação QR falso colado sobre a Domínio e código curto impressos; placas com lacre; inspeção
placa leva a site de golpe semanal; NFC dentro da placa; campanha “confira o endereço”
Adulteração Alterar status de elevador Apenas equipe autenticada (RLS); registro de autoria
Repúdio Atendente nega ter aceitado Tabela eventos_pedido imutável
um pedido
Divulgação de Vazamento de pedidos Visitante não acessa o banco; dados mínimos; anonimização em 30
informação dias; chave de serviço só no servidor
Negação de Robô cria pedidos falsos Limite por aparelho/IP, confirmação em 2 etapas, marcação de trote,
serviço alertas de volume
Elevação de Visitante acessa /central Auth + papéis; Proxy não expõe rotas internas; testes de autorização
privilégio
XSS Script em descrição de React escapa por padrão; CSP; zod limita tamanho e formato; sem
barreira dangerouslySetInnerHTML com dados externos

---

## Página 62


# 12. Qualidade e estratégia de testes


## 12.1 Pirâmide de testes

Nível Ferramenta O que cobre Meta
Unitário (domínio) Vitest Dijkstra, pesos por perfil, gerador de Cobertura ≥ 90% em
instruções, busca, validação dos dados src/dominio
Componentes Vitest + Testing Library + Botões, formulários, anunciador, lista do 0 violações axe por
jest-axe mapa, prancha componente
Contrato de dados Vitest + zod dados/*.json contra os esquemas + 100% no CI
regras do 10.3 (conectividade, perfil sem
degraus)
End-to-end Playwright + @axe- Jornadas J1–J6 em Chrome (Android Fluxos críticos
core/playwright emulado) e WebKit (iPhone emulado), verdes
nos 3 temas
Desempenho e boas Lighthouse CI Desempenho ≥ 90, Acessibilidade = Bloqueia PR abaixo
práticas 100, PWA ok da meta
Manual com tecnologia TalkBack, VoiceOver, NVDA, O que a automação não pega (cerca de Checklist 12.4 a
assistiva teclado, zoom 200%/400% 60% dos problemas reais) cada versão
Usabilidade com Testes moderados + SUS Tarefas reais no shopping SUS ≥ 80; sucesso ≥
pessoas com 85%
deficiência

## 12.2 Casos de teste essenciais

ID Caso Tipo
CT- QR ENT-JK abre T00 com “Você está em: Entrada Av. JK” e título correto E2E
01
CT- Código inexistente abre “Onde estou?” sem erro (RN-07) E2E
02
CT- Perfil sem degraus: rota entre pisos sempre usa elevador; com ELV-01 inativo, usa outro ou Unitário + E2E
03 informa “sem rota” + acompanhamento
CT- Instruções: curva de 90° gera “vire à direita”; trechos retos são agrupados Unitário
04
CT- Busca “ca” encontra C&A; “banheiro” encontra sanitários; “loja 32” encontra Outback Unitário
05
CT- Mapa em modo lista: todos os locais navegáveis por teclado, com nome e distância E2E + axe
06
CT- Alto contraste aplicado antes da primeira pintura (sem flash) após recarregar E2E (screenshot)
07
CT- Pedido de ajuda: criado → aparece na Central em ≤ 2 s → aceite reflete no visitante em ≤ 5 s E2E (2
08 navegadores)

---

## Página 63

ID Caso Tipo
CT- Limite: 2º pedido aberto no mesmo aparelho é recusado com mensagem clara (RN-03) Integração
09
CT- Formulário de barreira funciona com JavaScript desativado E2E
10
CT- Offline: com rede cortada, mapa, busca, rota e prancha funcionam; pedido de ajuda mostra rota E2E (modo offline)
11 até o SAC
CT- Conversa: com reconhecimento de fala indisponível, botão “Falar” some e “Digitar” fica em Componente
12 destaque
CT- lang correto em /en e /es; trechos traduzidos marcados com lang E2E
13
CT- Zoom de 200% e largura de 320 px: sem rolagem horizontal e sem texto cortado E2E (viewport)
14

## 12.3 Pipeline de CI (GitHub Actions)

Diagrama 12: 12.3 Pipeline de CI (GitHub Actions)

## 12.4 Checklist manual de acessibilidade (a cada versão)

Navegar por todas as telas só com teclado (Tab, Shift+Tab, Enter, Espaço, Esc); foco sempre
visível e nunca escondido pelo botão Ajuda.
TalkBack (Android/Chrome) e VoiceOver (iOS/Safari): títulos anunciados, botões com nome, ordem
lógica, anúncios de rota e de pedido sem duplicar.
Zoom 200% e 400%, fonte do sistema no máximo, largura de 320 px.
Alto contraste e tema escuro: todos os textos e ícones legíveis; medir com o analisador de
contraste.
Movimento reduzido ativado no sistema: nenhuma animação relevante.
Simulação de daltonismo (protanopia, deuteranopia, tritanopia): nenhuma informação só por cor.
Linguagem simples: textos revisados (frases curtas, sem jargão).
Libras: VLibras ativa e traduz a tela; vídeos com legenda.
Offline: modo avião após a 1ª visita.

---

## Página 64


## 12.5 Testes com pessoas (coprojeto)

Etapa Quem Como
Antes do ≥ 5 pessoas: cega, baixa visão, surda (Libras), cadeirante, Teste moderado no shopping, com
piloto autista/neurodivergente, idosa, turista tarefas das jornadas J1–J5;
intérprete de Libras presente
Parcerias Associação dos Surdos de Palmas (ASP) e Associação dos Convite via conselho; remuneração
sugeridas Deficientes Visuais do Estado do Tocantins, ambas no Conselho ou contrapartida aos participantes
Municipal dos Direitos da Pessoa com Deficiência de Palmas
Métricas Sucesso da tarefa, tempo, erros, pedidos de ajuda, SUS Relatório por jornada
Ética Termo de consentimento acessível (Libras, áudio, texto simples) Sem gravação de rosto sem
autorização

## 12.6 Definição de Pronto (DoD)

Uma história só está pronta quando: 1. Atende aos critérios de aceite (Cap. 5) e tem testes automatizados.
2. Passa no lint, typecheck, testes e axe sem violações. 3. Foi testada com teclado e com um leitor de
tela. 4. Tem textos nos 3 idiomas e versão em linguagem simples quando aplicável. 5. Funciona offline, se
for uma funcionalidade crítica. 6. Foi revisada por outra pessoa da equipe (PR aprovado).

---

## Página 65


# 13. Plano do MVP (24 h), riscos e roadmap


## 13.1 Escopo do MVP (entrega final: 14/11, 10h)

Prioridade Itens
Must (demo T00 Início com contexto do QR · T01 Preferências (tema, fonte, voz, “evitar escadas”) · T02 Mapa dos 2
obrigatória) pisos + lista · T03 Buscar · T04 Detalhe com “Ouvir” e VLibras · T05 Rota com Dijkstra e elevador · T06
Conversar (legenda, digitar e falar, frases prontas, tradução) · T07 Prancha · T08/T09 Pedir e acompanhar
ajuda · T12 Central em tempo real (fila + status de elevador) · PT/EN/ES · Declaração de acessibilidade
Should T10 Avaliar/reportar · T11 Serviços acessíveis · PWA offline · camada de mesas reservadas e camada
sensorial
Could T13 Totem · editor visual de grafo · “Onde estacionei?”
Won’t Posicionamento indoor contínuo, app nativo, contas de visitante, reconhecimento de Libras por IA,
(agora) integração com estacionamento/CFTV

## 13.2 Divisão da equipe (para 4 pessoas; adaptar se forem 3 ou 5)

Papel Responsabilidades Entregáveis
A: Front-end e Layout, tokens/temas, componentes a11y (Anunciador, Casca do app acessível + telas de
acessibilidade (líder de LerEmVoz, BotaoAjuda), T00, T01, T03, T04, i18n conteúdo
UI)
B: Mapa e rotas SVG simplificado dos 2 pisos, grafo (editor ou JSON à Rota Entrada JK → Praça de
mão), Dijkstra, instruções, T02 e T05 Alimentação via elevador
funcionando
C: Comunicação Hooks de voz, T06 Conversar (tela dividida, frases, Conversa ao vivo e prancha
tradução), T07 Prancha, VLibras
D: Ajuda, Central e Supabase (SQL, RLS), /api/ajuda, T08, T09, T12 Pedido de ajuda ponta a ponta +
deploy (Realtime), status de equipamentos, deploy Vercel, QR de URL pública
demo
Com 3 pessoas, C e A se dividem a parte de comunicação. Com 5, a 5ª pessoa cuida de conteúdo (textos
em linguagem simples, traduções, catálogo, roteiro da demo) e testes.

## 13.3 Cronograma (sexta 13/11 → sábado 14/11)

Horário Marco Responsáveis
Sex ✅ 1ª entrega (este planejamento) Todos
12:00
12:00– Almoço + leitura deste documento + divisão final das tarefas Todos
13:00
13:00– Fundação: projeto Next.js 16 (já criado), layout, temas, i18n, componentes a11y; A, D, C; B inicia o SVG
15:00 Supabase criado e migração aplicada; dados mínimos (locais âncora + praça de
alimentação)

---

## Página 66

Horário Marco Responsáveis
15:00– Funcionalidades núcleo: busca + detalhe; grafo + rota; conversa + prancha; pedido A, B, C, D (em
19:00 de ajuda + Central paralelo)
19:00 🔁 Checkpoint 1: integração na main, deploy de preview, primeira passada de axe Todos
19:00– Mapa interativo + lista, instruções em voz, tradução, Realtime, status de elevador na B, C, D
23:00 rota
23:00 🔁 Checkpoint 2: fluxo da demo completo (QR → rota → conversa → ajuda → Todos
Central)
23:00– Offline (PWA), T10/T11, textos EN/ES, linguagem simples, correções de Revezamento (metade
03:00 acessibilidade descansa)
03:00– Descanso em turnos; quem estiver acordado: testes manuais (teclado, TalkBack) e Revezamento
07:00 correções
07:00– Congelamento de funcionalidades. Só correções. Lighthouse e axe. Imprimir QR de Todos
08:30 demo
08:30– Ensaios do pitch e da demo (3×), plano B (vídeo gravado da demo) Todos
09:30
Sáb ✅ Entrega final do MVP Todos
10:00
Regra de corte: se às 23h algum “Must” não estiver funcionando, ele vira simulado na demo (ex.:
tradução com frases prontas apenas) e o tempo vai para polir o fluxo principal. Melhor 5 telas
impecáveis e acessíveis do que 14 quebradas.

## 13.4 Backlog inicial (estimativas para a maratona)

Épico Tarefas Estimativa
Fundação Tokens CSS e temas; fonte; layout [locale]; cabeçalho; botão Ajuda; anunciador; next- 3 h
intl; manifest
Dados pisos, locais (âncoras + praça de alimentação + sanitários + elevadores), pontos, 2 h
equipamentos, frases-prontas, prancha
Mapa SVG simplificado (2 pisos) + marcadores + zoom por botões + lista 4 h
Rotas Grafo (~60–100 nós), Dijkstra, pesos, instruções, T05 com voz/vibração 5 h
Busca/local Índice com sinônimos, T03, T04, ouvir, VLibras 3 h
Conversa/prancha Tela dividida, STT/TTS, frases, tradução (porta + 1 adaptador), prancha com 24 5 h
pictogramas
Ajuda/Central SQL + RLS, /api/ajuda, T08, T09 (polling), T12 (Realtime, status de equipamentos), 5 h
login
Qualidade Playwright + axe nas rotas principais; Lighthouse; testes do Dijkstra 2 h
Demo QR impressos, roteiro, vídeo de backup 1 h

---

## Página 67


## 13.5 Riscos

Risco Prob. Impacto Mitigação
Desenhar o grafo/mapa leva mais Alta Alto Começar pelo trajeto da demo (Entrada JK → elevador →
tempo que o previsto Praça de Alimentação) e ampliar depois; o mapa pode ser um
SVG simplificado
Reconhecimento de fala falha no Média Alto Frases prontas e digitação; demo com fone; vídeo de backup
local da apresentação (rede/ruído)
Posição real dos elevadores incerta Alta Médio Marcar como “a validar”; usar posição provável na demo e
na planta declarar a premissa
Supabase Realtime não configurado Média Alto Plano B: polling a cada 3 s na Central (mesma experiência na
a tempo demo)
VLibras indisponível (serviço do Média Médio Vídeo curto em Libras gravado para a demo; mensagem de
governo fora do ar) indisponibilidade
Cansaço da equipe e conflitos de Alta Médio Turnos de descanso; PRs pequenos; dono por pasta (13.2);
merge checkpoints
Escopo grande demais Alta Alto MoSCoW rígido + regra de corte às 23h
Dados de lojas desatualizados Média Baixo Usar só o que foi conferido na Planta Mix; marcar o restante
como ilustrativo

## 13.6 Roadmap pós-hackathon

Fase Prazo Entregas
Piloto 30 dias Grafo completo validado em visita técnica; 20 placas QR+NFC+Braille (entradas, elevadores,
controlado SAC, praça de alimentação); Central no SAC; treinamento da equipe; testes com ASP e
associação de deficientes visuais
Piloto aberto 60 dias CMS na Central (lojas, cardápios, avisos); vídeos em Libras; parceria com central de
intérpretes; totem na entrada principal; camada sensorial validada; hora silenciosa divulgada
Consolidação 90 dias Indicadores (Cap. 1); declaração de acessibilidade auditada; inscrição em prêmios (Abrasce,
Líderes de Acessibilidade); subsolos no mapa (“do carro ao destino”)
Escala 6–12 Posicionamento contínuo (beacons ou câmera); NaviLens; exportação IMDF; replicação para
meses outros shoppings da administradora (multi-tenant); certificação sensorial (KultureCity/IBCCES)
de áreas do shopping

---

## Página 68


# 14. Operação no shopping

A tecnologia só funciona se o shopping operar a solução: placas bem posicionadas, equipe preparada e
conteúdo atualizado.

## 14.1 Pontos de acesso (placas QR + NFC + Braille)

Especificação da placa:
Elemento Especificação
QR Code Preto sobre branco, com margem livre (quiet zone), correção de erro nível Q, lado mínimo de 10 cm para
leitura a cerca de 1 m (regra prática: distância ≈ 10 × lado)
NFC Etiqueta NTAG213/215 com registro NDEF da URL https://<domínio>/q/<CÓDIGO>, no centro de um
símbolo tátil (“encoste aqui”)
Texto “Guia Dourado: acessibilidade e comunicação” + código curto (ex.: MESA-07) + domínio, em fonte grande e
alto contraste
Braille e Código curto e “Guia Dourado” em Braille; moldura em relevo para localização pelo tato
relevo
Altura e Faixa de alcance confortável para pessoa em cadeira de rodas e leitura tátil, seguindo a ABNT NBR 9050;
posição perto do piso tátil quando houver
Segurança Placa única (não adesivo solto), lacre, inspeção semanal contra QR falso colado por cima
Libras Ícone de Libras + “Atendimento em Libras disponível”
Plano inicial de 20 pontos (piloto):
Local Qtde. Códigos
Entradas Av. JK, Av. NS-05 e Av. LO 2A 3 ENT-JK, ENT-NS, ENT-LO
Saídas dos elevadores (térreo e 2º pavimento) 4 ELV-01-T, ELV-01-2…
SAC / balcão de informações 1 SAC
Praças de eventos 3 PE-CENTRAL, PE-CA, PE-RENNER
Praça de alimentação (mesas reservadas e totens) 5 MESA-01…
Subsolos (perto dos elevadores e das vagas PNE/neurodiverso) 2 S1-ELV, S2-ELV
Sanitários PNE 2 WC-T-1, WC-2-1

---

## Página 69


## 14.2 Fluxo de trabalho da Central

Diagrama 13: 14.2 Fluxo de trabalho da Central

---

## Página 70

Quem atende: SAC (orientação, comunicação, acompanhamento), brigada (saúde), segurança (criança
perdida, segurança). A Central direciona por tipo e mostra a forma de comunicação antes de a pessoa sair
para o atendimento.

## 14.3 Roteiros de atendimento por forma de comunicação

Forma Como a equipe deve agir
Libras Abrir T06 no celular do SAC (ou no da pessoa); usar texto em letras grandes; se for complexo, chamar
intérprete por vídeo; olhar para a pessoa, não para o celular
Texto Usar T06 em modo “digitar”; frases curtas
Voz / pessoa cega Apresentar-se pelo nome e função; oferecer o braço (não puxar); descrever o caminho com
referências; avisar ao sair
Idioma (EN/ES) T06 com o idioma da pessoa; frases prontas
Pictogramas / Falar com calma, frases curtas, sem toque não solicitado; oferecer área tranquila; mostrar a prancha
autismo (T07)
Cordão de Perguntar “Como posso ajudar?” sem pedir explicação sobre a deficiência
girassol

## 14.4 Treinamento da equipe (antes do piloto)

Módulo Carga Conteúdo
Atendimento inclusivo 2 h Terminologia correta, deficiências ocultas, cordão de girassol, atendimento
prioritário
Libras básica 4 h Saudações, números, direções, “aguarde”, “siga-me” (com instrutor surdo)
Uso da Central e do Guia 1 h Fluxo de pedidos, status de equipamentos, barreiras, modo conversa
Dourado
Simulações 1 h Jornadas J1–J6 com pessoas com deficiência convidadas

## 14.5 Governança de conteúdo

Conteúdo Responsável Frequência
Lojas, horários, avisos Marketing / operações Semanal e sob demanda
Status de elevadores e escadas rolantes Manutenção / segurança Em tempo real
Barreiras reportadas Operações Triagem diária; meta de solução ≤ 7 dias
Linguagem simples e traduções Conteúdo, com revisão humana A cada alteração
Vídeos em Libras Intérpretes parceiros Trimestral

---

## Página 71


## 14.6 Comunicação e lançamento

Campanha “Capim Dourado para Todos” nas entradas, nas redes e nas mesas da praça de
alimentação.
Datas âncora: Abril Azul (autismo), Setembro Verde (inclusão da pessoa com deficiência, 21/09) e
Setembro Azul (comunidade surda).
Hora silenciosa mensal divulgada no app (T00 e T11).

## 14.7 Indicadores operacionais (painel da Central)

Pedidos por tipo e por forma de comunicação · tempo de aceite e de atendimento · pedidos escalonados ·
trotes · leituras por ponto QR/NFC · rotas concluídas (“cheguei”) · barreiras abertas e resolvidas ·
equipamentos fora de serviço (horas/mês).

---

## Página 72


# Apêndice A. Wireframes das telas (baixa fidelidade)

Esboços de baixa fidelidade das telas do visitante (T00–T11, T13) e da Central da equipe (T12). Versão
navegável: wireframes/index.html no repositório. Dados de lojas conferidos na Planta Mix; cardápios
ilustrativos.
T00 · Início T01 · Preferências

---

## Página 73

T02 · Mapa por piso T03 · Buscar

---

## Página 74

T04 · Detalhe do local T05 · Rota passo a passo

---

## Página 75

T06 · Conversar T07 · Prancha de comunicação

---

## Página 76

T08 · Pedir ajuda T09 · Acompanhar pedido

---

## Página 77

T10 · Avaliar / reportar barreira T11 · Serviços acessíveis

---

## Página 78

T13 · Modo totem
T12 · Central da equipe (uso interno)
Wireframe da tela T12: Central da equipe

---

## Página 79


# Apêndice B. Registros de decisão de arquitetura

(ADRs)
Cada decisão relevante fica registrada num arquivo curto, com contexto, decisão, alternativas e
consequências. Uma ADR aceita só muda por outra ADR que a substitua.
ADR Decisão Status
0001 Plataforma web/PWA com Next.js 16 (App Router), sem app nativo Aceita
0002 Monólito modular por funcionalidades, domínio puro, portas e adaptadores Aceita
0003 Rotas calculadas no cliente (Dijkstra) e localização por âncoras QR/NFC Aceita
0004 Modelo de dados inspirado no IMDF; grafo desenhado com editor e validado no CI Aceita
0005 Pontos de acesso com QR + NFC + Braille e códigos curtos (/q/CODIGO) Aceita
0006 Libras com VLibras + vídeos + intérprete humano; sem reconhecimento automático de Libras Aceita
0007 Preferências só no aparelho, sem conta e sem dado sensível no servidor Aceita
0008 Supabase (Postgres, Realtime, Auth) para pedidos de ajuda e Central Aceita
0009 Voz e tradução atrás de portas, com adaptadores em cascata Aceita
0010 UI com shadcn/ui (Radix) + Tailwind 4, tokens de tema e Atkinson Hyperlegible Aceita
0011 IA generativa só como apoio, com revisão humana; nunca em rotas ou emergência Aceita

### ADR-0001: Plataforma web/PWA com Next.js 16 (App Router)

Status: Aceita · Data: 2026-11-13
Contexto
A tecnologia sorteada é React + Next.js. O visitante chega por QR/NFC e não deve precisar instalar nada. O
prazo do MVP é de 24 h.
Decisão
Aplicação web responsiva/PWA com Next.js 16.4 (App Router) e React 19.3, hospedada na Vercel
(gru1). A mesma base atende o visitante, o totem (modo quiosque) e a Central da equipe.
Alternativas consideradas
App nativo (React Native/Flutter): barreira de instalação, lojas de apps, duas plataformas.
SPA pura (Vite): sem renderização no servidor, primeira pintura vazia e pior desempenho no 4G.
Site estático sem framework: sem API, sem Central em tempo real.

---

## Página 80

Consequências
(+) Acesso imediato pelo QR; páginas estáticas na CDN; uma só base de código.
(+) Recursos nativos de acessibilidade do Next (anunciador de rotas, jsx-a11y).
(−) Algumas Web APIs variam por navegador (vibração no iOS, Web NFC); exigem alternativas (Cap.
8.3).

### ADR-0002: Monólito modular por funcionalidades, com domínio puro e

portas/adaptadores
Status: Aceita · Data: 2026-11-13
Contexto
Equipe pequena, prazo curto e necessidade de testar regras críticas (rotas sem degraus) sem depender de
navegador ou rede.
Decisão
Um repositório e um deploy (monólito modular).
src/dominio/: TypeScript puro (tipos, esquemas, grafo, rotas, instruções, busca), sem React,
Next.js ou I/O.
src/funcionalidades/<nome>/: componentes, hooks e ações de cada funcionalidade.
src/adaptadores/: implementações das portas (voz, tradução, Libras, tempo real,
armazenamento).
Regra de lint no-restricted-imports impede que o domínio importe camadas externas.
Alternativas consideradas
Microsserviços: complexidade operacional injustificável para o MVP.
Organização por tipo técnico (components/, hooks/, services/): espalha uma funcionalidade por
várias pastas e gera mais conflitos de merge.
Consequências
(+) Domínio 100% testável com Vitest; mesmo código no cliente (offline) e no servidor.
(+) Cada pessoa da equipe “é dona” de pastas distintas.
(−) Exige disciplina nas fronteiras (garantida por lint e revisão).

### ADR-0003: Rotas calculadas no cliente e localização por âncoras QR/NFC

Status: Aceita · Data: 2026-11-13

---

## Página 81

Contexto
A v1 previa o cálculo de rotas no servidor e uma “geolocalização” para aproximar o piso. O GPS não
funciona bem em ambientes internos e não informa o piso. Posicionamento indoor preciso exige beacons
ou visão computacional.
Decisão
Dijkstra no cliente, com o grafo em cache (poucos KB). O mesmo módulo roda no servidor para
testes.
Localização por âncoras: o ponto escaneado (QR/NFC) ou escolhido em “Onde estou?” é a origem.
Durante a rota, o usuário avança os passos manualmente ou pelo leitor de tela.
Status de equipamentos buscado na rede com timeout de 2 s; offline, usa o último conhecido.
Alternativas consideradas
Rota no servidor: não funciona offline e adiciona latência.
Beacons BLE (padrão Wayfindr): melhor precisão, mas exige instalação e manutenção. Fica no
roadmap.
Geolocation API: imprecisa em ambiente interno e sem informação de piso.
Consequências
(+) Rotas offline e instantâneas; custo zero de infraestrutura.
(−) Sem “ponto azul” contínuo; mitigado por instruções com marcos e placas em pontos de decisão.

### ADR-0004: Modelo inspirado no IMDF; grafo desenhado com editor e

validado no CI
Status: Aceita · Data: 2026-11-13
Contexto
O grafo da v1, gerado pela proximidade dos rótulos do PDF, ficou com 9 componentes desconexos, sem
elevadores e com ligações atravessando paredes. As marcas âncora não estavam associadas às lojas.
Decisão
Dados em JSON versionado (dados/) com entidades piso, local, nó, aresta, equipamento e ponto,
compatíveis com conceitos do IMDF (OGC).
Rótulos e áreas extraídos automaticamente do PDF (script da v1, aproveitado) para o catálogo.
Grafo de circulação desenhado sobre a planta com um editor interno (nós em cruzamentos, portas
e circulação vertical).
Validação no CI: conectividade, alcance para o perfil sem degraus, elevadores nos dois pisos e
códigos de ponto válidos.

---

## Página 82

Alternativas consideradas
Grafo 100% automático: mostrou-se não confiável.
Plataforma comercial de mapas internos: custo e dependência de terceiros para o MVP.
Consequências
(+) Rotas confiáveis e auditáveis; caminho aberto para exportar IMDF.
(−) Exige algumas horas de desenho e uma visita técnica para validar elevadores e rampas.

### ADR-0005: Pontos de acesso com QR + NFC + Braille e códigos curtos

Status: Aceita · Data: 2026-11-13
Contexto
QR Codes comuns são difíceis de localizar e enquadrar para pessoas cegas (lição da NaviLens). A v1
colocava parâmetros na URL (?piso=&loja=), o que obriga a reimprimir placas quando algo muda.
Decisão
Cada ponto tem um código curto estável (ENT-JK, MESA-07) e URL
https://<domínio>/q/<CÓDIGO>.
O Route Handler /q/[codigo] resolve o código pelos dados atuais e redireciona com o idioma
certo. Mudar o local de um código não exige reimpressão.
Placa com QR grande + etiqueta NFC + Braille/relevo + código impresso.
Alternativas consideradas
Só QR com parâmetros: frágil e inacessível para pessoas cegas.
NaviLens: excelente, porém proprietário. Fica como integração futura.
Consequências
(+) Acesso por tato (NFC), visão (QR) e digitação (código curto).
(+) Métrica de uso por ponto (contador agregado).
(−) Custo de produção das placas; risco de QR falso colado por cima, mitigado por lacre e inspeção.

### ADR-0006: Libras com VLibras, vídeos e intérprete humano

Status: Aceita · Data: 2026-11-13
Contexto
A v1 previa “tradução simultânea Libras ↔ fala” por API. A tradução de português para Libras por avatar
existe (VLibras, Hand Talk), mas o reconhecimento automático de Libras para português ainda não é
confiável para atendimento.

---

## Página 83

Decisão
Português → Libras: widget VLibras (gratuito, código aberto, do governo federal), carregado sob
demanda.
Conteúdo fixo (boas-vindas, como pedir ajuda): vídeos curtos com intérpretes, com legenda.
Libras → português: intérprete humano por videochamada (parceria com central de
intermediação), além de digitação e pictogramas.
Alternativas consideradas
Hand Talk (plugin pago): boa qualidade, mas com custo. Alternativa futura.
Reconhecimento de Libras por visão computacional: imaturo para uso em atendimento.
Consequências
(+) Solução honesta, legal (Lei 10.436/2002) e alinhada à comunidade surda.
(−) VLibras depende de internet e do serviço do governo; intérprete humano tem custo recorrente.

### ADR-0007: Preferências só no aparelho, sem conta

Status: Aceita · Data: 2026-11-13
Contexto
Saber que alguém usa cadeira de rodas ou leitor de tela é dado sensível (LGPD, art. 5º, II). A v1 enviava o
“perfil do visitante” automaticamente à central.
Decisão
Preferências funcionais (“o que facilita para você?”) salvas em localStorage e aplicadas antes da
pintura por script inline.
Sem cadastro e sem login para visitantes.
Ao pedir ajuda, só forma de comunicação, tipo e local são enviados, com consentimento explícito,
e anonimizados em 30 dias.
Alternativas consideradas
Conta de usuário: barreira de uso e risco de dados.
Cookie com perfil: seria enviado ao servidor em cada requisição.
Consequências
(+) Privacidade por concepção; menos responsabilidade legal para o shopping.
(−) Preferências não sincronizam entre aparelhos (aceitável).

### ADR-0008: Supabase para pedidos de ajuda e Central

Status: Aceita · Data: 2026-11-13

---

## Página 84

Contexto
A Central precisa receber pedidos em tempo real, a equipe precisa de login e o MVP tem 24 h e orçamento
zero.
Decisão
Supabase (PostgreSQL padrão + Realtime + Auth), região São Paulo.
O visitante nunca acessa o banco diretamente: tudo passa por Route Handlers com chave de
serviço no servidor.
A Central (autenticada) assina mudanças via Realtime; o visitante consulta o status por polling (5 s),
que é simples e robusto.
RLS habilitado em todas as tabelas.
Alternativas consideradas
Firebase: NoSQL e mais aprisionamento.
Postgres próprio + WebSocket: mais tempo de infraestrutura.
Somente polling na Central: plano B se o Realtime atrasar.
Consequências
(+) Tempo real e autenticação prontos; SQL padrão, sem aprisionamento.
(−) Dependência de serviço externo; o plano gratuito pausa por inatividade (usar plano pago no
piloto).

### ADR-0009: Voz e tradução atrás de portas, com adaptadores em cascata

Status: Aceita · Data: 2026-11-13
Contexto
O suporte a Web Speech e à tradução varia por navegador e aparelho. Serviços em nuvem custam dinheiro
e exigem rede.
Decisão
Portas ProvedorFala, ProvedorEscuta e ProvedorTraducao em src/adaptadores/.
Tradução em cascata: (1) frases prontas pré-traduzidas e revisadas (offline); (2) Translator API do
Chrome no próprio aparelho (desktop/totem); (3) nuvem via /api/traducao (provedor configurável,
chave só no servidor, orçamento com corte).
Adaptadores mock para testes e desenvolvimento.
Alternativas consideradas
Uma única API em nuvem: sem offline e com custo por uso.

---

## Página 85

Consequências
(+) Funciona offline nas frases mais comuns; troca de fornecedor sem mexer nas telas.
(−) Mais código de integração; a qualidade varia por adaptador (indicada na interface).

### ADR-0010: UI com shadcn/ui (Radix), Tailwind 4 e tokens de tema

Status: Aceita · Data: 2026-11-13
Contexto
Precisamos de componentes acessíveis (foco, teclado, ARIA) rapidamente, com 3 temas (padrão, escuro,
alto contraste) e escala de fonte.
Decisão
shadcn/ui (código copiado para o repositório) sobre Radix UI.
Tailwind CSS 4 com tokens em variáveis CSS (--cor-texto, --cor-foco, --escala-fonte)
trocados por data-tema no <html>.
Fonte Atkinson Hyperlegible Next via next/font.
Contraste de cada token verificado por teste automatizado.
Alternativas consideradas
React Aria Components: excelente acessibilidade, mas curva maior para a equipe no prazo.
MUI: pesado e mais difícil de ajustar aos temas.
Consequências
(+) Velocidade de desenvolvimento e acessibilidade de base.
(−) Componentes copiados precisam ser mantidos pela equipe.

### ADR-0011: IA generativa só como apoio, com revisão humana

Status: Aceita · Data: 2026-11-13
Contexto
IA generativa ajuda a traduzir e a reescrever em linguagem simples, mas pode errar. Num contexto de
acessibilidade e segurança física, erros têm custo alto.
Decisão
Nunca usar IA para rotas, instruções de navegação, status de equipamentos ou emergência.
Usar IA para rascunhos de linguagem simples e traduções de conteúdo, revisados por humanos
antes de publicar (RNF-15).
Na conversa ao vivo, IA só como último adaptador de tradução, com aviso “tradução automática” e
sem guardar texto.

---

## Página 86

Adaptador Claude opcional: modelo padrão claude-opus-5-5 (configurável por LLM_MODEL;
claude-haiku-5-5 como alternativa de menor custo, a critério da equipe), esforço low, saída
estruturada, fallbacks no servidor e tratamento de recusa.
Alternativas consideradas
IA como “assistente” que responde tudo: risco de respostas inventadas sobre lojas e caminhos.
Consequências
(+) Benefício da IA sem comprometer segurança e confiança.
(−) Exige fluxo editorial de revisão.

---

## Página 87


# Apêndice C. Glossário

Termo Significado
ABL Área Bruta Locável de um shopping
ADR Architecture Decision Record: registro curto de uma decisão de arquitetura
App Router Sistema de rotas do Next.js baseado na pasta app/, com layouts e Server Components
aria-live Atributo que faz o leitor de tela anunciar mudanças de conteúdo sem mover o foco
Âncora (loja) Loja de grande porte que atrai público (ex.: Renner, Riachuelo, C&A)
Âncora (localização) Ponto físico conhecido (placa QR/NFC) usado como origem das rotas
CAA Comunicação Aumentativa e Alternativa (ex.: pranchas de pictogramas)
CIL Central de Intermediação em Libras: intérpretes humanos por videochamada
CIPTEA Carteira de Identificação da Pessoa com Transtorno do Espectro Autista (Lei 13.977/2020)
Cordão de girassol Símbolo nacional de identificação das deficiências ocultas (Lei 14.624/2023), de uso opcional
Dijkstra Algoritmo que encontra o caminho de menor custo num grafo com pesos não negativos
Grafo de circulação Representação dos caminhos do shopping: nós (cruzamentos, portas, elevadores) e arestas
(trechos entre eles)
IMDF Indoor Mapping Data Format: padrão de mapas internos (Apple/OGC)
LCP / INP / CLS Métricas Core Web Vitals: tempo de carregamento do maior elemento, responsividade e estabilidade
visual
LGPD Lei Geral de Proteção de Dados (Lei 13.709/2018)
Libras Língua Brasileira de Sinais, língua oficial da comunidade surda brasileira (Lei 10.436/2002)
Linguagem simples Forma de escrever com frases curtas, palavras comuns e estrutura clara, para que todos entendam
NFC / NDEF Comunicação por aproximação; NDEF é o formato da mensagem gravada na etiqueta (aqui, uma
URL)
PcD / PNE Pessoa com deficiência / Pessoa com necessidades especiais (termo antigo, ainda usado em vagas
e sanitários)
Perfil de rota Conjunto de pesos que adapta o cálculo da rota (ex.: sem degraus)
PWA Progressive Web App: site que funciona offline e pode ser instalado
Proxy (Next.js 16) Arquivo proxy.ts (antigo middleware.ts) que roda antes das rotas; aqui, negocia o idioma
RLS Row Level Security: regras de acesso por linha no PostgreSQL
RSC React Server Components: componentes renderizados no servidor, sem JavaScript no cliente
Route Handler Arquivo route.ts que responde a requisições HTTP no Next.js (API)
Server Action Função de servidor chamada direto de um formulário React
STT / TTS Speech-to-Text (fala → texto) / Text-to-Speech (texto → fala)
SUS System Usability Scale: questionário padrão de usabilidade (0–100)

---

## Página 88

Termo Significado
TEA Transtorno do Espectro Autista
VLibras Suíte gratuita do governo federal que traduz português para Libras com avatar
WCAG Web Content Accessibility Guidelines (W3C); versão 2.2, níveis A, AA e AAA
Wayfindr / ITU-T Padrão internacional de navegação por áudio para pessoas com deficiência visual
F.921

---

## Página 89


# Apêndice D. Referências

Consultas feitas em 13/11/2026.
Dados do shopping e do público
Planta Mix: 2026_11_CDS_MIX.pdf. Operações Capim Dourado Shopping, nov/2026 (fornecida à
equipe).
Conexão Tocantins: inauguração do Capim Dourado Shopping (17/08/2010).
https://conexaoto.com.br/2010/08/17/capim-dourado-shopping-e-inaugurado-com-presenca-de-
gaguim-e-siqueira
Fusões & Aquisições: BR Malls compra o Shopping Capim Dourado.
https://fusoesaquisicoes.com/acontece-no-setor/brmallscia-compra-shopping-capim/
Abrasce, sobre nós (coordenação estadual: Capim Dourado Shopping / Soul Malls).
https://abrasce.com.br/en/sobre-nos/
IBGE, Agência de Notícias: Censo 2022, Brasil tem 14,4 milhões de pessoas com deficiência.
https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/43463-
censo-2022-brasil-tem-14-4-milhoes-de-pessoas-com-deficiencia
CNN Brasil: Brasil tem 14,4 milhões de pessoas com deficiência, diz IBGE.
https://www.cnnbrasil.com.br/saude/brasil-tem-144-milhoes-de-pessoas-com-deficiencia-diz-ibge/
Band: Censo, dados sobre autismo (2,4 milhões, 1,2%). https://www.band.com.br/noticias/brasil-tem-
144-milhoes-de-pessoas-com-deficiencia-202505231006
Soluções premiadas e referências de produto
MTA: NaviLens no metrô de Nova York. https://www.mta.info/accessibility/innovations/navilens
Tech4Good Awards: NaviLens (finalista e vencedora, Acessibilidade 2021).
https://tech4goodawards.com/finalist/navilens/
ITU: como o Wayfindr Open Standard usa novas tecnologias para ajudar pessoas com deficiência
visual. https://www.itu.int/hub/2020/06/how-the-wayfindr-open-standard-uses-new-tech-to-help-the-
visually-impaired/
Wayfindr: por que um padrão aberto. https://www.wayfindr.net/open-standard
G3ict: Wayfindr e a Recomendação ITU-T F.921. https://g3ict.org/publication/wayfindr-accelerating-
the-adoption-of-indoor-audio-navigation-with-a-standard-user-interface
Be My Eyes: prêmio App Store 2025 (Impacto Cultural). https://www.bemyeyes.com/?p=21193840
AppleVis: Golden Apple Awards 2023. https://www.applevis.com/comment/159685
Startupi: Hand Talk leva prêmio da ONU. https://startupi.com.br/hand-talk-app-alagoano-de-
acessibilidade-leva-premio-da-onu/
VLibras Web (repositório oficial do widget). https://github.com/spbgovbr-vlibras/vlibras-web-browsers
Plugin VLibras para WordPress (dependência do serviço vlibras.gov.br).
https://wordpress.org/plugins/vlibras-widget/
GoodMaps: prêmio GAADys. https://gaad.foundation/what-we-do/gaadys/winners/goodmaps
Zero Project Awards 2026. https://zeroproject.org/research/zero-project-awards
Zero Project: anúncio de 75 soluções premiadas. https://zeroproject.org/news/article/awardee-
announcement-75-innovative-solutions-and-7-arts-initiatives

---

## Página 90

TSE lança Central de Intermediação em Libras (nov/2026).
https://www.tse.jus.br/comunicacao/noticias/2026/Novembro/tse-lanca-central-de-intermediacao-em-
libras-para-ampliar-acessibilidade
Prefeitura de São Paulo: Central de Libras.
https://prefeitura.sp.gov.br/web/pessoa_com_deficiencia/central_de_libras
Prefeitura de São Paulo: premiações (CIL no Prêmio Líderes de Acessibilidade).
https://prefeitura.sp.gov.br/web/pessoa_com_deficiencia/w/premia%C3%A7%C3%B5es
Shoppings e varejo
Mall of America: guia sensorial 2026. https://mallofamerica.com/sites/default/files/2026-
03/MOA_SensoryGuide2026.pdf
Blooloop: Mall of America amplia acessibilidade. https://blooloop.com/mall-of-america-enhances-
accessibility/
SEA LIFE Minnesota: recursos sensoriais (KultureCity). https://visitsealife.com/minnesota/plan-your-
day/before-you-visit/sensory-inclusive-resources/
Autism Travel: Reel Cinemas Dubai Mall (IBCCES). https://autismtravel.com/2024/12/13/reel-
cinemas-dubai-mall/
Emaar: compromisso com a inclusão. https://www.emaar.com/en/blog/emaar-entertainments-
commitment-to-inclusivity-creating-accessible-experiences-for-all
Gazeta SP: salas sensoriais obrigatórias em shoppings de SP.
https://www.gazetasp.com.br/cotidiano/salas-sensoriais-autistas-shoppings-sp/
Diário das Leis: OE declara constitucional a lei das salas de regulação sensorial.
https://www.diariodasleis.com.br/blog/bdi/noticia/oe-declara-constitucional-lei-que-preve-salas-de-
regulacao-sensorial-em-shoppings
Catraca Livre: Mauá Plaza inaugura espaço sensorial. https://catracalivre.com.br/vila-mundo/maua-
plaza-inaugura-espaco-sensorial-para-pessoas-neurodivergentes/
Mercado & Consumo: Salvador Shopping, Hora Silenciosa.
https://mercadoeconsumo.com.br/10/05/2023/varejo-com-causa/salvador-shopping-lanca-acao-
permanente-para-dar-comodidade-ao-passeio-de-autistas/
LegisWeb: Lei TO nº 3.964/2022 (mesas reservadas na praça de alimentação; texto a confirmar).
https://www.legisweb.com.br/legislacao/?id=434323
Prêmios
Bem Paraná: Prêmio Abrasce 2026, categoria Newton Rique ESG.
https://www.bemparana.com.br/publicacao/blogs/conexaobusiness/projeto-de-shopping-do-parana-
conquista-principal-premio-do-setor-no-brasil/amp/
TNH1: Prêmio Líderes de Acessibilidade, 2ª edição. https://www.tnh1.com.br/noticia/nid/premio-
lideres-de-acessibilidade-abre-inscricoes-para-sua-2a-edicao/
Comissão Europeia: vencedores do Access City Award 2026. https://commission.europa.eu/strategy-
and-policy/policies/justice-and-fundamental-rights/disability/access-city-award-aca/winners-access-
city-award-2026_en
Apple Design Awards. https://developer.apple.com/design/awards/

---

## Página 91

Normas, leis e padrões
W3C: WCAG 2.2. https://www.w3.org/TR/WCAG22/
ABNT NBR 17225:2025 (cópia hospedada pela Câmara dos Deputados).
https://www2.camara.leg.br/a-camara/estruturaadm/gestao-na-camara-dos-
deputados/responsabilidade-social-e-
ambiental/acessibilidade/pdfs/ABNTNBR17225AcessibilidadeDigitalparaWeb.pdf
Agência Gov: nova norma técnica da ABNT para acessibilidade digital.
https://agenciagov.ebc.com.br/noticias/202503/com-apoio-do-governo-federal-nova-norma-tecnica-
da-abnt-e-instituida-para-impulsionar-acessibilidade-digital-no-brasil
Lei 14.624/2023 (cordão de girassol). https://www2.camara.leg.br/legin/fed/lei/2023/lei-14624-17-
julho-2023-794443-publicacaooriginal-168489-pl.html
OGC: Indoor Mapping Data Format (IMDF). https://docs.ogc.org/cs/20-094/
Chrome for Developers: tradução no aparelho (Translator API).
https://developer.chrome.com/docs/ai/translate-on-device
Decreto de Palmas nº 2.527/2024 (composição do Conselho Municipal dos Direitos da Pessoa com
Deficiência). https://legislativo.palmas.to.gov.br/media/leis/decreto-2.527-2024-06-17-16-8-2024-13-
59-9.pdf
Open Symbols: Mulberry Symbols (licença CC BY-SA).
https://www.opensymbols.org/repositories/mulberry
ARASAAC: termos de uso (CC BY-NC-SA). https://aulaabierta.arasaac.org/en?p=66857
Next.js 16.4: documentação empacotada em node_modules/next/dist/docs (accessibility, offline-
support, progressive-web-apps, internationalization, preventing-flash-before-hydration, proxy).
