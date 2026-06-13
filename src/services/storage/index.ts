import "server-only";

import { env } from "@/config/env/server";

import { createBlobStorage } from "./blob";
import { createMinioStorage } from "./minio";
import type { Storage } from "./types";

export type {
  Storage,
  StorageObjectMetadata,
  StorageObjectStream,
} from "./types";

function createStorage(): Storage {
  if (env.STORAGE_DRIVER === "blob") {
    if (!env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN is required when STORAGE_DRIVER=blob"
      );
    }
    return createBlobStorage(env.BLOB_READ_WRITE_TOKEN);
  }

  const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
    env;
  const bucket = env.S3_BUCKET;
  if (
    !(
      S3_ENDPOINT &&
      S3_REGION &&
      S3_ACCESS_KEY_ID &&
      S3_SECRET_ACCESS_KEY &&
      bucket
    )
  ) {
    throw new Error(
      "S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_BUCKET are required when STORAGE_DRIVER=minio"
    );
  }
  return createMinioStorage({
    accessKeyId: S3_ACCESS_KEY_ID,
    bucket,
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  });
}

let storage: Storage | undefined;

// Created on first use so merely importing the seam neither constructs an
// SDK client nor asserts the driver-conditional env vars.
export function getStorage(): Storage {
  storage ??= createStorage();
  return storage;
}
