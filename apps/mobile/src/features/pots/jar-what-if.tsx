import { useRef } from 'react';
import { Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { lineWithFutureYou, sliceShareOf, whatIfOver, type DailyNumberInput } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { jarColours, WHAT_IF_CARD, WHAT_IF_TRACK } from './jar-colours';
import { JarSlider } from './jar-slider';

/**
 * Future you's what-if, on its jar's page (M5): "12% of each pay" and today's line before and
 * after as the thumb moves (or how far past the plan the cycle would be), a light buzz every 5% of
 * the pay, and the slice committed when the thumb lets go.
 */
export function JarWhatIf({
  input,
  baseline,
  candidate,
  range,
  hue,
  position,
  onCandidate,
  onCommit,
}: {
  readonly input: DailyNumberInput;
  /** Today's line when the page opened. */
  readonly baseline: number;
  readonly candidate: number;
  readonly range: { readonly max: number; readonly step: number };
  readonly hue: number;
  readonly position: SharedValue<number>;
  readonly onCandidate: (amount: number) => void;
  readonly onCommit: (amount: number) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const income = input.plan.income;
  const fifth = useRef(Math.floor(sliceShareOf(candidate, income) / 5));
  const percent = sliceShareOf(candidate, income);
  const over = whatIfOver(input, candidate);
  const after = lineWithFutureYou(input, candidate);
  const step = (amount: number) => {
    const bucket = Math.floor(sliceShareOf(amount, income) / 5);
    if (bucket !== fifth.current) {
      fifth.current = bucket;
      haptics.tap();
    }
    onCandidate(amount);
  };
  // Past the plan every day reads nothing: the note says how far past it would be instead.
  const pastPlan = over > 0;
  return (
    <View
      style={{
        borderRadius: 22,
        backgroundColor: WHAT_IF_CARD,
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
      }}
    >
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <Text style={{ ...body(15, 650), ...tabular, color: palette.ink }}>
          {t('pots.page.slice', { percent })}
        </Text>
        <Text style={{ ...body(13), ...tabular, color: palette.inkSoft }}>
          {pastPlan ? (
            t('pots.page.pastPlan', { amount: money.short(over) })
          ) : (
            <>
              {t('pots.page.eachDay')}{' '}
              <Text style={{ opacity: 0.6 }}>{money.short(baseline)} →</Text>{' '}
              <Text style={{ ...body(13, 700), color: palette.ink }}>{money.short(after)}</Text>
            </>
          )}
        </Text>
      </View>
      <JarSlider
        value={candidate}
        max={range.max}
        step={range.step}
        fillColor={jarColours(hue).fill}
        trackColor={WHAT_IF_TRACK}
        label={t('pots.page.sliderLabel')}
        position={position}
        onStep={step}
        onCommit={onCommit}
      />
    </View>
  );
}
