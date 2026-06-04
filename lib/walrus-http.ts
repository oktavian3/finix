/**
 * Walrus — Mainnet-first HTTP Publisher/Aggregator client.
 *
 * Tries mainnet first (via config or default). If mainnet publisher is
 * unreachable (DNS/timeout), falls back to testnet so users don't lose data.
 * The returned `network` field tells the true network — no deception.
 */

const DEFAULT_PUBLISHER_MAINNET = 'https://publisher.walrus.space';
const DEFAULT_PUBLISHER_TESTNET = 'https://publisher.walrus-testnet.walrus.space';
const DEFAULT_AGGREGATOR_MAINNET = 'https://aggregator.walrus-mainnet.walrus.space';
const DEFAULT_AGGREGATOR_TESTNET = 'https://aggregator.walrus-testnet.walrus.space';
const DEFAULT_EPOCHS = 52;

export interface StoreResult {
  blobId: string;
  objectId: string | null;
  network: 'mainnet' | 'testnet';
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
 * Store encrypted data on Walrus via HTTP Publisher.
 * Tries mainnet first, falls back to testnet. Returns true network.
 *
 * Walrus blobs are public. Callers must encrypt sensitive finance data before
 * calling this function.
 */
export async function storeBlobViaHTTP(data: unknown): Promise<StoreResult> {
  const bytes = toBytes(data);
  const epochs = getEpochs();
  const publishers: [string, 'mainnet' | 'testnet'][] = [
    [`${getPublisherUrl()}/v1/blobs?epochs=${epochs}`, 'mainnet'],
    [`${DEFAULT_PUBLISHER_TESTNET}/v1/blobs?epochs=${epochs}`, 'testnet'],
  ];

  for (const [url, network] of publishers) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        body: new Blob([bytes as BlobPart]),
        headers: {
          'Content-Type': 'application/octet-stream',
          ...getAuthHeaders(),
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) continue;

      const result = await res.json();
      const blobId = result.newlyCreated?.blobObject?.blobId
        || result.alreadyCertified?.blobId;
      const objectId = result.newlyCreated?.blobObject?.id
        || result.alreadyCertified?.blobObject?.id;
      if (blobId) return { blobId, objectId: objectId || null, network };
    } catch { /* try next */ }
  }

  throw new Error('Walrus HTTP Publisher unreachable on all endpoints');
}

/** Read encrypted blob bytes from Walrus aggregator. Tries mainnet first, falls back to testnet. */
export async function readBlobViaHTTP(blobId: string): Promise<Uint8Array> {
  const urls = [getAggregatorUrl(), DEFAULT_AGGREGATOR_TESTNET];
  for (const baseUrl of urls) {
    try {
      const res = await fetch(`${baseUrl}/v1/blobs/${encodeURIComponent(blobId)}`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return new Uint8Array(await res.arrayBuffer());
    } catch { /* try next */ }
  }
  throw new Error(`Walrus blob ${blobId} not found on any network`);
}
