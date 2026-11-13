# 2. Pesquisa e benchmark

**Método:** pesquisa documental feita em 13/11/2026 sobre (a) soluções de acessibilidade **premiadas ou reconhecidas** internacionalmente, (b) **shoppings e espaços de varejo** com práticas de acessibilidade, (c) **prêmios** em que esta solução poderia concorrer e (d) **normas e leis** aplicáveis no Brasil. Cada referência gerou uma **lição** e uma **decisão de projeto**. Os links completos estão em [Referências](referencias.md).

## 2.1 Soluções premiadas e reconhecidas

| Solução | Reconhecimento | O que faz | Lição para o Guia Dourado |
|---|---|---|---|
| **NaviLens** (Espanha) | Vencedora do **Tech4Good Accessibility Award 2021** (AbilityNet); a MTA (metrô de Nova York) recebeu **US$ 2 milhões** do programa SMART do Departamento de Transportes dos EUA (2023) para expandir o uso | Códigos visuais coloridos lidos **a distância e em ângulo**, sem foco, com informação falada | Pessoa cega **não consegue mirar** um QR comum → cada ponto terá **NFC + relevo/Braille + QR grande**; NaviLens fica como integração futura |
| **Wayfindr Open Standard** (Reino Unido) | Aprovado como **Recomendação ITU-T F.921** (2017); licença CC BY-SA 4.0 | Padrão de **navegação por áudio** em ambientes internos para pessoas com deficiência visual | Instruções de rota seguem o padrão: frases curtas, referências (“marcos”), distância, aviso antes de mudanças de direção e de piso |
| **Be My Eyes** (Dinamarca) | **Apple Design Award 2021** (impacto social); Golden Apple da AppleVis 2023; prêmio **App Store 2025** (Impacto Cultural, segundo a empresa) | Videochamada com voluntários + descrição por IA (“Be My AI”) | O melhor atendimento combina **humano + tecnologia** → botão “falar com intérprete/atendente por vídeo” |
| **Hand Talk** (Brasil, AL) | Premiada pela ONU no **World Summit Award Mobile 2013** (inclusão social) | Tradução de texto e voz para Libras com avatar (Hugo); plugin para sites | Avatar de Libras ajuda no **texto dinâmico**; a empresa também criou o **Prêmio Líderes de Acessibilidade** |
| **VLibras** (Governo Federal) | Suíte **gratuita e de código aberto**; usada no gov.br | Widget que traduz o texto da página para Libras com avatar 3D | **Adotado no MVP** (custo zero). Atenção: depende do serviço `vlibras.gov.br` e de internet |
| **Central de Intermediação em Libras (CIL)** | CIL da Prefeitura de São Paulo reconhecida no **Prêmio Líderes de Acessibilidade**; **TSE lançou CIL nacional em nov/2026** com acesso por **QR Code** | Intérprete de Libras humano por videochamada, em tempo real | **Intérprete humano** é o padrão-ouro para Libras → português. O app terá o atalho “Chamar intérprete” (parceria a firmar) |
| **GoodMaps** (EUA) | **CES 2021 Innovation Award** (homenageada) | Navegação indoor por câmera, sem beacons | Posicionamento preciso é caro e complexo → MVP usa **âncoras QR/NFC**; posicionamento contínuo vai para o roadmap |
| **Zero Project Awards 2026** (Áustria) | **75 soluções de 51 países** premiadas (foco: Acessibilidade, TIC e Resposta a Crises) | Banco internacional de boas práticas em deficiência | Fonte de padrões e possível vitrine futura para o projeto |

## 2.2 Shoppings e espaços de varejo de referência

| Referência | Prática | Lição / decisão |
|---|---|---|
| **Mall of America** (EUA) | Guia **sensorial e de acessibilidade 2026**; parceria com a Fraser (abr/2026) para ampliar iniciativas sensoriais; **sala sensorial** no Nickelodeon Universe (isolamento acústico, assentos, apoios táteis); SEA LIFE certificado pela **KultureCity**; atrações com certificação **IBCCES** (Certified Autism Center) | Publicar **informação sensorial** (ruído, luz, multidão) e **localizar espaços tranquilos** no mapa. Capa “sensorial” no mapa (Cap. 4) |
| **Dubai** (Emaar / Reel Cinemas Dubai Mall) | Cinema do Dubai Mall certificado **IBCCES** (equipe treinada, iluminação reduzida); cidade em busca da designação *Certified Autism Destination* | **Treinamento da equipe** + certificação de operações (cinema, parque infantil) como passo do roadmap |
| **Lei paulista 18.183/2025** | **Salas de regulação sensorial obrigatórias** em shoppings com mais de 2.000 pessoas/dia; decreto de abr/2026, prazo de 180 dias, fiscalização do Procon-SP; TJSP declarou a lei constitucional | **Tendência regulatória** → o Capim Dourado pode se antecipar; o app já prevê a sala/área tranquila no mapa |
| **Mauá Plaza** (SP) | Espaço sensorial com sala de descompressão, vagas exclusivas e equipe treinada | Alinhar app + espaço físico + equipe |
| **Salvador Shopping** (BA) | **Hora Silenciosa** permanente (redução de estímulos) | O app divulga horários silenciosos e eventos inclusivos |
| **Park Shopping Campo Grande** (RJ) | “Sala do Bem” | Idem |
| **Tocantins: Lei 3.964/2022** | Reserva de **3% das mesas da praça de alimentação** para pessoas com deficiência ou mobilidade reduzida (texto a confirmar no portal oficial) | O app **mostra e localiza as mesas reservadas** (camada de acessibilidade no 2º pavimento) |
| **Capim Dourado (planta nov/2026)** | Vagas para **neurodivergentes**, idosos, gestantes e PNE nos subsolos | Ponto de partida forte → rota “do estacionamento ao destino” com QR nos pilares |

