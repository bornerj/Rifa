Status: ACTIVE
Date: 2026-04-13
Context: O projeto nasceu do zero e precisava de uma stack que funcionasse bem no Vercel, com baixo custo inicial, boa aderencia a mobile-first e compatibilidade com regras de validacao, auth e persistencia relacional.
Decision: Adotar Next.js App Router com TypeScript strict no frontend e backend, Drizzle ORM como camada de acesso ao banco, Neon Postgres como banco principal e TailwindCSS para a interface.
Consequences: O deploy fica simples no Vercel e o stack permanece enxuto para MVP. Em troca, a aplicacao fica orientada ao modelo serverless e a arquitetura deve evitar acoplamentos que dependam de processos persistentes ou conexoes de banco long-lived.
