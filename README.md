# AstroCareer

AstroCareer is a full-stack student career exploration project: astrology for optional self-reflection, plus transparent skill assessment, mock interview evaluation, job-readiness scoring, career matching, simulation, and roadmap tracking.

## Stack
React, Vite, TypeScript, Tailwind-compatible CSS design system, React Router, Axios and Recharts; Node.js, Express, TypeScript, MongoDB/Mongoose, JWT, bcrypt, Zod, Helmet, CORS and rate limiting.

## Run

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run seed` to seed courses, 18 careers, skills, questions and the admin account.
4. Run `npm run dev`, then open `http://localhost:5173`.

`npm run build` builds both applications and `npm test` runs API/engine tests. The API is at `http://localhost:5000`.

## Architecture
`server/src/models` contains Mongoose documents; `services/core.ts` contains business rules; `app.ts` is the HTTP/controller boundary; and `seed.ts` provides reproducible database data. The client calls only the protected/public API—no secrets are exposed to it.

## AI and astrology
Set `AI_API_KEY` and `AI_MODEL` when connecting a provider implementation. The current evaluation has a documented deterministic fallback and never presents it as model output. Astrology uses a deterministic zodiac/self-reflection fallback unless a future provider is configured; it is explicitly labelled entertainment/self-reflection, not astronomy.

## Limitations
MongoDB must be available to use data-backed flows. The AI provider abstraction is deliberately configured for safe fallback in this initial release; add a provider adapter in `services` to call a chosen LLM. The front-end uses a custom cosmic CSS system; Tailwind is installed as part of the requested stack but not required for the present styling.
