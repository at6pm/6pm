/**
 * The pictures and clips the articles show: real captures of the 6pm app (a simulator recording
 * of the developer build, the Friday seed at 18:07 in Golden Hour) and the App Store screenshots.
 * An article names its hero in front matter (`hero`) and places the rest with a line of its own,
 * `<!-- media: <id> [<id>] -->`; two ids sit side by side.
 *
 * Every entry has words in both languages. Where only a Vietnamese capture exists (the Lock
 * Screen, widgets, the scanner), the English page shows it and its caption says so.
 */
import type { BlogLang } from './blog-copy';

/** What a picture says to someone who cannot see it, and the line printed under it. */
export interface MediaText {
  readonly alt: string;
  readonly caption: string;
}

/** A source under `src/assets/blog` (stills, posters) or `public/blog/clips` (clips), no extension. */
type Source = `${BlogLang}/${string}`;

interface Media {
  /** Which capture each language shows. */
  readonly src: Readonly<Record<BlogLang, Source>>;
  readonly text: Readonly<Record<BlogLang, MediaText>>;
  /** Where the screen's subject sits, when a hero or card shows only part of it. */
  readonly focus?: 'bottom';
}

const both = (name: string): Record<BlogLang, Source> => ({ en: `en/${name}`, vi: `vi/${name}` });
const viOnly = (name: string): Record<BlogLang, Source> => ({ en: `vi/${name}`, vi: `vi/${name}` });

