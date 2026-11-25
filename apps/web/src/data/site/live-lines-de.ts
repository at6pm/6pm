import type { LiveLines } from './live-lines';

export const liveLinesDe: LiveLines = {
  clock: (time, left) => `Bei dir ist es ${time} · nächster Abschluss in ${left}`,
  closeNow: 'Es ist sechs. Zeit, den Tag abzuschließen.',
  duration: (h, m) => (h ? `${h} Std. ${m} Min.` : `${m} Min.`),
  countdown: (d, h, m) => `Noch ${d} T. ${h} Std. ${m} Min. bis zum Start`,
  out: 'Jetzt da',
  sent: 'Du stehst auf der Liste. Wir sehen uns um sechs.',
  notAnEmail: 'Das sieht noch nicht nach einer E-Mail aus.',
  busy: 'Zu viele Versuche von hier. Warte eine Minute und versuch es dann noch mal.',
  unreachable:
    'Die Liste ist gerade nicht erreichbar. Prüf deine Verbindung und versuch es noch mal.',
};
