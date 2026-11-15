import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CASH_CODE, findBank, nextBankWork, type BankWork } from '@6pm/domain';
import { workInk } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { BankLogo } from '../../ui/bank-logo/bank-logo';
import { haptics } from '../../ui/haptics';
import { PaperEdge } from '../../ui/paper-edge';
import { PressScale } from '../../ui/primitives/press-scale';
import { body, mono } from '../../ui/type/fonts';
import { bankNameOf } from '../banks/named-bank';
import { WorkStamp } from '../work/work-stamp';
import type { OnboardingPalette } from './onboarding-palette';
import { Card, StepHeading } from './step-parts';

/** The slip prints down from the banks just chosen: 500 ms out of the printer's slot. */
const slotPrint = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: -36 }] },
  30: { opacity: 1 },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: Easing.bezier(0.45, 0.05, 0.4, 1) },
}).duration(500);

/** How long the key's row for the answer just given stays lit. */
const LIGHT_MS = 600;
const KEY: readonly BankWork[] = ['always', 'sometimes', 'never'];

/**
 * "Which of these is for work?": the second beat of Pay with, only for someone who sells or runs
 * something. The banks just chosen and cash on one slip, each answered with the stamp it will
 * carry: one tap cycles blank → dashed WORK? → solid WORK, and the key's matching row lights.
 */
export function StepWorkBanks({
  pal,
  banks,
  onAnswer,
}: {
  readonly pal: OnboardingPalette;
  /** Each chosen bank's and cash's answer, in the order they were chosen, cash last. */
  readonly banks: Readonly<Record<string, BankWork>>;
  readonly onAnswer: (code: string, answer: BankWork) => void;
}) {
  const { t } = useI18n();
  const [lit, setLit] = useState<{ readonly answer: BankWork; readonly n: number } | null>(null);
  const codes = Object.keys(banks);
  const labels = { inked: t('work.stamp'), offered: t('work.stampOffered') };
  const nameOf = (code: string) =>
    code.toUpperCase() === CASH_CODE
      ? t('onboarding.wallets.cash')
      : (bankNameOf(code) ?? findBank(code)?.shortName ?? code);
  const cycle = (code: string) => {
    const answer = nextBankWork(banks[code] ?? 'sometimes');
    haptics.tap();
    onAnswer(code, answer);
    setLit((was) => ({ answer, n: (was?.n ?? 0) + 1 }));
  };
  return (
    <View style={{ flex: 1, minHeight: 0, gap: 14 }}>
      <StepHeading title={t('work.banks.title')} sub={t('work.banks.sub')} pal={pal} />
      <View style={{ flex: 1, minHeight: 0, gap: 14, paddingTop: 4 }}>
        <Animated.View
          entering={slotPrint}
          style={{
            flexShrink: 1,
            minHeight: 0,
            paddingHorizontal: 2,
            transform: [{ rotate: '-0.5deg' }],
          }}
        >
          <View style={{ transform: [{ rotate: '180deg' }] }}>
            <PaperEdge color={workInk.slip} height={9} step={12} shadow={false} />
          </View>
          <View
            style={{
              flexShrink: 1,
              minHeight: 0,
              backgroundColor: workInk.slip,
              boxShadow: workInk.slipShadow,
              paddingLeft: 18,
              paddingRight: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 8,
                paddingBottom: 6,
                borderBottomWidth: 1,
                borderStyle: 'dashed',
                borderColor: workInk.slipRule,
              }}
            >
              <Text style={{ ...mono(10.5, 400, 0.14), color: workInk.slipSoft }}>
                {t('work.banks.payWith')}
              </Text>
              <Text style={{ ...mono(10.5, 400, 0.14), color: workInk.slipSoft }}>
                {t('work.banks.places', { count: codes.length })}
              </Text>
            </View>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {codes.map((code, i) => {
                const answer = banks[code] ?? 'sometimes';
                return (
                  <PressScale
                    key={code}
                    scaleTo={0.98}
                    onPress={() => cycle(code)}
                    accessibilityRole="button"
                    accessibilityLabel={`${nameOf(code)}, ${t(`work.key.${answer}`)}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      minHeight: 62,
                      ...(i > 0
                        ? {
                            borderTopWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: workInk.slipRuleSoft,
                          }
                        : {}),
                    }}
                  >
                    <BankLogo
                      id={code.toUpperCase() === CASH_CODE ? CASH_CODE : code}
                      size={34}
                      radius={10}
                      neutral={workInk.slipSoft}
                      neutralInk="#ffffff"
                    />
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text
                        numberOfLines={1}
                        style={{ ...body(16, 650, -0.01), color: workInk.slipInk }}
                      >
                        {nameOf(code)}
                      </Text>
                      <Animated.Text
                        key={answer}
                        entering={FadeIn.duration(200)}
                        numberOfLines={1}
                        style={{ ...body(12.5), color: workInk.slipSoft }}
                      >
                        {t(`work.banks.${answer}Sub`)}
                      </Animated.Text>
                    </View>
                    <View style={{ width: 78, alignItems: 'center' }}>
                      <WorkStamp face={answer} labels={labels} />
                    </View>
                  </PressScale>
                );
              })}
            </ScrollView>
          </View>
          <PaperEdge color={workInk.slip} height={9} step={12} shadow={false} />
        </Animated.View>
        <Card pal={pal} style={{ paddingVertical: 6, paddingHorizontal: 16 }}>
          {KEY.map((answer, i) => (
            <KeyRow
              key={answer}
              answer={answer}
              first={i === 0}
              pal={pal}
              labels={labels}
              lit={lit?.answer === answer ? lit.n : 0}
            />
          ))}
        </Card>
      </View>
    </View>
  );
}

/** A row of the key under the slip: the stamp, what it means, and what 6pm does with it. */
function KeyRow({
  answer,
  first,
  pal,
  labels,
  lit,
}: {
  readonly answer: BankWork;
  readonly first: boolean;
  readonly pal: OnboardingPalette;
  readonly labels: { readonly inked: string; readonly offered: string };
  /** Changes each time this row's answer is given: the row lights for 600 ms. */
  readonly lit: number;
}) {
  const { t } = useI18n();
  const glow = useSharedValue(0);
  const seen = useRef(lit);
  useEffect(() => {
    if (lit === seen.current) return;
    seen.current = lit;
    if (lit === 0) return;
    glow.set(
      withSequence(
        withTiming(1, { duration: 120 }),
        withDelay(LIGHT_MS - 320, withTiming(0, { duration: 200 })),
      ),
    );
  }, [lit, glow]);
  const light = useAnimatedStyle(() => ({ opacity: glow.get() }));
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 40,
        ...(first ? {} : { borderTopWidth: 0.5, borderColor: pal.track }),
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: -10,
            right: -10,
            top: 2,
            bottom: 2,
            borderRadius: 12,
            backgroundColor: pal.chipBg,
          },
          light,
        ]}
      />
      <View style={{ width: 74, alignItems: 'center' }}>
        <WorkStamp face={answer} labels={labels} small />
      </View>
      <Text style={{ ...body(14.5, 650), color: pal.ink }}>{t(`work.key.${answer}`)}</Text>
      <Text
        numberOfLines={1}
        style={{ ...body(13), flex: 1, textAlign: 'right', color: pal.inkSoft }}
      >
        {t(`work.key.${answer}Sub`)}
      </Text>
    </View>
  );
}
