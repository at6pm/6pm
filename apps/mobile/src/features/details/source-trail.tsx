import { Text, View } from 'react-native';

import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { body } from '../../ui/type/fonts';

/** Something to do about where a spend came from: "These are two", "This is wrong". */
export interface TrailAction {
  readonly label: string;
  readonly onPress: () => void;
}

/**
 * Where a spend came from, one dotted line per sighting, and under them, each on its own row
 * across a hairline, what can be done about it.
 */
export function SourceTrail({
  title,
  lines,
  actions = [],
}: {
  readonly title: string;
  readonly lines: readonly string[];
  readonly actions?: readonly TrailAction[];
}) {
  const { palette } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          ...body(13, 600, 0.04),
          textTransform: 'uppercase',
          color: palette.inkSoft,
          paddingHorizontal: 6,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          borderRadius: 26,
          backgroundColor: palette.cell,
          boxShadow: palette.cardShadow,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 10,
        }}
      >
        {lines.map((line) => (
          <View key={line} style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginTop: 6,
                backgroundColor: palette.accent,
              }}
            />
            <Text style={{ ...body(14), lineHeight: 19.6, color: palette.ink, flex: 1 }}>
              {line}
            </Text>
          </View>
        ))}
        {actions.map((action) => (
          <PressScale
            key={action.label}
            scaleTo={0.97}
            accessibilityRole="button"
            onPress={action.onPress}
            style={{
              marginHorizontal: -16,
              paddingHorizontal: 16,
              paddingTop: 12,
              marginBottom: -4,
              borderTopWidth: 0.5,
              borderTopColor: palette.hair,
            }}
          >
            <Text style={{ ...body(15, 600), color: palette.accent }}>{action.label}</Text>
          </PressScale>
        ))}
      </View>
    </View>
  );
}
