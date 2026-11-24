import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const deMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': 'Max an Freunde verschenken',
  'maxCodes.give.sub': 'Link zu einem Max-Angebot senden',
  'maxCodes.give.message':
    '6pm sagt mir, wie viel ich heute ausgeben kann, und erfasst meine Ausgaben von selbst. Hier ist ein 6pm-Max-Angebot für dich: {url}',
  'maxCodes.give.failed': 'Teilen ließ sich nicht öffnen. Versuch es noch mal.',
  'maxCodes.redeem': 'Code einlösen',
  'maxCodes.head.friend': 'Ein Freund schenkt dir Max.',
  'maxCodes.head.code': 'Dein Max-Angebot.',
  'maxCodes.playHint':
    'Tippe bei Google Play auf die Zahlungsmethode und dann auf „Code einlösen“.',
  'maxCodes.playHint.code':
    'Code {code} kopiert. Tippe bei Google Play auf die Zahlungsmethode und dann auf „Code einlösen“.',
};
