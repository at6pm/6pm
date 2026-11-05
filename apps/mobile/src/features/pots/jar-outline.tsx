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
