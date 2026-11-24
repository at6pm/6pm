import { ScrollView, Text, View } from 'react-native';

import type { CategoryRow as Category } from '@6pm/domain';
import { quickAddInk } from '@6pm/theme';

import { CategoryTile } from '../../ui/category-tile';
import { haptics } from '../../ui/haptics';
import { isSymbolName } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, mono } from '../../ui/type/fonts';
import { useI18n } from '../../i18n/i18n';
import { WorkStamp as WorkMark } from '../work/work-stamp';

/** A category's column, and the gap to the next one. */
const COLUMN = 62;
const GAP = 8;

/**
 * The categories under the ticket, the hour's likely ones first, edge to edge. The chosen tile
 * lifts and rings itself. A name may run to the middle of the gap on each side before it is cut:
 * "Gesundheit" and "Transporte" are a point or two wider than their column.
 */
export function CategoryRow({
  categories,
  chosen,
  onPick,
}: {
  readonly categories: readonly Category[];
  readonly chosen: string;
  readonly onPick: (id: string) => void;
}) {
  const { palette } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // The chosen tile lifts and rings itself: room above and below so neither is cut off.
      style={{ marginHorizontal: -16, marginBottom: -4, flexGrow: 0 }}
      contentContainerStyle={{ gap: GAP, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}
    >
      {categories.map((c) => {
        const on = c.id === chosen;
        return (
          <PressScale
            key={c.id}
            onPress={() => {
              haptics.tick();
              onPick(c.id);
            }}
            style={{ width: COLUMN, alignItems: 'center', gap: 6 }}
          >
            <View
              style={{
                borderRadius: 19,
                padding: 2,
                borderWidth: 2,
                borderColor: on ? palette.ink : 'transparent',
                transform: [{ translateY: on ? -2 : 0 }],
              }}
            >
              <CategoryTile
                icon={isSymbolName(c.icon) ? c.icon : 'payments'}
                hue={c.hue}
                size={48}
                radius={15}
                glyph={25}
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                ...body(11.5, on ? 650 : 500),
                color: palette.ink,
                maxWidth: COLUMN + GAP,
                marginHorizontal: -GAP / 2,
              }}
            >
              {c.name}
            </Text>
          </PressScale>
        );
      })}
    </ScrollView>
  );
}

/** The WORK stamp, inked at a tilt on a "Got paid" ticket from a sender whose money is work. */
export function WorkStamp({ label }: { readonly label: string }) {
  return (
    <View
      style={{
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderWidth: 2.5,
        borderColor: quickAddInk.workStamp,
        borderRadius: 5,
        opacity: 0.9,
        transform: [{ rotate: '-7deg' }],
      }}
    >
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
        style={{ ...mono(12, 600, 0.14), color: quickAddInk.workStamp }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * The WORK stamp on a "Got paid" ticket for someone with work on: offered dashed or inked as the
 * bank and the sender say, one tap to ink or lift it (stamp-in, light haptic).
 */
export function TicketWorkStamp({
  inked,
  onToggle,
}: {
  readonly inked: boolean;
  readonly onToggle: () => void;
}) {
  const { t } = useI18n();
  return (
    <WorkMark
      face={inked ? 'always' : 'sometimes'}
      labels={{ inked: t('work.stamp'), offered: t('work.stampOffered') }}
      accessibilityLabel={t('work.stamp')}
      onPress={() => {
        haptics.tap();
        onToggle();
      }}
    />
  );
}
