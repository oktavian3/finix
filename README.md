# Finix — On-Chain Personal Finance Tracker

> **Track your finances on-chain. Powered by Tatum RPC + Walrus decentralized storage + Sui Network.**

Finix is a decentralized personal finance management app built for the **Tatum x Walrus Hackathon**. Connect your Sui wallet (Slush), log income & expenses, and have your data permanently stored as certified blobs on Walrus — no database, no centralized server.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **📊 Dashboard** | Real-time income/expense overview, saving rate, category breakdown, 6-month trends |
| **💸 Transactions** | Add/delete/filter income & expenses, search by description |
| **🎯 Goals** | Set savings goals with emoji, track progress |
| **🔥 Streaks** | Daily activity tracking — 1-day streak per active day, resets after 36h idle |
| **🤖 AI Advisor** | DeepSeek-powered financial analysis based on your aggregated on-chain data |
| **🏆 Achievements** | Unlock badges as you hit milestones |
| **📤 Export CSV** | Download your transaction history |
| **🔐 Wallet Login** | No password — your Sui wallet is your identity (Slush Wallet) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Next.js)                     │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │ Dashboard│  │Transactns│  │ AI     │  │ Profile  │  │
│  └──────────┘  └──────────┘  └────────┘  └──────────┘  │
│          │              │            │           │        │
│          └──────────────┴────────────┴───────────┘        │
│                          │                                │
│              ┌───────────▼────────────┐                   │
│              │   @mysten/dapp-kit     │ ← Slush Wallet    │
│              │   Wallet Connection    │                   │
│              └────────────────────────┘                   │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Tatum RPC (Sui)       │  ← API calls via /api/*
              │   + WalrusClient        │
              └────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Walrus (testnet)       │  ← Certified blobs
              │   deletable: false       │     epochs: 52
              │   publisher + aggregator │
              └─────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Sui Testnet │
                    └─────────────┘
```

### Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, Recharts, Lucide Icons
- **Blockchain:** Sui Network (testnet via Tatum RPC)
- **Storage:** Walrus decentralized blob storage (certified, 52 epochs)
- **Wallet:** `@mysten/dapp-kit` v1.0.6 (Slush Wallet)
- **AI:** DeepSeek API (server-side, only aggregated data)
- **Deployment:** Vercel

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Sui wallet (Slush Wallet for Chrome/Brave: [install](https://chromewebstore.google.com/detail/slush-sui-wallet/ahankfimgcojpdlbephobhdmhpgcghme))
- Tatum API key (free tier: [tatum.io](https://tatum.io))
- DeepSeek API key (optional, for AI Advisor)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_TATUM_RPC_URL` | ✅ | Sui testnet RPC via Tatum gateway |
| `NEXT_PUBLIC_TATUM_API_KEY` | ✅ | Your Tatum API key |
| `SUI_PRIVATE_KEY` | ✅ | Builder wallet for Walrus signing (`suiprivkey...`) |
| `NEXT_PUBLIC_WALRUS_NETWORK` | ❌ | Defaults to `mainnet`; set `testnet` |
| `DEEPSEEK_API_KEY` | ❌ | For AI Advisor feature |

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## 🔧 How It Works

### Wallet Connection
- Uses `@mysten/dapp-kit` to connect to any Sui-compatible wallet (Slush recommended).
- `autoConnect: true` — wallet state persists across page refreshes.
- Data loads from **localStorage cache** first (instant), then syncs with Walrus blob.

### Walrus Storage (Certified Blobs)
1. User adds a transaction → data is saved to `localStorage` instantly.
2. A POST request to `/api/walrus` triggers server-side `WalrusClient.writeBlob()`:
   - **Network:** Sui Testnet via Walrus testnet publisher
   - **Store type:** Certified blob (`deletable: false`)
   - **Duration:** 52 epochs (~1 year)
   - **Signer:** Ed25519Keypair from `SUI_PRIVATE_KEY` env var
3. On page reload, data loads from local cache → Walrus aggregator fallback.

### Tatum RPC Integration
- Custom `SuiClient` wrapper in `lib/sui-client.ts` fetches via `https://sui-testnet.gateway.tatum.io` with `x-api-key` header.
- Used for on-chain queries (wallet balance lookup).

### AI Advisor
- Sends **aggregated** data (monthly summaries, categories, goals) — never raw transactions.
- DeepSeek API called server-side via `/api/ai-analyze`.
- Produces English-language financial insights & recommendations.

### Streak System
- Logging a transaction on a new day increments streak.
- If no transaction for 36+ hours, streak resets to 0 on next page load.
- Longest streak tracked & badges awarded.

---

## 📁 Project Structure

```
finix/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/            # Main dashboard
│   ├── transactions/         # Add/filter transactions
│   ├── goals/                # Savings goals
│   ├── achievements/         # Badge system
│   ├── ai-advisor/           # DeepSeek analysis
│   ├── analytics/            # Charts & trends
│   ├── profile/              # Settings & export
│   └── api/
│       ├── walrus/           # Walrus store/read endpoints
│       └── ai-analyze/       # DeepSeek proxy
├── components/
│   ├── layout/               # AppShell, Sidebar
│   ├── dashboard/            # MetricCard, Charts, etc.
│   ├── transactions/         # AddTransactionModal
│   └── ui/                   # Button, Modal, Toast
├── hooks/
│   ├── useWallet.tsx         # dapp-kit wrapper
│   └── useFinixData.tsx      # Data context + persistence
├── lib/
│   ├── walrus-sdk.ts         # WalrusClient + signing
│   ├── walrus-client.ts      # Client-side HTTP Publisher fallback
│   ├── sui-client.ts         # Tatum RPC wrapper
│   ├── data-store.ts         # Local logic, streaks, summaries
│   └── analytics.ts          # Formatting helpers
├── types/
│   └── finix.ts              # TypeScript types
├── .env.example
└── package.json
```

---

## 🌐 Deployed App

[https://finix-one.vercel.app](https://finix-one.vercel.app)

---

## 🏆 Hackathon Notes

- **Tatum RPC** used for all Sui RPC interactions
- **Walrus** stores user data as certified blobs on Sui testnet
- **Server-side signing** with Ed25519Keypair for Walrus blob certification
- **No centralized database** — 100% on-chain + Walrus storage
- **Wallet-first auth** — no email, no passwords

---

## 📹 Demo Video

[Link to demo video — record 2-3 minutes showing: connect wallet → add transaction → Walrus explorer → dashboard → AI advisor → profile export]
