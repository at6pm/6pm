import { describe, expect, it } from 'vitest';

import { billTopicOf, otherBillKind, sameBillKind, tidyPayee } from './bill-topic';

describe('the kind of bill a payee reads as', () => {
  it.each([
    ['hóa đơn của dịch vụ Điện lực Hồ Chí Minh', 'power'],
    ['EVNHCMC', 'power'],
    ['Tổng công ty Điện lực Hà Nội', 'power'],
    ['EVNSPC Đồng Nai', 'power'],
    ['SAWACO', 'power'],
    ['Cấp nước Chợ Lớn', 'power'],
    ['Nước sạch Hà Nội', 'power'],
    ['VNPT Hồ Chí Minh', 'phone'],
    ['Viettel', 'phone'],
    ['FPT Telecom', 'phone'],
    ['MobiFone trả sau', 'phone'],
    ['Thanh toán tiền điện thoại', 'phone'],
    ['Hoá đơn điện thoại Vinaphone', 'phone'],
    ['Tiền nhà tháng 11', 'rent'],
  ] as const)('%j is a %s bill', (payee, topic) => {
    expect(billTopicOf(payee)).toBe(topic);
  });

  it('never reads a provider’s wallet, shop or courier as its bill', () => {
    expect(billTopicOf('Viettel Money')).toBeNull();
    expect(billTopicOf('ViettelPay')).toBeNull();
    expect(billTopicOf('Viettel Store Quận 1')).toBeNull();
    expect(billTopicOf('Viettel Post')).toBeNull();
    expect(billTopicOf('VNPT Money')).toBeNull();
    expect(billTopicOf('Điện máy Xanh')).toBeNull();
  });
});

describe('a payee and a plan bill of the same kind', () => {
  it('matches power to "Điện nước" and phones to "Điện thoại & mạng"', () => {
    expect(sameBillKind('Điện lực Hồ Chí Minh', 'Điện nước')).toBe(true);
    expect(sameBillKind('SAWACO', 'Điện nước')).toBe(true);
    expect(sameBillKind('VNPT', 'Điện thoại & mạng')).toBe(true);
    expect(sameBillKind('Viettel Telecom', 'Điện thoại & mạng')).toBe(true);
  });

  it('never matches power to a phone bill, nor a phone payee to a power bill', () => {
    expect(sameBillKind('Điện lực Hồ Chí Minh', 'Điện thoại & mạng')).toBe(false);
    expect(otherBillKind('Điện lực Hồ Chí Minh', 'Điện thoại & mạng')).toBe(true);
    expect(sameBillKind('Cước điện thoại Viettel', 'Điện')).toBe(false);
    expect(otherBillKind('Cước điện thoại Viettel', 'Điện')).toBe(true);
  });

  it('tells water from electricity when both sides say which', () => {
    expect(sameBillKind('EVNHCMC', 'Tiền nước')).toBe(false);
    expect(sameBillKind('EVNHCMC', 'Tiền điện')).toBe(true);
    expect(sameBillKind('Cấp nước Gia Định', 'Tiền nước')).toBe(true);
  });

  it('says nothing about a payee or a bill of no known kind', () => {
    expect(sameBillKind('Highlands Coffee', 'Điện nước')).toBe(false);
    expect(otherBillKind('Highlands Coffee', 'Điện nước')).toBe(false);
    expect(otherBillKind('EVNHCMC', 'Netflix')).toBe(false);
  });
});

describe('tidyPayee', () => {
  it.each([
    ['hóa đơn của dịch vụ Điện lực Hồ Chí Minh', 'Điện lực Hồ Chí Minh'],
    ['Thanh toán hóa đơn của dịch vụ Điện lực Hồ Chí Minh', 'Điện lực Hồ Chí Minh'],
    ['Thanh toán hoá đơn VNPT', 'VNPT'],
    ['HOA DON DICH VU SAWACO', 'SAWACO'],
    ['Thanh toán dịch vụ FPT Telecom', 'FPT Telecom'],
    ['Hóa đơn tiền điện', 'tiền điện'],
  ])('%j is %j', (payee, tidy) => {
    expect(tidyPayee(payee)).toBe(tidy);
  });

  it('keeps every other payee as it is', () => {
    expect(tidyPayee('Highlands Coffee')).toBe('Highlands Coffee');
    expect(tidyPayee('THANH TOAN THE TIN DUNG')).toBe('THANH TOAN THE TIN DUNG');
    expect(tidyPayee('Dịch vụ giặt ủi Lan')).toBe('Dịch vụ giặt ủi Lan');
    expect(tidyPayee('Hóa đơn')).toBe('Hóa đơn');
    expect(tidyPayee('  Phở Hòa ')).toBe('Phở Hòa');
  });
});
