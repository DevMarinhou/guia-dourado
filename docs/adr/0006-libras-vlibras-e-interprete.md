# ADR-0006: Libras com VLibras, vídeos e intérprete humano
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
A v1 previa “tradução simultânea Libras ↔ fala” por API. A tradução de português para Libras por avatar existe (VLibras, Hand Talk), mas o **reconhecimento automático de Libras para português** ainda não é confiável para atendimento.

## Decisão
- **Português → Libras:** widget **VLibras** (gratuito, código aberto, do governo federal), carregado sob demanda.
- **Conteúdo fixo** (boas-vindas, como pedir ajuda): **vídeos curtos com intérpretes**, com legenda.
- **Libras → português:** **intérprete humano por videochamada** (parceria com central de intermediação), além de digitação e pictogramas.

## Alternativas consideradas
- **Hand Talk (plugin pago):** boa qualidade, mas com custo. Alternativa futura.
- **Reconhecimento de Libras por visão computacional:** imaturo para uso em atendimento.

## Consequências
- (+) Solução honesta, legal (Lei 10.436/2002) e alinhada à comunidade surda.
- (−) VLibras depende de internet e do serviço do governo; intérprete humano tem custo recorrente.
