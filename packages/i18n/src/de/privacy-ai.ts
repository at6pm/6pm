import type { Entry } from '../catalogue-types';
import type { enPrivacyAi } from '../en-privacy-ai';

// AI is "KI" in German; Wi-Fi is "WLAN" as on the iPhone.
export const dePrivacyAi: { readonly [Key in keyof typeof enPrivacyAi]: Entry } = {
  'privacy.ai.title': 'Wo soll 6pm denken?',
  'privacy.ai.sub':
    'Wo deine Fragen und die Sprüche deines Begleiters entstehen. Jederzeit in den Einstellungen änderbar.',
  'privacy.ai.server.title': 'Auf unserem Server, mit Claude',
  'privacy.ai.server.text':
    'Die schärfsten Antworten und eine Spracheingabe, die Vietnamesisch richtig versteht. Nur eine Frage oder ein paar Fakten verlassen dein Handy, nie deine Liste der Ausgaben.',
  'privacy.ai.server.tag': 'Empfohlen',
  'privacy.ai.device.title': 'Nur auf diesem iPhone',
  'privacy.ai.device.text':
    'Nichts für die KI verlässt dein Handy. Ein Modell wird einmalig über WLAN geladen.',
  'privacy.ai.device.unavailable': 'Dieses iPhone hat nicht genug Speicher für ein eigenes Modell.',
  'privacy.ai.models': 'Modell',
  'privacy.model.fast': 'Am schnellsten und leichtesten',
  'privacy.model.words': 'Beste Formulierungen',
  'privacy.model.reading': 'Am besten bei Fragen',
  'privacy.model.size': '{size} GB',
  'privacy.model.download': 'Laden',
  'privacy.model.downloading': '{percent} %',
  'privacy.model.verifying': 'Wird geprüft',
  'privacy.model.ready': 'Bereit',
  'privacy.model.failed': 'Noch mal',
  'privacy.model.delete': 'Löschen',
  'privacy.model.later': 'Du kannst weitermachen, während es lädt.',
  'settings.ai': 'KI',
  'settings.ai.server': 'Auf unserem Server',
  'settings.ai.device': 'Auf diesem iPhone',
  'privacy.leaves.title': 'Was dein Handy verlässt',
  'privacy.leaves.server.ask':
    'Eine Frage, mit deinen Kategorie- und Spartopf-Namen, um sie zu verstehen',
  'privacy.leaves.server.lines': 'Die paar Fakten in einem Spruch deines Begleiters',
  'privacy.leaves.server.receipts': 'Ein Belegfoto, das dein Handy nicht lesen kann',
  'privacy.leaves.server.voice': 'Deine Stimme, während du sprichst, um sie in Text umzuwandeln',
  'privacy.leaves.device.none': 'Nichts für die KI. Alles wird auf diesem iPhone berechnet.',
  'privacy.leaves.device.network':
    'Wechselkurse (nur ein Datum), App-Updates und Käufe brauchen weiterhin Internet.',
  'privacy.leaves.device.emails': 'Beleg-E-Mails sind in diesem Modus aus.',
};
