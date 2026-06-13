import type { AllowedDocumentMimeType } from "../schemas/file-constraints";

// %PDF-
const PDF_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d] as const;

// PK\x03\x04 — first local file header of a zip archive.
const ZIP_LOCAL_HEADER = [0x50, 0x4b, 0x03, 0x04] as const;
// PK\x05\x06 — end-of-central-directory record.
const ZIP_EOCD_SIGNATURE = [0x50, 0x4b, 0x05, 0x06] as const;
// PK\x01\x02 — central-directory entry header.
const ZIP_CENTRAL_SIGNATURE = [0x50, 0x4b, 0x01, 0x02] as const;
const ZIP_EOCD_MIN_BYTES = 22;
const ZIP_MAX_COMMENT_BYTES = 65_535;
const ZIP_CENTRAL_ENTRY_MIN_BYTES = 46;
// The main WordprocessingML part every Word/LibreOffice/Google export carries.
const WORDPROCESSING_MAIN_PART = "word/document.xml";

// D0 CF 11 E0 A1 B1 1A E1 — Compound File Binary header.
const CFB_HEADER = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] as const;
const CFB_HEADER_BYTES = 512;
const CFB_DIRECTORY_ENTRY_BYTES = 128;
const CFB_STREAM_OBJECT_TYPE = 2;
// Sector numbers above MAXREGSECT (0xFFFFFFFA) are sentinels, not locations.
const CFB_MAX_REGULAR_SECTOR = 0xff_ff_ff_fa;
const CFB_HEADER_DIFAT_ENTRIES = 109;
const CFB_MAX_DIRECTORY_SECTORS = 4096;
// The stream every Word binary document contains; other CFB-based Office
// formats (xls, ppt, msi) do not.
const WORD_DOCUMENT_STREAM = "WordDocument";

const SNIFFERS: Record<
  AllowedDocumentMimeType,
  (bytes: Uint8Array) => boolean
> = {
  "application/pdf": isPdf,
  "application/msword": isLegacyWordDocument,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    isWordprocessingDocument,
};

/**
 * Proves the bytes carry the document structure the claimed MIME type
 * promises. Container signatures alone are not acceptance: a docx must show
 * the WordprocessingML main part inside the zip, a legacy doc a Word stream
 * inside the CFB directory.
 */
export function matchesClaimedDocumentType(
  bytes: Uint8Array,
  claimedType: AllowedDocumentMimeType
): boolean {
  return SNIFFERS[claimedType](bytes);
}

function matchesAt(
  bytes: Uint8Array,
  offset: number,
  pattern: readonly number[]
): boolean {
  if (offset < 0 || offset + pattern.length > bytes.length) {
    return false;
  }
  return pattern.every((byte, index) => bytes[offset + index] === byte);
}

function dataViewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function isPdf(bytes: Uint8Array): boolean {
  return matchesAt(bytes, 0, PDF_HEADER);
}

function isWordprocessingDocument(bytes: Uint8Array): boolean {
  if (!matchesAt(bytes, 0, ZIP_LOCAL_HEADER)) {
    return false;
  }
  const entryNames = readZipEntryNames(bytes);
  return entryNames?.includes(WORDPROCESSING_MAIN_PART) ?? false;
}

/** Walks the central directory — the zip's authoritative entry listing. */
function readZipEntryNames(bytes: Uint8Array): string[] | null {
  const eocdOffset = findEndOfCentralDirectory(bytes);
  if (eocdOffset === null) {
    return null;
  }
  const view = dataViewOf(bytes);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const names: string[] = [];
  const decoder = new TextDecoder();
  let cursor = view.getUint32(eocdOffset + 16, true);
  for (let entry = 0; entry < entryCount; entry++) {
    if (
      !matchesAt(bytes, cursor, ZIP_CENTRAL_SIGNATURE) ||
      cursor + ZIP_CENTRAL_ENTRY_MIN_BYTES > bytes.length
    ) {
      return null;
    }
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const nameStart = cursor + ZIP_CENTRAL_ENTRY_MIN_BYTES;
    if (nameStart + nameLength > bytes.length) {
      return null;
    }
    names.push(
      decoder.decode(bytes.subarray(nameStart, nameStart + nameLength))
    );
    cursor = nameStart + nameLength + extraLength + commentLength;
  }
  return names;
}

