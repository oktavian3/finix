import { NextRequest, NextResponse } from 'next/server';
import { storeBlobViaHTTP } from '@/lib/walrus-http';
import { readBlobViaHTTP } from '@/lib/walrus-http';

/** Store Finix records on Walrus via HTTP Publisher (mainnet prefer, testnet fallback). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;
    if (!data) return NextResponse.json({ error: 'data is required' }, { status: 400 });

    const result = await storeBlobViaHTTP(data);

    return NextResponse.json({
      success: true,
      blobId: result.blobId,
      objectId: result.objectId,
      network: result.network,
      message: `Finix records saved to Walrus on ${result.network}`,
    });
  } catch (error) {
    console.error('[Walrus API] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to save';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Read blob data from Walrus aggregator. */
export async function GET(request: NextRequest) {
  try {
    const blobId = request.nextUrl.searchParams.get('blobId');
    if (!blobId) return NextResponse.json({ error: 'blobId required' }, { status: 400 });

    const data = await readBlobViaHTTP(blobId);
    const parsed = JSON.parse(data);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to read blob';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
