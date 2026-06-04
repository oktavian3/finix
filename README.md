# Finix

> **Live demo:** [getfinix.xyz](https://getfinix.xyz)

<p align="center">
  <a href="https://getfinix.xyz">
    <img src="public/favicon.svg" width="48" height="48" alt="Finix logo">
  </a>
</p>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)](https://nextjs.org/)
[![Sui](https://img.shields.io/badge/Sui-Mainnet-4DA2FF?logo=react)](https://sui.io/)
[![Walrus](https://img.shields.io/badge/Walrus-Storage-FF6B6B)]()
[![Tatum](https://img.shields.io/badge/Tatum-RPC-0088CC)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)]()

</div>

**Finix** is a wallet-native personal finance tracker on **Sui Network**. Connect your Sui wallet → track income/expenses → set savings goals → get AI-powered insights. All data stored on **Walrus** — permanent, verifiable, user-owned.

No signup. No email. Just your wallet.

## Production Mainnet Configuration

- Uses Tatum Sui Mainnet RPC through the wallet client configuration.
- Integrates Walrus Mainnet storage through `/api/walrus` with no Testnet fallback.
- Defaults the app wallet/storage flow to Sui Mainnet only.
- Encrypts Walrus snapshots before upload with the current local encryption helper; replace this with Seal before storing real production finance data.
- Includes AI Advisor through a server-side DeepSeek proxy.

## Routes

- `/` landing page
- `/dashboard` finance dashboard
- `/transactions` transaction list and add flow
- `/analytics` charts and summaries
- `/goals` savings goals
- `/achievements` milestone badges
- `/ai-advisor` AI financial insights
- `/profile` wallet, export, and data settings

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values.

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUI_NETWORK` | Yes | Use `mainnet`; any other network is rejected. |
| `NEXT_PUBLIC_TATUM_RPC_URL` | Yes | Tatum Sui Mainnet RPC URL. |
| `NEXT_PUBLIC_TATUM_API_KEY` | Yes | Tatum API key used by the browser wallet RPC client. |
| `SUI_PRIVATE_KEY` | Required for server Walrus writes | Builder/signer key for future SDK-based Walrus Mainnet storage. |
| `NEXT_PUBLIC_WALRUS_NETWORK` | Yes | Use `mainnet`; Testnet is not supported in production. |
| `WALRUS_PUBLISHER_URL` | Recommended | Server-side Mainnet HTTP Publisher URL. |
| `WALRUS_AGGREGATOR_URL` | Recommended | Server-side Mainnet aggregator URL for reads. |
| `WALRUS_EPOCHS` | Optional | Storage duration in Walrus epochs; defaults to `52`. |
| `WALRUS_PUBLISHER_AUTH_TOKEN` | Optional | Server-only bearer token for authenticated publishers. |
| `DEEPSEEK_API_KEY` | Required for AI Advisor | Server-side AI API key. |

## Data Model

The transaction schema lives in `types/finix.ts`. Do not change it casually; transaction creation, analytics, achievements, and exports rely on that shape.

Finix stores wallet-scoped local cache for responsiveness and uses encrypted Walrus Mainnet snapshots for decentralized app-data storage when save operations succeed.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

```bash
npm run build
npm run lint
```

## Notes

- Landing and dashboard UI are approved and should not be redesigned without a product reason.
- New users see clean empty states instead of fake balances or transactions.
- AI Advisor receives aggregated summaries, not raw transaction rows.
- Walrus storage duration and network depend on the configured Walrus flow; avoid claiming permanent storage in product copy.
