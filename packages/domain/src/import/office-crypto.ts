import { cbc } from '@noble/ciphers/aes.js';
import { sha1 } from '@noble/hashes/legacy.js';
import { sha512 } from '@noble/hashes/sha2.js';

import { readCompoundFile, type CompoundFile } from './cfb';
import { spinSha1 } from './sha1-spin';

/**
 * Opens an Excel file locked with a password (ECMA-376 agile encryption, as Excel, Google Sheets
 * and MoMo's emailed history write it): the key is derived from the password, checked against the
 * file's verifier, and the workbook inside is decrypted segment by segment. Everything happens on
 * the phone; the password never leaves this function.
 */

export type LockedFileError = 'wrongPassword' | 'unsupported' | 'damaged';

export class LockedFile extends Error {
  override readonly name = 'LockedFile';
  constructor(readonly reason: LockedFileError) {
    super(reason);
  }
}

const VERIFIER_INPUT_BLOCK = new Uint8Array([0xfe, 0xa7, 0xd2, 0x76, 0x3b, 0x4b, 0x9e, 0x79]);
const VERIFIER_VALUE_BLOCK = new Uint8Array([0xd7, 0xaa, 0x0f, 0x6d, 0x30, 0x61, 0x34, 0x4e]);
const KEY_VALUE_BLOCK = new Uint8Array([0x14, 0x6e, 0x0b, 0xe7, 0xab, 0xac, 0xd0, 0xd6]);
const SEGMENT = 4096;

type Hash = 'SHA1' | 'SHA512';

interface KeyParams {
  readonly hash: Hash;
  readonly salt: Uint8Array;
  readonly keyBytes: number;
  readonly blockSize: number;
  readonly hashSize: number;
}

interface PasswordParams extends KeyParams {
  readonly spinCount: number;
  readonly verifierInput: Uint8Array;
  readonly verifierValue: Uint8Array;
  readonly keyValue: Uint8Array;
}

/** Whether a compound file is an encrypted Office package. */
export function isLockedOffice(file: CompoundFile): boolean {
  return file.names.includes('EncryptionInfo') && file.names.includes('EncryptedPackage');
}

function hashOf(kind: Hash, ...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const joined = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    joined.set(part, at);
    at += part.length;
  }
  return kind === 'SHA1' ? sha1(joined) : sha512(joined);
}

const le32 = (n: number) =>
  new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, n >>> 24]);

export function base64Bytes(text: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let buffer = 0;
  let bits = 0;
  let at = 0;
  for (const ch of clean) {
    buffer = (buffer << 6) | alphabet.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[at++] = (buffer >>> bits) & 0xff;
    }
  }
  return out.subarray(0, at);
}

function attrs(xml: string, tag: string): Record<string, string> | null {
  const match = new RegExp(`<(?:\\w+:)?${tag}\\b([^>]*)>`).exec(xml);
  if (!match) return null;
  const out: Record<string, string> = {};
  for (const [, key = '', value = ''] of (match[1] ?? '').matchAll(/([\w:]+)="([^"]*)"/g)) {
    out[key] = value;
  }
  return out;
}

function keyParams(a: Record<string, string>): KeyParams {
  const hash = a.hashAlgorithm === 'SHA1' ? 'SHA1' : a.hashAlgorithm === 'SHA512' ? 'SHA512' : null;
  const keyBits = Number(a.keyBits);
  if (
    hash === null ||
    a.cipherAlgorithm !== 'AES' ||
    a.cipherChaining !== 'ChainingModeCBC' ||
    (keyBits !== 128 && keyBits !== 192 && keyBits !== 256)
  ) {
    throw new LockedFile('unsupported');
  }
  return {
    hash,
    salt: base64Bytes(a.saltValue ?? ''),
    keyBytes: keyBits / 8,
    blockSize: Number(a.blockSize) || 16,
    hashSize: Number(a.hashSize) || (hash === 'SHA1' ? 20 : 64),
  };
}

/** The encryption a locked file says it uses. Only the agile form (4.4) is read. */
function encryptionOf(info: Uint8Array): { data: KeyParams; password: PasswordParams } {
  if (info.length < 8) throw new LockedFile('damaged');
  const major = info[0] ?? 0;
  const minor = info[2] ?? 0;
  if (major !== 4 || minor !== 4) throw new LockedFile('unsupported');
  let xml = '';
  for (let i = 8; i < info.length; i++) xml += String.fromCharCode(info[i] ?? 0);
  const data = attrs(xml, 'keyData');
  const key = attrs(xml, 'encryptedKey');
  if (data === null || key === null) throw new LockedFile('damaged');
  const spinCount = Number(key.spinCount);
  if (!Number.isInteger(spinCount) || spinCount < 0 || spinCount > 10_000_000) {
    throw new LockedFile('unsupported');
  }
  return {
    data: keyParams(data),
    password: {
      ...keyParams(key),
      spinCount,
      verifierInput: base64Bytes(key.encryptedVerifierHashInput ?? ''),
      verifierValue: base64Bytes(key.encryptedVerifierHashValue ?? ''),
      keyValue: base64Bytes(key.encryptedKeyValue ?? ''),
    },
  };
}

