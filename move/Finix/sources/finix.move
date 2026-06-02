/// Finix — Personal Finance Blob Registry on Walrus + Sui
/// Each MonthlyBlob represents one month of encrypted transaction data stored on Walrus.
module finix::finix {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use std::vector;
    use sui::vec_set::{Self, VecSet};

    // ─── Error codes ──────────────────────────────────────
    const ENotOwner: u64 = 0;
    const EBlobTooLong: u64 = 1;
    const EEncRefTooLong: u64 = 2;
    const EAlreadyExists: u64 = 3;

    // ─── Constants ─────────────────────────────────────────
    const MAX_BLOB_ID_LENGTH: u64 = 200;
    const MAX_ENC_REF_LENGTH: u64 = 200;
    const VERSION: u64 = 1;

    // ─── Objects ───────────────────────────────────────────

    /// A monthly data batch stored on Walrus with Seal encryption.
    /// Each batch = 1 blob containing all transactions for that month.
    struct MonthlyBlob has key, store {
        id: UID,
        /// YYYY-MM format
        month: String,
        /// Walrus content-addressed blob ID
        blob_id: String,
        /// Seal encryption reference for decryption
        enc_ref: String,
        /// Number of transactions in this batch
        tx_count: u64,
        /// Timestamp of creation
        created_at: u64,
        /// Version for forward compatibility
        version: u64,
    }

    /// User registry — tracks all monthly blobs for a user.
    struct UserRegistry has key, store {
        id: UID,
        /// Owner wallet address
        owner: address,
        /// Set of MonthlyBlob IDs owned by this user
        blob_ids: VecSet<ID>,
    }

    // ─── Public Functions ──────────────────────────────────

    /// Create a new MonthlyBlob entry linked to encrypted Walrus data.
    /// Transfers ownership to the caller.
    public fun create_blob_entry(
        month: String,
        blob_id: String,
        enc_ref: String,
        tx_count: u64,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);

        assert!(string::length(&blob_id) <= MAX_BLOB_ID_LENGTH, EBlobTooLong);
        assert!(string::length(&enc_ref) <= MAX_ENC_REF_LENGTH, EEncRefTooLong);

        let blob = MonthlyBlob {
            id: object::new(ctx),
            month,
            blob_id,
            enc_ref,
            tx_count,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            version: VERSION,
        };

        transfer::transfer(blob, sender);
    }

    /// Register a MonthlyBlob ID under the user's registry.
    /// Creates a new registry if one doesn't exist yet.
    public fun register_blob(
        registry: &mut UserRegistry,
        _blob_id: ID,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        assert!(registry.owner == sender, ENotOwner);
        assert!(!vec_set::contains(&registry.blob_ids, &_blob_id), EAlreadyExists);
        vec_set::insert(&mut registry.blob_ids, _blob_id);
    }

    /// Create a new empty registry for the caller.
    public fun create_registry(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let registry = UserRegistry {
            id: object::new(ctx),
            owner: sender,
            blob_ids: vec_set::empty(),
        };
        transfer::transfer(registry, sender);
    }

    // ─── View / Query Functions ────────────────────────────

    /// Get the blob ID from a MonthlyBlob.
    public fun blob_id(blob: &MonthlyBlob): &String {
        &blob.blob_id
    }

    /// Get the encryption reference.
    public fun enc_ref(blob: &MonthlyBlob): &String {
        &blob.enc_ref
    }

    /// Get the month string.
    public fun month(blob: &MonthlyBlob): &String {
        &blob.month
    }

    /// Get transaction count.
    public fun tx_count(blob: &MonthlyBlob): u64 {
        blob.tx_count
    }

    /// Get all blob IDs registered to this user.
    public fun get_blob_ids(registry: &UserRegistry): &VecSet<ID> {
        &registry.blob_ids
    }

    /// Number of blobs registered.
    public fun blob_count(registry: &UserRegistry): u64 {
        vec_set::size(&registry.blob_ids)
    }

    /// Check if a specific blob ID is registered.
    public fun has_blob(registry: &UserRegistry, blob_id: &ID): bool {
        vec_set::contains(&registry.blob_ids, blob_id)
    }
}
