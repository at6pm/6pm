import type { Entry } from './catalogue-types';
import type { enNotifications } from './en-notifications';

export const viNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': 'Ngày lương',
  'notify.channel.capture': 'Bắt chi tiêu',
  'notify.channel.reminders': 'Nhắc bạn đã hẹn',

  'notify.close.leadSix': 'Sáu giờ rồi.',
  'notify.close.leadAt': '{time} rồi.',

  'notify.close.jarReady.soft': '{lead} Hũ {jar} của bạn sẵn sàng rồi.',
  'notify.close.jarReady.cheeky': '{lead} Hũ {jar} sẵn sàng rồi. Vào ngó thử đi.',
  'notify.close.jarReady.roast': '{lead} Hũ {jar} đầy thiệt rồi. Ai ngờ bạn làm được.',
  'notify.close.jarReady.plain': '{lead} Hũ {jar} đã sẵn sàng.',

  'notify.close.countdown.soft': { other: '{lead} Còn {count} ngày nữa là {festival}.' },
  'notify.close.countdown.cheeky': {
    other: '{lead} Còn {count} ngày nữa là {festival}. Treo đèn lồng thôi.',
  },
  'notify.close.countdown.roast': {
    other: '{lead} Còn {count} ngày nữa là {festival}. Giữ chặt ví nha.',
  },
  'notify.close.countdown.plain': { other: '{lead} Còn {count} ngày nữa là {festival}.' },
  'notify.close.countdownJar.soft': {
    other: '{lead} Còn {count} ngày nữa là {festival}. Hũ {festival} đang có {amount}.',
  },
  'notify.close.countdownJar.cheeky': {
    other: '{lead} Còn {count} ngày nữa là {festival}. Hũ đang ôm {amount} nè.',
  },
  'notify.close.countdownJar.roast': {
    other: '{lead} Còn {count} ngày nữa là {festival}. {amount} trong hũ. Canh kỹ nha.',
  },
  'notify.close.countdownJar.plain': {
    other: '{lead} Còn {count} ngày nữa là {festival}. Hũ {festival} có {amount}.',
  },

  'notify.close.pay.soft': '{lead} Lương đang chờ bạn xếp chỗ.',
  'notify.close.pay.cheeky': '{lead} Lương về rồi. Vào giao việc cho nó đi.',
  'notify.close.pay.roast': '{lead} Lương về rồi. Xếp chỗ trước khi nó đi lạc.',
  'notify.close.pay.plain': '{lead} Lương đang chờ xếp chỗ.',

  'notify.close.bonus.soft': '{lead} Thưởng {festival} đang chờ bạn xếp chỗ.',
  'notify.close.bonus.cheeky': '{lead} Thưởng {festival} về rồi. Vào chia thôi.',
  'notify.close.bonus.roast': '{lead} Thưởng {festival} về rồi. Xếp chỗ trước khi shop thấy.',
  'notify.close.bonus.plain': '{lead} Thưởng {festival} đang chờ xếp chỗ.',

  'notify.close.payback.soft': '{lead} {name} trả tiền bạn rồi.',
  'notify.close.payback.cheeky': '{lead} {name} trả tiền rồi. Tình bạn vẫn nguyên.',
  'notify.close.payback.roast': '{lead} {name} trả tiền thiệt luôn.',
  'notify.close.payback.plain': '{lead} {name} đã trả tiền.',

  'notify.close.moneyIn.soft': '{lead} Có tiền vào. Đang chờ bạn chốt ngày.',
  'notify.close.moneyIn.cheeky': '{lead} Có tiền vào. Vào chỉ đường cho nó đi.',
  'notify.close.moneyIn.roast': '{lead} Có tiền vào. Đừng để nó nảy ý định.',
  'notify.close.moneyIn.plain': '{lead} Có tiền vào. Xếp chỗ khi chốt ngày.',

  'notify.close.yearCard.soft': '{lead} Năm {year} của bạn đã sẵn sàng để nhìn lại.',
  'notify.close.yearCard.cheeky': '{lead} Năm {year} của bạn xong rồi. Xem không?',
  'notify.close.yearCard.roast': '{lead} Cả năm {year} của bạn đây. Dám xem không?',
  'notify.close.yearCard.plain': '{lead} Năm {year} đã sẵn sàng để nhìn lại.',

  'notify.payday.amounts.soft': 'Ngày lương. {jars} vào các hũ, {daily} mỗi ngày đến {date}.',
  'notify.payday.amounts.cheeky': 'Lương về! {jars} vào các hũ, {daily} mỗi ngày đến {date}.',
  'notify.payday.amounts.roast':
    'Ngày lương. {jars} cất đi trước khi kịp tiêu, {daily} mỗi ngày đến {date}.',
  'notify.payday.amounts.plain': 'Ngày lương. {jars} vào các hũ, {daily} mỗi ngày đến {date}.',
  'notify.payday.noJars': 'Ngày lương. {daily} mỗi ngày đến {date}.',
  'notify.payday.hidden': 'Ngày lương. Các hũ đã được bỏ tiền.',
  'notify.payday.hiddenNoJars': 'Ngày lương. Tháng mới bắt đầu.',

  'notify.firstCatch.amounts.soft': 'Bắt được khoản đầu tiên: {amount} · {name}. Chỉ vậy thôi.',
  'notify.firstCatch.amounts.cheeky': 'Bắt được khoản đầu tiên: {amount} · {name}. Dễ ha?',
  'notify.firstCatch.amounts.roast': 'Bắt được khoản đầu tiên: {amount} · {name}. Có đau đâu.',
  'notify.firstCatch.amounts.plain': 'Khoản đầu tiên: {amount} · {name}.',
  'notify.firstCatch.hidden': 'Bắt được khoản đầu tiên từ {name}. Chỉ vậy thôi.',
  'notify.firstCatch.noName': 'Bắt được khoản đầu tiên. Chỉ vậy thôi.',

  'notify.quiet.soft': '{count} ngày nay không có gì từ {way}. Phím tắt tự động còn bật không?',
  'notify.quiet.cheeky': '{count} ngày nay {way} im re. Bạn tiết kiệm, hay phím tắt bị tắt?',
  'notify.quiet.roast': '{count} ngày nay {way} im re. Hoặc bạn là thánh, hoặc phím tắt tắt rồi.',
  'notify.quiet.plain': '{count} ngày nay không có gì từ {way}. Kiểm tra phím tắt tự động.',
  'notify.quiet.yourAlerts': 'thông báo ngân hàng',

  'notify.owed.one.soft': '{name} còn nợ bạn {amount}. Lúc nào tiện thì nhắc nha.',
  'notify.owed.one.cheeky': '{name} còn nợ bạn {amount}. Nhắc nhẹ một cái?',
  'notify.owed.one.roast': '{name} còn nợ bạn {amount}. Tiền của bạn nhớ bạn đó.',
  'notify.owed.one.plain': '{name} còn nợ bạn {amount}.',
  'notify.owed.oneHidden': '{name} còn nợ bạn. Lúc nào tiện thì nhắc nha.',
  'notify.owed.noName': 'Còn {amount} người ta nợ bạn.',
  'notify.owed.noNameHidden': 'Có người còn nợ bạn. Lúc nào tiện thì nhắc nha.',
  'notify.owed.many': '{count} người còn nợ bạn {amount}.',
  'notify.owed.manyHidden': '{count} người còn nợ bạn.',

  'settings.notifications': 'Thông báo',
  'settings.notificationsOn': 'Bật',
  'notify.settings.title': 'Thông báo',
  'notify.settings.phone': 'Trên điện thoại này',
  'notify.settings.allowed': 'Đã cho phép',
  'notify.settings.turnOn': 'Bật lên',
  'notify.settings.offInSettings': 'Đang tắt trong Cài đặt',
  'notify.settings.offSub': 'Chưa bật thì không có gì đến được với bạn.',
  'notify.settings.kinds': '6pm gửi gì',
  'notify.kind.close': 'Nhắc chốt ngày',
  'notify.kind.close.sub': 'Mỗi ngày lúc {time}, kèm tin trong ngày',
  'notify.kind.payday': 'Ngày lương',
  'notify.kind.payday.sub': 'Sáng ngày lương về, lúc 08:30',
  'notify.kind.capture': 'Bắt chi tiêu',
  'notify.kind.capture.sub': 'Khoản đầu tiên, và cách bắt bỗng im lặng',
  'notify.kind.reminders': 'Nhắc bạn đã hẹn',
  'notify.kind.reminders.sub': 'Ai nợ bạn, vào ngày bạn chọn',
  'notify.settings.lockScreen': 'Màn hình khóa',
  'notify.settings.amounts': 'Hiện số tiền trên màn hình khóa',
  'notify.settings.amounts.sub': 'Khi tắt, lời nhắc không có con số',
  'notify.settings.note':
    'Mỗi ngày một lần là đủ: lời nhắc chốt ngày mang theo tin trong ngày. Nhiều nhất thêm một thông báo nữa, và từ 22:00 đến 08:00 chỉ có giờ chốt của bạn.',

  'owed.remind.button': 'Nhắc tôi',
  'owed.remind.threeDays': '3 ngày nữa',
  'owed.remind.week': '1 tuần nữa',
  'owed.remind.payday': 'Ngày lương',
  'owed.remind.set': 'Sẽ nhắc {date}',
  'owed.remind.cancel': 'Thôi, không nhắc',
  'owed.remind.toast': 'Mình sẽ nhắc bạn {date} lúc 10:00.',
  'owed.remind.off': 'Nhắc bạn đã hẹn đang tắt trong Cài đặt.',
};
