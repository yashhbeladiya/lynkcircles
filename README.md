# LynkCircles

A trades-and-services marketplace for India. Workers list their
skills; clients post jobs; both sides talk to each other on the
platform until the work is done and reviewed.

This started as a course project (a LinkedIn-style social network)
and was reshaped into a marketplace because that's the product the
country actually needs — find a verified carpenter, plumber,
embroidery operator, cook, or tutor near you, message them, hire
them, leave a review with photos when it's done.

---

## Highlights

- **Service catalog with skill matching.** A controlled vocabulary
  of ~50 services across 7 categories. Workers tag what they do;
  jobs tag what they need; the feed surfaces matches first.
- **Distance-aware discovery.** Every worker tile and job tile
  shows kilometres from you. GeoJSON Point + 2dsphere index in
  Mongo; Haversine in the app for display.
- **Three job shapes.** Gig (one-off), recurring (daily/weekly
  cooking, cleaning), and employment (full/part-time roles). The
  form and the tile both adapt.
- **Real-time messaging.** Socket.IO with JWT cookie auth, room-
  based delivery (`user:<id>`), read receipts, typing indicator,
  attachments via Cloudinary.
- **Portfolio-based reviews.** A review only exists as part of a
  completed job — proof photos optional. No detached
  "rate this person" form.
- **Verification badge.** Auto-flips when a worker has 1+
  portfolio item, 1+ completed hire, and an average rating ≥ 4
  across 3+ reviews.
- **Hiring lifecycle.** Apply → Hire (locks the job) → Mark
  complete → Review. Each transition runs verification scoring.
- **i18n scaffold.** English, Hindi, Marathi locales wired via
  i18next. ₹ currency formatting via `Intl.NumberFormat`.
- **WhatsApp + tel: deep links** built from a phone field with
  +91 inferred for 10-digit numbers.
- **Installable PWA.** Manifest + service worker, with cache
  strategies for remote images and the inbox list.
- **Live map discovery.** Leaflet + OpenStreetMap map overlays worker
  pins and job pins with custom DivIcon markers. Layer toggle
  (All / Workers / Jobs), service filter chips, recenter-on-me button.
- **Semantic match engine.** TF-IDF cosine similarity computed
  server-side. Workers see ranked jobs; clients see ranked workers.
  Score bar + matched keyword chips on every card.
- **Insights dashboard.** Role-aware analytics with Recharts — message
  volume over 14 days (area chart), rating distribution (bar chart),
  hire-rate stats for workers; post-by-day + status pie for clients.
- **Validated boundaries.** Zod schemas on every public POST/PUT
  endpoint so bad payloads return structured 400s, not 500s.

## Stack

| Layer       | Choice                                                         |
|-------------|----------------------------------------------------------------|
| Frontend    | Vite, React 19, TypeScript (strict), MUI v9, react-query v5    |
| Routing     | React Router v7 with nested routes                             |
| State       | TanStack Query for server state, lightweight context elsewhere |
| Realtime    | socket.io 4 (client + server)                                  |
| Backend     | Node + Express 4, ESM                                          |
| Data        | MongoDB + Mongoose 8, 2dsphere + compound indexes              |
| Auth        | JWT in HttpOnly cookie, bcrypt for passwords                   |
| Uploads     | Cloudinary (buffer stream from multer memory storage)          |
| Validation  | Zod schemas at every public boundary                           |
| Hardening   | helmet, compression, express-rate-limit (auth/write/search)    |
| PWA         | vite-plugin-pwa (Workbox)                                      |
| i18n        | i18next + react-i18next                                        |

## Local setup

