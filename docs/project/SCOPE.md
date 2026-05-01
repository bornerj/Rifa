# Escopo do Projeto Rifa

Last updated: 2026-05-01

## Objetivo

Construir uma plataforma web mobile-first para criacao, publicacao, participacao e sorteio de rifas online, com foco em simplicidade operacional, baixo custo inicial e deploy no Vercel.

## Escopo Confirmado do MVP

- Admin com cadastro por email e senha
- Confirmacao do admin por link magico enviado por email
- Criacao de rifa com:
  - nome
  - proposito
  - beneficiario
  - prazo de funcionamento em dias
  - valor da cota
  - identificacao PIX e payload para QR Code
- Cadastro do objeto da rifa com:
  - nome
  - ate 3 imagens
  - ao menos uma imagem real do objeto com label proprio e upload gerenciado pelo sistema
- Fluxo publico do participante com:
  - nome
  - email para recebimento do recibo e dos numeros da rifa
  - telefone celular com DDD
  - geracao de uma cota por confirmacao
  - possibilidade de repetir a acao para gerar novas cotas
  - geracao de numeros aleatorios de 5 digitos
  - exibicao imediata dos numeros gerados
  - aviso de que a confirmacao por email sera enviada apos validacao manual do PIX
  - exibicao do valor total
  - exibicao do QR Code PIX
- Persistencia de:
  - participante
  - rifa
  - reserva
  - cotas geradas
  - valor unitario e total
  - status de pagamento
- Tela publica simplificada, sem grade publica de cotistas no fluxo atual
- Painel administrativo da rifa com:
  - edicao de nome, proposito, beneficiario e valor da cota
  - visualizacao das reservas/participantes em grid operacional
  - confirmacao manual de pagamento apos recebimento do PIX
  - envio de email de follow-up para reserva pendente com a acao `Checar pagamento`
  - exclusao de reserva pendente e da cota vinculada com confirmacao previa das cotas afetadas
  - edicao de nome, email e telefone do participante direto no card da reserva
  - envio de recibo/confirmacao por email via Brevo com os numeros da rifa
  - visualizacao do total de pagamentos confirmados no agrupamento operacional
- Tela separada de simulacao do sorteio com:
  - exibicao apenas das cotas com pagamento confirmado
  - boxes contendo apenas o numero da cota
  - destaque visual do ultimo numero parado como ganhador da simulacao
  - botao manual `Enviar email oficial` com nome do ganhador e numero sorteado
  - gravacao de teste por captura da aba/janela para avaliar a viabilidade do video da roleta
- Sorteio restrito ao admin criador da rifa
- Registro auditavel do sorteio com vencedor persistido no banco

## Regras de Produto Confirmadas

- A interface deve priorizar uso em tela de celular
- O deploy-alvo do MVP e a Vercel
- O banco deve ter plano gratuito ou custo inicial baixo
- As entradas devem ser validadas com Zod
- A persistencia deve usar ORM
- A aplicacao deve adotar protecao contra SQL injection por meio de consultas parametrizadas e validacao de entrada
- O participante nao deve passar por OTP, SMS ou WhatsApp no MVP revisado
- Brevo sera usado para email transacional de recibo/confirmacao apos pagamento confirmado pelo admin
- Brevo tambem sera usado para o disparo manual do `email oficial` do resultado na tela de simulacao
- Alteracao de valor da cota vale somente para reservas futuras; reservas existentes preservam valor unitario e total ja persistidos
- Exclusao de pendencia remove apenas a reserva nao paga e a cota vinculada, preservando o cadastro do participante

## Fora do Escopo Inicial

- Confirmacao automatica de pagamento PIX
- OTP, SMS ou WhatsApp como canal de confirmacao do participante
- Marketplace publico de rifas
- Multi-admin por rifa ou por organizacao
- Integracoes de antifraude avancadas
- Upload local em filesystem serverless como solucao definitiva de producao

## Sugestoes Incorporadas na Definicao

- Usar Next.js em vez de outra stack para facilitar deploy no Vercel
- Usar Neon Postgres com Drizzle ORM no lugar de uma opcao mais pesada para serverless
- Salvar payload do PIX em vez de imagem fixa de QR Code
- Tratar o sorteio como selecao auditavel no banco, deixando a animacao apenas como experiencia visual
- Remover a verificacao por OTP para reduzir atrito do participante
- Enviar confirmacao e recibo por email somente apos confirmacao manual do PIX recebido
- Separar a simulacao do sorteio em uma tela dedicada antes de promover o fluxo para o sorteio oficial
- Exigir confirmacao visual antes de excluir uma pendencia do painel administrativo

## Referencias

- `memory/decisions/DECISION-001.md`
- `memory/decisions/DECISION-002.md`
- `memory/decisions/DECISION-003.md`
- `memory/decisions/DECISION-004.md`
- `memory/decisions/DECISION-005.md`
- `docs/project/PROJECT_OVERVIEW.md`
- `docs/project/REQUIREMENTS.md`
