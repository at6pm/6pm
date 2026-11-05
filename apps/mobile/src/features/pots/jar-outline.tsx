import { useRouter } from 'expo-router';
import { Text, View, type DimensionValue, type TextStyle } from 'react-native';

import { useI18n } from '../../i18n/i18n';
import { haptics } from '../../ui/haptics';
import { Symbol } from '../../ui/icons/symbol';
import { PressScale } from '../../ui/primitives/press-scale';
import { useTheme } from '../../ui/theme/theme';
import { alpha } from './jar-colours';
import { jarGeometry } from './jar-geometry';
import { newJarRoute } from './pot-routes';

/**
 * A jar not made yet: the jar's lid and glass drawn as a dashed outline at a jar's size, a "+" in
 * it (the shelf's "+", in the shape of the jars beside it). Where it stands it starts a new jar.
 */
export function JarOutline({
  width,
  height,
  line,
  glyph,
}: {
  readonly width: number;
  readonly height: number;
  /** The dashed outline. */
  readonly line: string;
  /** The "+". */
  readonly glyph: string;
}) {
  const g = jarGeometry(width, height);
  return (
    <View style={{ width, height }}>
      <View
        style={{
          position: 'absolute',
          left: g.lidInset,
          right: g.lidInset,
          top: 0,
          height: g.lidH,
          borderRadius: Math.max(2, g.lidH / 2),
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: line,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: g.bodyInset,
          right: g.bodyInset,
          top: g.bodyTop,
          bottom: 0,
          borderTopLeftRadius: g.radiusTop,
          borderTopRightRadius: g.radiusTop,
          borderBottomLeftRadius: g.radiusBottom,
          borderBottomRightRadius: g.radiusBottom,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Symbol name="add" size={Math.round(g.icon * 1.15)} color={glyph} />
      </View>
    </View>
  );
}

/**
 * "New jar" where jars stand: the dashed jar at the jars' own size with "New jar" under it as
 * their names are (the shelf on Today, Plan's Pots panel), or beside it as a row of the Pots list.
 * It opens New jar, or the Max sheet once the free jars are used.
 */
export function NewJarItem({
  locked,
  jarWidth,
  jarHeight,
  width,
  gap,
  label,
  under,
  lineGap = 0,
  row = false,
}: {
  /** Past the free jars: the Max sheet opens instead. */
  readonly locked: boolean;
  readonly jarWidth: number;
  readonly jarHeight: number;
  /** The cell's width: the jars' cells beside it. */
  readonly width?: DimensionValue;
  /** Between the jar and its words. */
  readonly gap: number;
  /** "New jar", in the jars' name style. */
  readonly label: TextStyle;
  /** The jars' second line (what each holds): kept empty so "New jar" sits level with their names. */
  readonly under?: TextStyle;
  /** Between the two lines. */
  readonly lineGap?: number;
  /** A row of the Pots list: the words beside the jar, on the list's hairline. */
  readonly row?: boolean;
}) {
  const { palette } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const words = t('pots.shelf.new');
  const outline = (
    <JarOutline
      width={jarWidth}
      height={jarHeight}
      line={alpha(palette.ink, 0.28)}
      glyph={palette.inkSoft}
    />
  );
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={words}
      highlight={row}
      onPress={() => {
        haptics.tap();
        router.push(locked ? { pathname: '/max', params: { from: 'pots' } } : newJarRoute);
      }}
      style={
        row
          ? { flexDirection: 'row', alignItems: 'center', gap, paddingHorizontal: 14 }
          : { width, alignItems: 'center', gap }
      }
    >
      {outline}
      {row ? (
        <View
          style={{
            flex: 1,
            minWidth: 0,
            paddingVertical: 11,
            minHeight: jarHeight + 22,
            justifyContent: 'center',
            borderTopWidth: 0.5,
            borderTopColor: palette.hair,
          }}
        >
          <Text numberOfLines={1} style={{ ...label, color: palette.inkSoft }}>
            {words}
          </Text>
        </View>
      ) : (
        <View style={{ alignItems: 'center', alignSelf: 'stretch', gap: lineGap }}>
          <Text numberOfLines={1} style={{ ...label, color: palette.inkSoft, maxWidth: '100%' }}>
            {words}
          </Text>
          {under ? (
            <Text numberOfLines={1} style={{ ...under, color: 'transparent' }}>
              {' '}
            </Text>
          ) : null}
        </View>
      )}
    </PressScale>
  );
}

/**
 * A jar as a glyph, drawn in one colour at an icon's size (Quick add's "From a jar" switch): the
 * lid and the glass outlined, and, when `full`, the glass filled to two thirds.
 */
export function JarGlyph({
  size,
  color,
  full,
}: {
  /** The glyph's height; it is three quarters as wide. */
  readonly size: number;
  readonly color: string;
  readonly full: boolean;
}) {
  const width = Math.round(size * 0.78);
  const lid = Math.max(2, Math.round(size * 0.14));
  return (
    <View style={{ width, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: Math.round(width * 0.22),
          right: Math.round(width * 0.22),
          top: 0,
          height: lid,
          borderRadius: lid / 2,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: lid + 1,
          bottom: 0,
          borderRadius: Math.round(size * 0.24),
          borderWidth: 1.75,
          borderColor: color,
          overflow: 'hidden',
        }}
      >
        {full ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '62%',
              backgroundColor: color,
            }}
          />
        ) : null}
      </View>
    </View>
  );
}
