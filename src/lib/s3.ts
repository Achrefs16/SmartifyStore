import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { log } from 'console';

// Log the environment variables we're using
console.log('AWS Configuration:', {
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
  hasAccessKey: !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
});

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: Buffer, fileName: string, contentType: string) {
  const key = `products/${Date.now()}-${fileName}`;
  
  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteFromS3(fileUrl: string) {
  const key = fileUrl.split('.com/')[1];
  
  const params = {
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete image');
  }
}

export async function getSignedUploadUrl(fileName: string, fileType: string) {
  const key = `products/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
    Metadata: {
      'x-amz-meta-originalname': fileName,
    },
  });

  try {
    console.log('Generating signed URL with params:', {
      bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
      key,
      contentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600,
      signableHeaders: new Set([
        'host',
        'x-amz-acl',
        'x-amz-meta-originalname',
        'content-type',
        'x-amz-content-sha256',
        'x-amz-date',
        'x-amz-security-token',
        'x-amz-user-agent',
        'x-amz-meta-*',
      ]),
      unsignableHeaders: new Set([
        'x-amz-server-side-encryption',
        'x-amz-server-side-encryption-aws-kms-key-id',
        'x-amz-server-side-encryption-customer-algorithm',
        'x-amz-server-side-encryption-customer-key',
        'x-amz-server-side-encryption-customer-key-md5',
      ]),
    });

    console.log('Generated signed URL:', signedUrl);

    return {
      signedUrl,
      key,
    };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

export function getImageUrl(key: string) {
  return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
} 