## 2.3 Prêmios em que a solução poderia concorrer

| Prêmio | Quem organiza | Categoria/encaixe |
|---|---|---|
| **Prêmio Abrasce** | Associação Brasileira de Shopping Centers | Categoria **Newton Rique ESG – Ações de Impacto Social** (o shopping inscreve o projeto) |
| **Prêmio Líderes de Acessibilidade** | Hand Talk | **Melhores Iniciativas de Acessibilidade Web – Organizações Públicas e Privadas** |
| **Zero Project Award** | Fundação Essl (Áustria), conferência na ONU em Viena | Soluções inovadoras em acessibilidade/TIC |
| **Tech4Good Awards** | AbilityNet (Reino Unido) | Categoria Acessibilidade (a NaviLens venceu em 2021) |
| **World Summit Awards** | WSA | Inclusão social (a Hand Talk venceu em 2013) |
| **Access City Award** | Comissão Europeia | Só para cidades; serve de referência de critérios (Zaragoza venceu em 2026) |
| **Apple Design Awards: Inclusivity** | Apple | Só para apps nativos; referência de qualidade de design inclusivo |

> **Uso prático:** os critérios desses prêmios (impacto mensurável, coprojeto com pessoas com deficiência, escalabilidade, custo, replicabilidade) foram usados como **checklist de qualidade** do projeto e do pitch (Cap. 15).

## 2.4 Normas, leis e padrões técnicos aplicáveis

| Referência | Aplicação no projeto |
|---|---|
| **WCAG 2.2** (W3C) | Meta de conformidade nível AA + critérios AAA selecionados |
| **ABNT NBR 17225:2025** (acessibilidade em conteúdo e aplicações web) | Primeira norma brasileira de acessibilidade digital, alinhada à WCAG 2.2 e de consulta gratuita no site da ABNT |
| **Lei Brasileira de Inclusão (Lei 13.146/2015)** | Acessibilidade na comunicação e na informação; obrigatoriedade de acessibilidade em sites de empresas com sede ou representação no país |
| **Lei 10.436/2002 e Decreto 5.626/2005** | Libras como meio legal de comunicação e expressão |
| **Lei 14.624/2023** | Cordão de girassol como símbolo nacional das **deficiências ocultas** (uso opcional) |
| **Lei 12.764/2012 e Lei 13.977/2020** | Pessoa com TEA é pessoa com deficiência para todos os efeitos legais; CIPTEA |
| **Lei 10.048/2000** | Atendimento prioritário |
| **ABNT NBR 9050** e **NBR 16537** | Acessibilidade física e sinalização tátil no piso: orientam placas QR/NFC/Braille e rotas táteis |
| **LGPD (Lei 13.709/2018)** | Dados de deficiência são **dados sensíveis**: minimização e consentimento (Cap. 11) |
| **IMDF** (Apple → OGC Community Standard, 2021) | Modelo de dados de mapas internos em GeoJSON (venue, level, unit, opening, amenity…) que inspira nosso modelo |
| **ITU-T F.921** (Wayfindr) | Padrão de instruções de navegação por áudio |
| **W3C COGA** (*Making Content Usable*) | Boas práticas para deficiências cognitivas e de aprendizagem (linguagem simples, previsibilidade) |

## 2.5 Síntese: das lições às decisões

| Lição | Decisão no Guia Dourado | Onde |
|---|---|---|
| QR comum é difícil para pessoas cegas | Ponto = **QR grande + NFC + Braille + código curto** | ADR-0005, Cap. 14 |
| Áudio de navegação precisa de padrão | Gerador de instruções no estilo **Wayfindr/ITU-T F.921** | Cap. 10 |
| Libras por IA ainda não é confiável no sentido Libras → português | **VLibras** (PT → Libras) + vídeos + **intérprete humano** | ADR-0006 |
| Melhor atendimento = humano + tecnologia | **Central da equipe** + pedido de ajuda com modo de comunicação | T08, T09, T12 |
| Autismo e sobrecarga sensorial são tema regulatório crescente | Informação sensorial no mapa, prancha de pictogramas, hora silenciosa | T02, T07, T11 |
| Posicionamento indoor é caro | Âncoras QR/NFC + “Onde estou?” manual; beacons no roadmap | ADR-0003 |
| Dados de mapa precisam de padrão | Modelo **inspirado no IMDF** + editor de grafo | ADR-0004 |
| Dados de deficiência são sensíveis | Perfil **local** no aparelho, sem conta | ADR-0007 |
| Elevador parado inviabiliza a rota | **Status de equipamentos** em tempo real no cálculo da rota | RF-11, T12 |
