import { useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { OwedPerson, RemindChoice } from '@6pm/domain';
import { curves, owedInk, sheetScrim } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { useDragDismiss } from '../../ui/motion/use-drag-dismiss';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading } from '../../ui/type/fonts';
import { PaidStamp, Slip } from './owed-parts';
import { stampIn } from './owed-motion';
import { RemindRow } from './remind-row';

/** The design phone's width: the sheet keeps it on a wider screen. */
const SHEET_WIDTH = 402;
/** The strip slides on the tab spring, (.3, 1.3, .5, 1). */
const slideEase = Easing.bezier(...curves.jarIn);
const SLIDE_MS = 550;
/** How long the slide or the stamp shows before the sheet goes. */
const BEAT_MS = 700;

function SmallButton({
  icon,
  label,
  onPress,
}: {
  readonly icon: SymbolName;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <PressScale
      scaleTo={0.97}
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 50,
        borderRadius: 18,
        backgroundColor: palette.cell,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingHorizontal: 8,
      }}
    >
      <Symbol name={icon} size={19} color={palette.ink} />
      <Text numberOfLines={1} style={{ ...body(15, 600), color: palette.ink, flexShrink: 1 }}>
        {label}
      </Text>
    </PressScale>
  );
}

/**
 * One person's strips, to settle: "Cover Minh's 150k?" with the strip lying in Minh's box. Cover
 * it slides the strip over to Yours (it becomes the user's own spending today) and the line says
 * so; Paid in cash stamps it PAID; Ask again opens the Ask; Remind me brings it back in 3 days, a
 * week or on payday, at 10:00. No guilt in the copy.
 */
export function CoverSheet({
  person,
  what,
  onCover,
  onCash,
  onAsk,
  remindAt,
  onRemind,
  onClose,
}: {
  readonly person: OwedPerson;
  /** What the newest strip was, "CÀ PHÊ MỘC". */
  readonly what: string;
  readonly onCover: () => void;
  readonly onCash: () => void;
  readonly onAsk: () => void;
  /** When the person is to be reminded about these strips, or null for never. */
  readonly remindAt: Date | null;
  /** "Remind me" chose when, or null for not at all. */
  readonly onRemind: (choice: RemindChoice | null) => void;
  /** Runs once the sheet has left. */
  readonly onClose: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const { bottom, rail } = useDesignInsets();
  const { height } = useWindowDimensions();
  const sheet = useDragDismiss({ area: height, onDismissed: onClose });
  const [done, setDone] = useState<'covered' | 'paid' | null>(null);
  const answered = useRef(false);
  const [boxes, setBoxes] = useState(0);
  const slid = useSharedValue(0);
  const slip = useAnimatedStyle(() => ({
    transform: [{ translateX: -slid.get() * Math.max(0, boxes - 170 - 12) }, { rotate: '-2deg' }],
  }));
  const amount = money.short(person.total);
  const named = person.name !== null;

  const answer = (how: 'covered' | 'paid') => {
    if (answered.current) return;
    answered.current = true;
    setDone(how);
    if (how === 'covered') {
      haptics.tap();
      slid.set(
        withTiming(1, { duration: SLIDE_MS, easing: slideEase, reduceMotion: ReduceMotion.System }),
      );
      onCover();
    } else {
      haptics.success();
      onCash();
    }
    setTimeout(sheet.dismiss, BEAT_MS);
  };

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <Animated.View style={[{ position: 'absolute', inset: 0 }, sheet.backdrop]}>
        <Pressable
          accessibilityRole="button"
          onPress={sheet.dismiss}
          style={{ flex: 1, backgroundColor: sheetScrim }}
        />
      </Animated.View>
      <Animated.View
        onLayout={sheet.onLayout}
        style={{ position: 'absolute', left: 0, right: rail, bottom: 0, alignItems: 'center' }}
      >
        <GestureDetector gesture={sheet.drag}>
          <Animated.View
            style={[
              {
                width: '100%',
                maxWidth: SHEET_WIDTH,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                backgroundColor: palette.sheetSolid,
                paddingTop: 8,
                paddingHorizontal: 18,
                paddingBottom: bottom(34),
                gap: 18,
                boxShadow: owedInk.sheetShadow,
              },
              sheet.panel,
            ]}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '100%',
                height: 240,
                backgroundColor: palette.sheetSolid,
              }}
            />
            <View
              style={{
                alignSelf: 'center',
                width: 36,
                height: 5,
                borderRadius: 9,
                backgroundColor: palette.inkSoft,
                opacity: 0.35,
              }}
            />
            <View
              onLayout={(e) => setBoxes(e.nativeEvent.layout.width)}
              style={{ height: 112, marginTop: 8 }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: 6,
                  top: 0,
                  width: 170,
                  height: 100,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: palette.tabActive,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingBottom: 8,
                }}
              >
                <Text style={{ ...body(12, 650), color: palette.inkSoft }}>
                  {t('owed.cover.yours')}
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 0,
                  width: 170,
                  height: 100,
                  borderRadius: 20,
                  backgroundColor: palette.chipBg,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingBottom: 8,
                }}
              >
                <Text numberOfLines={1} style={{ ...body(12, 650), color: palette.inkSoft }}>
                  {t('owed.cover.theirs', { name: person.name ?? t('owed.someone') })}
                </Text>
              </View>
              <Animated.View style={[{ position: 'absolute', right: 22, top: 12 }, slip]}>
                <Slip
                  what={what}
                  amount={amount}
                  width={138}
                  stamp={
                    done === 'paid' ? (
                      <Animated.View entering={stampIn}>
                        <PaidStamp />
                      </Animated.View>
                    ) : undefined
                  }
                />
              </Animated.View>
              {done === 'covered' ? (
                <Animated.View
                  entering={FadeIn.delay(SLIDE_MS / 2).duration(250)}
                  style={{
                    position: 'absolute',
                    left: 28,
                    top: -22,
                    height: 24,
                    paddingHorizontal: 9,
                    borderRadius: 99,
                    backgroundColor: palette.accent,
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ ...body(12, 700), color: palette.accentFg }}>
                    {t('owed.cover.today', { amount })}
                  </Text>
                </Animated.View>
              ) : null}
            </View>
            <Text style={{ ...leading(display(30, 500), 32.4), color: palette.ink }}>
              {named
                ? t('owed.cover.title', { name: person.name ?? '', amount })
                : t('owed.cover.titleNoName', { amount })}
            </Text>
            <Text style={{ ...leading(body(14.5), 21), color: palette.inkSoft, marginTop: -8 }}>
              {named ? t('owed.cover.sub', { name: person.name ?? '' }) : t('owed.cover.subNoName')}
            </Text>
            <PressScale
              scaleTo={0.97}
              accessibilityRole="button"
              onPress={() => answer('covered')}
              style={{
                height: 56,
                borderRadius: 99,
                backgroundColor: palette.btnBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ ...body(17, 650), color: palette.btnFg }}>{t('owed.cover.yes')}</Text>
            </PressScale>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: -10 }}>
              <SmallButton
                icon="payments"
                label={t('owed.cover.cash')}
                onPress={() => answer('paid')}
              />
              <SmallButton
                icon="qr_code_2"
                label={t('owed.cover.ask')}
                onPress={() => {
                  haptics.tap();
                  onAsk();
                }}
              />
            </View>
            <RemindRow remindAt={remindAt} onRemind={onRemind} />
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}
