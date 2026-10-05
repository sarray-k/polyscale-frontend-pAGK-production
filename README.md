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
