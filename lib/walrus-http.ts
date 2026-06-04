/**
 * Walrus — strict Mainnet HTTP Publisher/Aggregator client.
 *
 * Finix production must never fall back to Testnet. Configure a Mainnet
 * publisher in Vercel with WALRUS_PUBLISHER_URL when using a private or
 * authenticated publisher. WALRUS_PUBLISHER_AUTH_TOKEN is optional for
 * bearer-token protected publishers.
 */

const DEFAULT_PUBLISHER_MAINNET = 'https://publisher.walrus.space';
const DEFAULT_AGGREGATOR_MAINNET = 'https://aggregator.walrus-mainnet.walrus.space';
const DEFAULT_EPOCHS = 52;

export interface StoreResult {
  blobId: string;
  objectId: string | null;
  network: 'mainnet';
}

function assertMainnetUrl(name: string, url: string): void {
  const normalized = url.toLowerCase();
  if (normalized.includes('testnet') || normalized.includes('devnet') || normalized.includes('localnet')) {
    throw new Error(`${name} must point to Walrus mainnet`);
  }
}

function getPublisherUrl(): string {
  const url = process.env.WALRUS_PUBLISHER_URL
    || process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL
    || DEFAULT_PUBLISHER_MAINNET;
  assertMainnetUrl('WALRUS_PUBLISHER_URL', url);
  return url.replace(/\/$/, '');
}

function getAggregatorUrl(): string {
  const url = process.env.WALRUS_AGGREGATOR_URL
    || process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL
    || DEFAULT_AGGREGATOR_MAINNET;
  assertMainnetUrl('WALRUS_AGGREGATOR_URL', url);
  return url.replace(/\/$/, '');
}

function getEpochs(): number {
  const raw = process.env.WALRUS_EPOCHS || process.env.NEXT_PUBLIC_WALRUS_EPOCHS;
  if (!raw) return DEFAULT_EPOCHS;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error('WALRUS_EPOCHS must be a positive integer');
  }
  return parsed;
}

function getAuthHeaders(): HeadersInit {
  const token = process.env.WALRUS_PUBLISHER_AUTH_TOKEN
    || process.env.WALRUS_PUBLISHER_BEARER_TOKEN;

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toBytes(data: unknown): Uint8Array {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  return new TextEncoder().encode(JSON.stringify(data));
}

/**
 * Store encrypted data on Walrus Mainnet via HTTP Publisher.
 *
 * Walrus blobs are public. Callers must encrypt sensitive finance data before
 * calling this function.
 */
export async function storeBlobViaHTTP(data: unknown): Promise<StoreResult> {
  const bytes = toBytes(data);
  const publisherUrl = getPublisherUrl();
  const epochs = getEpochs();

  const res = await fetch(`${publisherUrl}/v1/blobs?epochs=${epochs}`, {
    method: 'PUT',
    body: new Blob([bytes as BlobPart]),
    headers: {
      'Content-Type': 'application/octet-stream',
      ...getAuthHeaders(),
    },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown');
    throw new Error(`Walrus Mainnet HTTP Publisher failed: ${res.status} ${text}`);
  }

  const result = await res.json();
  const blobId = result.newlyCreated?.blobObject?.blobId
    || result.alreadyCertified?.blobId;
  const objectId = result.newlyCreated?.blobObject?.id
    || result.alreadyCertified?.blobObject?.id;

  if (!blobId) throw new Error('No blobId in Walrus Mainnet response');

  return { blobId, objectId: objectId || null, network: 'mainnet' };
}

/** Read encrypted blob bytes from the Walrus Mainnet aggregator. */
export async function readBlobViaHTTP(blobId: string): Promise<Uint8Array> {
  const aggregatorUrl = getAggregatorUrl();
  const res = await fetch(`${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Walrus Mainnet blob ${blobId} not found: ${res.status} ${res.statusText}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}
