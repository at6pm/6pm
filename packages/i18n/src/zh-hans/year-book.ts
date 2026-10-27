import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

// 6PM stays in capitals on the cover, as the English prints it.
export const zhHansYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': '12 月 31 日装订成册，十二本日记合为一本。',
  'yearBook.bound': '已于 12 月 31 日装订。轻点即可以 PDF 共享。',
  'yearBook.binding': '正在装订你的年度纪念册…',
  'yearBook.failed': '年度纪念册没装订成功，稍后再试一次。',
  'yearBook.shareTitle': '{year} 年度纪念册',
  'yearBook.cover.kicker': '6PM · 消费日记',
  'yearBook.cover.sub': { other: '{count} 本消费日记，于 12 月 31 日装订。' },
  'yearBook.cover.closed': { other: '{count} 天在 6PM 日结' },
  'yearBook.summary.kicker': '年度纪念册 · {year}',
  'yearBook.summary.headline.spare': '{year} 年圆满收官，你还余下 {amount}。',
  'yearBook.summary.headline.over': '今年稍稍超出了计划。{next} 年重新开始。',
  'yearBook.summary.futureYouSub': '今年存给未来的你',
  'yearBook.summary.contents': '日记目录',
};
