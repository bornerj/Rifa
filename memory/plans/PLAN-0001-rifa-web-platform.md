# PLAN-0001 — Rifa Web Platform

Status: IN PROGRESS
Date: 2026-04-13
Last updated: 2026-04-14
Type: WEB APP
Priority: High

## Objective

Construir uma plataforma web mobile-first para criacao, publicacao, participacao e sorteio de rifas online, com fluxo simples para o participante e operacao segura para o admin.

## Current State

- Stack e arquitetura confirmadas e registradas em `memory/decisions/`
- Scaffold do projeto criado com Next.js, TypeScript, Tailwind, Drizzle e Neon
- Auth do admin implementada com email/senha + confirmacao por link magico
- Criacao de rifa implementada
- Pagina publica da rifa implementada
- Fluxo do participante com OTP e reserva de cotas implementado
- Confirmacao manual de pagamento implementada
- Sorteio auditavel implementado
- Build, lint e typecheck validados localmente
- Repositorio publicado no GitHub

## Scope Locked for MVP

- Admin com email e senha
- Confirmacao do admin por link magico
- Criacao de rifa com nome, proposito, beneficiario, duracao em dias, valor da cota e dados do PIX
- Objeto da rifa com nome e ate 3 imagens por URL
- Participante com nome e telefone celular com DDD
- Validacao do telefone por OTP de 6 digitos
- Reserva de varias cotas por participante
- Geracao aleatoria de numeros de cota com 5 digitos
- Grid publica com uma entrada por cota
- Exibicao de QR Code PIX e valor total
- Confirmacao manual de pagamento pelo admin
- Sorteio restrito ao admin criador da rifa
- Persistencia auditavel do resultado do sorteio

## Out of Scope for This Plan

- Conciliacao automatica de PIX
- Upload de imagem para storage proprio
- WhatsApp como canal principal do MVP
- Marketplace publico de rifas
- Multi-admin por rifa ou organizacao

## Decisions Applied

- `DECISION-001`: stack principal em Next.js + Drizzle + Neon + Tailwind
- `DECISION-002`: auth do admin por email/senha com link magico e OTP do participante por SMS no MVP
- `DECISION-003`: escopo do MVP fechado com criacao, participacao, pagamento manual e sorteio
- `DECISION-004`: PIX salvo como payload/metadados e sorteio auditavel com front apenas apresentacional

## Phases

### Phase 1 — Foundation

Status: DONE

Entregas:
- definicao da stack
- scaffold do Next.js
- configuracao inicial de lint, typecheck e build
- configuracao de env e setup base

Evidencias:
- `package.json`
- `src/app/layout.tsx`
- `src/lib/env.ts`
- `docs/project/SETUP.md`

### Phase 2 — Data Layer

Status: DONE

Entregas:
- schema inicial do banco
- migrations versionadas
- conexao Drizzle/Neon
- modelagem de rifas, itens, participantes, OTP, reservas, cotas e sorteios

Evidencias:
- `src/server/db/schema.ts`
- `src/server/db/index.ts`
- `drizzle/`

### Phase 3 — Admin Flow

Status: DONE

Entregas:
- cadastro e login do admin
- confirmacao por link magico
- protecao de sessao
- dashboard inicial do admin
- criacao persistida de rifa
- tela detalhada da rifa para operacao

Evidencias:
- `src/features/auth/`
- `src/app/cadastrar/page.tsx`
- `src/app/entrar/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/rifas/nova/page.tsx`
- `src/app/admin/rifas/[id]/page.tsx`

### Phase 4 — Participant Flow

Status: DONE

Entregas:
- pagina publica da rifa
- solicitacao de OTP
- validacao do telefone
- escolha da quantidade de cotas
- geracao de cotas aleatorias de 5 digitos
- reserva persistida com valor total
- exibicao do PIX para pagamento

Evidencias:
- `src/app/r/[slug]/page.tsx`
- `src/features/participants/actions.ts`
- `src/features/participants/components/participant-flow.tsx`
- `src/features/participants/utils.ts`

### Phase 5 — Visibility and Operations

Status: DONE

Entregas:
- grid publica de cotas
- painel do admin com reservas
- confirmacao manual de pagamento
- sorteio auditavel com persistencia do vencedor

Evidencias:
- `src/features/participants/components/ticket-grid.tsx`
- `src/features/raffles/components/admin-raffle-details-client.tsx`
- `src/app/api/admin/raffles/[id]/payments/route.ts`
- `src/app/api/admin/raffles/[id]/draw/route.ts`

### Phase 6 — Hardening

Status: IN PROGRESS

Ja feito:
- validacao com Zod nas entradas principais
- uso de ORM para evitar SQL injection
- hashing de OTP
- restricao server-side para acoes administrativas
- build local validado

Pendente:
- rate limit real para OTP por telefone/IP
- testes automatizados de unidade, integracao e E2E
- revisao formal de seguranca
- configuracao de provedores reais para producao
- validacao final em deploy Vercel + Neon

## Validation Status

Concluido:
- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- publicacao inicial no GitHub concluida

Pendente:
- `npm run db:migrate` contra o banco de deploy
- validacao funcional completa em ambiente Vercel
- cobertura automatizada de testes

## Risks and Gaps

- OTP ainda depende de modo preview enquanto o provedor real de SMS nao estiver configurado
- Confirmacao de pagamento ainda e manual no MVP
- Ainda nao existe rate limiting robusto para abuso de OTP
- Ainda nao ha suite automatizada cobrindo sorteio e autorizacao do admin

## Next Execution Steps

1. Configurar Neon e aplicar migrations no banco alvo.
2. Configurar variaveis de ambiente no Vercel.
3. Importar o repositorio no Vercel e concluir o primeiro deploy.
4. Validar o fluxo completo em deploy remoto.
5. Implementar hardening do MVP:
   - rate limit
   - testes
   - provider real de SMS
   - refinamentos de UX e mensagens operacionais

## Completion Criteria

Este plano podera ser marcado como `DONE` quando:

- o app estiver publicado e validado no Vercel com Neon
- o fluxo principal estiver testado em ambiente remoto
- os riscos minimos de hardening do MVP estiverem cobertos ou formalmente aceitos
