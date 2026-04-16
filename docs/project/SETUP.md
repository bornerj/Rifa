# Setup do Projeto Rifa

## 1. Objetivo desta etapa

Subir o MVP no ambiente remoto com a ordem correta:

1. criar o banco no Neon
2. preparar as variaveis
3. aplicar migrations no banco alvo
4. conectar o repositorio no Vercel
5. fazer o primeiro deploy
6. validar o fluxo publicado

## 2. Requisitos locais

- Node.js 20+
- npm 10+
- conta no Neon
- conta no Vercel
- repositorio ja publicado no GitHub

## 3. Ordem correta de deploy

Nao comecar pelo Vercel.

A ordem recomendada para este projeto e:

1. Neon
2. variaveis de ambiente
3. migration no banco remoto
4. Vercel
5. validacao do app publicado

Importante:
- Os passos `Instalar dependencias`, `Aplicar a estrutura no banco remoto`, `Validar conexao com o banco` e `Rodar localmente antes do deploy` sao executados na sua maquina local.
- Eles devem acontecer depois de criar o banco no Neon e preparar o `.env.local`.
- Eles devem acontecer antes de criar/configurar o projeto no Vercel.

## 4. Passo 1 — Criar o banco no Neon

1. Acesse o painel do Neon.
2. Crie um novo projeto PostgreSQL.
3. Copie a connection string principal.
4. Abra o arquivo `.env.local`.
5. Cole essa string em `DATABASE_URL=...`.

Resultado esperado:
- banco criado
- `DATABASE_URL` ja preparada no `.env.local`

### Qual string copiar da tela do Neon

Quando o Neon mostrar varias opcoes de conexao, use esta:

- `DATABASE_URL`
  - escolha a opcao marcada como `Recommended for most uses`

Nao e necessario preencher agora:

- `DATABASE_URL_UNPOOLED`
- `PGHOST`
- `PGHOST_UNPOOLED`
- `PGUSER`
- `PGDATABASE`
- `PGPASSWORD`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_PRISMA_URL`

Observacao:
- `DATABASE_URL_UNPOOLED` pode ser guardada como opcao de reserva se algum comando especifico de migration tiver problema com pooler, mas nao e a escolha principal do setup deste projeto.

### Como preencher o wizard do Neon

Ao criar o projeto no Neon, use esta referencia:

- `Region`
  - escolha a regiao mais proxima da regiao onde o projeto sera publicado no Vercel
  - objetivo: reduzir latencia entre app e banco
- `Auth`
  - desative, pule ou deixe como `None`
  - motivo: a autenticacao deste projeto e feita pela propria aplicacao, nao pelo Neon Auth
- `Launch`
  - use a opcao padrao/default para criar o projeto agora
  - nao e necessario fluxo avancado nessa etapa do MVP
- `Scale`
  - use a opcao padrao/free/default do Neon
  - para o MVP, nao ha necessidade de configuracao avancada de escala

Escolha recomendada para este projeto:
- regiao alinhada com o Vercel
- auth desativado
- launch padrao
- scale padrao/free

## 5. Passo 2 — Configurar variaveis locais

O projeto ja pode usar um `.env.local` local com placeholders seguros.

Preencha:
- `DATABASE_URL`
  - use: connection string do Neon
- `AUTH_SECRET`
  - use: string longa e aleatoria
- `APP_URL`
  - local: `http://localhost:3000`
  - Vercel: URL publica do projeto
- `BREVO_SMTP_HOST`
  - use: `smtp-relay.brevo.com`
- `BREVO_SMTP_PORT`
  - use: `587`
- `BREVO_SMTP_USER`
  - use: login SMTP exibido no Brevo
- `BREVO_SMTP_KEY`
  - use: chave SMTP do Brevo
- `BREVO_SENDER_EMAIL`
  - use: email remetente cadastrado/validado no Brevo
- `BREVO_SENDER_NAME`
  - use: nome do remetente, por exemplo `Rifa`
- `BLOB_READ_WRITE_TOKEN`
  - use: token do Vercel Blob para upload persistente das imagens

Observacoes:
- Sem as variaveis do Brevo, o envio de email entra em modo preview interno.
- Sem `BLOB_READ_WRITE_TOKEN`, o upload da imagem real do objeto nao funciona em ambiente Vercel.
- `NODE_ENV=development` deve permanecer no ambiente local.
- O `.env.local` e local da maquina e nao deve ser versionado.

Modelo de escolha rapida:

