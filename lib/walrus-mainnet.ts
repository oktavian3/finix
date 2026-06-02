/**
 * Walrus Mainnet — HTTP Publisher with Seal encryption integration.
 * 
 * Mainnet HTTP Publisher may have DNS issues from some regions.
 * Falls back to testnet publisher if mainnet fails.
 * Uses mainnet Aggregator for reads (works everywhere).
 * 
 * When Seal is configured, data is encrypted/decrypted automatically.
 */

import { encryptWithSeal, isSealConfigured } from './seal-mainnet';

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
 * If Seal is configured, data is encrypted before upload.
 * 
 * NOTE: HTTP Publisher blobs are deletable by default.
 * For permanent blobs, use WalrusClient SDK with wallet signing.
 */
export async function storeBlob(
  data: unknown,
  userAddress?: string,
): Promise<BlobResult & { network: string }> {
  // If Seal is configured and user address provided, encrypt the data
  let bytes: Uint8Array;
  if (isSealConfigured() && userAddress) {
    const raw = new TextEncoder().encode(JSON.stringify(data));
    const { encryptedObject } = await encryptWithSeal(raw, userAddress);
    // Wrap with encryption metadata
    const wrapped = JSON.stringify({
      seal: true,
      ver: 1,
      packageId: process.env.NEXT_PUBLIC_FINIX_PACKAGE_ID,
      data: Array.from(encryptedObject),
    });
    bytes = new TextEncoder().encode(wrapped);
  } else {
    bytes = new TextEncoder().encode(
      typeof data === 'string' ? data : JSON.stringify(data),
    );
  }

  const publishers = [
    { url: `${PUBLISHER_MAINNET}/v1/blobs?epochs=52`, network: 'mainnet', timeout: 5000 },
    { url: `${PUBLISHER_TESTNET}/v1/blobs?epochs=52`, network: 'testnet', timeout: 15000 },
  ];

  for (const { url, network, timeout } of publishers) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { method: 'PUT', body: new Uint8Array(bytes), signal: controller.signal });
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
 * Returns the raw text content.
 */
export async function readBlob(blobId: string): Promise<string> {
  const res = await fetch(`${AGGREGATOR_MAINNET}/v1/blobs/${encodeURIComponent(blobId)}`);
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  return res.text();
}

/**
 * Store data WITH Seal encryption enabled.
 * Same as storeBlob but enforces encryption.
 */
export async function storeBlobEncrypted(
  data: unknown,
  userAddress: string,
): Promise<BlobResult & { network: string }> {
  if (!isSealConfigured()) {
    throw new Error(
      'Seal not configured — set NEXT_PUBLIC_SEAL_KEY_SERVER_OBJECT_ID, ' +
      'NEXT_PUBLIC_SEAL_KEY_SERVER_AGGREGATOR_URL, and NEXT_PUBLIC_SEAL_API_KEY env vars'
    );
  }
  return storeBlob(data, userAddress);
}

/**
 * Decrypt a blob that was previously stored with Seal encryption.
 * @returns The parsed original data (decrypted JSON)
 */
export async function readAndDecryptBlob(
  blobId: string,
  userAddress: string,
  signer: import('@mysten/sui/cryptography').Signer,
): Promise<unknown> {
  const raw = await readBlob(blobId);
  
  const parsed = JSON.parse(raw);
  if (!parsed.seal) {
    // Plain data, no encryption
    return parsed;
  }

  // Reconstruct encrypted bytes
  const encryptedObject = new Uint8Array(parsed.data);
  
  // Decrypt using Seal
  const { decryptWithSeal } = await import('./seal-mainnet');
  const decryptedBytes = await decryptWithSeal({
    encryptedObject,
    userAddress,
    signer,
    buildApprovalTxBytes: async () => {
      // This needs to be implemented with actual PTB that calls seal_approve
      // For now, create a dummy transaction
      const { Transaction } = await import('@mysten/sui/transactions');
      const tx = new Transaction();
      // TODO: Add seal_approve move call here
      // tx.moveCall({
      //   target: `${parsed.packageId}::seal::approve`,
      //   arguments: [...],
      // });
      return Uint8Array.from(tx.serialize());
    },
  });

  return JSON.parse(new TextDecoder().decode(decryptedBytes));
}
