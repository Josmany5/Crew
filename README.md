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
| **Real database (Supabase Postgres)** | ✅ **Done — data persists across restarts** |
| **Accounts/auth (email sign-up/login)** | ✅ **Done via Supabase Auth** |
| **Social feed** (posts, photos, captions, tags, check-in auto-posts, delete) | ✅ Done |
| **Public profiles** (click any name/avatar → their profile + posts) | ✅ Done |
| **Photo system** (HEIC→JPEG transcoding, drag-to-position avatar crop) | ✅ Done |
| **Discover** (demo climbers, filters, "see everyone again" reset) | ✅ Done |
| Gym/crag place pages + social events (Partiful-style) | 🗒️ Planned (Phase 2) |
| Friends (mutual accept) + request inbox | 🗒️ Planned |
| Group messages, profile photo albums, achievements | 🗒️ Idea vault |
| App stores (Expo) | 🗒️ Later |

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

> Data lives in **Supabase Postgres** — it persists across server restarts. Real accounts exist via **Supabase Auth** (email sign-up/login); the app also seeds demo climbers (Maya, Jonah, Riley, Diego, Sam) so it's fun to explore before real users join.

### Useful commands

```bash
pnpm run typecheck          # full typecheck across all packages
pnpm run build              # typecheck + build
pnpm --filter @workspace/api-spec run codegen   # regen API types/hooks from openapi.yaml
```

---

## Stack & architecture

- pnpm workspaces, Node 24, TypeScript 5.9
- API: Express 5 — `artifacts/api-server/src/routes/crew.ts` (DB-backed, real persistence)
- DB: PostgreSQL + Drizzle (`lib/db/src/schema` — real schema: users, profiles, swipes, matches, events, rsvps, conversations, messages, checkins, places, posts)
- Frontend: Vite + React 19 + Tailwind + react-query, routes via wouter — `artifacts/crew/src`
- **Spec-first API**: `lib/api-spec/openapi.yaml` → Orval codegen → typed Zod schemas (`lib/api-zod`) + React hooks (`lib/api-client-react`). Change the spec, run codegen.
- Storage: Supabase Storage (`posts` + `avatars` buckets); uploads are processed server-side (`/api/uploads` — HEIC/HEIF → JPEG, EXIF auto-orient, resize)

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

> **Status update (2026-08):** Phase 5's core (real DB + Supabase Auth) is done, and the **social feed** shipped ahead of Phase 3: posts (text + photo, HEIC-safe), captions, tags, check-in auto-posts, post deletion, public profiles (`/profile/:id`), a photo system with drag-to-position avatar cropping, and Discover with a "see everyone again" reset. Group messages, photo albums, and achievements remain in the vault below.

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
- **"Hosting" vs "Looking" mode** — events are either *"I'm hosting"* (fixed plan, RSVP + spots) or *"I'm looking for partners"* (open request: *"want to do Smith Rock this weekend?"* with an **"I'm in"** interest button and an interested-count instead of spots); Events page filters by All / Hosting / Looking

**Discovery filters**
- Advanced Discover filter sheet: **gym, age range, climbing-level band, gear, verified-only, open-to-dating**
- Requires structured grade columns on profiles (boulder + route as numbers) so level filtering is real
- Deferred: matching "Looking" requests to compatible climbers via the same filter engine (the "advanced trip matches" idea)

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

### Discovery & matching
- **Advanced Discover filters** (filter sheet/drawer): gym, age range, climbing-level band, gear, verified-only, open-to-dating
  - Needs structured grade columns on profiles (boulder + route as numbers) for real level filtering
  - One-time migration parses existing free-text levels ("V4 / 5.10b") into them
- **"Looking for partners" request matching** (the advanced-trip-matches idea): match a "Looking" post (e.g. "Smith Rock, 5.10+, have rope") to compatible climbers using the same filter engine — surfaces "3 climbers nearby match this trip"

### Events
- Going / Maybe / Can't-go RSVP states; guest lists; waitlists; invites; comments; shareable event links
- **"Hosting" vs "Looking" mode** — open partner requests with an "I'm in" interest button and interested-count, instead of fixed spots/hosting
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

### Sessions & progression
- **"Who's climbing tonight?" live board** — cards at the top of the Feed: *"Maya · The Circuit · tonight 6–9 · need a lead partner · 🔴 3 going"* with an **"I'm in"** button → opens a small session chat; notifies people nearby
- **Rich check-ins** — "Josmany is at PRG now (V5–V6, down to boulder)" with a **"who's here?"** count → tap to join an impromptu session
- **Send logging + achievements** — tap **"Sent!"** after a session → auto-post *"🔥 Sent V6 at Montavilla"* with a badge; profile gets a **Sends** tab with a grade-over-time chart (DB already reserves `postType: achievement`)
- **Projects** — set a project (route/problem); Crew surfaces **"2 others are projecting this too"** and matches people projecting the same thing

### Trust & safety
- **Partner verification** — profile badges: "Lead-checked ✓", "Belay certified", "N years outdoor"; self-declared + vouches, later gym-verified
- **"Climbed with" references** — after a session, leave a one-line vouch; profiles build a **climbing reputation** ("Climbed with 12")
- **Safety-first profiles** — risk appetite, indoor/outdoor mix, lead vs top-rope vs boulder shown up front (climbing with strangers needs trust)

### Community & culture
- **Gym squads** — join your gym's crew; gym page shows "3 crew here right now · 12 regulars · crew night Thursday"; see who's checked in at your gym
- **The Beta Board** — feed posts can be tagged gym/crag + grade ("V5 · The Circuit"); the Feed filters to "V4–V6 at The Circuit" = instant local beta
- **Feed prompts** — one-tap posts: "Sent any new grades?", "Climbed with someone?"
- **Beginner & women's-friendly spaces** — tags/events ("beginner-friendly", "women's night") for adoption & retention

### Quick wins / polish
- Mobile-first feel (big touch targets, swipeable), PWA so check-in works from the parking lot
- Session notifications: "Maya is looking for a partner at your gym tonight"

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

