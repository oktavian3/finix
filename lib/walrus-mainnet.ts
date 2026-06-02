/**
 * Walrus Mainnet — Write via SuiGrpcClient + walrus() extension, Read via aggregator HTTP.
 * 
 * Based on official Walrus docs:
 *   - Write: SuiGrpcClient.$extend(walrus()) → client.walrus.writeBlob()
 *   - Read: aggregator.walrus-mainnet.walrus.space/v1/blobs/{blobId}
 *   - Encrypt: SealClient.encrypt() before upload
 * 
 * ⚠️ All blobs on Walrus are public. Encrypt sensitive data with Seal before upload.
 * ⚠️ Mainnet has NO public unauthenticated publishers — TS SDK is mandatory for writes.
 */

import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SealClient } from '@mysten/seal';

const MAINNET_RPC = process.env.NEXT_PUBLIC_SUI_RPC || 'https://fullnode.mainnet.sui.io:443';
const AGGREGATOR_MAINNET = 'https://aggregator.walrus-mainnet.walrus.space';
const FINIX_PACKAGE_ID = process.env.NEXT_PUBLIC_FINIX_PACKAGE_ID || '0x049434ca3eea8de574639ea521a27ec37d4abfac1a0393aa729b7c8ca8e58d96';

interface BlobResult {
  blobId: string;
  objectId: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalrusClientExt = any;

// Singletons
let _grpcClient: WalrusClientExt | null = null;
let _keypair: Ed25519Keypair | null = null;
let _sealClient: SealClient | null = null;

function getKeypair(): Ed25519Keypair {
  if (!_keypair) {
    const mn = process.env.SUI_MNEMONIC;
    if (mn) {
      _keypair = Ed25519Keypair.deriveKeypair(mn);
    } else {
      const pk = process.env.SUI_PRIVATE_KEY;
      if (!pk) throw new Error('SUI_PRIVATE_KEY or SUI_MNEMONIC not set');
      // Support: raw 32-byte hex, suiprivkey base64, or 64-byte hex (keypair)
      const clean = pk.trim();
      _keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from(clean, 'hex')));
    }
  }
  return _keypair;
}

function getWalrusClient(): NonNullable<WalrusClientExt> {
  if (!_grpcClient) {
    _grpcClient = new SuiGrpcClient({
      network: 'mainnet',
      baseUrl: MAINNET_RPC,
    }).$extend(walrus());
  }
  return _grpcClient;
}

function getSealClient(): SealClient | null {
  if (_sealClient) return _sealClient;
  const keyServerObjectId = process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_OBJECT_ID;
  if (!keyServerObjectId) {
    console.warn('[Seal] No key server object ID set — skipping encryption');
    return null;
  }
  _sealClient = new SealClient({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    suiClient: getWalrusClient() as any,
    serverConfigs: [{ objectId: keyServerObjectId, weight: 1 }],
    verifyKeyServers: false,
  });
  return _sealClient;
}

/**
 * Store data on Walrus mainnet via TS SDK (writeBlob).
 * Encrypts with Seal if configured, otherwise stores raw bytes.
 * Blobs are deletable: true and stored for 10 epochs (~20 weeks).
 */
export async function storeBlob(
  data: unknown,
  userAddress?: string,
): Promise<BlobResult & { network: string }> {
  let blob = new TextEncoder().encode(JSON.stringify(data));

  // Encrypt with Seal if configured
  const seal = getSealClient();
  if (seal && userAddress) {
    try {
      const { encryptedObject } = await seal.encrypt({
        threshold: 1,
        packageId: FINIX_PACKAGE_ID,
        id: userAddress,
        data: blob,
      });
      blob = encryptedObject;
    } catch (e) {
      console.warn('[Seal] Encrypt failed, storing raw:', e);
    }
  }

  // Upload via Walrus TS SDK
  const result = await getWalrusClient().walrus.writeBlob({
    blob,
    deletable: true,
    epochs: 10,
    signer: getKeypair(),
  });

  return {
    blobId: result.blobId,
    objectId: result.objectId ?? null,
    network: 'mainnet',
  };
}

/**
 * Read blob from Walrus mainnet aggregator (public, no auth needed).
 */
export async function readBlob(blobId: string): Promise<string> {
  const res = await fetch(`${AGGREGATOR_MAINNET}/v1/blobs/${encodeURIComponent(blobId)}`);
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  return res.text();
}
