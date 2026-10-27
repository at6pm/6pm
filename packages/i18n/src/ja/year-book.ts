import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

export const jaYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': '12月31日に製本。12冊の日記を1冊に。',
  'yearBook.bound': '12月31日に製本しました。タップしてPDFで共有。',
  'yearBook.binding': 'イヤーブックを製本中…',
  'yearBook.failed': 'イヤーブックを製本できませんでした。少ししてからもう一度お試しください。',
  'yearBook.shareTitle': '{year}年のイヤーブック',
  'yearBook.cover.kicker': '6PM · お金日記',
  'yearBook.cover.sub': { other: '{count}冊のお金日記、12月31日に製本。' },
  'yearBook.cover.closed': { other: '6時に締めた日 {count}日' },
  'yearBook.summary.kicker': 'イヤーブック · {year}',
  'yearBook.summary.headline.spare': '{year}年は{amount}余らせて終わりました。',
  'yearBook.summary.headline.over': '今年はプランを少しオーバー。{next}年はまたまっさらから。',
  'yearBook.summary.futureYouSub': '今年貯めた額',
  'yearBook.summary.contents': '日記の目次',
};
