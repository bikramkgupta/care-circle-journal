"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const isLocal = (endpoint) => endpoint.includes('localhost') ||
    endpoint.includes('127.0.0.1') ||
    endpoint.includes('minio');
const endpoint = process.env.SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';
exports.s3Client = new client_s3_1.S3Client({
    endpoint,
    region: process.env.SPACES_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.SPACES_ACCESS_KEY || '',
        secretAccessKey: process.env.SPACES_SECRET_KEY || '',
    },
    forcePathStyle: isLocal(endpoint),
});
exports.BUCKET_NAME = process.env.SPACES_BUCKET || 'care-circle-media';
//# sourceMappingURL=storage.js.map