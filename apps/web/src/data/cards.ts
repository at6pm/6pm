/**
 * The share cards' links, `at6pm.app/c/<card>`: each card's QR opens its own path, so the
 * website's analytics count the visits each card brings, by path. The list follows the app's
 * card registry (`apps/mobile/src/features/sharing/cards/registry.ts`); a card added there adds
 * its path here.
 */
export const cardPaths = [
  'month',
  'streak',
  'split',
  'year',
  'jar',
  'covered',
  'fifth',
  'shop',
  'thanks',
  'work-year',
] as const;

export type CardPath = (typeof cardPaths)[number];

interface CardLinkCopy {
  readonly title: string;
  readonly description: string;
  readonly heading: string;
  readonly body: string;
  readonly ios: string;
  readonly android: string;
  readonly home: string;
}

/** What the page says while it sends a phone to its store, and to a computer, which stays. */
export const cardLinkCopy: Readonly<Record<'en' | 'vi', CardLinkCopy>> = {
  en: {
    title: 'Get 6pm',
    description: 'A card made with 6pm, the daily money ritual. Get the app on iPhone or Android.',
    heading: 'Made with 6pm',
    body: 'Every spend caught, closed at six, one number for tomorrow. On a phone this page opens its store; here, pick yours.',
    ios: 'Get it on the App Store',
    android: 'Get it on Google Play',
    home: 'Visit at6pm.app',
  },
  vi: {
    title: 'Tải 6pm',
    description:
      'Tấm thẻ này làm bằng 6pm, nghi thức tiền bạc mỗi ngày. Tải ứng dụng trên iPhone hoặc Android.',
    heading: 'Làm bằng 6pm',
    body: 'Ghi mọi khoản chi, chốt lúc sáu giờ, một con số cho ngày mai. Trên điện thoại, trang này tự mở cửa hàng; ở đây, chọn cửa hàng của bạn.',
    ios: 'Tải trên App Store',
    android: 'Tải trên Google Play',
    home: 'Xem at6pm.app',
  },
};
