# PLAN-0001 — Rifa Web Platform

Status: LOCAL VALIDATION COMPLETE; ENV VALIDATION PENDING
Date: 2026-04-13
Last updated: 2026-04-15
Type: WEB APP
Priority: High

## Objective

Construir uma plataforma web mobile-first para criacao, publicacao, participacao e sorteio de rifas online, com fluxo simples para o participante e operacao segura para o admin.

## Current State

- Stack e arquitetura confirmadas e registradas em `memory/decisions/`
- Scaffold do projeto criado com Next.js, TypeScript, Tailwind, Drizzle e Neon
- Auth do admin implementada com email/senha + confirmacao por link magico
- Criacao de rifa implementada
- Configuracao e edicao posterior de PIX implementadas no detalhe da rifa
- Edicao posterior do item e das imagens implementada no detalhe da rifa
- Pagina publica da rifa implementada
- Fluxo legado do participante com OTP e reserva de cotas implementado
- Confirmacao manual de pagamento implementada
- Sorteio auditavel implementado
- Build, lint e typecheck validados localmente
- Repositorio publicado no GitHub
- Mudanca de escopo aprovada em 2026-04-15 para remover OTP/SMS/WhatsApp do participante e substituir confirmacao por email via Brevo apos confirmacao manual do PIX

## Scope Locked for MVP

- Admin com email e senha
- Confirmacao do admin por link magico
- Criacao de rifa com nome, proposito, beneficiario, duracao em dias e valor da cota
- Configuracao posterior de PIX no painel do admin
- Objeto da rifa com nome e ate 3 imagens, sendo ao menos uma imagem real do objeto com upload gerenciado pelo sistema
- Participante com nome, email e telefone celular com DDD
- Sem OTP, SMS ou WhatsApp no fluxo do participante
- Reserva de varias cotas por participante
- Geracao aleatoria de numeros de cota com 5 digitos
- Exibicao imediata dos numeros gerados na tela apos confirmacao da participacao
- Aviso ao participante de que o recibo/confirmacao sera enviado por email apos confirmacao manual do PIX
- Grid publica com uma entrada por cota
- Area administrativa com grid de reservas/participantes e acao de confirmacao de PIX recebido
- Envio de email via Brevo ao participante apos confirmacao manual do pagamento, contendo confirmacao do pagamento e os numeros da rifa
- Exibicao de QR Code PIX e valor total
- Confirmacao manual de pagamento pelo admin
- Sorteio restrito ao admin criador da rifa
- Persistencia auditavel do resultado do sorteio

## Out of Scope for This Plan

- Conciliacao automatica de PIX
- OTP, SMS ou WhatsApp como canal de validacao do participante
- Marketplace publico de rifas
- Multi-admin por rifa ou organizacao
- Confirmacao automatica de recebimento do PIX

## Decisions Applied

- `DECISION-001`: stack principal em Next.js + Drizzle + Neon + Tailwind
- `DECISION-002`: auth do admin por email/senha com link magico e OTP do participante por SMS no MVP, substituida no fluxo do participante pela `DECISION-005`
- `DECISION-003`: escopo do MVP fechado com criacao, participacao, pagamento manual e sorteio
- `DECISION-004`: PIX salvo como payload/metadados e sorteio auditavel com front apenas apresentacional
- `DECISION-005`: remover OTP/SMS/WhatsApp do participante e confirmar pagamento por email via Brevo apos validacao manual do PIX pelo admin

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
- modelagem de rifas, itens, participantes, reservas, cotas e sorteios, incluindo estrutura legada de OTP que sera removida na Phase 7

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
- configuracao posterior de PIX
- edicao do item e das imagens no detalhe da rifa

Evidencias:
- `src/features/auth/`
- `src/app/cadastrar/page.tsx`
- `src/app/entrar/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/rifas/nova/page.tsx`
- `src/app/admin/rifas/[id]/page.tsx`
- `src/app/api/admin/raffles/[id]/pix/route.ts`
- `src/app/api/admin/raffles/[id]/item/route.ts`

### Phase 4 — Participant Flow

Status: REOPENED BY SCOPE CHANGE

Entregas:
- pagina publica da rifa
- remover solicitacao e validacao de OTP
- solicitar nome, email e telefone no fluxo publico
- manter escolha da quantidade de cotas
- gerar cotas aleatorias de 5 digitos no clique de confirmacao
- exibir imediatamente os numeros gerados e o aviso de confirmacao posterior por email
- persistir reserva com valor total e status pendente de pagamento
- exibir o PIX para pagamento

