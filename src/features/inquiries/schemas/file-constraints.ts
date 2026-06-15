// Dependency-free on purpose: next.config.mts imports this module by
// relative path, where the "@/" alias does not resolve.

export const MAX_FILES = 3;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// PDF or Word only. Sniffing must prove document structure (OOXML
// WordprocessingML for .docx, a Word CFB stream for .doc) — container
// signatures alone are not acceptance.
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AllowedDocumentMimeType =
  (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export const DOCUMENT_EXTENSION_BY_MIME: Record<
  AllowedDocumentMimeType,
  string
> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

export const DOCUMENT_PICKER_ACCEPT = Object.values(
  DOCUMENT_EXTENSION_BY_MIME
).join(",");

// Static cap so the public endpoint never accepts unbounded arrays.
export const MAX_CATEGORIES_PER_INQUIRY = 20;

// Headroom for the non-file form fields and the multipart/Flight encoding
// wrapped around the documents themselves.
const FORM_OVERHEAD_BYTES = 2 * 1024 * 1024;

// The single request-body budget (~17 MB, three 5 MB documents + overhead).
// Every transport cap — server actions, /rpc, the reverse proxy — must read
// this constant; a duplicated byte literal is a bug.
export const MAX_REQUEST_BODY_BYTES =
  MAX_FILES * MAX_FILE_SIZE_BYTES + FORM_OVERHEAD_BYTES;
