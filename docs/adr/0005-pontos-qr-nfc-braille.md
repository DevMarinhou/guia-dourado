# ADR-0005: Pontos de acesso com QR + NFC + Braille e códigos curtos
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
QR Codes comuns são difíceis de localizar e enquadrar para pessoas cegas (lição da NaviLens). A v1 colocava parâmetros na URL (`?piso=&loja=`), o que obriga a reimprimir placas quando algo muda.

## Decisão
- Cada ponto tem um **código curto estável** (`ENT-JK`, `MESA-07`) e URL `https://<domínio>/q/<CÓDIGO>`.
- O **Route Handler `/q/[codigo]`** resolve o código pelos dados atuais e redireciona com o idioma certo. Mudar o local de um código não exige reimpressão.
- Placa com **QR grande + etiqueta NFC + Braille/relevo + código impresso**.

## Alternativas consideradas
- **Só QR com parâmetros:** frágil e inacessível para pessoas cegas.
- **NaviLens:** excelente, porém proprietário. Fica como integração futura.

## Consequências
- (+) Acesso por tato (NFC), visão (QR) e digitação (código curto).
- (+) Métrica de uso por ponto (contador agregado).
- (−) Custo de produção das placas; risco de QR falso colado por cima, mitigado por lacre e inspeção.
