import { NextRequest, NextResponse } from 'next/server';
import { storeBlobViaHTTP, readBlobViaHTTP } from '@/lib/walrus-http';
import { encryptData, decryptData } from '@/lib/seal-encrypt';

/** Store encrypted Finix records on Walrus Mainnet via HTTP Publisher. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, walletAddress } = body;
    if (!data) return NextResponse.json({ error: 'data is required' }, { status: 400 });
    if (!walletAddress) return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });

    const encrypted = encryptData(data, walletAddress);
    const result = await storeBlobViaHTTP(encrypted.encryptedBytes);

    return NextResponse.json({
      success: true,
      blobId: result.blobId,
      objectId: result.objectId,
      network: result.network,
      encRef: encrypted.encRef,
      message: 'Finix records saved encrypted to Walrus Mainnet',
    });
  } catch (error) {
    console.error('[Walrus API] error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to save';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Read and decrypt blob data from the Walrus Mainnet aggregator. */
export async function GET(request: NextRequest) {
  try {
    const blobId = request.nextUrl.searchParams.get('blobId');
    const walletAddress = request.nextUrl.searchParams.get('walletAddress');
    if (!blobId) return NextResponse.json({ error: 'blobId required' }, { status: 400 });
    if (!walletAddress) return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });

    const encryptedBytes = await readBlobViaHTTP(blobId);
    const data = decryptData(encryptedBytes, walletAddress);
    return NextResponse.json({ success: true, data, network: 'mainnet' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to read blob';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
