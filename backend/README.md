# 🛠️ AventraJob — Backend

Node.js + Express 5 + Prisma API that powers [AventraJob](../README.md).

---

## ⚡ Quick Start

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

The server boots on **http://localhost:4000**.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Compile TypeScript and start the server |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server from `dist/` |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma migrate dev --name <name>` | Create a new migration |

---

## 🗂️ Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma         # Database schema (User, Company, Job, Application)
│   └── migrations/           # Versioned migrations
└── src/
    ├── server.ts             # Entry point — port + graceful shutdown
    ├── app.ts                # Express app — middleware + route mounting
    ├── load-env.ts           # Loads .env and sets safe defaults
    ├── middleware/
    │   └── auth.ts           # requireAuth & requireAdmin (JWT)
    ├── lib/
    │   ├── prisma.ts         # Prisma client singleton
    │   └── mock-data.ts      # In-memory data + helpers
    └── routes/
        ├── auth.ts           # /api/v1/auth
        ├── jobs.ts           # /api/v1/jobs
        ├── companies.ts      # /api/v1/companies
        ├── applications.ts   # /api/v1/applications
        ├── admin.ts          # /api/v1/admin
        └── health.ts         # /health
```

---

## 📡 API Endpoints

Base URL: `http://localhost:4000`

### Public
- `GET  /health` — health check
- `POST /api/v1/auth/register` — create account (password optional)
- `POST /api/v1/auth/login` — login with email + password
- `POST /api/v1/auth/google` — sign in / sign up with a Google credential
- `GET  /api/v1/auth/me` — get current user from JWT
- `GET  /api/v1/jobs` — list approved jobs
- `GET  /api/v1/companies` — list companies

### Authenticated (Bearer token)
- `POST /api/v1/jobs` — post a job
- `POST /api/v1/companies` — register a company
- `POST /api/v1/applications` — apply to a job

### Admin only
- `*   /api/v1/admin/*` — moderation endpoints

---

## 🔐 Environment

Create a `.env` file (or use the defaults from `src/load-env.ts`):

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
PORT=4000
```

> ⚠️ Always replace the default `JWT_SECRET` in production.
