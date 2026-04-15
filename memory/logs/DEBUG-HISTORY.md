# Debug History

Use semantic IDs:
- ERR-0001
- ERR-0002

Template:
# ID: ERR-000X: Short semantic title
SINTOMA:
CAUSA_RAIZ:
ACAO:
CONTEXTO:

# ID: ERR-0001: Next build failed on missing internal pages
SINTOMA:
- `next build` falhava em `Cannot find module for page: /_document` e depois em `Failed to collect page data for /_not-found`.
CAUSA_RAIZ:
- O scaffold estava apenas com App Router e o processo de build exigiu compatibilidade explicita com os arquivos basicos do Pages Router e uma tela `not-found` definida.
ACAO:
- Foram adicionados `src/pages/_app.tsx`, `src/pages/_document.tsx` e `src/app/not-found.tsx`.
CONTEXTO:
- Erro encontrado durante a validacao do scaffold inicial do MVP em 2026-04-13.

# ID: ERR-0002: Create raffle appeared to do nothing after submit
SINTOMA:
- Ao clicar em `Criar rifa`, a tela permanecia no formulario e parecia que nada tinha sido salvo.
- Em tentativas diferentes, o formulario podia limpar, exibir mensagem generica ou ficar na mesma rota sem deixar claro se a falha era de validacao, persistencia ou navegacao.
CAUSA_RAIZ:
- O fluxo misturava validacao de formulario, persistencia e redirecionamento sem observabilidade suficiente.
- A validacao do campo `purpose` barrava o submit sem destacar o campo com erro.
- O redirecionamento apos sucesso precisava ficar mais explicito no cliente para facilitar o diagnostico do comportamento.
ACAO:
- Foram adicionados logs detalhados por etapa em `src/features/raffles/actions.ts`.
- O formulario passou a destacar o erro diretamente no campo `Proposito`.
- O sucesso da criacao passou a devolver `redirectTo` e a navegacao foi movida para o cliente.
- O valor da cota foi ajustado para entrada em reais com conversao para centavos no servidor.
- O PIX deixou de ser obrigatorio na criacao inicial da rifa.
CONTEXTO:
- Bug encontrado durante o teste manual do fluxo de criacao de rifa em ambiente local com Next.js 15 e banco Neon.

# ID: ERR-0003: Image grid rendered one card per row instead of two columns
SINTOMA:
- A secao de imagens da rifa mostrava os cards um embaixo do outro, ocupando toda a largura do container.
- A intencao era exibir miniaturas em grade `2 x 2`, mas a apresentacao continuava parecendo lista vertical.
CAUSA_RAIZ:
- O layout dependia apenas de utilitarios e nao estava suficientemente fixado para garantir duas colunas reais naquele contexto.
- O comportamento visual precisava ser isolado do carregamento das imagens para confirmar a geometria correta.
ACAO:
- Foi criado o componente `src/features/raffles/components/image-showcase-grid.tsx`.
- A grade passou a usar `display: grid` com `gridTemplateColumns: repeat(2, minmax(0, 1fr))` em estilo explicito.
- Foi criado um modo de teste com placeholders para validar a malha antes de reativar as imagens reais.
- As miniaturas ficaram com tamanho delimitado e clique para abrir a imagem em nova aba.
CONTEXTO:
- Bug encontrado ao refinar a pagina publica da rifa para a experiencia do cotista, depois da troca de links de imagem por miniaturas clicaveis.

# ID: ERR-0004: Next.js 15 rejected non-async export in use server file
SINTOMA:
- Ao clicar em `Confirmar Telefone` na pagina publica da rifa, a aplicacao retornava erro 500.
- O runtime mostrava: `A "use server" file can only export async functions, found object`.
CAUSA_RAIZ:
- O arquivo `src/features/participants/actions.ts`, marcado com `"use server"`, exportava tambem um objeto de estado inicial do formulario.
- No Next.js 15, arquivos `use server` so podem exportar funcoes async.
ACAO:
- O estado inicial do fluxo do participante foi movido para `src/features/participants/state.ts`.
- O componente cliente passou a importar esse estado do novo arquivo, deixando `actions.ts` apenas com exports validos para server actions.
- O fluxo foi revalidado com `npm run typecheck` e `npm run lint`.
CONTEXTO:
- Bug encontrado durante o teste do botao `Confirmar Telefone` no fluxo publico do cotista, em ambiente local com Next.js 15.

# ID: ERR-0005: check-db failed on @next/env namespace import
SINTOMA:
- `npm run db:check` falhava com `TypeError: loadEnvConfig is not a function`.
CAUSA_RAIZ:
- O script `.mjs` usava import namespace para `@next/env`, mas em runtime ESM o pacote expoe `loadEnvConfig` dentro do export default.
ACAO:
- `scripts/check-db.mjs` voltou a usar import default de `@next/env` e desestruturacao de `loadEnvConfig`.
CONTEXTO:
- Bug encontrado ao verificar a migration `0002_milky_patch` no banco Neon apos a mudanca de escopo para reserva sem OTP e recibo via Brevo. ##bug
