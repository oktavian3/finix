/**
 * Client-side Walrus helper for Mainnet reads/writes.
 *
 * Finix normally writes through /api/walrus so publisher auth secrets stay on
 * the server. This helper remains Mainnet-only for any legacy direct callers.
 */

const DEFAULT_MAINNET_PUBLISHER = 'https://publisher.walrus.space';
const DEFAULT_MAINNET_AGGREGATOR = 'https://aggregator.walrus-mainnet.walrus.space';
const NETWORK = process.env.NEXT_PUBLIC_WALRUS_NETWORK || 'mainnet';

if (NETWORK !== 'mainnet') {
  throw new Error('Finix Walrus client is configured for strict mainnet only');
}

function assertMainnetUrl(name: string, url: string): void {
  const normalized = url.toLowerCase();
  if (normalized.includes('testnet') || normalized.includes('devnet') || normalized.includes('localnet')) {
    throw new Error(`${name} must point to Walrus mainnet`);
  }
}

function getPublisherUrl(): string {
  const url = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL || DEFAULT_MAINNET_PUBLISHER;
  assertMainnetUrl('NEXT_PUBLIC_WALRUS_PUBLISHER_URL', url);
  return url.replace(/\/$/, '');
}

function getAggregatorUrl(): string {
  const url = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL || DEFAULT_MAINNET_AGGREGATOR;
  assertMainnetUrl('NEXT_PUBLIC_WALRUS_AGGREGATOR_URL', url);
  return url.replace(/\/$/, '');
}

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
}

/**
 * Store data on Walrus Mainnet directly from the browser.
 * Prefer /api/walrus for production so auth tokens are not exposed.
 */
export async function walrusStore(data: unknown): Promise<WalrusStoreResult> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const encoded = new TextEncoder().encode(body);
  const epochs = process.env.NEXT_PUBLIC_WALRUS_EPOCHS || '52';
  const publisherUrl = getPublisherUrl();

  const res = await fetch(`${publisherUrl}/v1/blobs?epochs=${encodeURIComponent(epochs)}`, {
    method: 'PUT',
    body: new Blob([encoded as BlobPart]),
    headers: { 'Content-Type': 'application/octet-stream' },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown error');
    throw new Error(`Walrus Mainnet publisher failed: ${res.status} — ${errText}`);
  }

  const result = await res.json();

  let blobId: string;
  let objectId: string | null = null;

  if (result.newlyCreated) {
    blobId = result.newlyCreated.blobObject.blobId;
    objectId = result.newlyCreated.blobObject.id;
  } else if (result.alreadyCertified) {
    blobId = result.alreadyCertified.blobId;
  } else {
    throw new Error('Unexpected Walrus Mainnet response');
  }

  return { blobId, objectId };
}

/** Read a blob from the Walrus Mainnet aggregator. */
export async function walrusRead(blobId: string): Promise<string | null> {
  const aggregatorUrl = getAggregatorUrl();
  const res = await fetch(`${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`);
  if (!res.ok) return null;
  return res.text();
}
