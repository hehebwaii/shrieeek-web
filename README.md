# 🦸 ShrIEEEk '26 — Digital Superhero Card System

An interactive digital superhero character card system built for IEEE events. Participants receive a randomized Marvel-inspired hero persona, scan QR codes to battle other participants in "Hero Power Clash" mini-games, and climb the real-time XP leaderboard.

## ✨ Features

- **🎭 Random Superhero Assignment** — Each participant receives a randomized hero with unique powers and combat class
- **📱 QR Code Scanning** — Scan other participants' QR codes or enter manual backup codes
- **⚔️ Hero Power Clash** — Rock-paper-scissors-style tactical combat during scans (Strike vs Shield vs Blitz)
- **🏆 Live Leaderboard** — Real-time XP rankings with admin-controlled privacy toggle
- **📢 Live Announcements** — Broadcast urgent/event/info banners to all student devices instantly
- **🛡️ Admin Panel** — Full event control: pause/resume, batch import, individual resets, CSV export
- **📡 Real-Time Sync** — Server-Sent Events (SSE) push all admin changes to participant screens instantly
- **🔒 Secure Auth** — JWT session tokens, admin passphrase protection, anti-abuse (self-scan & duplicate pair blocking)
- **📴 Offline Support** — Service Worker with offline fallback for low-connectivity venues

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/shrieeek-web.git
cd shrieeek-web
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key |
| `ADMIN_PASSWORD` | Choose any secure passphrase for the admin panel |
| `JWT_SECRET` | Generate a random 32+ character string |

### 3. Set Up Database
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of [`src/lib/schema.sql`](src/lib/schema.sql)
3. Click **Run** to create all tables, indexes, and seed data

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing / Login page
│   ├── card/page.tsx         # Participant hero card view
│   ├── scan/page.tsx         # QR scanner + Hero Power Clash
│   ├── leaderboard/page.tsx  # Public XP leaderboard
│   ├── admin/page.tsx        # Admin control panel
│   └── api/                  # API routes (auth, scan, admin, sync)
├── components/               # Reusable UI components
├── hooks/                    # Custom React hooks (useEventSync)
└── lib/                      # Core logic (db, auth, types, characters)
```

## 🔐 Security Notes

- **No secrets are committed** — All API keys, passwords, and JWT secrets are loaded from environment variables
- `.env.local` is in `.gitignore` and never tracked by git
- The `SUPABASE_SERVICE_ROLE_KEY` is server-side only (never exposed to the client)
- Admin authentication uses JWT with HttpOnly secure cookies
- Anti-abuse protections: self-scan blocking, duplicate pair blocking

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Styling**: Tailwind CSS + custom comic book theme
- **Auth**: JWT (jsonwebtoken)
- **Real-time**: Server-Sent Events (SSE)
- **Icons**: Lucide React

## 📄 License

MIT
