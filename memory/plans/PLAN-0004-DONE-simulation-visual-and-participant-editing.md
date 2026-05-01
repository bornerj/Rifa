# PLAN-0004 — Simulation Visual and Participant Editing

Status: DONE
Date: 2026-05-01
Last updated: 2026-05-01
Type: WEB APP
Priority: High

## Objective

Refinar a tela de simulacao do sorteio para destacar apenas os numeros das cotas, adicionar um disparo manual de email do ganhador para os cadastrados da rifa e incluir, no painel admin, a capacidade de editar nome, telefone e email do participante.

## Situation

- A simulacao atual mostra numero da cota e nome do participante em cada box.
- O usuario quer uma experiencia mais limpa, com apenas o numero visivel e o box final claramente iluminado como ganhador da simulacao.
- O usuario tambem quer um botao para enviar email com o nome do ganhador e o numero sorteado para quem estiver cadastrado na rifa.
- O painel admin hoje exibe dados do participante, mas nao oferece acao de edicao.

## Task

Implementar tres mudancas coordenadas:

1. Na tela `/admin/rifas/[id]/sorteio`, remover o nome do participante dos boxes, deixando apenas o numero da cota e reforcando visualmente o ultimo box parado.
2. Na mesma tela de simulacao, adicionar um botao para enviar email do ganhador aos cadastrados da rifa.
3. No painel admin da rifa ativa, adicionar um botao para editar participante e permitir salvar nome, telefone e email.

## STAR

### Situation

- A simulacao ja possui estado de `active` e `winner`, entao o ajuste principal e visual.
- O novo envio de email depende de definirmos com clareza se a mensagem sera tratada como resultado oficial ou como aviso da simulacao.
- A edicao de participante exige endpoint novo, validacao consistente e atualizacao do payload/tela sem quebrar reservas e tickets ja vinculados.

### Task

- Simplificar a visualizacao da simulacao sem perder a leitura do resultado final.
- Permitir disparo manual de email do ganhador a partir da tela de simulacao.
- Permitir correcao operacional de dados do participante direto no admin.

### Action

- Ajustar o componente de simulacao para renderizar apenas o numero da cota e reforcar o estado final vencedor.
- Criar fluxo de envio de email do ganhador usando o resultado parado na simulacao.
- Mapear o identificador do participante no payload admin.
- Criar endpoint autenticado para atualizar nome, email e telefone do participante.
- Adicionar CTA e UI de edicao no painel admin com feedback de sucesso/erro.

### Result

- A simulacao fica mais fiel ao efeito esperado de painel de numeros.
- O admin consegue disparar um email manual com o nome do ganhador e o numero sorteado para os cadastrados da rifa.
- O admin consegue corrigir dados cadastrais do participante sem sair da rifa ativa.

## Scope

Inclui:
- `src/features/raffles/components/draw-simulation-client.tsx`
- `src/features/raffles/components/admin-raffle-details-client.tsx`
- `src/features/raffles/repository.ts`
- novo fluxo/endpoint de envio do email de ganhador
- novo endpoint admin para atualizar participante

Nao inclui:
- alteracao do sorteio oficial
- auditoria/historico de alteracoes cadastrais
- mudancas no fluxo publico do participante

## Assumptions

1. O botao de editar participante pode aparecer no card da reserva, usando os dados daquela reserva para abrir a edicao.
2. A edicao cadastral deve refletir para o participante daquela rifa como um todo, nao apenas para uma reserva isolada.
3. A validacao de telefone deve seguir a mesma normalizacao ja usada no fluxo publico.
4. O email do ganhador sera disparado manualmente pelo admin usando o resultado atual da simulacao, por meio de um botao especifico `Enviar email oficial`.
5. A gravacao sera habilitada como teste de viabilidade via captura de tela/aba no navegador.

## Action Plan

- [x] Ajustar a tela de simulacao para mostrar apenas numeros e reforcar o box vencedor.
- [x] Adicionar o botao de envio de email do ganhador na pagina de simulacao.
- [x] Implementar o fluxo server-side para enviar o email do ganhador aos cadastrados da rifa.
- [x] Habilitar gravacao de teste da simulacao por captura de tela/aba no navegador.
- [x] Expor o `participantId` no payload administrativo.
- [x] Criar endpoint autenticado para editar nome, email e telefone do participante.
- [x] Adicionar botao e UI de edicao no card da reserva no painel admin.
- [x] Recarregar os dados apos salvar para refletir o cadastro atualizado.
- [x] Atualizar memoria operacional da entrega.
- [x] Validar com `npm run lint`, `npm run typecheck` e `npm run build`.

## Acceptance Criteria

- [x] Cada box da simulacao mostra apenas o numero da cota.
- [x] O ultimo box parado fica claramente iluminado como vencedor da simulacao.
- [x] Existe um botao para enviar email do ganhador na tela de simulacao.
- [x] O envio informa nome do ganhador e numero sorteado para os cadastrados da rifa.
- [x] Existe um botao para editar participante no painel admin.
- [x] O admin consegue salvar nome, telefone e email atualizados.
- [x] As alteracoes persistem e reaparecem apos recarregar os detalhes da rifa.
- [x] O build continua verde.

## Validation Plan

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- teste manual da simulacao visual
- teste manual do envio do email do ganhador
- teste manual da edicao de participante
- teste manual da gravacao por captura da aba/janela

## Risks

- Alterar email do participante impacta o destino de emails futuros.
- Alterar telefone precisa manter consistencia com a normalizacao brasileira.
- Se o mesmo participante tiver mais de uma reserva na rifa, a alteracao precisa refletir de modo consistente em todos os cards.
- O email do ganhador pode ser confundido com resultado oficial se a copy nao deixar claro o contexto desta fase.

## Delivery Notes

- A simulacao agora mostra apenas numeros e usa destaque mais forte no box final vencedor.
- O envio do `email oficial` nao e automatico e depende do clique explicito do admin apos a simulacao.
- A gravacao foi habilitada como teste de viabilidade via captura de tela/aba suportada pelo navegador.

## Git Record of Delivery

- Validacoes executadas:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- Arquivos principais desta entrega:
  - `src/features/raffles/components/draw-simulation-client.tsx`
  - `src/features/raffles/components/admin-raffle-details-client.tsx`
  - `src/features/raffles/repository.ts`
  - `src/app/api/admin/raffles/[id]/participants/[participantId]/route.ts`
  - `src/app/api/admin/raffles/[id]/winner-email/route.ts`
  - `src/features/notifications/winner-official-email.ts`
