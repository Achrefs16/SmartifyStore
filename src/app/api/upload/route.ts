import { NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const { fileName, fileType, fileBuffer } = await request.json();

    if (!fileName || !fileType || !fileBuffer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert array back to buffer
    const buffer = Buffer.from(fileBuffer);

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, fileName, fileType);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 