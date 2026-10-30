import type { Entry } from '../catalogue-types';
import type { enAndroid } from '../en-android';

// Android's own wording: 这台手机 for the phone, Google Play for the store, 相册 for pictures, and
// no Apple names at all.
export const zhHansAndroid: { readonly [Key in keyof typeof enAndroid]: Entry } = {
  'ask.howTo.ways':
    '三种方式：快速记账（打字或说出来）、扫二维码或小票、转发小票邮件。6pm 记下的内容会在收件箱里等到日结。',
  'capture.share.headline': '把小票存成图片，然后在“扫码”里选中它。我会读出金额。',
  'capture.wallet.headline':
    '这台手机记不到刷卡付款。把银行卡的消费邮件转发过来，它们就会自己出现。',
  'capture.widgets.headline': '这台手机上没有 6pm 的桌面组件。长按扫码按钮，就能打开快速记账。',

  'backup.row.on': '已加密 · {when}',
  'backup.status.sub': { other: '{count} 项 · 已加密。没有它，6pm 也照常运行。' },
  'backup.status.neverSub': '已加密。没有它，6pm 也照常运行。',
  'backup.off.sub': '离开手机之前就已在本机加密。密钥只留在这台手机上，所以我们什么都看不到。',
  'backup.tooLarge': '上一次备份太大，没能发送。所有内容都还在这台手机上。',
  'backup.note':
    '每天日结后备份一次。密钥从不离开这台手机，所以备份只能在这里打开，换新手机后无法打开。',
  'backup.paused': '没有 Max，备份已暂停。你上一次的备份仍然安全加密保存着。',
  'backup.found.title': '这台手机已经有一份备份。',
  'backup.found.sub': '它来自之前的一次安装。从这里备份会替换掉它。',
  'backup.found.restoreConfirm': '再点一次，替换这台手机上的记录',
  'backup.found.replace': '用这台手机的记录替换',
  'backup.restore.sub': { other: '{count} 项 · 已加密。' },
  'backup.restore.none': '没有找到这台手机的备份。',
  'backup.restore.wrongKey': '这台手机上的密钥打不开这份备份。',
  'backup.error.keychain': '这台手机没能保存密钥，所以什么都没备份。再试一次。',
  'backup.error.tooLarge': '这份备份太大，无法发送。所有内容都还在这台手机上。',

  'capture.email.sub': '这台手机还没有转发地址',
  'capture.scan.tip': '没有码可扫时，长按扫码按钮就能快速记账。',
  'onboarding.catch.add.body': '长按扫码按钮打开快速记账，说一句“咖啡 {amount}”。',
  'today.list.empty': '还没记下任何支出。扫二维码或小票，或者花钱时点 +。',

  'looks.restore.none': '这个 Google 账号下没有可恢复的购买。',
  'looks.restore.failed': '连不上 Google Play。再试一次。',
  'looks.legal':
    '外观是在你的 Google 账号上一次性购买的。Max 是订阅，可随时在 Google Play 中取消。价格以 Google Play 显示为准。',
  'look.buying': '正在等待 Google Play…',
  'look.noteStoreOff': 'Google Play 没有响应，暂时无法购买这个外观。',
  'max.cta.waiting': '正在等待 Google Play…',
  'max.terms.storeOff': '现在无法购买 Max：Google Play 没有响应。',
  'max.sub.backup': '加密备份、完整历史、CSV 和 Sheets。',
  'max.note.backup': '加密备份、CSV 和 Sheets',
  'max.welcome.win.more': '存钱罐、旅行和年度纪念册',

  'privacy.ai.device.title': '只在这台手机上',
  'privacy.ai.device.unavailable': '这台手机的内存不够运行自己的模型。',
  'settings.ai.device': '在这台手机上',
  'privacy.leaves.device.none': '不涉及任何 AI。一切都在这台手机上算好。',
  'receiptEmail.deviceMode': 'AI 只在这台手机上运行时关闭',
  'receiptEmail.deviceMode.body':
    '小票邮件需要我们的服务器读取你的邮件，所以当 6pm 让 AI 只在这台手机上运行时，它会关闭。可以改为扫描小票。',
  'settings.privacyBody':
    '你的账目都加密保存在这台手机上。为了读懂你在“问问 6pm”里的问题、写出小伙伴的话，6pm 会把问题或你这一天的几条信息发给 AI 服务 Anthropic：金额、地点和分类名称，从不发送你的支出列表。手机读不出的小票照片也会发过去。Anthropic 不会用它们训练模型，并会在 30 天内删除。你用语音记账时，声音会发给 Deepgram 转成文字。在上方的“AI”中，你可以让这一切只留在这台手机上。备份只有在你打开后才会离开手机，并且端到端加密。崩溃报告发给 Sentry，不含金额、名称或备注；购买由 RevenueCat 处理。',

  'scan.handoff.store': '这台手机上没有 {wallet}',
  'scan.handoff.savedQr': '二维码已存到相册：在银行应用里从相册扫码。你回来时我再问你。',
  'sharing.saved': '已存到相册。',
  'sharing.photosOff': '6pm 没有相册访问权限。',

  'startup.failedSub': '什么都没丢。再试一次，如果还是这样，就重启手机。',
  'voice.unavailable': '语音需要这台手机支持{language}听写',

  'onboarding.privacy.phone': '只在这台手机上',
  'onboarding.privacy.backupSub': '用只留在这台手机上的密钥锁住',

  'capture.alerts.time': '十秒钟，设置一次',
  'capture.alerts.step1': '在“通知使用权”中打开 6pm',
  'capture.alerts.step1Chip': '通知使用权 → 6pm',
  'capture.alerts.step2': '保持银行和钱包 App 的通知开启',
  'capture.alerts.step3': '每笔付款都在收件箱里等日结',
  'capture.alerts.step3Chip': '收件箱',
  'capture.alerts.tip': '验证码、失败的付款和促销会被跳过。邮件已经记下的付款不会重复添加。',
  'capture.alerts.privacy':
    '只在这台手机上读取，不会发送到任何地方。6pm 只读取你的银行和钱包的通知。',
  'capture.alerts.actionAdd': '允许通知使用权',
  'capture.alerts.actionOpen': '通知使用权设置',
};
