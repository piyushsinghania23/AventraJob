# 💼 AventraJob

> A production-style **full-stack job portal** for India, combining direct company job postings with admin moderation — built to demonstrate real-world Next.js + Node/Express skills.

![Stack](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Stack](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Stack](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Stack](https://img.shields.io/badge/Express-5-000?logo=express)
![Stack](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)

---

## 📌 What is AventraJob?

AventraJob is a job-discovery platform where:

- **Candidates** can browse jobs, register, and submit applications.
- **Recruiters/Companies** can post openings and manage their listings.
- **Admins** moderate, approve, and verify companies and jobs through a dedicated workspace.

The project is structured to mirror a real production app: layered API routes, middleware-based auth, Prisma ORM with migrations, secure password hashing, JWT-based sessions, and a modern Tailwind-powered UI.

---

## 🏗️ Project Architecture

```
Aventra-job/
├── backend/          # Node + Express + Prisma API
│   ├── prisma/       # Database schema & migrations
│   └── src/
│       ├── routes/   # auth, jobs, companies, applications, admin, health
│       ├── middleware/   # requireAuth, requireAdmin
│       └── lib/      # prisma client + mock data
│
├── frontend/         # Next.js 16 (App Router) + React 19 + Tailwind v4
│   └── src/app/
│       ├── auth/     # login, register, admin-login
│       ├── jobs/     # list & detail
│       ├── dashboard/
│       └── admin/    # moderation workspace
│
└── docker-compose.yml    # Postgres + Redis for production-like setup
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS v4 |
| **Backend** | Node.js, Express 5, TypeScript 5 |
| **Database** | SQLite (local dev) / PostgreSQL (via Docker) |
| **ORM** | Prisma 7 |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` for password hashing |
| **Security** | `helmet`, `cors`, `compression` |
| **Validation** | `zod`, `class-validator` |
| **Logging** | `morgan` |
| **Dev Tools** | `ts-node`, `dotenv` |

---

## ✨ Features

- 🔐 **JWT authentication** with role-based access (`candidate`, `recruiter`, `admin`)
- 📝 **User registration & login** with secure bcrypt password hashing
- 💼 **Job listings** — create, browse, and view job details
- 🏢 **Company profiles** with verification workflow
- 📄 **Application submission** — candidates can apply to jobs
- 🛡️ **Admin moderation** dashboard to approve/verify companies and jobs
- 🚦 **Health check** endpoint for monitoring
- 🛡️ **Security middleware** (helmet, CORS, rate-limit-ready)
- 🗃️ **Prisma migrations** for versioned schema changes

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+**
- **npm** (or pnpm/yarn)
- **Docker** *(optional, only if you want to run Postgres locally)*

### 1️⃣ Install dependencies

```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### 2️⃣ Set up the database (SQLite — no setup needed)

The Prisma schema uses SQLite by default. The DB file is created automatically at `backend/prisma/dev.db`.

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 3️⃣ Run the backend

```bash
cd backend
npm run dev
```
✅ API runs at → `http://localhost:4000`

### 4️⃣ Run the frontend

```bash
cd frontend
npm run dev
```
✅ UI runs at → `http://localhost:3000`

---

## 🐳 Optional: Run with Docker (Postgres + Redis)

If you want a production-like database setup:

```bash
docker-compose up -d
```

Then update `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aventrajob"
```

---

## 📡 API Reference

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/health` | Server health check | ❌ |
| `POST` | `/auth/register` | Register a new user | ❌ |
| `POST` | `/auth/login` | Login & receive JWT | ❌ |
| `GET`  | `/jobs` | List all approved jobs | ❌ |
| `POST` | `/jobs` | Create a new job posting | ✅ |
| `GET`  | `/companies` | List companies | ❌ |
| `POST` | `/companies` | Register a company | ✅ |
| `POST` | `/applications` | Apply to a job | ✅ |
| `GET`  | `/admin/...` | Admin moderation routes | 🔒 Admin |

> All protected routes require an `Authorization: Bearer <token>` header.

---

## 🗃️ Database Schema (Prisma)

**Models:** `User`, `Company`, `Job`, `Application`

- `User` → can submit many `Application`s
- `Company` → verified by admin (`isVerified`)
- `Job` → belongs to a company, has many `Application`s
- `Application` → unique per `(userId, jobId)` pair

See [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma) for the full definition.

---

## 🔒 Environment Variables

Create a `.env` file inside `backend/`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
PORT=4000
```

> ⚠️ Defaults are provided in [`backend/src/load-env.ts`](backend/src/load-env.ts) for local development, but you should always set a strong `JWT_SECRET` in production.

---

## 🧪 What This Project Demonstrates (Interview Talking Points)

1. **Full-stack architecture** — clean separation between API and UI.
2. **TypeScript everywhere** — shared types, Prisma-generated types, strict TS config.
3. **Authentication & Authorization** — JWT + role-based middleware (`requireAuth`, `requireAdmin`).
4. **Database migrations** — versioned with Prisma; reproducible across environments.
5. **Security best practices** — bcrypt hashing, helmet headers, CORS config, password never returned.
6. **Production-ready patterns** — graceful shutdown, error handling, request logging, compression.
7. **Modern frontend** — Next.js App Router, React 19, Tailwind v4, persistent auth on the client.
8. **Containerization** — Docker Compose for Postgres + Redis when scaling beyond SQLite.

---

## 📂 Useful Scripts

**Backend**
```bash
npm run dev      # Compile TS + start server
npm run build    # Compile to dist/
npm start        # Run compiled output
```

**Frontend**
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## 📜 License

This project is licensed under the **ISC License**.

---

> Built as an interview-ready reference project. Feel free to fork, learn, and extend! 🚀
