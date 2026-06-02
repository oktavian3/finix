# Finix Walrus Mainnet — Implementation Plan

> **Goal:** Migrate Finix from testnet HTTP Publisher (deletable blobs, no encryption) to proper Walrus mainnet integration with Seal encryption, SuiGrpcClient SDK, and Move contract for on-chain blob linking.

> **Architecture:** User wallet signs 1 PTB per save (chaining 3 Walrus TX). Data encrypted client-side with Seal before upload. Blob ID stored in on-chain `FinanceEntry` Move object. Reads via aggregator + Seal decrypt. Batch entries per-month to minimize WAL overhead.

> **Tech Stack:** `@mysten/sui` (SuiGrpcClient + walrus extension), `@mysten/seal`, Move language (Sui Framework), `@mysten/dapp-kit` (wallet signing), `@mysten/sui/transactions` (PTB).

---

## Phase 0: Move Contract

### Task 0.1: Create Sui Move package structure

**Objective:** Scaffold Move package for `FinanceEntry` and `UserData` objects

**Files:**
- Create: `move/Finix/Move.toml`
- Create: `move/Finix/sources/finix.move`

**Step 1: Write Move.toml**

```toml
[package]
name = "Finix"
version = "0.1.0"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "mainnet" }

[addresses]
finix = "0x0"
```

**Step 2: Write finix.move**

```move
module finix::finix {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::vec_map::VecMap;
    use std::string::{Self, String};
    use std::vector;

    // ─── Error codes ──────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EBlobTooLong: u64 = 1;
    const EInvalidKey: u64 = 2;

    // ─── Constants ─────────────────────────────────────────
    const MAX_BLOB_ID_LENGTH: u64 = 100;
    const MAX_ENC_KEY_LENGTH: u64 = 200;
    const VERSION: u64 = 1;

    // ─── Objects ───────────────────────────────────────────

    /// A monthly data batch stored on Walrus.
    /// Each batch = 1 blob containing all transactions for that month.
    struct MonthlyBlob has key, store {
        id: UID,
        /// `YYYY-MM` format
        month: String,
        /// Walrus blob ID (the content-addressed identifier)
        blob_id: String,
        /// Seal encryption ID / reference for decryption
        enc_ref: String,
        /// Number of transactions in this batch
        tx_count: u64,
        /// Version for forward compatibility
        version: u64,
    }

    /// User registry — tracks all monthly blobs for a user.
    struct UserBlobRegistry has key, store {
        id: UID,
        /// Owner wallet address
        owner: address,
        /// Ordered list of monthly blob IDs (newest first)
        months: vector<ID>,
    }

    // ─── Public Functions ──────────────────────────────────

    /// Create a new MonthlyBlob entry.
    public entry fun create_blob_entry(
        month: String,
        blob_id: String,
        enc_ref: String,
        tx_count: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);

        assert!(string::length(&blob_id) <= MAX_BLOB_ID_LENGTH, EBlobTooLong);
        assert!(string::length(&enc_ref) <= MAX_ENC_KEY_LENGTH, EInvalidKey);

        let blob = MonthlyBlob {
            id: object::new(ctx),
            month,
            blob_id,
            enc_ref,
            tx_count,
            version: VERSION,
        };

        transfer::transfer(blob, sender);
    }

    /// Register a batch of blob IDs under a user's registry.
    /// If no registry exists, creates one.
    public entry fun register_batch(
        registry: &mut UserBlobRegistry,
        blob_id: ID,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(registry.owner == sender, ENotOwner);
        vector::push_back(&mut registry.months, blob_id);
    }

    /// Create a new registry for a user.
    public entry fun create_registry(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let registry = UserBlobRegistry {
            id: object::new(ctx),
            owner: sender,
            months: vector::empty(),
        };
        transfer::transfer(registry, sender);
    }

    /// Get blob IDs for a user (view function for off-chain query).
    public fun get_blob_id(blob: &MonthlyBlob): &String {
        &blob.blob_id
    }

    /// Get all months for a registry.
    public fun get_months(registry: &UserBlobRegistry): &vector<ID> {
        &registry.months
    }

    /// Get blob count
    public fun blob_count(registry: &UserBlobRegistry): u64 {
        vector::length(&registry.months)
    }
}
```

