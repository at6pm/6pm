import { Text, type LayoutChangeEvent, type TextLayoutEvent } from 'react-native';

import { planLede, type DailyNumber, type DailyNumberInput } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { body } from '../../ui/type/fonts';

/**
 * The line under Plan's title: what was set aside, then what is left. An overspent cycle says how
 * far past the plan it is, and a cycle that starts Future you at payday says so.
 */
export function PlanLede({
  input,
  day,
  color,
  onLayout,
  onTextLayout,
}: {
  readonly input: DailyNumberInput;
  readonly day: DailyNumber;
  readonly color: string;
  /** For the sky to keep clear of the lines (`useHeaderMeasure`). */
  readonly onLayout?: (e: LayoutChangeEvent) => void;
  readonly onTextLayout?: (e: TextLayoutEvent) => void;
}) {
  const { t } = useI18n();
  const money = useMoneyFormat();
  const lede = planLede(
    { planned: input.plan.futureYou, skipped: input.futureYouSkipped === true },
    day,
  );
  const setAside = t(`plan.lede.${lede.setAside}`);
  const left = t(`plan.lede.${lede.left}`, {
    free: money.short(day.free),
    daily: money.short(day.tomorrow),
    over: money.short(lede.over),
  });
  return (
    <Text
      style={{ ...body(15), lineHeight: 21.75, paddingTop: 8, color }}
      {...(onLayout ? { onLayout } : {})}
      {...(onTextLayout ? { onTextLayout } : {})}
    >
      {`${setAside} ${left}`}
    </Text>
  );
}
