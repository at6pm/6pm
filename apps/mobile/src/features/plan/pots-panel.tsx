import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, type ComponentRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { isFutureYouPot, newJarLocked, sharedPotProgress, type SharedPot } from '@6pm/domain';
import { springs } from '@6pm/theme';

import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { Jar, jarLevel, type JarState } from '../pots/jar';
import { flyFrom, useJarAwayStyle } from '../pots/jar-flight';
import { jarName } from '../pots/jar-name';
import { useEntitlement } from '../purchases/purchases-provider';
import { sharedPotRoute } from '../together/shared-jar';
import { useTogether } from '../together/together-provider';
import { initialOf, partnerOf } from '../together/together-state';
import { planRoutes } from './plan-routes';
import type { PlanJarView } from './plan-view';
import type { SplitColours } from './split-colours';

const JAR_W = 48;
const JAR_H = 62;
const FILL_STAGGER = 90;
const GLOW_MS = 900;
const reduceMotion = ReduceMotion.System;
/** A jar filled only by hand takes nothing each payday: a dash, as the canvas writes it. */
const BY_HAND = '—';

interface Cell {
  readonly key: string;
  readonly name: string;
  readonly each: string;
  readonly hue: number;
  readonly icon: string;
  readonly futureYou: boolean;
  readonly level: number;
  /** Where the fill starts when it fills in front of the person (the day after payday). */
  readonly from: number;
  readonly target: boolean;
  readonly state: JarState;
  readonly partner: { readonly initial: string; readonly level: number } | null;
  readonly chip: string | null;
  readonly route: Href;
  /** One's own jar grows out of its cell into its page; a shared one opens its sheet. */
  readonly own: boolean;
}

/**
 * Pots: every jar three to a row in shelf order, Future you first, then the jars shared with a
 * partner (their initial on the glass). The day after payday Future you fills first, the others
 * 90 ms apart, and Future you's "+2,1tr" stays for the day.
 */
export function PotsPanel({
  jars,
  justPaid,
  fill,
  first,
  colours,
}: {
  readonly jars: readonly PlanJarView[];
  /** Payday was today or yesterday: Future you's chip shows. */
  readonly justPaid: boolean;
  /** Changes when the jars should fill in front of the person; 0 for not. */
  readonly fill: number;
  /** The first month: a quiet "+" starts a jar. */
  readonly first: boolean;
  readonly colours: SplitColours;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const { max } = useEntitlement();
  const { state } = useTogether();
  const partner = partnerOf(state);
  const own: Cell[] = jars.map((j) => {
    const level = jarLevel(j.saved, j.pot.goal);
    const before = Math.max(0, j.saved - j.setAside);
    return {
      key: j.pot.id,
      name: jarName(j.pot, t),
      each: j.each > 0 ? money.short(j.each) : BY_HAND,
      hue: j.pot.hue,
      icon: j.pot.icon,
      futureYou: isFutureYouPot(j.pot),
      level,
      from:
        j.pot.goal > 0
          ? jarLevel(before, j.pot.goal)
          : j.saved > 0
            ? level * (before / j.saved)
            : 0,
      target: j.pot.goal > 0,
      state: j.state,
      partner: null,
      chip:
        justPaid && isFutureYouPot(j.pot) && j.setAside > 0 ? `+${money.short(j.setAside)}` : null,
      route: planRoutes.pot(j.pot.id),
      own: true,
    };
  });
  const shared: Cell[] =
    state.me === null ? [] : (state.pair?.pots ?? []).map((pot) => sharedCell(pot));
  function sharedCell(pot: SharedPot): Cell {
    const ids = partner === null ? [state.me?.id ?? ''] : [state.me?.id ?? '', partner.id];
    const progress = sharedPotProgress(pot.goal, pot.contributions, ids);
    const theirs = partner === null ? 0 : (progress.byMember[partner.id] ?? 0);
    const level = jarLevel(progress.saved, pot.goal);
    const name = partner?.name ?? t('together.partner');
    return {
      key: `shared:${pot.id}`,
      name: pot.name,
      each: t('potsPlan.pots.with', { name: initialOf(name) }),
      hue: pot.hue,
      icon: pot.icon,
      futureYou: false,
      level,
      from: level,
      target: pot.goal > 0,
      state: progress.full ? 'full' : 'normal',
      partner:
        partner === null
          ? null
          : { initial: initialOf(name), level: pot.goal > 0 ? theirs / pot.goal : 0 },
      chip: null,
      route: sharedPotRoute(pot.id),
      own: false,
    };
  }
  const cells = [...own, ...shared];
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 12,
        paddingTop: 12,
        paddingHorizontal: 10,
        paddingBottom: 14,
      }}
    >
      {cells.map((cell, i) => (
        <JarCell
          key={cell.key}
          cell={cell}
          order={i}
          fill={fill}
          ring={palette.cell}
          colours={colours}
          onPress={(jarView) => {
            haptics.tap();
            if (cell.own) flyFrom(cell.key, jarView, () => router.push(cell.route));
            else router.push(cell.route);
          }}
        />
      ))}
      {first ? (
        <View style={{ width: '33.333%', alignItems: 'center', gap: 6 }}>
          <PressScale
            accessibilityRole="button"
            accessibilityLabel={t('potsPlan.pots.newJar')}
            onPress={() => {
              haptics.tap();
              if (
                newJarLocked(
                  jars.map((j) => j.pot),
                  max,
                )
              ) {
                router.push({ pathname: '/max', params: { from: 'pots' } });
              } else router.push('/new-pot');
            }}
            style={{
              width: JAR_W,
              height: JAR_H,
              borderRadius: 14,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: palette.hair,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="add" size={22} color={palette.inkSoft} />
          </PressScale>
        </View>
      ) : null}
    </View>
  );
}

