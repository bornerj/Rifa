# Progress — Operational Snapshot

> Snapshot operacional do estado atual do projeto.
> Este arquivo responde apenas: **"What is ready right now?"**
> Historico cronologico fica em `memory/MODIFICATION_LOG.md`.
> Evolucao e pendencias estruturais ficam em `memory/plans/`.
> Estrutura de modulos/capacidades fica em `kernel/ARCHITECTURE.md`.

---

## Ready Now

- Stack do projeto definida e registrada
- Aplicacao Next.js inicializada e buildando localmente
- Banco e ORM configurados com Drizzle + Neon
- Migrations versionadas no repositorio
- Cadastro e login do admin implementados
- Confirmacao do admin por link magico implementada
- Criacao de rifa implementada
- Pagina publica da rifa implementada
- Fluxo do participante com OTP implementado
- Reserva de cotas com geracao aleatoria de numeros de 5 digitos implementada
- Exibicao de QR Code PIX implementada
- Grid publica de cotas implementada
- Confirmacao manual de pagamento pelo admin implementada
- Sorteio auditavel implementado
- Repositorio publicado no GitHub

## In Progress Now

- Preparacao do deploy remoto em Neon + Vercel
- Hardening do MVP

## Blocked Now

- Nenhum bloqueio tecnico confirmado neste momento

## Active Risks

- OTP em producao ainda depende da configuracao de um provedor real de SMS
- Confirmacao do PIX ainda e manual no MVP
- Ainda nao existe rate limiting robusto para abuso de OTP
- Ainda nao ha suite automatizada de testes cobrindo o fluxo principal

## Immediate Next Step

- Configurar Neon, aplicar migrations no banco alvo e concluir o primeiro deploy no Vercel
