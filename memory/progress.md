# Progress — Operational Snapshot

> Snapshot operacional do estado atual do projeto.
> Este arquivo responde apenas: **"What is ready right now?"**
> Historico cronologico fica em `memory/MODIFICATION_LOG.md`.
> Evolucao e pendencias estruturais ficam em `memory/plans/`.
> Estrutura de modulos/capacidades fica em `kernel/ARCHITECTURE.md`.

---

## Ready Now

- Stack do projeto definida e registrada
- Aplicacao Next.js publicada e validada em Vercel + Neon
- Banco e ORM configurados com Drizzle + Neon
- Migrations versionadas no repositorio
- Cadastro e login do admin implementados
- Confirmacao do admin por link magico implementada
- Criacao de rifa implementada
- Edicao posterior de PIX implementada no painel da rifa
- Edicao posterior do item e das imagens implementada no painel da rifa
- Pagina publica da rifa implementada
- Fluxo do participante sem OTP implementado e validado, com coleta de nome, email, telefone e geracao imediata do numero
- Reserva de cotas com geracao aleatoria de numeros de 5 digitos implementada
- Exibicao de QR Code PIX implementada
- Tela publica simplificada sem grid publica de cotistas
- Confirmacao manual de pagamento pelo admin implementada
- Sorteio auditavel implementado
- Repositorio publicado no GitHub
- Migration `0002_milky_patch` aplicada no banco Neon alvo
- Confirmacao por email via Brevo validada com sucesso
- Fluxo remoto validado pelo usuario sem registro de intercorrencias
- Upload da imagem real agora substitui e persiste automaticamente a imagem principal do item
- Pagina inicial convertida em landing page comercial com destaque para a rifa publicada mais recente
- Painel admin permite editar nome, proposito, beneficiario e valor da cota da rifa
- Painel admin permite enviar email de follow-up por reserva pendente com a acao `Checar pagamento`
- Painel admin permite excluir reserva pendente e sua cota vinculada com a acao `Excluir pendencia`
- Tela publica informa abaixo do copiar PIX que o email de confirmacao nao e automatico
- Validacao em producao concluida com sucesso para os botoes da entrega mais recente
- Painel admin exibe o total de pagamentos confirmados no agrupamento operacional
- Existe uma tela admin separada para simulacao visual do sorteio usando apenas cotas confirmadas

## In Progress Now

- Nenhuma frente estrutural ativa neste momento

## Blocked Now

- Nenhum bloqueio tecnico confirmado neste momento

## Active Risks

- Confirmacao do PIX ainda e manual no MVP
- Ainda nao ha suite automatizada de testes cobrindo o fluxo principal

## Immediate Next Step

- Validar a simulacao com dados reais e definir o fluxo definitivo de sorteio com persistencia do numero vencedor
