import { useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { canRemoveJarMove, foldRuns } from '@6pm/domain';

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
/** An opened run's lines print down 40 ms apart; its chevron turns as it opens. */
const RUN_STAGGER_MS = 40;
const TURN_MS = 250;

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

/** Lines that say the same thing fold: paydays, or top-ups, of one amount in a row. */
function runKey(line: JarHistoryEntry): string | null {
  return line.kind === 'payday' || line.kind === 'topUp' ? `${line.kind}:${line.amount}` : null;
}

/**
 * The jar's moves, newest first: a green dot for money in (paydays, top-ups, money already saved,
 * the start), a warm dot and warm amount for a spend taken from it. Paydays (or top-ups) of the
 * same amount in a row fold into one line ("Payday ×5"), which a tap opens in place. Every line
 * but a payday's swipes away (M4, M13); the lines under it slide up to close the gap, and come
 * back the same way on undo.
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
  const { t } = useI18n();
  const { palette } = useTheme();
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  if (lines.length === 0) return null;
  const runs = foldRuns(lines, runKey);
  let n = 0;
  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: palette.cell,
        boxShadow: palette.cardShadow,
        overflow: 'hidden',
      }}
    >
      {runs.flatMap((run) => {
        const first = run.items[0];
        if (!first) return [];
        if (run.items.length === 1) {
          return [
            <MoveLine
              key={moveKey(first)}
              line={first}
              ruled={n++ > 0}
              format={format}
              byChoice={byChoice}
              categoryName={categoryName}
              onRemove={onRemove}
            />,
          ];
        }
        const last = run.items[run.items.length - 1] ?? first;
        const key = `run:${moveKey(first)}`;
        const opened = open.has(key);
        const toggle = () =>
          setOpen((was) => {
            const next = new Set(was);
            if (opened) next.delete(key);
            else next.add(key);
            return next;
          });
        const what = t(first.kind === 'payday' ? 'pots.move.paydayRun' : 'pots.move.topUpRun', {
          count: run.items.length,
        });
        const when = t('pots.move.runSpan', {
          amount: format.money.short(first.amount),
          from: format.date(last.day),
          to: format.date(first.day),
        });
        const amount = `+${format.money.short(run.total)}`;
        return [
          <Animated.View key={key} layout={settle} entering={FadeIn.duration(200)}>
            <PressScale
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityState={{ expanded: opened }}
              accessibilityLabel={`${what}, ${when}, ${amount}`}
              onPress={toggle}
            >
              <MoveFace
                dot={MOVE_IN}
                what={what}
                when={when}
                amount={amount}
                amountInk={palette.ink}
                ruled={n++ > 0}
                folded={opened ? 'open' : 'shut'}
              />
            </PressScale>
          </Animated.View>,
          ...(opened
            ? run.items.map((line, i) => (
                <Animated.View
                  key={moveKey(line)}
                  layout={settle}
                  entering={FadeInUp.duration(200).delay(i * RUN_STAGGER_MS)}
                >
                  <MoveLine
                    line={line}
                    ruled
                    format={format}
                    byChoice={byChoice}
                    categoryName={categoryName}
                    onRemove={onRemove}
                    inset
                  />
                </Animated.View>
              ))
            : []),
        ];
      })}
    </View>
  );
}

/** One line of the jar's moves, removable where the jar allows it. */
function MoveLine({
  line,
  ruled,
  format,
  byChoice,
  categoryName,
  onRemove,
  inset = false,
}: {
  readonly line: JarHistoryEntry;
  readonly ruled: boolean;
  readonly format: JarFormat;
  readonly byChoice: boolean;
  readonly categoryName: (id: string) => string;
  readonly onRemove: (line: JarHistoryEntry) => void;
  /** A line of an opened run, set in under it. */
  readonly inset?: boolean;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
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
  const amount = line.amount > 0 ? `${out ? '−' : '+'}${format.money.short(line.amount)}` : '';
  const face = (
    <MoveFace
      dot={out ? palette.accent : line.kind === 'started' ? alpha(palette.ink, 0.5) : MOVE_IN}
      what={what}
      when={when}
      amount={amount}
      amountInk={out ? MOVE_OUT_TEXT : palette.ink}
      ruled={ruled}
      inset={inset}
    />
  );
  const key = moveKey(line);
  const body = canRemoveJarMove(line) ? (
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
  );
  return inset ? (
    body
  ) : (
    <Animated.View layout={settle} entering={FadeIn.duration(200)}>
      {body}
    </Animated.View>
  );
}

/** How a line of the jar's moves looks: its dot, what and when, and the amount. */
function MoveFace({
  dot,
  what,
  when,
  amount,
  amountInk,
  ruled,
  inset = false,
  folded,
}: {
  readonly dot: string;
  readonly what: string;
  readonly when: string;
  readonly amount: string;
  readonly amountInk: string;
  /** A hairline above it: every line but the first. */
  readonly ruled: boolean;
  readonly inset?: boolean;
  /** A folded run's chevron, turned as it opens. */
  readonly folded?: 'open' | 'shut';
}) {
  const { palette } = useTheme();
  const turn = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(folded === 'open' ? '180deg' : '0deg', { duration: TURN_MS }) },
    ],
  }));
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: inset ? 34 : 14,
        paddingRight: 14,
      }}
    >
      <View
        style={{
          width: inset ? 6 : 8,
          height: inset ? 6 : 8,
          borderRadius: 4,
          backgroundColor: dot,
          opacity: inset ? 0.6 : 1,
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: inset ? 9 : 11,
          borderTopWidth: ruled ? 0.5 : 0,
          borderTopColor: palette.hair,
        }}
      >
        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text numberOfLines={1} style={{ ...body(inset ? 14 : 15), color: palette.ink }}>
              {what}
            </Text>
            {folded ? (
              <Animated.View style={turn}>
                <Symbol name="expand_more" size={18} color={alpha(palette.ink, 0.6)} />
              </Animated.View>
            ) : null}
          </View>
          <Text style={{ ...body(12), color: alpha(palette.ink, 0.6) }}>{when}</Text>
        </View>
        <Text style={{ ...body(inset ? 14 : 15, 650), ...tabular, color: amountInk }}>
          {amount}
        </Text>
      </View>
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
