# VINAYOKI

Vinayoki is a learning feed that turns short bursts of attention into practical action. The frontend consumes an existing FastAPI REST API; recommendation and engagement logic remain backend-driven.

## Stack

- React, TypeScript, Vite, Tailwind CSS
- React Router, React Context, Axios
- Framer Motion, Recharts, Lucide React, Sonner

## Run locally

1. Start the existing FastAPI backend from the `vinayoki-backend` project.
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend URL (local development defaults to `http://localhost:8000`).
3. Install frontend dependencies with `npm install`.
4. Start the frontend with `npm run dev` (Vite prints the local URL).

## Checks

- `npm run build` — TypeScript check and production bundle.
- `npm run lint` — Oxlint.

## Demo loop

Welcome → onboarding/user creation → personalized feed → activity → interaction → backend result → freshly fetched feed and engagement check. The feed can pause when the backend engagement endpoint explicitly requests an intervention. Learner ID and basic onboarding profile details persist locally; selected activity details are scoped to the current browser tab for activity-route refresh recovery.

## Data limitations

The API provides recent engagement and recommendation data, but no lifetime progress history or mastery endpoint. The Progress screen therefore reports recent engagement and a snapshot of recommended activities by skill rather than fabricated history or mastery scores. Build completions are self-reported in the UI; they are not executable or uploaded artifacts.
