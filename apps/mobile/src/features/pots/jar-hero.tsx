import type { ComponentProps, ComponentRef, RefObject } from 'react';
import { Text, View } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';

type AnimatedViewStyle = ComponentProps<typeof Animated.View>['style'];

import { moneyDayOf } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import { Jar } from './jar';
import { FULL_TEXT, jarColours, PAST_DATE_WARM } from './jar-colours';
import { StatePill } from './jar-page-parts';
import { stateLine, type JarFormat } from './jar-words';
import type { OwnJar } from './use-jars';

/**
 * The top of a jar's page: the jar (140 × 184, its surface sloshing) and beside it what it holds,
 * its target or "No target · since Mar", what goes in each payday and, for a dated jar, its month
 * and the paydays left. An edge state says itself under them, with the one thing it offers.
 */
export function JarHero({
  jar,
  jarRef,
  onJarLayout,
  flight,
  content,
  level,
  each,
  months,
  now,
  format,
  onResume,
  onEdit,
  onPutAway,
}: {
  readonly jar: OwnJar;
  readonly jarRef: RefObject<ComponentRef<typeof View> | null>;
  readonly onJarLayout: () => void;
  readonly flight: AnimatedViewStyle;
  readonly content: AnimatedViewStyle;
  readonly level: number | SharedValue<number>;
  readonly each: number;
  readonly months: number | null;
  readonly now: string;
  readonly format: JarFormat;
  readonly onResume: () => void;
  readonly onEdit: () => void;
  readonly onPutAway: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const short = (n: number) => format.money.short(n);
  const c = jarColours(jar.pot.hue);
  const since = format.month(moneyDayOf(new Date(jar.pot.createdAt)).slice(0, 7), now);
  const of =
    jar.target > 0
      ? t('pots.page.of', { amount: short(jar.target) })
      : t('pots.page.noTarget', { month: since });
  const state = stateLine(jar, t, format, now);
  const dated = jar.pot.neededBy !== null && jar.state !== 'pastDate' && months !== null;
  const eachText =
    jar.fill === 'byHand' ? t('pots.list.byHand') : t('pots.page.each', { amount: short(each) });

  const action =
    jar.state === 'paused'
      ? [{ label: t('pots.action.resume'), onPress: onResume }]
      : jar.state === 'pastDate'
        ? [{ label: t('pots.action.keepFilling'), onPress: onEdit }]
        : jar.state === 'empty'
          ? [
              { label: t('pots.action.fillAgain'), onPress: onEdit },
              ...(jar.futureYou ? [] : [{ label: t('pots.action.putAway'), onPress: onPutAway }]),
            ]
          : [];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 20,
        paddingTop: 10,
        paddingHorizontal: 4,
      }}
    >
      <Animated.View style={flight}>
        <View ref={jarRef} collapsable={false} onLayout={onJarLayout}>
          <Jar
            width={140}
            height={184}
            hue={jar.pot.hue}
            icon={jar.pot.icon}
            futureYou={jar.futureYou}
            level={level}
            target={jar.target > 0}
            state={jar.state}
            ringColor={palette.sheetSolid}
            slosh
          />
        </View>
      </Animated.View>
      <Animated.View style={[{ flex: 1, gap: 6, paddingBottom: 6 }, content]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            ...leading(display(46, 500, -0.03), 46 * 0.95, true),
            ...tabular,
            color: palette.ink,
          }}
        >
          {short(jar.saved)}
        </Text>
        <Text style={{ ...body(15, 600), color: palette.inkSoft }}>{of}</Text>
        <View style={{ gap: 4, paddingTop: 10 }}>
          {jar.state === 'paused' || jar.state === 'full' ? null : (
            <Line icon="south" color={c.fillTop} text={eachText} />
          )}
          {dated && jar.pot.neededBy !== null ? (
            <Line
              icon="calendar_month"
              color={c.fillTop}
              text={t('pots.page.paydays', {
                count: months,
                month: format.month(jar.pot.neededBy, now),
              })}
            />
          ) : null}
          {state ? (
            <Text
              style={{
                ...body(13.5, 600),
                color:
                  state.tone === 'warm'
                    ? PAST_DATE_WARM
                    : state.tone === 'full'
                      ? FULL_TEXT
                      : palette.inkSoft,
              }}
            >
              {state.text}
            </Text>
          ) : null}
          {action.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 6, paddingTop: 4, flexWrap: 'wrap' }}>
              {action.map((a) => (
                <StatePill key={a.label} label={a.label} onPress={a.onPress} />
              ))}
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

function Line({
  icon,
  color,
  text,
}: {
  readonly icon: 'south' | 'calendar_month';
  readonly color: string;
  readonly text: string;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Symbol name={icon} size={17} color={color} />
      <Text style={{ ...body(14, 650), ...tabular, color: palette.ink, flexShrink: 1 }}>
        {text}
      </Text>
    </View>
  );
}
