import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

// Ensure @mysten/walrus-wasm is loaded (Next.js webpack won't bundle .wasm)
// WASM is resolved by the package's own init logic at runtime.

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