**Step 3: Commit**

```bash
git add move/Finix/
git commit -m "feat: add Move contract for Finix Walrus on-chain blob registry"
```

---

## Phase 1: Dependencies

### Task 1.1: Install new deps

**Objective:** Install `@mysten/seal` package

**Step 1: Install**

```bash
npm install --save @mysten/seal
```

**Step 2: Verify**

```bash
node -e "require('@mysten/seal')" 2>&1
# Should not error
```

**Step 3: Test build**

```bash
npm run build 2>&1 | tail -10
# Should succeed
```

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @mysten/seal dependency"
```

---

## Phase 2: SuiGrpcClient + Walrus SDK

### Task 2.1: Create Walrus mainnet client

**Objective:** Create a new client module using `SuiGrpcClient` + `walrus()` extension

**Files:**
- Create: `lib/walrus-mainnet.ts`

**Step 1: Write the module**

```typescript
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { walrus } from '@mysten/walrus';

const MAINNET_RPC = 'https://fullnode.mainnet.sui.io:443';

let _client: ReturnType<typeof createClient> | null = null;

function createClient() {
  return new SuiGrpcClient({
    network: 'mainnet',
    baseUrl: MAINNET_RPC,
  }).$extend(walrus());
}

export function getWalrusClient() {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}

/**
 * Upload encrypted blob to Walrus mainnet.
 * Returns the blobId.
 */
export async function uploadBlob(
  encryptedBytes: Uint8Array,
  signer: any, // SuiSigner from wallet
  epochs: number = 52,
): Promise<string> {
  const client = getWalrusClient();
  const result = await client.walrus.writeBlob({
    blob: encryptedBytes,
    deletable: true,
    epochs,
    signer,
  });
  return result.blobId;
}

/**
 * Read blob from Walrus mainnet aggregator.
 */
export async function readBlob(blobId: string): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${encodeURIComponent(blobId)}`
  );
  if (!res.ok) throw new Error(`Walrus read failed: ${res.status}`);
  return res.arrayBuffer();
}
```

**Step 2: Create separate signing utility**

**Files:**
- Create: `lib/walrus-signer.ts`

```typescript
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

/**
 * Hook that returns a signer for Walrus writeBlob.
 * Uses the user's connected wallet.
 */
export function useWalrusSigner() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const signer = {
    getAddress: () => account?.address ?? '',
    signAndExecuteTransaction: async (input: { transaction: Transaction }) => {
      const result = await signAndExecute({
        transaction: input.transaction,
        chain: 'sui:mainnet',
      });
      return result;
    },
  };

  return { signer, isReady: !!account };
}
```

**Step 3: Build test**

```bash
npm run build 2>&1 | tail -10
```

**Step 4: Commit**

```bash
git add lib/walrus-mainnet.ts lib/walrus-signer.ts
git commit -m "feat: add SuiGrpcClient + walrus() extension for mainnet writes"
```

---

## Phase 3: Seal Encryption

### Task 3.1: Create Seal encryption utility

**Objective:** Add client-side encrypt/decrypt for financial data using `@mysten/seal`

**Files:**
- Create: `lib/seal-encrypt.ts`

**Step 1: Write the module**

