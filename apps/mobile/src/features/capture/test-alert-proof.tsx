import { Text, View } from 'react-native';
import Animated, {
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { localeOf } from '@6pm/i18n';
import { catchInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { body, mono } from '../../ui/type/fonts';
import { SlipPaper } from '../onboarding/first-catch-slip';
import { fadeEntering, riseEntering } from '../onboarding/onboarding-motion';
import { nativeReach } from '../surfaces/native-reach';
import { openTestAlertFix, testAlertAvailable, type TestAlert } from './use-test-alert';

/** The colours of the screen the proof is drawn on: onboarding's dusk, or a sheet's look. */
export interface ProofInks {
  readonly ink: string;
  readonly inkSoft: string;
  readonly cell: string;
  readonly chipBg: string;
  readonly btnBg: string;
  readonly btnFg: string;
  readonly cardShadow: string;
}

/** What is round the proof closes up, and opens, with the app's settle spring. */
const proofReflow = LinearTransition.springify()
  .damping(22)
  .stiffness(240)
  .reduceMotion(ReduceMotion.System);

/**
 * For what sits above and under the proof on its screen, so it makes room rather than jumps:
 * spread onto an animated view. Empty where no test alert can be sent (an iPhone before iOS 27),
 * so nothing there moves differently.
 */
export const proofRoom: { readonly layout?: typeof proofReflow } = testAlertAvailable
  ? { layout: proofReflow }
  : {};
const away = FadeOut.duration(180).reduceMotion(ReduceMotion.System);
/** The slip drops once what is round it has begun to make room, not onto it. */
const SLIP_AFTER_MS = 180;

/**
 * What became of a test alert, on the screen it was sent from. On its way: a quiet line. Arrived:
 * a slip on the first catch's paper, "It works. Real bank alerts will arrive the same way.", with
 * no amount on it, since it is not a payment. Nothing after ten seconds: what to check, and the
 * way there (Android's Notification access; on the iPhone the Shortcuts app, where the automation
 * may be off or 6pm may not be among its apps). 6pm not allowed to post notifications: that, and
 * Turn on. Nothing before one is sent.
 */
export function TestAlertProof({
  inks,
  test,
}: {
  readonly inks: ProofInks;
  readonly test: TestAlert;
}) {
  const { t, language } = useI18n();
  const reduceMotion = useReducedMotion();
  const { state } = test;
  if (state.kind === 'idle') return null;
  if (state.kind === 'sent') {
    return (
      <Animated.View
        key="sent"
        entering={fadeEntering(250, 0, reduceMotion)}
        exiting={away}
        layout={proofReflow}
        style={{ minHeight: 22, justifyContent: 'center' }}
      >
        <Text
          accessibilityLiveRegion="polite"
          style={{ ...body(13.5, 600), color: inks.inkSoft, textAlign: 'center' }}
        >
          {t('testAlert.sent')}
        </Text>
      </Animated.View>
    );
  }
  if (state.kind === 'arrived') {
    const time = new Intl.DateTimeFormat(localeOf(language), {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(state.at));
    return (
      <Animated.View key="arrived" exiting={away} layout={proofReflow}>
        <SlipPaper delay={SLIP_AFTER_MS}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Text
              numberOfLines={1}
              style={{
                ...mono(11.5, 500, 0.1),
                color: catchInk.soft,
                textTransform: 'uppercase',
                flexShrink: 1,
              }}
            >
              {t('testAlert.notice.title')}
            </Text>
            <Text style={{ ...mono(11.5, 500, 0.1), color: catchInk.soft }}>{time}</Text>
          </View>
          <DashedRule color={catchInk.rule} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 15,
                backgroundColor: catchInk.stamp,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Symbol name="check_circle" size={24} color={catchInk.onTile} />
            </View>
            <Text
              accessibilityLiveRegion="polite"
              style={{ ...body(17, 650, -0.01), lineHeight: 22, color: catchInk.ink, flex: 1 }}
            >
              {t('testAlert.works')}
            </Text>
          </View>
          <View style={{ gap: 10 }}>
            <DashedRule color={catchInk.rule} />
            <Text style={{ ...mono(11.5, 400), lineHeight: 16, color: catchInk.note }}>
              {t('testAlert.slip.note')}
            </Text>
          </View>
        </SlipPaper>
      </Animated.View>
    );
  }
  const missing = state.kind === 'missing';
  const icon: SymbolName = missing ? 'notifications' : 'notifications_off';
  // What a missing test alert points at: Android's access switch, or the iPhone's automation.
  const fix = nativeReach.alertListener
    ? ({
        words: 'testAlert.nothing',
        label: 'firstCatch.fix.access',
        icon: 'notifications',
      } as const)
    : ({
        words: 'testAlert.nothingShortcut',
        label: 'capture.alerts.actionOpen',
        icon: 'bolt',
      } as const);
  return (
    <Animated.View
      key={state.kind}
      entering={riseEntering(300, 0, reduceMotion, 14)}
      exiting={away}
      layout={proofReflow}
      style={{
        borderRadius: 22,
        backgroundColor: inks.cell,
        boxShadow: inks.cardShadow,
        padding: 14,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            backgroundColor: inks.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name={icon} size={22} color={inks.ink} />
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={{ ...body(15, 550), lineHeight: 21, color: inks.ink, flex: 1 }}
        >
          {t(missing ? fix.words : 'testAlert.blocked')}
        </Text>
      </View>
      <PressScale
        scaleTo={0.96}
        accessibilityRole="button"
        onPress={() => {
          haptics.tap();
          if (missing) openTestAlertFix();
          else test.allow();
        }}
        style={{
          height: 44,
          borderRadius: 99,
          backgroundColor: inks.btnBg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Symbol name={missing ? fix.icon : 'notifications'} size={18} color={inks.btnFg} />
        <Text numberOfLines={1} style={{ ...body(14.5, 650), color: inks.btnFg }}>
          {t(missing ? fix.label : 'notify.settings.turnOn')}
        </Text>
      </PressScale>
    </Animated.View>
  );
}
