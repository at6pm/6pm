import type { Entry } from './catalogue-types';
import type { enWork } from './en-work';

export const viWork: { readonly [Key in keyof typeof enWork]: Entry } = {
  'work.stamp': 'VIỆC',
  'work.stampOffered': 'VIỆC?',
  'work.perDay': '+{amount} MỖI NGÀY',
  'work.landing': 'Từ việc',

  'work.banks.title': 'Khoản nào trong này là tiền việc?',
  'work.banks.sub':
    'Để tiền tiệm không lẫn vào con số của bạn. Đổi lúc nào cũng được trong Ngân hàng.',
  'work.banks.line': 'Chạm để đóng dấu.',
  'work.banks.payWith': 'THANH TOÁN BẰNG',
  'work.banks.places': { other: '{count} NƠI' },
  'work.banks.alwaysSub': 'Tiền khách chuyển về đây',
  'work.banks.sometimesSub': 'Vừa tiền tiệm, vừa tiền nhà',
  'work.banks.neverSub': 'Tiền nhà',
  'work.key.always': 'Luôn là tiền việc',
  'work.key.alwaysSub': 'về là có dấu',
  'work.key.sometimes': 'Thỉnh thoảng',
  'work.key.sometimesSub': '6pm hỏi, chạm một lần',
  'work.key.never': 'Không bao giờ',
  'work.key.neverSub': 'không hỏi',

  'work.close.hint': 'Vuốt phải để giữ · chạm con dấu nếu là chi cho việc',
  'work.close.yoursSpend': 'CỦA BẠN · TÍNH HÔM NAY',
  'work.close.workSpend': 'CỦA VIỆC · NGÀY VẪN GIỮ',
  'work.close.yoursIn': 'CỦA BẠN · VÀO CÁC NGÀY',
  'work.close.workIn': 'CỦA VIỆC · DOANH THU HÔM NAY',
  'work.close.rememberedIn': 'Đã đóng dấu. Từ giờ tiền của {name} là tiền việc.',
  'work.close.rememberedShop': 'Đã đóng dấu. Từ giờ {name} là chi cho việc.',

  'work.takings.title': 'Doanh thu hôm nay',
  'work.takings.caught': { other: 'ĐÃ BẮT · {count} LẦN CHUYỂN KHOẢN' },
  'work.takings.cash': 'TIỀN MẶT',
  'work.takings.total': 'DOANH THU',
  'work.takings.costs': 'CHI CHO VIỆC HÔM NAY',
  'work.takings.kept': 'CÒN LẠI',
  'work.takings.into': 'VÀO CÁC NGÀY TỪ MAI',
  'work.takings.waits': 'ĐỂ Ở TIỆM',

  'work.today.takings': 'Doanh thu {amount}',
  'work.today.soFar': ' · đến giờ',
  'work.today.row': { other: 'Chi cho việc · {count} khoản' },
  'work.today.notCounted': 'không tính',

  'work.diary.everything': 'Tất cả',
  'work.diary.work': 'Việc',
  'work.diary.in': 'VÀO',
  'work.diary.caught': { other: 'ĐÃ BẮT · {count} LẦN CHUYỂN KHOẢN' },
  'work.diary.week': 'TUẦN NÀY',
  'work.diary.weekLine': 'VÀO {in} · RA {out} · CÒN {kept}',
  'work.diary.empty': 'Tuần này chưa có gì đóng dấu việc.',
  'work.diary.open': 'Chưa chốt',

  'work.card.title': 'Việc',
  'work.card.month': '{month}, đến ngày {day}',
  'work.card.in': 'Vào',
  'work.card.out': 'Ra',
  'work.card.kept': 'Còn lại',
  'work.card.notPaid': 'CHƯA TRẢ',
  'work.card.days': { other: '{count} ngày' },
  'work.card.diary': 'Nhật ký việc',
  'work.card.waiting': 'Chưa trả cho bạn · {amount}',

  'work.money.title': 'Tiền việc',
  'work.money.asItComes': 'Có lúc nào tính lúc đó',
  'work.money.asItComesSub':
    'Phần tiệm còn lại vào các ngày của bạn mỗi lần chốt. Đa số người bán chọn cách này.',
  'work.money.payMyself': 'Tự trả lương',
  'work.money.payMyselfSub':
    'Một khoản cố định mỗi tuần, như lương. Phần còn lại để ở tiệm cho đến khi bạn chuyển.',
  'work.money.note': 'Tự trả lương sẽ hỏi số tiền và thứ trong tuần, rồi tính như lương tuần.',
  'work.money.wage': 'Trả mỗi {weekday}',
  'work.card.owed': 'Tiệm còn nợ bạn {amount}',
};
