import { NextRequest, NextResponse } from 'next/server';
import { storeBlob, getBlob } from '@/lib/walrus-sdk';

/** Store Finix financial records/snapshots on Walrus via server-side signing. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, walletAddress } = body;

    if (!data) {
      return NextResponse.json({ error: 'data is required' }, { status: 400 });
    }

    console.log('[Walrus API] storing Finix snapshot', {
      wallet: walletAddress ? `${String(walletAddress).slice(0, 6)}...${String(walletAddress).slice(-4)}` : 'unknown',
      transactions: Array.isArray(data?.transactions) ? data.transactions.length : 0,
      goals: Array.isArray(data?.goals) ? data.goals.length : 0,
    });
    const result = await storeBlob(data);
    console.log('[Walrus API] success:', result.blobId, result.objectId);

    return NextResponse.json({
      success: true,
      blobId: result.blobId,
      objectId: result.objectId,
      network: result.network,
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

    const data = await getBlob(blobId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[Walrus API GET] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to read blob';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
