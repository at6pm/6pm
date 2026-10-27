import type { Entry } from '../catalogue-types';
import type { enDuo } from '../en-duo';

// {month} arrives as a Chinese month name (十月), so “{month}的钱” reads naturally.
export const zhHansDuo: { readonly [Key in keyof typeof enDuo]: Entry } = {
  'duo.month.steady': '节奏刚好，稳稳的。',
  'duo.month.fast': '花得比日子快了一点。',
  'duo.month.paceLine': '{month}的钱已用 {used}%，这个月已过 {gone}%。',
  'duo.month.daily': '每日额度',
  'duo.day.ofLine': '当天额度 {line}',
  'duo.day.previous': '前一天',
  'duo.day.next': '后一天',
  'duo.ask.title': '如果你花 {amount}',
  'duo.ask.from': '来自问问 6pm 的预览',
  'duo.ask.spent': '已花 {spent} · 再花约 {amount}',
  'duo.ask.left': '还剩 {left}',
  'duo.close.kept': '今天已保留',
  'duo.close.ofLine': '今天额度 {line} · 还有 {left} 归你',
  'duo.close.foldLater': '逐笔决定，然后合上手机，结束今天。',
  'duo.close.foldNow': '合上手机，结束今天。',
  'duo.market.title': '在柜台',
  'duo.market.left': '今天还剩',
  'duo.market.add': '添加',
  'duo.market.leave': '离开柜台',
  'duo.scan.camera': '内屏摄像头',
  'duo.scan.looking': '正在找二维码',
  'duo.scan.stand': '把我立在柜台上，把对方的二维码举到上半屏。',
  'duo.scan.to': '付给 {payee}',
  'duo.scan.paid': '已付',
  'duo.drop.title': '把一条银行记录拖到这里',
  'duo.drop.sub': '6pm 会读出商家和金额，并归到对的分类。',
  'duo.drop.caught': '记下了 {merchant} · {amount}，等日结时确认。',
  'duo.drop.unread': '这条记录里没有金额。',
};
