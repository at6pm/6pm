import type { Entry } from '../catalogue-types';
import type { enBackup } from '../en-backup';

// iCloud Keychain is Apple's own iCloud 钥匙串; {when} is a relative time such as 5 分钟前.
export const zhHansBackup: { readonly [Key in keyof typeof enBackup]: Entry } = {
  'backup.title': '备份',
  'backup.row.off': '关闭',
  'backup.row.on': 'iCloud · {when}',
  'backup.row.found': '找到一份备份',
  'backup.row.deleting': '正在删除…',
  'backup.ago.now': '刚刚',
  'backup.ago.minutes': { other: '{count} 分钟前' },
  'backup.ago.hours': { other: '{count} 小时前' },
  'backup.ago.days': { other: '{count} 天前' },

  'backup.status.on': '{when}已备份。',
  'backup.status.sub': { other: 'iCloud · {count} 项 · 已加密。没有它，6pm 也照常运行。' },
  'backup.status.never': '随时可以开始。',
  'backup.status.neverSub': 'iCloud · 已加密。没有它，6pm 也照常运行。',
  'backup.off.title': '每一天，都永久留存。',
  'backup.off.sub':
    '离开 iPhone 之前就已在本机加密。密钥保存在你的 iCloud 钥匙串里，所以我们什么都看不到。',
  'backup.tooLarge': '上一次备份太大，没能发送。所有内容都还在这台 iPhone 上。',
  'backup.note': '每天日结后备份一次。要在新 iPhone 上恢复，请在 iOS“设置”中打开 iCloud 钥匙串。',
  'backup.paused': '没有 Max，备份已暂停。你上一次的备份仍安全地保存在 iCloud 中。',
  'backup.empty': '还没有可以备份的内容。先完成第一次日结，再回来看看。',

  'backup.turnOn': '打开备份',
  'backup.now': '立即备份',
  'backup.working': '正在备份…',
  'backup.delete': '删除备份',
  'backup.deleteConfirm': '再点一次删除你的备份',
  'backup.deleting': '正在删除…',
  'backup.deletePending': '6pm 一联网就会删除你的备份。在此期间不会再发送任何内容。',

  'backup.found.title': '你的 iCloud 里已经有一份备份。',
  'backup.found.sub': '它来自另一台 iPhone 或之前的一次安装。从这里备份会替换掉它。',
  'backup.found.restore': '恢复到这里',
  'backup.found.restoreConfirm': '再点一次，替换这台 iPhone 上的记录',
  'backup.found.replace': '用这台 iPhone 的记录替换',

  'backup.restore.link': '从备份恢复',
  'backup.restore.title': '从备份恢复',
  'backup.restore.found': '找到了你在 {date} 的备份。',
  'backup.restore.sub': { other: '{count} 项 · 已加密保存在 iCloud。' },
  'backup.restore.do': '恢复我的记录',
  'backup.restore.working': '正在恢复…',
  'backup.restore.fresh': '改为重新开始',
  'backup.restore.freshNote': '重新开始会保留你的备份，直到你做的第一份新备份替换它。',
  'backup.restore.looking': '正在查找你的备份…',
  'backup.restore.none': '这个 iCloud 钥匙串下没有找到备份。',
  'backup.restore.unsupported': '这份备份由更新版本的 6pm 创建。请更新 App 后再恢复。',
  'backup.restore.wrongKey': '这台 iPhone 上的密钥打不开这份备份。',
  'backup.restore.damaged': '这份备份已损坏，无法恢复。',

  'backup.error.network': '连不上 6pm。稍后再试。',
  'backup.error.keychain':
    'iCloud 钥匙串没能保存密钥，所以什么都没备份。请在 iOS“设置”中确认它已打开。',
  'backup.error.tooLarge': '这份备份太大，无法发送。所有内容都还在这台 iPhone 上。',
  'backup.retry': '再试一次',
  'backup.error.generic': '没有成功。再试一次。',

  'backup.toast.deleted': '备份已删除。',
  'companion.backupDone.soft': '备份好了。你的每一天都安全了。',
  'companion.backupDone.cheeky': '备份好了。连你最糟糕的那个星期二也安全了。',
  'companion.backupDone.roast': '备份好了。你的黑历史从此永存云端。',
  'companion.backupDone.plain': '备份完成。',
  'companion.backupRestored.soft': '欢迎回来。一切都在。',
  'companion.backupRestored.cheeky': '从云端回来啦。一样不少。',
  'companion.backupRestored.roast': '恢复好了。这台手机可要看紧点。',
  'companion.backupRestored.plain': '备份已恢复。',
};
