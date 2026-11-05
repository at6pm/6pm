import { View } from 'react-native';

import { Symbol } from '../../ui/icons/symbol';
import { jarGeometry } from './jar-geometry';

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
