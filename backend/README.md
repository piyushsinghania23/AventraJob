# AventraJob Backend

## Scripts

- `npm run dev` start the API server with ts-node
- `npm run build` compile the TypeScript app
- `npx prisma generate` generate the Prisma client
- `npx prisma migrate dev --name init` create the initial migration

## API

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/jobs`
- `POST /api/v1/jobs`
- `GET /api/v1/companies`
- `POST /api/v1/companies`
- `GET /health`
