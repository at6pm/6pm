import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

// Plain and exact: what runs where and what leaves the phone. "IA" for AI, as Spanish iOS writes it.
export const esPrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': '¿Dónde debería pensar 6pm?',
  'privacy.ai.sub':
    'Dónde se preparan tus respuestas y las frases de tu compañero. Puedes cambiarlo cuando quieras en Ajustes.',
  'privacy.ai.server.title': 'En nuestro servidor, con Claude',
  'privacy.ai.server.text':
    'Las respuestas más finas y una voz que entiende bien el vietnamita. Solo sale de tu teléfono una pregunta o unos pocos datos, nunca tu lista de gastos.',
  'privacy.ai.server.tag': 'Recomendado',
  'privacy.ai.device.title': 'Solo en este iPhone',
  'privacy.ai.device.text':
    'Nada de IA sale de tu teléfono. Se descarga un modelo una sola vez, por Wi‑Fi.',
  'privacy.ai.device.unavailable': 'Este iPhone no tiene memoria para un modelo propio.',
  'privacy.ai.models': 'Modelo',
  'privacy.model.fast': 'El más rápido y ligero',
  'privacy.model.words': 'Mejor redacción',
  'privacy.model.reading': 'Mejor con preguntas',
  'privacy.model.size': '{size} GB',
  'privacy.model.download': 'Descargar',
  'privacy.model.downloading': '{percent}%',
  'privacy.model.verifying': 'Comprobando',
  'privacy.model.ready': 'Listo',
  'privacy.model.failed': 'Reintentar',
  'privacy.model.delete': 'Eliminar',
  'privacy.model.later': 'Puedes seguir mientras se descarga.',
  'settings.ai': 'IA',
  'settings.ai.server': 'En nuestro servidor',
  'settings.ai.device': 'En este iPhone',
  'privacy.leaves.title': 'Qué sale de tu teléfono',
  'privacy.leaves.server.ask':
    'Una pregunta, con los nombres de tus categorías y huchas, para entenderla',
  'privacy.leaves.server.lines': 'Los pocos datos de una frase del compañero',
  'privacy.leaves.server.receipts': 'Una foto de ticket que tu teléfono no pueda leer',
  'privacy.leaves.server.voice': 'Tu voz mientras hablas, para pasarla a texto',
  'privacy.leaves.device.none': 'Nada de IA. Todo se calcula en este iPhone.',
  'privacy.leaves.device.network':
    'Los tipos de cambio (solo una fecha), las actualizaciones de la app y las compras siguen usando internet.',
  'privacy.leaves.device.emails': 'El correo de recibos está desactivado en este modo.',
};
