# PLAN-0003 — Admin Cleanup and Draw Simulation

Status: DONE
Date: 2026-05-01
Last updated: 2026-05-01
Type: WEB APP
Priority: High

## Objective

Evoluir o painel da rifa ativa com limpeza operacional de pendencias e criar uma tela separada de simulacao visual do sorteio, sem ainda executar o sorteio definitivo.

## Situation

- O painel admin atual permite confirmar pagamento e enviar email, alem do follow-up `Checar pagamento`.
- O sorteio real hoje acontece diretamente do painel admin e grava imediatamente o vencedor em `draws`, alterando o status da rifa para `drawn`.
- O usuario agora quer:
  - excluir reservas nao pagas da base operacional;
  - enxergar a contagem total de pagamentos confirmados no painel;
  - separar a experiencia de sorteio em uma tela dedicada com simulacao visual estilo roleta, para aprovacao antes do fluxo definitivo.

## Task

Implementar o proximo slice com tres frentes coordenadas:

1. No painel admin da rifa ativa, adicionar o botao `Excluir pendencia` logo apos `Checar pagamento` para reservas nao pagas.
2. Na secao `Pagamentos confirmados`, exibir tambem o total de pagamentos confirmados.
3. Criar uma tela separada de simulacao de sorteio com:
   - nome da rifa;
   - painel unico com todas as cotas renderizadas em boxes arredondados;
   - botao `Simular`;
   - animacao que percorre as cotas em sequencia, reduzindo a velocidade gradualmente ate parar.

## STAR

### Situation

- A exclusao precisa respeitar ownership da rifa e nao pode remover pagamentos confirmados.
- A simulacao precisa ser visualmente confiavel, mas sem persistir resultado nem encerrar a rifa nesta fase.
- O fluxo atual mistura no mesmo painel a visao operacional da rifa e o disparo do sorteio real.

### Task

- Separar melhor operacao administrativa e experiencia de sorteio.
- Manter integridade de dados ao remover pendencias.
- Entregar uma simulacao fiel o suficiente para aprovacao visual, sem alterar o estado oficial do sorteio.

### Action

- Criar endpoint seguro para excluir reservas pendentes e suas cotas relacionadas.
- Atualizar o payload do admin para suportar contagens resumidas e dados uteis da nova tela.
- Criar rota admin dedicada para simulacao do sorteio.
- Implementar interface e animacao client-side sem gravacao definitiva.
- Preservar o sorteio real existente sem executa-lo automaticamente nesta etapa.

### Result

- O admin consegue limpar reservas pendentes antigas.
- O painel mostra rapidamente quantos pagamentos ja foram confirmados.
- A simulacao de sorteio pode ser revisada e aprovada antes da implementacao do fluxo definitivo com persistencia do numero vencedor.

## Scope

Inclui:
- UI do admin em `src/features/raffles/components/admin-raffle-details-client.tsx`
- Novo endpoint para exclusao de pendencias
- Ajustes em repository/payload do admin
- Nova rota admin dedicada para simulacao do sorteio
- Novo componente client-side para animacao da simulacao

Nao inclui:
- migracao para persistir numero vencedor diretamente em `raffles`
- substituicao completa do modelo atual de `draws`
- execucao definitiva do sorteio pela tela nova
- encerramento da rifa com ganhador nesta entrega

## Assumptions Confirmed

1. `Excluir pendencia` vai remover da base a reserva pendente e as cotas vinculadas a ela.
2. O cadastro do participante nunca deve ser apagado por esta acao.
3. A tela de simulacao deve exibir apenas cotas com pagamento confirmado.

## Action Plan

- [x] Validar as premissas de exclusao e elegibilidade visual da simulacao.
- [x] Criar endpoint `delete` para reserva pendente com verificacao de ownership e bloqueio para reservas pagas.
- [x] Ajustar consultas/payloads do admin para mostrar contagem de pagamentos confirmados.
- [x] Adicionar o botao `Excluir pendencia` no card de reserva pendente com feedback de sucesso/erro.
- [x] Criar rota admin dedicada para simulacao do sorteio.
- [x] Construir componente da tela de simulacao com grid/painel unico de cotas e destaque visual progressivo.
- [x] Implementar rotina de simulacao sequencial com desaceleracao ate parada final.
- [x] Atualizar memoria operacional ao concluir.
- [x] Validar com `npm run lint`, `npm run typecheck` e `npm run build`.

## Acceptance Criteria

- [x] Cada reserva nao paga passa a exibir `Excluir pendencia`.
- [x] O clique em `Excluir pendencia` nunca apaga reserva paga.
- [x] As cotas da reserva excluida deixam de aparecer no admin e deixam de competir em qualquer simulacao futura.
- [x] O agrupamento `Pagamentos confirmados` mostra o total logo ao lado do titulo.
- [x] Existe uma tela separada para simulacao do sorteio acessivel pelo admin da rifa.
- [x] A simulacao nao grava vencedor nem altera o status da rifa.
- [x] A tela deixa visualmente claro quais numeros estao no painel e qual numero terminou destacado.
- [x] O build continua verde.

## Validation Plan

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- teste manual de exclusao de reserva pendente
- teste manual para garantir bloqueio de exclusao em reserva paga
- teste manual da simulacao visual com varias cotas

## Risks

- Exclusao fisica de reserva e cotas pode conflitar com expectativa de auditoria futura se o criterio nao estiver claro.
- Mostrar cotas pendentes na tela de simulacao sem diferenciar elegibilidade pode gerar interpretacao errada do sorteio real.
- Animacao client-side precisa permanecer leve o suficiente para listas maiores.

## Delivery Notes

- O painel admin deixou de oferecer disparo direto do sorteio oficial nesta fase e agora aponta para a tela separada de simulacao.
- A exclusao operacional remove apenas a reserva pendente e a cota vinculada, preservando o cadastro do participante.
- A tela de simulacao usa somente cotas com `paymentStatus = confirmed` e destaca visualmente o numero final sem persistir resultado.

## Git Record of Delivery

- Validacoes executadas:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- Arquivos principais desta entrega:
  - `src/features/raffles/components/admin-raffle-details-client.tsx`
  - `src/app/api/admin/raffles/[id]/reservations/[reservationId]/route.ts`
  - `src/features/raffles/components/draw-simulation-client.tsx`
  - `src/app/admin/rifas/[id]/sorteio/page.tsx`
