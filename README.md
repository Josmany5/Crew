# Crew

**Climbing partners, not dating profiles.** Find belay partners, bouldering buddies, outdoor trip companions, and local group sessions based on gyms, disciplines, gear, and availability.

A community-built climbing app: matching + social events around real places (gyms & crags), built to grow into real accounts, real gyms, and real users.

---

## Quick status

| Area | Status |
|---|---|
| Web MVP (matching, events, gyms, messages, profile) | ✅ Built & running |
| Events: public vs. crew-only | ✅ Done (Phase 1) |
| App code organization | ✅ Split into pages/components (Phase 0) |
| Git + GitHub | ✅ Pushed → **github.com/Josmany5/Crew** |
| Real accounts + database | ⏳ **Next up** (Phase 5 — Supabase) |
| Gym/crag place pages + social events | 🗒️ Planned (Phase 2) |
| Friends + posts, news channels, app stores | 🗒️ Planned (Phases 3–4, then stores) |

---

## Running it (local dev)

```bash
# Terminal 1 — API server (port 5000)
cd ~/Desktop/What-Can
PORT=5000 pnpm --filter @workspace/api-server run dev

# Terminal 2 — web app (port 5001, proxies /api → 5000)
PORT=5001 BASE_PATH=/ pnpm --filter @workspace/crew run dev
```

Open **http://localhost:5001**.

> Data is currently in-memory: it resets when the API server restarts. No accounts yet — you're "Sam Rivera."

### Useful commands

```bash
pnpm run typecheck          # full typecheck across all packages
pnpm run build              # typecheck + build
pnpm --filter @workspace/api-spec run codegen   # regen API types/hooks from openapi.yaml
```

---

## Stack & architecture

- pnpm workspaces, Node 24, TypeScript 5.9
- API: Express 5 (in-memory store for now) — `artifacts/api-server/src/routes/crew.ts`
- DB: PostgreSQL + Drizzle (`lib/db` — schema placeholder, not wired yet)
- Frontend: Vite + React 19 + Tailwind + react-query, routes via wouter — `artifacts/crew/src`
- **Spec-first API**: `lib/api-spec/openapi.yaml` → Orval codegen → typed Zod schemas (`lib/api-zod`) + React hooks (`lib/api-client-react`). Change the spec, run codegen.

```
lib/
  api-spec/          openapi.yaml (source of truth)
  api-zod/           generated Zod validation
  api-client-react/  generated react-query hooks
  db/                Drizzle schema (empty template — to be filled in Phase 5)
artifacts/
  api-server/        Express API
  crew/              web app (pages/ + components/ in src/)
```

---

## Product principles (decisions we've made)

1. **Matching is framed around climbing plans, not generic dating.** Consent-aware; "open to dating" is an optional, clearly shown setting.
2. **Gyms/crags are *places*, not accounts.** No gym needs to sign up for the app to exist. Place pages aggregate community activity around them.
3. **Events are posted by people (members), not platforms.** Any member can post an event at any place; the host is always a person.
4. **Official gym events use a "claim" flow** — a gym verifies ownership of its place page, then staff can post "Official" events with a verified badge. Nothing breaks if a gym never claims.
5. **Real users need real foundations first** — accounts + a database (Supabase) before building more demo features on throwaway in-memory data.

---

## Roadmap

### Phase 0 — Foundation ✅ done
- Committed the entire app + pushed to GitHub
- Split the single-file `App.tsx` into `src/pages/` + `src/components/` (AST-based, byte-exact)
- Extracted shared `queryClient` into `src/lib/query-client.ts`
- Fixed dead buttons (Messages triple-dot menu; Gyms "change" location)

### Phase 1 — Events: public vs. crew-only ✅ done
- `visibility: "public" | "crew-only"` on events (spec → codegen → routes → UI)
- Event cards show a Public / Crew-only badge
- Events page filters by type *and* audience; create-event modal has a Public ⇄ Crew-only toggle
- Crew-only = visible to people you've matched with (consent-aware)

### Phase 2 — Places & social events ⏳ planned
**Places (gyms & crags)**
- Unify gyms + crags into a `Place` model: `type: "gym" | "crag"`, name, area, hours (gyms), image
- Place pages: hero, hours/about/amenities, who's checked in, who lists it as home, events hosted there
- Gyms page stays a browse/filter list ("what's around"); gym cards link to their place page
- Multi-location chains: `Brand` → multiple `Place` locations (e.g. Movement · Gowanus). Brand page lists locations; each location has its own events/check-ins
- **Place picker in event creation** — choose a gym or crag (or type one); events attach to a place