```typescript
import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// For hackathon: use a known session keypair.
// In production: derive from user's wallet session.
const SESSION_KEYPAIR = new Ed25519Keypair(); // Placeholder

const PACKAGE_ID = process.env.NEXT_PUBLIC_FINIX_PACKAGE_ID || '0xTODO';

let _sealClient: SealClient | null = null;

function getSealClient(suiClient: SuiClient): SealClient {
  if (!_sealClient) {
    _sealClient = new SealClient({
      suiClient,
      sessionKey: SESSION_KEYPAIR,
    });
  }
  return _sealClient;
}

/**
 * Encrypt financial data before uploading to Walrus.
 * Returns encrypted bytes + encryption reference for later decryption.
 */
export async function encryptFinancialData(
  suiClient: SuiClient,
  data: unknown,
  encryptionId: string,
): Promise<{ encryptedBytes: Uint8Array; encRef: string }> {
  const sealClient = getSealClient(suiClient);
  const blob = new TextEncoder().encode(JSON.stringify(data));

  const { encryptedObject } = await sealClient.encrypt({
    id: encryptionId,
    packageId: PACKAGE_ID,
    data: blob,
  });

  return {
    encryptedBytes: encryptedObject,
    encRef: encryptionId,
  };
}

/**
 * Decrypt financial data after reading from Walrus.
 */
export async function decryptFinancialData(
  suiClient: SuiClient,
  encryptedBytes: Uint8Array,
  encRef: string,
): Promise<unknown> {
  const sealClient = getSealClient(suiClient);
  const decrypted = await sealClient.decrypt({
    id: encRef,
    packageId: PACKAGE_ID,
    data: encryptedBytes,
  });

  const text = new TextDecoder().decode(decrypted);
  return JSON.parse(text);
}
```

**Step 2: Build test**

```bash
npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add lib/seal-encrypt.ts
git commit -m "feat: add Seal encryption for financial data privacy"
```

---

## Phase 4: Save Flow — PTB + Encrypt + Upload

### Task 4.1: Create the main Walrus save hook

**Objective:** A hook that chains: encrypt → upload blob → create MonthlyBlob on-chain

**Files:**
- Create: `hooks/useMainnetWalrus.ts`

**Concept:**
```
1. User clicks "Save to Walrus"
2. Encrypt monthly data with Seal (client-side)
3. Build PTB (1 TX: upload blob via walrus.writeBlob)
4. User approves 1 popup in wallet
5. Blob stored, blobId returned
6. Create MonthlyBlob Move object (2nd TX in same PTB)
```

For initial implementation: 2-step (save blob → create on-chain record), optimized to 1 PTB later.

**Step 1: Write the hook**

```typescript
import { useCallback, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { encryptFinancialData } from '@/lib/seal-encrypt';
import { uploadBlob } from '@/lib/walrus-mainnet';
import type { FinixUserData } from '@/types/finix';

const PACKAGE_ID = process.env.NEXT_PUBLIC_FINIX_PACKAGE_ID || '0xTODO';

export function useMainnetWalrus() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isSaving, setIsSaving] = useState(false);

  const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

  const saveMonthlyBatch = useCallback(async (
    data: FinixUserData,
    month: string,
  ): Promise<{ blobId: string; success: boolean }> => {
    if (!account?.address) throw new Error('Wallet not connected');
    setIsSaving(true);

    try {
      // 1. Encrypt
      const encId = `finix_${account.address}_${month}`;
      const { encryptedBytes, encRef } = await encryptFinancialData(
        suiClient, data, encId,
      );

      // 2. Build signer from wallet
      const signer = {
        getAddress: () => account.address,
        signAndExecuteTransaction: async (input: any) => {
          return signAndExecute({
            transaction: input.transaction,
            chain: 'sui:mainnet',
          });
        },
      };

      // 3. Upload blob
      const blobId = await uploadBlob(encryptedBytes, signer);

      // 4. Create on-chain record via PTB
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::finix::create_blob_entry`,
        arguments: [
          tx.pure.string(month),
          tx.pure.string(blobId),
          tx.pure.string(encRef),
          tx.pure.u64(BigInt(data.transactions.length)),
        ],
      });

      await signAndExecute({ transaction: tx, chain: 'sui:mainnet' });

      return { blobId, success: true };
    } finally {
      setIsSaving(false);
    }
  }, [account, signAndExecute, suiClient]);

  return { saveMonthlyBatch, isSaving };
}
```

**Step 2: Build test**

```bash
npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add hooks/useMainnetWalrus.ts
git commit -m "feat: add Walrus mainnet save hook with Seal encryption + PTB"
```

---

## Phase 5: Read Flow

### Task 5.1: Create read hook

**Objective:** Read blob from aggregator → decrypt with Seal → parse JSON

**Files:**
- Modify: `hooks/useMainnetWalrus.ts` (append read function)

```typescript
// Add to useMainnetWalrus:

