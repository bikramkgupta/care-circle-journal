import { S3Client } from '@aws-sdk/client-s3';

const isLocal = (endpoint: string) =>
  endpoint.includes('localhost') ||
  endpoint.includes('127.0.0.1') ||
  endpoint.includes('minio');

const endpoint = process.env.SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';

export const s3Client = new S3Client({
  endpoint,
  region: process.env.SPACES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY || '',
    secretAccessKey: process.env.SPACES_SECRET_KEY || '',
  },
  forcePathStyle: isLocal(endpoint),
});

export const BUCKET_NAME = process.env.SPACES_BUCKET || 'care-circle-media';
