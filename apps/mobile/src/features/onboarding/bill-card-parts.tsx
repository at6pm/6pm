import { useState, type ReactNode } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { BalancedText } from '../../ui/type/balanced-text';
import { body, display, leading, mono } from '../../ui/type/fonts';
import { Wheel } from '../../ui/wheel/wheel';
import { touchReach } from '../../ui/wheel/wheel-maths';
import { useI18n } from '../../i18n/i18n';
import { AmountKeypadSheet, type KeypadSheetInks } from '../quick-add/amount-keypad-sheet';
import { BILL_CARDS, type DeckItem } from './bill-deck';
import {
  billDigits,
  billFromTyped,
  billMillionsItems,
  billOf,
  DIGITS,
  markAfter,
  zerosBelow,
} from './onboarding-maths';
import { tileOf, type OnboardingPalette } from './onboarding-palette';
import { WheelBand } from './step-parts';
import { useWheelMoney, WheelSymbol } from './wheel-money';

/** The bill millions wheel's width, and what a group mark inside its two digits adds. */
const MILLIONS_WIDTH = 54;
const INNER_MARK_WIDTH = 8;
const DIGIT_WIDTH = 19;
/** The strips reach a little above and below the wheels. */
const REACH_Y = { top: 6, bottom: 6 } as const;

/** The pieces a bills card is made of: buttons, the icon row, the question, the amount wheels. */

export function Pill({
  label,
  bg,
  fg,
  flex,
  height,
  radius = 99,
  onPress,
  children,
}: {
  readonly label: string;
  readonly bg: string;
  readonly fg: string;
  /** Share of a row's width; leave it out in a column, where it would collapse the height. */
  readonly flex?: number;
  readonly height: number;
  readonly radius?: number;
  readonly onPress: () => void;
  readonly children?: ReactNode;
}) {
  const fill = useAnimatedStyle(() => ({ backgroundColor: withTiming(bg, { duration: 200 }) }));
  return (
    <PressScale
      scaleTo={height > 50 ? 0.96 : 0.97}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ ...(flex === undefined ? {} : { flex }), minWidth: 0 }}
    >
      <Animated.View
        style={[
          { height, borderRadius: radius, alignItems: 'center', justifyContent: 'center' },
          fill,
        ]}
      >
        {children ?? (
          <Text style={{ ...body(height > 50 ? 16 : 15, 650), color: fg }}>{label}</Text>
        )}
      </Animated.View>
    </PressScale>
  );
}

export function CardTop({
  item,
  pal,
}: {
  readonly item: DeckItem;
  readonly pal: OnboardingPalette;
}) {
  const tile = tileOf(item.card.hue);
  const icon: SymbolName = item.type === 'amount' ? item.icon : item.card.icon;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 15,
          experimental_backgroundImage: tile.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name={icon} size={24} fill={1} color={tile.glyph} />
      </View>
      <Text style={{ ...mono(12, 400, 0.08), color: pal.inkSoft }}>
        {`${item.cardIndex + 1} / ${BILL_CARDS.length}`}
      </Text>
    </View>
  );
}

