/**
 * Walrus SDK — server-side blob storage using WalrusClient + Ed25519Keypair.
 * Uses Tatum Sui RPC. WASM is loaded by @mysten/walrus internally.
 *
 * The signer (private key) pays for storage in WAL tokens.
 * Vercel env: SUI_PRIVATE_KEY (suiprivkey format)
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      suiClient: new SuiJsonRpcClient({ url, network: 'mainnet' } as any),
    });
  }
  return _client;
}

export async function storeBlob(data: unknown): Promise<WalrusStoreResult> {
  const client = getClient();
  const signer = getKeypair();

  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);

  const result = await client.writeBlob({
    blob: bytes,
    signer,
    epochs: 52,
    deletable: false,
  });

  return {
    blobId: result.blobId,
    objectId: result.blobObject?.id ?? null,
  };
}
