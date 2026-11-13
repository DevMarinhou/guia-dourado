# ADR-0003: Rotas calculadas no cliente e localização por âncoras QR/NFC
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
A v1 previa o cálculo de rotas no servidor e uma “geolocalização” para aproximar o piso. O GPS não funciona bem em ambientes internos e não informa o piso. Posicionamento indoor preciso exige beacons ou visão computacional.

## Decisão
- **Dijkstra no cliente**, com o grafo em cache (poucos KB). O mesmo módulo roda no servidor para testes.
- **Localização por âncoras:** o ponto escaneado (QR/NFC) ou escolhido em “Onde estou?” é a origem. Durante a rota, o usuário avança os passos manualmente ou pelo leitor de tela.
- Status de equipamentos buscado na rede com timeout de 2 s; offline, usa o último conhecido.

## Alternativas consideradas
- **Rota no servidor:** não funciona offline e adiciona latência.
- **Beacons BLE (padrão Wayfindr):** melhor precisão, mas exige instalação e manutenção. Fica no roadmap.
- **Geolocation API:** imprecisa em ambiente interno e sem informação de piso.

## Consequências
- (+) Rotas offline e instantâneas; custo zero de infraestrutura.
- (−) Sem “ponto azul” contínuo; mitigado por instruções com marcos e placas em pontos de decisão.
