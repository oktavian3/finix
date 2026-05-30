import { NextRequest, NextResponse } from 'next/server';

// Walrus testnet publisher & aggregator
// For mainnet: https://publisher.walrus.space / https://aggregator.walrus.space
// For testnet: https://publisher.walrus-testnet.walrus.space / https://aggregator.walrus-testnet.walrus.space
const WALRUS_PUBLISHER = process.env.WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space';
const WALRUS_AGGREGATOR = process.env.WALRUS_AGGREGATOR_URL || 'https://aggregator.walrus-testnet.walrus.space';
const IS_MAINNET = process.env.NEXT_PUBLIC_SUI_NETWORK === 'mainnet';

/** Write data to Walrus as a blob via HTTP Publisher */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, walletAddress } = body;

    if (!data || !walletAddress) {
      return NextResponse.json({ error: 'data and walletAddress are required' }, { status: 400 });
    }

    // Use the HTTP Publisher API — no on-chain signer needed for the write itself
    // The publisher handles storage + certification
    const jsonStr = JSON.stringify(data);
    const blob = new TextEncoder().encode(jsonStr);

    const url = IS_MAINNET
      ? `${WALRUS_PUBLISHER}/v1/blobs?epochs=52`
      : `${WALRUS_PUBLISHER}/v1/blobs?epochs=52`;

    const res = await fetch(url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'application/octet-stream' },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Walrus publisher error:', res.status, errText);
      throw new Error(`Walrus publish failed: ${res.status}`);
    }

    const result = await res.json();
    // Response format: { newlyCreated: { blobObject: { id, blobId, ... } } }
    // or { alreadyCertified: { blobId } }
    let blobId: string;

    if (result.newlyCreated) {
      blobId = result.newlyCreated.blobObject.id;
    } else if (result.alreadyCertified) {
      blobId = result.alreadyCertified.blobId;
    } else {
      console.error('Unexpected Walrus response:', JSON.stringify(result));
      throw new Error('Unexpected Walrus response format');
    }

    return NextResponse.json({
      success: true,
      blobId,
      message: 'Data saved to Walrus',
    });
  } catch (error) {
    console.error('Walrus write error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to save to Walrus';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Read data from Walrus via HTTP Aggregator */
export async function GET(request: NextRequest) {
  const blobId = request.nextUrl.searchParams.get('blobId');

  if (!blobId) {
    return NextResponse.json({ error: 'blobId is required' }, { status: 400 });
  }

  try {
    const url = `${WALRUS_AGGREGATOR}/v1/blobs/${encodeURIComponent(blobId)}`;
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ success: true, blobId, data: null, message: 'Blob not found' });
      }
      throw new Error(`Walrus read failed: ${res.status}`);
    }

    const rawText = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }

    return NextResponse.json({ success: true, blobId, data });
  } catch (error) {
    console.error('Walrus read error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to read from Walrus';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
