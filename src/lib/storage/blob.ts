import {
  del,
  get,
  head,
  issueSignedToken,
  presignUrl,
  put,
} from "@vercel/blob";

import type { Storage } from "./types";

// Private Vercel Blob driver for the preview target; self-host production
// runs the MinIO driver. The store stays private — documents are
// confidential, so nothing here ever produces a public URL.
export function createBlobStorage(token: string): Storage {
  return {
    async put(key, body, contentType) {
      await put(key, Buffer.from(body), {
        access: "private",
        // Keys are opaque and DB-referenced; a random suffix would orphan
        // every inquiry_files row pointing at them.
        addRandomSuffix: false,
        contentType,
        token,
      });
    },
    async getSignedUrl(key, expiresInSeconds) {
      const signedToken = await issueSignedToken({
        pathname: key,
        token,
        validUntil: Date.now() + expiresInSeconds * 1000,
      });
      const { presignedUrl } = await presignUrl(signedToken, {
        access: "private",
        operation: "get",
        pathname: key,
      });
      return presignedUrl;
    },
    async openRead(key) {
      const result = await get(key, { access: "private", token });
      if (result?.statusCode !== 200) {
        throw new Error(`Storage object ${key} not found`);
      }
      return { contentLength: result.blob.size, stream: result.stream };
    },
    async head(key) {
      const result = await head(key, { token });
      return { contentType: result.contentType, size: result.size };
    },
    async delete(keys) {
      if (keys.length === 0) {
        return;
      }
      await del(keys, { token });
    },
  };
}