**Social events (Partiful-style)**
- RSVP states: **Going / Maybe / Can't go** (replaces the boolean joined toggle); `attendees` = Going only
- Guest list with avatar stacks; host view shows going/maybe/declined
- Spots full → waitlist (first freed spot goes to the waitlist)
- "Invite your crew" — send an event to matched climbers
- Lightweight comments on events ("is this dog-friendly?")
- Shareable event link/page

**Official gym events**
- Place pages get a **"Claim this gym"** flow (verify ownership) → staff post "Official" events with a verified badge
- Community events (posted by members) and Official events coexist; official badge only appears on claimed places (prevents fakes)
- Seeded demo: The Circuit is claimed with one official meetup

### Phase 3 — Friends & posts ⏳ planned
- Mutual-accept friend requests (or one-way follow — TBD)
- Feed page (`/feed`): compose + friends' posts (sends, photos, plans)
- Add-friend buttons on matched profiles; posts also show on profiles
- Build on real accounts (after Phase 5) — not on the demo

### Phase 4 — News & channels ⏳ planned
- "Beta" section: curated channels like *Local Beta*, *Gym Spotlight*, *Send of the Week*
- Magazine / Snapchat-story style tap-through cards
- Start seeded/editorial (curated), user-generated later

### Phase 5 — Real users (the big pivot) ⏳ next up
1. **Supabase**: auth (email + Google + Apple sign-in), Postgres, file storage
2. **Write the real DB schema** in `lib/db` (currently an empty template): users, profiles, matches, swipes, events, rsvps, messages, checkins, friends, posts, channels
3. **Replace the in-memory `crew.ts` store** with DB-backed routes (Drizzle is already installed)
4. **Real gyms + maps**: Google Places API for real gym data, Google Maps for locations
5. **Deploy**: API (Railway/Fly), web (Vercel), custom domain
6. **App stores**: Expo (React Native) app → Google Play ($25) + App Store ($99/yr), privacy policy, account deletion, 17+ rating

---

## Feature idea vault (details to build later)

Ideas discussed and deferred — kept here so nothing is lost.

### Events
- Going / Maybe / Can't-go RSVP states; guest lists; waitlists; invites; comments; shareable event links
- "Add to calendar" (defer), post-event photo sharing (defer)
- Maybe-nudges: "Host starts in 2 hours — are you in?" (needs notifications)
- Events attach to a place (gym or crag) via a picker

### Places
- Brand (chain) pages: "Movement has 3 gyms near you"
- `GET /gyms?brand=...` filters
- Claim flow → official events + verified badge
- Who's checked in / who lists this place as home

### Social
- Friends (mutual accept), friend requests inbox, posts feed
- News channels / magazine + Snapchat-style stories
- Report/block/ moderation across people, posts, and events

### Product
- "Crew-only" audience = matched climbers only
- Consent-aware matching; optional "open to dating" clearly shown

---

## Monetization (two customers)

### 1. Climbers — freemium subscription ($6–10/mo)
- Free: a few likes/day, community events
- Premium: unlimited discovery, see who liked you, advanced filters, priority matching, verified badge

### 2. Gyms — B2B (the claim flow becomes a product)
- Claimed gym page: ~$50–150/mo (official page, verified badge, official events)
- Promoted/featured events: ~$20–50 per event
- Community analytics ("312 members climb near you")
- Recruitment leads upsell
- 5 gyms × $100/mo ≈ $500/mo before 1,000 users

### 3. Events/trips — later
- Featured events, guided trip booking fees (~5%), paid ticketing on group events

### 4. At scale (later)
- Gear brand sponsorships; affiliate links for shoes/ropes/crash pads

### Honest expectations
- ~1k users + 5 gyms ≈ $900–1,500/mo
- ~10k users + 20 gyms ≈ $8–12k/mo
- **Order matters**: free app + a real community first → gym partnerships → premium subscriptions

---

## Git / GitHub

Remote: `https://github.com/Josmany5/Crew` (branch `main`)

```bash
git status            # working tree should be clean
git push origin main  # push
```

---

## Open questions / decisions

- [ ] Friends: mutual accept vs. one-way follow?
- [ ] Crew-only events: matched-only vs. friends-only?
- [ ] Channels: curated editorial vs. user-generated?
- [ ] App name/branding beyond "Crew"?
- [ ] Launch city scope: Portland-first vs. multi-city?

