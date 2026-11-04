import { describe, expect, it } from 'vitest';

import { readQrContent } from './read-qr-content';

describe('readQrContent', () => {
  it('reads a web link with its host, and a bare www address as https', () => {
    expect(readQrContent('https://at6pm.app/blog?x=1')).toEqual({
      kind: 'link',
      url: 'https://at6pm.app/blog?x=1',
      host: 'at6pm.app',
    });
    expect(readQrContent('www.example.com/menu')).toEqual({
      kind: 'link',
      url: 'https://www.example.com/menu',
      host: 'www.example.com',
    });
  });

  it('names the real host when a link hides it behind a user name', () => {
    expect(readQrContent('https://paypal.com@evil.example/login')).toMatchObject({
      kind: 'link',
      host: 'evil.example',
    });
  });

  it('never makes a link of another scheme', () => {
    for (const scheme of [
      'javascript:alert(1)',
      'intent://x#Intent;end',
      'momo://app',
      'ftp://a.b/c',
    ]) {
      expect(readQrContent(scheme)?.kind).toBe('text');
    }
  });

  it('reads Wi-Fi sign-in, with escapes and a hidden network', () => {
    expect(readQrContent(String.raw`WIFI:T:WPA;S:Café\;5G;P:pa\:ss\\word;H:true;;`)).toEqual({
      kind: 'wifi',
      network: 'Café;5G',
      password: 'pa:ss\\word',
      security: 'wpa',
      hidden: true,
    });
    expect(readQrContent('WIFI:T:nopass;S:Guest;;')).toMatchObject({
      kind: 'wifi',
      password: null,
      security: 'open',
    });
    expect(readQrContent('WIFI:T:WEP;S:old;P:12345;;')).toMatchObject({ security: 'wep' });
  });

  it('reads phone, text message and email codes', () => {
    expect(readQrContent('tel:+84 912 345 678')).toEqual({
      kind: 'phone',
      number: '+84 912 345 678',
    });
    expect(readQrContent('SMSTO:0912345678:Chào bạn')).toEqual({
      kind: 'sms',
      number: '0912345678',
      body: 'Chào bạn',
    });
    expect(readQrContent('sms:0912345678?body=hi%20there')).toMatchObject({ body: 'hi there' });
    expect(readQrContent('mailto:a@b.com?subject=Hello%20you&body=Hi')).toEqual({
      kind: 'email',
      address: 'a@b.com',
      subject: 'Hello you',
      body: 'Hi',
    });
    expect(readQrContent('MATMSG:TO:a@b.com;SUB:Hi;BODY:There;;')).toMatchObject({
      kind: 'email',
      subject: 'Hi',
    });
  });

  it('reads a place, rejecting coordinates off the globe', () => {
    expect(readQrContent('geo:10.7769,106.7009?q=Chợ Bến Thành')).toEqual({
      kind: 'place',
      latitude: 10.7769,
      longitude: 106.7009,
      label: 'Chợ Bến Thành',
    });
    expect(readQrContent('geo:200,10')?.kind).toBe('text');
  });

  it('reads a vCard and a MECARD', () => {
    expect(
      readQrContent(
        'BEGIN:VCARD\r\nVERSION:3.0\r\nN:Bui;Khanh;;;\r\nFN:Khanh Bui\r\nORG:Odd Eggs;\r\nTEL;TYPE=CELL:+84901234567\r\nEMAIL:hi@at6pm.app\r\nEND:VCARD',
      ),
    ).toEqual({
      kind: 'contact',
      name: 'Khanh Bui',
      organisation: 'Odd Eggs',
      phones: ['+84901234567'],
      emails: ['hi@at6pm.app'],
    });
    expect(
      readQrContent('MECARD:N:Bui,Khanh;TEL:0901234567;TEL:0287654321;EMAIL:k@x.vn;;'),
    ).toEqual({
      kind: 'contact',
      name: 'Khanh Bui',
      organisation: null,
      phones: ['0901234567', '0287654321'],
      emails: ['k@x.vn'],
    });
  });

  it('keeps anything else as text, and refuses an empty, huge or binary payload', () => {
    expect(readQrContent('  Bàn số 12  ')).toEqual({ kind: 'text', text: 'Bàn số 12' });
    expect(readQrContent('   ')).toBeNull();
    expect(readQrContent('x'.repeat(4001))).toBeNull();
    expect(readQrContent('ab\u0000cd')).toBeNull();
  });
});
