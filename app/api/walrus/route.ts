import { NextRequest, NextResponse } from 'next/server';
import { storeBlob, getBlob } from '@/lib/walrus-sdk';

/** Store data on Walrus testnet via WalrusClient server-side signing */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    console.log('[Walrus API] storeBlob called with data:', JSON.stringify(data).slice(0, 200));
    const result = await storeBlob(data);
    console.log('[Walrus API] success:', result.blobId, result.objectId);

    return NextResponse.json({
      success: true,
      blobId: result.blobId,
      objectId: result.objectId,
      network: result.network,
      message: 'Data saved to Walrus on Sui Testnet',
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

    const data = await getBlob(blobId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Walrus API GET] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to read blob';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
