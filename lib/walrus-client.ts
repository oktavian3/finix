import { WalrusClient } from '@mysten/walrus';
import { suiClient } from './sui-client';
import type { Signer } from '@mysten/sui/cryptography';

// Singleton Walrus client
let _walrusClient: WalrusClient | null = null;

export function getWalrusClient(): WalrusClient {
  if (!_walrusClient) {
    _walrusClient = new WalrusClient({
      network: 'mainnet',
      suiClient,
    });
  }
  return _walrusClient;
}

export async function saveUserData(
  data: Uint8Array,
  signer: Signer,
): Promise<string> {
  const walrus = getWalrusClient();
  const { blobId } = await walrus.writeBlob({
    blob: data,
    deletable: true,
    epochs: 52, // ~1 year
    signer,
  });
  return blobId;
}

export async function loadUserData(
  blobId: string,
): Promise<Uint8Array | null> {
  try {
    const walrus = getWalrusClient();
    const blob = await walrus.readBlob({ blobId });
    return blob;
  } catch {
    return null;
  }
}
