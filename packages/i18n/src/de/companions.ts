import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay; the two suns get German names.
export const deCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.title': 'Begleiter',
  'companions.intro':
    'Such dir aus, wer dir abends Gesellschaft leistet. Alle halten dasselbe Versprechen.',
  'companions.name.sun': 'Abendrot',
  'companions.name.max': 'Mitternachtssonne',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.gloss.sun': 'die untergehende Sonne',
  'companions.gloss.max': 'die Max-Sonne',
  'companions.gloss.nhang': 'Räucherstäbchen',
  'companions.gloss.banhbao': 'Dampfbrötchen',
  'companions.gloss.giot': 'Regentropfen',
  'companions.gloss.hac': 'Papierkranich',
  'companions.line.sun': 'Warm und beständig. Geht um sechs mit dir unter.',
  'companions.line.max': 'Die Sonne nach Einbruch der Nacht, mit Ring und zwei Monden.',
  'companions.line.nhang': 'Ruhig, ein bisschen weise, nie in Eile.',
  'companions.line.banhbao': 'Kuschelig, knautschig, denkt immer ans Abendessen.',
  'companions.line.giot': 'Frech und wackelig. Spritzt, wenn er sich freut.',
  'companions.line.hac': 'Elegant und still stolz. Mit Sorgfalt gefaltet.',
  'companions.wearing': 'Bei dir',
  'companions.max': 'MAX',
  'companions.locked': '{name}, mit Max',
  'companions.icon': 'App-Symbol folgt meinem Begleiter',
  'companions.iconSub': 'Dein Home-Bildschirm zeigt, wen du gewählt hast.',
};
