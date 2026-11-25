import type { LiveLines } from './live-lines';

export const liveLinesKo: LiveLines = {
  clock: (time, left) => `지금 ${time} · 다음 마감까지 ${left}`,
  closeNow: '6시예요. 하루를 마감해요.',
  duration: (h, m) => (h ? `${h}시간 ${m}분` : `${m}분`),
  countdown: (d, h, m) => `출시까지 ${d}일 ${h}시간 ${m}분`,
  out: '지금 출시',
  sent: '신청 완료! 6시에 만나요.',
  notAnEmail: '아직 이메일 주소 형식이 아니에요.',
  busy: '시도가 너무 많아요. 1분 뒤에 다시 해 주세요.',
  unreachable: '목록에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.',
};
