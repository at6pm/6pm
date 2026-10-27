import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// "Presupuesto en pareja" is the feature's name; a shared pot is a "hucha compartida". Apple's
// button is "Iniciar sesión con Apple", as iOS writes it.
export const esTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': 'Presupuesto en pareja',
  'together.card.subOn': 'Invita a alguien a compartir una hucha.',
  'together.card.subPaired': {
    one: 'Con {name} · 1 hucha compartida',
    other: 'Con {name} · {count} huchas compartidas',
  },
  'together.card.open': 'Abrir Presupuesto en pareja',
  'together.you': 'Tú',
  'together.partner': 'Tu pareja',

  'together.intro.title': 'Ahorrar en pareja.',
  'together.intro.sub':
    'Comparte una hucha con la persona con la que ahorras. Los dos ponéis dinero, y cada uno ve quién puso qué. Tus días siguen en tu teléfono.',
  'together.intro.note':
    'Iniciar sesión con Apple solo se usa para Presupuesto en pareja. 6pm te pide tu nombre, nunca tu correo.',
  'together.signIn.failed': 'No se ha podido iniciar sesión con Apple. Inténtalo de nuevo.',
  'together.signIn.unavailable': 'Iniciar sesión con Apple no está disponible en este iPhone.',

  'together.waiting.title': 'De momento, solo tú.',
  'together.waiting.sub':
    'Envía el enlace a la persona con la que ahorras. Cuando se una, verá vuestras huchas compartidas.',
  'together.paired.title': 'Tú y {name}',
  'together.paired.sub': { one: '1 hucha compartida', other: '{count} huchas compartidas' },
  'together.invite': 'Invitar a alguien',
  'together.invite.again': 'Enviar un enlace nuevo',
  'together.invite.message': 'Ahorra conmigo en 6pm: {url}',
  'together.invite.note': 'Un enlace de invitación sirve una vez, durante 7 días.',
  'together.offline': 'Sin conexión. Esto es lo último que viste.',

  'together.pots.title': 'Huchas compartidas',
  'together.newPot': 'Nueva hucha compartida',
  'together.newPotSub': 'Los dos ponéis dinero.',
  'together.jar.add': 'Poner {amount} en {name}',
  'together.jar.split': 'Tú {mine} · {partner} {theirs}',
  'together.jar.mine': 'Has puesto {mine}',

  'together.pot.edit': 'Editar hucha compartida',
  'together.pot.start': 'Crear hucha compartida',
  'together.pot.save': 'Guardar',
  'together.pot.sumMonthly': 'Unos {amount} al mes, entre los dos',
  'together.pot.sumSub': 'Lo que pones cuenta como una aportación a tus propias huchas.',
  'together.pot.sumNone': 'Sin fecha, sin prisa',
  'together.pot.sumNoneSub': 'Pon dinero cuando quieras.',
  'together.pot.amount': 'Poner',
  'together.pot.addButton': 'Poner {amount}',
  'together.pot.entries': 'Quién puso qué',
  'together.pot.empty': 'Aún no hay nada.',
  'together.pot.entry': '{who} · {day}',
  'together.pot.takeBack': 'Retirar',
  'together.pot.takeBackLabel': 'Retirar {amount}',
  'together.pot.delete': 'Eliminar hucha compartida',
  'together.pot.deleteConfirm': 'Toca otra vez para eliminarla para los dos',
  'together.pot.deleted': 'Se ha eliminado {name}',
  'together.pot.gone': 'Esta hucha ya no existe. Puede que tu pareja la haya eliminado.',

  'together.leave': 'Salir de Presupuesto en pareja',
  'together.leaveConfirm': 'Toca otra vez para salir',
  'together.leave.note':
    'Al salir, se acaba para los dos y se eliminan las huchas compartidas de nuestro servidor. Cada uno conserva lo que puso, en su propio teléfono.',
  'together.deleteAccount': 'Eliminar cuenta de Presupuesto en pareja',
  'together.deleteConfirm': 'Toca otra vez para eliminar tu cuenta',
  'together.delete.note':
    'Elimina tu inicio de sesión y todo lo que compartes, y avisa a Apple de que 6pm ya no usa tu Apple ID. Tus días siguen en este teléfono.',
  'together.kept.title': 'Guardado en este iPhone',
  'together.kept.sub':
    'Lo que has puesto en huchas compartidas: {amount}. Se queda aquí aunque la hucha desaparezca.',

  'together.join.title': 'Únete a Presupuesto en pareja',
  'together.join.sub':
    'Alguien te ha invitado a compartir huchas en 6pm. Inicia sesión con Apple para unirte. Tus días siguen en tu teléfono.',
  'together.join.button': 'Unirme',
  'together.join.expired': 'Esta invitación ha caducado. Pide un enlace nuevo.',
  'together.join.used': 'Esta invitación ya se ha usado. Pide un enlace nuevo.',
  'together.join.full': 'Ahí ya comparten huchas dos personas.',
  'together.join.own': 'Esta es tu propia invitación. Envíasela a la persona con la que ahorras.',
  'together.join.paired':
    'Ya compartes huchas. Sal primero de Presupuesto en pareja y vuelve a abrir el enlace.',
  'together.join.missing': 'Este enlace de invitación no funciona. Pide uno nuevo.',

  'together.error.offline': 'No se ha podido conectar con 6pm. No ha cambiado nada.',
  'together.error.failed': 'No ha salido bien. No ha cambiado nada.',
  'together.ended': 'Presupuesto en pareja ha terminado. Lo que pusiste se queda en este teléfono.',
  'together.left': 'Has salido de Presupuesto en pareja.',
  'together.deleted': 'Cuenta de Presupuesto en pareja eliminada.',
  'together.joined': 'Ya estás dentro. Presupuesto en pareja con {name}.',
};
