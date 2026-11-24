import type { enMaxCodes } from './en-max-codes';

/** Mã Max: các dòng Max trong Cài đặt, lời nhắn kèm link tặng bạn, và chỗ đổi mã trên trang Max. */
export const viMaxCodes: { readonly [Key in keyof typeof enMaxCodes]: string } = {
  'maxCodes.section': '6pm Max',
  'maxCodes.give': 'Tặng bạn bè Max',
  'maxCodes.give.sub': 'Gửi đường link ưu đãi Max',
  'maxCodes.give.message':
    '6pm cho mình biết hôm nay tiêu được bao nhiêu và tự ghi chi tiêu luôn. Tặng bạn ưu đãi 6pm Max nè: {url}',
  'maxCodes.give.failed': 'Không mở được chia sẻ. Thử lại nhé.',
  'maxCodes.redeem': 'Nhập mã ưu đãi',
  'maxCodes.head.friend': 'Một người bạn tặng bạn Max.',
  'maxCodes.head.code': 'Ưu đãi Max của bạn.',
  'maxCodes.playHint': 'Trên Google Play, chạm vào phương thức thanh toán rồi chọn Đổi mã.',
  'maxCodes.playHint.code':
    'Đã sao chép mã {code}. Trên Google Play, chạm vào phương thức thanh toán rồi chọn Đổi mã.',
};
