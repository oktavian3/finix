/**
 * Walrus Mainnet — HTTP Publisher with auto-fallback.
 * 
 * Mainnet HTTP Publisher may have DNS issues from some regions.
 * Falls back to testnet publisher if mainnet fails.
 * Uses mainnet Aggregator for reads (works everywhere).
 */
const PUBLISHER_MAINNET = 'https://publisher.walrus.space';
const PUBLISHER_TESTNET = 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR_MAINNET = 'https://aggregator.walrus-mainnet.walrus.space';

interface BlobResult {
  blobId: string;
  objectId: string | null;
}

/**
 * Store data on Walrus via HTTP Publisher.
 * Tries mainnet first (5s timeout), falls back to testnet (15s timeout).
 * 
 * NOTE: HTTP Publisher blobs are deletable by default.
 * For permanent blobs, use WalrusClient SDK with wallet signing.
 */
export async function storeBlob(data: unknown): Promise<BlobResult & { network: string }> {
  const bytes = new TextEncoder().encode(
    typeof data === 'string' ? data : JSON.stringify(data),
  );

  const publishers = [
    { url: `${PUBLISHER_MAINNET}/v1/blobs?epochs=52`, network: 'mainnet', timeout: 5000 },
    { url: `${PUBLISHER_TESTNET}/v1/blobs?epochs=52`, network: 'testnet', timeout: 15000 },
  ];

  for (const { url, network, timeout } of publishers) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { method: 'PUT', body: bytes, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) continue;

      const result = await res.json();
      const blobId: string | null = result.newlyCreated?.blobObject?.blobId
        || result.alreadyCertified?.blobId || null;
      const objectId: string | null = result.newlyCreated?.blobObject?.id
        || result.alreadyCertified?.blobObject?.id || null;

      if (blobId) return { blobId, objectId, network };
    } catch { /* try next */ }
  }
  throw new Error('All Walrus publishers unreachable');
}

/**
 * Read blob from Walrus aggregator.
 */
export async function readBlob(blobId: string): Promise<string> {
  const res = await fetch(`${AGGREGATOR_MAINNET}/v1/blobs/${encodeURIComponent(blobId)}`);
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  return res.text();
}
