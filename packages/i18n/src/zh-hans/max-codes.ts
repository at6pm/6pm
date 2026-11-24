import type { Entry } from '../catalogue-types';
import type { enMaxCodes } from '../en-max-codes';

export const zhHansMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: Entry } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': '送朋友 Max',
  'maxCodes.give.sub': '发送 Max 优惠链接',
  'maxCodes.give.message':
    '6pm 告诉我今天能花多少，还会自动记下每笔开销。送你一个 6pm Max 优惠：{url}',
  'maxCodes.give.failed': '无法打开分享，请重试。',
  'maxCodes.redeem': '兑换代码',
  'maxCodes.head.friend': '朋友送你 Max。',
  'maxCodes.head.code': '你的 Max 优惠。',
  'maxCodes.playHint': '在 Google Play 中，轻点付款方式，然后选择“兑换代码”。',
  'maxCodes.playHint.code':
    '已复制代码 {code}。在 Google Play 中，轻点付款方式，然后选择“兑换代码”。',
};
