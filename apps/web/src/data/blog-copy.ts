/** The blog's languages: English at the root, Vietnamese under `/vi`. */
export type BlogLang = 'en' | 'vi';

/** What the blog pages say around the articles, in each language. */
interface BlogCopy {
  readonly name: string;
  /** The brand line, on the social cards. */
  readonly tagline: string;
  readonly indexTitle: string;
  readonly indexDescription: string;
  readonly indexLede: string;
  readonly guides: string;
  readonly engineering: string;
  readonly engineeringLede: string;
  readonly home: string;
  readonly brandLabel: string;
  readonly otherLanguage: string;
  readonly otherLanguageLabel: string;
  readonly published: string;
  readonly updated: string;
  readonly minutes: (n: number) => string;
  readonly by: string;
  readonly contents: string;
  readonly related: string;
  readonly breadcrumb: string;
  readonly beta: string;
  readonly betaShort: string;
  readonly store: string;
  readonly launchNote: string;
  readonly code: string;
  readonly rss: string;
  readonly authorRole: string;
  readonly authorBio: string;
  readonly authorDescription: string;
  readonly authorElsewhere: string;
  readonly authorPosts: string;
  readonly privacy: string;
  readonly terms: string;
  readonly openSource: string;
  readonly madeBy: string;
  readonly formatDate: (date: Date) => string;
}

const vietnam = { timeZone: 'Asia/Ho_Chi_Minh' } as const;

export const blogCopy: Readonly<Record<BlogLang, BlogCopy>> = {
  en: {
    name: 'Blog',
    tagline: 'Every spend, caught.',
    indexTitle: '6pm blog: track spending without the homework',
    indexDescription:
      'Guides to tracking spending automatically on iPhone, a daily safe-to-spend number, and how the open-source 6pm app is built.',
    indexLede:
      'How to catch every spend without logging it by hand, how much you can spend today, and how the app is built, in the open.',
    guides: 'Money guides',
    engineering: 'Engineering',
    engineeringLede:
      'How 6pm is built with Expo, React Native, Skia and Swift. The code is open source.',
    home: '6pm',
    brandLabel: '6pm, home',
    otherLanguage: 'Tiếng Việt',
    otherLanguageLabel: 'Đọc bằng tiếng Việt',
    published: 'Published',
    updated: 'Updated',
    minutes: (n) => `${n} min read`,
    by: 'By',
    contents: 'On this page',
    related: 'Read next',
    breadcrumb: 'Breadcrumb',
    beta: 'Join the TestFlight beta',
    betaShort: 'Try the beta',
    store: 'Download on the App Store',
    launchNote: 'On the App Store Fri 6 Nov, 18:00 Vietnam time. The public beta is open now.',
    code: 'Read the code',
    rss: 'RSS feed',
    authorRole: 'Founder of 6pm, Odd Eggs',
    authorBio:
      'Khánh Quốc builds 6pm at Odd Eggs, a small app studio in Saigon. The whole app, server included, is open source, so every claim here can be checked against the code.',
    authorDescription:
      'Khánh Quốc, founder of 6pm at Odd Eggs in Saigon, writes about tracking spending, the daily safe-to-spend number and how the open-source app is built.',
    authorElsewhere: 'Elsewhere',
    authorPosts: 'Articles',
    privacy: 'Privacy',
    terms: 'Terms',
    openSource: 'Open source',
    madeBy: 'Made by',
    formatDate: (date) =>
      date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...vietnam,
      }),
  },
  vi: {
    name: 'Blog',
    tagline: 'Tiêu tới đâu, tự ghi tới đó.',
    indexTitle: 'Blog 6pm: ghi chi tiêu mà không phải ghi chép',
    indexDescription:
      'Hướng dẫn ghi chi tiêu tự động trên iPhone, quét VietQR, chụp hoá đơn, và cách tính mỗi ngày tiêu được bao nhiêu với 6pm.',
    indexLede:
      'Cách để mọi khoản chi tự vào sổ, cách biết hôm nay tiêu được bao nhiêu, và những thói quen tiền bạc giữ được lâu.',
    guides: 'Hướng dẫn',
    engineering: 'Kỹ thuật',
    engineeringLede: 'Cách 6pm được làm (bài viết bằng tiếng Anh).',
    home: '6pm',
    brandLabel: '6pm, trang chủ',
    otherLanguage: 'English',
    otherLanguageLabel: 'Read in English',
    published: 'Đăng',
    updated: 'Cập nhật',
    minutes: (n) => `${n} phút đọc`,
    by: 'Tác giả',
    contents: 'Nội dung',
    related: 'Đọc tiếp',
    breadcrumb: 'Đường dẫn',
    beta: 'Dùng thử bản beta TestFlight',
    betaShort: 'Dùng thử beta',
    store: 'Tải về trên App Store',
    launchNote: 'Lên App Store lúc 18:00 thứ Sáu, 6/11. Bản beta công khai đã mở.',
    code: 'Xem mã nguồn',
    rss: 'Nguồn RSS',
    authorRole: 'Người sáng lập 6pm, Odd Eggs',
    authorBio:
      'Khánh Quốc làm 6pm ở Odd Eggs, một studio làm app nhỏ tại Sài Gòn. Toàn bộ app, kể cả máy chủ, là mã nguồn mở, nên mọi điều viết ở đây đều kiểm chứng được trong mã.',
    authorDescription:
      'Khánh Quốc, người sáng lập 6pm ở Odd Eggs, Sài Gòn, viết về cách ghi chi tiêu tự động, con số tiêu được mỗi ngày và cách app mã nguồn mở này được làm.',
    authorElsewhere: 'Ở nơi khác',
    authorPosts: 'Bài viết',
    privacy: 'Quyền riêng tư',
    terms: 'Điều khoản',
    openSource: 'Mã nguồn mở',
    madeBy: 'Thực hiện bởi',
    formatDate: (date) =>
      date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...vietnam,
      }),
  },
};