Evidencias:
- `src/app/r/[slug]/page.tsx`
- `src/features/participants/actions.ts`
- `src/features/participants/components/participant-flow.tsx`
- `src/features/participants/utils.ts`

### Phase 5 — Visibility and Operations

Status: REOPENED BY SCOPE CHANGE

Entregas:
- grid publica de cotas
- painel do admin com grid operacional de reservas/participantes
- confirmacao manual de pagamento por reserva
- envio de email via Brevo apos confirmacao manual de pagamento
- sorteio auditavel com persistencia do vencedor

Evidencias:
- `src/features/participants/components/ticket-grid.tsx`
- `src/features/raffles/components/admin-raffle-details-client.tsx`
- `src/app/api/admin/raffles/[id]/payments/route.ts`
- `src/app/api/admin/raffles/[id]/draw/route.ts`

### Phase 6 — Hardening

Status: PAUSED UNTIL SCOPE PIVOT IS IMPLEMENTED

Ja feito:
- validacao com Zod nas entradas principais
- uso de ORM para evitar SQL injection
- restricao server-side para acoes administrativas
- build local validado

Pendente:
- testes automatizados de unidade, integracao e E2E
- revisao formal de seguranca
- configuracao do Brevo para emails transacionais em producao
- validacao final em deploy Vercel + Neon

### Phase 7 — Scope Pivot: Email Receipt + Admin Confirmation

Status: IN PROGRESS

Objetivo:
- Remover OTP/SMS/WhatsApp do fluxo do participante e transformar a confirmacao em email transacional via Brevo apos o admin confirmar o PIX recebido.

Tarefas:
- [x] Atualizar schema, migrations e modelos para participante com email obrigatorio, telefone informativo e reservas sem OTP.
- [x] Remover telas, textos, server actions, validacoes e memoria operacional de OTP do fluxo publico.
- [x] Ajustar a pagina publica para coletar nome, email, telefone e quantidade de cotas em uma confirmacao unica.
- [x] Gerar e exibir os numeros da rifa imediatamente apos a reserva, com mensagem de recibo pendente por email.
- [x] Criar/ajustar area administrativa em grid com reservas pendentes/pagas e botao de confirmacao de PIX recebido.
- [x] Integrar Brevo para envio de email de recibo ao participante apos confirmacao manual do pagamento.
- [x] Implementar suporte a imagem real do objeto com upload, respeitando limite de ate 3 imagens.
- [x] Validar persistencia de imagem em ambiente alvo; Vercel Blob foi adotado como storage compativel com Vercel.
- [x] Atualizar documentacao, env vars e mensagens pt-BR.
- [x] Executar `npm run db:generate`, `npm run lint`, `npm run typecheck` e `npm run build`.

Perguntas antes da implementacao:
- Respondido: confirmacao manual deve permitir selecao em lote.
- Respondido: Brevo deve usar o remetente especifico cadastrado no Brevo.
- Respondido: imagem real deve usar storage compativel com Vercel.

## Validation Status

Concluido:
- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm audit --audit-level=high`
- publicacao inicial no GitHub concluida

Pendente:
- validacao funcional completa em ambiente Vercel
- cobertura automatizada de testes
- validacao funcional da imagem real com Vercel Blob configurado

## Risks and Gaps

- Vercel Blob precisa estar configurado com `BLOB_READ_WRITE_TOKEN` no ambiente alvo
- Confirmacao de pagamento ainda e manual no MVP
- Restam vulnerabilidades moderadas em dependencia de desenvolvimento transitiva do `drizzle-kit`; a vulnerabilidade alta de `drizzle-orm` foi corrigida por upgrade
- Ainda nao ha suite automatizada cobrindo sorteio e autorizacao do admin

## Next Execution Steps

1. Configurar Vercel Blob no ambiente Vercel.
2. Validar upload de imagem real.
3. Validar fluxo completo em ambiente Vercel.
4. Continuar hardening do MVP com testes automatizados e revisao de seguranca.

## Completion Criteria

Este plano podera ser marcado como `DONE` quando:

- o app estiver publicado e validado no Vercel com Neon
- o fluxo principal estiver testado em ambiente remoto
- os riscos minimos de hardening do MVP estiverem cobertos ou formalmente aceitos
- a mudanca de escopo de email/Brevo sem OTP estiver implementada e validada
