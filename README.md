# AventraJob

AventraJob is a production-style full-stack job portal for India, combining direct company job posting with aggregated opportunities from permitted sources.

## What’s included
- Candidate-facing job discovery and application flow
- Recruiter and company onboarding experience
- Admin moderation and verification workspace
- Modern UI built with Next.js and a Node/Express backend

## Run locally
1. Install backend dependencies:
   - cd backend && npm install
2. Install frontend dependencies:
   - cd frontend && npm install
3. Start the backend:
   - cd backend && npm run dev
4. Start the frontend:
   - cd frontend && npm run dev

The backend uses a local SQLite database (file:./prisma/dev.db), no Docker required. The frontend runs at http://localhost:3000 and the API at http://localhost:4000.
