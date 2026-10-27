import type { Entry } from '../catalogue-types';
import type { enAsk } from '../en-ask';

// "Can I afford" is "ist … drin?", the everyday German for it. Pot names sit in „ “ after "Spartopf".
export const deAsk: { readonly [Key in keyof typeof enAsk]: Entry } = {
  'ask.title': 'Frag 6pm',
  'ask.sub': 'Was drin ist, was wäre wenn, wann es reicht',
  'ask.back': 'Zurück',
  'ask.intro':
    'Frag, was drin ist, wie eine große Ausgabe deine Tage verändert oder wann ein Spartopf voll ist. Ich zeig dir die Rechnung.',
  'ask.try': 'Probier',
  'ask.placeholder': 'Frag oder sag es einfach …',
  'ask.send': 'Senden',
  'ask.speak': 'Laut fragen',
  'ask.listening': 'Ich höre zu …',
  'ask.suggest.afford': 'Ist ein Abendessen für {amount} am Samstag drin?',
  'ask.suggest.weekend': 'Wie viel fürs Wochenende?',
  'ask.suggest.spend': 'Was, wenn ich eine Jacke für {amount} kaufe?',
  'ask.suggest.pot': 'Wann ist {pot} voll?',
  'ask.suggest.save': 'Sollte ich mehr sparen?',
  'ask.meter': 'Noch {left} von {total} kostenlosen Fragen heute',
  'ask.unlimitedWith': 'Unbegrenzt mit',
  'ask.locked.title': 'Das waren die {total} Fragen für heute',
  'ask.locked.sub': 'Morgen gibt’s mehr, oder unbegrenzt mit Max',
  'ask.locked.cta': 'Max holen',
  'ask.bar.now': 'Jetzt',
  'ask.bar.after': 'Danach',
  'ask.bar.perDay': '{amount} pro Tag',
  'ask.bar.nothing': 'nichts mehr',
  'ask.row.free': 'Frei bis Zahltag',
  'ask.row.this': 'Das hier',
  'ask.row.leftPerDay': 'Übrig pro Tag',
  'ask.row.safeToday': 'Heute verfügbar',
  'ask.row.tomorrow': 'Morgen',
  'ask.row.futureYou': 'Zukunfts-Ich pro Monat',
  'ask.row.moving': 'Mehr zurücklegen',
  'ask.row.inPot': 'Im Spartopf',
  'ask.row.goal': 'Ziel',
  'ask.row.perMonth': 'Pro Monat',
  'ask.answer.fitsToday':
    'Ja, locker. Das passt in die {safe} von heute, morgen ändert sich nichts.',
  'ask.answer.fits': 'Ja. Die Tage danach gehen bis zum Zahltag von {from} auf {to}.',
  'ask.answer.tight': 'Geht, aber es wird knapp: Die Tage danach sinken von {from} auf {to}.',
  'ask.answer.tight.pots': 'Nimmst du {take} aus deinen Spartöpfen, bleiben {withPots} pro Tag.',
  'ask.answer.notThisMonth':
    'Diesen Monat nicht. Das ist mehr als dein ganzes freies Geld. Nach dem Zahltag am {payday} passt es.',
  'ask.answer.notThisMonth.pots': 'Oder nimm einen Teil aus einem Spartopf.',
  'ask.answer.weekend.two':
    'Etwa {total} für {first} und {second}, wenn die Tage davor nach Plan laufen.',
  'ask.answer.weekend.one': 'Etwa {total} für {first}, wenn die Tage davor nach Plan laufen.',
  'ask.answer.weekend.none':
    'Der Zahltag am {payday} kommt vor dem Wochenende, dann startet eine neue Zahl.',
  'ask.answer.saveMore':
    'Legst du {amount} mehr für Zukunfts-Ich zurück, kostet das bis zum Zahltag etwa {perDay} pro Tag.',
  'ask.answer.saveMore.none': '{amount} mehr für Zukunfts-Ich würde deine Tage kaum verändern.',
  'ask.answer.saveMore.note': 'Das geht im Plan.',
  'ask.answer.potFull': 'Mit {monthly} im Monat ist der Spartopf „{pot}“ bis {month} voll.',
  'ask.answer.potFull.done': 'Der Spartopf „{pot}“ ist schon voll.',
  'ask.answer.potFull.idle':
    'Gerade fließt monatlich nichts in den Spartopf „{pot}“, er füllt sich also nicht von selbst.',
  'ask.answer.noSuchPot':
    'Ich finde keinen Spartopf „{pot}“. Frag nach einem von deinen oder leg ihn im Plan an.',
  'ask.answer.noPots':
    'Noch kein Spartopf da. Leg einen im Plan an, und ich sag dir, wann er voll ist.',
  'ask.answer.today': 'Heute kannst du {safe} ausgeben. Die Zahl für morgen: {tomorrow}.',
  'ask.answer.today.used': 'Die Zahl für heute ist aufgebraucht. Morgen sind es {tomorrow}.',
  'ask.answer.help':
    'Ich sag dir, was drin ist, wie eine große Ausgabe deine Tage verändert oder wann ein Spartopf voll ist. Probier: „Sind {amount} am Samstag drin?“',
  'ask.error': 'Da ist was schiefgelaufen, ich konnte das nicht beantworten. Versuch es noch mal.',
  'ask.answer.offline':
    'Ich erreiche den Server nicht, darum verstehe ich gerade nur einfache Fragen.',
};
