// Dependency-free on purpose: next.config.mts imports this module by
// relative path, where the "@/" alias does not resolve.

export const MAX_FILES = 2;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Headroom for the non-file form fields and the multipart/Flight encoding
// wrapped around the documents themselves.
const FORM_OVERHEAD_BYTES = 2 * 1024 * 1024;

// The single request-body budget (~12 MB, two 5 MB documents + overhead).
// Every transport cap — server actions, /rpc, the reverse proxy — must read
// this constant; a duplicated byte literal is a bug.
export const MAX_REQUEST_BODY_BYTES =
  MAX_FILES * MAX_FILE_SIZE_BYTES + FORM_OVERHEAD_BYTES;
