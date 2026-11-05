import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { JarAddFrom } from '@6pm/domain';
import { curves } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { Symbol } from '../../ui/icons/symbol';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { FillSegment } from './new-jar-parts';

const ease = Easing.bezier(...curves.house);

/** "This month's money" | "Already saved": where Add takes the money from (M4). */
export function JarAddChoice({
  from,
  onFrom,
}: {
  readonly from: JarAddFrom;
  readonly onFrom: (from: JarAddFrom) => void;
}) {
  const { t } = useI18n();
  return (
    <FillSegment
      options={[
        { id: 'cycle', icon: 'calendar_today', label: t('pots.page.addFromCycle') },
        { id: 'saved', icon: 'account_balance', label: t('pots.page.addFromSaved') },
      ]}
      selected={from}
      onSelect={(id) => onFrom(id === 'saved' ? 'saved' : 'cycle')}
    />
  );
}

/** One line under the amount: an icon, what it is, and the number before → after. */
function Line({
  icon,
  label,
  before,
  after,
}: {
  readonly icon: SymbolName;
  readonly label: string;
  readonly before: string;
  readonly after: string | null;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6 }}>
      <Symbol name={icon} size={19} color={palette.inkSoft} />
      <Text numberOfLines={1} style={{ ...body(14), flex: 1, color: palette.inkSoft }}>
        {label}
      </Text>
      <Text style={{ ...body(14), ...tabular, color: palette.inkSoft }}>
        {after === null ? (
          <Text style={{ ...body(14, 700), color: palette.ink }}>{before}</Text>
        ) : (
          <>
            <Text style={{ opacity: 0.6 }}>{before} →</Text>{' '}
            <Text style={{ ...body(14, 700), color: palette.ink }}>{after}</Text>
          </>
        )}
      </Text>
    </View>
  );
}

/** A line's height, kept for the payday line even while it has nothing to say, so nothing jumps. */
const LINE_HEIGHT = 22;

/**
 * What the amount does: today's line before → after when it comes out of this month's money, or
 * that today's line stays when it was already saved; and, for a jar whose payday share follows what
 * it holds, what it takes each payday from the next one on, shown once that changes.
 */
export function JarAddLines({
  from,
  dayBefore,
  dayAfter,
  payday,
  dated,
  short,
}: {
  readonly from: JarAddFrom;
  readonly dayBefore: number;
  readonly dayAfter: number;
  /** The next payday's share before and after; null for a jar whose share does not follow. */
  readonly payday: { readonly before: number; readonly after: number } | null;
  readonly dated: boolean;
  readonly short: (amount: number) => string;
}) {
  const { t } = useI18n();
  const changed = payday !== null && payday.after !== payday.before;
  const shown = useSharedValue(changed ? 1 : 0);
  useEffect(() => {
    shown.value = withTiming(changed ? 1 : 0, {
      duration: 200,
      easing: ease,
      reduceMotion: ReduceMotion.System,
    });
  }, [changed, shown]);
  const paydayStyle = useAnimatedStyle(() => ({ opacity: shown.value }));
  return (
    <View style={{ gap: 6 }}>
      <Animated.View key={from} entering={FadeIn.duration(200)} style={{ height: LINE_HEIGHT }}>
        {from === 'cycle' ? (
          <Line
            icon="wb_twilight"
            label={t('pots.new.eachDay')}
            before={short(dayBefore)}
            after={short(dayAfter)}
          />
        ) : (
          <Line
            icon="wb_twilight"
            label={t('pots.page.addDayStays')}
            before={short(dayBefore)}
            after={null}
          />
        )}
      </Animated.View>
      {payday === null ? null : (
        <Animated.View style={[{ height: LINE_HEIGHT }, paydayStyle]}>
          <Line
            icon={dated ? 'calendar_month' : 'autorenew'}
            label={t('pots.new.eachPayday')}
            before={short(payday.before)}
            after={short(payday.after)}
          />
        </Animated.View>
      )}
    </View>
  );
}
