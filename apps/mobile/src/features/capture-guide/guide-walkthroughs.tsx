import type { StringKey } from '@6pm/i18n';

import { useI18n } from '../../i18n/i18n';
import { nativeReach } from '../surfaces/native-reach';
import { BANK_ALERT_SHORTCUT_URL } from './bank-alert-shortcut';
import type { CaptureSource } from './source-status';
import { AlertTestFrame, CatchActionFrame, ChooseAppsFrame } from './walkthrough/alert-frames';
import {
  GmailAddAddressFrame,
  GmailForwardingTabFrame,
  GmailSettingsFrame,
} from './walkthrough/gmail-frames-forward';
import { GmailVerifyFrame } from './walkthrough/gmail-frames-verify';
import { GmailFilterFrame, GmailForwardItFrame } from './walkthrough/gmail-frames-filter';
import { ReceiptShareFrame, ShareCardFrame, ShareSheetFrame } from './walkthrough/share-frames';
import { RunShortcutFrame } from './walkthrough/wallet-frames-action';
import { AddShortcutFrame } from './walkthrough/wallet-frames-add';
import { FinishFrame, TestFrame } from './walkthrough/wallet-frames-end';
import { AutomationFrame, TriggerFrame } from './walkthrough/wallet-frames-start';
import type { WalkthroughStep } from './walkthrough/walkthrough';

type WalkKey = Exclude<Extract<StringKey, `capture.walk.${string}`>, 'capture.walk.stepOf'>;

interface StepPlan {
  readonly title: WalkKey;
  readonly detail: WalkKey;
  /** The drawn screen's loop, in milliseconds. */
  readonly loop: number;
  /** The moment held with Reduce Motion: just before the step's tap. */
  readonly still: number;
  readonly frame: WalkthroughStep['frame'];
}

/** The ways that are set up step by step, each with its pictured screens. */
export type WalkedSource = Extract<CaptureSource, 'wallet' | 'email' | 'share' | 'alerts'>;

export function isWalked(source: CaptureSource): source is WalkedSource {
  // Android's listener is one switch in its settings: three short steps say it.
  if (source === 'alerts') return !nativeReach.alertListener;
  return source === 'wallet' || source === 'email' || source === 'share';
}

/**
 * The Wallet automation as iOS 27 builds it, around the published 6pm shortcut: add that shortcut,
 * then a shortcut with the Wallet trigger at its top that runs it.
 */
const WALLET: readonly StepPlan[] = [
  {
    title: 'capture.walk.wallet.s1Title',
    detail: 'capture.walk.wallet.s1Body',
    loop: 4200,
    still: 0.44,
    frame: (t, s) => <AddShortcutFrame t={t} scale={s.phoneScale} />,
  },
  {
    title: 'capture.walk.wallet.s2Title',
    detail: 'capture.walk.wallet.s2Body',
    loop: 6000,
    still: 0.475,
    frame: (t, s) => <AutomationFrame t={t} scale={s.phoneScale} />,
  },
  {
    title: 'capture.walk.wallet.s3Title',
    detail: 'capture.walk.wallet.s3Body',
    loop: 5600,
    still: 0.525,
    frame: (t, s) => <TriggerFrame t={t} scale={s.phoneScale} kind="wallet" />,
  },
  {
    title: 'capture.walk.wallet.s4Title',
    detail: 'capture.walk.wallet.s4Body',
    loop: 7600,
    still: 0.695,
    frame: (t, s) => <RunShortcutFrame t={t} scale={s.phoneScale} />,
  },
  {
    title: 'capture.walk.wallet.s5Title',
    detail: 'capture.walk.wallet.s5Body',
    loop: 5000,
    still: 0.465,
    frame: (t, s) => <FinishFrame t={t} scale={s.phoneScale} kind="wallet" />,
  },
  {
    title: 'capture.walk.wallet.s6Title',
    detail: 'capture.walk.wallet.s6Body',
    loop: 5200,
    still: 0.4,
    frame: (t, s) => <TestFrame t={t} scale={s.phoneScale} />,
  },
];

/** Choosing the apps, saving with nothing shown, and trying it: the end of either way in. */
const ALERTS_END: readonly StepPlan[] = [
  {
    title: 'capture.walk.alerts.s5Title',
    detail: 'capture.walk.alerts.s5Body',
    loop: 5000,
    still: 0.465,
    frame: (t, s) => <FinishFrame t={t} scale={s.phoneScale} kind="notification" />,
  },
  {
    title: 'capture.walk.alerts.s6Title',
    detail: 'capture.walk.alerts.s6Body',
    loop: 5200,
    still: 0.4,
    frame: (t, s) => <AlertTestFrame t={t} scale={s.phoneScale} />,
  },
];

const CHOOSE_APPS = (detail: WalkKey): StepPlan => ({
  title: 'capture.walk.alerts.s3Title',
  detail,
  loop: 5600,
  still: 0.28,
  frame: (t, s) => <ChooseAppsFrame t={t} scale={s.phoneScale} />,
});

