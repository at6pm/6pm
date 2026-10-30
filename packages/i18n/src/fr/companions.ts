import type { Entry } from '../catalogue-types';
import type { enCompanions } from '../en-companions';

// The four Vietnamese names stay Vietnamese.
export const frCompanions: { readonly [Key in keyof typeof enCompanions]: Entry } = {
  'companions.name.sun': 'Couchant',
  'companions.name.max': 'Soleil de minuit',
  'companions.name.nhang': 'Nhang',
  'companions.name.banhbao': 'Bánh Bao',
  'companions.name.giot': 'Giọt',
  'companions.name.hac': 'Hạc Giấy',
  'companions.line.sun': 'Chaleureux et fidèle. Se couche avec toi à 18 h.',
  'companions.line.max': 'Le soleil après la nuit tombée, avec un anneau et deux lunes.',
  'companions.line.nhang': 'Calme, un peu sage, jamais pressé.',
  'companions.line.banhbao': 'Douillet, tout moelleux, pense toujours au dîner.',
  'companions.line.giot': 'Espiègle et gigotant. Éclabousse quand il est content.',
  'companions.line.hac': 'Élégant et discrètement fier. Plié avec soin.',
  'companions.max': 'MAX',
  'companions.locked': '{name}, inclus avec Max',
  'companions.icon': 'L’icône suit mon compagnon',
  'companions.iconSub': 'Ton écran d’accueil montre qui tu as choisi.',
};