/** Screens, one phone each. */
export const shots = {
  today: {
    src: both('today'),
    text: {
      en: {
        alt: '6pm’s Today screen at 18:07 in the Golden Hour look: Safe to spend today $14.38, $12 of $26 used, tomorrow about $27, and a card saying “It’s six. Close your day.” with four spends to confirm.',
        caption: 'Today: one number, safe to spend, with the evening’s close waiting underneath.',
      },
      vi: {
        alt: 'Màn hình Hôm nay của 6pm lúc 18:07, giao diện Giờ vàng: Hôm nay tiêu được 433.000₫, đã dùng 302k trên 735k, ngày mai khoảng 778k, và thẻ “Sáu giờ rồi. Chốt ngày thôi.” với 4 khoản cần xác nhận.',
        caption: 'Hôm nay: một con số tiêu được, lần chốt ngày đợi ngay bên dưới.',
      },
    },
  },
  'close-caught': {
    src: both('close-caught'),
    text: {
      en: {
        alt: 'The first step of the close: “4 things caught today”, a receipt card for Phở Hòa at $1.73 read from a QR payment, and the Edit, Not mine and Keep buttons.',
        caption:
          'The close: each caught spend comes up as a card. Right to keep, left to edit, down if it isn’t yours.',
      },
      vi: {
        alt: 'Bước đầu của lần chốt ngày: “Hôm nay bắt được 4 khoản”, thẻ biên lai Cà phê sữa đá 29.000₫ đọc từ biên lai MB Bank, cùng ba nút Sửa, Không phải tôi và Giữ.',
        caption:
          'Chốt ngày: mỗi khoản bắt được hiện thành một thẻ. Vuốt phải để giữ, trái để sửa, xuống nếu không phải của bạn.',
      },
    },
  },
  'close-receipt': {
    src: both('close-receipt'),
    text: {
      en: {
        alt: 'The day’s receipt printed by the close: six spends from Bánh mì Cô Ba to Circle K, total $11.62, safe tomorrow $27, the note “see you tomorrow, future you” and a red CLOSED 18:07 stamp.',
        caption: 'The day prints as a receipt and gets its stamp.',
      },
      vi: {
        alt: 'Biên lai cuối ngày do lần chốt in ra: bảy khoản từ Bánh mì Cô Ba đến Gửi xe, tổng 307.000₫, ngày mai tiêu được 777.000₫, dòng “mai gặp nha, bạn của tương lai” và dấu đỏ ĐÃ CHỐT 18:07.',
        caption: 'Cả ngày in thành một tờ biên lai, đóng dấu ĐÃ CHỐT.',
      },
    },
  },
  'close-tomorrow': {
    src: both('close-tomorrow'),
    text: {
      en: {
        alt: 'The last step of the close: safe to spend on Thursday 22 October, $27, under the line “Under a minute. Show-off.”, with $270 of free money for 10 days and 3 of 21 days closed this October.',
        caption: 'The close ends on tomorrow’s number.',
      },
      vi: {
        alt: 'Bước cuối của lần chốt: tiêu được thứ Năm 22 tháng 10, 778.000₫, dòng “Chưa tới một phút. Làm màu ghê.”, còn 7,8tr tiền rảnh cho 10 ngày và 3 trên 21 ngày đã chốt trong tháng 10.',
        caption: 'Lần chốt kết thúc bằng con số của ngày mai.',
      },
    },
  },
  'day-closed': {
    src: both('day-closed'),
    text: {
      en: {
        alt: 'Today after the close: “Day closed. Nicely done. Tomorrow is $27. See you at 18:00.”, a CLOSED stamp, and Monday to Wednesday ticked, 3 of 21 days closed this month.',
        caption: 'After the close, Today says so, and the week fills in.',
      },
      vi: {
        alt: 'Hôm nay sau khi chốt: “Đã chốt ngày. Giỏi lắm. Ngày mai được 778k. Hẹn bạn lúc 18:00.”, dấu ĐÃ CHỐT 18:57, thứ Hai đến thứ Tư đã tích, 3 trên 21 ngày đã chốt trong tháng.',
        caption: 'Chốt xong, màn hình Hôm nay ghi nhận, tuần dần được tích đủ.',
      },
    },
  },
  'quick-add': {
    src: both('quick-add'),
    text: {
      en: {
        alt: 'Quick add: a ticket for $4.50, Bubble tea, in Drinks and paid in cash, above the category row, the keypad and the Keep it button.',
        caption: 'Quick add: amount, a word, a category. Three taps.',
      },
      vi: {
        alt: 'Thêm nhanh: phiếu 45.000₫ cho Trà sữa, nhóm Đồ uống, trả tiền mặt, phía trên hàng nhóm chi tiêu, bàn phím số và nút Giữ lại.',
        caption: 'Thêm nhanh: số tiền, một chữ, một nhóm. Ba lần chạm.',
      },
    },
  },
  ask: {
    src: both('ask'),
    text: {
      en: {
        alt: '6pm’s App Store screenshot “Ask before you spend: can I afford it?”: Ask 6pm answers “Can I afford a $400 dinner Saturday?” with “Yes. The days after go from $71 to $52 until payday.”, with bars for now and after.',
        caption: 'Ask 6pm works the answer out from your own plan.',
      },
      vi: {
        alt: 'Hỏi 6pm: câu hỏi “Thứ Bảy đi ăn 2 triệu có được không?” và câu trả lời “Được. Những ngày sau từ 778k còn 578k đến ngày lương.”, kèm hai thanh so sánh và các dòng tính.',
        caption: 'Hỏi 6pm tính câu trả lời từ chính kế hoạch của bạn.',
      },
    },
  },
  plan: {
    src: both('plan'),
    text: {
      en: {
        alt: '6pm’s App Store screenshot “A budget planner that pays you first”: the Plan screen with $3.5k coming in this month, bills $840, pots $150, Future you $473, free money $2,017 for 22 days, $71 a day, and a slider for what Future you gets.',
        caption:
          'Plan: bills and Future you come off first; the rest is split over the days to payday.',
      },
      vi: {
        alt: 'Màn hình Kế hoạch: “Hoá đơn đã để riêng, bạn của tương lai cũng nhận phần trước rồi. 7,8tr còn lại là của bạn: 778k mỗi ngày tới ngày lương.”, tiền vào tháng này 17,4tr chia màu theo hoá đơn, bạn của tương lai, các dịp, đã tiêu và còn lại.',
        caption:
          'Kế hoạch: hoá đơn và bạn của tương lai được trừ trước, phần còn lại chia đều tới ngày lương.',
      },
    },
  },
  'store-inbox': {
    src: both('store-inbox'),
    text: {
      en: {
        alt: '6pm’s App Store screenshot “Six ways to log, one Inbox”: an Apple Pay tap of $5.80 at Corner Deli, a shared receipt, a bank email for $12.40, a voice note “lunch, twelve dollars”, a Back Tap shortcut and the keypad, all landing in one Inbox.',
        caption: 'Six ways in, one Inbox.',
      },
      vi: {
        alt: 'Ảnh App Store của 6pm “Sáu cách ghi, một hộp thư”: một mã VietQR 55.000₫, một biên lai chia sẻ, một email ngân hàng, một câu nói, phím tắt Back Tap và bàn phím số, tất cả về một Hộp thư.',
        caption: 'Sáu đường vào, một Hộp thư.',
      },
    },
  },
  'store-diary': {
    src: both('store-diary'),
    text: {
      en: {
        alt: '6pm’s App Store screenshot “A money diary you’ll actually keep”: the October diary cover, “Nine days closed. Future you is up $220.”, over a calendar of closed days.',
        caption: 'Every closed day is filed in the month’s diary.',
      },
      vi: {
        alt: 'Ảnh App Store của 6pm “Nhật ký chi tiêu bạn sẽ giữ được”: bìa nhật ký tháng 10 với các ngày đã chốt, trên lịch của cả tháng.',
        caption: 'Mỗi ngày đã chốt được lưu vào nhật ký của tháng.',
      },
    },
  },
  'store-companion': {
    src: both('store-companion'),
    text: {
      en: {
        alt: '6pm’s App Store screenshot “A companion that keeps you honest”: the companion characters above Today, saying “Suspiciously well-behaved today.”',
        caption: 'The companion teases the habit, never you.',
      },
      vi: {
        alt: 'Ảnh App Store của 6pm “Bạn đồng hành giữ bạn tỉnh táo”: các bạn đồng hành phía trên màn hình Hôm nay, nói “Hôm nay ngoan đáng ngờ.”',
        caption: 'Bạn đồng hành trêu thói quen, không trêu bạn.',
      },
    },
  },
  'store-ai': {
    src: both('store-ai'),
    text: {
      en: {
        alt: '6pm’s App Store screenshot “Private AI that runs offline”: the AI provider setting with On device and Cloud, the models Gemma 4 E2B, Gemma 4 E4B and Qwen3.5 4B on the phone, Anthropic Claude in the cloud, and “Airplane mode, still answers”.',
        caption: 'Settings → AI: keep the model on the phone, or use the cloud.',
      },
      vi: {
        alt: 'Ảnh App Store của 6pm “AI riêng tư, chạy cả khi offline”: phần Trợ lý AI với Trên máy và Đám mây, các mô hình Gemma 4 E2B, Gemma 4 E4B, Qwen3.5 4B và Anthropic Claude.',
        caption: 'Cài đặt → AI: giữ mô hình trên máy, hoặc dùng đám mây.',
      },
    },
  },
  'live-activity': {
    src: viOnly('live-activity'),
    text: {
      en: {
        alt: 'The Lock Screen with 6pm’s Live Activity, in Vietnamese: waiting, tap when paid, 45.000₫ for Phở Hòa, and a Paid button.',
        caption:
          'A QR payment waiting on the Lock Screen until you say it went through. Recorded in Vietnamese.',
      },
      vi: {
        alt: 'Màn hình khoá với Hoạt động trực tiếp của 6pm: Đang chờ, bấm khi đã trả, 45.000₫ cho Phở Hòa, nút Đã trả.',
        caption: 'Khoản trả QR đang chờ nằm trên màn hình khoá tới khi bạn bấm Đã trả.',
      },
    },
  },
  'home-widgets': {
    src: viOnly('home-widgets'),
    text: {
      en: {
        alt: 'The Home Screen with two 6pm widgets, in Vietnamese: a medium one with safe to spend today, 433k, and Scan QR and Quick add buttons, and a large Today list with 433k left, Circle K 120.000₫, bubble tea 45.000₫ and a Grab ride 38.000₫.',
        caption: 'Two Home Screen widgets: the number, and today’s list. Recorded in Vietnamese.',
      },
      vi: {
        alt: 'Màn hình chính với hai tiện ích 6pm: tiện ích vừa “Hôm nay tiêu được 433k” với nút Quét QR và Thêm nhanh, và tiện ích lớn “Hôm nay, còn 433k” liệt kê Circle K 120.000₫, Trà sữa 45.000₫, Grab ride home 38.000₫.',
        caption: 'Hai tiện ích trên Màn hình chính: con số, và danh sách hôm nay.',
      },
    },
  },
  'lock-widgets': {
    src: viOnly('lock-widgets'),
    text: {
      en: {
        alt: 'The Lock Screen at 19:17, in Vietnamese: the waiting-payment Live Activity for Phở Hòa, a rectangular 6pm widget reading safe to spend today 433k, one waiting, and a ring showing 433k left.',
        caption: 'The number on the Lock Screen, beside a waiting payment. Recorded in Vietnamese.',
      },
      vi: {
        alt: 'Màn hình khoá lúc 19:17: Hoạt động trực tiếp khoản chờ trả cho Phở Hòa, tiện ích chữ nhật “6pm · Hôm nay tiêu được 433k, 1 đang chờ” và vòng tròn 433k còn lại.',
        caption: 'Con số nằm ngay trên màn hình khoá, cạnh khoản đang chờ trả.',
      },
    },
  },
  'scan-receipt': {
    src: viOnly('scan-receipt'),
    text: {
      en: {
        alt: 'Scan after reading a receipt, in Vietnamese: the receipt from Quán Cơm Nhà Làm cut out and squared up, and a card with 75.000₫ in Food, and Retake and Save buttons.',
        caption:
          'A receipt cut out, squared up and read on the phone. Recorded in Vietnamese, from a photo.',
      },
      vi: {
        alt: 'Màn hình Quét sau khi đọc hoá đơn: tờ hoá đơn Quán Cơm Nhà Làm đã được cắt và làm thẳng, thẻ 75.000₫ nhóm Ăn uống, cùng nút Chụp lại và Lưu.',
        caption: 'Hoá đơn được cắt, làm thẳng và đọc ngay trên máy (ở đây đọc từ một ảnh).',
      },
    },
  },
  vietqr: {
    src: viOnly('vietqr'),
    focus: 'bottom',
    text: {
      en: {
        alt: 'The card 6pm shows after reading a VietQR code: Tra Sua Nha Lam, MB Bank account ending 4567, 45.000₫, the note “Tra sua”, and a button to pay in the bank app.',
        caption: 'A VietQR code, read: who, which bank, how much. Paying happens in your bank app.',
      },
      vi: {
        alt: 'Thẻ 6pm hiện sau khi đọc một mã VietQR: Tra Sua Nha Lam, MB Bank •••• 4567, 45.000₫, lời nhắn “Tra sua”, và nút Trả trong app ngân hàng.',
        caption:
          'Mã VietQR đã đọc: trả cho ai, ngân hàng nào, bao nhiêu. Việc trả diễn ra trong app ngân hàng.',
      },
    },
  },
  promptpay: {
    src: viOnly('promptpay'),
    focus: 'bottom',
    text: {
      en: {
        alt: 'The card 6pm shows for a Thai PromptPay code, in Vietnamese: it names the code as Thailand’s PromptPay and offers to log ฿180 by hand.',
        caption:
          'A foreign code is named and logged in its own currency, never paid from 6pm. Recorded in Vietnamese.',
      },
      vi: {
        alt: 'Thẻ 6pm cho một mã PromptPay: “Đây là mã PromptPay của Thái Lan”, kèm nút Ghi ฿180 bằng tay.',
        caption: 'Mã nước ngoài được gọi đúng tên và ghi theo tiền nước đó, 6pm không trả hộ.',
      },
    },
  },
} as const satisfies Record<string, Media>;

