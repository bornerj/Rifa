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
