# JobConnect AI

Minimal MVP scaffold for JobConnect AI — a Next.js + TypeScript remote job platform with Prisma, NextAuth, Stripe, and OpenAI integration stubs.

## Setup (local)

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Install dependencies and run dev:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

3. API endpoints:
- GET /api/jobs — list jobs
- POST /api/ai — AI resume/cover generator (calls OpenAI)

Deployment: Vercel recommended. Provide environment variables on the hosting provider.
