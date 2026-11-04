import { strToU8 } from 'fflate';
import { sha1 } from '@noble/hashes/legacy.js';
import { describe, expect, it } from 'vitest';

import { readCompoundFile } from './cfb';
import { momoHistory, momoLocked, momoLockedSha512 } from './fixtures/export-files';
import { base64Bytes, LockedFile, isLockedWorkbook, unlockWorkbook } from './office-crypto';
import { spinSha1 } from './sha1-spin';

const plain = base64Bytes(momoHistory);

describe('spinSha1', () => {
  it('matches hashing the turn and the last hash, turn by turn', () => {
    let slow = sha1(strToU8('start'));
    const start = slow;
    for (let i = 0; i < 300; i++) {
      const block = new Uint8Array(24);
      new DataView(block.buffer).setUint32(0, i, true);
      block.set(slow, 4);
      slow = sha1(block);
    }
    expect(spinSha1(start, 300)).toEqual(slow);
  });
});

describe('unlockWorkbook', () => {
  it('opens a MoMo history locked with SHA-1 and AES-128 by the birthday', () => {
    const locked = base64Bytes(momoLocked);
    expect(isLockedWorkbook(locked)).toBe(true);
    expect(unlockWorkbook(locked, '05011970')).toEqual(plain);
  });

  it('opens a file locked the way Excel does by default, SHA-512 and AES-256', () => {
    expect(unlockWorkbook(base64Bytes(momoLockedSha512), '05011970')).toEqual(plain);
  });

  it('says a wrong password is wrong, and never returns garbage', () => {
    const locked = base64Bytes(momoLocked);
    expect(() => unlockWorkbook(locked, '06011970')).toThrow(LockedFile);
    expect(() => unlockWorkbook(locked, '1970-01-05')).toThrow(
      expect.objectContaining({ reason: 'wrongPassword' }),
    );
  });

  it('reads the streams of the compound file', () => {
    const file = readCompoundFile(base64Bytes(momoLocked));
    expect(file.names).toEqual(expect.arrayContaining(['EncryptionInfo', 'EncryptedPackage']));
    expect(file.stream('Nothing')).toBeNull();
  });

  it('is not fooled by a plain workbook', () => {
    expect(() => readCompoundFile(plain)).toThrow();
  });
});
