import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

/** A file the person picked or shared into 6pm, read whole into memory: it never leaves the phone. */
export interface PickedFile {
  readonly name: string;
  readonly bytes: Uint8Array;
}

/** The kinds the picker offers: CSV and Excel (and plain text, which some CSV exports call themselves). */
const TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'public.comma-separated-values-text',
  'org.openxmlformats.spreadsheetml.sheet',
];

/** The largest file read: far above years of history (a 5.000-line export is under 1 MB). */
export const MAX_IMPORT_BYTES = 40 * 1024 * 1024;

/** Opens the system's file picker; null when the person backs out. */
export async function pickImportFile(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: TYPES,
    copyToCacheDirectory: true,
    multiple: false,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (asset === undefined) return null;
  return readImportFile(asset.uri, asset.name);
}

/** Reads a local file (picked, shared in, or put there by a developer command). */
export async function readImportFile(uri: string, name?: string): Promise<PickedFile> {
  const file = new File(uri);
  if (file.size > MAX_IMPORT_BYTES) throw new RangeError('file too large');
  return { name: name ?? file.name, bytes: await file.bytes() };
}
