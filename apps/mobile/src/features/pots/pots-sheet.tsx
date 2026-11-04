import { useRouter } from 'expo-router';
import { useEffect, useRef, type ComponentRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { cycleMonth } from '@6pm/domain';
import { curves, durations } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { SheetFrame } from '../../ui/navigation/sheet-frame';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, tabular } from '../../ui/type/fonts';
import { sharedPotRoute } from '../together/shared-jar';
import { Jar } from './jar';
import { alpha, FULL_TEXT, jarColours, PAST_DATE_WARM } from './jar-colours';
import { flyFrom } from './jar-flight';
import { listLine, savedWords, useJarFormat } from './jar-words';
import { newJarRoute, potRoute } from './pot-routes';
import { useJars, type ShelfJar } from './use-jars';

const grow = Easing.bezier(...curves.enter);

/**
 * All pots (Pots canvas, A2), opened from the shelf's header: "+" for a new jar, the plan's one
 * line in big type with a bar of the jars' colours sized by what each takes per payday, one list
 * with Future you first, and the bank line, which appears only here.
 */
export function PotsSheet() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const jars = useJars();

  const header = (
    <View style={{ paddingTop: 8, paddingHorizontal: 18, paddingBottom: 6, gap: 6 }}>
      <View
        style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 9,
          backgroundColor: palette.inkSoft,
          opacity: 0.35,
        }}
      />
      <View style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('pots.all.new')}
          hitSlop={8}
          onPress={() => {
            haptics.tap();
            router.push(jars.locked ? { pathname: '/max', params: { from: 'pots' } } : newJarRoute);
          }}
          style={{
            position: 'absolute',
            left: 0,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: palette.chipBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Symbol name="add" size={22} color={palette.ink} />
        </PressScale>
        <Text style={{ ...body(17, 650), color: palette.ink }}>{t('pots.all.title')}</Text>
        <PressScale
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
          style={{ position: 'absolute', right: 0, paddingVertical: 8, paddingHorizontal: 2 }}
        >
          <Text style={{ ...body(17, 650), color: palette.ink }}>{t('common.done')}</Text>
        </PressScale>
      </View>
    </View>
  );

  const bar = jars.own.filter((j) => j.each > 0);
  return (
    <SheetFrame header={header}>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 6, paddingHorizontal: 16, paddingBottom: 44, gap: 14 }}
      >
        <View style={{ paddingTop: 2, paddingHorizontal: 4, paddingBottom: 6, gap: 10 }}>
          <Text
            style={{
              ...leading(display(34, 500, -0.02), 34 * 1.02),
              ...tabular,
              color: palette.ink,
            }}
          >
            {t('pots.all.line', { amount: money.short(jars.eachPayday) })}
          </Text>
          <EachBar parts={bar.map((j) => ({ id: j.id, each: j.each, hue: j.pot.hue }))} />
        </View>
        <View
          style={{
            borderRadius: 26,
            backgroundColor: palette.cell,
            boxShadow: palette.cardShadow,
            overflow: 'hidden',
          }}
        >
          {jars.all.map((jar, n) => (
            <PotRow key={`${jar.kind}:${jar.id}`} jar={jar} first={n === 0} />
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Symbol name="account_balance" size={15} color={alpha(palette.ink, 0.6)} />
          <Text style={{ ...body(12.5), color: alpha(palette.ink, 0.6) }}>
            {t('pots.all.bank')}
          </Text>
        </View>
      </ScrollView>
    </SheetFrame>
  );
}

/** The jars' colours in one bar, each as wide as what it takes per payday, grown left to right. */
function EachBar({
  parts,
}: {
  readonly parts: readonly { readonly id: string; readonly each: number; readonly hue: number }[];
}) {
  const shown = useSharedValue(0);
  useEffect(() => {
    shown.value = withDelay(
      120,
      withTiming(1, { duration: durations.sheet, easing: grow, reduceMotion: ReduceMotion.System }),
    );
  }, [shown]);
  const style = useAnimatedStyle(() => ({
    transformOrigin: 'left',
    transform: [{ scaleX: shown.value }],
  }));
  return (
    <Animated.View
      style={[
        { flexDirection: 'row', height: 10, gap: 2, borderRadius: 5, overflow: 'hidden' },
        style,
      ]}
    >
      {parts.map((p) => (
        <View key={p.id} style={{ flex: p.each, backgroundColor: jarColours(p.hue).fill }} />
      ))}
    </Animated.View>
  );
}

function PotRow({ jar, first }: { readonly jar: ShelfJar; readonly first: boolean }) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const format = useJarFormat();
  const now = cycleMonth(useMoney().cycle);
  const jarView = useRef<ComponentRef<typeof View>>(null);
  const line = listLine(jar, t, format, now);
  const amounts = savedWords(jar, money, t);
  const own = jar.kind === 'own' ? jar : null;
  return (
    <PressScale
      accessibilityRole="button"
      highlight
      onPress={() => {
        haptics.tap();
        if (jar.kind === 'shared') router.push(sharedPotRoute(jar.id));
        else flyFrom(jar.id, jarView.current, () => router.push(potRoute(jar.id)));
      }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}
    >
      <View ref={jarView} collapsable={false}>
        <Jar
          width={32}
          height={42}
          hue={jar.pot.hue}
          icon={jar.pot.icon}
          futureYou={own?.futureYou ?? false}
          level={jar.level}
          state={own?.state ?? 'normal'}
          partner={
            jar.kind === 'shared' ? { initial: jar.partnerInitial, level: jar.partnerLevel } : null
          }
          ringColor={palette.cell}
          plain
        />
      </View>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 11,
          borderTopWidth: first ? 0 : 0.5,
          borderTopColor: palette.hair,
        }}
      >
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text numberOfLines={1} style={{ ...body(16, 600), color: palette.ink }}>
            {jar.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...body(12.5),
              color:
                line.tone === 'warm'
                  ? PAST_DATE_WARM
                  : line.tone === 'full'
                    ? FULL_TEXT
                    : alpha(palette.ink, 0.62),
            }}
          >
            {line.text}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Text style={{ ...display(19, 500), ...tabular, color: palette.ink }}>
            {amounts.saved}
          </Text>
          {amounts.of ? (
            <Text style={{ ...body(11.5), color: alpha(palette.ink, 0.55) }}>{amounts.of}</Text>
          ) : null}
        </View>
      </View>
    </PressScale>
  );
}
