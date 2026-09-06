import {
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getS3, s3Config } from "../config/s3.js";

import { AppError } from "../errors/app-error.js";

import { createFileKey } from "../utils/file-key.util.js";

import type {
  CreateUploadUrlInput,
  CreateUploadUrlResult,
} from "../types/file.types.js";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

function isAllowedContentType(
  contentType: string,
): contentType is AllowedContentType {
  return ALLOWED_CONTENT_TYPES.includes(contentType as AllowedContentType);
}

class FileService {
  async createUploadUrl(
    ownerId: string,
    data: CreateUploadUrlInput,
  ): Promise<CreateUploadUrlResult> {
    if (!isAllowedContentType(data.contentType)) {
      throw new AppError("Unsupported image type", 400);
    }

    const key = createFileKey(data.category, ownerId, data.fileName);

    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
      ContentType: data.contentType,
    });

    const uploadUrl = await getSignedUrl(getS3(), command, {
      expiresIn: 300,
    });

    return {
      uploadUrl,
      key,
    };
  }

  async createDownloadUrl(ownerId: string, key: string): Promise<string> {
    if (!key) {
      throw new AppError("File key is required", 400);
    }

    if (!key.startsWith(`profile-pictures/${ownerId}/`)) {
      throw new AppError("Forbidden", 403);
    }

    const command = new GetObjectCommand({
      Bucket: s3Config.bucketName,
      Key: key,
    });

    return getSignedUrl(getS3(), command, {
      expiresIn: 300,
    });
  }

  async deleteFile(key: string): Promise<void> {
    if (!key) {
      return;
    }

    await getS3().send(
      new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      }),
    );
  }
}

export const fileService = new FileService();
