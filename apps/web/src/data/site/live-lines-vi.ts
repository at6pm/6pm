import type { LiveLines } from './live-lines';

export const liveLinesVi: LiveLines = {
  clock: (time, left) => `Chỗ bạn đang là ${time} · còn ${left} đến giờ chốt`,
  closeNow: 'Sáu giờ rồi. Chốt ngày thôi.',
  duration: (h, m) => (h ? `${h} giờ ${m} phút` : `${m} phút`),
  countdown: (d, h, m) => `Còn ${d} ngày ${h} giờ ${m} phút`,
  out: 'Đã ra mắt',
  sent: 'Bạn đã có tên. Hẹn lúc sáu giờ.',
  notAnEmail: 'Email này có vẻ chưa đúng.',
  busy: 'Thử nhiều lần quá. Đợi một phút rồi thử lại nhé.',
  unreachable: 'Chưa kết nối được. Kiểm tra mạng rồi thử lại nhé.',
};
