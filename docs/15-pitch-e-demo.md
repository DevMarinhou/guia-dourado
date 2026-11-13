# 15. Pitch e demonstração (entrega final)

## 15.1 Roteiro do pitch (3 minutos)

| Tempo | Bloco | Fala-guia |
|---|---|---|
| 0:00–0:25 | **Gancho** | “O Brasil tem 14,4 milhões de pessoas com deficiência e 2,4 milhões com diagnóstico de autismo (IBGE, Censo 2022). Palmas recebe turistas que não falam português. Hoje, no shopping, quase toda informação é só visual ou só falada.” |
| 0:25–0:45 | **Problema** | “Quem é surdo, cego, cadeirante, autista ou estrangeiro não consegue se informar nem conversar com a equipe com autonomia. E a equipe também não sabe como ajudar.” |
| 0:45–2:05 | **Demo ao vivo** (15.2) | QR → “Você está em” → rota sem degraus com elevador → conversa → pedir ajuda → aparece na Central |
| 2:05–2:30 | **Diferenciais** | Sem instalar e sem cadastro · funciona offline · rotas seguras e auditáveis (nunca por IA) · Libras com VLibras e intérprete humano · QR + NFC + Braille · dados sensíveis só no celular (LGPD) |
| 2:30–2:50 | **Viabilidade e impacto** | Custo quase zero no piloto (VLibras e Web Speech gratuitos); métricas: tarefa concluída ≥ 85%, ajuda aceita em ≤ 2 min; teste com a Associação dos Surdos de Palmas e a de deficientes visuais |
| 2:50–3:00 | **Fechamento** | “O Guia Dourado transforma o Capim Dourado num shopping onde todo mundo encontra, entende e é entendido.” |

## 15.2 Roteiro da demo (2 celulares + notebook)

1. **Celular 1 (português):** escanear a placa `ENT-JK` → abre “Você está em: Entrada Av. JK”.
2. Ativar **alto contraste** e **letra grande** em Preferências → tudo muda sem recarregar.
3. **Buscar** “mundo imersivo” → **Como chegar** com perfil **sem degraus** → passos com elevador, lidos em voz.
4. No **notebook (Central)**, marcar **ELV-01 em manutenção** → no celular, a rota é recalculada pelo ELV-02, com aviso.
5. **Celular 2 (espanhol):** escanear `MESA-07` → abre em espanhol → **Conversar**: “¿Cuánto cuesta?” aparece e é falado em português.
6. Tocar em **Libras** → avatar VLibras na tela.
7. **Pedir ajuda** (Comunicação, Libras) → aparece na **Central** em até 2 s → “Aceitar, a caminho” → o celular anuncia “Luana está a caminho”.
8. Mostrar o **relatório de acessibilidade** (axe sem violações nos 3 temas) e os **testes** passando.

**Plano B:** vídeo gravado da demo completa; frases prontas funcionam sem internet; Central com polling se o Realtime falhar.

## 15.3 Perguntas prováveis da banca

| Pergunta | Resposta curta |
|---|---|
| “Por que não um app nativo?” | Barreira de instalação. O QR abre na hora; o PWA funciona offline e usa o leitor de tela nativo |
| “Como sabem onde a pessoa está sem GPS?” | Pelas placas (QR/NFC) em pontos de decisão e pelo “Onde estou?”. Beacons estão no roadmap |
| “A IA traduz Libras?” | Não prometemos isso. Português → Libras com VLibras; Libras → português com intérprete humano por vídeo, que é o padrão-ouro |
| “E a privacidade?” | Preferências ficam no celular; só enviamos local e forma de comunicação ao pedir ajuda, com consentimento, e apagamos em 30 dias |
| “E se o elevador quebrar?” | A Central marca em 1 toque; as rotas sem degraus são recalculadas na hora |
| “Quanto custa?” | MVP com planos gratuitos; no piloto, hospedagem e banco pagos (baixo custo), placas e intérprete (maior impacto) |
| “Como mantêm os dados?” | Dados versionados e validados automaticamente; na fase 2, a equipe do shopping edita pela Central |
| “Como sabem que é acessível?” | WCAG 2.2 AA / NBR 17225, axe no CI em todas as telas e temas, e testes com pessoas com deficiência |
