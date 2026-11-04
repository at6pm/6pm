import { describe, expect, it } from 'vitest';

import { findBank } from './bank-catalogue';
import { encodeVietQR } from './encode-vietqr';
import { handoffPlan, handoffUrl, payloadFor, transferLink } from './handoff-link';
import { parseVietQR, type VietQR } from './parse-vietqr';

function scan(payload: string): VietQR {
  const result = parseVietQR(payload);
  if (!result.ok) throw new Error(`expected a VietQR, got ${result.reason}`);
  return result;
}

function app(id: string) {
  const ios = findBank(id)?.ios;
  if (!ios) throw new Error(`no iOS app for ${id}`);
  return ios;
}

/** The query value after `name=` in a link, decoded. */
function param(link: string, name: string): string | null {
  const value = new RegExp(`[?&]${name}=([^&]*)`).exec(link)?.[1];
  return value === undefined ? null : decodeURIComponent(value);
}

const transfer = scan(
  encodeVietQR({ bin: '970403', account: '060101453998', amount: 10_000, note: 'an trua' }),
);
const open = scan(encodeVietQR({ bin: '970403', account: '060101453998', note: 'an trua' }));
const shop: VietQR = { ...transfer, service: 'merchant' };
const wallet = scan(
  encodeVietQR({ bin: '971025', account: '0901234567', amount: 50_000, note: 'cơm trưa' }),
);

describe('payloadFor', () => {
  it('passes the scanned code on untouched when it already asks for this amount', () => {
    expect(payloadFor(transfer, 10_000)).toBe(transfer.raw);
  });

  it('writes the typed amount into a transfer to an account', () => {
    const written = scan(payloadFor(open, 45_000));
    expect(written).toMatchObject({
      bin: '970403',
      account: '060101453998',
      amount: 45_000,
      note: 'an trua',
      service: 'account',
    });
  });

  it('never rewrites a shop code', () => {
    expect(payloadFor(shop, 99_000)).toBe(shop.raw);
  });
});