function findEndOfCentralDirectory(bytes: Uint8Array): number | null {
  const lowestOffset = Math.max(
    0,
    bytes.length - ZIP_EOCD_MIN_BYTES - ZIP_MAX_COMMENT_BYTES
  );
  for (
    let offset = bytes.length - ZIP_EOCD_MIN_BYTES;
    offset >= lowestOffset;
    offset--
  ) {
    if (matchesAt(bytes, offset, ZIP_EOCD_SIGNATURE)) {
      return offset;
    }
  }
  return null;
}

function isLegacyWordDocument(bytes: Uint8Array): boolean {
  if (bytes.length < CFB_HEADER_BYTES || !matchesAt(bytes, 0, CFB_HEADER)) {
    return false;
  }
  const view = dataViewOf(bytes);
  const sectorShift = view.getUint16(30, true);
  if (sectorShift !== 9 && sectorShift !== 12) {
    return false;
  }
  const sectorSize = 2 ** sectorShift;
  const fat = readCfbFat(bytes, view, sectorSize);
  const entriesPerSector = sectorSize / CFB_DIRECTORY_ENTRY_BYTES;
  let sector = view.getUint32(48, true);
  for (
    let visited = 0;
    visited < CFB_MAX_DIRECTORY_SECTORS && sector <= CFB_MAX_REGULAR_SECTOR;
    visited++
  ) {
    const sectorOffset = (sector + 1) * sectorSize;
    if (sectorOffset + sectorSize > bytes.length) {
      return false;
    }
    for (let entry = 0; entry < entriesPerSector; entry++) {
      const entryOffset = sectorOffset + entry * CFB_DIRECTORY_ENTRY_BYTES;
      if (isWordDocumentStreamEntry(bytes, view, entryOffset)) {
        return true;
      }
    }
    sector = fat[sector] ?? Number.MAX_SAFE_INTEGER;
  }
  return false;
}

/**
 * FAT sectors listed in the header DIFAT — 109 entries address far more than
 * the 5 MB file cap, so the extended DIFAT chain is never needed here.
 */
function readCfbFat(
  bytes: Uint8Array,
  view: DataView,
  sectorSize: number
): number[] {
  const fat: number[] = [];
  for (let index = 0; index < CFB_HEADER_DIFAT_ENTRIES; index++) {
    const fatSector = view.getUint32(76 + index * 4, true);
    if (fatSector > CFB_MAX_REGULAR_SECTOR) {
      break;
    }
    const offset = (fatSector + 1) * sectorSize;
    if (offset + sectorSize > bytes.length) {
      break;
    }
    for (let cell = 0; cell < sectorSize / 4; cell++) {
      fat.push(view.getUint32(offset + cell * 4, true));
    }
  }
  return fat;
}

function isWordDocumentStreamEntry(
  bytes: Uint8Array,
  view: DataView,
  entryOffset: number
): boolean {
  if (entryOffset + CFB_DIRECTORY_ENTRY_BYTES > bytes.length) {
    return false;
  }
  if (bytes[entryOffset + 66] !== CFB_STREAM_OBJECT_TYPE) {
    return false;
  }
  // UTF-16 name length in bytes, including the null terminator.
  const nameLength = view.getUint16(entryOffset + 64, true);
  if (nameLength !== (WORD_DOCUMENT_STREAM.length + 1) * 2) {
    return false;
  }
  for (let index = 0; index < WORD_DOCUMENT_STREAM.length; index++) {
    const codeUnit = view.getUint16(entryOffset + index * 2, true);
    if (codeUnit !== WORD_DOCUMENT_STREAM.charCodeAt(index)) {
      return false;
    }
  }
  return true;
}
