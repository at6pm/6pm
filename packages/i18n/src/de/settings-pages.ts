import type { Entry } from '../catalogue-types';
import type { enSettingsPages } from '../en-settings-pages';

export const deSettingsPages: { readonly [Key in keyof typeof enSettingsPages]: Entry } = {
  'catch.health.total': '{count} erfasst · 14 Tage',
  'catch.health.axisToday': 'HEUTE',
  'catch.health.quietCheck': {
    one: 'Still seit {count} Tag · tippen zum Prüfen',
    other: 'Still seit {count} Tagen · tippen zum Prüfen',
  },
  'catch.health.setUp': 'Einrichten',
  'catch.health.setUpWhy.alerts': 'Nicht eingerichtet · erfasst Mitteilungen deiner Bank',
  'catch.health.setUpWhy.wallet': 'Nicht eingerichtet · erfasst kontaktloses Bezahlen',
  'catch.health.setUpWhy.email': 'Nicht eingerichtet · erfasst Belege per E-Mail',
  'catch.reading.of': '{right} von {total}',
  'catch.reading.explain':
    'Belege, die du teilst oder scannst, liest dieses iPhone. Ein Punkt markiert einen, den du korrigieren musstest: Betrag oder Geschäft.',
  'catch.reading.ghost': 'Teile einen Beleg, dann wird er hier gezählt',
  'settings.travel.off': 'Aus',
  'settings.travel.auto': 'Automatisch',
  'settings.travel.on': 'An · {place}',
  'settings.travel.needsLocation': 'Standort nötig',
  'settings.privacy.mostly': 'Meist auf diesem Handy',
  'settings.privacy.all': 'Alles auf diesem Handy',
  'privacyPage.headline': 'Dein Geld bleibt verschlüsselt auf diesem iPhone.',
  'privacyPage.sub':
    'Ein paar Dinge verlassen es, um verarbeitet zu werden. Jedes einzeln, und wohin es geht:',
  'privacyPage.subDevice':
    'Auch die KI läuft hier, also verlässt nichts das Handy. Jedes einzeln, und wo es bleibt:',
  'privacyPage.what': 'WAS RAUSGEHT',
  'privacyPage.to': 'GEHT AN',
  'privacyPage.ask': 'DEINE FRAGE IN ASK',
  'privacyPage.lines': 'EIN PAAR FAKTEN FÜR EINEN SPRUCH DEINES BEGLEITERS',
  'privacyPage.receipts': 'EIN BELEG, DEN DEIN HANDY NICHT LESEN KANN',
  'privacyPage.alerts': 'DEINE BANKMITTEILUNGEN, LANGE NUMMERN VERDECKT',
  'privacyPage.voice': 'DEINE STIMME, WÄHREND DU SPRICHST',
  'privacyPage.spends': 'DEINE LISTE DER AUSGABEN',
  'privacyPage.neverSent': 'NIE GESENDET',
  'privacyPage.staysHere': 'BLEIBT HIER',
  'privacyPage.nothingLeaves': 'NICHTS GEHT RAUS',
  'privacyPage.foot': 'ANTHROPIC TRAINIERT NICHT DAMIT · LÖSCHT ES INNERHALB VON 30 TAGEN',
  'privacyPage.backup':
    'DEIN BACKUP GEHT NUR RAUS, WENN DU ES EINSCHALTEST, ENDE-ZU-ENDE-VERSCHLÜSSELT',
  'privacyPage.crashes':
    'ABSTURZBERICHTE GEHEN OHNE BETRÄGE, NAMEN ODER NOTIZEN AN SENTRY · REVENUECAT WICKELT KÄUFE AB',
  'privacyPage.purchases': 'KEINE ABSTURZBERICHTE · REVENUECAT WICKELT KÄUFE AB',
  'privacyPage.keep': 'Alles auf diesem iPhone behalten',
  'privacyPage.keepSub': 'KI auf dieses Handy umstellen',
  'privacyPage.policy': 'Datenschutzerklärung',
  'privacyPage.policyFailed': 'Die Seite ließ sich nicht öffnen. Versuch es noch mal.',
};