function utf16le(text: string): Uint8Array {
  const out = new Uint8Array(text.length * 2);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    out[i * 2] = code & 0xff;
    out[i * 2 + 1] = code >>> 8;
  }
  return out;
}

/** The spun password hash; SHA-1 by the fast path, SHA-512 by the library, turn by turn. */
function spunHash(params: PasswordParams, password: string): Uint8Array {
  const first = hashOf(params.hash, params.salt, utf16le(password));
  if (params.hash === 'SHA1') return spinSha1(first, params.spinCount);
  let hash = first;
  for (let i = 0; i < params.spinCount; i++) hash = hashOf('SHA512', le32(i), hash);
  return hash;
}

/** A key from the spun hash for one purpose: cut to the key's length, or padded with 0x36. */
function derivedKey(params: PasswordParams, spun: Uint8Array, block: Uint8Array): Uint8Array {
  const hash = hashOf(params.hash, spun, block);
  const key = new Uint8Array(params.keyBytes).fill(0x36);
  key.set(hash.subarray(0, Math.min(hash.length, params.keyBytes)));
  return key;
}

/** An IV of the block size: the bytes cut, or padded with 0x36. */
function ivOf(bytes: Uint8Array, size: number): Uint8Array {
  const iv = new Uint8Array(size).fill(0x36);
  iv.set(bytes.subarray(0, Math.min(bytes.length, size)));
  return iv;
}

function decryptBlocks(key: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
  const whole = data.length - (data.length % 16);
  return cbc(key, iv, { disablePadding: true }).decrypt(data.subarray(0, whole));
}

function sameBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/** Whether a compound file holds a locked Office package. Throws on bytes that are not one. */
export function isLockedWorkbook(bytes: Uint8Array): boolean {
  return isLockedOffice(readCompoundFile(bytes));
}

/**
 * The workbook (zip bytes) inside a locked file. Throws `LockedFile('wrongPassword')` when the
 * password does not open it, `unsupported` for an encryption other than agile AES-CBC.
 */
export function unlockWorkbook(bytes: Uint8Array, password: string): Uint8Array {
  const file = readCompoundFile(bytes);
  const info = file.stream('EncryptionInfo');
  const pkg = file.stream('EncryptedPackage');
  if (info === null || pkg === null || pkg.length < 8) throw new LockedFile('damaged');
  const { data, password: params } = encryptionOf(info);
  const spun = spunHash(params, password);
  const iv = ivOf(params.salt, params.blockSize);

  const input = decryptBlocks(
    derivedKey(params, spun, VERIFIER_INPUT_BLOCK),
    iv,
    params.verifierInput,
  );
  const value = decryptBlocks(
    derivedKey(params, spun, VERIFIER_VALUE_BLOCK),
    iv,
    params.verifierValue,
  );
  const expected = hashOf(params.hash, input.subarray(0, params.salt.length));
  if (!sameBytes(expected.subarray(0, params.hashSize), value.subarray(0, params.hashSize))) {
    throw new LockedFile('wrongPassword');
  }
  const secret = decryptBlocks(
    derivedKey(params, spun, KEY_VALUE_BLOCK),
    iv,
    params.keyValue,
  ).subarray(0, data.keyBytes);

  const view = new DataView(pkg.buffer, pkg.byteOffset, pkg.byteLength);
  const size = view.getUint32(0, true) + view.getUint32(4, true) * 2 ** 32;
  const body = pkg.subarray(8);
  if (size > body.length) throw new LockedFile('damaged');
  const out = new Uint8Array(Math.ceil(body.length / 16) * 16);
  for (let segment = 0, at = 0; at < body.length; segment++, at += SEGMENT) {
    const chunk = body.subarray(at, Math.min(at + SEGMENT, body.length));
    const segmentIv = ivOf(hashOf(data.hash, data.salt, le32(segment)), data.blockSize);
    out.set(decryptBlocks(secret, segmentIv, chunk), at);
  }
  return out.subarray(0, size);
}
