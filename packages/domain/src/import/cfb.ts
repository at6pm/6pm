/**
 * A reader for Microsoft's compound file (the "OLE" container): just enough to take named streams
 * out of it. An encrypted Excel file is one of these, holding `EncryptionInfo` and
 * `EncryptedPackage`; an old `.xls` workbook is one too, holding `Workbook`.
 */

const SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const END_OF_CHAIN = 0xfffffffe;
const FREE = 0xffffffff;
const DIRECTORY_ENTRY = 128;
/** A chain longer than the file has sectors is a loop. */
const STREAM_ENTRY = 2;
const ROOT_ENTRY = 5;

export class CompoundFileError extends Error {
  override readonly name = 'CompoundFileError';
}

/** Whether the bytes start like a compound file. */
export function isCompoundFile(bytes: Uint8Array): boolean {
  return bytes.length >= 512 && SIGNATURE.every((b, i) => bytes[i] === b);
}

interface Entry {
  readonly name: string;
  readonly type: number;
  readonly start: number;
  readonly size: number;
}

/** The streams of a compound file, by name. */
export interface CompoundFile {
  readonly names: readonly string[];
  /** The stream's bytes, or null when the file has no stream of that name. */
  stream(name: string): Uint8Array | null;
}

export function readCompoundFile(bytes: Uint8Array): CompoundFile {
  if (!isCompoundFile(bytes)) throw new CompoundFileError('not a compound file');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (at: number) => view.getUint16(at, true);
  const u32 = (at: number) => view.getUint32(at, true);
  const sectorShift = u16(0x1e);
  const miniShift = u16(0x20);
  if (sectorShift !== 9 && sectorShift !== 12) throw new CompoundFileError('sector size');
  const sectorSize = 1 << sectorShift;
  const miniSize = 1 << miniShift;
  const sectorCount = Math.floor((bytes.length - sectorSize) / sectorSize) + 1;
  const offsetOf = (sector: number) => (sector + 1) * sectorSize;
  const fatSectors = u32(0x2c);
  const firstDirectory = u32(0x30);
  const miniCutoff = u32(0x38);
  const firstMiniFat = u32(0x3c);
  const firstDifat = u32(0x44);

  // Where the FAT's own sectors are: the header lists the first 109, DIFAT sectors the rest.
  const fatAt: number[] = [];
  for (let i = 0; i < 109 && fatAt.length < fatSectors; i++) fatAt.push(u32(0x4c + i * 4));
  let difat = firstDifat;
  const perDifat = sectorSize / 4 - 1;
  for (let guard = 0; difat !== END_OF_CHAIN && difat !== FREE && fatAt.length < fatSectors;) {
    if (++guard > sectorCount) throw new CompoundFileError('difat loop');
    const at = offsetOf(difat);
    for (let i = 0; i < perDifat && fatAt.length < fatSectors; i++) fatAt.push(u32(at + i * 4));
    difat = u32(at + perDifat * 4);
  }
  const perSector = sectorSize / 4;
  const fat = new Uint32Array(fatAt.length * perSector);
  fatAt.forEach((sector, i) => {
    const at = offsetOf(sector);
    if (at + sectorSize > bytes.length) throw new CompoundFileError('fat outside the file');
    for (let j = 0; j < perSector; j++) fat[i * perSector + j] = u32(at + j * 4);
  });

  const chain = (start: number, table: Uint32Array, limit: number): number[] => {
    const out: number[] = [];
    for (let s = start; s !== END_OF_CHAIN && s !== FREE; s = table[s] ?? END_OF_CHAIN) {
      if (out.length > limit) throw new CompoundFileError('chain loop');
      out.push(s);
    }
    return out;
  };
  const readChain = (start: number, size: number): Uint8Array => {
    const sectors = chain(start, fat, sectorCount);
    const out = new Uint8Array(sectors.length * sectorSize);
    sectors.forEach((s, i) => {
      const at = offsetOf(s);
      out.set(bytes.subarray(at, Math.min(at + sectorSize, bytes.length)), i * sectorSize);
    });
    return size >= 0 ? out.subarray(0, Math.min(size, out.length)) : out;
  };

  const directory = readChain(firstDirectory, -1);
  const dirView = new DataView(directory.buffer, directory.byteOffset, directory.byteLength);
  const entries: Entry[] = [];
  for (let at = 0; at + DIRECTORY_ENTRY <= directory.length; at += DIRECTORY_ENTRY) {
    const nameBytes = Math.min(64, dirView.getUint16(at + 0x40, true));
    let name = '';
    for (let i = 0; i + 1 < nameBytes - 1; i += 2) {
      name += String.fromCharCode(dirView.getUint16(at + i, true));
    }
    entries.push({
      name,
      type: dirView.getUint8(at + 0x42),
      start: dirView.getUint32(at + 0x74, true),
      // Version 3 files keep only the low 32 bits; the high ones may be junk.
      size: dirView.getUint32(at + 0x78, true),
    });
  }
  const root = entries.find((e) => e.type === ROOT_ENTRY);
  if (root === undefined) throw new CompoundFileError('no root');

  let mini: { stream: Uint8Array; fat: Uint32Array } | null = null;
  const miniOf = () => {
    if (mini) return mini;
    const raw = readChain(firstMiniFat, -1);
    const table = new Uint32Array(raw.length / 4);
    const rawView = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
    for (let i = 0; i < table.length; i++) table[i] = rawView.getUint32(i * 4, true);
    mini = { stream: readChain(root.start, root.size), fat: table };
    return mini;
  };

  return {
    names: entries.filter((e) => e.type === STREAM_ENTRY).map((e) => e.name),
    stream(name) {
      const entry = entries.find((e) => e.type === STREAM_ENTRY && e.name === name);
      if (entry === undefined) return null;
      if (entry.size >= miniCutoff) return readChain(entry.start, entry.size);
      const { stream, fat: miniFat } = miniOf();
      const sectors = chain(entry.start, miniFat, stream.length / miniSize + 1);
      const out = new Uint8Array(sectors.length * miniSize);
      sectors.forEach((s, i) =>
        out.set(stream.subarray(s * miniSize, (s + 1) * miniSize), i * miniSize),
      );
      return out.subarray(0, entry.size);
    },
  };
}
