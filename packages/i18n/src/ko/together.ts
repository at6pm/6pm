import type { Entry } from '../catalogue-types';
import type { enTogether } from '../en-together';

// "함께 예산" is the feature's name; a shared pot is "공동 저금통". The other person is "파트너",
// whoever they are to the user. Apple's button reads "Apple로 로그인".
export const koTogether: { readonly [Key in keyof typeof enTogether]: Entry } = {
  'together.title': '함께 예산',
  'together.card.subOn': '누군가를 초대해 저금통을 같이 채워 보세요.',
  'together.card.subPaired': { other: '{name} 님과 함께 · 공동 저금통 {count}개' },
  'together.card.open': '함께 예산 열기',
  'together.you': '나',
  'together.partner': '파트너',

  'together.intro.title': '같이 모아요.',
  'together.intro.sub':
    '함께 모으는 사람과 저금통을 공유하세요. 둘 다 돈을 넣을 수 있고, 누가 얼마를 넣었는지 서로 볼 수 있어요. 각자의 하루 기록은 각자의 폰에만 남아요.',
  'together.intro.note':
    'Apple로 로그인은 함께 예산에만 쓰여요. 6pm은 이름만 물어보고, 이메일은 절대 묻지 않아요.',
  'together.signIn.failed': 'Apple로 로그인하지 못했어요. 다시 시도해 주세요.',
  'together.signIn.unavailable': '이 iPhone에서는 Apple로 로그인을 쓸 수 없어요.',

  'together.waiting.title': '아직 혼자예요.',
  'together.waiting.sub': '함께 모으는 사람에게 링크를 보내세요. 참여하면 공동 저금통이 보여요.',
  'together.paired.title': '나 & {name}',
  'together.paired.sub': { other: '공동 저금통 {count}개' },
  'together.invite': '초대하기',
  'together.invite.again': '새 초대 링크 보내기',
  'together.invite.message': '6pm에서 같이 모아요: {url}',
  'together.invite.note': '초대 링크는 7일 동안, 한 번만 쓸 수 있어요.',
  'together.offline': '오프라인이에요. 마지막으로 본 내용이에요.',

  'together.pots.title': '공동 저금통',
  'together.newPot': '새 공동 저금통',
  'together.newPotSub': '둘이 함께 채워요.',
  'together.jar.add': '{name}에 {amount} 넣기',
  'together.jar.split': '나 {mine} · {partner} {theirs}',
  'together.jar.mine': '내가 넣은 돈 {mine}',

  'together.pot.edit': '공동 저금통 수정',
  'together.pot.start': '공동 저금통 시작',
  'together.pot.save': '저장',
  'together.pot.sumMonthly': '둘이 합쳐 한 달에 {amount} 정도',
  'together.pot.sumSub': '내가 넣은 돈은 내 저금통에 넣은 것처럼 계산돼요.',
  'together.pot.sumNone': '기한 없음, 서두를 필요 없어요',
  'together.pot.sumNoneSub': '언제든 원할 때 넣으세요.',
  'together.pot.amount': '넣기',
  'together.pot.addButton': '{amount} 넣기',
  'together.pot.entries': '누가 얼마나 넣었나',
  'together.pot.empty': '아직 비어 있어요.',
  'together.pot.entry': '{who} · {day}',
  'together.pot.takeBack': '돌려받기',
  'together.pot.takeBackLabel': '{amount} 돌려받기',
  'together.pot.delete': '공동 저금통 삭제',
  'together.pot.deleteConfirm': '한 번 더 탭하면 두 사람 모두에게서 삭제돼요',
  'together.pot.deleted': '{name} 삭제됨',
  'together.pot.gone': '이 저금통은 없어졌어요. 파트너가 삭제했을 수 있어요.',

  'together.leave': '함께 예산 나가기',
  'together.leaveConfirm': '한 번 더 탭하면 나가요',
  'together.leave.note':
    '나가면 두 사람 모두 함께 예산이 끝나고, 공동 저금통은 서버에서 삭제돼요. 각자 넣은 돈은 각자의 폰에 남아요.',
  'together.deleteAccount': '함께 예산 계정 삭제',
  'together.deleteConfirm': '한 번 더 탭하면 계정이 삭제돼요',
  'together.delete.note':
    '로그인 정보와 공유한 모든 것을 삭제하고, 6pm이 더 이상 내 Apple ID를 쓰지 않는다고 Apple에 알려요. 내 하루 기록은 이 폰에 그대로 남아요.',
  'together.kept.title': '이 iPhone에 보관됨',
  'together.kept.sub': '공동 저금통에 넣은 돈: {amount}. 저금통이 없어져도 여기 남아요.',

  'together.join.title': '함께 예산 참여하기',
  'together.join.sub':
    '누군가 6pm에서 저금통을 같이 쓰자고 초대했어요. Apple로 로그인해 참여하세요. 내 하루 기록은 내 폰에만 남아요.',
  'together.join.button': '참여',
  'together.join.expired': '만료된 초대예요. 새 링크를 요청하세요.',
  'together.join.used': '이미 사용된 초대예요. 새 링크를 요청하세요.',
  'together.join.full': '이미 두 사람이 저금통을 함께 쓰고 있어요.',
  'together.join.own': '내가 보낸 초대예요. 함께 모을 사람에게 보내 주세요.',
  'together.join.paired':
    '이미 저금통을 함께 쓰고 있어요. 함께 예산에서 먼저 나간 다음 링크를 다시 여세요.',
  'together.join.missing': '이 초대 링크는 작동하지 않아요. 새 링크를 요청하세요.',

  'together.error.offline': '6pm에 연결하지 못했어요. 바뀐 건 없어요.',
  'together.error.failed': '처리되지 않았어요. 바뀐 건 없어요.',
  'together.ended': '함께 예산이 끝났어요. 넣은 돈 기록은 이 폰에 남아요.',
  'together.left': '함께 예산에서 나갔어요.',
  'together.deleted': '함께 예산 계정을 삭제했어요.',
  'together.joined': '참여했어요. 이제 {name} 님과 함께 예산을 짜요.',
};
