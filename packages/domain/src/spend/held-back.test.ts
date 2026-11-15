import { describe, expect, it } from 'vitest';

import {
  certificateOf,
  heldBackChoiceOf,
  heldBackFor,
  heldBackLines,
  heldBackRemembered,
  heldBackShareOf,
  namesHeldBack,
  tenthHeldBack,
  toggleCertificate,
} from './held-back';

describe('tax held back', () => {
  it('works a tenth backwards from what landed: 18tr landed is 20tr billed, 2tr held', () => {
    expect(tenthHeldBack(18_000_000)).toBe(2_000_000);
    expect(heldBackLines(18_000_000, tenthHeldBack(18_000_000))).toEqual({
      billed: 20_000_000,
      heldBack: 2_000_000,
      landed: 18_000_000,
    });
    expect(tenthHeldBack(5_400_000)).toBe(600_000);
  });

  it('says nothing, a tenth or an amount typed', () => {
    expect(heldBackFor(18_000_000, { kind: 'nothing' })).toBe(0);
    expect(heldBackFor(18_000_000, { kind: 'tenth' })).toBe(2_000_000);
    expect(heldBackFor(18_000_000, { kind: 'typed', amount: 1_500_000 })).toBe(1_500_000);
    expect(heldBackFor(18_000_000, { kind: 'typed', amount: -5 })).toBe(0);
  });

  it('reads an amount back as the switch shows it', () => {
    expect(heldBackChoiceOf(18_000_000, null)).toEqual({ kind: 'nothing' });
    expect(heldBackChoiceOf(18_000_000, 2_000_000)).toEqual({ kind: 'tenth' });
    expect(heldBackChoiceOf(18_000_000, 1_500_000)).toEqual({ kind: 'typed', amount: 1_500_000 });
  });

  it('leaves landed as the plan counts it: billed adds what was held', () => {
    expect(heldBackLines(1_500_000, null)).toEqual({
      billed: 1_500_000,
      heldBack: 0,
      landed: 1_500_000,
    });
  });

  it('is remembered per sender only as a tenth', () => {
    expect(heldBackShareOf(18_000_000, 2_000_000)).toBe(10);
    expect(heldBackShareOf(18_000_000, 1_500_000)).toBeNull();
    expect(heldBackShareOf(18_000_000, 0)).toBeNull();
    expect(heldBackRemembered(18_000_000, 10)).toBe(2_000_000);
    expect(heldBackRemembered(18_000_000, null)).toBe(0);
  });

  it('is offered when the note says TNCN or thuế', () => {
    expect(namesHeldBack(['CK dot 2 bo nhan dien da tru 10% TNCN'])).toBe(true);
    expect(namesHeldBack(['Thanh toan, đã trừ thuế'])).toBe(true);
    expect(namesHeldBack(['chuyen khoan', null])).toBe(false);
    expect(namesHeldBack(['THUEBAO'])).toBe(false);
  });
});

describe('the certificate', () => {
  it('waits while nothing came, and is inked with the day it came', () => {
    expect(certificateOf({ heldBack: null })).toEqual({ kind: 'none' });
    expect(certificateOf({ heldBack: 2_000_000, certificate: null })).toEqual({ kind: 'waiting' });
    const inked = toggleCertificate({ certificate: null }, '2026-11-30');
    expect(inked).toEqual({ certificate: true, certificateOn: '2026-11-30' });
    expect(certificateOf({ heldBack: 2_000_000, ...inked })).toEqual({
      kind: 'arrived',
      on: '2026-11-30',
    });
    expect(toggleCertificate(inked, '2026-12-01')).toEqual({
      certificate: false,
      certificateOn: null,
    });
  });
});
