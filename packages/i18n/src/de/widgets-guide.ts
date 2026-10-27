import type { Entry } from '../catalogue-types';
import type { enWidgetsGuide } from '../en-widgets-guide';

// Steps quote the iPhone's own German labels in „ “; the Siri phrase matches the German App Shortcut.
export const deWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'Widgets & Steuerelemente',
  'widgetsGuide.headline': '6pm, nur einen Blick oder einen Druck entfernt.',
  'widgetsGuide.lede':
    'Behalte den heute verfügbaren Betrag da, wo du sowieso hinschaust, und öffne „QR scannen“ oder „Schnell erfassen“, ohne die App zu suchen.',
  'widgetsGuide.lookMax': 'In deinem Look gezeichnet.',
  'widgetsGuide.lookFree': 'Gratis, in Goldene Stunde. Mit Max tragen sie deinen Look.',
  'widgetsGuide.howToAdd': 'Hinzufügen',
  'widgetsGuide.whenItShows': 'Wann es erscheint',

  'widgetsGuide.home.title': 'Widgets auf dem Home-Bildschirm',
  'widgetsGuide.home.what': 'Der heute verfügbare Betrag auf einen Blick. Tippen öffnet 6pm.',
  'widgetsGuide.home.small': 'Klein',
  'widgetsGuide.home.medium': 'Mittel',
  'widgetsGuide.home.large': 'Groß',
  'widgetsGuide.home.smallWhat': 'Dein heute verfügbarer Betrag.',
  'widgetsGuide.home.mediumWhat': 'Der Betrag, daneben „QR scannen“ und „Schnell erfassen“.',
  'widgetsGuide.home.largeWhat': 'Was übrig ist, und die neuesten Ausgaben von heute.',
  'widgetsGuide.home.step1':
    'Lege den Finger auf eine leere Stelle des Home-Bildschirms, bis die Apps wackeln.',
  'widgetsGuide.home.step2': 'Tippe oben auf „Bearbeiten“ und dann auf „Widget hinzufügen“.',
  'widgetsGuide.home.step3':
    'Suche nach 6pm, wische zur gewünschten Größe und tippe auf „Widget hinzufügen“.',

  'widgetsGuide.lock.title': 'Widgets auf dem Sperrbildschirm',
  'widgetsGuide.lock.what': 'Sieh, was heute übrig ist, ohne dein iPhone zu entsperren.',
  'widgetsGuide.lock.ring': 'Kreis',
  'widgetsGuide.lock.card': 'Karte',
  'widgetsGuide.lock.step1': 'Lege den Finger auf den Sperrbildschirm und tippe auf „Anpassen“.',
  'widgetsGuide.lock.step2': 'Wähle „Sperrbildschirm“ und tippe auf den Bereich unter der Uhr.',
  'widgetsGuide.lock.step3': 'Tippe auf 6pm und wähle den Kreis oder die Karte.',

  'widgetsGuide.control.title': 'Kontrollzentrum',
  'widgetsGuide.control.what':
    'Nach unten wischen, einmal tippen, und du bist in „QR scannen“ oder „Schnell erfassen“.',
  'widgetsGuide.control.needs': 'iOS 18 oder neuer',
  'widgetsGuide.control.step1': 'Wische von der oberen rechten Ecke des Bildschirms nach unten.',
  'widgetsGuide.control.step2':
    'Lege den Finger auf eine leere Stelle und tippe auf „Steuerelement hinzufügen“.',
  'widgetsGuide.control.step3': 'Suche nach 6pm und wähle „QR scannen“ oder „Schnell erfassen“.',
  'widgetsGuide.control.note':
    'Die beiden können auch Taschenlampe oder Kamera unten auf deinem Sperrbildschirm ersetzen.',

  'widgetsGuide.action.title': 'Aktionstaste',
  'widgetsGuide.action.what': 'Halte die Taste an der Seite gedrückt, um „QR scannen“ zu öffnen.',
  'widgetsGuide.action.needs': 'iPhone 15 Pro oder neuer',
  'widgetsGuide.action.step1': 'Öffne Einstellungen und dann „Aktionstaste“.',
  'widgetsGuide.action.step2': 'Wische zu „Steuerelemente“ und tippe auf den Namen darunter.',
  'widgetsGuide.action.step3': 'Suche nach 6pm und wähle „QR scannen“ oder „Schnell erfassen“.',
  'widgetsGuide.action.note': 'Lieber sprechen? Sag Siri „In 6pm erfassen“ und dann den Betrag.',

  'widgetsGuide.live.title': 'Live-Aktivität',
  'widgetsGuide.live.what':
    'Erscheint von selbst, während eine QR-Zahlung wartet und während du reist.',
  'widgetsGuide.live.step1':
    'Scanne einen QR-Code und zahl in deiner Banking-App. Die Zahlung wartet auf deinem Sperrbildschirm.',
  'widgetsGuide.live.step2':
    'Tippe auf „Bezahlt“, sobald das Geld raus ist. Sie schließt sich von selbst.',
  'widgetsGuide.live.step3':
    'Wird nicht angezeigt? Öffne in den Einstellungen 6pm und aktiviere „Live-Aktivitäten“.',
};
