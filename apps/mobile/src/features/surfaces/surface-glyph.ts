import { symbolCodepoints, type SymbolName } from '../../ui/icons/symbols.generated';

/**
 * A Material Symbols glyph as the character the bundled font draws it with: the widgets set it in
 * the same font file, so Swift needs neither the icon names nor ligatures.
 */
export function glyphOf(name: SymbolName): string {
  return String.fromCodePoint(symbolCodepoints[name]);
}
