import { gestures } from '@6pm/theme';

import { project } from '../../ui/motion/physics';

/**
 * Where a released top card goes: kept (right), edit (left), not mine (down), up (money that came
 * in, saved for Future you), or home.
 */
export type CardFling = 'kept' | 'edit' | 'notMine' | 'up' | null;

/**
 * Which way a released card was flung. The finger's speed is projected onto where it was dragged,
 * and only the axis it mostly travelled counts, so a mostly-downward drag that drifts right is
 * "not mine", never "keep". Upward goes nowhere unless the card can go `up`.
 */
export function cardFling(
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  threshold?: number,
  up = false,
): CardFling {
  'worklet';
  // Read here, not as a default parameter: a worklet captures only names its body uses.
  const reach = threshold ?? gestures.cardFling;
  const px = x + project(velocityX);
  const py = y + project(velocityY);
  if (Math.abs(px) >= Math.abs(py)) {
    if (px > reach) return 'kept';
    if (px < -reach) return 'edit';
    return null;
  }
  if (py > reach) return 'notMine';
  return up && py < -reach ? 'up' : null;
}
