<div align="center">

# 🚀 TeleXtract

### Secure Telegram Media Downloader built with Next.js 16

Download videos, documents, photos, and other media from Telegram using your own authenticated Telegram account.

**Built with:**
Next.js 16 (App Router) • React 19 • TypeScript 5 • Tailwind CSS v4 • shadcn/ui • TeleProto (MTProto) • Server-Sent Events

</div>

<p align="center">
  <a href="https://github.com/sumit-dey-69/TeleXtract">
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract">
    <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract">
    <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract">
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8" alt="Tailwind CSS">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/sumit-dey-69/TeleXtract" alt="License">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract/stargazers">
    <img src="https://img.shields.io/github/stars/sumit-dey-69/TeleXtract" alt="Stars">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract/issues">
    <img src="https://img.shields.io/github/issues/sumit-dey-69/TeleXtract" alt="Issues">
  </a>
  <a href="https://github.com/sumit-dey-69/TeleXtract/pulls">
    <img src="https://img.shields.io/github/issues-pr/sumit-dey-69/TeleXtract" alt="Pull Requests">
  </a>
</p>

---

## ✨ Features

- 🔐 Secure Telegram authentication (OTP + 2FA)
- 📥 Download media from public and private Telegram messages
- ⚡ Real-time download progress via Server-Sent Events (SSE)
- ⏸ Pause, resume, and cancel downloads
- 📂 Custom download folders
- 🗂 Download history
- 🧹 Automatic cleanup of downloaded files
- 📱 Responsive interface
- 💾 Persistent Telegram sessions
- 🔄 Conflict handling for existing files
- 🚀 Built with Next.js 16 App Router
- 🐳 Docker and Docker Compose support

---

## 🏗 Architecture

```
Browser
   │
   ▼
Next.js 16 App Router
   │
   ├── Authentication
   ├── Download Manager
   ├── Job Queue
   ├── History Store
   ├── Folder Manager
   └── TeleProto (MTProto)
              │
              ▼
        Telegram Servers
```

---

## 📁 Project Structure

```
app/
 ├── api/
 │    ├── auth/            # login, code/2FA verification, logout
 │    ├── download/        # start a download job
 │    ├── resolve/         # resolve a t.me link before downloading
 │    ├── jobs/[jobId]/    # pause, resume, cancel, file, delete-file, remove
 │    ├── progress/[jobId] # SSE live progress stream
 │    ├── history/         # download history + per-item file/delete-file
 │    ├── folders/         # saved destination folders
 │    ├── pick-folder/     # native folder picker (server-side, unavailable)
 │    └── session/close/   # best-effort cleanup on tab close
 ├── page.tsx              # the dashboard (single page)
 └── layout.tsx

components/
 ├── ui/                   # shadcn/ui primitives
 └── ...                   # login-card, download-console, job-card, etc.

lib/
 ├── telegram/             # auth-manager, jobs, link-resolver, session/history/folders stores
 ├── types.ts
 └── utils.ts

downloads/                 # DOWNLOAD_ROOT default — created at runtime, git-ignored
data/                      # DATA_DIR default (session.txt, history.json, folders.json) — git-ignored
```

---

## 📦 Installation

Follow these steps to set up TeleXtract on your local machine for development or self-hosting.

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22 LTS or later
- **npm** (included with Node.js), **pnpm**, or **Bun**
- **Git**
- A **Telegram account**
- Telegram API credentials from **https://my.telegram.org/apps**

### Clone the Repository

```bash
git clone https://github.com/<your-username>/TeleXtract.git
cd TeleXtract
```

### Install Dependencies

Choose your preferred package manager.

Using **npm**:

```bash
npm install
```

Using **pnpm**:

```bash
pnpm install
```

Using **Bun**:

```bash
bun install
```

---

### Install Package Managers (Optional)

If you don't already have a package manager installed, you can install one using the following methods.

#### Bun

**macOS / Linux**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell)**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### pnpm

Using **npm**:

```bash
npm install -g pnpm
```

Using **Corepack** (recommended for Node.js 16.13+):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Using **Homebrew** (macOS):

```bash
brew install pnpm
```

Using **Chocolatey** (Windows):

```powershell
choco install pnpm
```

#### Node.js (npm)

If you don't have Node.js installed:

**Homebrew (macOS)**

```bash
brew install node
```

**Chocolatey (Windows)**

```powershell
choco install nodejs
```

Or download the latest installer from:

https://nodejs.org/

---

