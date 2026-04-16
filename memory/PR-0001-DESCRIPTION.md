# Adicionar follow-up de pagamento e sincronizar memoria do projeto

## Objetivo

Adicionar uma nova acao de follow-up para reservas pendentes no painel administrativo e alinhar a documentacao/memoria do projeto com o estado real da aplicacao.

## O que foi feito

### Produto e fluxo

- adicionado botao `Checar pagamento` ao lado de `Confirmar e enviar email` nas reservas pendentes
- criada nova rota para disparar email de follow-up sem alterar o status financeiro da reserva
- criado template de email para perguntar ao participante se houve problema com o PIX ou se deseja desistir
- adicionada mensagem abaixo do botao `Copiar PIX` na tela publica informando que o email de confirmacao nao e automatico

### Memoria e governanca

- `PLAN-0001` encerrado como `DONE`
- `PLAN-0002` encerrado como `DONE`
- `MODIFICATION_LOG.md` normalizado para pt-BR
- decisoes, escopo, requisitos, setup e progresso atualizados para refletir o comportamento real publicado

## Arquivos principais

### Codigo

- `src/features/raffles/components/admin-raffle-details-client.tsx`
- `src/features/raffles/components/pix-payment-card.tsx`
- `src/features/notifications/payment-follow-up-email.ts`
- `src/app/api/admin/raffles/[id]/payments/check/route.ts`

### Memoria e documentacao

- `memory/MODIFICATION_LOG.md`
- `memory/progress.md`
- `memory/decisions/DECISION-002.md`
- `memory/decisions/DECISION-003.md`
- `memory/decisions/DECISION-005.md`
- `docs/project/SCOPE.md`
- `docs/project/REQUIREMENTS.md`
- `docs/project/SETUP.md`
- `memory/plans/PLAN-0001-DONE-rifa-web-platform.md`
- `memory/plans/PLAN-0002-DONE-payment-follow-up-and-public-copy.md`

## Validacao

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Observacoes

- a acao `Checar pagamento` nao marca reserva como paga
- o email de follow-up foi separado do recibo de pagamento para evitar confusao operacional
- a tela publica agora deixa mais claro que o email de confirmacao nao e enviado automaticamente
