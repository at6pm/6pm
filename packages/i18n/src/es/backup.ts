import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// "Copia de seguridad" (short: "copia"), and iOS's own "Llavero de iCloud" and "Ajustes".
export const esBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': 'Copia de seguridad',
  'backup.row.off': 'No',
  'backup.row.on': 'iCloud · {when}',
  'backup.row.found': 'Copia encontrada',
  'backup.row.deleting': 'Eliminando…',
  'backup.ago.now': 'ahora mismo',
  'backup.ago.minutes': { one: 'hace {count} minuto', other: 'hace {count} minutos' },
  'backup.ago.hours': { one: 'hace {count} hora', other: 'hace {count} horas' },
  'backup.ago.days': { one: 'hace {count} día', other: 'hace {count} días' },

  'backup.status.on': 'Copia hecha {when}.',
  'backup.status.sub': {
    one: 'iCloud · {count} elemento · cifrado. 6pm funciona igual sin ella.',
    other: 'iCloud · {count} elementos · cifrados. 6pm funciona igual sin ella.',
  },
  'backup.status.never': 'Lista cuando tú quieras.',
  'backup.status.neverSub': 'iCloud · cifrada. 6pm funciona igual sin ella.',
  'backup.off.title': 'Guarda cada día, para siempre.',
  'backup.off.sub':
    'Se sella en este iPhone antes de salir. La clave se queda en tu Llavero de iCloud, así que no podemos leer nada.',
  'backup.tooLarge':
    'La última copia era demasiado grande para enviarla. Todo sigue en este iPhone.',
  'backup.note':
    'Se hace una copia al día, después del cierre. Para restaurarla en un iPhone nuevo, activa el Llavero de iCloud en Ajustes.',
  'backup.paused':
    'La copia de seguridad está en pausa sin Max. Tu última copia sigue a salvo en iCloud.',
  'backup.empty': 'Aún no hay nada que copiar. Cierra tu primer día y vuelve.',

  'backup.turnOn': 'Activar copia de seguridad',
  'backup.now': 'Hacer copia ahora',
  'backup.working': 'Haciendo copia…',
  'backup.delete': 'Eliminar copia',
  'backup.deleteConfirm': 'Toca otra vez para eliminar tu copia',
  'backup.deleting': 'Eliminando…',
  'backup.deletePending':
    'Tu copia se eliminará en cuanto 6pm tenga conexión. Mientras tanto no se envía nada más.',

  'backup.found.title': 'Ya hay una copia de seguridad en tu iCloud.',
  'backup.found.sub':
    'Viene de otro iPhone o de una instalación anterior. Si haces la copia desde aquí, la sustituirá.',
  'backup.found.restore': 'Restaurarla aquí',
  'backup.found.restoreConfirm': 'Toca otra vez para sustituir los días de este iPhone',
  'backup.found.replace': 'Sustituirla por este iPhone',

  'backup.restore.link': 'Restaurar desde una copia',
  'backup.restore.title': 'Restaurar desde una copia',
  'backup.restore.found': 'Hemos encontrado tu copia del {date}.',
  'backup.restore.sub': {
    one: '{count} elemento · cifrado en iCloud.',
    other: '{count} elementos · cifrados en iCloud.',
  },
  'backup.restore.do': 'Restaurar mis días',
  'backup.restore.working': 'Restaurando…',
  'backup.restore.fresh': 'Empezar de cero',
  'backup.restore.freshNote':
    'Si empiezas de cero, tu copia se conserva hasta que la sustituya la primera copia nueva que hagas.',
  'backup.restore.looking': 'Buscando tu copia…',
  'backup.restore.none': 'No hay ninguna copia para este Llavero de iCloud.',
  'backup.restore.unsupported':
    'Esta copia se hizo con un 6pm más nuevo. Actualiza la app para restaurarla.',
  'backup.restore.wrongKey': 'La clave de este iPhone no puede abrir esta copia.',
  'backup.restore.damaged': 'Esta copia está dañada y no se puede restaurar.',

  'backup.error.network': 'No se ha podido conectar con 6pm. Inténtalo en un momento.',
  'backup.error.keychain':
    'El Llavero de iCloud no ha guardado la clave, así que no se ha copiado nada. Comprueba que está activado en Ajustes.',
  'backup.error.tooLarge':
    'Esta copia es demasiado grande para enviarla. Todo sigue en este iPhone.',
  'backup.retry': 'Reintentar',
  'backup.error.generic': 'No ha funcionado. Inténtalo de nuevo.',

  'backup.toast.deleted': 'Copia eliminada.',
  'companion.backupDone.soft': 'Copia hecha. Tus días están a salvo.',
  'companion.backupDone.cheeky': 'Copia hecha. Hasta tu peor martes está a salvo.',
  'companion.backupDone.roast': 'Copia hecha. Tus errores quedan en la nube para siempre.',
  'companion.backupDone.plain': 'Copia de seguridad completada.',
  'companion.backupRestored.soft': '¡Hola de nuevo! Está todo aquí.',
  'companion.backupRestored.cheeky': 'De vuelta de la nube. No falta nada.',
  'companion.backupRestored.roast': 'Restaurado. Intenta no perder otro teléfono.',
  'companion.backupRestored.plain': 'Copia de seguridad restaurada.',
};
