import type { LiveLines } from './live-lines';

export const liveLinesEs: LiveLines = {
  clock: (time, left) => `Donde estás son las ${time} · próximo cierre en ${left}`,
  closeNow: 'Son las seis. Toca cerrar el día.',
  duration: (h, m) => (h ? `${h} h ${m} min` : `${m} min`),
  countdown: (d, h, m) => `${d} d ${h} h ${m} min para el lanzamiento`,
  out: 'Ya disponible',
  sent: 'Ya estás en la lista. Nos vemos a las seis.',
  notAnEmail: 'Eso todavía no parece un correo.',
  busy: 'Demasiados intentos desde aquí. Espera un minuto y vuelve a probar.',
  unreachable: 'No se pudo conectar con la lista. Revisa tu conexión y vuelve a probar.',
};
