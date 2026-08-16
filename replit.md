# Crew

Crew helps climbers find belay partners, bouldering buddies, outdoor trip companions, and local group sessions based on gyms, disciplines, gear, and availability.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/crew` — responsive web app with discovery, gyms, events, messages, and profile routes
- `artifacts/api-server/src/routes/crew.ts` — climbing discovery and community API routes with seeded local beta data
- `lib/api-spec/openapi.yaml` — source of truth for generated API hooks and validation schemas
- `artifacts/crew/src/index.css` — Crew visual tokens and responsive styling

## Architecture decisions

- The first build uses an OpenAPI-first contract so the frontend can work against typed hooks as the product grows.
- The initial experience is a local-beta demo with seeded Portland gyms and climbers; write actions update the running API store.
- Profile photos can be selected directly in the profile editor and saved as the profile avatar value for the MVP.
- Matching is intentionally framed around climbing plans and consent-aware connection settings, not generic dating discovery.

## Product

- Discover climbers by discipline and shared gym
- Like or pass on partner suggestions and see matches
- Browse gyms, see local activity, and check in
- Create or RSVP to gym sessions, outdoor days, and trips
- Edit climbing level, gear, gyms, availability, profile photo, and dating preference
- Open matched conversations and send direct messages

## User preferences

- The user wants the app to support climbing-only connections as well as optional dating openness.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- The API server workflow must be restarted after changing server route code because its dev command bundles before starting.
- The current local-beta store is in memory and is intended to be replaced with persistent user accounts and storage before production use.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
