import type { Entry } from '../catalogue-types';
import type { enYearBook } from '../en-year-book';

export const koYearBook: { readonly [Key in keyof typeof enYearBook]: Entry } = {
  'yearBook.binds': '12월 31일에 완성돼요. 다이어리 열두 권을 한 권으로.',
  'yearBook.bound': '12월 31일에 완성됐어요. 탭해서 PDF로 공유해요.',
  'yearBook.binding': '이어북을 묶는 중…',
  'yearBook.failed': '이어북을 묶지 못했어요. 잠시 후 다시 시도해 주세요.',
  'yearBook.shareTitle': '{year} 이어북',
  'yearBook.cover.kicker': '6PM · 머니 다이어리',
  'yearBook.cover.sub': { other: '머니 다이어리 {count}권, 12월 31일에 묶었어요.' },
  'yearBook.cover.closed': { other: '6PM에 마감한 날 {count}일' },
  'yearBook.summary.kicker': '이어북 · {year}',
  'yearBook.summary.headline.spare': '{year}년, {amount} 남기고 마무리했어요.',
  'yearBook.summary.headline.over': '올해는 플랜보다 조금 넘었어요. {next}년은 새로 시작해요.',
  'yearBook.summary.futureYouSub': '올해 모은 돈',
  'yearBook.summary.contents': '다이어리 목록',
};
