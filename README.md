# polyscale-frontend-pAGK-production

React + Vite frontend for the PolyScale SaaS platform.

## Purpose
- UI for the current Express backend
- Connects to the backend through `VITE_API_URL`
- Cleanly independent from the backend repo

## Local setup
```bash
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:3000
npm run dev -- --host 0.0.0.0
```

## Production
```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0
```

## AI generator
The blueprint editor sends authenticated requests to the Express backend configured by
`VITE_API_URL`. The backend must provide `/api/code/ai/generate`, `/api/code/ai/suggest`,
and `/api/code/ai/refine`, as well as `/api/code/files` to refresh generated files.
Keep AI provider credentials on the backend; do not expose them in frontend environment
variables.

Briefs and attached files are limited to 4000 characters on the Starter plan. Scale-Up and
Enterprise plans (and admins) get up to `VITE_MAX_PROMPT_CHARS` (default 24000, read at build time),
which must match the backend `MAX_BRIEF_LENGTH`.
