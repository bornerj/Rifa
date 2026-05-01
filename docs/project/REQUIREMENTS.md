# Requirements

Last updated: 2026-05-01

## Functional Requirements
- [ ] FR-001: O administrador deve poder criar uma nova rifa com nome, proposito, beneficiario, prazo em dias e valor da cota.
- [ ] FR-002: Cada rifa deve possuir um objeto com nome e ate 3 imagens, incluindo uma imagem real do objeto com upload gerenciado pelo sistema e label "Imagem real do objeto".
- [ ] FR-003: O participante deve informar nome, email e telefone celular com DDD para iniciar a participacao.
- [ ] FR-004: O sistema nao deve exigir OTP, SMS ou WhatsApp para confirmar a participacao.
- [ ] FR-005: O participante deve conseguir gerar uma cota por confirmacao e repetir a acao quando quiser entrar novamente na rifa.
- [ ] FR-006: O sistema deve gerar numeros de cota aleatorios de 5 digitos e vincula-los ao participante e a rifa.
- [ ] FR-007: O sistema deve permitir configurar e editar o PIX depois da criacao da rifa e mostrar o valor total e o QR Code PIX no momento do pagamento.
- [ ] FR-008: O administrador deve conseguir confirmar manualmente quais reservas/cotas foram pagas apos validar o PIX recebido.
- [ ] FR-009: A pagina publica da rifa nao deve expor uma grade/lista publica de cotistas no fluxo atual.
- [ ] FR-010: Somente o administrador criador da rifa deve poder acessar e executar o sorteio.
- [ ] FR-011: O sorteio deve selecionar um numero vencedor entre as cotas elegiveis registradas.
- [ ] FR-012: O painel administrativo deve permitir editar o nome do item e substituir as URLs das imagens da rifa apos a criacao.
- [ ] FR-013: Apos o participante confirmar a participacao, o sistema deve gerar os numeros, mostrar os numeros na tela e informar que a confirmacao sera enviada por email apos confirmacao do PIX.
- [ ] FR-014: O painel administrativo deve ter uma area em grid com os participantes/reservas e uma acao de confirmar pagamento.
- [ ] FR-015: Ao confirmar manualmente o pagamento, o sistema deve enviar email via Brevo ao participante com recibo, confirmacao do pagamento e os numeros da rifa.
- [ ] FR-016: O administrador deve conseguir editar nome, proposito, beneficiario e valor da cota da rifa apos a criacao.
- [ ] FR-017: Alteracoes no valor da cota devem valer apenas para novas reservas, preservando os valores ja registrados nas reservas existentes.
- [ ] FR-018: O painel administrativo deve permitir enviar um email de follow-up para reservas pendentes por meio da acao `Checar pagamento`, sem alterar o status financeiro da reserva.
- [ ] FR-019: O painel administrativo deve permitir excluir uma reserva pendente e sua cota vinculada somente apos exibir uma confirmacao com as cotas que serao removidas.
- [ ] FR-020: O painel administrativo deve mostrar o total de pagamentos confirmados no agrupamento operacional da rifa.
- [ ] FR-021: O painel administrativo deve permitir editar nome, email e telefone do participante diretamente a partir do card da reserva.
- [ ] FR-022: O sistema deve oferecer uma tela separada de simulacao do sorteio exibindo apenas as cotas com pagamento confirmado.
- [ ] FR-023: Cada box da simulacao deve mostrar apenas o numero da cota e destacar visualmente o ultimo numero parado como vencedor da simulacao.
- [ ] FR-024: A tela de simulacao deve permitir disparar manualmente um `email oficial` aos cadastrados da rifa com o nome do ganhador e o numero sorteado.
- [ ] FR-025: A tela de simulacao deve permitir gravacao de teste por captura da aba ou janela, para avaliar a viabilidade do video da roleta.

## Non-Functional Requirements
- [ ] NFR-001 Performance: O fluxo principal deve ser otimizado para uso em tela de celular e conexoes moveis.
- [ ] NFR-002 Security: Todas as entradas devem ser validadas com Zod, persistidas via ORM e protegidas contra SQL injection.
- [ ] NFR-003 Reliability: O sorteio deve ser auditavel e executado apenas sobre cotas validas registradas no banco.
- [ ] NFR-004 Reliability: Upload de imagem deve usar armazenamento persistente antes de producao quando o deploy alvo for serverless.
- [ ] NFR-005 Usability: A exclusao de pendencias deve exigir uma etapa explicita de confirmacao visual antes da remocao dos dados.
- [ ] NFR-006 Reliability: O `email oficial` do ganhador nao deve ser enviado automaticamente; ele depende de acao manual explicita do administrador.

## Constraints
- Budget: priorizar servicos com plano gratuito ou baixo custo inicial
- Timeline: iniciar pelo MVP
- Integrations: Brevo para email transacional, PIX QR Code
- Constraint tecnica: Vercel/serverless nao deve ser tratado como storage persistente para upload local em producao.

## Acceptance Criteria
- [ ] AC-001: Um administrador confirmado por email consegue criar uma rifa completa e visualizar sua pagina publica.
- [ ] AC-002: Um participante consegue informar nome, email e telefone, confirmar a participacao, ver o numero gerado e visualizar o QR Code PIX sem OTP.
- [ ] AC-003: O administrador consegue ver as reservas em grid, confirmar o pagamento manualmente, disparar email via Brevo com os numeros e gerenciar follow-up/exclusao operacional de pendencias.
- [ ] AC-004: O administrador consegue abrir uma tela separada de simulacao, visualizar apenas os numeros das cotas confirmadas, ver o numero final destacado e disparar manualmente o `email oficial`.
- [ ] AC-005: O administrador consegue editar nome, email e telefone do participante e rever os dados atualizados ao recarregar a rifa.
