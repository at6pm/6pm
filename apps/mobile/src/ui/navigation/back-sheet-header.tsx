import { Text, View } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { Symbol } from '../icons/symbol';
import { PressScale } from '../primitives/press-scale';
import { useTheme } from '../theme/theme';
import { body } from '../type/fonts';

/**
 * The prototype's sheet header with a back button: grabber, then "‹ Back" on the left, the title
 * in the middle and Done on the right (`App:864-871`). The sheet frame makes it draggable.
 *
 * The title is centred between two sides of one width, each at least as wide as Done. Where the
 * back label does not fit beside the title ("‹ Einstellungen" and "Bankmitteilungen"), the label
 * steps aside and the chevron stands alone, as an iOS navigation bar does; a title too long for
 * what the sides leave shrinks, then ends in an ellipsis. Nothing is measured: flexbox places it
 * all in one pass, so the header never draws twice.
 */
export function BackSheetHeader({
  title,
  backLabel,
  onBack,
  onDone,
}: {
  readonly title: string;
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly onDone: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const done = t('common.done');
  return (
    <View style={{ paddingTop: 8, paddingHorizontal: 14, paddingBottom: 6, gap: 6 }}>
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
      <View style={{ minHeight: 44, flexDirection: 'row' }}>
        <View style={{ flexGrow: 1 }}>
          {/* Done's width, unseen: it makes this side as wide as the other, whatever Back says. */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{ height: 0, overflow: 'hidden', paddingHorizontal: 4 }}
          >
            <Text style={body(17, 650)}>{done}</Text>
          </View>
          {/* One line tall and wrapping: a label with no room beside the chevron falls to a
              second line, which is cut off. */}
          <PressScale
            accessibilityRole="button"
            accessibilityLabel={backLabel}
            onPress={onBack}
            hitSlop={8}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              maxWidth: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <View style={{ height: '100%', justifyContent: 'center' }}>
              <Symbol
                name="chevron_left"
                size={26}
                color={palette.ink}
                style={{ marginLeft: -4 }}
              />
            </View>
            <Text numberOfLines={1} style={{ ...body(17, 500), color: palette.ink }}>
              {backLabel}
            </Text>
          </PressScale>
        </View>
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          style={{ ...body(17, 650), color: palette.ink, flexShrink: 1, alignSelf: 'center' }}
        >
          {title}
        </Text>
        <View style={{ flexGrow: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
          <PressScale
            accessibilityRole="button"
            onPress={onDone}
            hitSlop={8}
            style={{ paddingVertical: 8, paddingHorizontal: 4 }}
          >
            <Text style={{ ...body(17, 650), color: palette.ink }}>{done}</Text>
          </PressScale>
        </View>
      </View>
    </View>
  );
}
