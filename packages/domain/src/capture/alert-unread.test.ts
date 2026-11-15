import { describe, expect, it } from 'vitest';

import { unreadAlertCounts } from './alert-unread';
import type { CaptureLogEvent } from './capture-log';

// Every name, account and amount here is made up.

const event = (over: Partial<CaptureLogEvent>): CaptureLogEvent => ({
  loggedAt: '2026-11-14T03:00:00.000Z',
  channel: 'alert',
  handed: {},
  sighting: null,
  step: 'newRow',
  row: null,
  ...over,
});

const caught = (app: string, body: string, step: CaptureLogEvent['step'] = 'newRow') =>
  event({
    step,
    handed: { source: 'alert', merchant: '', words: { app, title: '', subtitle: '', body } },
  });

describe('unreadAlertCounts', () => {
  it('counts per bank the alerts no template read, the most first', () => {
    const events = [
      event({ step: 'notAPayment', skipped: 'unread', handed: { bank: 'Vietcombank' } }),
      caught('VCB Digibank', 'Số dư TK VCB 0011000123456 -90,000 VND. ND: QUA SINH NHAT BE NA'),
      caught('MoMo', 'Ví của bạn -45.000đ. Lời nhắn: an trua cung team'),
      // Read: a payee after the amount, a memo that only says how money moved, a code.
      caught('MB Bank', 'TK 0123xxx456|GD: -50,000VND|ND: Thanh toan QR-PHO HOA'),
      caught('MB Bank', 'TK 0123xxx456|GD: -50,000VND|ND: CHUYEN TIEN'),
      event({ step: 'notAPayment', skipped: 'code', handed: { bank: 'MB Bank' } }),
    ];
    expect(unreadAlertCounts(events)).toEqual([
      { bank: 'Vietcombank', count: 2 },
      { bank: 'MoMo', count: 1 },
    ]);
  });

  it('counts a message caught twice once', () => {
    const body = 'Số dư TK VCB 0011000123456 -90,000 VND. ND: QUA SINH NHAT BE NA';
    const events = [caught('VCB Digibank', body), caught('VCB Digibank', body, 'repeatAlert')];
    expect(unreadAlertCounts(events)).toEqual([{ bank: 'Vietcombank', count: 1 }]);
  });

  it('reads an alert kept without its words by the name it was saved under', () => {
    const kept = (merchant: string) =>
      event({
        handed: { merchant, receipt: { bank: 'ACB', memo: 'QUA SINH NHAT', namingLines: [] } },
      });
    expect(unreadAlertCounts([kept('QUA SINH NHAT'), kept('Tiem Hoa Nho')])).toEqual([
      { bank: 'ACB', count: 1 },
    ]);
  });

  it('leaves out other ways in, failed charges and a log with nothing unread', () => {
    expect(unreadAlertCounts([event({ channel: 'email' })])).toEqual([]);
    expect(
      unreadAlertCounts([
        event({
          handed: { what: 'failed', receipt: { bank: 'ACB', memo: 'QUA', namingLines: [] } },
        }),
      ]),
    ).toEqual([]);
  });
});