```env
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=<login-smtp-do-brevo>
BREVO_SMTP_KEY=<chave-smtp-do-brevo>
BREVO_SENDER_EMAIL=<email-remetente-validado>
BREVO_SENDER_NAME=Rifa
BLOB_READ_WRITE_TOKEN=<token-do-vercel-blob>
```

## 6. Passo 3 — Instalar dependencias

Onde executar:
- localmente, na raiz do projeto, na sua maquina

Quando executar:
- depois de criar o banco no Neon
- depois de preencher o `.env.local`
- antes de configurar o projeto no Vercel

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm install
```

## 7. Passo 4 — Aplicar a estrutura no banco remoto

Onde executar:
- localmente, na raiz do projeto, na sua maquina

Quando executar:
- depois de criar o banco no Neon
- depois de preencher `DATABASE_URL` no `.env.local`
- antes do primeiro deploy no Vercel

Observacao:
- o `drizzle.config.ts` do projeto carrega `.env.local` automaticamente, entao nao deve ser necessario dar `source .env.local` manualmente para `db:migrate`

Se as migrations ja estao geradas no repositorio, o foco aqui e aplicar no banco do Neon:

```bash
npm run db:migrate
```

Se precisar regenerar localmente antes:

```bash
npm run db:generate
```

Opcional para desenvolvimento rapido:

```bash
npm run db:push
```

Importante:
- para deploy real, prefira `db:migrate`
- evite depender de `db:push` como fluxo principal de producao

## 8. Passo 5 — Validar conexao com o banco

Onde executar:
- localmente, na sua maquina

Quando executar:
- depois de aplicar as migrations no banco do Neon
- antes de criar/configurar o projeto no Vercel

```bash
npm run db:check
```

Ou pela API local:

```bash
curl http://localhost:3000/api/health
```

## 9. Passo 6 — Rodar localmente antes do deploy

Onde executar:
- localmente, na sua maquina

Quando executar:
- depois de configurar o banco no Neon
- depois de preencher o `.env.local`
- antes de criar/configurar o projeto no Vercel
- antes do primeiro deploy remoto

```bash
npm run dev
```

Abra `http://localhost:3000`.

Objetivo:
- confirmar que a app local fala com o banco correto
- evitar descobrir erro de env so no Vercel

## 10. Passo 7 — Configurar o projeto no Vercel

1. Importe o repositorio no Vercel.
2. Configure as variaveis de ambiente:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `APP_URL`
   - `BREVO_SMTP_HOST`
   - `BREVO_SMTP_PORT`
   - `BREVO_SMTP_USER`
   - `BREVO_SMTP_KEY`
   - `BREVO_SENDER_EMAIL`
   - `BREVO_SENDER_NAME`
   - `BLOB_READ_WRITE_TOKEN`
3. Ajuste `APP_URL` para a URL publica do projeto no Vercel.
4. Execute o primeiro deploy.

Importante:
- nao use `APP_URL=http://localhost:3000` no Vercel
- o `DATABASE_URL` do Vercel deve apontar para o banco criado no Neon
- copie para o Vercel os valores finais que voce validou no `.env.local`, trocando apenas o `APP_URL` para a URL publica

## 11. Passo 8 — Validar o fluxo publicado

1. Acesse `/cadastrar`
2. Crie o admin
3. Confirme o e-mail pelo link enviado ou pelo preview exibido
4. Acesse `/admin`
5. Crie uma nova rifa em `/admin/rifas/nova`
6. Abra a pagina publica da rifa em `/r/[slug]`
7. Informe nome, email e telefone na pagina publica e confirme a geracao da cota
8. Volte ao painel da rifa em `/admin/rifas/[id]`
9. Confirme manualmente o pagamento da reserva e verifique o envio do recibo por email
10. Execute o sorteio quando houver cotas pagas

## 12. Erros comuns nesta etapa

- criar o projeto no Vercel antes de definir o banco e a `DATABASE_URL`
- esquecer de ajustar `APP_URL` para a URL publica do Vercel
- aplicar envs diferentes no local e no deploy
- tentar enviar email real sem configurar Brevo
- tentar upload de imagem sem configurar Vercel Blob
- usar `db:push` em vez de `db:migrate` como fluxo principal de deploy

## 13. Observacoes do MVP atual

- O participante reserva cotas sem OTP, SMS ou WhatsApp.
- O email de recibo e enviado pelo Brevo apos confirmacao manual do PIX.
- A imagem real do objeto usa storage persistente compativel com Vercel Blob.
- O PIX eh apresentado na pagina publica da rifa e o admin confirma o pagamento manualmente.
- O sorteio considera apenas cotas com pagamento confirmado e grava o resultado no banco.
