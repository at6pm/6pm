import type { Entry } from './catalogue-types';
import type { enMoneyIn } from './en-money-in';

// A pot is a "hũ"; Future you is "bạn của tương lai" (see vi-plan.ts).
export const viMoneyIn: { readonly [Key in keyof typeof enMoneyIn]: Entry } = {
  'moneyIn.name': 'Tiền vào',
  'moneyIn.hint': 'Phải để chia đều · lên để để dành',
  'moneyIn.hintNoSave': 'Phải để chia đều · xuống nếu không phải của bạn',
  'moneyIn.card.asIs': 'NGÀY MAI NHƯ CŨ',
  'moneyIn.card.spread': { other: 'CHIA ĐỀU {count} NGÀY' },
  'moneyIn.stamp.spread': 'CHIA ĐỀU',
  'moneyIn.stamp.futureYou': 'ĐỂ DÀNH',
  'moneyIn.btn.spread': 'Chia đều',
  'moneyIn.btn.futureYou': 'Tương lai',
  'moneyIn.undoSpread': 'Đã chia đều {name}',
  'moneyIn.undoSaved': 'Đã để dành {name}',
  'moneyIn.pill': 'BẠN CỦA TƯƠNG LAI',

  'moneyIn.extra.kicker': '{date} · NGÀY LƯƠNG',
  'moneyIn.extra.title': 'Lương về nhiều hơn rồi',
  'moneyIn.extra.category': 'Phần dư ngày lương',
  'moneyIn.extra.counted': '{amount} được tính là lương',
  'moneyIn.extra.plan': 'Tháng nào cũng vậy?',
  'moneyIn.extra.planTo': 'Đổi thành {amount}',

  'moneyIn.pay.title': 'Đây là lương của bạn?',
  'moneyIn.pay.sub':
    'Kế hoạch tính {income}. Nếu đúng là lương, khoản này đã nằm trong các ngày rồi.',
  'moneyIn.pay.subExtra':
    'Kế hoạch tính {income}. Nếu đúng là lương, phần dư {extra} sẽ hiện ngay sau để bạn xếp chỗ.',
  'moneyIn.pay.yes': 'Đúng, lương của mình',
  'moneyIn.no': 'Không, khoản khác',
  'moneyIn.today': 'HÔM NAY',

  'moneyIn.refund.title': 'Đây là tiền {name} hoàn lại?',
  'moneyIn.refund.sub':
    'Nếu đúng, khoản đó được gạch trong nhật ký và {amount} quay lại các ngày của bạn.',
  'moneyIn.refund.yes': 'Đúng, tiền hoàn',
  'moneyIn.refund.line': 'HOÀN TIỀN',

  'moneyIn.payback.title': '{from} trả lại tiền {name}?',
  'moneyIn.payback.titleNoName': 'Có người trả lại tiền {name}?',
  'moneyIn.payback.sub': 'Chỉ phần của bạn được tính, nên con số giữ nguyên.',
  'moneyIn.payback.subClaim': 'Khoản công tác đã được trả lại. Con số giữ nguyên.',
  'moneyIn.payback.yes': 'Đúng, trả lại mình',
  'moneyIn.payback.line': 'TRẢ LẠI',

  'moneyIn.goesTo.label': 'Để vào đâu',
  'moneyIn.goesTo.spread': 'Chia đều',
  'moneyIn.goesTo.spreadSub': 'Ngày mai thành {amount}',
  'moneyIn.goesTo.futureYou': 'Bạn của tương lai',
  'moneyIn.goesTo.savedSub': '{from}, rồi {to}',
  'moneyIn.goesTo.potSub': '{saved} / {goal}, rồi {after}',
  'moneyIn.goesTo.payback': 'Trả lại mình',
  'moneyIn.goesTo.paybackSub': 'Cho hoá đơn chia hoặc khoản công tác',
  'moneyIn.goesTo.effectSpread': 'Mỗi ngày tới ngày lương được thêm {amount}.',
  'moneyIn.goesTo.effectSaved': 'Con số hôm nay giữ nguyên.',
  'moneyIn.goesTo.effectPot':
    'Con số hôm nay giữ nguyên, và hũ {pot} cần ít hơn mỗi tháng từ ngày lương tới.',
  'moneyIn.goesTo.effectPayback': 'Con số giữ nguyên.',
  'moneyIn.goesTo.done': 'Xong',

  'moneyIn.diary.spread': 'CHIA ĐỀU · +{amount} MỖI NGÀY',
  'moneyIn.diary.saved': 'ĐỂ DÀNH · {pot}',
  'moneyIn.diary.pay': 'LƯƠNG',
  'moneyIn.diary.refund': 'HOÀN TIỀN',
  'moneyIn.diary.payback': 'TRẢ LẠI',
  'moneyIn.diary.back': 'HOÀN {date}',
  'moneyIn.row.tag': 'Tiền vào',

  'plan.month.countOn': 'Khoản chắc chắn có',
  'plan.month.countOnHelp':
    'Số ít nhất về mỗi tháng, sau thuế. Nếu thu nhập lên xuống, hãy để thấp: phần dư sẽ được hỏi lúc chốt ngày.',
};
