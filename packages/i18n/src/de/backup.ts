import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// "Backup" is the word German iOS uses; iCloud Keychain is "iCloud-Schlüsselbund".
export const deBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': 'Backup',
  'backup.row.off': 'Aus',
  'backup.row.on': 'iCloud · {when}',
  'backup.row.found': 'Backup gefunden',
  'backup.row.deleting': 'Wird gelöscht …',
  'backup.ago.now': 'gerade eben',
  'backup.ago.minutes': { one: 'vor {count} Minute', other: 'vor {count} Minuten' },
  'backup.ago.hours': { one: 'vor {count} Stunde', other: 'vor {count} Stunden' },
  'backup.ago.days': { one: 'vor {count} Tag', other: 'vor {count} Tagen' },

  'backup.status.on': 'Gesichert {when}.',
  'backup.status.sub': {
    one: 'iCloud · {count} Eintrag · verschlüsselt. 6pm läuft auch ohne.',
    other: 'iCloud · {count} Einträge · verschlüsselt. 6pm läuft auch ohne.',
  },
  'backup.status.never': 'Bereit, wenn du es bist.',
  'backup.status.neverSub': 'iCloud · verschlüsselt. 6pm läuft auch ohne.',
  'backup.off.title': 'Behalte jeden Tag, für immer.',
  'backup.off.sub':
    'Auf diesem iPhone versiegelt, bevor es rausgeht. Der Schlüssel bleibt in deinem iCloud-Schlüsselbund, wir können also nichts lesen.',
  'backup.tooLarge': 'Das letzte Backup war zu groß zum Senden. Alles ist noch auf diesem iPhone.',
  'backup.note':
    'Sichert einmal am Tag, nach deinem Tagesabschluss. Für die Wiederherstellung auf einem neuen iPhone den iCloud-Schlüsselbund in den iOS-Einstellungen aktivieren.',
  'backup.paused':
    'Ohne Max ist das Backup pausiert. Dein letztes Backup liegt weiter sicher in iCloud.',
  'backup.empty': 'Noch nichts zu sichern. Schließ deinen ersten Tag ab und komm dann wieder.',

  'backup.turnOn': 'Backup aktivieren',
  'backup.now': 'Jetzt sichern',
  'backup.working': 'Wird gesichert …',
  'backup.delete': 'Backup löschen',
  'backup.deleteConfirm': 'Noch mal tippen, um dein Backup zu löschen',
  'backup.deleting': 'Wird gelöscht …',
  'backup.deletePending':
    'Dein Backup wird gelöscht, sobald 6pm online ist. Bis dahin wird nichts mehr gesendet.',

  'backup.found.title': 'In deiner iCloud liegt schon ein Backup.',
  'backup.found.sub':
    'Es stammt von einem anderen iPhone oder einer früheren Installation. Ein Backup von hier würde es ersetzen.',
  'backup.found.restore': 'Hier wiederherstellen',
  'backup.found.restoreConfirm': 'Noch mal tippen, um die Tage auf diesem iPhone zu ersetzen',
  'backup.found.replace': 'Durch dieses iPhone ersetzen',

  'backup.restore.link': 'Aus Backup wiederherstellen',
  'backup.restore.title': 'Aus Backup wiederherstellen',
  'backup.restore.found': 'Dein Backup vom {date} ist da.',
  'backup.restore.sub': {
    one: '{count} Eintrag · verschlüsselt in iCloud.',
    other: '{count} Einträge · verschlüsselt in iCloud.',
  },
  'backup.restore.do': 'Meine Tage wiederherstellen',
  'backup.restore.working': 'Wird wiederhergestellt …',
  'backup.restore.fresh': 'Lieber neu anfangen',
  'backup.restore.freshNote':
    'Beim Neuanfang bleibt dein Backup erhalten, bis das erste neue es ersetzt.',
  'backup.restore.looking': 'Suche nach deinem Backup …',
  'backup.restore.none': 'Für diesen iCloud-Schlüsselbund wurde kein Backup gefunden.',
  'backup.restore.unsupported':
    'Dieses Backup stammt von einer neueren 6pm-Version. Aktualisiere die App, um es wiederherzustellen.',
  'backup.restore.wrongKey': 'Der Schlüssel auf diesem iPhone kann dieses Backup nicht öffnen.',
  'backup.restore.damaged': 'Dieses Backup ist beschädigt und kann nicht wiederhergestellt werden.',

  'backup.error.network': '6pm war nicht erreichbar. Versuch es gleich noch mal.',
  'backup.error.keychain':
    'Der iCloud-Schlüsselbund hat den Schlüssel nicht behalten, darum wurde nichts gesichert. Prüf in den iOS-Einstellungen, ob er aktiviert ist.',
  'backup.error.tooLarge':
    'Dieses Backup ist zu groß zum Senden. Alles ist noch auf diesem iPhone.',
  'backup.retry': 'Noch mal',
  'backup.error.generic': 'Das hat nicht geklappt. Versuch es noch mal.',

  'backup.toast.deleted': 'Backup gelöscht.',
  'companion.backupDone.soft': 'Gesichert. Deine Tage sind in Sicherheit.',
  'companion.backupDone.cheeky': 'Gesichert. Sogar dein schlimmster Dienstag ist jetzt sicher.',
  'companion.backupDone.roast': 'Gesichert. Deine Fehltritte liegen jetzt für immer in der Cloud.',
  'companion.backupDone.plain': 'Backup abgeschlossen.',
  'companion.backupRestored.soft': 'Willkommen zurück. Alles ist da.',
  'companion.backupRestored.cheeky': 'Zurück aus der Cloud. Nichts fehlt.',
  'companion.backupRestored.roast':
    'Wiederhergestellt. Auf das neue Handy passen wir jetzt besser auf, ja?',
  'companion.backupRestored.plain': 'Backup wiederhergestellt.',
};
