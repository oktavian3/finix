const TATUM_RPC_URL: string = process.env.NEXT_PUBLIC_TATUM_RPC_URL || 'https://sui-testnet.gateway.tatum.io';
const TATUM_API_KEY: string = process.env.NEXT_PUBLIC_TATUM_API_KEY || '';

// CoreClient is marked abstract in .d.mts but concrete at runtime
/* eslint-disable */
let CoreClientCtor: any;
async function loadCoreClient() {
  if (!CoreClientCtor) {
    const mod = await import('@mysten/sui/client');
    CoreClientCtor = mod.CoreClient;
  }
  return CoreClientCtor;
}
/* eslint-enable */

export async function createSuiClient() {
  const CoreClient = await loadCoreClient();
  return new CoreClient({
    url: TATUM_RPC_URL,
    fetch: (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
      fetch(input, {
        ...init,
        headers: {
          ...init?.headers,
          ...(TATUM_API_KEY ? { 'x-api-key': TATUM_API_KEY } : {}),
        },
      }),
  });
}

export async function getSuiClient() {
  return createSuiClient();
}