const loadMonthlyBatch = useCallback(async (
  blobId: string,
  encRef: string,
): Promise<FinixUserData | null> => {
  try {
    // 1. Read from aggregator
    const encryptedBytes = await readBlob(blobId);

    // 2. Decrypt with Seal
    const data = await decryptFinancialData(
      suiClient,
      new Uint8Array(encryptedBytes),
      encRef,
    );

    return data as FinixUserData;
  } catch (err) {
    console.error('Failed to load Walrus batch:', err);
    return null;
  }
}, [suiClient]);
```

**Step 2: Build test**

```bash
npm run build 2>&1 | tail -10
```

**Step 3: Commit**

```bash
git add hooks/useMainnetWalrus.ts
git commit -m "feat: add Walrus mainnet read hook with aggregator + Seal decrypt"
```

---

## Phase 6: UI Integration

### Task 6.1: Add "Save to Walrus Mainnet" button in Profile/Data section

**Objective:** User-facing button that triggers save flow

**Files:**
- Modify: `app/profile/page.tsx`

**Changes:**
- Import `useMainnetWalrus`
- Add "Save to Walrus (Mainnet)" button alongside existing save
- Show loading/success state

### Task 6.2: Auto-load from Walrus on wallet connect

**Objective:** On wallet connect, check for on-chain MonthlyBlob objects owned by user, load latest

**Files:**
- Modify: `hooks/useFinixData.tsx`

**Changes:**
- After localStorage check, query Sui for `MonthlyBlob` objects by owner
- Load latest blob via aggregator → decrypt → setData

---

## Phase 7: Move Contract Deployment

### Task 7.1: Publish Move package to Sui mainnet

**Step 1: Build Move package**

```bash
cd move/Finix
sui move build
```

**Step 2: Publish**

```bash
sui client publish --gas-budget 50000000 --skip-dependency-verification
```

**Step 3: Capture PACKAGE_ID from output**

Set as `NEXT_PUBLIC_FINIX_PACKAGE_ID` in Vercel env vars.

---

## Phase 8: Cleanup & Migration

### Task 8.1: Mark old testnet code as deprecated

- Add comment to `lib/walrus-sdk.ts`: `@deprecated — use lib/walrus-mainnet.ts`
- Add comment to `lib/walrus-client.ts`: `@deprecated — use hooks/useMainnetWalrus.ts`
- Keep old files for fallback

### Task 8.2: Update .env.example

```bash
# Add:
NEXT_PUBLIC_FINIX_PACKAGE_ID=0x...published-package-id
```

### Task 8.3: Final build + push

```bash
npm run build
git add -A
git commit -m "feat: full Walrus mainnet integration with Seal encryption"
git push
```

**Package ID (mainnet):** `0x049434ca3eea8de574639ea521a27ec37d4abfac1a0393aa729b7c8ca8e58d96`  
**TX Digest:** `EG2WeAW5Ce1MLBKjEAbjR9ePjPbCbufbWjhhiyLc6YwP`  
**Gas:** 0.01249 SUI  

| Phase | Tasks | Key Actions |
|---|---|---|
| 0 ✅ | Move contract | `MonthlyBlob` + `UserRegistry` published to mainnet |
| 1 | Dependencies | `npm install @mysten/seal` |
| 2 | SDK client | Create `SuiGrpcClient` + `walrus()` module |
| 3 | Encryption | Create Seal encrypt/decrypt utility |
| 4 | Save flow | Hook: encrypt → upload → PTB → on-chain record |
| 5 | Read flow | Hook: aggregator → decrypt → parse |
| 6 | UI integration | Save button, auto-load on connect |
| 7 ✅ | Publish | ✅ Done — mainnet |
| 8 | Cleanup | Deprecate old code, update docs |

**Estimated WAL cost per save:** ~0.006 WAL (epochs=52) + ~0.02 SUI gas
**User friction:** 1-2 wallet popups per save (PTB optimization in progress)
