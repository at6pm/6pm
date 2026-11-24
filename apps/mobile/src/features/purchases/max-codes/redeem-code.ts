import { appStoreRedeemUrl } from '@6pm/domain';

/** 6pm's id on the App Store (`ai.sixpm.app`), which its offer codes are redeemed against. */
export const APPLE_APP_ID = '6504689878';

/**
 * Where a code is typed. `store`: the store's own redemption was opened (Apple's sheet, or the App
 * Store's page with the code filled in) and its answer arrives as a change of customer. `purchase`:
 * the store takes codes in its purchase window (Google Play: the payment method, then "Redeem
 * code"), so the sheet starts the purchase with that said.
 */
export type RedeemRoute = 'store' | 'purchase';

export interface RedeemDeps {
  readonly platform: string;
  /** Apple's offer code sheet, through RevenueCat. */
  readonly presentSheet: () => Promise<void>;
  readonly openUrl: (url: string) => Promise<unknown>;
  /** Asks the store again for what this Apple ID holds when the person comes back to 6pm. */
  readonly syncWhenBack: () => void;
}

/**
 * Opens the store's own redemption for a Max code. On iPhone a known code goes to the App Store's
 * page with it filled in (Apple's sheet cannot be handed one); with none, Apple's sheet, and if
 * that sheet will not show, the App Store's page empty. Android has no redemption to open: Google
 * Play takes the code in the purchase itself.
 */
export async function redeemThroughStore(
  deps: RedeemDeps,
  code: string | null,
): Promise<RedeemRoute> {
  if (deps.platform === 'android') return 'purchase';
  if (code === null) {
    try {
      await deps.presentSheet();
      return 'store';
    } catch {
      // The sheet is known to fail now and then (RevenueCat's own note): the page never does.
    }
  }
  await deps.openUrl(appStoreRedeemUrl(APPLE_APP_ID, code));
  deps.syncWhenBack();
  return 'store';
}
