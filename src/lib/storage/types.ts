export interface StorageObjectStream {
  contentLength?: number;
  stream: ReadableStream<Uint8Array>;
}

export interface StorageObjectMetadata {
  contentType?: string;
  size: number;
}

/**
 * Backend-agnostic seam for supporting-document storage. Callers only ever
 * see this interface — which backend is running never leaks past
 * `src/lib/storage/`. Keys are opaque (`inquiries/{inquiryId}/{fileId}.{ext}`),
 * never user-supplied filenames. `getSignedUrl` is only valid where the
 * backing endpoint is externally reachable; admin downloads stream through
 * the app via `openRead` instead.
 */
export interface Storage {
  delete(keys: string[]): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  head(key: string): Promise<StorageObjectMetadata>;
  openRead(key: string): Promise<StorageObjectStream>;
  put(key: string, body: Uint8Array, contentType: string): Promise<void>;
}
