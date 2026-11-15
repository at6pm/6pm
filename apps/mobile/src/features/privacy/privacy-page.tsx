import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  Keyframe,
  ReduceMotion,
  useReducedMotion,
} from 'react-native-reanimated';

import { catchInk, curves, paperInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { DashedRule } from '../../ui/dashed-rule';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { useToast } from '../../ui/toast/toast-host';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { TapeEdge } from '../capture-guide/capture-log-tape';
import { LEGAL_LINKS } from '../purchases/products';
import { SettingRow } from '../settings/setting-rows';
import { useAiMode } from './use-ai-mode';

/** The services that hear from 6pm, by their own names. */
const ANTHROPIC = 'ANTHROPIC';
const DEEPGRAM = 'DEEPGRAM';

/** What leaves for the AI, line by line, and who gets it while AI runs on the server. */
const LEAVES = [
  { what: 'privacyPage.ask', to: ANTHROPIC },
  { what: 'privacyPage.lines', to: ANTHROPIC },
  { what: 'privacyPage.receipts', to: ANTHROPIC },
  { what: 'privacyPage.voice', to: DEEPGRAM },
] as const;

/** The page settles first; then the slip prints down out of its slot. */
const SETTLE_MS = 350;
/** The stamp lands once the slip has printed. */
const STAMP_MS = SETTLE_MS + 350;

const slotPrint = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -24 }] },
  30: { opacity: 1 },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.bezier(...curves.enter) },
})
  .duration(350)
  .delay(SETTLE_MS);

/** The stamp pressed on last: from 2.4 times its size down past it to rest (it is set at −7°). */
const stampIn = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 2.4 }] },
  60: { opacity: 1, transform: [{ scale: 0.94 }], easing: Easing.bezier(...curves.jarCheck) },
  100: { opacity: 1, transform: [{ scale: 1 }] },
})
  .duration(500)
  .delay(STAMP_MS);

/**
 * Settings › Privacy: what stays on the phone, then a short ledger of what leaves it to be worked
 * out and who gets each, with the list of spends stamped NEVER SENT. With AI kept on the phone,
 * every line stays here and the stamp says nothing leaves. The facts are the ones Settings gave as
 * a paragraph; the row under the slip opens AI, where all of it can be kept on the phone.
 */
export function PrivacyPage() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const mode = useAiMode();
  const reduceMotion = useReducedMotion();
  const server = mode === 'server';
  useEffect(() => {
    if (reduceMotion) return;
    const press = setTimeout(() => haptics.tap(), STAMP_MS + 300);
    return () => clearTimeout(press);
  }, [reduceMotion]);
  const fade = FadeIn.duration(200).reduceMotion(ReduceMotion.Never);
  const line = { ...mono(12, 400), color: paperInk.ink } as const;
  const quiet = { ...mono(10, 400, 0.1), lineHeight: 15, color: catchInk.tapeSoft } as const;
  const stamp = (
    <Animated.View entering={reduceMotion ? fade : stampIn}>
      <View
        style={{
          borderWidth: 2.5,
          borderColor: paperInk.stamp,
          borderRadius: 5,
          paddingVertical: 3,
          paddingHorizontal: 8,
          transform: [{ rotate: '-7deg' }],
          opacity: 0.9,
        }}
      >
        <Text style={{ ...mono(11, 600, 0.14), color: paperInk.stamp }}>
          {server ? t('privacyPage.neverSent') : t('privacyPage.nothingLeaves')}
        </Text>
      </View>
    </Animated.View>
  );
  return (
    <>
      <View style={{ gap: 8, paddingHorizontal: 4 }}>
        <Text style={{ ...leading(display(28, 500, -0.02), 30.8), color: palette.ink }}>
          {t('privacyPage.headline')}
        </Text>
        <Text style={{ ...body(14.5), lineHeight: 21, color: palette.inkSoft }}>
          {server ? t('privacyPage.sub') : t('privacyPage.subDevice')}
        </Text>
      </View>

      <View style={{ marginHorizontal: 2, transform: [{ rotate: '-0.6deg' }] }}>
        <Animated.View entering={reduceMotion ? fade : slotPrint}>
          <TapeEdge />
          <View
            style={{
              backgroundColor: paperInk.sheet,
              boxShadow: catchInk.tapeShadow,
              paddingTop: 6,
              paddingHorizontal: 16,
              paddingBottom: 12,
              gap: 7,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <Text style={{ ...mono(10, 400, 0.14), color: catchInk.tapeSoft }}>
                {t('privacyPage.what')}
              </Text>
              <Text style={{ ...mono(10, 400, 0.14), color: catchInk.tapeSoft }}>
                {t('privacyPage.to')}
              </Text>
            </View>
            <DashedRule color={catchInk.tapeRule} />
            {server ? null : (
              <View style={{ alignItems: 'flex-end', paddingVertical: 4, paddingRight: 4 }}>
                {stamp}
              </View>
            )}
            <View style={{ gap: 10, paddingVertical: 3 }}>
              {LEAVES.map(({ what, to }) => (
                <View
                  key={what}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}
                >
                  <Text style={{ ...line, flexShrink: 1 }}>{t(what)}</Text>
                  <Text style={{ ...line, fontVariant: ['tabular-nums'] }}>
                    {server ? to : t('privacyPage.staysHere')}
                  </Text>
                </View>
              ))}
            </View>
            <DashedRule color={catchInk.tapeRule} />
            <View
              style={{
                minHeight: 30,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Text style={{ ...mono(12, 600), color: paperInk.ink, flexShrink: 1 }}>
                {t('privacyPage.spends')}
              </Text>
              {server ? stamp : <Text style={line}>{t('privacyPage.staysHere')}</Text>}
            </View>
            <DashedRule color={catchInk.tapeRule} />
            <View style={{ gap: 4 }}>
              {server ? <Text style={quiet}>{t('privacyPage.foot')}</Text> : null}
              <Text style={quiet}>{t('privacyPage.backup')}</Text>
              <Text style={quiet}>
                {server ? t('privacyPage.crashes') : t('privacyPage.purchases')}
              </Text>
            </View>
          </View>
          <TapeEdge foot />
        </Animated.View>
      </View>

      {server ? (
        <View
          style={{
            borderRadius: 26,
            backgroundColor: palette.cell,
            boxShadow: palette.cardShadow,
            overflow: 'hidden',
          }}
        >
          <SettingRow
            first
            icon="auto_awesome"
            label={t('privacyPage.keep')}
            sub={t('privacyPage.keepSub')}
            onPress={() => {
              haptics.tick();
              router.push('/ai');
            }}
          />
        </View>
      ) : null}

      <PressScale
        accessibilityRole="link"
        onPress={() => {
          haptics.tick();
          Linking.openURL(LEGAL_LINKS.privacy).catch(() => toast(t('privacyPage.policyFailed')));
        }}
        hitSlop={8}
        style={{
          alignSelf: 'center',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingVertical: 6,
        }}
      >
        <Text style={{ ...body(13, 600), color: palette.inkSoft }}>{t('privacyPage.policy')}</Text>
        <Symbol name="north_east" size={15} color={palette.inkSoft} />
      </PressScale>
    </>
  );
}
