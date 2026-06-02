import { NextRequest, NextResponse } from 'next/server';
import { storeBlob } from '@/lib/walrus-mainnet';
import { readBlob } from '@/lib/walrus-mainnet';

/** Store Finix financial records on Walrus (mainnet prefer, testnet fallback). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, walletAddress } = body;

    if (!data) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    const result = await storeBlob(data, walletAddress);

    return NextResponse.json({
      success: true,
      blobId: result.blobId,
      objectId: result.objectId,
      network: result.network,
      sealEnabled: !!process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_OBJECT_ID,
      message: `Finix records saved to Walrus ${result.network}`,
    });
  } catch (error) {
    console.error('[Walrus API] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to save to Walrus';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Read blob data from Walrus aggregator */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');

    if (!blobId) {
      return NextResponse.json({ error: 'blobId query param is required' }, { status: 400 });
    }

    const data = await readBlob(blobId);
    const parsed = JSON.parse(data);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('[Walrus API GET] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to read blob';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
