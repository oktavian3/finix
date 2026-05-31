const { decodeSuiPrivateKey } = require('@mysten/sui/cryptography');
const { Ed25519Keypair } = require('@mysten/sui/keypairs/ed25519');
const { SuiClient, getFullnodeUrl } = require('@mysten/sui/client');

const pk = 'suiprivkey1qpxq5x0jthds77nqs52gk9wpqpzk8e4memk2khrnsdgldfjp5htyj5p9rxz';
const { secretKey } = decodeSuiPrivateKey(pk);
const kp = Ed25519Keypair.fromSecretKey(secretKey);
const address = kp.getPublicKey().toSuiAddress();

console.log('Address:', address);

const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

async function main() {
  const balance = await client.getBalance({ owner: address });
  console.log('Balance:', JSON.stringify(balance, null, 2));
  
  const coins = await client.getCoins({ owner: address, coinType: '0x2::sui::SUI' });
  console.log('Coins:', JSON.stringify(coins, null, 2));
}

main().catch(console.error);
