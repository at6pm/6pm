---
title: "Reading VietQR on the phone: TLV, NAPAS and 28 bank apps"
description: "How 6pm parses VietQR on device (EMVCo TLV, CRC-16, NAPAS 247), tells foreign codes apart, and hands a payment to 28 Vietnamese bank apps filled in."
slug: eng-reading-vietqr-on-device
lang: en
pubDate: 2026-10-21
tags: [engineering, vietqr, emvco, typescript, ios]
related: [eng-one-camera-qr-and-receipts, eng-why-we-open-sourced-our-money-app, eng-widgets-controls-live-activities-expo]
cta: "Read the parser on GitHub, or scan a VietQR with the public beta."
hero: [vietqr]
---

# Reading VietQR on the phone: EMVCo TLV, NAPAS 247 and handing off to 28 bank apps

6pm reads a VietQR entirely on the phone: a small TLV reader, a CRC-16/CCITT-FALSE check, a NAPAS template lookup. Then it opens the payer's bank app. For 28 apps that is a transfer link with account, amount and note filled in; for the rest, the app's home screen, the amount on the clipboard and the QR saved to Photos.

This post walks through the code in `packages/domain/src/vietqr/` and `apps/mobile/src/features/scan/bank-handoff.ts`. Everything quoted is from the repo, which is Apache 2.0.

## Why parse it ourselves

6pm is an expense tracker that never asks for a bank login. In Vietnam most small payments are VietQR transfers: a printed code at the bánh mì stall, scanned by a bank app. If 6pm does the scanning, it knows the payee, the amount and the note before the money moves, and the spend lands in the Inbox without anyone typing it.

That only works if the parser is boringly correct. A wrong amount in a money app is worse than no amount. So the parser lives in `@6pm/domain`, a plain TypeScript package with no React Native in it, tested in Vitest, and bundled into the app and its iOS extensions.

## The format in two minutes

VietQR is NAPAS's profile of the EMVCo merchant-presented QR. The payload is a flat string of data objects, each `ID (2 digits) · length (2 digits) · value`. Some values are themselves TLV strings. A typical transfer looks like this, broken up for reading:

```
00 02 01                      payload format indicator
01 02 12                      12 = dynamic (one-off), 11 = static
38 57 0010A000000727          merchant account template, NAPAS GUID
      0127 0006970422 0113…   beneficiary: BIN 970422 + account
      0208QRIBFTTA            service: transfer to an account
53 03 704                     currency: VND
54 05 55000                   amount
58 02 VN                      country
62 .. 08 .. Banh mi           additional data, 08 = purpose
63 04 ABCD                    CRC
```

<!-- media: diagram-vietqr -->

The merchant account template can sit in any tag from 26 to 51. NAPAS's has GUID `A000000727` in sub-tag 00, a nested beneficiary in 01 (BIN in 00, account in 01), and a service code in 02: `QRIBFTTA` (account), `QRIBFTTC` (card) or `QRPUSH` (merchant).

## A TLV reader that survives real codes

The reader is small:

```ts
// packages/domain/src/vietqr/tlv.ts (trimmed)
export function parseTlv(text: string, unit: LengthUnit = 'chars'): TlvFields | null {
  const chars = Array.from(text);
  const fields = new Map<string, string>();
  let i = 0;
  while (i < chars.length) {
    const tag = chars.slice(i, i + 2).join('');
    const len = chars.slice(i + 2, i + 4).join('');
    if (!TWO_DIGITS.test(tag) || !TWO_DIGITS.test(len)) return null;
    i += 4;
    const want = Number(len);
    let taken = 0;
    const start = i;
    while (taken < want && i < chars.length) {
      taken += unit === 'bytes' ? utf8Size(chars[i]?.codePointAt(0) ?? 0) : 1;
      i++;
    }
    if (taken !== want) return null;
    if (fields.has(tag)) return null;
    fields.set(tag, chars.slice(start, i).join(''));
  }
  return fields;
}
```

Two details matter.

**`Array.from(text)`, not indexing.** EMVCo counts characters. JavaScript strings index UTF-16 code units, so an emoji in a note would shift every later field. Iterating code points keeps the count honest.

**A `bytes` mode.** Some Vietnamese generators count UTF-8 bytes when the note has diacritics ("Bánh mì" is 7 characters and 9 bytes). Strict parsing would reject codes that every bank app accepts. So `parseVietQR` tries characters first, then bytes, and takes whichever reading ends cleanly on tag 63:

```ts
// packages/domain/src/vietqr/parse-vietqr.ts
function readFields(raw: string): { fields: TlvFields; unit: LengthUnit } | null {
  for (const unit of ['chars', 'bytes'] as const) {
    const fields = parseTlv(raw, unit);
    if (fields && [...fields.keys()].at(-1) === '63') return { fields, unit };
  }
  return null;
}
```