describe('transferLink', () => {
  it('builds the QR-pay link most banks share', () => {
    const link = transferLink(app('MB'), transfer, 10_000);
    expect(link?.startsWith('mbbank://applink?targetPage=QRPay&qrContent=')).toBe(true);
    expect(link && param(link, 'qrContent')).toBe(transfer.raw);
  });

  it("uses VietinBank's own path", () => {
    const link = transferLink(app('ICB'), transfer, 10_000);
    expect(link?.startsWith('vietinbankipay://host.qrTransfer?targetPage=QRPay&qrContent=')).toBe(
      true,
    );
  });

  it('has no link for banks that take only a partner token', () => {
    expect(transferLink(app('VCB'), transfer, 10_000)).toBeNull();
    expect(transferLink(app('VBA'), transfer, 10_000)).toBeNull();
  });

  it('sends Nam A the fields as base64 JSON, accents intact', () => {
    const noted = scan(
      encodeVietQR({ bin: '970403', account: '060101453998', amount: 10_000, note: 'cà phê' }),
    );
    const link = transferLink(app('NAB'), noted, 10_000);
    expect(link?.startsWith('nabtransfermoney://ops.namabank.com.vn/?data=')).toBe(true);
    // {"bankId":"970403","accountNumber":"060101453998","accountName":"","amount":"10000",
    //  "description":"cà phê","partnerName":"6pm","partnerId":""} as UTF-8, in base64.
    expect(link && param(link, 'data')).toBe(
      'eyJiYW5rSWQiOiI5NzA0MDMiLCJhY2NvdW50TnVtYmVyIjoiMDYwMTAxNDUzOTk4IiwiYWNjb3VudE5hbWUiOiIiLCJhbW91bnQiOiIxMDAwMCIsImRlc2NyaXB0aW9uIjoiY8OgIHBow6oiLCJwYXJ0bmVyTmFtZSI6IjZwbSIsInBhcnRuZXJJZCI6IiJ9',
    );
  });

  it('gives Nam A no link for a shop code', () => {
    expect(transferLink(app('NAB'), shop, 10_000)).toBeNull();
  });

  it('opens MoMo filled in for a code that pays a MoMo wallet, accents intact', () => {
    const link = transferLink(app('MOMO'), wallet, 50_000);
    expect(link?.startsWith('momo://app?action=p2p&extra=')).toBe(true);
    // A raw `=` would cut the value short in MoMo, so the whole of `extra` is percent-encoded.
    expect(link?.slice('momo://app?action=p2p&extra='.length)).not.toMatch(/[=&{}"+/]/);
    // {"userId":"0901234567","amount":50000,"message":"cơm trưa"} as UTF-8, in base64.
    expect(JSON.parse(param(link ?? '', 'extra') ?? '')).toEqual({
      dataExtract:
        'eyJ1c2VySWQiOiIwOTAxMjM0NTY3IiwiYW1vdW50Ijo1MDAwMCwibWVzc2FnZSI6ImPGoW0gdHLGsGEifQ==',
    });
  });

  it('sends MoMo the amount typed for an open code, and an empty note when there is none', () => {
    const blank = scan(encodeVietQR({ bin: '971025', account: '0901234567' }));
    // {"userId":"0901234567","amount":45000,"message":""} in base64.
    expect(
      JSON.parse(param(transferLink(app('MOMO'), blank, 45_000) ?? '', 'extra') ?? ''),
    ).toEqual({
      dataExtract: 'eyJ1c2VySWQiOiIwOTAxMjM0NTY3IiwiYW1vdW50Ijo0NTAwMCwibWVzc2FnZSI6IiJ9',
    });
  });

  it('gives MoMo no link for a bank account, a non-phone MoMo account or a shop code', () => {
    expect(transferLink(app('MOMO'), transfer, 10_000)).toBeNull();
    const alias = scan(encodeVietQR({ bin: '971025', account: 'P2P0123456789', amount: 10_000 }));
    expect(transferLink(app('MOMO'), alias, 10_000)).toBeNull();
    expect(transferLink(app('MOMO'), { ...wallet, service: 'merchant' }, 10_000)).toBeNull();
  });

  it('gives MoMo a link only for a ten-digit mobile number', () => {
    for (const account of ['84901234567', '0201234567', '01291234567', '090123456']) {
      const other = scan(encodeVietQR({ bin: '971025', account, amount: 10_000 }));
      expect(transferLink(app('MOMO'), other, 10_000)).toBeNull();
    }
  });
});

describe('handoffUrl', () => {
  it('sends the filled-in link to every bank whose link is known', () => {
    for (const id of ['MB', 'TCB', 'NAB']) {
      const link = transferLink(app(id), transfer, 10_000);
      expect(link).not.toBeNull();
      expect(handoffUrl(app(id), transfer, 10_000)).toBe(link);
    }
  });

  it("opens Nam A's home for a shop code, which its link cannot carry", () => {
    expect(handoffUrl(app('NAB'), shop, 10_000)).toBe('nabtransfermoney://');
  });

  it('opens the home of a bank with no link', () => {
    expect(handoffUrl(app('VCB'), transfer, 10_000)).toBe('vietcombankmobile://');
  });

  it("opens MoMo's home for a code it cannot be handed", () => {
    expect(handoffUrl(app('MOMO'), transfer, 10_000)).toBe('momo://');
  });
});

describe('handoffPlan', () => {
  it('opens a bank filled in on iOS, with its App Store page behind it', () => {
    expect(handoffPlan(findBank('MB'), 'ios', transfer, 10_000)).toEqual({
      open: transferLink(app('MB'), transfer, 10_000),
      filledIn: true,
      store: ['https://apps.apple.com/vn/app/id1205807363'],
    });
  });

  it('opens the home of a bank with no link on iOS, not filled in', () => {
    expect(handoffPlan(findBank('VCB'), 'ios', transfer, 10_000)).toMatchObject({
      open: 'vietcombankmobile://',
      filledIn: false,
    });
  });

  it('opens the app at its home on Android, then its Play Store page', () => {
    expect(handoffPlan(findBank('MB'), 'android', transfer, 10_000)).toEqual({
      open: 'mbbank://',
      filledIn: false,
      store: [
        'market://details?id=com.mbmobile',
        'https://play.google.com/store/apps/details?id=com.mbmobile',
      ],
    });
  });

  it('opens MoMo filled in on iOS for a MoMo wallet, and at its home on Android', () => {
    expect(handoffPlan(findBank('MOMO'), 'ios', wallet, 50_000)).toMatchObject({
      open: transferLink(app('MOMO'), wallet, 50_000),
      filledIn: true,
    });
    expect(handoffPlan(findBank('MOMO'), 'android', wallet, 50_000)).toMatchObject({
      open: 'momo://',
      filledIn: false,
    });
  });

  it('has nothing to open for a bank without an app, or no bank', () => {
    const viettel = findBank('VTLMONEY');
    expect(handoffPlan(viettel, 'ios', transfer, 10_000)).toBeNull();
    expect(handoffPlan(viettel, 'android', transfer, 10_000)).toBeNull();
    expect(handoffPlan(null, 'android', transfer, 10_000)).toBeNull();
  });
});
