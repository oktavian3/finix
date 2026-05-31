import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiJsonRpcClient } from '@mysten/sui/jsonrpc';

const pk = 'suiprivkey1qpxq5x0jthds77nqs52gk9wpqpzk8e4memk2khrnsdgldfjp5htyj5p9rxz';
const { secretKey } = decodeSuiPrivateKey(pk);
const kp = Ed25519Keypair.fromSecretKey(secretKey);
const address = kp.getPublicKey().toSuiAddress();

console.log('Address:', address);

const client = new SuiJsonRpcClient({ url: 'https://fullnode.mainnet.sui.io:443' });

async function main() {
  const balance = await client.getBalance({ owner: address });
  console.log('Balance:', JSON.stringify(balance, null, 2));
  
  // Also get SUI coin objects
  const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
  console.log('Coins:', JSON.stringify(coins, null, 2));
}

main().catch(console.error);
