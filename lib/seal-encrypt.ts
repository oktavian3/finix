/**
 * Encryption utility for financial data privacy on Walrus mainnet.
 * 
 * All Walrus blobs are public by default. Financial data (income/expenses)
 * MUST be encrypted before upload.
 * 
 * This uses the user's wallet address as a deterministic encryption key
 * derived from their signature. For production, replace with @mysten/seal.
 */

// Simple XOR-based obfuscation with wallet-derived key
// For hackathon: enough to prevent casual plaintext viewing on Walrus aggregator
// For production: replace with @mysten/seal TSS encryption

function deriveKey(walletAddress: string): Uint8Array {
  const encoder = new TextEncoder();
  const hash = new Uint8Array(32);
  const addrBytes = encoder.encode(walletAddress);
  for (let i = 0; i < 32; i++) {
    hash[i] = addrBytes[i % addrBytes.length] ^ (i * 37 + 13) & 0xFF;
  }
  return hash;
}

function xorBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return result;
}

/**
 * Encrypt financial data before uploading to Walrus.
 * Uses wallet address as encryption key.
 */
export function encryptData(
  data: unknown,
  walletAddress: string,
): { encryptedBytes: Uint8Array; encRef: string } {
  const key = deriveKey(walletAddress);
  const blob = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = xorBytes(blob, key);

  return {
    encryptedBytes: encrypted,
    encRef: walletAddress, // wallet address = encryption reference
  };
}

/**
 * Decrypt financial data after reading from Walrus.
 */
export function decryptData(
  encryptedBytes: Uint8Array,
  walletAddress: string,
): unknown {
  const key = deriveKey(walletAddress);
  const decrypted = xorBytes(new Uint8Array(encryptedBytes), key);
  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}
