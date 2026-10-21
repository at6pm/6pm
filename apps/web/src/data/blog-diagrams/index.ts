import type { BlogLang } from '../blog-copy';
import type { Diagram } from './draw';
import { camera, privacy, sky, threads, vietqr, widgets } from './engineering';
import { capture, couple, email, formula, jars, leaks } from './money';

export { svg, type Diagram } from './draw';

/** Every diagram an article can place with `<!-- media: diagram-<name> -->`. */
export const diagrams = {
  'diagram-formula': formula,
  'diagram-capture': capture,
  'diagram-jars': jars,
  'diagram-leaks': leaks,
  'diagram-couple': couple,
  'diagram-email': email,
  'diagram-vietqr': vietqr,
  'diagram-camera': camera,
  'diagram-widgets': widgets,
  'diagram-threads': threads,
  'diagram-sky': sky,
  'diagram-privacy': privacy,
} as const satisfies Record<string, (lang: BlogLang) => Diagram>;

export type DiagramId = keyof typeof diagrams;
