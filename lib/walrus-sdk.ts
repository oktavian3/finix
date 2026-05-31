/**
 * Walrus SDK — server-side blob storage on Walrus testnet.
 * Uses WalrusClient + Ed25519Keypair for proper certified blobs (deletable: false).
 * WASM loaded from @mysten/walrus-wasm package (external in webpack).
 *
 * Vercel env: SUI_PRIVATE_KEY (suiprivkey format)
 * Network: testnet (Walrus testnet + Sui testnet RPC)
 *
 * Why testnet:
 * - publisher.walrus.space (mainnet) NXDOMAIN from most networks
 * - WAL token only available on testnet for gasless HTTP Publisher
 * - WalrusClient + signing works on both mainnet and testnet
 * - Sui testnet explorer: suiscan.xyz/testnet
 */
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

const DEFAULT_TESTNET_RPC = 'https://fullnode.testnet.sui.io:443';

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
  network: 'mainnet' | 'testnet';
}

let _client: WalrusClient | null = null;

function getKeypair(): Ed25519Keypair {
  const pk = process.env.SUI_PRIVATE_KEY;
  if (!pk) throw new Error('SUI_PRIVATE_KEY not set in environment');
  return Ed25519Keypair.fromSecretKey(pk);
}

function getClient(): WalrusClient {
  if (!_client) {
    // WalrusClient needs raw Sui RPC (no custom headers)
    // Tatum RPC is used for frontend wallet connections via config.ts
    const rpcUrl = DEFAULT_TESTNET_RPC;

    _client = new WalrusClient({
      network: 'testnet',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      suiClient: new SuiJsonRpcClient({ url: rpcUrl, network: 'testnet' } as any),
    });
  }
  return _client;
}

export async function storeBlob(data: unknown): Promise<WalrusStoreResult> {
  const client = getClient();
  const signer = getKeypair();

  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);

  console.log(`[WalrusSDK] storing blob size=${bytes.length} via WalrusClient (testnet)...`);

  const result = await client.writeBlob({
    blob: bytes,
    signer,
    epochs: 52,
    deletable: false,
  });

  console.log(`[WalrusSDK] SUCCESS: blobId=${result.blobId} objectId=${result.blobObject?.id}`);

  return {
    blobId: result.blobId,
    objectId: result.blobObject?.id ?? null,
    network: 'testnet',
  };
}
