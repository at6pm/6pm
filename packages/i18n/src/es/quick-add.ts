import type { Entry } from '../catalogue-types';
import type { enQuickAdd } from '../en-quick-add';

export const esQuickAdd: { readonly [Key in keyof typeof enQuickAdd]: Entry } = {
  'quick.face.out': 'Gasté',
  'quick.face.in': 'Me pagaron',
  'quick.tool.photo': 'Foto',
  'quick.tool.split': 'Dividir',
  'quick.tool.jar': 'De un bote',
  'quick.tool.noJar': 'No de un bote',
  'quick.todayStays': 'HOY SIGUE {amount}',
  'quick.in.ticket': '6pm · Dinero que entra',
  'quick.in.whoFrom': 'De quién',
  'quick.in.name': 'Nombre',
  'quick.in.who': '¿De quién es?',
  'quick.in.into': 'Entró en',
  'quick.in.days': 'A tus días',
  'quick.in.daysLast': 'A tus días, como la última vez',
  'quick.in.jarLast': 'A {jar}, como la última vez',
  'quick.in.pay': 'Tu sueldo',
  'quick.in.payLast': 'Tu sueldo, como la última vez',
  'quick.in.landing': {
    one: '+{count} DÍA · CUBIERTO HASTA {date}',
    other: '+{count} DÍAS · CUBIERTO HASTA {date}',
  },
  'quick.in.work': 'TRABAJO',
  'voice.missed': 'No te he entendido.',
  'voice.heardFirst': 'He oído {said}. Di primero el importe: “45k, phở”.',
  'voice.sayFirst': 'Di primero el importe: “45k, phở”.',
  'voice.nothingHeard': 'No he oído nada. ¿Está permitido el micro?',
  'voice.tryAgain': 'Otra vez',
  'voice.toKeypad': 'Volver al teclado',
};
