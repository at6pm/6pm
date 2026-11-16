import { useEffect, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { MoneyParts } from '@6pm/domain';
import { moneyInInk } from '@6pm/theme';

import { ChoiceMenu, type MenuChoice } from '../../ui/primitives/choice-menu';
import { DashedRule } from '../../ui/dashed-rule';
import { FitWidth } from '../../ui/layout/fit-width';
import { easeOut } from '../../ui/motion/curves';
import { PaperEdge } from '../../ui/paper-edge';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono, tabular } from '../../ui/type/fonts';
import { AmountText } from './amount-text';

export const TICKET_PAPER = '#fbf7ef';
const INK = '#231a24';
const SOFT = 'rgba(35,26,36,.5)';
const LINE = 'rgba(35,26,36,.55)';
/** The hint leaves as the first digit lands. */
const HINT_OUT_MS = 120;

/** The category line's menu: which wallet paid, or which the money came into. */
export interface TicketLineMenu {
  readonly label: string;
  readonly choices: readonly MenuChoice[];
  readonly selected: string;
  readonly onSelect: (key: string) => void;
}

/**
 * One face of the ticket at the top of Quick add: a little receipt being written as you type —
 * number and time on one line, the amount, a mono line under it, and what it was (or who it was
 * from) with its category or where it goes and the wallet.
 */
export function QuickTicket({
  heading,
  stamp,
  amount,
  typed,
  hint,
  line,
  note,
  placeholder,
  onNote,
  tile,
  categoryLine,
  incoming = false,
  badge = null,
  lineMenu,
  inputRef,
}: {
  /** The field the ticket's words are typed in, to focus it from outside. */
  readonly inputRef?: RefObject<ComponentRef<typeof TextInput> | null>;
  readonly heading: string;
  readonly stamp: string;
  readonly amount: number;
  /** The amount as typed: "45.000₫", "$12.5", or abroad "฿640" with home in the line. */
  readonly typed: MoneyParts;
  /** Under the amount while nothing is typed; it fades as the first digit lands. */
  readonly hint: string;
  /** Under the amount once something is typed. */
  readonly line: string;
  readonly note: string;
  readonly placeholder: string;
  readonly onNote: (text: string) => void;
  /** The category's tile, or the sender's avatar. */
  readonly tile: ReactNode;
  readonly categoryLine: string;
  /** Money in: the amount prints green, with its "+". */
  readonly incoming?: boolean;
  /** Inked at the right of the bottom row (the WORK stamp). */
  readonly badge?: ReactNode;
  readonly lineMenu?: TicketLineMenu;
}) {
  const { palette } = useTheme();
  const typing = amount > 0;
  const hinted = useSharedValue(typing ? 0 : 1);
  useEffect(() => {
    hinted.set(
      withTiming(typing ? 0 : 1, {
        duration: HINT_OUT_MS,
        easing: easeOut,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [typing, hinted]);
  const hintStyle = useAnimatedStyle(() => ({ opacity: hinted.get() }));
  const sub = (
    <Text numberOfLines={1} style={{ ...body(12.5), color: LINE }}>
      {categoryLine}
    </Text>
  );
  const mono11 = { ...mono(11.5), color: LINE, textAlign: 'center' as const };

  return (
    <View>
      <View style={{ transform: [{ scaleY: -1 }] }}>
        <PaperEdge color={TICKET_PAPER} />
      </View>
      <View
        style={{
          // The paper casts the shadow, not its torn edges, which would show it between the teeth.
          boxShadow: '0 16px 24px rgba(20,10,30,.22)',
          backgroundColor: TICKET_PAPER,
          paddingTop: 8,
          paddingHorizontal: 18,
          paddingBottom: 12,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Text
            numberOfLines={1}
            style={{
              ...mono(10.5, 400, 0.14),
              color: SOFT,
              textTransform: 'uppercase',
              flexShrink: 1,
            }}
          >
            {heading}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...mono(10.5, 400, 0.14),
              color: SOFT,
              textTransform: 'uppercase',
              flexShrink: 0,
              textAlign: 'right',
            }}
          >
            {stamp}
          </Text>
        </View>
        <View style={{ alignItems: 'center', gap: 3, paddingVertical: 2 }}>
          <FitWidth height={60} align="center">
            <AmountText
              parts={typed}
              numberOfLines={1}
              style={{
                ...leading(display(60 * palette.numK, 500, -0.02), 60, true),
                ...tabular,
                color: incoming ? moneyInInk.paper : INK,
                opacity: amount > 0 ? 1 : 0.35,
              }}
            />
          </FitWidth>
          {/* The hint and the line share one row of one line, so typing never moves the sheet. */}
          <View style={{ alignSelf: 'stretch', minHeight: 16, justifyContent: 'center' }}>
            <Text numberOfLines={1} style={{ ...mono11, opacity: typing ? 1 : 0 }}>
              {line}
            </Text>
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', left: 0, right: 0 }, hintStyle]}
            >
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={mono11}>
                {hint}
              </Text>
            </Animated.View>
          </View>
        </View>
        <DashedRule color="rgba(35,26,36,.18)" width={1.5} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 }}>
          {tile}
          <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
            <TextInput
              ref={inputRef}
              value={note}
              onChangeText={onNote}
              placeholder={placeholder}
              placeholderTextColor="rgba(35,26,36,.35)"
              returnKeyType="done"
              style={{ fontSize: 17, fontWeight: '600', color: INK, padding: 0 }}
            />
            {lineMenu ? (
              <ChoiceMenu
                label={lineMenu.label}
                choices={lineMenu.choices}
                selected={lineMenu.selected}
                onSelect={lineMenu.onSelect}
              >
                {sub}
              </ChoiceMenu>
            ) : (
              sub
            )}
          </View>
          {badge}
        </View>
      </View>
      <PaperEdge color={TICKET_PAPER} />
    </View>
  );
}
