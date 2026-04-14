# Setup do Projeto Rifa

## 1. Requisitos locais

- Node.js 20+
- npm 10+
- conta no Neon
- conta no Vercel

## 2. Criar o banco no Neon

1. Acesse o painel do Neon.
2. Crie um novo projeto PostgreSQL.
3. Copie a connection string principal.
4. Salve essa string como `DATABASE_URL`.

## 3. Configurar variaveis locais

1. Copie `.env.example` para `.env.local`.
2. Preencha:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `APP_URL`
   - `RESEND_API_KEY`
   - `SMS_PROVIDER_API_KEY`
   - `SMS_PROVIDER_SENDER`

Observacao:
- Em desenvolvimento, `RESEND_API_KEY=development-preview` exibe o link magico na interface.
- As variaveis de SMS podem ficar como placeholder para usar o OTP em modo preview durante o MVP.

## 4. Instalar dependencias

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm install
```

## 5. Gerar e aplicar a estrutura do banco

Gerar migration:

```bash
npm run db:generate
```

Aplicar migration no banco:

```bash
npm run db:migrate
```

Opcional para desenvolvimento rapido:

```bash
npm run db:push
```

## 6. Validar conexao com o banco

```bash
npm run db:check
```

Ou pela API local:

```bash
curl http://localhost:3000/api/health
```

## 7. Rodar o projeto

```bash
npm run dev
```

Abra `http://localhost:3000`.

## 8. Publicar no Vercel

1. Conecte o repositório no Vercel.
2. Configure as mesmas variaveis de ambiente do `.env.local`.
3. Faça o deploy.
4. Rode `npm run db:migrate` com a `DATABASE_URL` de producao quando o banco estiver pronto.

## 9. Ordem recomendada do MVP

1. Banco e migrations
2. Auth do admin
3. Criacao da rifa
4. OTP do participante
5. Reserva de cotas
6. Confirmacao manual de pagamento
7. Sorteio auditavel

## 10. Fluxo de teste atual

1. Acesse `/cadastrar`
2. Crie o admin
3. Confirme o e-mail pelo link enviado ou pelo preview exibido
4. Acesse `/admin`
5. Crie uma nova rifa em `/admin/rifas/nova`
6. Abra a pagina publica da rifa em `/r/[slug]`
7. Solicite o OTP do participante e conclua a reserva de cotas
8. Volte ao painel da rifa em `/admin/rifas/[id]`
9. Confirme manualmente o pagamento da reserva
10. Execute o sorteio quando houver cotas pagas

## 11. Observacoes do MVP atual

- O OTP do participante funciona com fallback de preview quando o provedor de SMS ainda nao estiver configurado.
- O PIX eh apresentado na pagina publica da rifa e o admin confirma o pagamento manualmente.
- O sorteio considera apenas cotas com pagamento confirmado e grava o resultado no banco.
