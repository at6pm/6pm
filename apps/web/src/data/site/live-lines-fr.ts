import type { LiveLines } from './live-lines';

export const liveLinesFr: LiveLines = {
  clock: (time, left) => `Il est ${time} chez toi · prochaine clôture dans ${left}`,
  closeNow: 'Il est 18 h. C’est l’heure de clôturer la journée.',
  duration: (h, m) => (h ? `${h} h ${m} min` : `${m} min`),
  countdown: (d, h, m) => `${d} j ${h} h ${m} min avant le lancement`,
  out: 'Disponible',
  sent: 'Tu es sur la liste. Rendez-vous à 18 h.',
  notAnEmail: 'Ça ne ressemble pas encore à un e-mail.',
  busy: 'Trop d’essais depuis ici. Attends une minute, puis réessaie.',
  unreachable: 'Impossible de joindre la liste. Vérifie ta connexion et réessaie.',
};
