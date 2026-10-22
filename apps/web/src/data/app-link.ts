/** The link to the app itself, `/app`: what the page says to someone without 6pm installed. */
export type AppLinkLang = 'en' | 'vi';

/** Where the page sends them: the public beta until launch, the App Store after. */
export type AppLinkTarget = 'beta' | 'store';

interface AppLinkCopy {
  readonly title: string;
  readonly description: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: string;
  readonly home: string;
}

export const appLinkCopy: Readonly<
  Record<AppLinkTarget, Readonly<Record<AppLinkLang, AppLinkCopy>>>
> = {
  beta: {
    en: {
      title: 'Open 6pm',
      description: 'This link opens 6pm on iPhone. Without the app, it goes to the public beta.',
      heading: 'Taking you to the beta',
      body: 'With 6pm on your iPhone, this link opens the app. Until it reaches the App Store on Fri 6 Nov, 18:00 Vietnam time, the new 6pm is in a public TestFlight beta.',
      cta: 'Join the TestFlight beta',
      home: 'Visit at6pm.app',
    },
    vi: {
      title: 'Mở 6pm',
      description: 'Liên kết này mở 6pm trên iPhone. Chưa có ứng dụng thì sẽ tới bản beta.',
      heading: 'Đang mở bản beta',
      body: 'Có 6pm trên iPhone thì liên kết này mở thẳng ứng dụng. Trước khi lên App Store lúc 18:00 thứ Sáu 6/11, 6pm mới đang thử nghiệm công khai trên TestFlight.',
      cta: 'Tham gia beta trên TestFlight',
      home: 'Xem at6pm.app',
    },
  },
  store: {
    en: {
      title: 'Open 6pm',
      description: 'This link opens 6pm on iPhone. Without the app, it goes to the App Store.',
      heading: 'Taking you to the App Store',
      body: 'With 6pm on your iPhone, this link opens the app. Without it, here is where to get it.',
      cta: 'Get 6pm on the App Store',
      home: 'Visit at6pm.app',
    },
    vi: {
      title: 'Mở 6pm',
      description: 'Liên kết này mở 6pm trên iPhone. Chưa có ứng dụng thì sẽ tới App Store.',
      heading: 'Đang mở App Store',
      body: 'Có 6pm trên iPhone thì liên kết này mở thẳng ứng dụng. Chưa có thì tải ở đây.',
      cta: 'Tải 6pm trên App Store',
      home: 'Xem at6pm.app',
    },
  },
};
