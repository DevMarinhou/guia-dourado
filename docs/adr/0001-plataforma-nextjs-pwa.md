# ADR-0001: Plataforma web/PWA com Next.js 16 (App Router)
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
A tecnologia sorteada é React + Next.js. O visitante chega por QR/NFC e não deve precisar instalar nada. O prazo do MVP é de 24 h.

## Decisão
Aplicação **web responsiva/PWA** com **Next.js 16.4 (App Router)** e **React 19.3**, hospedada na Vercel (gru1). A mesma base atende o visitante, o totem (modo quiosque) e a Central da equipe.

## Alternativas consideradas
- **App nativo (React Native/Flutter):** barreira de instalação, lojas de apps, duas plataformas.
- **SPA pura (Vite):** sem renderização no servidor, primeira pintura vazia e pior desempenho no 4G.
- **Site estático sem framework:** sem API, sem Central em tempo real.

## Consequências
- (+) Acesso imediato pelo QR; páginas estáticas na CDN; uma só base de código.
- (+) Recursos nativos de acessibilidade do Next (anunciador de rotas, `jsx-a11y`).
- (−) Algumas Web APIs variam por navegador (vibração no iOS, Web NFC); exigem alternativas (Cap. 8.3).
