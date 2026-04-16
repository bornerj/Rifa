# PLAN-0002 — Payment Follow-up and Public Copy

Status: DONE
Date: 2026-04-16
Last updated: 2026-04-16
Type: WEB APP
Priority: High

## Objective

Adicionar uma nova acao de follow-up de pagamento no painel administrativo e melhorar a copy da tela publica para alinhar expectativa do participante sobre a confirmacao por email.

## Situation

- A grade operacional do admin ja permite confirmar pagamento e enviar o recibo via email.
- A tela publica ja mostra o PIX e o fluxo de participacao, mas ainda nao orienta explicitamente que a confirmacao por email nao e automatica.
- O usuario confirmou que o deploy em Vercel + Neon esta funcionando, o envio por Brevo esta saudavel e o `PLAN-0001` pode ser encerrado.

## Task

Implementar o proximo slice com dois resultados visiveis:

1. Na grid de confirmacao em lote do admin, ao lado do botao `Confirmar e enviar email`, criar o botao `Checar pagamento`.
2. Ao clicar em `Checar pagamento`, enviar email ao participante informando que a cota esta reservada, mas o PIX ainda nao foi identificado, perguntando se houve algum problema ou se deseja desistir.
3. Na tela publica, abaixo do botao de copiar PIX, exibir a mensagem:
   `Voce recebera um email confirmando seus dados e o numero do sorteio. Esse processo e feito duas vezes ao dia, nao e automatico. Aguarde um pouco que sera enviado.`

## Action Plan

- [x] Mapear o componente e a rota corretos para a nova acao de follow-up sem quebrar o fluxo atual de confirmacao de pagamento.
- [x] Criar a logica de envio do novo email de follow-up para reservas pendentes.
- [x] Garantir que o email use os numeros ja reservados para o participante.
- [x] Adicionar o botao `Checar pagamento` no card de reserva pendente no admin.
- [x] Exibir feedback visual de sucesso/erro ao admin apos a tentativa de envio.
- [x] Inserir a nova mensagem de orientacao abaixo do botao de copiar PIX na experiencia publica.
- [x] Atualizar documentacao/memoria operacional com a nova feature quando concluida.
- [x] Validar com `npm run lint`, `npm run typecheck` e `npm run build`.

## Result Expected

- O admin consegue cobrar ou confirmar pendencias de pagamento sem marcar a reserva como paga.
- O participante recebe um email educado com referencia ao numero reservado.
- A tela publica passa a alinhar melhor a expectativa sobre o prazo do email de confirmacao.

## Scope

Inclui:
- UI do admin em `src/features/raffles/components/admin-raffle-details-client.tsx`
- Endpoint ou extensao server-side para disparar o email de follow-up
- Template/conteudo do novo email transacional
- Ajuste de copy na tela publica / card de PIX

Nao inclui:
- conciliacao automatica de PIX
- automacao de fila ou agenda real de envio duas vezes ao dia
- alteracao do fluxo de confirmacao manual existente

## Acceptance Criteria

- [x] Cada reserva pendente passa a exibir o botao `Checar pagamento`.
- [x] O clique em `Checar pagamento` nao altera o status financeiro da reserva.
- [x] O email enviado menciona pelo menos um numero reservado da pessoa e pergunta se houve algum problema com o PIX ou se deseja desistir.
- [x] A tela publica mostra a nova mensagem logo abaixo da acao de copiar PIX.
- [x] O build continua verde.

## Validation Plan

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- teste manual do botao `Checar pagamento` em reserva pendente
- teste manual da copy visivel na tela publica

## Risks

- Reservas historicas com mais de um numero podem exigir copy plural no email.
- O novo email nao deve ser confundido com confirmacao de pagamento.
- A copy publica nao deve prometer automacao que o sistema ainda nao executa.

## Delivery Notes

- O novo email foi implementado separadamente do recibo de pagamento para evitar confusao operacional.
- A nova rota administrativa ficou em `src/app/api/admin/raffles/[id]/payments/check/route.ts`.
- A copy publica foi aplicada no card de PIX em `src/features/raffles/components/pix-payment-card.tsx`.

## Git Record of Delivery

- Validacoes executadas:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- Arquivos principais desta entrega:
  - `src/features/notifications/payment-follow-up-email.ts`
  - `src/app/api/admin/raffles/[id]/payments/check/route.ts`
  - `src/features/raffles/components/admin-raffle-details-client.tsx`
  - `src/features/raffles/components/pix-payment-card.tsx`