function JarCell({
  cell,
  order,
  fill,
  ring,
  colours,
  onPress,
}: {
  readonly cell: Cell;
  readonly order: number;
  readonly fill: number;
  readonly ring: string;
  readonly colours: SplitColours;
  /** Given the jar, measured for the flight into its page. */
  readonly onPress: (jarView: ComponentRef<typeof View> | null) => void;
}) {
  const { palette } = useTheme();
  const jarView = useRef<ComponentRef<typeof View>>(null);
  const awayStyle = useJarAwayStyle(cell.key);
  const level = useSharedValue(fill > 0 ? cell.from : cell.level);
  const glow = useSharedValue(0);
  useEffect(() => {
    if (fill === 0) {
      level.value = withTiming(cell.level, { duration: 550, reduceMotion });
      return;
    }
    level.value = cell.from;
    level.value = withDelay(
      order * FILL_STAGGER,
      withSpring(cell.level, { ...springs.pop, reduceMotion }),
    );
  }, [fill, cell.level, cell.from, order, level]);
  useEffect(() => {
    if (cell.chip === null) return;
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: GLOW_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: GLOW_MS, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
      undefined,
      reduceMotion,
    );
  }, [cell.chip, glow]);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const bodyTop = Math.round(6 * (JAR_H / 66));
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${cell.name}, ${cell.each}`}
      onPress={() => onPress(jarView.current)}
      style={{ width: '33.333%', alignItems: 'center', gap: 6 }}
    >
      <View ref={jarView} collapsable={false}>
        <Animated.View style={awayStyle}>
          <Jar
            width={JAR_W}
            height={JAR_H}
            hue={cell.hue}
            icon={cell.icon}
            futureYou={cell.futureYou}
            level={level}
            target={cell.target}
            state={cell.state}
            partner={cell.partner}
            ringColor={ring}
          >
            {cell.chip !== null ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: bodyTop,
                    bottom: 0,
                    borderTopLeftRadius: 13,
                    borderTopRightRadius: 13,
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    borderWidth: 2,
                    borderColor: colours.pots.pulse,
                  },
                  glowStyle,
                ]}
              />
            ) : null}
          </Jar>
        </Animated.View>
      </View>
      {cell.chip !== null ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -6,
            alignSelf: 'center',
            height: 18,
            paddingHorizontal: 6,
            borderRadius: 99,
            backgroundColor: colours.chip.bg,
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Text style={{ ...body(10, 800), color: colours.chip.fg }}>{cell.chip}</Text>
        </View>
      ) : null}
      <View style={{ alignItems: 'center', gap: 2, alignSelf: 'stretch' }}>
        <Text numberOfLines={1} style={{ ...body(11.5, 650), color: palette.ink }}>
          {cell.name}
        </Text>
        <Text numberOfLines={1} style={{ ...body(10.5), color: palette.inkSoft }}>
          {cell.each}
        </Text>
      </View>
    </PressScale>
  );
}
