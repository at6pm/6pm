import { Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { canRemoveJarMove } from '@6pm/domain';

import type { SymbolName } from '../../ui/icons/symbols.generated';
import type { JarHistoryEntry } from '../../data/jar-history';
import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body, tabular } from '../../ui/type/fonts';
import { alpha, MOVE_IN, MOVE_OUT_TEXT } from './jar-colours';
import { JarMoveRow } from './jar-move-row';
import type { JarFormat } from './jar-words';

/** The lines under a removed one close the gap in 250 ms. */
const settle = LinearTransition.duration(250);

export interface JarAction {
  readonly icon: SymbolName;
  readonly label: string;
  readonly onPress: () => void;
  readonly primary?: boolean;
}

/** Add / Spend from it / Edit: three tiles in a row, the first light. */
export function JarActions({ actions }: { readonly actions: readonly JarAction[] }) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {actions.map((a) => (
        <PressScale
          key={a.label}
          accessibilityRole="button"
          onPress={a.onPress}
          style={{
            flex: 1,
            height: 64,
            borderRadius: 20,
            backgroundColor: a.primary ? palette.btnBg : palette.glass,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Symbol name={a.icon} size={22} color={a.primary ? palette.btnFg : palette.ink} />
          <Text
            numberOfLines={1}
            style={{ ...body(13, 650), color: a.primary ? palette.btnFg : palette.ink }}
          >
            {a.label}
          </Text>
        </PressScale>
      ))}
    </View>
  );
}

/** The pill an edge state offers (Resume, Keep filling, Fill again, Put away). */
export function StatePill({
  label,
  onPress,
}: {
  readonly label: string;
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <PressScale
      accessibilityRole="button"
      onPress={onPress}
      style={{
        height: 30,
        paddingHorizontal: 12,
        borderRadius: 99,
        backgroundColor: palette.chipBg,
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <Text style={{ ...body(12.5, 650), color: palette.ink }}>{label}</Text>
    </PressScale>
  );
}

/**
 * The jar's moves, newest first: a green dot for money in (paydays, top-ups, money already saved,
 * the start), a warm dot and warm amount for a spend taken from it. Every line but a payday's
 * swipes away (M4, M13); the lines under it slide up to close the gap, and come back the same way
 * on undo.
 */
export function JarMoves({
  lines,
  format,
  byChoice,
  categoryName,
  onRemove,
}: {
  readonly lines: readonly JarHistoryEntry[];
  readonly format: JarFormat;
  /** Spends from this jar are only ever by choice (Future you, a jar with no date). */
  readonly byChoice: boolean;
  readonly categoryName: (id: string) => string;
  readonly onRemove: (line: JarHistoryEntry) => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  if (lines.length === 0) return null;
  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        overflow: 'hidden',
      }}
    >
      {lines.map((line, n) => {
        const out = line.kind === 'spent';
        const what =
          line.kind === 'payday'
            ? t('pots.move.payday')
            : line.kind === 'topUp'
              ? t('pots.move.topUp')
              : line.kind === 'alreadySaved'
                ? t('pots.move.alreadySaved')
                : line.kind === 'started'
                  ? t('pots.move.started')
                  : (line.merchant ?? categoryName(line.categoryId));
        const day = format.day(line.day);
        const when = out && byChoice ? t('pots.move.byChoice', { date: day }) : day;
        const amount =
          line.amount > 0 ? `${out ? '−' : '+'}${format.money.short(line.amount)}` : '';
        const face = (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14 }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: out
                  ? palette.accent
                  : line.kind === 'started'
                    ? alpha(palette.ink, 0.5)
                    : MOVE_IN,
              }}
            />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 11,
                borderTopWidth: n === 0 ? 0 : 0.5,
                borderTopColor: palette.hair,
              }}
            >
              <View style={{ flex: 1, gap: 1 }}>
                <Text numberOfLines={1} style={{ ...body(15), color: palette.ink }}>
                  {what}
                </Text>
                <Text style={{ ...body(12), color: alpha(palette.ink, 0.6) }}>{when}</Text>
              </View>
              <Text
                style={{
                  ...body(15, 650),
                  ...tabular,
                  color: out ? MOVE_OUT_TEXT : palette.ink,
                }}
              >
                {amount}
              </Text>
            </View>
          </View>
        );
        const key = moveKey(line);
        return (
          <Animated.View key={key} layout={settle} entering={FadeIn.duration(200)}>
            {canRemoveJarMove(line) ? (
              <JarMoveRow
                id={key}
                label={`${what}, ${when}, ${amount}`}
                removeLabel={t('pots.move.remove')}
                onRemove={() => onRemove(line)}
              >
                {face}
              </JarMoveRow>
            ) : (
              face
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

/** A line's own key, the same before and after a removal, so the rest slide instead of redraw. */
function moveKey(line: JarHistoryEntry): string {
  switch (line.kind) {
    case 'topUp':
      return `topUp:${line.moveId}`;
    case 'alreadySaved':
      return `alreadySaved:${line.moveId}`;
    case 'spent':
      return `spent:${line.spendId}`;
    case 'started':
      return 'started';
    case 'payday':
      return `payday:${line.day}`;
  }
}
