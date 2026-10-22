/** The link to the app itself, `/app`: what the page says to someone without 6pm installed. */
export type AppLinkLang = 'en' | 'vi';

interface AppLinkCopy {
  readonly title: string;
  readonly description: string;
  readonly heading: string;
  readonly body: string;
  readonly store: string;
  readonly home: string;
}

export const appLinkCopy: Readonly<Record<AppLinkLang, AppLinkCopy>> = {
  en: {
    title: 'Open 6pm',
    description: 'This link opens 6pm on iPhone. Without the app, it goes to the App Store.',
    heading: 'Taking you to the App Store',
    body: 'With 6pm on your iPhone, this link opens the app. Without it, here is where to get it.',
    store: 'Get 6pm on the App Store',
    home: 'Visit at6pm.app',
  },
  vi: {
    title: 'Mở 6pm',
    description: 'Liên kết này mở 6pm trên iPhone. Chưa có ứng dụng thì sẽ tới App Store.',
    heading: 'Đang mở App Store',
    body: 'Có 6pm trên iPhone thì liên kết này mở thẳng ứng dụng. Chưa có thì tải ở đây.',
    store: 'Tải 6pm trên App Store',
    home: 'Xem at6pm.app',
  },
};
