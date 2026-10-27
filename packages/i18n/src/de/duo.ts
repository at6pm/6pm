import type { Entry } from '../catalogue-types';
import type { enDuo } from '../en-duo';

export const deDuo: { readonly [Key in keyof typeof enDuo]: Entry } = {
  'duo.month.steady': 'Gut im Takt. Ganz entspannt.',
  'duo.month.fast': 'Ein bisschen schneller als die Tage.',
  'duo.month.paceLine': 'Im {month} {used} % des Geldes verbraucht, {gone} % des Monats vorbei.',
  'duo.month.daily': 'Tageszahlen',
  'duo.day.ofLine': 'von {line} an dem Tag',
  'duo.day.previous': 'Tag davor',
  'duo.day.next': 'Tag danach',
  'duo.ask.title': 'Wenn du {amount} ausgibst',
  'duo.ask.from': 'Vorschau von Frag 6pm',
  'duo.ask.spent': '{spent} ausgegeben · ~{amount} mehr',
  'duo.ask.left': '{left} übrig',
  'duo.close.kept': 'Heute bisher behalten',
  'duo.close.ofLine': 'von {line} heute · {left} noch für dich',
  'duo.close.foldLater': 'Entscheide jede einzeln, dann klapp zu, um den Tag abzuschließen.',
  'duo.close.foldNow': 'Klapp zu, um den Tag abzuschließen.',
  'duo.market.title': 'An der Kasse',
  'duo.market.left': 'Heute übrig',
  'duo.market.add': 'Hinzufügen',
  'duo.market.leave': 'Kasse verlassen',
  'duo.scan.camera': 'Innenkamera',
  'duo.scan.looking': 'Suche QR-Code',
  'duo.scan.stand': 'Stell mich auf den Tresen und halt ihren QR-Code an die obere Hälfte.',
  'duo.scan.to': 'an {payee}',
  'duo.scan.paid': 'Bezahlt',
  'duo.drop.title': 'Bankzeile hier ablegen',
  'duo.drop.sub':
    '6pm liest Händler und Betrag und sortiert die Ausgabe in die richtige Kategorie.',
  'duo.drop.caught': '{merchant} · {amount} erwischt. Wartet auf den Tagesabschluss.',
  'duo.drop.unread': 'In der Zeile steht kein Betrag.',
};
