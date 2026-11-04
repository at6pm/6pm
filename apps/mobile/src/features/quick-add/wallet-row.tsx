import { useRef } from 'react';
import { ScrollView, Text, type ScrollViewInstance } from 'react-native';

import type { PotRow } from '@6pm/domain';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';
import { MiniJar } from '../details/from-jar-row';
import { jarName } from '../pots/jar-name';

/**
 * Where the spend comes from: today, or one of the jars. One row, no extra switch; the jars past
 * the screen's edge scroll sideways.
 */
export function FromRow({
  jars,
  saved,
  value,
  onChange,
}: {
  readonly jars: readonly PotRow[];
  readonly saved: Readonly<Record<string, number>>;
  /** The jar picked, or null for today. */
  readonly value: string | null;
  readonly onChange: (jarId: string | null) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const scroll = useRef<ScrollViewInstance>(null);
  // A jar already picked as the sheet opens (a jar's "Spend from it") is scrolled into view, once.
  const shown = useRef(false);
  const chip = (on: boolean) => ({
    height: 40,
    borderRadius: 12,
    backgroundColor: on ? palette.btnBg : palette.chipBg,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  });
  const pick = (jarId: string | null) => {
    if (jarId === value) return;
    haptics.tick();
    onChange(jarId);
  };
  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -16, flexGrow: 0 }}
      contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
    >
      <PressScale
        accessibilityRole="button"
        accessibilityState={{ selected: value === null }}
        onPress={() => pick(null)}
        style={{ ...chip(value === null), paddingHorizontal: 12 }}
      >
        <Symbol name="wb_twilight" size={17} color={value === null ? palette.btnFg : palette.ink} />
        <Text style={{ ...body(13, 650), color: value === null ? palette.btnFg : palette.ink }}>
          {t('potsClose.quick.today')}
        </Text>
      </PressScale>
      {jars.map((jar) => {
        const on = jar.id === value;
        return (
          <PressScale
            key={jar.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => pick(jar.id)}
            onLayout={(e) => {
              if (!on || shown.current) return;
              shown.current = true;
              const { x, width } = e.nativeEvent.layout;
              scroll.current?.scrollTo({ x: Math.max(0, x + width - 300), animated: false });
            }}
            style={{ ...chip(on), paddingLeft: 7, paddingRight: 10 }}
          >
            <MiniJar jar={jar} saved={saved[jar.id] ?? 0} width={16} height={21} />
            <Text
              numberOfLines={1}
              style={{ ...body(13, 650), color: on ? palette.btnFg : palette.ink }}
            >
              {jarName(jar, t)}
            </Text>
          </PressScale>
        );
      })}
    </ScrollView>
  );
}
