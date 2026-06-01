# Finix

Finix is a wallet-native personal finance app for the Sui ecosystem. Users connect a Sui wallet, create their own income and expense records, track goals, review analytics, and sync app data through Walrus storage.

## Hackathon Requirements Covered

- Uses Tatum Sui testnet RPC through the wallet client configuration.
- Integrates Walrus testnet storage through `/api/walrus` and the Walrus publisher fallback.
- Defaults the app wallet/storage flow to Sui testnet, matching the previously working architecture.
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
| `NEXT_PUBLIC_SUI_NETWORK` | Yes | Use `testnet` for the working flow. |
| `NEXT_PUBLIC_TATUM_RPC_URL` | Yes | Tatum Sui testnet RPC URL. |
| `NEXT_PUBLIC_TATUM_API_KEY` | Yes | Tatum API key used by the browser wallet RPC client. |
| `SUI_PRIVATE_KEY` | Required for server Walrus writes | Builder/signer key for Walrus testnet storage. |
| `NEXT_PUBLIC_WALRUS_NETWORK` | Yes | Use `testnet` for the working Walrus flow. |
| `DEEPSEEK_API_KEY` | Required for AI Advisor | Server-side AI API key. |

## Data Model

The transaction schema lives in `types/finix.ts`. Do not change it casually; transaction creation, analytics, achievements, and exports rely on that shape.

Finix stores wallet-scoped local cache for responsiveness and uses Walrus for decentralized app-data storage when save operations succeed.

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
