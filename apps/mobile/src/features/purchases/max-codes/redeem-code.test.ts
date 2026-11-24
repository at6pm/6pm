import { describe, expect, it, jest } from '@jest/globals';

import { redeemThroughStore, type RedeemDeps } from './redeem-code';

function store(platform: string, sheet: 'shows' | 'fails' = 'shows') {
  const presentSheet = jest.fn(() =>
    sheet === 'shows' ? Promise.resolve() : Promise.reject(new Error('view service')),
  );
  const openUrl = jest.fn((_url: string) => Promise.resolve(true));
  const syncWhenBack = jest.fn();
  const deps: RedeemDeps = { platform, presentSheet, openUrl, syncWhenBack };
  return { deps, presentSheet, openUrl, syncWhenBack };
}

describe('redeeming a Max code', () => {
  it('opens Apple’s sheet on iPhone when no code is known', async () => {
    const { deps, presentSheet, openUrl } = store('ios');
    await expect(redeemThroughStore(deps, null)).resolves.toBe('store');
    expect(presentSheet).toHaveBeenCalledTimes(1);
    expect(openUrl).not.toHaveBeenCalled();
  });

  it('fills a known code into the App Store’s page, and asks the store again on return', async () => {
    const { deps, presentSheet, openUrl, syncWhenBack } = store('ios');
    await expect(redeemThroughStore(deps, 'FRIEND6PM')).resolves.toBe('store');
    expect(presentSheet).not.toHaveBeenCalled();
    expect(openUrl).toHaveBeenCalledWith(
      'https://apps.apple.com/redeem?ctx=offercodes&id=6504689878&code=FRIEND6PM',
    );
    expect(syncWhenBack).toHaveBeenCalledTimes(1);
  });

  it('falls back to the App Store’s page when Apple’s sheet will not show', async () => {
    const { deps, openUrl, syncWhenBack } = store('ios', 'fails');
    await expect(redeemThroughStore(deps, null)).resolves.toBe('store');
    expect(openUrl).toHaveBeenCalledWith(
      'https://apps.apple.com/redeem?ctx=offercodes&id=6504689878',
    );
    expect(syncWhenBack).toHaveBeenCalledTimes(1);
  });

  it('hands the code to Google Play’s purchase window on Android', async () => {
    const { deps, presentSheet, openUrl } = store('android');
    await expect(redeemThroughStore(deps, 'THREADS6PM')).resolves.toBe('purchase');
    expect(presentSheet).not.toHaveBeenCalled();
    expect(openUrl).not.toHaveBeenCalled();
  });

  it('lets a page that cannot open fail to the caller', async () => {
    const { deps, openUrl } = store('ios');
    openUrl.mockImplementationOnce(() => Promise.reject(new Error('no App Store')));
    await expect(redeemThroughStore(deps, 'FRIEND6PM')).rejects.toThrow('no App Store');
  });
});
