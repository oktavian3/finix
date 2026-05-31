import { NextRequest, NextResponse } from 'next/server';
import { storeBlob } from '@/lib/walrus-sdk';

/** Store data on Walrus mainnet via WalrusClient server-side signing */
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
      message: 'Data saved to Walrus mainnet',
    });
  } catch (error) {
    console.error('[Walrus API] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to save to Walrus';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
