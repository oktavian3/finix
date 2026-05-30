/**
 * Walrus client wrapper.
 * NOTE: Write/read operations are handled via the HTTP Publisher/Aggregator API
 * in /app/api/walrus/route.ts. This module is for server-side operations
 * that require the SDK (e.g., advanced blob management).
 */

export function getWalrusPublisherUrl(): string {
  return process.env.WALRUS_PUBLISHER_URL || (
    process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet'
      ? 'https://publisher.walrus.space'
      : 'https://publisher.walrus-testnet.walrus.space'
  );
}

export function getWalrusAggregatorUrl(): string {
  return process.env.WALRUS_AGGREGATOR_URL || (
    process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet'
      ? 'https://aggregator.walrus.space'
      : 'https://aggregator.walrus-testnet.walrus.space'
  );
}
