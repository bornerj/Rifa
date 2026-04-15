# Requirements

Last updated: 2026-04-15

## Functional Requirements
- [ ] FR-001: O administrador deve poder criar uma nova rifa com nome, proposito, beneficiario, prazo em dias e valor da cota.
- [ ] FR-002: Cada rifa deve possuir um objeto com nome e ate 3 imagens, incluindo uma imagem real do objeto com upload gerenciado pelo sistema e label "Imagem real do objeto".
- [ ] FR-003: O participante deve informar nome, email e telefone celular com DDD para iniciar a participacao.
- [ ] FR-004: O sistema nao deve exigir OTP, SMS ou WhatsApp para confirmar a participacao.
- [ ] FR-005: O participante deve informar quantas cotas deseja adquirir no mesmo fluxo de confirmacao da participacao.
- [ ] FR-006: O sistema deve gerar numeros de cota aleatorios de 5 digitos e vincula-los ao participante e a rifa.
- [ ] FR-007: O sistema deve permitir configurar e editar o PIX depois da criacao da rifa e mostrar o valor total e o QR Code PIX no momento do pagamento.
- [ ] FR-008: O administrador deve conseguir confirmar manualmente quais reservas/cotas foram pagas apos validar o PIX recebido.
- [ ] FR-009: A pagina da rifa deve exibir uma grade/lista de cotistas com uma entrada por cota adquirida.
- [ ] FR-010: Somente o administrador criador da rifa deve poder acessar e executar o sorteio.
- [ ] FR-011: O sorteio deve selecionar um numero vencedor entre as cotas elegiveis registradas.
- [ ] FR-012: O painel administrativo deve permitir editar o nome do item e substituir as URLs das imagens da rifa apos a criacao.
- [ ] FR-013: Apos o participante confirmar a participacao, o sistema deve gerar os numeros, mostrar os numeros na tela e informar que a confirmacao sera enviada por email apos confirmacao do PIX.
- [ ] FR-014: O painel administrativo deve ter uma area em grid com os participantes/reservas e uma acao de confirmar pagamento.
- [ ] FR-015: Ao confirmar manualmente o pagamento, o sistema deve enviar email via Brevo ao participante com recibo, confirmacao do pagamento e os numeros da rifa.

## Non-Functional Requirements
- [ ] NFR-001 Performance: O fluxo principal deve ser otimizado para uso em tela de celular e conexoes moveis.
- [ ] NFR-002 Security: Todas as entradas devem ser validadas com Zod, persistidas via ORM e protegidas contra SQL injection.
- [ ] NFR-003 Reliability: O sorteio deve ser auditavel e executado apenas sobre cotas validas registradas no banco.
- [ ] NFR-004 Reliability: Upload de imagem deve usar armazenamento persistente antes de producao quando o deploy alvo for serverless.

## Constraints
- Budget: priorizar servicos com plano gratuito ou baixo custo inicial
- Timeline: iniciar pelo MVP
- Integrations: Brevo para email transacional, PIX QR Code
- Constraint tecnica: Vercel/serverless nao deve ser tratado como storage persistente para upload local em producao.

## Acceptance Criteria
- [ ] AC-001: Um administrador confirmado por email consegue criar uma rifa completa e visualizar sua pagina publica.
- [ ] AC-002: Um participante consegue informar nome, email, telefone e quantidade de cotas, confirmar a participacao, ver os numeros gerados e visualizar o QR Code PIX sem OTP.
- [ ] AC-003: O administrador consegue ver as reservas em grid, confirmar o pagamento manualmente, disparar email via Brevo com os numeros e executar o sorteio com registro do vencedor.
