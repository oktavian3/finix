import * as Mod from '@mysten/sui/client';

// CoreClient is marked abstract in .d.mts but concrete at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CoreClientCtor: any = Mod.CoreClient;

const TATUM_RPC_URL: string = process.env.NEXT_PUBLIC_TATUM_RPC_URL || 'https://sui-mainnet.gateway.tatum.io';
const TATUM_API_KEY: string = process.env.NEXT_PUBLIC_TATUM_API_KEY || '';

export const suiClient = new CoreClientCtor({
  url: TATUM_RPC_URL,
  fetch: (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      'x-api-key': TATUM_API_KEY,
    },
  }),
});
