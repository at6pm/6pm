import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { owedInk } from '@6pm/theme';

import { PaperEdge } from '../../ui/paper-edge';

/**
 * A slip of paper torn at both ends, as 4c, 8b and 8c print it: the receipt's torn edge top and
 * bottom (9 high, a tooth every 12), a little crooked, lifted off the sheet by its shadow so its
 * edges read on a sheet of nearly the same colour.
 */
export function TornSlip({
  color,
  tilt = 0,
  style,
  children,
}: {
  readonly color: string;
  /** Degrees: 4c lies at −0.8, 8c at −0.6, 8b straight. */
  readonly tilt?: number;
  readonly style?: ComponentProps<typeof View>['style'];
  readonly children: ReactNode;
}) {
  return (
    <View style={{ marginHorizontal: 6, transform: [{ rotate: `${tilt}deg` }] }}>
      <View style={{ transform: [{ scaleY: -1 }] }}>
        <PaperEdge color={color} height={9} step={12} shadow={false} />
      </View>
      <View
        style={[{ backgroundColor: color, boxShadow: `0 16px 24px ${owedInk.billShadow}` }, style]}
      >
        {children}
      </View>
      <PaperEdge color={color} height={9} step={12} />
    </View>
  );
}
