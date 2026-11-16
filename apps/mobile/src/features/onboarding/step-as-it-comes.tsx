import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';

import type { LocalDate } from '@6pm/domain';
import { catchInk, curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useHomeCurrency } from '../../money/use-money-format';
import { DashedRule } from '../../ui/dashed-rule';
import { PaperEdge } from '../../ui/paper-edge';
import { body, mono } from '../../ui/type/fonts';
import { Strip } from '../../ui/wheel/strip';
import { lastUntilDays, type LastFor } from './money-ways';
import { useLoop } from './onboarding-motion';
import type { OnboardingPalette } from './onboarding-palette';
import { Card, StepHeading } from './step-parts';

/** The choices "Make it last until" offers, left to right. */
const CHOICES = ['days7', 'days14', 'monthEnd', 'aDate'] as const;
type Choice = (typeof CHOICES)[number];
const CHOICE_WIDTHS: readonly number[] = [96, 104, 150, 120];
/** A day on the "A date…" strip carries its month: "15 Dec", "15/12". */
const DATE_WIDTH = 84;
const RESIZE = LinearTransition.duration(300)
  .easing(Easing.bezier(...curves.enter))
  .reduceMotion(ReduceMotion.System);
/** The slip bobs 4 pt every 3.2 s; its empty box shimmers once every 2.4 s. */
const BOB_MS = 3200;
const SHIMMER_MS = 2400;

const dateOf = (day: LocalDate) => new Date(`${day}T12:00:00`);

function choiceOf(lastFor: LastFor): Choice {
  if (lastFor.kind === 'monthEnd') return 'monthEnd';
  if (lastFor.kind === 'date') return 'aDate';
  return lastFor.days === 7 ? 'days7' : 'days14';
}

/**
 * It comes when it comes: nothing to enter. The empty slip is the receipt the first landing will
 * print; the one control is how long each landing has to last.
 */
export function StepAsItComes({
  pal,
  lastFor,
  today,
  lastsTo,
  onLastFor,
}: {
  readonly pal: OnboardingPalette;
  readonly lastFor: LastFor;
  readonly today: LocalDate;
  /** The day each landing is divided through, as the number will count it (`lastsTo`). */
  readonly lastsTo: LocalDate;
  readonly onLastFor: (lastFor: LastFor) => void;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const choice = choiceOf(lastFor);
  const days = lastUntilDays(today);
  const picked = lastFor.kind === 'date' ? lastFor.date : (days[29] ?? today);
  const pick = (next: Choice) => {
    if (next === choice) return;
    onLastFor(
      next === 'monthEnd'
        ? { kind: 'monthEnd' }
        : next === 'aDate'
          ? { kind: 'date', date: picked }
          : { kind: 'days', days: next === 'days7' ? 7 : 14 },
    );
  };
  return (
    <View style={{ flex: 1, gap: 14 }}>
      <StepHeading
        title={t('onboarding.landed.title')}
        sub={t('onboarding.landed.sub')}
        pal={pal}
      />
      <View style={{ flex: 1, minHeight: 0, justifyContent: 'center', paddingHorizontal: 18 }}>
        <EmptySlip />
      </View>
      <Animated.View layout={RESIZE}>
        <Card pal={pal} style={{ paddingVertical: 14, paddingHorizontal: 16, gap: 8 }}>
          <Text style={{ ...body(15, 650), color: pal.ink }}>
            {t('onboarding.landed.lastUntil')}
          </Text>
          <View style={{ marginHorizontal: -16 }}>
            <Strip
              items={CHOICES.map((c) => t(`onboarding.landed.${c}`))}
              widths={CHOICE_WIDTHS}
              index={CHOICES.indexOf(choice)}
              onChange={(k) => pick(CHOICES[k] ?? 'monthEnd')}
              ink={pal.ink}
              band={pal.chipBg}
              label={t('onboarding.landed.lastUntil')}
              spoken={CHOICES.map((c) => t(`onboarding.landed.${c}`))}
              size={20}
            />
          </View>
          {lastFor.kind === 'date' ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={{ marginHorizontal: -16 }}
            >
              <Strip
                items={days.map((d) => i18n.dayMonthShort(dateOf(d)))}
                widths={days.map(() => DATE_WIDTH)}
                index={Math.max(0, days.indexOf(lastFor.date))}
                onChange={(k) => onLastFor({ kind: 'date', date: days[k] ?? lastFor.date })}
                ink={pal.ink}
                band={pal.chipBg}
                label={t('onboarding.landed.aDate')}
                spoken={days.map((d) => i18n.weekdayDate(dateOf(d)))}
                size={20}
              />
            </Animated.View>
          ) : null}
          <Text
            style={{ ...body(14, 550), lineHeight: 20, textAlign: 'center', color: pal.inkSoft }}
          >
            {t('onboarding.landed.caption', { date: i18n.dayMonthShort(dateOf(lastsTo)) })}
          </Text>
        </Card>
      </Animated.View>
    </View>
  );
}

/** The receipt the first landing will print: MONEY IN, NOT YET, an empty amount. */
function EmptySlip() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();
  const bob = useLoop(BOB_MS);
  const shimmer = useLoop(SHIMMER_MS);
  const float = useAnimatedStyle(() => ({
    transform: [
      { translateY: reduceMotion ? 0 : -4 * Math.sin(bob.value * Math.PI) },
      { rotate: '-2deg' },
    ],
  }));
  const glint = useAnimatedStyle(() => ({
    opacity: reduceMotion ? 0.5 : 0.35 + 0.4 * Math.max(0, Math.sin(shimmer.value * Math.PI * 2)),
  }));
  const currency = useHomeCurrency();
  const label = { ...mono(11.5, 500, 0.1), color: catchInk.soft } as const;
  return (
    <Animated.View style={[{ alignSelf: 'center', width: '100%', maxWidth: 260 }, float]}>
      <View
        style={{
          boxShadow: catchInk.slipShadow,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          backgroundColor: catchInk.paperBottom,
        }}
      >
        <View
          style={{
            experimental_backgroundImage: `linear-gradient(180deg, ${catchInk.paperTop} 0%, ${catchInk.paperBottom} 100%)`,
            paddingTop: 16,
            paddingHorizontal: 18,
            paddingBottom: 14,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={label}>{t('onboarding.landed.slipIn')}</Text>
            <Text style={label}>{t('onboarding.landed.slipNotYet')}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ ...body(24, 600), color: catchInk.stamp }}>+</Text>
            <Animated.View
              style={[
                {
                  flex: 1,
                  height: 30,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderStyle: 'dashed',
                  borderColor: catchInk.stamp,
                },
                glint,
              ]}
            />
            <Text style={{ ...body(18, 600), color: catchInk.soft }}>{currency.symbol}</Text>
          </View>
          <View style={{ gap: 8 }}>
            <SlipRow text={t('onboarding.landed.billsFirst')} />
            <SlipRow text={t('onboarding.landed.thenDays')} />
          </View>
        </View>
      </View>
      <PaperEdge color={catchInk.paperBottom} height={8} step={11} />
    </Animated.View>
  );
}

function SlipRow({ text }: { readonly text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ ...mono(10.5, 500, 0.1), color: catchInk.soft }}>{text}</Text>
      <View style={{ flex: 1 }}>
        <DashedRule color={catchInk.rule} />
      </View>
    </View>
  );
}
