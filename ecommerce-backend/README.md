# PratoFeito – Backend + site
Tudo roda com um comando (precisa só de Node 18+):

    npm install && npm start      # http://localhost:3000  (API em /api, site na raiz)

Ou dê dois cliques em `iniciar.bat` / `iniciar.command` na pasta acima.

- Banco: PGlite (Postgres embutido) em `data/pgdata`, criado e populado sozinho. Com `DATABASE_URL`/`DB_HOST` usa um PostgreSQL externo (rode `database/init.sql` nele).
- `.env` é opcional (veja `.env.example`). Sem `JWT_SECRET`, um segredo forte é gerado em `data/jwt.secret`.
- Contas demo (fora de produção): `fornecedor@demo.com` e `comprador@demo.com`, senha `demo12345`. Desligue com `SEED=0` ou `NODE_ENV=production`.
Respostas: `{ success, data }` ou `{ success:false, error }`.
