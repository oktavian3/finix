/**
 * Client-side Walrus HTTP Publisher — writes directly from the browser.
 *
 * Walrus publisher CORS allows all origins (*), so we can PUT blobs
 * straight from the user's browser without proxying through a server.
 * This bypasses Vercel serverless IP blocks / DNS resolution issues.
 */

const WALRUS_PUBLISHER =
  process.env.NEXT_PUBLIC_WALRUS_PUBLISHER_URL ||
  'https://publisher.walrus-testnet.walrus.space';

const WALRUS_AGGREGATOR =
  process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL ||
  'https://aggregator.walrus-testnet.walrus.space';

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

  const res = await fetch(`${WALRUS_PUBLISHER}/v1/blobs`, {
    method: 'PUT',
    body: encoded,
    headers: { 'Content-Type': 'application/octet-stream' },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown error');
    throw new Error(`Walrus publish failed: ${res.status} — ${errText}`);
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

  return { blobId, objectId };
}

/**
 * Retrieve blob data from Walrus via the HTTP Aggregator.
 */
export async function walrusRead(blobId: string): Promise<string | null> {
  const res = await fetch(
    `${WALRUS_AGGREGATOR}/v1/blobs/${encodeURIComponent(blobId)}`
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  return res.text();
}
