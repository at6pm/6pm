import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// Budget together is 一起记账 and a shared pot 共同存钱罐. Apple's sign-in keeps Apple's own
// Chinese name, 通过 Apple 登录.
export const zhHansTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': '一起记账',
  'together.card.subOn': '邀请一个人共用存钱罐。',
  'together.card.subPaired': { other: '和 {name} · {count} 个共同存钱罐' },
  'together.card.open': '打开一起记账',
  'together.you': '你',
  'together.partner': '你的搭档',

  'together.intro.title': '一起存钱。',
  'together.intro.sub':
    '和一起存钱的人共用一个存钱罐。你们都能往里存，也都能看到谁存了多少。你自己的日常记账只留在你的手机上。',
  'together.intro.note': '“通过 Apple 登录”只用于一起记账。6pm 只要你的名字，从不要你的邮箱。',
  'together.signIn.failed': '没能通过 Apple 登录。再试一次。',
  'together.signIn.unavailable': '这台 iPhone 无法使用“通过 Apple 登录”。',

  'together.waiting.title': '目前只有你。',
  'together.waiting.sub': '把链接发给和你一起存钱的人。对方加入后，就能看到你们的共同存钱罐。',
  'together.paired.title': '你和 {name}',
  'together.paired.sub': { other: '{count} 个共同存钱罐' },
  'together.invite': '邀请一个人',
  'together.invite.again': '发送新的邀请链接',
  'together.invite.message': '来 6pm 和我一起存钱：{url}',
  'together.invite.note': '邀请链接只能用一次，7 天内有效。',
  'together.offline': '已离线。这是你上次看到的内容。',

  'together.pots.title': '共同存钱罐',
  'together.newPot': '新建共同存钱罐',
  'together.newPotSub': '你们都可以往里存。',
  'together.jar.add': '往 {name} 存入 {amount}',
  'together.jar.split': '你 {mine} · {partner} {theirs}',
  'together.jar.mine': '你存了 {mine}',

  'together.pot.edit': '编辑共同存钱罐',
  'together.pot.start': '创建共同存钱罐',
  'together.pot.save': '保存',
  'together.pot.sumMonthly': '你们两人合计每月约 {amount}',
  'together.pot.sumSub': '你存进去的钱，和给自己的存钱罐充值一样计算。',
  'together.pot.sumNone': '没有日期，不用急',
  'together.pot.sumNoneSub': '想存就存。',
  'together.pot.amount': '存入',
  'together.pot.addButton': '存入 {amount}',
  'together.pot.entries': '谁存了多少',
  'together.pot.empty': '里面还是空的。',
  'together.pot.entry': '{who} · {day}',
  'together.pot.takeBack': '取回',
  'together.pot.takeBackLabel': '取回 {amount}',
  'together.pot.delete': '删除共同存钱罐',
  'together.pot.deleteConfirm': '再点一次，为你们两人删除',
  'together.pot.deleted': '已删除 {name}',
  'together.pot.gone': '这个存钱罐不在了。可能是你的搭档删除了它。',

  'together.leave': '退出一起记账',
  'together.leaveConfirm': '再点一次退出',
  'together.leave.note':
    '退出后，你们两人的一起记账都会结束，共同存钱罐也会从我们的服务器上删除。各自存入的记录会留在各自的手机上。',
  'together.deleteAccount': '删除一起记账账户',
  'together.deleteConfirm': '再点一次删除你的账户',
  'together.delete.note':
    '会删除你的登录信息和你共享的所有内容，并告知 Apple：6pm 不再使用你的 Apple 账户。你自己的日常记账会留在这台手机上。',
  'together.kept.title': '保存在这台 iPhone 上',
  'together.kept.sub': '你存进共同存钱罐的钱：{amount}。存钱罐不在了，这条记录也会留在这里。',

  'together.join.title': '加入一起记账',
  'together.join.sub':
    '有人邀请你在 6pm 上共用存钱罐。通过 Apple 登录即可加入。你自己的日常记账只留在你的手机上。',
  'together.join.button': '加入',
  'together.join.expired': '这个邀请已过期。请对方发一个新链接。',
  'together.join.used': '这个邀请已经被用过了。请对方发一个新链接。',
  'together.join.full': '那里已经有两个人在共用存钱罐了。',
  'together.join.own': '这是你自己的邀请。发给和你一起存钱的人吧。',
  'together.join.paired': '你已经在和别人共用存钱罐。先退出一起记账，再重新打开这个链接。',
  'together.join.missing': '这个邀请链接无效。请对方再发一个。',

  'together.error.offline': '连不上 6pm。什么都没有改变。',
  'together.error.failed': '没有成功。什么都没有改变。',
  'together.ended': '一起记账已结束。你存入的记录会留在这台手机上。',
  'together.left': '你已退出一起记账。',
  'together.deleted': '一起记账账户已删除。',
  'together.joined': '加入成功。和 {name} 一起记账吧。',
};
