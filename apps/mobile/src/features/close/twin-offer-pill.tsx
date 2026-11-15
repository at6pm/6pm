import { Text, View } from 'react-native';

import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

/**
 * "Same as your 50k at 10:30? · Same" in the hint's place over the cards, with No beside it:
 * the glass pill the close already uses for its offers, and a quieter one to say no.
 */
export function TwinOfferPill({
  text,
  same,
  no,
  onSame,
  onNo,
}: {
  readonly text: string;
  readonly same: string;
  readonly no: string;
  readonly onSame: () => void;
  readonly onNo: () => void;
}) {
  const { palette } = useTheme();
  const pill = {
    height: 32,
    borderRadius: 99,
    backgroundColor: palette.glass,
    boxShadow: palette.glassShadow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as const;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '100%' }}>
      <PressScale
        hitSlop={6}
        accessibilityRole="button"
        onPress={() => {
          haptics.tap();
          onSame();
        }}
        style={{ ...pill, paddingLeft: 9, paddingRight: 13, flexShrink: 1 }}
      >
        <Symbol name="link" size={18} color={palette.ink} />
        <Text numberOfLines={1} style={{ ...body(14, 600), color: palette.ink, flexShrink: 1 }}>
          {text}
        </Text>
        <Text style={{ ...body(14, 500), color: palette.ink, opacity: 0.55 }}>· {same}</Text>
      </PressScale>
      <PressScale
        hitSlop={6}
        accessibilityRole="button"
        onPress={onNo}
        style={{ ...pill, paddingHorizontal: 12 }}
      >
        <Text style={{ ...body(14, 600), color: palette.inkSoft }}>{no}</Text>
      </PressScale>
    </View>
  );
}
