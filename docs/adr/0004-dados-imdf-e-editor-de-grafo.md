# ADR-0004: Modelo inspirado no IMDF; grafo desenhado com editor e validado no CI
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
O grafo da v1, gerado pela proximidade dos rótulos do PDF, ficou com 9 componentes desconexos, sem elevadores e com ligações atravessando paredes. As marcas âncora não estavam associadas às lojas.

## Decisão
- Dados em JSON versionado (`dados/`) com entidades **piso, local, nó, aresta, equipamento e ponto**, compatíveis com conceitos do **IMDF** (OGC).
- Rótulos e áreas extraídos automaticamente do PDF (script da v1, aproveitado) para o **catálogo**.
- **Grafo de circulação desenhado** sobre a planta com um editor interno (nós em cruzamentos, portas e circulação vertical).
- **Validação no CI:** conectividade, alcance para o perfil sem degraus, elevadores nos dois pisos e códigos de ponto válidos.

## Alternativas consideradas
- **Grafo 100% automático:** mostrou-se não confiável.
- **Plataforma comercial de mapas internos:** custo e dependência de terceiros para o MVP.

## Consequências
- (+) Rotas confiáveis e auditáveis; caminho aberto para exportar IMDF.
- (−) Exige algumas horas de desenho e uma visita técnica para validar elevadores e rampas.
