# Progress — Operational Snapshot

> Snapshot operacional do estado atual do projeto.
> Este arquivo responde apenas: **"What is ready right now?"**
> Historico cronologico fica em `memory/MODIFICATION_LOG.md`.
> Evolucao e pendencias estruturais ficam em `memory/plans/`.
> Estrutura de modulos/capacidades fica em `kernel/ARCHITECTURE.md`.

---

## Ready Now

- Stack do projeto definida e registrada
- Aplicacao Next.js inicializada e buildando localmente
- Banco e ORM configurados com Drizzle + Neon
- Migrations versionadas no repositorio
- Cadastro e login do admin implementados
- Confirmacao do admin por link magico implementada
- Criacao de rifa implementada
- Edicao posterior de PIX implementada no painel da rifa
- Edicao posterior do item e das imagens implementada no painel da rifa
- Pagina publica da rifa implementada
- Fluxo do participante sem OTP implementado localmente, com coleta de nome, email, telefone e geracao imediata dos numeros
- Reserva de cotas com geracao aleatoria de numeros de 5 digitos implementada
- Exibicao de QR Code PIX implementada
- Grid publica de cotas implementada
- Confirmacao manual de pagamento pelo admin implementada
- Sorteio auditavel implementado
- Repositorio publicado no GitHub
- Migration `0002_milky_patch` aplicada no banco Neon alvo
- Confirmacao por email via Brevo validada com sucesso

## In Progress Now

- Preparacao do deploy remoto em Vercel
- Mudanca de escopo para email via Brevo apos confirmacao manual do PIX validada localmente
- Hardening do MVP retomado apos migracao e teste funcional em ambiente remoto

## Blocked Now

- Nenhum bloqueio tecnico confirmado neste momento

## Active Risks

- Vercel Blob precisa estar configurado no ambiente para upload da imagem real do objeto
- Confirmacao do PIX ainda e manual no MVP
- Upload local de imagem nao e persistente de forma confiavel em Vercel/serverless sem storage dedicado
- Ainda nao ha suite automatizada de testes cobrindo o fluxo principal

## Immediate Next Step

- Testar upload da imagem real com Vercel Blob configurado e concluir deploy Vercel