Requirements: Node 20+, a MongoDB connection string, a Cloudinary
account (uploads can be skipped if you don't intend to use them).

```bash
git clone <repo-url> lynkcircles
cd lynkcircles

# 1. Backend dependencies (root package.json)
npm install

# 2. Frontend dependencies
npm --prefix lynkcircles-frontend install

# 3. Configure env
cp .env.example .env   # if .env.example exists; otherwise see below
```

Minimum `.env` at the repo root:

```
MONGO_URI=mongodb://localhost:27017/lynkcircles
JWT_SECRET=any-long-random-string
CLIENT_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NODE_ENV=development
```

Run it:

```bash
# Seed the database with realistic personas, jobs, conversations,
# portfolio items, and reviews. Idempotent — safe to re-run.
npm run seed

# In one terminal: backend (port 5100)
npm run dev

# In another: frontend (port 3001, proxies /api and /socket.io)
npm --prefix lynkcircles-frontend run dev
```

Open `http://localhost:3001`. Sign in as any seeded user; the
password for all of them is `demo1234`. A few good starting points:

- `ramesh_carpenter` — verified worker with portfolio + reviews
- `anita_embroidery` — Surat-based embroidery operator
- `karthik_dev` — Bengaluru freelance dev, higher rate
- `anil_homes` — Mumbai client with active jobs and conversations
- `divya_p` — Bengaluru client, has tuition + cleaning + cooking
  jobs running

## Architecture sketch

```
┌────────────────────┐        ┌──────────────────────────┐
│   React 19 + Vite  │  HTTP  │   Express (Node, ESM)    │
│   MUI · TanStack Q │ ─────▶ │  routes/* → controllers/*│
│   socket.io-client │   WS   │  socket.io rooms         │
└────────────────────┘ ─────▶ └──────────┬───────────────┘
        ▲                                │
        │  cookie JWT                    │
        │                       ┌────────▼──────────┐
        │                       │  Mongoose 8 / Mongo│
        │                       │  + 2dsphere index  │
        │                       └────────┬──────────┘
        │                                │
        │                       ┌────────▼──────────┐
        │  Cloudinary CDN URLs  │  Cloudinary upload│
        └───────────────────────┤  (multer→buffer)  │
                                └───────────────────┘
```

Boundary modules:

```
lynkcircles-backend/
├── controllers/    HTTP handlers (lean, delegate to lib/)
├── routes/         Route declarations + validate() middleware
├── schemas/        Zod schemas — one per domain
├── lib/
│   ├── socket.js          socket.io setup + room handlers
│   ├── serviceCatalog.js  canonical service taxonomy
│   ├── geo.js             haversineKm, toGeoPoint
│   ├── verification.js    badge scoring + flip
│   ├── rateLimiters.js    auth / write / search buckets
│   ├── validate.js        zod boundary middleware
│   └── db.js              mongoose connect
├── models/         Mongoose schemas (one file per collection)
├── middleware/     protectRoute (JWT cookie → req.user)
└── seeds/          npm run seed → realistic local data

lynkcircles-frontend/
├── src/
│   ├── pages/         route-level components (lazy-loaded)
│   ├── components/    feature subtrees (messaging, profile, …)
│   ├── hooks/         react-query hooks per domain
│   ├── lib/           axios, i18n, currency, contact links
│   ├── theme/         design tokens → MUI theme factory
│   └── data/          locale + service catalog mirror
```

## What's intentionally not built

These were considered and consciously dropped or deferred — knowing
what's *not* there is more useful than pretending it's all done.

- **Payments / escrow.** The hiring flow stops at "review" — there
  is no money movement. Stripe Connect would be the right shape if
  this ever leaves the prototype.
- **Phone OTP verification.** The verification badge ignores phone
  proof for now. Twilio/MSG91 would fit, but adds infra.
- **Full i18n migration.** The plumbing is in place (i18next +
  three locale bundles), but most strings are still English. Home
  hero greetings and CTAs are the migrated portion.
- **Admin / moderation surface.** No content moderation tools.
- **Email beyond the welcome.** Mailtrap is wired but only the
  welcome email actually goes out.

## Development notes

- The legacy CRA app under `lynkcircles-react-app/` is the
  pre-rewrite version. It's kept in the repo for history but
  isn't part of the live product — the active frontend is
  `lynkcircles-frontend/`.
- Backend port is 5100. Frontend proxies `/api` and `/socket.io`
  to it. Don't open `5100/api` in the browser directly — the JWT
  cookie is scoped to the frontend origin.
- All seeded users have `@lynk.demo` emails. The seed script's
  wipe step keys on that suffix, so anything not seeded stays
  untouched on re-runs.
- The PWA service worker is built only on `npm run build`. The
  dev server doesn't serve it; install prompts only appear from
  the production build (`npm run preview` after build).

## License

Personal portfolio project. Code under MIT; the LynkCircles brand,
logo, and copy belong to the author.
