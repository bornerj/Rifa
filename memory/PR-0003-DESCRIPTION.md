# Refinar simulacao da rifa e liberar edicao de participante

## Objetivo

Melhorar a tela de simulacao do sorteio para focar nos numeros, habilitar o disparo manual do `email oficial`, testar a gravacao da roleta e permitir a edicao cadastral do participante direto no admin.

## O que foi feito

### Simulacao do sorteio

- removido o nome do participante dos boxes da simulacao
- reforcado visualmente o ultimo box parado como numero vencedor da simulacao
- adicionado o botao manual `Enviar email oficial`
- criado endpoint que envia aos cadastrados da rifa o nome do ganhador e o numero sorteado
- habilitada a gravacao de teste da simulacao por captura de tela/aba no navegador

### Participante no admin

- exposto o `participantId` no payload administrativo
- criado endpoint para atualizar nome, email e telefone do participante
- adicionado botao `Editar participante` no card da reserva
- criada UI para editar e salvar os dados cadastrais sem sair da rifa

## Arquivos principais

- `src/features/raffles/components/draw-simulation-client.tsx`
- `src/features/raffles/components/admin-raffle-details-client.tsx`
- `src/features/raffles/repository.ts`
- `src/features/participants/schemas.ts`
- `src/features/notifications/winner-official-email.ts`
- `src/app/api/admin/raffles/[id]/participants/[participantId]/route.ts`
- `src/app/api/admin/raffles/[id]/winner-email/route.ts`

## Validacao

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Observacoes

- o `email oficial` depende de clique manual e nao e disparado automaticamente
- a gravacao depende de suporte do navegador e permissao do usuario para capturar a aba/janela
- a promocao da simulacao para sorteio definitivo continua como fase separada
