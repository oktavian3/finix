/**
 * Walrus SDK — server-side blob storage using WalrusClient + Ed25519Keypair.
 *
 * Used by the API route to store user data on Walrus mainnet.
 * The private key is stored as SUI_PRIVATE_KEY env var (suiprivkey format).
 */

import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

const MAINNET_RPC = 'https://fullnode.mainnet.sui.io:443';

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
}

let _client: WalrusClient | null = null;

function getKeypair(): Ed25519Keypair {
  const pk = process.env.SUI_PRIVATE_KEY;
  if (!pk) throw new Error('SUI_PRIVATE_KEY not set in environment');
  return Ed25519Keypair.fromSecretKey(pk);
}

function getClient(): WalrusClient {
  if (!_client) {
    const url = process.env.SUI_RPC_URL || MAINNET_RPC;
    _client = new WalrusClient({
      network: 'mainnet',
      suiClient: new SuiJsonRpcClient({ url, network: 'mainnet' }),
      wasmUrl: __dirname + '/walrus_wasm_bg.wasm',
    });
  }
  return _client;
}

/**
 * Store JSON data on Walrus mainnet using WalrusClient + Ed25519Keypair.
 * The signer (private key) pays for storage (~0.006 SUI per blob).
 *
 * @returns {blobId, objectId} — blobId is the content-addressed Walrus ID,
 *   objectId is the Sui object ID of the certified blob.
 */
export async function storeBlob(data: unknown): Promise<WalrusStoreResult> {
  const client = getClient();
  const signer = getKeypair();

  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);

  const result = await client.writeBlob({
    blob: bytes,
    signer,
    epochs: 52, // ~1 year
    deletable: false,
  });

  return {
    blobId: result.blobId,
    objectId: result.blobObject?.id ?? null,
  };
}
