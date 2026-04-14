# Rifa

Plataforma web mobile-first para criacao, publicacao e sorteio de rifas online com validacao por telefone, pagamento via PIX e operacao administrativa simples.

## Stack

- Next.js 15
- TypeScript strict
- Tailwind CSS
- Drizzle ORM
- Neon Postgres
- Zod

## O que ja esta pronto

- cadastro e login do admin
- confirmacao do admin por link magico
- criacao de rifa
- pagina publica da rifa
- OTP do participante com modo preview para desenvolvimento
- reserva de cotas com numeros aleatorios de 5 digitos
- exibicao de QR Code PIX
- confirmacao manual de pagamento pelo admin
- sorteio auditavel

## Como rodar localmente

1. Use Node.js 20+
2. Copie `.env.example` para `.env.local`
3. Preencha as variaveis obrigatorias
4. Instale as dependencias
5. Rode as migrations
6. Inicie o projeto

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm install
npm run db:migrate
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

Veja `.env.example`.

Principais variaveis:
- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`
- `RESEND_API_KEY`
- `SMS_PROVIDER_API_KEY`
- `SMS_PROVIDER_SENDER`

## Fluxo principal para teste

1. Acesse `/cadastrar`
2. Crie e confirme o admin
3. Entre no painel em `/admin`
4. Crie uma rifa em `/admin/rifas/nova`
5. Abra a pagina publica em `/r/[slug]`
6. Solicite OTP e reserve cotas
7. Confirme o pagamento no painel da rifa
8. Execute o sorteio

## Documentacao do projeto

- Escopo: `docs/project/SCOPE.md`
- Visao geral: `docs/project/PROJECT_OVERVIEW.md`
- Requisitos: `docs/project/REQUIREMENTS.md`
- Setup: `docs/project/SETUP.md`
- Plano ativo: `memory/plans/PLAN-0001-rifa-web-platform.md`
- Decisoes: `memory/decisions/`

## Status atual

O MVP funcional esta implementado localmente. Ainda faltam o deploy final no Vercel/Neon, a configuracao de um provedor real de SMS e o hardening com testes e rate limit.
