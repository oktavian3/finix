/**
 * Client-side Walrus store via HTTP Publisher.
 * Restored to the testnet-working fallback behavior.
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

export async function walrusStoreHTTP(
  data: unknown,
  preferred: 'mainnet' | 'testnet' = 'testnet'
): Promise<WalrusStoreResult> {
  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);

  const order = preferred === 'mainnet' ? ['mainnet', 'testnet'] : ['testnet', 'mainnet'];

  for (const network of order as ('mainnet' | 'testnet')[]) {
    const publisher = PUBLISHERS[network];
    const url = `${publisher}/v1/blobs?epochs=52`;
    const timeoutMs = network === 'mainnet' ? 3000 : 15000;

    console.log(`[walrusStore] trying ${network} via ${url}...`);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'PUT',
        body: bytes,
        signal: controller.signal,
      });

      clearTimeout(timer);
      console.log(`[walrusStore] ${network} response:`, res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn(`[walrusStore] ${network} HTTP ${res.status}:`, text.slice(0, 200));
        continue;
      }

      const result = await res.json();
      const blobId = result.newlyCreated?.blobObject?.blobId
        || result.alreadyCertified?.blobId
        || result.blobId
        || null;

      const objectId = result.newlyCreated?.blobObject?.id
        || result.alreadyCertified?.blobObject?.id
        || result.blobObject?.id
        || null;

      if (blobId) {
        return { blobId, objectId, newCreated: !!result.newlyCreated, network };
      }

      console.warn(`[walrusStore] ${network} no blobId in response:`, JSON.stringify(result).slice(0, 300));
    } catch (err) {
      console.warn(`[walrusStore] ${network} error:`, err);
    }
  }

  throw new Error('Both mainnet and testnet Walrus publishers are unreachable');
}

export function getExplorerUrl(objectId: string, network: 'mainnet' | 'testnet'): string {
  const path = network === 'mainnet' ? 'object' : 'testnet/object';
  return `https://suiscan.xyz/${path}/${objectId}/tx-blocks`;
}