The same unit is then used for the nested templates, so a code is read consistently one way or the other.

## The checksum

Tag 63 is a CRC-16/CCITT-FALSE over everything before it, including the literal `6304`. The implementation is the textbook bitwise version over UTF-8 bytes:

```ts
// packages/domain/src/vietqr/crc16.ts
export function crc16CcittFalse(text: string): string {
  let crc = 0xffff;
  for (const byte of utf8Bytes(text)) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
```

`parseVietQR` checks it before reading any field. A failed CRC is its own outcome, `bad_crc`, so the interface can say "that code looks damaged" rather than "that isn't a payment".

## Reading the payment, refusing the rest

After the CRC, the parser finds the NAPAS template among tags 26–51, rejects anything that is not đồng (`53` must be `704` when present) or not Vietnam (`58` must be `VN` when present), and validates the beneficiary: a six-digit BIN and an account of 1–19 letters and digits.

Amounts get special care because VND has no minor unit:

```ts
const AMOUNT = /^(\d{1,13})(?:\.0*)?$/;
// "55000" and "55000.00" are both 55.000₫; "55000.50" cannot be paid: malformed.
```

A zero or missing amount is `null`, meaning "ask the user". The service code is mandatory in NAPAS's spec, but older static codes in the wild omit it, so a missing 02 is read as a transfer to an account.

The result is a discriminated union. Success carries the bank (looked up by BIN), the masked account (`•••• 4821`), the amount, the note from 62/08, and whether the code is dynamic. Failure carries one of `not_emv`, `bad_crc`, `foreign`, `unsupported` or `malformed`.

## Foreign codes: name them, never pay them

Travellers scan codes abroad, and Vietnamese visitors scan Thai and Singaporean codes at home. 6pm recognises them and keeps the spend in its own currency, but never tries to pay them.

<!-- media: promptpay -->

Detection is by the GUID in the merchant template, falling back to the country in tag 58:

```ts
// packages/domain/src/vietqr/foreign-scheme.ts (excerpt)
const GUIDS = [
  { prefix: 'A000000677', country: 'TH', scheme: 'promptpay' },
  { prefix: 'SG.PAYNOW', country: 'SG', scheme: 'paynow' },
  { prefix: 'A0000006150001', country: 'MY', scheme: 'duitnow' },
  { prefix: 'ID.CO.QRIS', country: 'ID', scheme: 'qris' },
  { prefix: 'PH.PPMI', country: 'PH', scheme: 'qrph' },
  { prefix: 'HK.COM.HKICL', country: 'HK', scheme: 'fps' },
  { prefix: 'BR.GOV.BCB.PIX', country: 'BR', scheme: 'pix' },
];
```

Codes that are not EMV at all (UPI links, SEPA transfer codes, the Swiss QR-bill, Czech QR Platba, Alipay and WeChat Pay shop codes) go through `readOtherPayment` before the EMV path. A small set, `PAID_FROM_VIETNAM = new Set(['TH', 'SG', 'MY', 'KH', 'LA'])`, records which countries' codes a Vietnamese bank app can pay across the border, so Travel mode can say so.

## Handing off to the bank

6pm does not move money. After a scan it hands the payment to the bank app the user picks, from a catalogue of 41 Vietnamese bank and wallet apps whose iOS URL scheme it knows. This is the part that took the most poking at real phones.

### Where the links came from

Zalo has a "pay in a bank app" sheet. Watching which URLs it opens gave us each bank's URL scheme and, for most, a transfer link of one shared shape:

```
<scheme>applink?targetPage=QRPay&qrContent=<url-encoded VietQR>
```

VietinBank uses the same query on a different path (`host.qrTransfer`). Nam A Bank takes no QR at all, but a base64 JSON blob of the fields on `ops.namabank.com.vn/?data=`. The catalogue encodes this per bank:

```ts
// packages/domain/src/vietqr/bank-catalogue.ts (excerpt)
MB:  linked('mbbank://', '1205807363'),
VCB: plain('vietcombankmobile://', '561433133'),
VBA: plain('agribankmobile://', '935944952'),
ICB: linked('vietinbankipay://', '689963454', { kind: 'qrPay', path: 'host.qrTransfer' }),
NAB: linked('nabtransfermoney://', '1456997296', { kind: 'namABank' }),
```

Twenty-eight entries are `linked`. Zalo signs its links; 6pm sends them unsigned. MB is the bank we have confirmed opens filled in that way with a transfer completed end to end on a real phone. Vietcombank and Agribank take only a token issued to their partners, so they are `plain` and open at their home screen. MoMo and ZaloPay open by the schemes their own SDKs query, with no transfer link; ViettelMoney and VNPT Money publish no scheme, so 6pm tells the user to open them and copies the amount.

