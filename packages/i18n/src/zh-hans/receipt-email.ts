import type { Entry } from '../catalogue-types';
import type { enReceiptEmail } from '../en-receipt-email';

export const zhHansReceiptEmail: { readonly [Key in keyof typeof enReceiptEmail]: Entry } = {
  'receiptEmail.copy': '拷贝地址',
  'receiptEmail.share': '分享你的 6pm 地址',
  'receiptEmail.offline': '联网后会显示你的地址',
  'receiptEmail.from': '来自 {address}',
  'receiptEmail.deviceMode': 'AI 只在这台 iPhone 上运行时关闭',
  'receiptEmail.deviceMode.body':
    '小票邮件需要我们的服务器读取你的邮件，所以当 6pm 让 AI 只在这台 iPhone 上运行时，它会关闭。可以改为分享或扫描小票。',
  'receiptEmail.check.title': '{provider} 请求确认从 {address} 转发邮件',
  'receiptEmail.check.titleNoAddress': '{provider} 请求确认转发邮件到 6pm',
  'receiptEmail.check.code': '确认码',
  'receiptEmail.check.copy': '拷贝',
  'receiptEmail.check.copyLabel': '拷贝确认码',
  'receiptEmail.check.copied': '确认码已拷贝。',
  'receiptEmail.check.hint':
    '打开确认页面，或者把确认码粘贴到 {provider} 的设置里。之后转发的小票就会出现在这里。',
  'receiptEmail.check.open': '打开确认页面',
  'receiptEmail.check.openFailed': '没能打开页面。改为拷贝确认码吧。',
  'receiptEmail.check.hintNoCode': '打开确认页面并点按“确认”。之后转发的小票就会出现在这里。',
  'receiptEmail.check.openFailedNoCode': '没能打开页面。稍后再试。',
  'receiptEmail.check.done': '完成',
};
