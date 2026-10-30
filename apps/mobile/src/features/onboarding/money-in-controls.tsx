import { useEffect, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { Payday } from '@6pm/domain';
import { curves, durations } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { body, display } from '../../ui/type/fonts';
import { Strip } from '../../ui/wheel/strip';
import { Wheel } from '../../ui/wheel/wheel';
import { touchReach, wheelRowHeight, type Span } from '../../ui/wheel/wheel-maths';
import { AmountKeypadSheet, type KeypadSheetInks } from '../quick-add/amount-keypad-sheet';
import {
  DIGITS,
  incomeDigits,
  incomeFromTyped,
  incomeLeads,
  incomeMillionsItems,
  incomeOf,
  markAfter,
  PAYDAY_CELLS,
  paydayCell,
  paydayOfCell,
  zerosBelow,
} from './onboarding-maths';
import type { OnboardingPalette } from './onboarding-palette';
import { ordinalDay, WheelBand } from './step-parts';
import { GuideFingers, type MoneyInGuide } from './wheel-guide';
import { useWheelMoney, WheelSymbol } from './wheel-money';

/** The colours these controls draw with: onboarding's sky palette, or a sheet's own. */
export interface PickerInk {
  readonly ink: string;
  readonly inkSoft: string;
  /** The soft band behind a wheel's chosen row. */
  readonly chipBg: string;
}

/** How far the wheels' touch strips reach above and below the wheels, into the card. */
export interface WheelReachY {
  readonly top: number;
  readonly bottom: number;
}

/** Money in's type size: three wheels and the zeros fit a sheet's card at this size. */
const SIZE = 34;
const ROW = wheelRowHeight(SIZE);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
/** The payday strip's cells: 48 pt days, and room for "Last day" and "It varies". */
const DAY_CELL = 48;
const WORD_CELL = 120;
const PAYDAY_WIDTHS: readonly number[] = Array.from({ length: PAYDAY_CELLS }, (_, i) =>
  i < 31 ? DAY_CELL : WORD_CELL,
);

/** The hundreds-of-millions wheel's width once it has come in. */
const LEAD_WIDTH = 52;
/** The millions wheel's width, and what a group mark inside its two digits adds. */
const MILLIONS_WIDTH = 44;
const INNER_MARK_WIDTH = 9;
const HUNDREDS_WIDTH = 22;
/** Millions from which the hundreds-of-millions wheel comes in: 90.000.000₫ and up. */
const LEAD_FROM = 90;
const LEAD_MOVE = { duration: durations.sheet, easing: Easing.bezier(...curves.enter) };
const REACH_Y: WheelReachY = { top: 6, bottom: 6 };
/** The payday caption's day while another kind is chosen: it only sizes the hidden caption. */
const DEFAULT_PAYDAY = 25;
const CAPTION_FADE = { duration: 300, easing: Easing.bezier(...curves.enter) };
/** The payday card easing to the next caption's height. */
const RESIZE = { duration: durations.snap, easing: Easing.bezier(...curves.enter) };

/** Text between the wheels: it never takes a touch, so the strips over it reach the wheels. */
const PASS_THROUGH = { pointerEvents: 'none' } as const;

/**
 * Money in on wheels read as the amount itself: millions and hundred thousands, and, once the
 * millions reach 90, a hundreds-of-millions wheel that slides in on their left, up to
 * 1.000.000.000₫ a month. It stays while it holds a digit. In another currency the wheels count
 * its steps ($1,000 and $100), with its group marks and its symbol on its side.
 *
 * Each wheel answers in a strip at least 56 pt wide, sharing the gaps between them: a tap above
 * or below the centre steps it, a hold rolls it, and a tap on the centre types the whole amount
 * on Quick add's keypad, which the wheels then glide to.
 */
export function IncomeWheels({
  income,
  onIncome,
  colours,
  reachY = REACH_Y,
  guide,
  guidePal,
  keypadInks,
}: {
  readonly income: number;
  readonly onIncome: (income: number) => void;
  readonly colours: Pick<PickerInk, 'ink' | 'chipBg'>;
  readonly reachY?: WheelReachY;
  /** Onboarding's gesture guide, drawn over the wheels it rolls. */
  readonly guide?: MoneyInGuide;
  readonly guidePal?: OnboardingPalette;
  /** The keypad sheet's inks, where the screen has its own palette. */
  readonly keypadInks?: KeypadSheetInks;
}) {
  const { t } = useI18n();
  const w = useWheelMoney();
  const c = w.currency;
  const { lead, millions, hundreds } = incomeDigits(income, c);
  const between = markAfter(w.place, w.mark);
  const innerMark = markAfter(w.place + 1, w.mark) !== '';
  const number = { ...display(SIZE, 600, -0.03), color: colours.ink, ...PASS_THROUGH };
  const leadShown = lead > 0 || millions >= LEAD_FROM;
  const millionsWidth = MILLIONS_WIDTH + (innerMark ? INNER_MARK_WIDTH : 0);
  const [typing, setTyping] = useState(false);
  // The mark's width sets the gap the millions and hundreds share; the zeros' place, where the
  // guide's fingers go.
  const [markWidth, setMarkWidth] = useState(0);
  const [zerosX, setZerosX] = useState<number | null>(null);

  const spans: Span[] = [];
  if (leadShown) spans.push({ x: -LEAD_WIDTH, width: LEAD_WIDTH });
  spans.push({ x: 0, width: millionsWidth });
  spans.push({ x: millionsWidth + markWidth, width: HUNDREDS_WIDTH });
  const reaches = touchReach(spans);
  const sides = (k: number) => reaches[k + (leadShown ? 1 : 0)] ?? { left: 0, right: 0 };
  const leadSides = reaches[0] ?? { left: 0, right: 0 };
  const strip = (k: number) => ({
    reach: { ...sides(k), ...reachY },
    onType: () => setTyping(true),
  });

  const leadStyle = useAnimatedStyle(() => {
    const left = leadShown ? leadSides.left : 0;
    const right = leadShown ? leadSides.right : 0;
    return {
      width: withTiming(leadShown ? LEAD_WIDTH + left + right : 0, LEAD_MOVE),
      marginLeft: withTiming(-left, LEAD_MOVE),
      marginRight: withTiming(-right, LEAD_MOVE),
      paddingLeft: withTiming(left, LEAD_MOVE),
      paddingRight: withTiming(right, LEAD_MOVE),
      opacity: withTiming(leadShown ? 1 : 0, LEAD_MOVE),
    };
  });
  const hundredsX = zerosX === null ? null : zerosX - HUNDREDS_WIDTH / 2;
  const millionsX =
    zerosX === null ? null : zerosX - HUNDREDS_WIDTH - markWidth - millionsWidth / 2;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <WheelBand height={48} radius={15} color={colours.chipBg} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <WheelSymbol symbol={w.before} size={18} offset={52} ink={colours.ink} side="before" />
        {/* The lead's clip takes in its touch strip, so the strip is not cut off with it. */}
        <Animated.View
          pointerEvents={leadShown ? 'auto' : 'none'}
          style={[
            {
              overflow: 'hidden',
              alignItems: 'flex-end',
              marginTop: -reachY.top,
              marginBottom: -reachY.bottom,
              paddingTop: reachY.top,
              paddingBottom: reachY.bottom,
            },
            leadStyle,
          ]}
        >
          <Wheel
            items={incomeLeads(c, w.mark)}
            index={lead}
            onChange={(k) => onIncome(incomeOf(k, millions, hundreds, c))}
            size={SIZE}
            padX={0}
            align="flex-end"
            ink={colours.ink}
            width={LEAD_WIDTH}
            label={w.label('lead', 'onboarding.income.hundredMillions')}
            touch={{ reach: { ...leadSides, ...reachY }, onType: () => setTyping(true) }}
          />
        </Animated.View>
        <Wheel
          items={incomeMillionsItems(lead, c, w.mark)}
          index={millions}
          onChange={(k) => onIncome(incomeOf(lead, k, hundreds, c))}
          size={SIZE}
          padX={0}
          align={lead > 0 ? 'flex-start' : 'flex-end'}
          ink={colours.ink}
          width={millionsWidth}
          label={w.label('millions', 'onboarding.income.millions')}
          touch={strip(0)}
          {...(guide ? { guide: guide.millions } : {})}
        />
        {between === '' ? null : (
          <Text
            style={number}
            onLayout={(e: LayoutChangeEvent) => setMarkWidth(e.nativeEvent.layout.width)}
          >
            {between}
          </Text>
        )}
        <Wheel
          items={DIGITS}
          index={hundreds}
          onChange={(k) => onIncome(incomeOf(lead, millions, k, c))}
          size={SIZE}
          padX={0}
          ink={colours.ink}
          width={HUNDREDS_WIDTH}
          label={w.label('hundreds', 'onboarding.income.hundreds')}
          touch={strip(1)}
          {...(guide ? { guide: guide.hundreds } : {})}
        />
        <Text style={number} onLayout={(e: LayoutChangeEvent) => setZerosX(e.nativeEvent.layout.x)}>
          {zerosBelow(w.place - 1, w.mark)}
        </Text>
        <WheelSymbol symbol={w.after} size={18} offset={52} ink={colours.ink} side="after" />
        {guide && guidePal && millionsX !== null && hundredsX !== null ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0 }}>
            <GuideFingers
              guide={guide}
              millionsX={millionsX}
              hundredsX={hundredsX}
              rowHeight={ROW}
              pal={guidePal}
            />
          </View>
        ) : null}
      </View>
      {typing ? (
        <AmountKeypadSheet
          title={t('onboarding.wheel.type')}
          inks={keypadInks}
          onAmount={(amount) => onIncome(incomeFromTyped(amount, c))}
          onClose={() => setTyping(false)}
        />
      ) : null}
    </View>
  );
}

