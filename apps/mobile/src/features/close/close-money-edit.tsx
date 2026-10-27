import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  ZoomIn,
} from 'react-native-reanimated';

import { FUTURE_YOU, type PotRow } from '@6pm/domain';
import { moneyInInk } from '@6pm/theme';

import type { MoneyInPlace } from '../../data/money-in-actions';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { CategoryTile } from '../../ui/category-tile';
import { haptics } from '../../ui/haptics';
import { isSymbolName, Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { useDesignInsets } from '../../ui/layout/design-insets';
import { FitWidth } from '../../ui/layout/fit-width';
import { easeOut } from '../../ui/motion/curves';
import { useDragDismiss } from '../../ui/motion/use-drag-dismiss';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, tabular } from '../../ui/type/fonts';
import { AmountText } from '../quick-add/amount-text';

/** The design phone's width: the sheet keeps it on a wider screen. */
const SHEET_WIDTH = 402;

type Choice = 'spread' | 'futureYou' | 'payback' | { readonly pot: string };

const same = (a: Choice, b: Choice) =>
  typeof a === 'string' || typeof b === 'string' ? a === b : a.pot === b.pot;

/**
 * Where money that came in goes, picked from a list: spread over the days, Future you, any pot,
 * or someone paying back. The card's swipes cover the first two; this holds the rest, so the card
 * keeps four buttons. One choice at a time; the line under the list says what it does.
 */
