# TeleXtract — Next.js + TypeScript + shadcn/ui

This is the UI/UX of your original Flask + Telethon app, rebuilt as a
Next.js 16 (App Router) + TypeScript project styled with Tailwind + shadcn/ui
primitives. It keeps the original "console" aesthetic (Space Grotesk / Inter /
JetBrains Mono, dark background, teal accent, bar-meter progress).

**The download engine is not wired up yet — this ships with a mock backend**
so the whole UI is clickable today. See "Wiring up the real backend" below.

## What's here

- `app/page.tsx` — main screen: auth gate → download console → active/history tabs
- `components/` — `login-card`, `download-console`, `job-card`, `history-card`,
  `conflict-dialog`, `job-meter`, plus shadcn primitives in `components/ui/`
- `app/api/**/route.ts` — one route per original Flask endpoint (`/api/auth/*`,
  `/api/jobs/*`, `/api/history/*`, `/api/progress/:jobId` as SSE, etc.)
- `lib/mock-store.ts` — in-memory fake backend the routes currently call
- `lib/types.ts` — shared `Job` / `HistoryItem` / `AuthStatus` shapes

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Log in with any phone number; use code `2222` to
see the 2FA/password step, or any other code to skip straight in. Starting a
"download" simulates progress over a few seconds so you can see pause/resume/
cancel and the history tab working.

## Wiring up the real backend

Every file in `app/api/**/route.ts` has a `TODO(backend)` comment marking
exactly what it should call instead of the mock. The request/response shapes
already match your original Flask routes, so the frontend won't need to
change — only the route handler bodies and `lib/mock-store.ts`.

**Before you wire it up for real, know the constraints that come with moving
this to Vercel:**

1. **Telethon is Python; Vercel functions run Node.js.** You'll need to either
   (a) rewrite the download engine in Node using [`gramjs`](https://gram.js.org/)
   (the closest equivalent to Telethon), or (b) keep a small Python service
   running elsewhere and have these Next.js routes call it over HTTP.

2. **Long-running downloads and pause/resume don't fit serverless functions.**
   Vercel functions are stateless and time-limited. A multi-minute video
   download with pause/resume needs a persistent process — a small VPS,
   Railway, Render, or Fly.io app — not a Vercel serverless function. Vercel
   can still host this Next.js frontend/API layer; it would just proxy to
   that persistent worker rather than doing the download itself.

3. **The SSE progress endpoint** (`/api/progress/[jobId]`) needs a long-lived
   connection to push updates. This works locally and on a persistent Node
   host; on Vercel it's constrained by the function's execution limit, so for
   production you'd likely poll `/api/jobs` on an interval instead, or push
   updates through a service built for it (e.g. Pusher, Ably, or your worker's
   own websocket).

4. **The Telegram session file is a live credential.** Whatever replaces
   `my_session.session` (however you persist gramjs auth) should never be
   reachable by anyone but you — put real authentication in front of this
   app before putting it on a public URL, since anyone who can reach these
   API routes could act as your Telegram account.

5. **The native folder-picker dialog can never work on a server** (this was
   already Codespaces-incompatible in the original app) — `/api/pick-folder`
   intentionally always returns "unavailable," matching the original's
   headless-environment behavior. Users type a folder path instead.

## Deploying the frontend to Vercel

The UI and mock API deploy to Vercel as-is:

```bash
npm i -g vercel   # or use the Vercel dashboard
vercel
```

Once you've wired a real backend per above, the same `vercel` deploy will
pick it up — just make sure any backend URL/secrets are added as Vercel
environment variables (Project Settings → Environment Variables), never
committed to the repo.

## shadcn/ui

Components live in `components/ui/`, written by hand to match this project's
theme rather than generated, but `components.json` is in place so you can
also run `npx shadcn@latest add <component>` to pull in more of them later.
