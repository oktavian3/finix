/**
 * Client-side Walrus store via HTTP Publisher.
 * Tries mainnet first, falls back to testnet.
 * Used when server-side WalrusClient fails (WASM loading issues in serverless).
 */

const PUBLISHERS = {
  mainnet: 'https://publisher.walrus.space',
  testnet: 'https://publisher.walrus-testnet.walrus.space',
} as const;

interface WalrusStoreResult {
  blobId: string | null;
  objectId: string | null;
  newCreated: boolean;
  network: 'mainnet' | 'testnet';
}

/**
 * Store JSON data on Walrus via HTTP Publisher.
 * Tries mainnet first (10s timeout), falls back to testnet.
 * Pure fetch — no WASM, no signing needed.
 * The publisher pays for storage, not the user.
 * Storage: ~1 year (epochs=52).
 */
export async function walrusStoreHTTP(data: unknown): Promise<WalrusStoreResult> {
  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);

  // Try mainnet first
  for (const network of ['mainnet', 'testnet'] as const) {
    const publisher = PUBLISHERS[network];
    const url = `${publisher}/v1/blobs?epochs=52`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), network === 'mainnet' ? 10000 : 15000);

      const res = await fetch(url, {
        method: 'PUT',
        body: bytes,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[walrusStore] ${network} HTTP ${res.status}, trying next...`);
        continue;
      }

      const result = await res.json();
      return {
        blobId: result.blobId || null,
        objectId: result.blobObject?.id || null,
        newCreated: result.newCreated || false,
        network,
      };
    } catch (err) {
      console.warn(`[walrusStore] ${network} failed:`, err);
      continue;
    }
  }

  throw new Error('Both mainnet and testnet Walrus publishers are unreachable');
}

/**
 * Get the proper explorer URL for a Walrus blob object.
 */
export function getExplorerUrl(objectId: string, network: 'mainnet' | 'testnet'): string {
  const subdomain = network === 'mainnet' ? 'suiscan.xyz' : 'suiscan.xyz';
  const path = network === 'mainnet' ? 'object' : 'testnet/object';
  return `https://${subdomain}/${path}/${objectId}/tx-blocks`;
}
