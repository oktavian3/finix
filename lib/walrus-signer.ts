/**
 * Walrus signer hook — wraps user wallet as a SuiSigner for writeBlob.
 */
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export function useWalrusSigner() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const signer = account
    ? {
        getAddress: () => account.address,
        signAndExecuteTransaction: async (input: { transaction: Transaction }) => {
          const result = await signAndExecute({
            transaction: input.transaction,
            chain: 'sui:mainnet',
          });
          return result;
        },
      }
    : null;

  return { signer, isReady: !!account };
}
