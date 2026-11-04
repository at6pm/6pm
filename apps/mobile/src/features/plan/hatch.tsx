import { View } from 'react-native';

/**
 * Diagonal stripes filling their parent, as the canvas's `repeating-linear-gradient(135deg, a 0
 * w, b w 2w)`: bands `width` wide, alternating, running from bottom left to top right. `reach`
 * is at least the longer side of what it fills.
 */
export function Hatch({
  a,
  b,
  width,
  reach,
}: {
  readonly a: string;
  readonly b: string;
  readonly width: number;
  readonly reach: number;
}) {
  const side = Math.ceil(reach * 2);
  const bands = Math.ceil(side / width);
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          left: -reach / 2,
          top: -reach / 2,
          width: side,
          height: side,
          flexDirection: 'row',
          transform: [{ rotate: '45deg' }],
        }}
      >
        {Array.from({ length: bands }, (_, i) => (
          <View key={i} style={{ width, height: side, backgroundColor: i % 2 === 0 ? a : b }} />
        ))}
      </View>
    </View>
  );
}

/** Ruled paper: a hairline every `every` points, from the top. */
export function Rules({
  color,
  every,
  reach,
}: {
  readonly color: string;
  readonly every: number;
  readonly reach: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      {Array.from({ length: Math.ceil(reach / every) }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: i * every + every - 1,
            height: 1,
            backgroundColor: color,
          }}
        />
      ))}
    </View>
  );
}