### The QR going in

When the user types an amount for a static code, the bank should see that amount. `payloadFor` re-encodes a person-to-person transfer with the new amount, but never rewrites a shop's code:

```ts
// packages/domain/src/vietqr/handoff-link.ts
export function payloadFor(qr: VietQR, amount: Vnd): string {
  if (qr.amount === amount || qr.service === 'merchant') return qr.raw;
  // …re-encode bin, account, amount, note, name with encodeVietQR; on failure, qr.raw
}
```

`encodeVietQR` is the mirror of the parser: it builds the TLV, appends `6304`, and computes the CRC with the same function.

### The hand-off itself

```ts
// apps/mobile/src/features/scan/bank-handoff.ts (trimmed)
export async function handOff(bank: BankInfo | null, qr: VietQR, amount: number) {
  await Clipboard.setStringAsync(String(amount));
  const plan = handoffPlan(bank, OS, qr, amount);
  const qrSaved = plan?.filledIn === true ? false : await saveQr(payloadFor(qr, amount));
  if (plan === null) return { result: 'manual', qrSaved };
  if (plan.open !== null && (await opens(plan.open))) return { result: 'opened', qrSaved };
  for (const url of plan.store) {
    if (await opens(url)) return { result: 'store', qrSaved };
  }
  return { result: 'manual', qrSaved };
}
```

Three decisions are encoded here:

- **The amount always goes on the clipboard**, digits only, because that is what a bank's amount field accepts.
- **No `canOpenURL`.** It is deprecated for this use and limited to 25 declared schemes, and the catalogue has 41 apps. `Linking.openURL` fails just as clearly when the app is missing, and the fallback is its App Store page.
- **If the bank cannot be filled in, the QR is saved to Photos**, drawn by our own QR encoder (`encode-qr.ts`, byte mode, Reed-Solomon, mask scoring per ISO/IEC 18004), so the bank's "scan from photo" reads it back exactly.

On Android, `handoffPlan` opens the app's home: no bank's transfer link has been seen to open filled in there.

## Coming back: "Did it go through?"

No bank app returns to 6pm on its own. When the user comes back, 6pm asks "Did it go through?". Until then the scan is a pending spend, shown as a Live Activity with a Paid button, and it already lowers the day's safe-to-spend number so the number stays honest.

<!-- media: live-activity-clip -->

If the bank's own receipt also arrives (a shared screenshot, a forwarded email, an Apple Pay tap), the two are merged rather than counted twice. Most sources merge within three minutes; a waiting scan gets longer, because people finish paying in the bank app a while later:

```ts
// packages/domain/src/capture/duplicate.ts
export const DUPLICATE_WINDOW_MS = 3 * 60_000;
/** A QR scan still waiting to be paid is matched by its bank's receipt … up to this long after the tap. Never before the tap. */
export const QR_RECEIPT_WINDOW_MS = 20 * 60_000;
```

Anything the user typed (Quick add, voice, cash) is never merged with anything.

## What we would tell someone building this

- Treat "the spec says" and "what is printed on the stall" as two specs. Byte-counted lengths and missing service codes are both real.
- Keep the parser pure and away from the camera. Ours runs in Vitest, in the app, and in an iOS extension through JavaScriptCore without changes.
- Return reasons, not booleans. `bad_crc`, `foreign` and `unsupported` each produce different words on screen.
- Do not promise that every bank opens filled in. Ours do not, and the interface says so.

## FAQ

### Does 6pm send the scanned QR to a server?

No. The QR is parsed on the phone in `@6pm/domain`. The only thing that leaves is the URL the bank app is opened with, which goes to that app on the same phone.

### Why are the bank links sent unsigned?

Zalo's links carry its own signature, which we cannot produce. The links work unsigned for the banks we have tested, MB end to end; banks that require a partner token (Vietcombank, Agribank) open at their home screen instead.

### Can 6pm pay a PromptPay or PayNow code?

No. It recognises the scheme and records the spend in that currency. With Travel mode on from a đồng home, it says whether a Vietnamese bank app can pay that country's codes.

### Is the parser reusable?

It is plain TypeScript with no React Native dependency, under Apache 2.0, in `packages/domain/src/vietqr/`.

## Try it

The code is at [github.com/at6pm/6pm](https://github.com/at6pm/6pm). The iPhone app is in public beta on TestFlight: [testflight.apple.com/join/a8UrvT5P](https://testflight.apple.com/join/a8UrvT5P), and arrives on the App Store on Friday 6 November 2026 at 18:00 ICT (6:00 a.m. Eastern). More at [at6pm.app](https://at6pm.app).
