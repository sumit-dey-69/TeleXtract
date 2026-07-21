# TeleXtract — Next.js + TypeScript + shadcn/ui + real Telegram backend

The UI/UX of your original Flask + Telethon app, rebuilt as Next.js 16 (App
Router) + TypeScript, styled with Tailwind + shadcn/ui — **now wired to a
real Telegram backend**, not the mock from the first pass.

## What changed from the UI-only version

The download engine is real, built on [`teleproto`](https://npmjs.com/package/teleproto)
— an actively maintained fork of gramjs (the original `telegram` npm package
is now archived; its author points people to teleproto). It lives in
`lib/telegram/`:

- `env.ts` — reads `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` from the environment
- `session-store.ts` — persists your login session to `data/session.txt`
- `auth-manager.ts` — the real phone → code → 2FA login flow
- `link-resolver.ts` — parses public (`t.me/name/123`) and private
  (`t.me/c/123/456`) message links and fetches the message
- `jobs.ts` — runs real downloads, streaming straight to disk, with
  pause/cancel via `AbortController`
- `history-store.ts` / `folders-store.ts` — persisted JSON, same shape as
  the original app's `history.json` / `folders.json`

Every route under `app/api/**` now calls these instead of the old mock store.

## One honest limitation

**"Resume" restarts the download rather than continuing from where it left
off.** Byte-offset resume was removed from gramjs's public API upstream (and
isn't exposed in teleproto's `downloadMedia`/`downloadFile` either — see
[gram-js/gramjs#326](https://github.com/gram-js/gramjs/issues/326)). Pause and
cancel both work correctly (they abort the in-flight request via
`AbortSignal`); resume just starts over. True byte-level resume is possible
via Telegram's raw `upload.GetFile` with a manually managed offset, but it's
enough lower-level protocol work (chunk alignment, DC routing) that it's worth
doing as a deliberate follow-up rather than folding in silently here.

## Environment variables

```env
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

DATA_DIR=
DOWNLOAD_ROOT=

TELEGRAM_SESSION=
```

- `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are **required** — get them from
  <https://my.telegram.org/apps>.
- `DATA_DIR` should point to a persistent, writable directory — a mounted
  volume on Railway/Render/Fly.io, or a real path on a VPS/Docker host. This
  is where `session.txt`, `history.json`, and `folders.json` live.
- `DOWNLOAD_ROOT` should point to a writable directory where downloaded media
  is stored, for the same reason.
- `TELEGRAM_SESSION` is optional — set it to persist your Telegram session
  across deployments/restarts even if the host's disk doesn't.

You don't have to set `DATA_DIR` / `DOWNLOAD_ROOT` at all — if left unset,
the app picks a correct location automatically (see below).

## Setup

1. Get an API ID and hash from <https://my.telegram.org/apps>.
2. Copy `.env.example` to `.env.local` and fill in `TELEGRAM_API_ID` /
   `TELEGRAM_API_HASH`.
3. `npm install`
4. `npm run dev`, open <http://localhost:3000>, log in with your real phone
   number and Telegram's actual login code.

Your session is saved to `data/session.txt` so you won't need to log in again
on the next run. `data/` and `downloads/` are git-ignored.

## How the writable-directory fallback works

`lib/telegram/env.ts` never hardcodes `./downloads` as the only option, and
never writes to the app's own bundle directory. At startup it:

1. Uses `DATA_DIR` / `DOWNLOAD_ROOT` if you set them — full stop, your
   config wins.
2. Otherwise, checks whether the app's working directory is actually
   writable (it detects Vercel directly via `process.env.VERCEL`, and
   probes with a real test-write for every other host, so this isn't
   Vercel-specific).
3. If it's writable (Railway, Render, Fly.io, a VPS, Docker, local dev), it
   defaults to `./data` and `./downloads`.
4. If it isn't (Vercel, or any other read-only-bundle host), it falls back
   to a directory under the OS temp dir instead of crashing.

Any relative folder path you type into the app's own "destination folder"
field is also resolved against `DOWNLOAD_ROOT`, never against the app's
working directory — so it can't accidentally end up back under a read-only
path either.

**The temp-dir fallback unblocks startup, it doesn't make Vercel a good
fit.** Temp storage there is wiped between invocations and isn't shared
across instances, so sessions, in-progress downloads, and history won't
reliably persist. For real use, set `DATA_DIR` / `DOWNLOAD_ROOT` to a mounted
volume on a persistent host — see below.

## Deploying

**This cannot run as Vercel serverless functions** in any real sense — the
temp-dir fallback above only stops the crash:

- Downloads and the SSE progress stream need a long-lived Node process;
  Vercel functions are stateless and time-limited.
- The session file and downloaded videos need a persistent disk; Vercel's
  temp dir doesn't survive between requests.

Deploy this Next.js app to a host with a persistent process and disk instead
— **Railway, Render, or Fly.io** all work well for a single Next.js app:

1. Push this project to a Git repo.
2. Create a new service on your chosen host, pointing at the repo.
   - Build command: `npm run build`
   - Start command: `npm run start`
3. Set `TELEGRAM_API_ID` and `TELEGRAM_API_HASH`. Optionally set `DATA_DIR` /
   `DOWNLOAD_ROOT` to point at your mounted volume explicitly (recommended)
   — otherwise the defaults `./data` / `./downloads` are used, which also
   work fine as long as the volume is mounted at the app's working directory.
4. **Attach a persistent volume** at whatever `DATA_DIR` and `DOWNLOAD_ROOT`
   resolve to. Without this, your session and downloaded files disappear on
   every redeploy.
5. After your first login through the deployed app, open
   `<DATA_DIR>/session.txt` (via your host's shell/file browser) and copy its
   contents into a `TELEGRAM_SESSION` environment variable as a backup —
   belt-and-suspenders in case the volume ever gets reset.

If you'd still like a Vercel-hosted piece: you could deploy just the Next.js
frontend to Vercel and have it call this backend over HTTP on Railway/Render/
Fly, rather than running the download engine inside Vercel's functions. That's
a bigger restructuring (splitting frontend/backend into two deployments) and
isn't done here — this project currently expects to run as one app on one
persistent host.

## Security

Since this may be publicly reachable, remember: **whoever can reach this
app's `/api/*` routes can act as your Telegram account** (start downloads,
read your channels). The login gate is Telegram's own phone/code/2FA flow —
there's no separate password wall in front of the app itself. If you deploy
this somewhere public, put your host's access controls in front of it (IP
allowlist, Railway/Render's built-in auth options, or a reverse proxy with
basic auth) rather than relying on the Telegram login alone.

## Running locally after cloning

```bash
cp .env.example .env.local   # fill in TELEGRAM_API_ID / TELEGRAM_API_HASH
npm install
npm run dev
```
