import type { SurfaceLook } from '@6pm/domain';
import { widgetInks } from '@6pm/theme';

import type { WidgetLook } from './surface-palette';

/**
 * The look's widget materials, as the App Group carries them: its sun for each part of the day,
 * its jars, its dots and its type ("6pm Widgets in Looks"). The sky itself comes hour by hour
 * from the palettes.
 */
export function surfaceLook(look: WidgetLook): SurfaceLook {
  const ink = widgetInks[look.look];
  return {
    id: look.look,
    ...ink,
    suns: { ...ink.suns },
    frame: [...ink.frame],
    dots: { ...ink.dots },
    jar: { ...ink.jar, fills: [...ink.jar.fills] },
    numberShadows: [...ink.numberShadows],
    numberGlow: [...ink.numberGlow],
  } as SurfaceLook;
}