/**
 * Bank and wallet alerts as iOS 27 builds them: a shortcut with the Notification trigger on the
 * user's banking apps that runs 6pm's "Catch a bank alert" with the notification's words.
 */
const ALERTS_BY_HAND: readonly StepPlan[] = [
  {
    title: 'capture.walk.alerts.s1Title',
    detail: 'capture.walk.alerts.s1Body',
    loop: 6000,
    still: 0.475,
    frame: (t, s) => <AutomationFrame t={t} scale={s.phoneScale} />,
  },
  {
    title: 'capture.walk.alerts.s2Title',
    detail: 'capture.walk.alerts.s2Body',
    loop: 5600,
    still: 0.525,
    frame: (t, s) => <TriggerFrame t={t} scale={s.phoneScale} kind="notification" />,
  },
  CHOOSE_APPS('capture.walk.alerts.s3Body'),
  {
    title: 'capture.walk.alerts.s4Title',
    detail: 'capture.walk.alerts.s4Body',
    loop: 7000,
    still: 0.38,
    frame: (t, s) => <CatchActionFrame t={t} scale={s.phoneScale} />,
  },
  ...ALERTS_END,
];

/** With the published shortcut: add it, then choose the apps on its trigger. */
const ALERTS_LINKED: readonly StepPlan[] = [
  {
    title: 'capture.walk.alerts.l1Title',
    detail: 'capture.walk.alerts.l1Body',
    loop: 4200,
    still: 0.44,
    frame: (t, s) => <AddShortcutFrame t={t} scale={s.phoneScale} kind="notification" />,
  },
  CHOOSE_APPS('capture.walk.alerts.l2Body'),
  ...ALERTS_END,
];

const SHARE: readonly StepPlan[] = [
  {
    title: 'capture.walk.share.s1Title',
    detail: 'capture.walk.share.s1Body',
    loop: 3600,
    still: 0.465,
    frame: (t, s) => <ReceiptShareFrame t={t} scale={s.phoneScale} />,
  },
  {
    title: 'capture.walk.share.s2Title',
    detail: 'capture.walk.share.s2Body',
    loop: 4000,
    still: 0.465,
    frame: (t, s) => <ShareSheetFrame t={t} scale={s.phoneScale} />,
  },
  {
    title: 'capture.walk.share.s3Title',
    detail: 'capture.walk.share.s3Body',
    loop: 4400,
    still: 0.515,
    frame: (t, s) => <ShareCardFrame t={t} scale={s.phoneScale} />,
  },
];

function emailPlan(address: string): readonly StepPlan[] {
  return [
    {
      title: 'capture.walk.email.s1Title',
      detail: 'capture.walk.email.s1Body',
      loop: 4400,
      still: 0.585,
      frame: (t, s) => <GmailSettingsFrame t={t} scale={s.browserScale} address={address} />,
    },
    {
      title: 'capture.walk.email.s2Title',
      detail: 'capture.walk.email.s2Body',
      loop: 4400,
      still: 0.585,
      frame: (t, s) => <GmailForwardingTabFrame t={t} scale={s.browserScale} address={address} />,
    },
    {
      title: 'capture.walk.email.s3Title',
      detail: 'capture.walk.email.s3Body',
      loop: 5600,
      still: 0.385,
      frame: (t, s) => <GmailAddAddressFrame t={t} scale={s.browserScale} address={address} />,
    },
    {
      title: 'capture.walk.email.s4Title',
      detail: 'capture.walk.email.s4Body',
      loop: 5000,
      still: 0.525,
      frame: (t, s) => <GmailVerifyFrame t={t} scale={s.browserScale} address={address} />,
    },
    {
      title: 'capture.walk.email.s5Title',
      detail: 'capture.walk.email.s5Body',
      loop: 5600,
      still: 0.645,
      frame: (t, s) => <GmailFilterFrame t={t} scale={s.browserScale} address={address} />,
    },
    {
      title: 'capture.walk.email.s6Title',
      detail: 'capture.walk.email.s6Body',
      loop: 5200,
      still: 0.625,
      frame: (t, s) => <GmailForwardItFrame t={t} scale={s.browserScale} address={address} />,
    },
  ];
}

/** A way's steps in the app's language; the email frames show the user's own address. */
export function useWalkthroughSteps(
  source: WalkedSource,
  emailAddress: string | null,
): readonly WalkthroughStep[] {
  const { t } = useI18n();
  const plan =
    source === 'wallet'
      ? WALLET
      : source === 'share'
        ? SHARE
        : source === 'alerts'
          ? BANK_ALERT_SHORTCUT_URL !== null
            ? ALERTS_LINKED
            : ALERTS_BY_HAND
          : emailPlan(emailAddress ?? t('capture.email.step1Chip'));
  return plan.map((step, k) => ({
    id: `${source}-${k}`,
    title: t(step.title),
    detail: t(step.detail),
    loop: step.loop,
    still: step.still,
    frame: step.frame,
  }));
}
