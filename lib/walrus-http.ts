/**
 * Walrus — HTTP Publisher client (works for both testnet & mainnet).
 * Falls back gracefully.
 */

const PUBLISHER_MAINNET = 'https://publisher.walrus.space';
const PUBLISHER_TESTNET = 'https://publisher.walrus-testnet.walrus.space';
const AGGREGATOR_MAINNET = 'https://aggregator.walrus-mainnet.walrus.space';
const AGGREGATOR_TESTNET = 'https://aggregator.walrus-testnet.walrus.space';

export interface StoreResult {
  blobId: string;
  objectId: string | null;
  network: 'mainnet' | 'testnet';
}

/**
 * Store data on Walrus via HTTP Publisher.
 * Tries mainnet first (5s timeout), falls back to testnet.
 * Data is serialized as JSON, not encrypted.
 * ⚠️ Walrus blobs are public — don't store raw passwords/keys.
 */
export async function storeBlobViaHTTP(
  data: unknown,
): Promise<StoreResult> {
  const bytes = new TextEncoder().encode(
    typeof data === 'string' ? data : JSON.stringify(data),
  );

  // Try mainnet first (aggressive timeout)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${PUBLISHER_MAINNET}/v1/blobs?epochs=52`, {
      method: 'PUT',
      body: bytes,
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const result = await res.json();
      const blobId = result.newlyCreated?.blobObject?.blobId
        || result.alreadyCertified?.blobId;
      const objectId = result.newlyCreated?.blobObject?.id
        || result.alreadyCertified?.blobObject?.id;
      if (blobId) return { blobId, objectId: objectId || null, network: 'mainnet' };
    }
  } catch { /* fallback to testnet */ }

  // Fallback to testnet
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const res = await fetch(`${PUBLISHER_TESTNET}/v1/blobs?epochs=52`, {
    method: 'PUT',
    body: bytes,
    signal: controller.signal,
  });
  clearTimeout(timer);
  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown');
    throw new Error(`Walrus HTTP Publisher failed: ${res.status} ${text}`);
  }

  const result = await res.json();
  const blobId = result.newlyCreated?.blobObject?.blobId
    || result.alreadyCertified?.blobId;
  const objectId = result.newlyCreated?.blobObject?.id
    || result.alreadyCertified?.blobObject?.id;
  if (!blobId) throw new Error('No blobId in Walrus response');

  return { blobId, objectId: objectId || null, network: 'testnet' };
}

/**
 * Read blob from Walrus aggregator.
 * Tries mainnet first, falls back to testnet.
 */
export async function readBlobViaHTTP(blobId: string): Promise<string> {
  for (const baseUrl of [AGGREGATOR_MAINNET, AGGREGATOR_TESTNET]) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${baseUrl}/v1/blobs/${encodeURIComponent(blobId)}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) return res.text();
    } catch { /* try next */ }
  }
  throw new Error(`Walrus blob ${blobId} not found on any network`);
}
