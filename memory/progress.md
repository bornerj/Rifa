# Progress — Current Module State

> Current state of the project. Updated after each completed task.
> Complements `memory/MODIFICATION_LOG.md` (chronological history).
> This file answers the question: **"What is ready right now?"**

---

## Modules

<!-- Available states: stable | in-progress | blocked | planned | deprecated -->
<!-- Update this file whenever a PLAN-XXXX is marked as DONE -->

| Architecture (SFK) | stable | 2026-04-06 | Dicionário técnico e limpeza de docs/config |
| Audit Protocol     | stable | 2026-04-06 | Relocado para memory/logs/ com roteamento |
| Rifa Platform      | in-progress | 2026-04-13 | Stack, requisitos e plano MVP definidos |
| MVP Foundation     | stable | 2026-04-13 | Next.js, Drizzle, migration inicial, env e setup documentados |
| Admin Auth         | stable | 2026-04-14 | Cadastro, login, sessao e confirmacao por link magico |
| Raffle Creation    | stable | 2026-04-14 | Painel admin, criacao persistida e pagina publica inicial |
| Participant Reservations | stable | 2026-04-14 | OTP preview/SMS, reserva de cotas e grid publico |
| Admin Operations   | stable | 2026-04-14 | Confirmacao manual de pagamento e sorteio auditavel |

<!-- Example filled in:
| Module              | State       | Updated    | Notes                                         |
|---------------------|-------------|------------|-----------------------------------------------|
| Authentication      | stable      | 2026-03-20 | JWT + refresh token implemented               |
| Dashboard           | stable      | 2026-03-22 | Filters, pagination, and CSV export           |
| Billing (Stripe)    | in-progress | 2026-03-25 | Webhook and portal working; retry pending     |
| PDF Reports         | planned     | —          | Waiting for approved design                   |
| Push Notifications  | blocked     | 2026-03-18 | Blocked by infra decision (DECISION-004)      |
| API v1 (legacy)     | deprecated  | 2026-02-28 | Replaced by v2 in March                       |
-->

---

## Technical Debt

<!-- Severity: critical | medium | low -->

| Area | Debt | Severity |
|------|------|----------|
| Messaging | OTP em producao ainda depende da configuracao de um provedor real de SMS | medium |
| Payments | Confirmacao do PIX ainda eh manual no MVP, sem conciliacao automatica | medium |

<!-- Example filled in:
| Area          | Debt                                             | Severity |
|---------------|--------------------------------------------------|----------|
| Auth          | Refresh token without rotation — replay-vulnerable | critical |
| Database      | Missing index on `orders.user_id`               | medium   |
| Frontend      | 12 components without explicit TypeScript types  | low      |
| Tests         | Billing services without error coverage          | medium   |
-->

---

## Recent Activity

<!-- Log of completed tasks. Summarize entries older than 30 days. -->
<!-- Format: - YYYY-MM-DD: [what was done] (PLAN-XXXX or point-in-time) -->

- 2026-04-06: Consolidação do Core SFK (project.toml expandido, limpeza de docs/config, realocação de auditoria) (DONE)
- 2026-04-13: Definicao de produto, stack e plano MVP da plataforma Rifa (PLAN-0001 em progresso)
- 2026-04-13: Scaffold tecnico do MVP com banco, ORM, migration inicial e endpoint de health (point-in-time)
- 2026-04-14: Auth do admin, criacao de rifa e publicacao inicial prontos para teste no Vercel (point-in-time)
- 2026-04-14: Fluxo do participante, confirmacao manual de pagamento e sorteio implementados e com build validado (point-in-time)

<!-- Example filled in:
- 2026-03-25: Implemented CSV export in Dashboard (PLAN-0012 DONE)
- 2026-03-22: Fixed pagination bug in the contract listing (point-in-time, ERR-0008)
- 2026-03-20: JWT authentication with refresh token completed (PLAN-0010 DONE)
- 2026-03-14: Initial project setup — base stack and infrastructure (PLAN-0001 DONE)
-->
