import { useRouter } from 'expo-router';
import { ScrollView, Share, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';

import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { CategoryTile } from '../../ui/category-tile';
import { haptics } from '../../ui/haptics';
import { BackSheetHeader } from '../../ui/navigation/back-sheet-header';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { WordFitText } from '../../ui/type/word-fit-text';
import { nativeReach } from '../surfaces/native-reach';
import { captureColours } from './capture-colours';
import { GuideActions } from './guide-actions';
import { HowItWorks } from './guide-how';
import { GuideSample, GuideSection, GuideTip, type LiveChip } from './guide-sections';
import type { CaptureSource } from './source-status';
import { useCaptureSources } from './use-capture-sources';

/** The prototype's `screenIn`: up 12 pt from 98.5 %, over 0.35 s on the entrance curve. */
const screenIn = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 12 }, { scale: 0.985 }] },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    easing: Easing.bezier(...curves.enter),
  },
}).duration(350);

/**
 * One way's guide: its status and headline with what to tap right under them, then how it works.
 * The ways set up in Shortcuts stop there; the rest add what lands in the Inbox and a tip.
 */
export function CaptureGuideSheet({ source: asked }: { readonly source: CaptureSource }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { sources, emailAddress, emailAvailable } = useCaptureSources();
  // A way this phone does not offer (a link or Ask naming the Wallet on Android) opens the first
  // way it does.
  const view = sources.find((s) => s.source === asked) ?? sources[0];
  const source = view?.source ?? asked;
  // In on-device mode receipt email does not exist: the guide says why instead of how.
  const emailOff = source === 'email' && !emailAvailable;
  const colours = captureColours(palette);
  // The ways that live in Shortcuts: their walkthrough shows what lands, so nothing repeats it.
  // Android's bank alerts are a switch in its settings instead, shown like the other ways.
  const shortcut = source === 'wallet' || (source === 'alerts' && !nativeReach.alertListener);
  // Receipt email's first step shows the address itself; tapping it offers the share sheet.
  const addressChip: LiveChip | null =
    source === 'email' && emailAddress !== null
      ? {
          text: emailAddress,
          label: t('receiptEmail.share'),
          onPress: () => {
            haptics.tap();
            void Share.share({ message: emailAddress }).catch(() => undefined);
          },
        }
      : null;
  // Receipt email is listed on every phone; this only satisfies the type.
  if (!view) return null;
  const { guide } = view;

  const header = (
    <BackSheetHeader
      title={view.name}
      backLabel={t('capture.guide.back')}
      onBack={() => router.back()}
      onDone={() => router.dismissTo('/')}
    />
  );

  return (
    <SheetFrame header={header}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={screenIn}
          style={{ paddingTop: 6, paddingHorizontal: 16, paddingBottom: 44, gap: 24 }}
        >
          <View style={{ gap: 14, paddingTop: 6, paddingHorizontal: 4 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <CategoryTile icon={guide.icon} hue={guide.hue} size={60} radius={20} glyph={32} />
              <View
                style={{
                  flexShrink: 1,
                  marginLeft: 16,
                  height: 28,
                  paddingLeft: 9,
                  paddingRight: 11,
                  borderRadius: 99,
                  backgroundColor: view.on ? colours.okBg : colours.warnBg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: view.on ? colours.ok : colours.warn,
                  }}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...body(12.5, 700),
                    color: view.on ? colours.ok : colours.warn,
                    flexShrink: 1,
                  }}
                >
                  {view.status}
                </Text>
              </View>
            </View>
            <WordFitText style={{ ...leading(display(31, 500, -0.015), 33.5), color: palette.ink }}>
              {t(guide.headline)}
            </WordFitText>
          </View>

          <GuideActions
            source={source}
            on={view.on}
            emailAddress={emailAddress}
            note={source === 'alerts' ? t('capture.alerts.privacy') : null}
          />

          {emailOff ? null : (
            <HowItWorks
              source={source}
              guide={guide}
              addressChip={addressChip}
              emailAddress={emailAddress}
            />
          )}

          {emailOff || shortcut ? null : (
            <GuideSection title={t('capture.guide.lands')}>
              <GuideSample guide={guide} />
              <Text
                style={{
                  ...body(13),
                  lineHeight: 18.2,
                  color: palette.inkSoft,
                  paddingHorizontal: 6,
                }}
              >
                {t('capture.guide.landsNote')}
              </Text>
            </GuideSection>
          )}

          {shortcut ? null : (
            <GuideTip text={emailOff ? t('receiptEmail.deviceMode.body') : t(guide.tip)} />
          )}
        </Animated.View>
      </ScrollView>
    </SheetFrame>
  );
}
