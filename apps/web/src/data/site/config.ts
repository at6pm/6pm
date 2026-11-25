import type { SiteLang } from './langs';

/**
 * What the home page asks visitors to do: join the launch list until the app is out, then download
 * it. Flip to `store` on launch day and redeploy.
 */
export const ctaMode: 'waitlist' | 'store' = 'store';

/** 6pm's App Store page, without a storefront so each visitor lands in their own. */
export const appStoreUrl = 'https://apps.apple.com/app/id6504689878';

/**
 * 6pm's Google Play listing (package `app.at6pm`), public since 21 Nov 2026: the home page's badge,
 * and where a link to the app or a share card sends an Android phone.
 */
export const playStoreUrl = 'https://play.google.com/store/apps/details?id=app.at6pm';

/** The public TestFlight beta, open to anyone with the link until and after the launch. */
export const testFlightUrl = 'https://testflight.apple.com/join/a8UrvT5P';

export const repoUrl = 'https://github.com/at6pm/6pm';
export const studioUrl = 'https://oddeggs.studio';
export const studioName = 'Odd Eggs';

/** Who signs the articles, and where else they are found. */
export const founder = {
  name: 'Khánh Quốc',
  url: 'https://quocs.com',
  sameAs: ['https://github.com/bkdev98', 'https://x.com/bkdev98'],
} as const;

/** 6pm's own accounts, for search engines to tie the brand together. */
export const brandProfiles = [
  'https://www.facebook.com/profile.php?id=61595400101945',
  'https://www.youtube.com/@at6pmapp',
  'https://www.tiktok.com/@at6pmapp',
  'https://www.instagram.com/at6pmapp',
  'https://github.com/at6pm',
] as const;

/** The studio's account on X, where 6pm's posts go. */
export const studioProfiles = ['https://x.com/OddEggsStudio'] as const;

/** The page's background, also the browser chrome colour. */
export const siteBackground = '#8fd0c6';

/**
 * 6pm Max as the App Store sells it in each page's market (`langs.ts`): the US in dollars for the
 * English page, Vietnam in đồng for the Vietnamese one, and so on. The app reads its prices from the
 * store; these are the tiers configured there, from 25 November 2026.
 */
export const maxPrices = {
  en: { month: 2.49, year: 19.99 },
  vi: { month: 49_000, year: 299_000 },
  'zh-Hans': { month: 18, year: 148 },
  ja: { month: 400, year: 3_000 },
  ko: { month: 4_400, year: 33_000 },
  th: { month: 99, year: 699 },
  id: { month: 49_000, year: 399_000 },
  es: { month: 2.99, year: 22.99 },
  fr: { month: 2.99, year: 22.99 },
  de: { month: 2.99, year: 22.99 },
} as const satisfies Record<SiteLang, { month: number; year: number }>;