/** A day of the month on a small wheel ("25th"), as a bill's due day is set. */
export function DayOfMonthWheel({
  day,
  onDay,
  label,
  colours,
}: {
  readonly day: number;
  readonly onDay: (day: number) => void;
  readonly label: string;
  readonly colours: Pick<PickerInk, 'ink' | 'chipBg'>;
}) {
  const i18n = useI18n();
  const items = DAYS.map((n) => ordinalDay(i18n, n));
  return (
    <View style={{ width: 76, justifyContent: 'center' }}>
      <WheelBand height={34} radius={11} color={colours.chipBg} />
      <Wheel
        items={items}
        index={Math.min(31, Math.max(1, day)) - 1}
        onChange={(k) => onDay(k + 1)}
        size={22}
        ink={colours.ink}
        width={76}
        label={label}
      />
    </View>
  );
}

/**
 * When money lands, on one strip of days: the 1st to the 31st, then the last day of the month,
 * then "it varies". The strip runs the width of its card (`bleed` is the card's side padding),
 * and the line under it says what was chosen.
 */
export function PaydayPicker({
  payday,
  onPayday,
  colours,
  bleed = 16,
}: {
  readonly payday: Payday;
  readonly onPayday: (payday: Payday) => void;
  readonly colours: PickerInk;
  readonly bleed?: number;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const lastDay = t('onboarding.payday.lastDay');
  const varies = t('onboarding.payday.varies');
  const items = [...DAYS.map(String), lastDay, varies];
  const spoken = [...DAYS.map((n) => ordinalDay(i18n, n)), lastDay, varies];
  const day = payday.kind === 'sameDay' ? payday.day : null;
  const captions: readonly (readonly [Payday['kind'], string])[] = [
    ['sameDay', t('onboarding.payday.paidOnDay', { day: ordinalDay(i18n, day ?? DEFAULT_PAYDAY) })],
    ['lastDay', t('onboarding.payday.lastDayNote')],
    ['varies', t('onboarding.payday.variesNote')],
  ];
  return (
    <>
      <View style={{ marginHorizontal: -bleed }}>
        <Strip
          items={items}
          widths={PAYDAY_WIDTHS}
          index={paydayCell(payday)}
          onChange={(k) => onPayday(paydayOfCell(k))}
          ink={colours.ink}
          band={colours.chipBg}
          label={t('onboarding.payday.title')}
          spoken={spoken}
        />
      </View>
      <PaydayCaptions captions={captions} shown={payday.kind} ink={colours.inkSoft} />
    </>
  );
}

type PaydayKind = Payday['kind'];

/**
 * The line under the payday strip. Each caption is measured once, laid over the others; the
 * card takes the height of the one on show, easing to the next one's on the UI thread as the
 * choice changes while the captions cross-fade. Reduce Motion changes the height at once.
 */
function PaydayCaptions({
  captions,
  shown,
  ink,
}: {
  readonly captions: readonly (readonly [PaydayKind, string])[];
  readonly shown: PaydayKind;
  readonly ink: string;
}) {
  const reduceMotion = useReducedMotion();
  const [heights, setHeights] = useState<Partial<Record<PaydayKind, number>>>({});
  const height = useSharedValue(0);
  const target = heights[shown];
  const measured = captions.every(([kind]) => heights[kind] !== undefined);

  useEffect(() => {
    if (target === undefined || height.value === target) return;
    height.value = reduceMotion || height.value === 0 ? target : withTiming(target, RESIZE);
  }, [target, reduceMotion, height]);

  const box = useAnimatedStyle(() => (measured ? { height: height.value } : {}));
  const onHeight = (kind: PaydayKind, h: number) => {
    // The first height is set before the captions leave the flow, so nothing jumps.
    if (kind === shown && height.value === 0) height.value = h;
    setHeights((all) => (all[kind] === h ? all : { ...all, [kind]: h }));
  };
  return (
    <Animated.View style={[{ marginTop: -4 }, box]}>
      {captions.map(([kind, text]) => (
        <Caption
          key={kind}
          text={text}
          shown={shown === kind}
          inFlow={!measured && shown === kind}
          ink={ink}
          onHeight={(h) => onHeight(kind, h)}
        />
      ))}
    </Animated.View>
  );
}

function Caption({
  text,
  shown,
  inFlow,
  ink,
  onHeight,
}: {
  readonly text: string;
  readonly shown: boolean;
  /** Until every caption is measured the one on show sizes the box; then all lie over it. */
  readonly inFlow: boolean;
  readonly ink: string;
  readonly onHeight: (height: number) => void;
}) {
  const look = useAnimatedStyle(() => ({
    opacity: withTiming(shown ? 1 : 0, CAPTION_FADE),
  }));
  return (
    <Animated.View
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
      onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
      style={[inFlow ? {} : { position: 'absolute', top: 0, left: 0, right: 0 }, look]}
    >
      <Text style={{ ...body(14, 550), lineHeight: 20, textAlign: 'center', color: ink }}>
        {text}
      </Text>
    </Animated.View>
  );
}