/** Short muted loops, played while on screen. */
export const clips = {
  'close-swipe-clip': {
    src: both('close-swipe'),
    text: {
      en: {
        alt: 'Screen recording: the close opens on “4 things caught today” and the spends are kept one by one with a swipe to the right.',
        caption: 'Swipe right to keep. Four spends, a few seconds.',
      },
      vi: {
        alt: 'Quay màn hình: lần chốt mở ra “Hôm nay bắt được 4 khoản”, từng khoản được giữ bằng một cú vuốt sang phải.',
        caption: 'Vuốt phải để giữ. Bốn khoản, vài giây.',
      },
    },
  },
  'close-stamp-clip': {
    src: both('close-stamp'),
    text: {
      en: {
        alt: 'Screen recording: the day’s receipt prints down from a slot and a red CLOSED 18:07 stamp lands on it.',
        caption: 'The receipt prints, the stamp lands.',
      },
      vi: {
        alt: 'Quay màn hình: biên lai trong ngày in xuống từ khe, rồi dấu đỏ ĐÃ CHỐT 18:07 đóng lên.',
        caption: 'Biên lai in ra, dấu đóng xuống.',
      },
    },
  },
  'number-roll-clip': {
    src: both('number-roll'),
    text: {
      en: {
        alt: 'Screen recording: tomorrow’s safe-to-spend number rolls digit by digit from $14.38 to $27.',
        caption: 'Tomorrow’s number rolls in, digit by digit.',
      },
      vi: {
        alt: 'Quay màn hình: con số tiêu được của ngày mai lăn từng chữ số từ 428.000₫ lên 777.000₫.',
        caption: 'Con số ngày mai lăn vào, từng chữ số một.',
      },
    },
  },
  'quick-add-clip': {
    src: both('quick-add'),
    text: {
      en: {
        alt: 'Screen recording: Quick add with $4.50 typed, the note Bubble tea, Drinks picked, Keep it tapped, and Today’s number dropping to $9.88.',
        caption: 'Logged in seconds, and Today’s number moves at once.',
      },
      vi: {
        alt: 'Quay màn hình: Thêm nhanh với 45.000₫, ghi chú Trà sữa, chọn Đồ uống, bấm Giữ lại, con số Hôm nay giảm còn 690.000₫.',
        caption: 'Ghi trong vài giây, con số Hôm nay đổi ngay.',
      },
    },
  },
  'live-activity-clip': {
    src: viOnly('live-activity'),
    text: {
      en: {
        alt: 'Screen recording, in Vietnamese: leaving 6pm shrinks a waiting QR payment into the Dynamic Island as a bowl icon and 45k; a long press opens it to show 45.000₫ for Phở Hòa with a Paid button.',
        caption: 'A waiting payment rides along in the Dynamic Island. Recorded in Vietnamese.',
      },
      vi: {
        alt: 'Quay màn hình: rời 6pm, khoản trả QR đang chờ thu vào Dynamic Island thành biểu tượng bát phở và 45k; nhấn giữ để mở ra 45.000₫ cho Phở Hòa với nút Đã trả.',
        caption: 'Khoản đang chờ trả đi theo bạn trên Dynamic Island.',
      },
    },
  },
  'sky-day-clip': {
    src: viOnly('sky-day'),
    text: {
      en: {
        alt: 'Screen recording, in Vietnamese: the Golden Hour look card as its time slider is dragged from 06:00 to midnight; the sky runs from dawn through noon and sunset to a starry night.',
        caption: 'One look, a whole day of sky, drawn live. Recorded in Vietnamese.',
      },
      vi: {
        alt: 'Quay màn hình: thẻ giao diện Giờ vàng khi kéo thanh thời gian từ 06:00 tới nửa đêm; bầu trời đi từ bình minh, trưa, hoàng hôn tới đêm sao.',
        caption: 'Một giao diện, cả một ngày trời, vẽ trực tiếp.',
      },
    },
  },
  'scan-receipt-clip': {
    src: viOnly('scan-receipt'),
    text: {
      en: {
        alt: 'Screen recording, in Vietnamese: Scan’s viewfinder sweeps, then a receipt from Quán Cơm Nhà Làm appears cut out and squared up, read as 75.000₫ in Food.',
        caption:
          'Read on the phone: the shop, the total, the category. Recorded in Vietnamese, from a photo.',
      },
      vi: {
        alt: 'Quay màn hình: khung Quét quét qua, rồi tờ hoá đơn Quán Cơm Nhà Làm hiện ra đã cắt thẳng, đọc được 75.000₫ nhóm Ăn uống.',
        caption: 'Đọc ngay trên máy: tên quán, tổng tiền, nhóm chi tiêu (ở đây từ một ảnh có sẵn).',
      },
    },
  },
} as const satisfies Record<string, Media>;

export type ShotId = keyof typeof shots;

/** Whether a screen is best cropped from the bottom (its subject sits low). */
export function lowFocus(id: ShotId): boolean {
  const shot: Media = shots[id];
  return shot.focus === 'bottom';
}
export type ClipId = keyof typeof clips;

/** The shot ids, for the content schema. */
export const shotIds = Object.keys(shots) as [ShotId, ...ShotId[]];
