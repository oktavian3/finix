/**
 * Client-side Walrus HTTP Publisher — writes directly from the browser.
 *
 * Walrus publisher CORS allows all origins (*), so we can PUT blobs
 * straight from the user's browser without proxying through a server.
 *
 * Auto-fallback: tries testnet by default for the working hackathon flow.
 *
 * Override via env vars:
 *   NEXT_PUBLIC_WALRUS_PUBLISHER_URL — full custom publisher URL (highest priority)
 *   NEXT_PUBLIC_WALRUS_NETWORK=testnet — skip mainnet try, go straight to testnet
 */

const DEFAULT_MAINNET = 'https://publisher.walrus.space';
const DEFAULT_TESTNET = 'https://publisher.walrus-testnet.walrus.space';

const AGGREGATOR_MAINNET = 'https://aggregator.walrus.space';
const AGGREGATOR_TESTNET = 'https://aggregator.walrus-testnet.walrus.space';

const NETWORK = process.env.NEXT_PUBLIC_WALRUS_NETWORK || 'testnet';

function getPublisherOrder(): string[] {
  const envUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL;
  if (envUrl) return [envUrl];
  if (NETWORK === 'testnet') return [DEFAULT_TESTNET];
  return [DEFAULT_MAINNET, DEFAULT_TESTNET];
}

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
}

/**
 * Store JSON data on Walrus directly from the browser.
 * Uses the HTTP Publisher API (PUT /v1/blobs).
 *
 * @returns {blobId, objectId} — objectId is null for already-certified blobs.
 * @throws if the publisher rejects the write.
 */
export async function walrusStore(data: unknown): Promise<WalrusStoreResult> {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const encoded = new TextEncoder().encode(body);

  // Use ?epochs=52 for ~1 year of storage
  const searchParams = '?epochs=52';

  // Try each publisher URL in order
  const errors: string[] = [];
  for (const publisherUrl of getPublisherOrder()) {
    try {
      const res = await fetch(`${publisherUrl}/v1/blobs${searchParams}`, {
        method: 'PUT',
        body: encoded,
        headers: { 'Content-Type': 'application/octet-stream' },
        // Timeout so DNS failure doesn't hang too long
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown error');
        errors.push(`${publisherUrl}: ${res.status} — ${errText}`);
        continue;
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
        throw new Error('Unexpected Walrus response format');
      }

      // If this was a fallback (testnet after mainnet failed), log it
      if (publisherUrl !== getPublisherOrder()[0]) {
        console.info(`Walrus: fell back to ${publisherUrl} (primary unavailable)`);
      }

      return { blobId, objectId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${publisherUrl}: ${msg}`);
    }
  }

  throw new Error(`Walrus publish failed — attempted: ${errors.join('; ')}`);
}

/**
 * Retrieve blob data from Walrus via the HTTP Aggregator.
 */
export async function walrusRead(blobId: string): Promise<string | null> {
  // Use the same network logic — if testnet was forced, use testnet aggregator
  const aggregatorUrl = NETWORK === 'testnet' ? AGGREGATOR_TESTNET : AGGREGATOR_MAINNET;
  const res = await fetch(
    `${aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  return res.text();
}
