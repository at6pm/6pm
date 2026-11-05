import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { ScrollView, Text, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { curves, durations } from '@6pm/theme';

import { useMoney } from '../../data/money-provider';
import { useI18n } from '../../i18n/i18n';
import { useMoneyFormat } from '../../money/use-money-format';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { sharedPotRoute } from '../together/shared-jar';
import { Jar } from './jar';
import { alpha } from './jar-colours';
import { flyFrom, takeLanding } from './jar-flight';
import { newJarRoute, potRoute, potsRoute } from './pot-routes';
import { useJars, type ShelfJar } from './use-jars';

const CELL = 66;
const GAP = 6;
const JAR_W = 52;
const JAR_H = 66;
const landEase = Easing.bezier(...curves.jarIn);

/**
 * The jar shelf on Today, under tonight's card (Pots canvas, A1): "Pots" and what goes into jars
 * each payday, then one row of small jars, Future you first, one's own, then the shared ones, and
 * a quiet "+" at the end. It never collapses; past five jars it scrolls and snaps. Tap a jar and
 * it grows into its page.
 */
export function JarShelf() {
  const { palette } = useTheme();
  const { t } = useI18n();
  const money = useMoneyFormat();
  const router = useRouter();
  const jars = useJars();
  const scroll = useRef<ScrollViewInstance>(null);
  const hasPlan = useMoney().plan !== null;

  if (!hasPlan) return null;
  const openNew = () => {
    haptics.tap();
    router.push(jars.locked ? { pathname: '/max', params: { from: 'pots' } } : newJarRoute);
  };

  return (
    <View style={{ gap: 10 }}>
      <PressScale
        accessibilityRole="button"
        scaleTo={0.98}
        onPress={() => {
          haptics.tap();
          router.push(potsRoute);
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingHorizontal: 6,
        }}
      >
        <Text style={{ ...body(20, 700, -0.02), color: palette.ink }}>{t('pots.shelf.title')}</Text>
        <Text style={{ ...body(14, 500), ...tabular, color: palette.inkSoft }}>
          {t('pots.shelf.each', { amount: money.short(jars.eachPayday) })}
        </Text>
      </PressScale>
      <ScrollView
        ref={scroll}
        horizontal
        scrollsToTop={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CELL + GAP}
        decelerationRate="fast"
        // A jar New jar just started drops in from above the row's top.
        style={{ marginHorizontal: -16, flexGrow: 0, overflow: 'visible' }}
        contentContainerStyle={{
          gap: GAP,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 2,
        }}
      >
        {jars.all.map((jar) => (
          <ShelfCell
            key={`${jar.kind}:${jar.id}`}
            jar={jar}
            onLanded={() => scroll.current?.scrollToEnd({ animated: true })}
          />
        ))}
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={t('pots.shelf.new')}
          onPress={openNew}
          style={{ width: JAR_W, alignItems: 'center' }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              marginVertical: 11,
              borderRadius: 22,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: 'rgba(255,255,255,0.28)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Symbol name="add" size={22} color={palette.inkSoft} />
          </View>
        </PressScale>
      </ScrollView>
    </View>
  );
}

function ShelfCell({ jar, onLanded }: { readonly jar: ShelfJar; readonly onLanded: () => void }) {
  const { palette } = useTheme();
  const home = useMoneyFormat();
  const router = useRouter();
  const jarView = useRef<ComponentRef<typeof View>>(null);
  const onOpen = useCallback(() => {
    haptics.tap();
    if (jar.kind === 'shared') {
      router.push(sharedPotRoute(jar.id));
      return;
    }
    flyFrom(jar.id, jarView.current, () => router.push(potRoute(jar.id)));
  }, [jar.kind, jar.id, router]);
  const money = jar.kind === 'shared' ? jar.money : home;

  // A jar New jar just started drops in after the sheet has gone, with the jarIn curve.
  const [landing] = useState(() => takeLanding());
  const land = useSharedValue(landing ? 0 : 1);
  useEffect(() => {
    if (!landing) return;
    onLanded();
    const half = durations.jarFill * 0.6;
    land.value = withDelay(
      durations.screen,
      withSequence(
        withTiming(0.6, { duration: half, easing: landEase, reduceMotion: ReduceMotion.System }),
        withTiming(1, {
          duration: durations.jarFill - half,
          easing: landEase,
          reduceMotion: ReduceMotion.System,
        }),
      ),
    );
    const buzz = setTimeout(haptics.success, durations.screen + half);
    return () => clearTimeout(buzz);
  }, [landing, land, onLanded]);
  const landStyle = useAnimatedStyle(() => {
    const v = land.value;
    if (v >= 1) return { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] };
    const a = v < 0.6 ? v / 0.6 : (v - 0.6) / 0.4;
    return v < 0.6
      ? { opacity: a, transform: [{ translateY: -30 + 34 * a }, { scale: 0.6 + 0.44 * a }] }
      : { opacity: 1, transform: [{ translateY: 4 - 4 * a }, { scale: 1.04 - 0.04 * a }] };
  });

  const own = jar.kind === 'own' ? jar : null;
  return (
    <Animated.View style={[{ width: CELL, alignItems: 'center', gap: 7 }, landStyle]}>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={`${jar.name}, ${money.spoken(jar.saved)}`}
        onPress={onOpen}
        style={{ width: CELL, alignItems: 'center', gap: 7 }}
      >
        <View ref={jarView} collapsable={false} style={{ width: JAR_W, height: JAR_H }}>
          <Jar
            width={JAR_W}
            height={JAR_H}
            hue={jar.pot.hue}
            icon={jar.pot.icon}
            futureYou={own?.futureYou ?? false}
            level={jar.level}
            state={own?.state ?? 'normal'}
            partner={
              jar.kind === 'shared'
                ? { initial: jar.partnerInitial, level: jar.partnerLevel }
                : null
            }
            ringColor={palette.sheet}
          />
        </View>
        <View style={{ alignItems: 'center', width: '100%' }}>
          <Text
            numberOfLines={1}
            style={{ ...body(12, 650), color: palette.ink, maxWidth: '100%' }}
          >
            {jar.name}
          </Text>
          <Text style={{ ...body(11), ...tabular, color: alpha(palette.ink, 0.62) }}>
            {money.short(jar.saved)}
          </Text>
        </View>
      </PressScale>
    </Animated.View>
  );
}