export function CloseMoneyEdit({
  name,
  amount,
  spreadTo,
  spreadMore,
  futureYou,
  canSave,
  pots,
  saved,
  onPlace,
  onCancel,
}: {
  readonly name: string;
  readonly amount: number;
  /** Tomorrow's line once this is spread. */
  readonly spreadTo: number;
  /** How much more each day gets once this is spread. */
  readonly spreadMore: number;
  /** What Future you's goals hold now. */
  readonly futureYou: number;
  readonly canSave: boolean;
  /** The pots money can be saved in (occasions). */
  readonly pots: readonly PotRow[];
  readonly saved: Readonly<Record<string, number>>;
  readonly onPlace: (place: MoneyInPlace) => void;
  readonly onCancel: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const { bottom, rail } = useDesignInsets();
  const { height } = useWindowDimensions();
  const sheet = useDragDismiss({ area: height, onDismissed: onCancel, enter: false });
  const [choice, setChoice] = useState<Choice>('spread');
  const pick = (next: Choice) => {
    haptics.tick();
    setChoice(next);
  };
  const potOf = typeof choice === 'string' ? null : pots.find((p) => p.id === choice.pot);
  const effect =
    choice === 'spread'
      ? t('moneyIn.goesTo.effectSpread', { amount: money.short(Math.max(0, spreadMore)) })
      : choice === 'futureYou'
        ? t('moneyIn.goesTo.effectSaved')
        : choice === 'payback'
          ? t('moneyIn.goesTo.effectPayback')
          : t('moneyIn.goesTo.effectPot', { pot: potOf?.name ?? '' });
  const place = (): MoneyInPlace =>
    choice === 'spread'
      ? { moneyIn: 'spread' }
      : choice === 'futureYou'
        ? { moneyIn: 'saved', savedTo: FUTURE_YOU }
        : choice === 'payback'
          ? { moneyIn: 'payback' }
          : { moneyIn: 'saved', savedTo: choice.pot };

  const row = (
    key: string,
    value: Choice,
    tile: { icon: SymbolName; hue: number } | null,
    title: string,
    sub: string,
    first: boolean,
  ) => {
    const on = same(choice, value);
    return (
      <Pressable
        key={key}
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        onPress={() => pick(value)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          minHeight: 58,
          backgroundColor: on ? palette.chipBg : 'transparent',
          borderTopWidth: first ? 0 : 0.5,
          borderTopColor: palette.hair,
        }}
      >
        {tile ? (
          <CategoryTile icon={tile.icon} hue={tile.hue} size={36} radius={12} glyph={20} />
        ) : (
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: palette.chipBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="undo" size={20} color={palette.ink} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ ...body(16, 550), color: palette.ink }}>{title}</Text>
          <Text style={{ ...body(13), ...tabular, color: palette.inkSoft }}>{sub}</Text>
        </View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: on ? 0 : 1.5,
            borderColor: palette.inkSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {on ? (
            <Animated.View
              entering={ZoomIn.springify().damping(14).stiffness(320)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: palette.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Symbol name="check" size={16} color={palette.accentFg} />
            </Animated.View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const rows = [
    row(
      'spread',
      'spread',
      { icon: 'calendar_month', hue: 40 },
      t('moneyIn.goesTo.spread'),
      t('moneyIn.goesTo.spreadSub', { amount: money.short(Math.max(0, spreadTo)) }),
      true,
    ),
    ...(canSave
      ? [
          row(
            'futureYou',
            'futureYou',
            { icon: 'arrow_upward', hue: moneyInInk.hue },
            t('moneyIn.goesTo.futureYou'),
            t('moneyIn.goesTo.savedSub', {
              from: money.short(futureYou),
              to: money.short(futureYou + amount),
            }),
            false,
          ),
        ]
      : []),
    ...pots.map((pot) =>
      row(
        pot.id,
        { pot: pot.id },
        { icon: isSymbolName(pot.icon) ? pot.icon : 'savings', hue: pot.hue },
        pot.name,
        t('moneyIn.goesTo.potSub', {
          saved: money.short(saved[pot.id] ?? 0),
          goal: money.short(pot.goal),
          after: money.short((saved[pot.id] ?? 0) + amount),
        }),
        false,
      ),
    ),
    row(
      'payback',
      'payback',
      null,
      t('moneyIn.goesTo.payback'),
      t('moneyIn.goesTo.paybackSub'),
      false,
    ),
  ];

  return (
    <View style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
      <Animated.View
        entering={FadeIn.duration(250)}
        exiting={FadeOut.duration(200)}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Animated.View style={[{ flex: 1 }, sheet.backdrop]}>
          <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: 'rgba(10,6,18,.45)' }} />
        </Animated.View>
      </Animated.View>
      <Animated.View
        entering={SlideInDown.springify().damping(24).stiffness(240)}
        exiting={SlideOutDown.duration(220).easing(easeOut)}
        onLayout={sheet.onLayout}
        style={{ position: 'absolute', left: 0, right: rail, bottom: 0, alignItems: 'center' }}
      >
        <GestureDetector gesture={sheet.drag}>
          <Animated.View
            style={[
              {
                width: '100%',
                maxWidth: SHEET_WIDTH,
                maxHeight: height - 54,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                backgroundColor: palette.sheetSolid,
                paddingTop: 22,
                paddingHorizontal: 20,
                paddingBottom: bottom(30),
                gap: 16,
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
            <Text style={{ ...body(17, 650), color: palette.ink, textAlign: 'center' }}>
              {name}
            </Text>
            <FitWidth height={53} align="center">
              <AmountText
                parts={{ ...money.parts(amount), sign: '+' }}
                numberOfLines={1}
                style={{ ...display(44, 500, -0.02), ...tabular, color: palette.ink }}
              />
            </FitWidth>
            <Text
              style={{
                ...body(13, 600, 0.04),
                textTransform: 'uppercase',
                color: palette.inkSoft,
                paddingHorizontal: 6,
              }}
            >
              {t('moneyIn.goesTo.label')}
            </Text>
            <ScrollView
              style={{ flexGrow: 0 }}
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                borderRadius: 22,
                backgroundColor: palette.cell,
                boxShadow: palette.cardShadow,
                overflow: 'hidden',
              }}
            >
              {rows}
            </ScrollView>
            <Animated.Text
              key={effect}
              entering={FadeIn.duration(200)}
              style={{
                ...body(13),
                lineHeight: 18.85,
                color: palette.inkSoft,
                paddingHorizontal: 6,
              }}
            >
              {effect}
            </Animated.Text>
            <PressScale
              scaleTo={0.97}
              onPress={() => onPlace(place())}
              style={{
                height: 56,
                borderRadius: 99,
                backgroundColor: palette.accent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ ...body(17, 650), color: palette.accentFg }}>
                {t('moneyIn.goesTo.done')}
              </Text>
            </PressScale>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}
