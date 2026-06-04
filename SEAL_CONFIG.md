# Seal Encryption Configuration for Finix

Finix now writes only to Sui/Walrus Mainnet, but the current application code still uses the local `lib/seal-encrypt.ts` helper as a temporary encryption layer. Do **not** treat that helper as production-grade Seal encryption for real financial data.

## Required before real production financial data

Configure real Seal values in your deployment secret manager after you have them from your Seal provider:

| Variable | Visibility | Description |
| --- | --- | --- |
| `SEAL_KEY_SERVER_OBJECT_ID` | Server-only preferred | Mainnet Seal key-server object ID, if your plan/policy requires one. |
| `SEAL_KEY_SERVER_AGGREGATOR_URL` | Server-only preferred | Seal key-server aggregator/API URL from your provider. |
| `SEAL_API_KEY` | Server-only | Seal API key or provider credential. Never expose this as `NEXT_PUBLIC_*`. |
| `SEAL_PACKAGE_ID` | Public if needed | Mainnet Seal package/policy package ID used by your encryption flow. |
| `SEAL_POLICY_OBJECT_ID` | Public if needed | Mainnet policy/access-control object ID, if required by your implementation. |

## Notes

- Do not commit API keys, bearer tokens, private keys, mnemonics, or keystore files.
- Free/open Seal plans may not provide a dedicated policy object ID. In that case, keep the app on the temporary encryption helper until the exact Seal policy flow is defined and implemented.
- Walrus blobs are public, so every finance snapshot must be encrypted before upload.
