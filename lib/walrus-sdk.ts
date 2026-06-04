/**
 * Walrus SDK - server-side blob storage on Walrus Mainnet.
 *
 * The app currently uses the HTTP Publisher path in /api/walrus. This SDK
 * helper is kept Mainnet-only for future direct SDK writes with SUI_PRIVATE_KEY.
 */
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

const MAINNET_RPC = process.env.NEXT_PUBLIC_TATUM_MAINNET_RPC_URL
  || process.env.NEXT_PUBLIC_TATUM_RPC_URL
  || 'https://sui-mainnet.gateway.tatum.io';
const TATUM_API_KEY = process.env.NEXT_PUBLIC_TATUM_API_KEY || '';
const AGGREGATOR_URL = process.env.WALRUS_AGGREGATOR_URL
  || process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR_URL
  || 'https://aggregator.walrus-mainnet.walrus.space';

if (MAINNET_RPC.toLowerCase().includes('testnet') || MAINNET_RPC.toLowerCase().includes('devnet') || MAINNET_RPC.toLowerCase().includes('localnet')) {
  throw new Error('Walrus SDK Sui RPC must point to mainnet');
}

if (AGGREGATOR_URL.toLowerCase().includes('testnet') || AGGREGATOR_URL.toLowerCase().includes('devnet') || AGGREGATOR_URL.toLowerCase().includes('localnet')) {
  throw new Error('Walrus SDK aggregator must point to mainnet');
}

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
  network: 'mainnet';
}

let _client: WalrusClient | null = null;

function getKeypair(): Ed25519Keypair {
  const pk = process.env.SUI_PRIVATE_KEY;
  if (!pk) throw new Error('SUI_PRIVATE_KEY not set in environment');
  return Ed25519Keypair.fromSecretKey(pk);
}

function getClient(): WalrusClient {
  if (!_client) {
    _client = new WalrusClient({
      network: 'mainnet',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      suiClient: new SuiJsonRpcClient({
        url: MAINNET_RPC,
        network: 'mainnet',
        fetch: (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
          fetch(input, {
            ...init,
            headers: {
              ...init?.headers,
              ...(TATUM_API_KEY ? { 'x-api-key': TATUM_API_KEY } : {}),
            },
          }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any),
    });
  }
  return _client;
}

export async function storeBlob(data: unknown): Promise<WalrusStoreResult> {
  const client = getClient();
  const signer = getKeypair();

  const blob = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = new TextEncoder().encode(blob);
  const epochs = Number.parseInt(process.env.WALRUS_EPOCHS || '52', 10);

  console.log(`[WalrusSDK] storing Finix snapshot size=${bytes.length} via Walrus mainnet`);

  const result = await client.writeBlob({
    blob: bytes,
    signer,
    epochs,
    deletable: false,
  });

  console.log(`[WalrusSDK] SUCCESS: blobId=${result.blobId} objectId=${result.blobObject?.id}`);

  return {
    blobId: result.blobId,
    objectId: result.blobObject?.id ?? null,
    network: 'mainnet',
  };
}

export async function getBlob(blobId: string): Promise<unknown> {
  const url = `${AGGREGATOR_URL.replace(/\/$/, '')}/v1/blobs/${encodeURIComponent(blobId)}`;
  console.log(`[WalrusSDK] reading blob from ${url}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to read blob: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
