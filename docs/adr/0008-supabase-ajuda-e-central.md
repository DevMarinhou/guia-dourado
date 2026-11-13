# ADR-0008: Supabase para pedidos de ajuda e Central
- **Status:** Aceita · **Data:** 2026-11-13

## Contexto
A Central precisa receber pedidos em tempo real, a equipe precisa de login e o MVP tem 24 h e orçamento zero.

## Decisão
- **Supabase** (PostgreSQL padrão + Realtime + Auth), região São Paulo.
- O visitante **nunca acessa o banco diretamente**: tudo passa por Route Handlers com chave de serviço no servidor.
- A Central (autenticada) assina mudanças via Realtime; o visitante consulta o status por *polling* (5 s), que é simples e robusto.
- RLS habilitado em todas as tabelas.

## Alternativas consideradas
- **Firebase:** NoSQL e mais aprisionamento.
- **Postgres próprio + WebSocket:** mais tempo de infraestrutura.
- **Somente polling na Central:** plano B se o Realtime atrasar.

## Consequências
- (+) Tempo real e autenticação prontos; SQL padrão, sem aprisionamento.
- (−) Dependência de serviço externo; o plano gratuito pausa por inatividade (usar plano pago no piloto).
