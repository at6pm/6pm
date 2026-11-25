// Translation pending: English text.
import type { LiveLines } from './live-lines';

export const liveLinesZhHans: LiveLines = {
  clock: (time, left) => `${time} where you are · next close in ${left}`,
  closeNow: 'It’s six. Time to close the day.',
  duration: (h, m) => (h ? `${h}h ${m}m` : `${m}m`),
  countdown: (d, h, m) => `${d}d ${h}h ${m}m to launch`,
  out: 'Out now',
  sent: 'You’re on the list. See you at six.',
  notAnEmail: 'That doesn’t look like an email yet.',
  busy: 'Too many tries from here. Give it a minute, then try again.',
  unreachable: 'Couldn’t reach the list. Check your connection and try again.',
};
