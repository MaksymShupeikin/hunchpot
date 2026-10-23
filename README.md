# Hunchpot

Campus bets with friends: students create a bet, others stake on a side, the pot splits among the winners (parimutuel, no house money).

## Run

```sh
docker compose up --build
```

- App: http://localhost:3000 (open it in a phone-sized window, the UI is mobile-first)
- API: http://localhost:8000/docs
- Mail: http://localhost:8025 (Mailpit catches every email the app sends, nothing leaves the machine)
- Postgres: localhost:5432 (`hunchpot` / `hunchpot`)

## Signing in

Students sign in with their school email: the API sends a 6-digit code, the domain decides the campus.
Demo addresses: any `@northgate.edu` (open campus; `alex.r@northgate.edu` is the seeded demo student),
any `@ridgeview.edu` (campus on its waitlist), anything else lands on the "not on the map yet" list.
Read the code in Mailpit.

Rules: anyone can browse the feed (every open campus for a guest), bets and the leaderboard. Sign-in is
asked for only when it is needed: tapping a side opens it in a sheet over the bet and continues to the
stake; publishing a bet, Pocket and Me ask too. Staking, creating and "who's in" need a verified student
of that bet's campus; a waitlisted campus opens by itself at `unlock_at` students.

## Email in production

Mail goes out over plain SMTP to our own server (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
`SMTP_STARTTLS`, `SMTP_FROM`), no third-party sending service. In production that is our Postfix
(e.g. docker-mailserver) with SPF, DKIM and DMARC on hunchpot.com, a PTR record for the server IP and
port 25 open. Also set `SECRET` (long random) on the API and `COOKIE_SECURE=true` on the web app.

The API creates its tables and a demo campus (Northgate U, 12 students, 12 bets) on first start. Reset it with `docker compose down -v`.

Design work with hot reload: keep `db` and `api` running in Docker and run the web app locally:

```sh
docker compose up -d db api
cd web && npm install && npm run dev
```

## Layout

```
api/                FastAPI + SQLAlchemy (async)
  src/models/       School, User, Bet, Outcome, Stake (money in cents)
  src/routers/      /bets, /bets/{id}/stakes, /me, /me/bets, /leaderboard
  src/services/     demo seed
web/                Next.js 16 (App Router, Cache Components)
  src/app/(tabs)/   feed /, bet /b/[id], /pocket, /rank, /me
  src/app/new/      create-bet composer
  src/app/actions   server actions -> API
  src/components/   BetScreen, PotField, Stake (slide-to-stake), Nav, ...
  scripts/icons.mjs draws the icon set -> src/components/Icon.tsx (npm run icons)
  public/brand/     logo and wordmark (SVG + PNG), served at /brand/...
  src/app/icon.svg  tab icon: the logo, its lid turns white in dark mode
  src/app/favicon.ico, apple-icon.png  rendered from the logo with ImageMagick
                    (apple icon sits on void with a white lid: iOS needs an opaque square)
PRODUCT.md          product context; .impeccable/ holds the design direction
```

## Not built yet

Every shortcut is marked in code with `shortcut:`; `grep -rn "shortcut:" api web/src` lists them.

- Payments: Add / Cash out are disabled; balances are seed data.
- Settlement: no one resolves bets yet; settled bets come from the seed.
- Platform fee: odds are pure pot / side pot.
- Migrations: tables come from `create_all`; switch to Alembic before real data. Older demo databases
  need `api/sql/2026-10-23-campus-auth.sql` once (or `docker compose down -v` to start fresh).
- Campuses: one per student; cross-campus bets, invites for schools without email, yearly re-verification
  and result disputes come next. The school list is the seed; import a domain list before launch.
- Notifications: none yet. Plan: Web Push (on iPhone only after "Add to Home Screen"), asked for after the first stake; results of your bets arrive automatically.
