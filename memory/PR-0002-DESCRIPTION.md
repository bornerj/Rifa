# Limpar pendencias no admin e separar a simulacao do sorteio

## Objetivo

Melhorar a operacao do admin na rifa ativa, permitindo excluir reservas nao pagas, destacando a contagem de pagamentos confirmados e movendo a experiencia de sorteio para uma tela separada de simulacao.

## O que foi feito

### Painel administrativo

- adicionado o botao `Excluir pendencia` logo apos `Checar pagamento` nas reservas nao pagas
- adicionado um passo extra de confirmacao visual antes da exclusao, listando as cotas que serao removidas
- criado endpoint para excluir a reserva pendente e a cota vinculada
- mantido o cadastro do participante intacto, mesmo apos a exclusao da pendencia
- exibido o total de pagamentos confirmados junto ao agrupamento `Pagamentos confirmados`
- substituido o disparo direto do sorteio no painel principal por um acesso para a tela separada de simulacao

### Simulacao do sorteio

- criada a rota admin `/admin/rifas/[id]/sorteio`
- criada tela dedicada com nome da rifa, painel unico de numeros e botao `Simular`
- implementada animacao sequencial com desaceleracao gradual ate a parada final
- limitada a simulacao apenas as cotas com pagamento confirmado
- mantido o comportamento como simulacao visual, sem gravar vencedor e sem alterar o status da rifa

## Arquivos principais

- `src/features/raffles/components/admin-raffle-details-client.tsx`
- `src/app/api/admin/raffles/[id]/reservations/[reservationId]/route.ts`
- `src/features/raffles/components/draw-simulation-client.tsx`
- `src/app/admin/rifas/[id]/sorteio/page.tsx`
- `memory/plans/PLAN-0003-DONE-admin-cleanup-and-draw-simulation.md`

## Validacao

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Observacoes

- a exclusao protege reservas com pagamento confirmado e nao remove participantes
- a exclusao agora exige confirmacao explicita no botao `SIM` depois da conferencia das cotas afetadas
- a nova tela ainda nao executa o sorteio oficial
- o sorteio definitivo com persistencia do numero vencedor fica para a proxima fase
