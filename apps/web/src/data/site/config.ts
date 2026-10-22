/**
 * What the home page asks visitors to do: join the launch list until the app is out, then download
 * it. Flip to `store` on launch day and redeploy.
 */
export const ctaMode: 'waitlist' | 'store' = 'waitlist';

/** 6pm's App Store page, without a storefront so each visitor lands in their own. */
export const appStoreUrl = 'https://apps.apple.com/app/id6504689878';

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
 * 6pm Max as the App Store sells it: Vietnam in đồng for the Vietnamese page, the US in dollars for
 * the English one. The app reads its prices from the store; these are the tiers configured there.
 */
export const maxPrices = {
  en: { month: 4.99, year: 34.99 },
  vi: { month: 99_000, year: 799_000 },
} as const;
