import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// Plain です・ます for the sheet; the companion's lines at the end are casual.
export const jaBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': 'バックアップ',
  'backup.row.off': 'オフ',
  'backup.row.on': 'iCloud · {when}',
  'backup.row.found': 'バックアップあり',
  'backup.row.deleting': '削除中…',
  'backup.ago.now': 'たった今',
  'backup.ago.minutes': { other: '{count}分前' },
  'backup.ago.hours': { other: '{count}時間前' },
  'backup.ago.days': { other: '{count}日前' },

  'backup.status.on': '最終バックアップ：{when}',
  'backup.status.sub': {
    other: 'iCloud · {count}件 · 暗号化済み。なくても6pmは使えます。',
  },
  'backup.status.never': '準備ができたらいつでも。',
  'backup.status.neverSub': 'iCloud · 暗号化。なくても6pmは使えます。',
  'backup.off.title': '毎日の記録を、ずっと残そう。',
  'backup.off.sub':
    'iPhoneから出る前に暗号化されます。鍵はあなたのiCloudキーチェーンに保管されるので、私たちには何も読めません。',
  'backup.tooLarge':
    '前回のバックアップは大きすぎて送れませんでした。データはすべてこのiPhoneに残っています。',
  'backup.note':
    '1日1回、締めのあとにバックアップします。新しいiPhoneで復元するには、「設定」でiCloudキーチェーンをオンにしてください。',
  'backup.paused':
    'Maxがないためバックアップは一時停止中です。前回のバックアップはiCloudに安全に残っています。',
  'backup.empty': 'まだバックアップするものがありません。最初の1日を締めてから戻ってきてください。',

  'backup.turnOn': 'バックアップをオン',
  'backup.now': '今すぐバックアップ',
  'backup.working': 'バックアップ中…',
  'backup.delete': 'バックアップを削除',
  'backup.deleteConfirm': 'もう一度タップしてバックアップを削除',
  'backup.deleting': '削除中…',
  'backup.deletePending':
    '6pmがオンラインになり次第、バックアップを削除します。それまでは何も送信しません。',

  'backup.found.title': 'iCloudにすでにバックアップがあります。',
  'backup.found.sub':
    '別のiPhoneか以前のインストールで作られたものです。ここからバックアップすると置き換わります。',
  'backup.found.restore': 'ここに復元する',
  'backup.found.restoreConfirm': 'もう一度タップしてこのiPhoneの記録を置き換える',
  'backup.found.replace': 'このiPhoneの内容で置き換える',

  'backup.restore.link': 'バックアップから復元',
  'backup.restore.title': 'バックアップから復元',
  'backup.restore.found': '{date}のバックアップが見つかりました。',
  'backup.restore.sub': {
    other: '{count}件 · iCloudに暗号化して保存。',
  },
  'backup.restore.do': '記録を復元する',
  'backup.restore.working': '復元中…',
  'backup.restore.fresh': '新しく始める',
  'backup.restore.freshNote':
    '新しく始めても、次に新しいバックアップを作るまでは今のバックアップが残ります。',
  'backup.restore.looking': 'バックアップを探しています…',
  'backup.restore.none': 'このiCloudキーチェーンにはバックアップが見つかりません。',
  'backup.restore.unsupported':
    'このバックアップは新しいバージョンの6pmで作られています。アプリをアップデートしてから復元してください。',
  'backup.restore.wrongKey': 'このiPhoneの鍵ではこのバックアップを開けません。',
  'backup.restore.damaged': 'このバックアップは破損しているため復元できません。',

  'backup.error.network': '6pmに接続できませんでした。少ししてからもう一度お試しください。',
  'backup.error.keychain':
    'iCloudキーチェーンに鍵を保存できなかったため、バックアップしていません。「設定」でオンになっているか確認してください。',
  'backup.error.tooLarge':
    'このバックアップは大きすぎて送れません。データはすべてこのiPhoneに残っています。',
  'backup.retry': 'もう一度',
  'backup.error.generic': 'うまくいきませんでした。もう一度お試しください。',

  'backup.toast.deleted': 'バックアップを削除しました。',
  'companion.backupDone.soft': 'バックアップ完了。毎日の記録はもう安心だよ。',
  'companion.backupDone.cheeky': 'バックアップ完了。最悪だった火曜日も、これで安全。',
  'companion.backupDone.roast': 'バックアップ完了。あの日の散財も、クラウドで永久保存。',
  'companion.backupDone.plain': 'バックアップが完了しました。',
  'companion.backupRestored.soft': 'おかえり。全部ここにあるよ。',
  'companion.backupRestored.cheeky': 'クラウドから帰還。抜けはなし。',
  'companion.backupRestored.roast': '復元完了。もうスマホはなくさないでね。',
  'companion.backupRestored.plain': 'バックアップを復元しました。',
};
