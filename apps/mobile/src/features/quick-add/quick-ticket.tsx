import { Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { MoneyParts } from '@6pm/domain';
import { moneyInInk } from '@6pm/theme';

import { CategoryTile } from '../../ui/category-tile';
import { ChoiceMenu, type MenuChoice } from '../../ui/primitives/choice-menu';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { DashedRule } from '../../ui/dashed-rule';
import { FitWidth } from '../../ui/layout/fit-width';
import { PaperEdge } from '../../ui/paper-edge';
import { useTheme } from '../../ui/theme/theme';
import { body, display, leading, mono, tabular } from '../../ui/type/fonts';
import { AmountText } from './amount-text';

const PAPER = '#fbf7ef';
const INK = '#231a24';
const SOFT = 'rgba(35,26,36,.5)';

/**
 * The ticket at the top of Quick add: a little receipt being written as you type — number and
 * time, the amount, what it was, and its category and wallet.
 */
export function QuickTicket({
  heading,
  stamp,
  amount,
  typed,
  hint,
  note,
  placeholder,
  onNote,
  icon,
  hue,
  categoryLine,
  incoming = false,
  mark = null,
  lineMenu,
}: {
  readonly heading: string;
  readonly stamp: string;
  readonly amount: number;
  /** The amount as typed: "45.000₫", "$12.5", or abroad "฿640" with home in the hint. */
  readonly typed: MoneyParts;
  readonly hint: string;
  readonly note: string;
  readonly placeholder: string;
  readonly onNote: (text: string) => void;
  readonly icon: SymbolName;
  readonly hue: number;
  readonly categoryLine: string;
  /** Money said to have come in: the amount prints green, with its "+". */
  readonly incoming?: boolean;
  /** A spend from a jar: the hint's mark, in the jar's colour. */
  readonly mark?: string | null;
  /** The category line opens this menu (which wallet paid). */
  readonly lineMenu?: {
    readonly label: string;
    readonly choices: readonly MenuChoice[];
    readonly selected: string;
    readonly onSelect: (key: string) => void;
  };
}) {
  const { palette } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(50).duration(450)} style={{ marginHorizontal: 4 }}>
      <View style={{ transform: [{ scaleY: -1 }] }}>
        <PaperEdge color={PAPER} />
      </View>
      <View
        style={{
          // The paper casts the shadow, not its torn edges, which would show it between the teeth.
          boxShadow: '0 16px 24px rgba(20,10,30,.22)',
          backgroundColor: PAPER,
          paddingTop: 8,
          paddingHorizontal: 18,
          paddingBottom: 12,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ ...mono(10.5, 400, 0.14), color: SOFT, textTransform: 'uppercase' }}>
            {heading}
          </Text>
          <Text style={{ ...mono(10.5, 400, 0.14), color: SOFT, textTransform: 'uppercase' }}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 16 }}>
            {mark ? (
              <View
                style={{
                  width: 10,
                  height: 13,
                  borderTopLeftRadius: 3,
                  borderTopRightRadius: 3,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  backgroundColor: mark,
                }}
              />
            ) : null}
            <Text style={{ ...mono(11.5), color: 'rgba(35,26,36,.55)' }}>{hint}</Text>
          </View>
        </View>
        <DashedRule color="rgba(35,26,36,.18)" width={1.5} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 }}>
          <CategoryTile icon={icon} hue={hue} size={42} radius={14} glyph={23} />
          <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
            <TextInput
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
                <Text numberOfLines={1} style={{ ...body(12.5), color: 'rgba(35,26,36,.55)' }}>
                  {categoryLine}
                </Text>
              </ChoiceMenu>
            ) : (
              <Text numberOfLines={1} style={{ ...body(12.5), color: 'rgba(35,26,36,.55)' }}>
                {categoryLine}
              </Text>
            )}
          </View>
        </View>
      </View>
      <PaperEdge color={PAPER} />
    </Animated.View>
  );
}
