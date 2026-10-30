/**
 * A CSS keyframe track as stops of [time, value], time from 0 to 1 through the loop. Before the
 * first stop and after the last the value holds.
 */
export type Track = readonly (readonly [number, number])[];

/**
 * A track's value at `t` (0–1), eased between each pair of stops the way CSS applies an
 * animation's timing function to every keyframe segment.
 */
export function keyframe(t: number, track: Track, ease: (x: number) => number): number {
  'worklet';
  const first = track[0];
  if (!first) return 0;
  if (t <= first[0]) return first[1];
  for (let i = 1; i < track.length; i++) {
    const to = track[i];
    const from = track[i - 1];
    if (!to || !from) break;
    if (t <= to[0]) {
      const span = to[0] - from[0];
      const u = span > 0 ? (t - from[0]) / span : 1;
      return from[1] + (to[1] - from[1]) * ease(u);
    }
  }
  return track[track.length - 1]?.[1] ?? first[1];
}
