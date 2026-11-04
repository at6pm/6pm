/**
 * Office's password key is a hash spun 100.000 times: H(i ‖ H) for i = 0, 1, 2… With SHA-1 each
 * turn hashes 24 bytes, a single block whose words are known without touching bytes: the turn
 * number byte-swapped, the five words of the last hash, the padding bit and the length. Doing
 * that in place, with no allocation per turn, keeps the spin to a couple of seconds on a phone.
 */

const W = new Int32Array(80);

const swap32 = (x: number) =>
  ((x & 0xff) << 24) | ((x & 0xff00) << 8) | ((x >>> 8) & 0xff00) | ((x >>> 24) & 0xff);

/** SHA-1 of `(i as 4 little-endian bytes) ‖ hash`, `count` times from `hash` (20 bytes). */
export function spinSha1(hash: Uint8Array, count: number): Uint8Array {
  const view = new DataView(hash.buffer, hash.byteOffset, 20);
  let h0 = view.getInt32(0);
  let h1 = view.getInt32(4);
  let h2 = view.getInt32(8);
  let h3 = view.getInt32(12);
  let h4 = view.getInt32(16);
  for (let i = 0; i < count; i++) {
    W[0] = swap32(i);
    W[1] = h0;
    W[2] = h1;
    W[3] = h2;
    W[4] = h3;
    W[5] = h4;
    W[6] = 0x80000000 | 0;
    for (let t = 7; t < 15; t++) W[t] = 0;
    W[15] = 24 * 8;
    for (let t = 16; t < 80; t++) {
      const x = (W[t - 3] ?? 0) ^ (W[t - 8] ?? 0) ^ (W[t - 14] ?? 0) ^ (W[t - 16] ?? 0);
      W[t] = (x << 1) | (x >>> 31);
    }
    let a = 0x67452301 | 0;
    let b = 0xefcdab89 | 0;
    let c = 0x98badcfe | 0;
    let d = 0x10325476 | 0;
    let e = 0xc3d2e1f0 | 0;
    for (let t = 0; t < 80; t++) {
      let f: number;
      let k: number;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc | 0;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6 | 0;
      }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + (W[t] ?? 0)) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }
    h0 = (0x67452301 + a) | 0;
    h1 = (0xefcdab89 + b) | 0;
    h2 = (0x98badcfe + c) | 0;
    h3 = (0x10325476 + d) | 0;
    h4 = (0xc3d2e1f0 + e) | 0;
  }
  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  outView.setInt32(0, h0);
  outView.setInt32(4, h1);
  outView.setInt32(8, h2);
  outView.setInt32(12, h3);
  outView.setInt32(16, h4);
  return out;
}
