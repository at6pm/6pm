import { useEffect, type ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { importInk } from '@6pm/theme';

import misa from '../../../assets/import/misa.png';
import moneyLover from '../../../assets/import/moneylover.png';
import momo from '../../../assets/import/momo.png';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol, type SymbolProps } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';

// The three apps' own icons: they say where the history comes from, so the words do not have to.
const ICONS = [moneyLover, misa, momo] as const;

/** Money Lover, MISA and MoMo, overlapping by a third, each ringed in the colour behind it. */
export function AppIcons({
  size,
  radius,
  ring,
  ringColor,
}: {
  readonly size: number;
  readonly radius: number;
  readonly ring: number;
  readonly ringColor: string;
}) {
  return (
    <View style={{ flexDirection: 'row', flexShrink: 0, paddingLeft: 2 }}>
      {ICONS.map((icon, i) => (
        <Image
          key={i}
          source={icon}
          accessibilityIgnoresInvertColors
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            marginLeft: i === 0 ? 0 : -Math.round(size / 3),
            boxShadow: `0 0 0 ${ring}px ${ringColor}`,
            zIndex: 3 - i,
          }}
        />
      ))}
    </View>
  );
}

/** The paper file: a slip with its kind (CSV, XLSX) printed at the foot. */
export function FileCard({ ext, tilt = 0 }: { readonly ext: string; readonly tilt?: number }) {
  return (
    <View
      style={{
        width: 40,
        height: 48,
        borderRadius: 6,
        backgroundColor: importInk.paper,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 5,
        transform: [{ rotate: `${tilt}deg` }],
      }}
    >
      <Text style={{ ...mono(8.5, 600), color: importInk.paperInk }}>{ext}</Text>
    </View>
  );
}

/** The sheet's top: grabber, then Cancel or a back chevron, the title, and a step count. */
export function ImportHeader({
  title,
  left,
  onLeft,
  right,
}: {
  readonly title: string;
  readonly left: 'cancel' | 'back' | null;
  readonly onLeft: () => void;
  readonly right?: string;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
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
      <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {left === null ? null : (
            <PressScale
              accessibilityRole="button"
              accessibilityLabel={left === 'back' ? t('import.back') : t('import.cancel')}
              hitSlop={10}
              onPress={() => {
                haptics.tap();
                onLeft();
              }}
            >
              {left === 'back' ? (
                <Symbol name="chevron_left" size={24} color={palette.ink} />
              ) : (
                <Text style={{ ...body(17), color: palette.inkSoft }}>{t('import.cancel')}</Text>
              )}
            </PressScale>
          )}
        </View>
        <Text accessibilityRole="header" style={{ ...body(17, 650), color: palette.ink }}>
          {title}
        </Text>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          {right ? (
            <Text style={{ ...mono(11, 400, 0.14), color: palette.inkSoft, opacity: 0.8 }}>
              {right}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * The 56 pt pill at the foot. Paper when it can go, a quiet chip when it waits; `fill` (0 to 1)
 * draws the bring-in's progress across it.
 */
export function PillButton({
  label,
  icon,
  enabled = true,
  tone = 'paper',
  fill,
  onPress,
}: {
  readonly label: string;
  readonly icon?: SymbolProps['name'];
  readonly enabled?: boolean;
  readonly tone?: 'paper' | 'accent';
  readonly fill?: SharedValue<number>;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const bg = !enabled ? palette.chipBg : tone === 'accent' ? palette.accent : palette.btnBg;
  const fg = !enabled ? palette.inkSoft : tone === 'accent' ? palette.accentFg : palette.btnFg;
  const bar = useAnimatedStyle(() => ({ width: `${Math.round((fill?.value ?? 0) * 100)}%` }));
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      scaleTo={0.97}
      onPress={onPress}
      style={{
        height: 56,
        borderRadius: 99,
        backgroundColor: bg,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {fill ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: importInk.progress,
            },
            bar,
          ]}
        />
      ) : null}
      {icon ? <Symbol name={icon} size={20} color={fg} /> : null}
      <Text style={{ ...body(17, 650), color: fg }}>{label}</Text>
    </PressScale>
  );
}

/** "Opened on this phone. Never uploaded." under the pill. */
export function PrivacyLine() {
  const { palette } = useTheme();
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 }}>
      <Symbol name="lock" size={15} color={palette.inkSoft} />
      <Text style={{ ...body(12), color: palette.inkSoft, opacity: 0.82 }}>
        {t('import.guide.private')}
      </Text>
    </View>
  );
}

/** The foot of every step: its button (or buttons) over the home indicator. */
export function ImportFoot({ children }: { readonly children: ReactNode }) {
  return (
    <View style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 34, gap: 10 }}>
      {children}
    </View>
  );
}

/** The one orange tap a sketch shows: it swells and fades every 1.8 s. */
export function TapPulse({ size }: { readonly size: number }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(reduceMotion ? 0.5 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    t.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), -1);
  }, [reduceMotion, t]);
  const style = useAnimatedStyle(() => {
    // tapHint: 0% and 100% small and clear, 30% to 60% full.
    const v = t.value;
    const k = v < 0.3 ? v / 0.3 : v <= 0.6 ? 1 : (1 - v) / 0.4;
    return { opacity: 0.9 * k, transform: [{ scale: 0.8 + 0.2 * k }] };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: importInk.tapFill,
          boxShadow: `0 0 0 3px ${importInk.tapHalo}`,
        },
        style,
      ]}
    />
  );
}