Once the dependencies are installed, continue with the [Configuration](#️-configuration) section.

## ⚙️ Configuration

Before running TeleXtract, you need to configure your Telegram API credentials.

### Step 1 — Create an Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### Step 2 — Configure the Environment Variables

Open `.env.local` and update the following values:

```env
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

DATA_DIR=./data
DOWNLOAD_ROOT=./downloads

TELEGRAM_SESSION=
FILE_RETENTION_MINUTES=60
```

### Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `TELEGRAM_API_ID` | ✅ | Your Telegram API ID obtained from https://my.telegram.org/apps |
| `TELEGRAM_API_HASH` | ✅ | Your Telegram API Hash obtained from https://my.telegram.org/apps |
| `DATA_DIR` | Optional | Directory used to store application data and Telegram sessions. |
| `DOWNLOAD_ROOT` | Optional | Default directory where downloaded media will be saved. |
| `TELEGRAM_SESSION` | Optional | Existing Telegram session string. Useful for restoring sessions after deployment. |
| `FILE_RETENTION_MINUTES` | Optional | How long a completed download is kept before automatic cleanup deletes it. Default `60`; set to `0` to disable time-based cleanup. Downloads are also deleted immediately on logout, and on tab close/refresh (best-effort — browsers can't distinguish the two). |

> **Important**
>
> - Never commit `.env.local` to version control.
> - Keep your Telegram API credentials private.
> - The provided `.env.example` can be safely committed since it contains placeholders only.

---

## ▶️ Running the Project

Once you've completed the installation and configuration, you're ready to start TeleXtract.

### Start the Development Server

Using **npm**:

```bash
npm run dev
```

Using **Bun**:

```bash
bun run dev
```

By default, the application will be available at:

```text
http://localhost:3000
```

If everything is configured correctly, you should see the TeleXtract home page.

---

### First-Time Login

The first time you launch TeleXtract, you'll need to authenticate with your Telegram account.

1. Enter your **Telegram phone number**.
2. Enter the **verification code (OTP)** sent by Telegram.
3. If your account has **Two-Step Verification (2FA)** enabled, enter your password.
4. Once authentication is complete, your Telegram session will be securely stored for future use.

> You only need to authenticate once unless your Telegram session expires or is revoked.

---

### Verify Your Setup

After logging in successfully, you should be able to:

- ✅ View the TeleXtract dashboard
- ✅ Paste a Telegram message link
- ✅ Resolve public and private Telegram messages
- ✅ Download supported media
- ✅ View download history and manage folders

If you've reached this point, your TeleXtract installation is ready to use.

---

## 📖 Usage

Once you're signed in, downloading media from Telegram is simple.

### Step 1 — Copy a Telegram Message Link

Open Telegram and navigate to the message containing the media you want to download.

TeleXtract supports both **public** and **private** Telegram message links.

**Public Channel**

```text
https://t.me/channel_name/123
```

**Private Channel**

```text
https://t.me/c/123456789/456
```

> **Note:** Your Telegram account must already have permission to access the message. TeleXtract cannot bypass Telegram's privacy restrictions.

### Step 2 — Paste the Link

Paste the copied Telegram message link into the input field on the dashboard.

TeleXtract will automatically:

- Validate the link
- Resolve the Telegram message
- Detect the available media
- Prepare the download

### Step 3 — Download the Media

Click **Download** to start downloading.

Downloads are streamed in real time using Server-Sent Events (SSE), allowing the UI to display live progress, speed, pause, resume, cancellation, and completion — all without refreshing the page.

During the download, you can:

- 📊 Monitor live progress
- ⏸ Pause the download
- ❌ Cancel the download

When the download completes, the media is saved to your configured download directory and added to your download history.

### Supported Media

TeleXtract can download most media types supported by Telegram, including:

- 📹 Videos
- 📷 Photos
- 📄 Documents
- 🎵 Audio files
- 🎙 Voice messages
- 🖼 Images
- 📦 Other downloadable Telegram media

### Download History

Every completed download is automatically recorded.

From the dashboard you can:

- View previous downloads
- Open downloaded files
- Organize downloads into folders
- Track download status

### File Conflict Handling

When a file with the same name already exists, TeleXtract prompts you before overwriting the existing file or choosing a different destination.

### Session Persistence

After your first successful login, TeleXtract securely stores your Telegram session.

Telegram sessions and download history are stored on disk. This means you won't need to log in every time you restart the application unless:

- Your session expires
- You manually log out
- Telegram invalidates the session

---

## 🚀 Deployment

TeleXtract is designed to run as a **persistent Node.js application**.

Unlike typical serverless applications, TeleXtract maintains Telegram sessions, streams download progress, and stores downloaded media on disk. Because of this, it requires a hosting platform that supports persistent storage and long-running processes.

### Recommended Platforms

| Platform | Status |
|----------|:------:|
| Render | ✅ Recommended |
| Railway | ✅ Recommended |
| Fly.io | ✅ Supported |
| Docker | ✅ Supported |
| VPS / Self-Hosted | ✅ Supported |
| Vercel | ❌ Not Recommended |

### Deploying on Render

1. Push your project to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your repository.
4. Configure the build and start commands.

**Build Command**

```bash
npm run build
```

**Start Command**

```bash
npm run start
```

Attach a **Persistent Disk** and configure the following environment variables:

```env
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

DATA_DIR=/var/data/telextract
DOWNLOAD_ROOT=/var/data/downloads
```

Deploy the application and authenticate with Telegram after the first launch.

### 🐳 Docker

TeleXtract uses a standalone Next.js production build (`output: "standalone"`) for smaller images and faster startup, and is the recommended deployment method when using Docker.

**Build the image:**

```bash
docker build -t telextract .
```

**Run the container:**

```bash
docker run \
  -p 3000:3000 \
  --env-file .env.local \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/downloads:/app/downloads \
  telextract
```

Mounting the `data` and `downloads` directories ensures Telegram sessions and downloaded files persist between container restarts.

### Docker Compose

```bash
docker compose up --build
```

This uses the included `docker-compose.yml`, which builds from the local `Dockerfile`, reads `.env.local`, publishes port `3000`, and mounts `./data` and `./downloads` the same way as the manual `docker run` command above.

#### Permission errors on mounted volumes (e.g. `EACCES ... mkdir '/var/data/downloads'`)

The container runs as a non-root user for security. A persistent volume
(a Render Disk, a Railway/Fly volume, a `docker run -v` mount) is attached
fresh at container start and typically comes in owned by `root`, so the
non-root user can't write to it by default. `docker-entrypoint.sh` fixes this
automatically on every container start: it `chown`s whatever `DATA_DIR` and
`DOWNLOAD_ROOT` actually point to, then drops to the non-root user before
starting the app — no manual steps needed. If you still see a permission
error, double-check `DATA_DIR`/`DOWNLOAD_ROOT` exactly match your volume's
mount path.

### Why Vercel Is Not Recommended

Although the frontend can be deployed on Vercel, the complete application is **not intended** to run inside Vercel Serverless Functions.

Limitations include:

- Read-only deployment filesystem
- No persistent storage
- Long-running downloads may be terminated
- Telegram sessions cannot be reliably persisted
- Server-Sent Events (SSE) are limited in serverless environments

A common deployment error is:

```text
ENOENT: no such file or directory, mkdir '/var/task/downloads'
```

For production deployments, use Render, Railway, Docker, Fly.io, or your own VPS.

### Production Checklist

Before making your deployment public, verify the following:

- ✅ Telegram API credentials are configured
- ✅ `.env.local` is **not** committed
- ✅ Persistent storage is attached
- ✅ HTTPS is enabled
- ✅ Access to the application is restricted if required
- ✅ Telegram authentication works correctly
- ✅ Downloads are written to persistent storage

Following these recommendations will ensure a stable and reliable TeleXtract deployment.

---

## 🔒 Security

TeleXtract authenticates directly with Telegram using the MTProto protocol. Your Telegram credentials are never exposed to the client or shared with third-party services.

### Security Best Practices

- Never commit `.env.local` to your repository.
- Keep your Telegram API credentials private.
- Protect your deployment using HTTPS.
- Restrict public access with authentication, IP allowlists, or a reverse proxy.
- Store Telegram sessions on persistent storage.
- Keep dependencies up to date.

> TeleXtract only accesses content that your authenticated Telegram account is already authorized to view.

---

## 🤝 Contributing

Contributions of all kinds are welcome!

### Getting Started

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/my-feature
```

3. Make your changes.
4. Commit your work.

```bash
git commit -m "feat: add awesome feature"
```

5. Push your branch.

```bash
git push origin feature/my-feature
```

6. Open a Pull Request.

### Before Submitting

Please ensure:

- The project builds successfully.
- Type checking passes.
- Existing functionality is not broken.
- New code follows the project's coding style.

If you're unsure about a feature or significant change, consider opening an issue first to discuss it.

---

## 🛣️ Roadmap

Planned improvements include:

- Multi-account support
- Download queue priorities
- Scheduled downloads
- Resume after restart
- Search and filtering
- Bulk downloads
- Folder synchronization
- Download statistics
- Advanced download filters
- Mobile UI improvements
- Performance optimizations
- Plugin support

---

## 📄 License

TeleXtract is released under the **MIT License**.

See the [LICENSE](LICENSE) file for more details.

---

## 🙏 Acknowledgements

TeleXtract is built using several excellent open-source projects:

- Next.js
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TeleProto
- Radix UI
- Lucide React

A huge thanks to the maintainers and contributors of these projects.

---

## ⚠️ Disclaimer

TeleXtract is an independent open-source project.

It is **not affiliated with, endorsed by, sponsored by, or associated with Telegram Messenger LLP**.

This application only downloads media that the authenticated Telegram account is already authorized to access. Users are responsible for ensuring they comply with Telegram's Terms of Service, applicable copyright laws, and any other legal requirements in their jurisdiction.

---

<div align="center">

### ⭐ Star the Repository

If TeleXtract helps you, consider giving the project a star on GitHub. It helps others discover the project and supports future development.

Made with ❤️ using **Next.js**, **React**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **TeleProto**.

</div>
