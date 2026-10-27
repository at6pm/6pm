import { Text, View } from 'react-native';

import { moneyInInk } from '@6pm/theme';

import { Symbol } from '../../ui/icons/symbol';
import type { SymbolName } from '../../ui/icons/symbols.generated';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

/** Height of a button with its label under it: the 60 pt disc, a 7 pt gap, the 12 pt label. */
export const CARD_BUTTON_HEIGHT = 82;

/**
 * One of the round buttons under the cards: glass, the accent for Keep, or Future you's green for
 * money that came in.
 */
export function CloseCardButton({
  icon,
  label,
  primary,
  tone,
  onPress,
}: {
  readonly icon: SymbolName;
  readonly label: string;
  readonly primary: boolean;
  readonly tone?: 'futureYou';
  readonly onPress: () => void;
}) {
  const { palette } = useTheme();
  const green = tone === 'futureYou';
  return (
    <View style={{ alignItems: 'center', gap: 7 }}>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: green ? moneyInInk.futureYou : primary ? palette.accent : palette.glass,
          borderWidth: 0.5,
          borderColor: green
            ? 'rgba(255,255,255,.4)'
            : primary
              ? 'rgba(255,255,255,.45)'
              : palette.glassBorder,
          boxShadow: green
            ? `0 10px 26px ${moneyInInk.futureYouGlow}, inset 0 1px 0 rgba(255,255,255,.5)`
            : primary
              ? `0 10px 26px ${palette.accentGlow}, inset 0 1px 0 rgba(255,255,255,.5)`
              : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol
          name={icon}
          size={28}
          color={green ? moneyInInk.futureYouFg : primary ? palette.accentFg : palette.ink}
        />
      </PressScale>
      <Text style={{ ...body(12, 600), color: palette.inkSoft }}>{label}</Text>
    </View>
  );
}
