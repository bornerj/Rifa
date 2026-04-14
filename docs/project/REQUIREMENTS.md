# Requirements

Last updated: 2026-04-14

## Functional Requirements
- [ ] FR-001: O administrador deve poder criar uma nova rifa com nome, proposito, beneficiario, prazo em dias e valor da cota.
- [ ] FR-002: Cada rifa deve possuir um objeto com nome e ate 3 imagens por URL no MVP.
- [ ] FR-003: O participante deve informar nome e telefone celular com DDD para iniciar a participacao.
- [ ] FR-004: O sistema deve enviar um codigo OTP de 6 digitos para validar o telefone do participante.
- [ ] FR-005: Apos validar o telefone, o participante deve informar quantas cotas deseja adquirir.
- [ ] FR-006: O sistema deve gerar numeros de cota aleatorios de 5 digitos e vincula-los ao participante e a rifa.
- [ ] FR-007: O sistema deve mostrar o valor total e o QR Code PIX da rifa para pagamento.
- [ ] FR-008: O administrador deve conseguir confirmar manualmente quais cotas foram pagas.
- [ ] FR-009: A pagina da rifa deve exibir uma grade/lista de cotistas com uma entrada por cota adquirida.
- [ ] FR-010: Somente o administrador criador da rifa deve poder acessar e executar o sorteio.
- [ ] FR-011: O sorteio deve selecionar um numero vencedor entre as cotas elegiveis registradas.

## Non-Functional Requirements
- [ ] NFR-001 Performance: O fluxo principal deve ser otimizado para uso em tela de celular e conexoes moveis.
- [ ] NFR-002 Security: Todas as entradas devem ser validadas com Zod, persistidas via ORM e protegidas contra SQL injection.
- [ ] NFR-003 Reliability: O sorteio deve ser auditavel e executado apenas sobre cotas validas registradas no banco.

## Constraints
- Budget: priorizar servicos com plano gratuito ou baixo custo inicial
- Timeline: iniciar pelo MVP
- Integrations: provedor de email transacional, provedor de SMS OTP, PIX QR Code

## Acceptance Criteria
- [ ] AC-001: Um administrador confirmado por email consegue criar uma rifa completa e visualizar sua pagina publica.
- [ ] AC-002: Um participante consegue validar o telefone, reservar cotas, visualizar o QR Code PIX e aparecer corretamente na grade da rifa.
- [ ] AC-003: O administrador consegue marcar pagamento manualmente e executar o sorteio com registro do vencedor.
