import { S3Client } from "@aws-sdk/client-s3";

import { env } from "./env.js";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({ region: env.AWS_REGION });
  }
  return s3Client;
}

export const getS3 = (): S3Client => getS3Client();

export const s3Config = {
  region: env.AWS_REGION,
  bucketName: env.AWS_S3_BUCKET_NAME,
};