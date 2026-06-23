# Botola Go — Admin Dashboard

A light-themed admin console for the **Botola Go** football platform. Built as the
companion to the (dark-themed) mobile app, it gives admins full control over players,
the fantasy scoring engine, fixtures, users, content (T&C / FAQ) and role-based access.

> **Status:** Frontend-only. All data is served from an in-memory **mock RTK Query layer**
> designed to be swapped for a real backend with minimal changes (see _Going live_ below).

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | React 18 + TypeScript (strict)                     |
| Build tool         | Vite 5                                             |
| Styling            | Tailwind CSS 3 (custom design tokens, light theme) |
| State / data       | Redux Toolkit + RTK Query                          |
| Routing            | React Router v6 (`createBrowserRouter`)            |
| Charts             | Recharts                                           |
| Icons              | lucide-react                                       |
| Validation         | Zod (env + utilities)                              |

**Primary color** is the app's signature blue (`primary-600 = #1d4ed8`), with the brand
navy used on the auth screens.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # tsc -b && vite build  (type-checked production build)
npm run preview    # serve the production build
npm run typecheck  # tsc --noEmit equivalent (via tsc -b)
```

### Demo login

Auth is mocked — **any password works**. The email selects which admin (and therefore
which role) you sign in as:

| Email                       | Role          | What they can do                          |
| --------------------------- | ------------- | ----------------------------------------- |
| `binarybards27@gmail.com`   | Super Admin   | Everything (wildcard `*`)                 |
| `sophia@botolago.app`      | Admin         | Football, users & content (no admin mgmt) |
| `daniel@botolago.app`      | Content Editor| CMS / FAQ + read-only football            |
| `mei@botolago.app`         | Analyst       | Read-only across the board                |

Switch accounts to watch the sidebar, buttons and routes adapt to permissions.

---

## Project structure

```
src/
├── main.tsx                  # App entry, providers
├── App.tsx                   # Router outlet only
├── router/                   # createBrowserRouter + PrivateRoute (auth + permission guard)
├── pages/                    # route-level screens (auth, dashboard, players, scoring, …)
├── components/
│   ├── ui/                   # reusable design system (Button, Input, Table, Modal, …)
│   ├── layout/               # Sidebar, Topbar, PageHeader, AdminLayout, nav.config
│   ├── shared/               # Avatar, StatusBadge, PermissionGate, StatCard, Toaster, …
│   ├── auth/ players/ users/ fixtures/ cms/   # feature modules (types + local logic)
├── store/                    # configureStore, rootReducer, typed hooks, ui slice
├── services/
│   ├── api.ts                # RTK Query base (fakeBaseQuery)
│   ├── endpoints/            # authApi, playersApi, usersApi, fixturesApi, cmsApi, …
│   └── mock/                 # seeded mock data + pagination/search helpers
├── hooks/                    # useAuth, useDebounce, useToast
├── lib/                      # utils (cn, formatters), constants, scoring engine
├── types/                    # global api/common types
├── config/                   # zod-validated env
├── constants/                # centralised ROUTES
└── styles/                   # tailwind + global css
```

**Reusable components everywhere:** every screen is composed from `components/ui/*`
primitives — no bespoke buttons/inputs/tables. The generic `DataTable<T>`, `Modal`,
`Drawer`, `ConfirmDialog`, `Pagination` and `PermissionGate` are the workhorses.

---

## The scoring engine

The fantasy points model lives in [`src/lib/scoring.ts`](src/lib/scoring.ts) — a faithful
TypeScript port of the reference Python model, with the weight tables exposed so the UI
renders the rules and live calculator from a single source of truth.

```
base score   = Σ (stat × position-weight)   # minutes scored per 30 mins
final rating = (base + bonus) × difficulty
score /10    = clamp((final / N) × 10, 0, 10)   # N defaults to 30
```

Position weight tables (goals/assists/clean-sheets/etc.) match the spec exactly. The
**Scoring Engine** screen (`/scoring`) provides an interactive calculator with a live
0–10 rating, a contribution breakdown, and a per-position rules reference.

---

## Admin model & rules (RBAC)

Access is controlled by **roles → permissions**, enforced in three layers:

1. **Route guard** — `PrivateRoute` redirects unauthenticated users to login and shows a
   403 screen when a required permission is missing.
2. **Navigation** — the sidebar hides sections the user can't access.
3. **Actions** — `<PermissionGate permission="…">` hides create/edit/delete controls.

Permissions are namespaced (`players.manage`, `cms.manage`, `admins.manage`, …) and
grouped for the role editor. Roles ship pre-defined in
[`src/lib/constants.ts`](src/lib/constants.ts) (`ADMIN_ROLES`) and can be edited on the
**Admins & Roles** screen. The `super_admin` role holds the wildcard `*`.

### Data sources (important product principle)

Following how real fantasy platforms work, data is split into three tiers and the admin
UI treats each differently:

1. **Feed / API-sourced — _monitor & sync_, not CRUD:** fixtures, results, live scores,
   player match events (goals/assists/cards/minutes). The Fixtures page is read-only with
   a "Sync from feed" action; admins only adjust the fantasy-owned **difficulty (FDR)**.
2. **Business-owned — _admin-managed_:** scoring rules, gameweek deadlines, difficulty,
   CMS/legal, roles, settings, and the data-feed integration (Settings → Data Feed).
3. **User-generated — _moderate only_:** accounts, fantasy squads, leagues. Admins view,
   inspect (team detail) and ban — they never create these.

**House rules baked in**

- Only **Super Admin** can manage other admins and roles (`admins.manage`).
- Scoring weights / normalisation are gated behind `scoring.manage`.
- Destructive actions (ban user, delete player/fixture/admin) require a confirm dialog.
- Player ratings are **recomputed automatically** whenever stats or position change.

---

## Features

- **Dashboard** — KPIs, user-growth & points-distribution charts, top managers, activity.
- **Analytics** — engagement & monetisation deep-dive (DAU, funnel, retention, revenue).
- **Players** — searchable/sortable table, create/edit with live rating preview, detail
  page with full scoring breakdown.
- **Scoring Engine** — interactive calculator + rules reference.
- **Fixtures** — **read-only, synced from the sports data feed** ("Sync from feed" +
  last-synced indicator). The only admin-editable knob is per-fixture **difficulty (FDR)**,
  via the detail drawer.
- **Gameweeks** — deadlines, averages, highest scores, most-captained monitoring.
- **Users** — moderation (activate / suspend / ban), detail drawer, filters.
- **Teams** — click any team for full detail: owner, **starting XI + bench**, captain/vice,
  per-player gameweek points, squad value/bank, formation, chips.
- **Leaderboard** — top-3 podium + ranked table.
- **CMS & FAQ** — pages in a clean table + markdown editor with live preview; FAQ manager.
- **Admins & Roles** — invite admins, assign roles, edit permission matrices.
- **Settings** — split into sub-sections (General · Gameplay & Scoring · Notifications ·
  Data Feed · Branding · Security), shown one at a time.
- **Profile** — account, effective permissions, password.

---

## Going live (swapping the mock API)

The mock layer is isolated. To connect a real backend:

1. In `src/services/api.ts`, replace `fakeBaseQuery()` with
   `fetchBaseQuery({ baseUrl: env.apiBaseUrl, prepareHeaders })` (attach the JWT from
   `state.auth.token`).
2. In each `services/endpoints/*.ts`, convert `queryFn` handlers to `query`/`mutation`
   definitions hitting real routes. The endpoint names, args and tag invalidation already
   model a REST API, so component code is unaffected.
3. Set `VITE_USE_MOCKS=false` and point `VITE_API_BASE_URL` at your API.
```