export function Question({
  q,
  sub,
  pal,
  onBottom,
}: {
  readonly q: string;
  readonly sub: string;
  readonly pal: OnboardingPalette;
  /** Where the subline ends, from the card's top: what the card needs above its own controls. */
  readonly onBottom?: (y: number) => void;
}) {
  return (
    <>
      <BalancedText
        style={{ ...leading({ ...display(26, 600, -0.025), paddingTop: 4 }, 27.3), color: pal.ink }}
      >
        {q}
      </BalancedText>
      <Text
        onLayout={(e) => onBottom?.(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
        style={{ ...body(13.5), lineHeight: 18.9, color: pal.inkSoft }}
      >
        {sub}
      </Text>
      <View style={{ flex: 1 }} />
    </>
  );
}

/**
 * A bill's amount on three wheels: millions, hundred thousands and ten thousands. Each answers in
 * its own strip, sharing the gaps between them: a tap above or below the centre steps it, a hold
 * rolls it, and a tap on the centre types the amount on Quick add's keypad.
 */
export function AmountWheels({
  value,
  ink,
  band,
  onValue,
  keypadInks,
}: {
  readonly value: number;
  readonly ink: string;
  /** The soft band behind the chosen row. */
  readonly band: string;
  readonly onValue: (value: number) => void;
  /** The keypad sheet's inks, where the screen has its own palette. */
  readonly keypadInks?: KeypadSheetInks;
}) {
  const { t } = useI18n();
  const w = useWheelMoney();
  const c = w.currency;
  const { millions, hundreds, tens } = billDigits(value, c);
  // Text between the wheels never takes a touch, so the strips over it reach the wheels.
  const number = { ...display(30, 600, -0.03), color: ink, pointerEvents: 'none' } as const;
  const innerMark = markAfter(w.place + 1, w.mark) !== '';
  const afterMillions = markAfter(w.place, w.mark);
  const afterHundreds = markAfter(w.place - 1, w.mark);
  const millionsWidth = MILLIONS_WIDTH + (innerMark ? INNER_MARK_WIDTH : 0);
  const [marks, setMarks] = useState({ first: 0, second: 0 });
  const [typing, setTyping] = useState(false);
  const reaches = touchReach([
    { x: 0, width: millionsWidth },
    { x: millionsWidth + marks.first, width: DIGIT_WIDTH },
    { x: millionsWidth + marks.first + DIGIT_WIDTH + marks.second, width: DIGIT_WIDTH },
  ]);
  const strip = (k: number) => ({
    reach: { ...(reaches[k] ?? { left: 0, right: 0 }), ...REACH_Y },
    onType: () => setTyping(true),
  });
  const measure = (key: 'first' | 'second') => (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setMarks((m) => (m[key] === width ? m : { ...m, [key]: width }));
  };
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <WheelBand height={44} radius={14} color={band} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <WheelSymbol symbol={w.before} size={15} offset={48} ink={ink} side="before" />
        <Wheel
          items={billMillionsItems(c, w.mark)}
          index={millions}
          onChange={(k) => onValue(billOf(k, hundreds, tens, c))}
          size={30}
          padX={0}
          align="flex-end"
          ink={ink}
          width={millionsWidth}
          label={w.label('millions', 'onboarding.bills.millions')}
          touch={strip(0)}
        />
        {afterMillions === '' ? null : (
          <Text style={number} onLayout={measure('first')}>
            {afterMillions}
          </Text>
        )}
        <Wheel
          items={DIGITS}
          index={hundreds}
          onChange={(k) => onValue(billOf(millions, k, tens, c))}
          size={30}
          padX={0}
          ink={ink}
          width={DIGIT_WIDTH}
          label={w.label('hundreds', 'onboarding.bills.hundreds')}
          touch={strip(1)}
        />
        {afterHundreds === '' ? null : (
          <Text style={number} onLayout={measure('second')}>
            {afterHundreds}
          </Text>
        )}
        <Wheel
          items={DIGITS}
          index={tens}
          onChange={(k) => onValue(billOf(millions, hundreds, k, c))}
          size={30}
          padX={0}
          ink={ink}
          width={DIGIT_WIDTH}
          label={w.label('tens', 'onboarding.bills.tens')}
          touch={strip(2)}
        />
        {w.place - 2 > 0 ? <Text style={number}>{zerosBelow(w.place - 2, w.mark)}</Text> : null}
        <WheelSymbol symbol={w.after} size={15} offset={48} ink={ink} side="after" />
      </View>
      {typing ? (
        <AmountKeypadSheet
          title={t('onboarding.wheel.type')}
          inks={keypadInks}
          onAmount={(amount) => onValue(billFromTyped(amount, c))}
          onClose={() => setTyping(false)}
        />
      ) : null}
    </View>
  );
}
