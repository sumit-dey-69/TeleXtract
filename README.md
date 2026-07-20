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

## Setup

1. Get an API ID and hash from <https://my.telegram.org/apps>.
2. Copy `.env.example` to `.env.local` and fill in `TELEGRAM_API_ID` /
   `TELEGRAM_API_HASH`.
3. `npm install`
4. `npm run dev`, open <http://localhost:3000>, log in with your real phone
   number and Telegram's actual login code.

Your session is saved to `data/session.txt` so you won't need to log in again
on the next run. `data/` and `downloads/` are git-ignored.

## Deploying

**This cannot run as Vercel serverless functions** — the reasons from the
first pass still apply and now matter for real:

- Downloads and the SSE progress stream need a long-lived Node process;
  Vercel functions are stateless and time-limited.
- The session file and downloaded videos need a persistent disk; Vercel
  functions don't have one.

Deploy this Next.js app to a host with a persistent process and disk instead
— **Railway, Render, or Fly.io** all work well for a single Next.js app:

1. Push this project to a Git repo.
2. Create a new service on your chosen host, pointing at the repo.
   - Build command: `npm run build`
   - Start command: `npm run start`
3. Set environment variables: `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, and
   optionally `DATA_DIR` / `DOWNLOAD_ROOT` if you want them somewhere other
   than the defaults.
4. **Attach a persistent volume** mounted at whatever `DATA_DIR` and
   `DOWNLOAD_ROOT` point to (or just leave the defaults `./data` and
   `./downloads` and mount the volume at the app's working directory). Without
   this, your session and downloaded files disappear on every redeploy.
5. After your first login through the deployed app, open `data/session.txt`
   (via your host's shell/file browser) and copy its contents into a
   `TELEGRAM_SESSION` environment variable as a backup — belt-and-suspenders
   in case the volume ever gets reset.

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
