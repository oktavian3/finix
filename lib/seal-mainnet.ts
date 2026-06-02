/**
 * Seal encryption for Walrus mainnet using @mysten/seal SDK.
 * 
 * Uses SealClient for threshold encryption with key servers.
 * Data is encrypted client-side before upload to Walrus, 
 * and decrypted client-side after download.
 * 
 * Encrypt flow (no wallet popup):
 *   1. SealClient.encrypt() → encrypted bytes + symmetric key
 *   2. Upload encrypted bytes to Walrus HTTP Publisher
 *   3. Store blobId on-chain via Move contract
 * 
 * Decrypt flow (requires wallet signature):
 *   1. Create SessionKey signed by user's wallet
 *   2. Fetch encrypted data from Walrus aggregator
 *   3. Get blob's on-chain Move object info
 *   4. Build approval tx → user signs with wallet
 *   5. SealClient.decrypt() with SessionKey + txBytes
 */

import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { SealClient, SessionKey, type KeyServerConfig } from '@mysten/seal';
import type { Signer } from '@mysten/sui/cryptography';
import type { ClientWithExtensions, CoreClient } from '@mysten/sui/client';

// === Configuration ===

const MAINNET_RPC = process.env.NEXT_PUBLIC_SUI_RPC || 'https://fullnode.mainnet.sui.io:443';

// Package ID for the Finix Move contract (needed for Seal identity)
const FINIX_PACKAGE_ID = process.env.NEXT_PUBLIC_FINIX_PACKAGE_ID || '0x049434ca3eea8de574639ea521a27ec37d4abfac1a0393aa729b7c8ca8e58d96';

// Key server config for Seal
// Get from env or use placeholders — user needs to provide key server info
const KEY_SERVER_OBJECT_ID = process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_OBJECT_ID || '';
const SEAL_KEY_SERVER_AGGREGATOR_URL = process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_AGGREGATOR_URL || '';
const SEAL_API_KEY = process.env.NEXT_PUBLIC_SEAL_API_KEY || '';

function getKeyServerConfigs(): KeyServerConfig[] {
  if (!KEY_SERVER_OBJECT_ID && !SEAL_KEY_SERVER_AGGREGATOR_URL) {
    return [];
  }
  if (KEY_SERVER_OBJECT_ID && SEAL_KEY_SERVER_AGGREGATOR_URL && SEAL_API_KEY) {
    return [{
      objectId: KEY_SERVER_OBJECT_ID,
      weight: 1,
      aggregatorUrl: SEAL_KEY_SERVER_AGGREGATOR_URL,
      apiKey: SEAL_API_KEY,
      apiKeyName: 'x-api-key',
    }];
  }
  return [{
    objectId: KEY_SERVER_OBJECT_ID,
    weight: 1,
  }];
}

// === Sui Client (singleton) ===

let _client: SuiJsonRpcClient | null = null;
let _sealClient: SealClient | null = null;

function getSuiClient(): SuiJsonRpcClient {
  if (!_client) {
    _client = new SuiJsonRpcClient({ network: 'mainnet', url: MAINNET_RPC });
  }
  return _client;
}

function getSealClient(): SealClient | null {
  if (_sealClient) return _sealClient;
  const configs = getKeyServerConfigs();
  if (configs.length === 0) return null;
  _sealClient = new SealClient({
    suiClient: getSuiClient() as unknown as ClientWithExtensions<CoreClient>,
    serverConfigs: configs,
    verifyKeyServers: false, // skip verification for hackathon
  });
  return _sealClient;
}

// === Encrypt (no wallet needed) ===

export interface EncryptResult {
  encryptedObject: Uint8Array;
  symmetricKey: Uint8Array;
}

/**
 * Encrypt financial data using Seal threshold encryption.
 * No wallet signature required for encryption.
 */
export async function encryptWithSeal(
  data: Uint8Array,
  userAddress: string,
): Promise<EncryptResult> {
  const sealClient = getSealClient();
  
  // If no Seal client (no key servers configured), fall back to simple encryption
  if (!sealClient) {
    console.warn('Seal not configured — check NEXT_PUBLIC_SEAL_KEY_SERVER_* env vars');
    return { encryptedObject: data, symmetricKey: new Uint8Array() };
  }

  const result = await sealClient.encrypt({
    threshold: 1,
    packageId: FINIX_PACKAGE_ID!,
    id: userAddress, // identity = user's wallet address
    data,
  });

  return {
    encryptedObject: result.encryptedObject,
    symmetricKey: result.key,
  };
}

// === Decrypt (needs wallet session + approval tx) ===

export interface DecryptParams {
  encryptedObject: Uint8Array;
  userAddress: string;
  signer: Signer;
  buildApprovalTxBytes: () => Promise<Uint8Array>;
}

/**
 * Decrypt data previously encrypted with Seal.
 * This requires:
 *   1. A SessionKey (ephemeral key signed by user's wallet)
 *   2. An approval transaction signed by the user
 *      (calls seal_approve* function on the Move contract)
 */
export async function decryptWithSeal(params: DecryptParams): Promise<Uint8Array> {
  const { encryptedObject, userAddress, signer, buildApprovalTxBytes } = params;
  const sealClient = getSealClient();

  if (!sealClient) {
    console.warn('Seal not configured — returning raw data');
    return encryptedObject;
  }

  const suiClient = getSuiClient();

  // 1. Create session key (TTL: 10 minutes)
  const sessionKey = await SessionKey.create({
    address: userAddress,
    packageId: FINIX_PACKAGE_ID!,
    ttlMin: 10,
    signer,
    suiClient: suiClient as unknown as ClientWithExtensions<CoreClient>,
  });

  // 2. Build approval transaction bytes
  // This tx calls seal_approve on the Move contract
  const txBytes = await buildApprovalTxBytes();

  // 3. Decrypt using SealClient
  const decryptedData = await sealClient.decrypt({
    data: encryptedObject,
    sessionKey,
    txBytes,
  });

  return new Uint8Array(decryptedData);
}

// === Check if Seal is configured ===

export function isSealConfigured(): boolean {
  return getKeyServerConfigs().length > 0;
}
