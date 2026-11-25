import type { LiveLines } from './live-lines';

export const liveLinesFr: LiveLines = {
  clock: (time, left) => `Il est ${time} chez toi · prochaine clôture dans ${left}`,
  closeNow: 'Il est 18 h. C’est l’heure de clôturer la journée.',
  duration: (h, m) => (h ? `${h}\u00a0h ${m}\u00a0min` : `${m}\u00a0min`),
  countdown: (d, h, m) => `${d}\u00a0j ${h}\u00a0h ${m}\u00a0min avant le lancement`,
  out: 'Disponible',
  sent: 'Tu es sur la liste. Rendez-vous à 18 h.',
  notAnEmail: 'Ça ne ressemble pas encore à un e-mail.',
  busy: 'Trop d’essais depuis ici. Attends une minute, puis réessaie.',
  unreachable: 'Impossible de joindre la liste. Vérifie ta connexion et réessaie.',
};
