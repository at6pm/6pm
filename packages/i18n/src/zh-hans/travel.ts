import type { Entry } from '../catalogue-types';
import type { enTravel } from '../en-travel';

// {symbol} and {home} are currency symbols; 下方显示 is the home amount shown under the local one.
export const zhHansTravel: { readonly [Key in keyof typeof enTravel]: Entry } = {
  'travel.settings.label': '旅行模式',
  'travel.settings.sub': '出境时自动开启',
  'travel.settings.locationOff': '允许访问位置，才能知道你在国外',
  'travel.settings.stale': '{date} 的汇率',
  'travel.settings.noRates': '正在等待今天的汇率',
  'travel.pill': '{place} · 以 {symbol} 计，下方显示 {home}',
  'travel.activity.place': '{place} · 今天',
  'travel.activity.left': '还剩 {amount}',
  'travel.activity.over': '超出 {amount}',
  'travel.activity.of': '共 {line} · ≈ {vnd}',
  'travel.activity.leftOf': '剩余，共 {line} · ≈ {home}',
  'travel.activity.overOf': '超出 {line} · ≈ {home}',
  'travel.activity.leftHome': '剩余 · ≈ {home}',
  'travel.activity.overHome': '超出 · ≈ {home}',
  'travel.activity.log': '记 {symbol}',
  'travel.quick.underneath': '约 {amount}',
  'travel.quick.underneathStale': '约 {amount} · {date} 的汇率',
  'travel.quick.currency': '切换币种',
  'travel.scan.body':
    '用你的银行 App 付款：多数越南银行都支持这个码。6pm 以 {symbol} 记录，下方显示 ₫。',
  'travel.scan.bodyAway': '按当地的方式付款就好。6pm 以 {symbol} 记录，下方显示 {home}。',
  'travel.scan.keep': '已付 · 记下 {amount}',
  'travel.scan.logIn': '以 {symbol} 记录',
};
