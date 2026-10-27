import type { Entry } from '../catalogue-types';
import type { enSurfaces } from '../en-surfaces';

// Widget and Live Activity text is glanced at: keep it to a few characters.
export const zhHansSurfaces: { readonly [Key in keyof typeof enSurfaces]: Entry } = {
  'surfaces.scanQr': '扫码',
  'surfaces.safeTodayShort': '今天可以花',
  'surfaces.today': '今天',
  'surfaces.left': '剩余',
  'surfaces.amountLeft': '还剩 {amount}',
  'surfaces.spent': '已花 {amount}',
  'surfaces.ofLine': '共 {amount}',
  'surfaces.brandSafe': '6pm · 今天可以花',
  'surfaces.pending': { other: '{count} 笔待确认' },
  'surfaces.more': { other: '还有 {count} 笔' },
  'surfaces.listEmpty': '今天还没花钱',
  'surfaces.openApp': '打开 6pm',
  'surfaces.setUp': '打开 6pm 进行设置',
  'surfaces.activity.waiting': '等待中 · 付完轻点',
  'surfaces.activity.to': '付给 {merchant} {amount}',
  'surfaces.activity.toMerchant': '付给 {merchant}',
  'surfaces.activity.toMerchantBank': '付给 {merchant} · 已打开 {bank}',
  'surfaces.activity.waitingBank': '等待中 · {bank}',
  'surfaces.activity.paid': '已付',
  'surfaces.context.today': '今天',
  'surfaces.context.yesterday': '昨天',
  'surfaces.context.safeAfter': '今天可以花的钱变为 {amount}',
};
