const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const region = process.env.AWS_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const extractS3KeyFromUrl = (value) => {
  if (!value || typeof value !== 'string') return null;

  try {
    const parsed = new URL(value);
    return decodeURIComponent(parsed.pathname.replace(/^\//, '')) || null;
  } catch {
    return value.startsWith('/') ? value.slice(1) : value;
  }
};

const getSignedFileUrl = async (key, expiresIn = 60 * 60) => {
  const objectKey = extractS3KeyFromUrl(key);
  if (!objectKey) return null;

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey
  });

  return getSignedUrl(s3, command, { expiresIn });
};

const deleteS3Object = async (key) => {
  const objectKey = extractS3KeyFromUrl(key);
  if (!objectKey) return;

  await s3.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey
  }));
};

module.exports = {
  s3,
  bucketName,
  region,
  extractS3KeyFromUrl,
  getSignedFileUrl,
  deleteS3Object
};