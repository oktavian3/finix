/**
 * Walrus SDK - server-side blob storage on Walrus testnet.
 * This restores the previously working testnet flow while the UI remains updated.
 *
 * Required env: SUI_PRIVATE_KEY (suiprivkey format)
 */
import { WalrusClient } from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

const TESTNET_RPC = process.env.NEXT_PUBLIC_TATUM_RPC_URL || 'https://sui-testnet.gateway.tatum.io';
const TATUM_API_KEY = process.env.NEXT_PUBLIC_TATUM_API_KEY || '';
const AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space';

interface WalrusStoreResult {
  blobId: string;
  objectId: string | null;
  network: 'testnet';
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
      network: 'testnet',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      suiClient: new SuiJsonRpcClient({
        url: TESTNET_RPC,
        network: 'testnet',
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

  console.log(`[WalrusSDK] storing Finix snapshot size=${bytes.length} via Walrus testnet`);

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

export async function getBlob(blobId: string): Promise<unknown> {
  const url = `${AGGREGATOR_URL}/v1/blobs/${encodeURIComponent(blobId)}`;
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
