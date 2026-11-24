import { describe, expect, it } from 'vitest';

import {
  appStoreRedeemUrl,
  maxChannelAt,
  maxCodeAppPath,
  maxCodeFromReferrer,
  maxCodeFromRoute,
  maxCodeReferrer,
  parseMaxChannel,
  parseMaxCode,
  playListingWithCode,
} from './max-codes';

describe('parseMaxChannel', () => {
  it('reads the known channels, whatever their case', () => {
    expect(parseMaxChannel('threads')).toBe('threads');
    expect(parseMaxChannel(' Tinhte ')).toBe('tinhte');
    expect(parseMaxChannel(['friend', 'youtube'])).toBe('friend');
  });

  it('refuses anything else', () => {
    expect(parseMaxChannel('tiktok')).toBeNull();
    expect(parseMaxChannel('')).toBeNull();
    expect(parseMaxChannel(undefined)).toBeNull();
    expect(parseMaxChannel(3)).toBeNull();
  });
});

describe('parseMaxCode', () => {
  it('upper-cases a code of letters and digits', () => {
    expect(parseMaxCode('threads6pm')).toBe('THREADS6PM');
    expect(parseMaxCode(' FRIEND6PM ')).toBe('FRIEND6PM');
  });

  it('refuses what neither store accepts', () => {
    expect(parseMaxCode('FRIEND-6PM')).toBeNull();
    expect(parseMaxCode('')).toBeNull();
    expect(parseMaxCode('A'.repeat(65))).toBeNull();
    expect(parseMaxCode('A'.repeat(64))).toBe('A'.repeat(64));
    expect(parseMaxCode(null)).toBeNull();
  });
});

describe('appStoreRedeemUrl', () => {
  it('fills the code into the App Store redemption page', () => {
    expect(appStoreRedeemUrl('6504689878', 'THREADS6PM')).toBe(
      'https://apps.apple.com/redeem?ctx=offercodes&id=6504689878&code=THREADS6PM',
    );
  });

  it('opens the page empty without a code', () => {
    expect(appStoreRedeemUrl('6504689878', null)).toBe(
      'https://apps.apple.com/redeem?ctx=offercodes&id=6504689878',
    );
  });
});

describe('install referrer', () => {
  it('carries the channel and code through Google Play and back', () => {
    const listing = playListingWithCode('app.at6pm', 'youtube', 'YOUTUBE6PM');
    expect(listing).toBe(
      'https://play.google.com/store/apps/details?id=app.at6pm&referrer=utm_source%3Dat6pm%26utm_medium%3Dmax-code%26utm_campaign%3Dyoutube%26utm_content%3DYOUTUBE6PM',
    );
    const handedBack = decodeURIComponent(/[?&]referrer=([^&]*)/.exec(listing)?.[1] ?? '');
    expect(maxCodeFromReferrer(handedBack)).toEqual({ channel: 'youtube', code: 'YOUTUBE6PM' });
  });

  it('reads a referrer still encoded, or in another order', () => {
    expect(maxCodeFromReferrer(encodeURIComponent(maxCodeReferrer('friend', 'FRIEND6PM')))).toEqual(
      { channel: 'friend', code: 'FRIEND6PM' },
    );
    expect(maxCodeFromReferrer('utm_campaign=tinhte&utm_medium=max-code&utm_source=at6pm')).toEqual(
      { channel: 'tinhte', code: null },
    );
  });

  it('ignores installs that did not come from a code link', () => {
    expect(maxCodeFromReferrer('utm_source=google-play&utm_medium=organic')).toBeNull();
    expect(maxCodeFromReferrer('utm_source=at6pm&utm_medium=card&utm_campaign=friend')).toBeNull();
    expect(
      maxCodeFromReferrer('utm_source=at6pm&utm_medium=max-code&utm_campaign=tiktok'),
    ).toBeNull();
    expect(maxCodeFromReferrer('')).toBeNull();
    expect(maxCodeFromReferrer(null)).toBeNull();
    expect(maxCodeFromReferrer('utm_source=%E0%A4%A')).toBeNull();
  });

  it('keeps the channel when the code is not one a store takes', () => {
    expect(
      maxCodeFromReferrer(
        'utm_source=at6pm&utm_medium=max-code&utm_campaign=friend&utm_content=a-b',
      ),
    ).toEqual({ channel: 'friend', code: null });
  });
});

describe('code links inside the app', () => {
  it('hands the channel and code to the app under /app', () => {
    expect(maxCodeAppPath('threads', 'THREADS6PM')).toBe('/app/r/threads?code=THREADS6PM');
    expect(maxCodeAppPath('friend', null)).toBe('/app/r/friend');
  });

  it('reads the route the app is opened on', () => {
    expect(maxCodeFromRoute('/r/threads?code=THREADS6PM')).toEqual({
      channel: 'threads',
      code: 'THREADS6PM',
    });
    expect(maxCodeFromRoute('/r/friend')).toEqual({ channel: 'friend', code: null });
    expect(maxCodeFromRoute('/r/Facebook/?x=1&code=fb6pm#top')).toEqual({
      channel: 'facebook',
      code: 'FB6PM',
    });
  });

  it('leaves every other route alone', () => {
    expect(maxCodeFromRoute('/max')).toBeNull();
    expect(maxCodeFromRoute('/r/other')).toBeNull();
    expect(maxCodeFromRoute('/r/tiktok?code=X')).toBeNull();
    expect(maxCodeFromRoute('/together/r/friend')).toBeNull();
  });

  it('drops a code that is not one', () => {
    expect(maxCodeFromRoute('/r/friend?code=%E0%A4%A')).toEqual({ channel: 'friend', code: null });
    expect(maxCodeFromRoute('/r/friend?code=no%20way')).toEqual({ channel: 'friend', code: null });
  });
});

describe('maxChannelAt', () => {
  const now = new Date('2026-12-10T10:00:00Z');

  it('counts a channel kept in the last thirty days', () => {
    expect(maxChannelAt({ channel: 'friend', at: '2026-11-11T10:00:00Z' }, now)).toBe('friend');
    expect(maxChannelAt({ channel: 'other', at: '2026-12-10T09:59:00Z' }, now)).toBe('other');
  });

  it('forgets one kept longer ago', () => {
    expect(maxChannelAt({ channel: 'friend', at: '2026-11-10T09:59:00Z' }, now)).toBeNull();
  });

  it('counts nothing it cannot trust', () => {
    expect(maxChannelAt(null, now)).toBeNull();
    expect(maxChannelAt({ channel: 'threads', at: 'yesterday' }, now)).toBeNull();
    expect(maxChannelAt({ channel: 'threads', at: '2026-12-11T10:00:00Z' }, now)).toBeNull();
  });
});
