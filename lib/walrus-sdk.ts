/**
 * Walrus SDK — server-side blob storage via HTTP Publisher.
 * Uses fetch() directly — no WASM, no WalrusClient needed.
 * The publisher pays for storage via its own funded wallet.
 *
 * Uses the 'gasless' Walrus HTTP Publisher API:
 *   PUT /v1/blobs?epochs=N
 * No signing required. Storage paid by publisher.
 *
 * Vercel env: none needed for this approach.
 * Only needs regular network access.
 */

const PUBLISHERS = {
  mainnet: 'https://publisher.walrus.space',
  testnet: 'https://publisher.walrus-testnet.walrus.space',
} as const;

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
  network: 'mainnet' | 'testnet';
}

/**
 * Store JSON data on Walrus via HTTP Publisher (server-side).
 * Tries mainnet first (5s timeout), falls back to testnet.
 * Uses fetch API (available in Node 18+ and Vercel edge).
 */
export async function storeBlob(data: unknown): Promise<WalrusStoreResult> {
  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);

  const order: ('mainnet' | 'testnet')[] = ['mainnet', 'testnet'];

  for (const network of order) {
    const url = `${PUBLISHERS[network]}/v1/blobs?epochs=52`;
    const timeoutMs = network === 'mainnet' ? 5000 : 15000;

    console.log(`[WalrusSDK] trying ${network} via ${url}...`);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        method: 'PUT',
        body: bytes,
        signal: controller.signal,
      });

      clearTimeout(timer);
      console.log(`[WalrusSDK] ${network} response:`, res.status);

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.warn(`[WalrusSDK] ${network} HTTP ${res.status}:`, text.slice(0, 200));
        continue;
      }

      const result = await res.json();
      const blobId = result.newlyCreated?.blobObject?.blobId
        || result.alreadyCertified?.blobId
        || result.blobId;
      const objectId = result.newlyCreated?.blobObject?.id
        || result.alreadyCertified?.blobObject?.id
        || result.blobObject?.id;

      if (blobId) {
        console.log(`[WalrusSDK] ${network} SUCCESS: blobId=${blobId} objectId=${objectId}`);
        return { blobId, objectId: objectId ?? null, network };
      }

      console.warn(`[WalrusSDK] ${network} no blobId:`, JSON.stringify(result).slice(0, 200));
      continue;
    } catch (err) {
      console.warn(`[WalrusSDK] ${network} error:`, err);
      continue;
    }
  }

  throw new Error('Both mainnet and testnet Walrus publishers are unreachable');
}
