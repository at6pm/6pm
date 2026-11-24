import type { MaxLinkChannel } from '@6pm/domain';

/**
 * A Max code link, `at6pm.app/r/<channel>`: the code it hands on, and whether each store has it
 * yet. Codes are made by hand in App Store Connect (an offer code on the Max subscription, custom
 * code) and Play Console (a promo code on the yearly base plan, custom code), with the same text
 * in both. Until a store has the code, its phones go to the plain listing, still counted by path
 * and, on Android, still carrying the channel to the app. Turn a store on here when its code is
 * live, then deploy the site.
 */
export interface MaxCodeLink {
  /** Letters and digits only, as both stores require; at most 64. */
  readonly code: string;
  readonly appStore: boolean;
  readonly googlePlay: boolean;
}

export const maxCodeLinks: Readonly<Record<MaxLinkChannel, MaxCodeLink>> = {
  threads: { code: 'THREADS6PM', appStore: false, googlePlay: false },
  youtube: { code: 'YOUTUBE6PM', appStore: false, googlePlay: false },
  facebook: { code: 'FACEBOOK6PM', appStore: false, googlePlay: false },
  tinhte: { code: 'TINHTE6PM', appStore: false, googlePlay: false },
  friend: { code: 'FRIEND6PM', appStore: false, googlePlay: false },
};

/** 6pm's id on the App Store, which its offer codes are redeemed against. */
export const appleAppId = '6504689878';

/** The Android packages: the dev host's links open the dev build. */
export const androidPackages = { prd: 'app.at6pm', dev: 'app.at6pm.dev' } as const;

interface MaxCodeCopy {
  readonly title: string;
  readonly description: string;
  readonly headingFriend: string;
  readonly headingChannel: string;
  /** When a store has the code: what the link does. */
  readonly bodyOffer: string;
  /** When neither store has it yet: the plain way to the app. */
  readonly bodyStore: string;
  readonly codeLabel: string;
  readonly iosRedeem: string;
  readonly ios: string;
  readonly android: string;
  readonly home: string;
}

/** What the page says while it sends a phone on, and to a computer, which stays. */
export const maxCodeCopy: Readonly<Record<'en' | 'vi', MaxCodeCopy>> = {
  en: {
    title: 'A 6pm Max offer',
    description:
      'A 6pm Max offer. On iPhone it opens the App Store with the code filled in; on Android, 6pm or Google Play.',
    headingFriend: 'A friend sent you 6pm Max',
    headingChannel: 'Your 6pm Max offer',
    bodyOffer:
      '6pm shows what you can spend today and logs your spending by itself. On iPhone this page opens the App Store with the code filled in; on Android, 6pm or Google Play, where you add the code when you pay.',
    bodyStore:
      '6pm shows what you can spend today and logs your spending by itself. On a phone this page opens its store; here, pick yours.',
    codeLabel: 'Your code',
    iosRedeem: 'Redeem on the App Store',
    ios: 'Get it on the App Store',
    android: 'Get it on Google Play',
    home: 'Visit at6pm.app',
  },
  vi: {
    title: 'Ưu đãi 6pm Max',
    description:
      'Ưu đãi 6pm Max. Trên iPhone, trang mở App Store với mã điền sẵn; trên Android, mở 6pm hoặc Google Play.',
    headingFriend: 'Bạn bè tặng bạn 6pm Max',
    headingChannel: 'Ưu đãi 6pm Max của bạn',
    bodyOffer:
      '6pm cho bạn biết hôm nay tiêu được bao nhiêu và tự ghi chi tiêu. Trên iPhone, trang này mở App Store với mã điền sẵn; trên Android, mở 6pm hoặc Google Play, nhập mã khi thanh toán.',
    bodyStore:
      '6pm cho bạn biết hôm nay tiêu được bao nhiêu và tự ghi chi tiêu. Trên điện thoại, trang này tự mở cửa hàng; ở đây, chọn cửa hàng của bạn.',
    codeLabel: 'Mã của bạn',
    iosRedeem: 'Đổi mã trên App Store',
    ios: 'Tải trên App Store',
    android: 'Tải trên Google Play',
    home: 'Xem at6pm.app',
  },
};
