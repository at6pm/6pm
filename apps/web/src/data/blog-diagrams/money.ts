/**
 * Diagrams for the money guides, in both languages, drawn from the articles' own worked examples
 * (a $4,000 take-home in English, a 10 million đồng salary in Hà Nội in Vietnamese).
 */
import type { BlogLang } from '../blog-copy';
import { W, arrow, bar, box, text, type Diagram } from './draw';

const L = 16;
const R = W - 16;
const inner = R - L;

/** How today's number is worked out: pay, minus what goes first, over the days to payday. */
export function formula(lang: BlogLang): Diagram {
  const t =
    lang === 'en'
      ? {
          rows: [
            ['Take-home pay', '$4,000', 4000],
            ['− Bills', '$2,185', 2185],
            ['− Pots', '$300', 300],
            ['− Future you (10%)', '$400', 400],
            ['= Free money', '$1,115', 1115],
          ] as const,
          divide: '÷ 30 days to payday, counting today',
          label: 'SAFE TO SPEND TODAY',
          result: '$37',
          note: '$1,115 ÷ 30 = $37.17, rounded down',
          text: {
            title: 'How today’s safe-to-spend number is worked out',
            desc: 'Take-home pay of $4,000, minus $2,185 of bills, $300 for a pot and $400 for Future you, leaves $1,115 of free money. Divided by the 30 days to payday, counting today, that is $37 safe to spend today.',
            caption:
              'Bills, pots and Future you come off first; the rest is spread over the days to payday.',
          },
        }
      : {
          rows: [
            ['Lương', '10.000.000₫', 10000],
            ['− Hoá đơn', '4.450.000₫', 4450],
            ['− Hũ Đà Lạt', '600.000₫', 600],
            ['− Bạn của tương lai (10%)', '1.000.000₫', 1000],
            ['= Tiền tự do', '3.950.000₫', 3950],
          ] as const,
          divide: '÷ 30 ngày tới kỳ lương, tính cả hôm nay',
          label: 'HÔM NAY TIÊU ĐƯỢC',
          result: '131.000₫',
          note: '3.950.000 ÷ 30 = 131.666, làm tròn xuống',
          text: {
            title: 'Con số tiêu được mỗi ngày được tính thế nào',
            desc: 'Lương 10.000.000₫, trừ 4.450.000₫ hoá đơn, 600.000₫ cho hũ Đà Lạt và 1.000.000₫ cho bạn của tương lai, còn 3.950.000₫ tiền tự do. Chia cho 30 ngày tới kỳ lương, tính cả hôm nay, được 131.000₫ mỗi ngày.',
            caption:
              'Hoá đơn, các hũ và bạn của tương lai được trừ trước; phần còn lại chia đều tới ngày lương.',
          },
        };
  const [first] = t.rows;
  const pay = first[2];
  const scale = (v: number) => (v / pay) * inner;
  let left = pay;
  let y = 20;
  const parts: string[] = [];
  t.rows.forEach(([name, amount, value], i) => {
    const last = i === t.rows.length - 1;
    parts.push(text(L, y + 12, name, { cls: last ? 'strong' : 'label' }));
    parts.push(text(R, y + 12, amount, { cls: last ? 'strong' : 'num', anchor: 'end' }));
    if (i === 0) parts.push(bar(L, y + 20, inner, 10, 'soft'));
    else if (last) parts.push(bar(L, y + 20, scale(value), 10, 'accent'));
    else {
      parts.push(bar(L + scale(left - value), y + 20, scale(value), 10, 'line'));
      left -= value;
    }
    y += 46;
  });
  parts.push(text(L, y + 10, t.divide, { cls: 'mono', size: 11.5 }));
  y += 28;
  parts.push(box(L, y, inner, 112, 'accent', 18));
  parts.push(text(L + 18, y + 26, t.label, { cls: 'on', size: 11 }));
  parts.push(text(L + 18, y + 70, t.result, { cls: 'big', size: 40 }));
  parts.push(text(L + 18, y + 96, t.note, { cls: 'on', size: 11 }));
  return { text: t.text, height: y + 128, body: parts.join('') };
}

/** Six ways a spend gets caught, one Inbox, the close, one number. */
export function capture(lang: BlogLang): Diagram {
  const t =
    lang === 'en'
      ? {
          ways: [
            'Apple Pay tap',
            'Bank alert email',
            'Receipt photo',
            'Your voice',
            'Share to 6pm',
            'QR code or keypad',
          ],
          inbox: ['Inbox', 'counts at once, even before you confirm'] as const,
          close: ['The close, at 18:00', 'keep, edit or not mine · about a minute'] as const,
          number: 'Safe to spend today',
          text: {
            title: 'Six ways a spend gets caught',
            desc: 'Apple Pay taps, bank alert emails, receipt photos, your voice, Share to 6pm and QR codes or the keypad all land in one Inbox, where each spend counts at once. At the close you keep, edit or skip each one, and the morning starts with one number: safe to spend today.',
            caption: 'Six ways in, one Inbox, one minute at the close, one number.',
          },
        }
      : {
          ways: [
            'Quét VietQR',
            'Chia sẻ biên lai',
            'Chụp hoá đơn',
            'Email hoá đơn',
            'Nói một câu',
            'Apple Pay, bàn phím',
          ],
          inbox: ['Hộp thư', 'trừ vào con số ngay, kể cả khi chưa xác nhận'] as const,
          close: ['Chốt ngày lúc 18:00', 'giữ, sửa hoặc không phải tôi · khoảng một phút'] as const,
          number: 'Hôm nay tiêu được',
          text: {
            title: 'Sáu cách để khoản chi tự vào sổ',
            desc: 'Quét VietQR, chia sẻ biên lai, chụp hoá đơn, email hoá đơn, nói một câu, Apple Pay và bàn phím đều đổ về một Hộp thư, mỗi khoản trừ vào con số ngay. Lúc chốt ngày bạn giữ, sửa hoặc bỏ từng khoản, và sáng mai có một con số: hôm nay tiêu được.',
            caption: 'Sáu đường vào, một Hộp thư, một phút chốt ngày, một con số.',
          },
        };
  const parts: string[] = [];
  const cw = (inner - 8) / 2;
  t.ways.forEach((way, i) => {
    const x = L + (i % 2) * (cw + 8);
    const y = 16 + Math.floor(i / 2) * 44;
    parts.push(box(x, y, cw, 36, 'card', 18));
    parts.push(text(x + cw / 2, y + 23, way, { cls: 'strong', anchor: 'middle', size: 13 }));
  });
  parts.push(arrow(W / 2, 148, W / 2, 170));
  parts.push(box(L, 172, inner, 56, 'card', 16));
  parts.push(text(L + 16, 196, t.inbox[0], { cls: 'strong' }));
  parts.push(text(L + 16, 216, t.inbox[1], { cls: 'faint', size: 12 }));
  parts.push(arrow(W / 2, 230, W / 2, 252));
  parts.push(box(L, 254, inner, 56, 'card', 16));
  parts.push(text(L + 16, 278, t.close[0], { cls: 'strong' }));
  parts.push(text(L + 16, 298, t.close[1], { cls: 'faint', size: 12 }));
  parts.push(arrow(W / 2, 312, W / 2, 334));
  parts.push(box(L, 336, inner, 50, 'accent', 25));
  parts.push(text(W / 2, 367, t.number, { cls: 'on', anchor: 'middle', size: 16 }));
  return { text: t.text, height: 400, body: parts.join('') };
}

/** Envelopes (or six jars) against one number. */
export function jars(lang: BlogLang): Diagram {
  const t =
    lang === 'en'
      ? {
          kicker: 'ENVELOPES · SIX BALANCES TO WATCH',
          items: [
            ['Groceries', '', 0.62],
            ['Eating out', '', 0.12],
            ['Gas', '', 0.48],
            ['Fun', '', 0.05],
            ['Shopping', '', 0.3],
            ['Gifts', '', 0.9],
          ] as const,
          one: 'ONE NUMBER · ONE THING TO CHECK',
          number: '$37',
          numberLabel: 'Safe to spend today',
          text: {
            title: 'Envelopes against one daily number',
            desc: 'Envelope budgeting keeps a balance per category, here six: groceries, eating out, gas, fun, shopping and gifts, each running down at its own pace. A daily number folds them into one figure, $37 safe to spend today.',
            caption: 'Six balances to babysit, or one number that already counts them.',
          },
        }
      : {
          kicker: '6 CHIẾC LỌ · SÁU SỐ DƯ PHẢI NHÌN',
          items: [
            ['Thiết yếu', '55% · 5,5tr', 0.55],
            ['Tự do tài chính', '10% · 1tr', 0.1],
            ['Tiết kiệm dài hạn', '10% · 1tr', 0.1],
            ['Giáo dục', '10% · 1tr', 0.1],
            ['Hưởng thụ', '10% · 1tr', 0.1],
            ['Cho đi', '5% · 500k', 0.05],
          ] as const,
          one: 'MỘT CON SỐ · MỘT THỨ PHẢI NHÌN',
          number: '131.000₫',
          numberLabel: 'Hôm nay tiêu được',
          text: {
            title: 'Sáu chiếc lọ và một con số mỗi ngày',
            desc: 'Với lương 10 triệu, sáu chiếc lọ chia thành Thiết yếu 55% (5,5 triệu), Tự do tài chính, Tiết kiệm dài hạn, Giáo dục, Hưởng thụ mỗi lọ 10% (1 triệu) và Cho đi 5% (500 nghìn). Một con số mỗi ngày gộp tất cả thành 131.000₫ hôm nay tiêu được.',
            caption: 'Sáu số dư phải canh, hay một con số đã tính sẵn cho bạn.',
          },
        };
  const parts: string[] = [text(L, 22, t.kicker, { cls: 'mono', size: 11 })];
  const cw = (inner - 8) / 2;
  t.items.forEach(([name, detail, fill], i) => {
    const x = L + (i % 2) * (cw + 8);
    const y = 36 + Math.floor(i / 2) * 64;
    parts.push(box(x, y, cw, 56, 'card', 12));
    parts.push(text(x + 12, y + 21, name, { cls: 'strong', size: 13 }));
    if (detail !== '')
      parts.push(text(x + cw - 12, y + 44, detail, { cls: 'num', anchor: 'end', size: 10.5 }));
    const track = detail === '' ? cw - 24 : cw - 110;
    parts.push(bar(x + 12, y + 37, track, 7, 'soft'));
    parts.push(bar(x + 12, y + 37, track * fill, 7, 'line'));
  });
  parts.push(text(L, 252, t.one, { cls: 'mono', size: 11 }));
  parts.push(box(L, 264, inner, 72, 'accent', 18));
  parts.push(text(L + 18, 292, t.numberLabel, { cls: 'on', size: 13 }));
  parts.push(text(L + 18, 324, t.number, { cls: 'big', size: 30 }));
  return { text: t.text, height: 350, body: parts.join('') };
}

/** Seven small leaks, a month each, from the leak audit articles. */
export function leaks(lang: BlogLang): Diagram {
  const t =
    lang === 'en'
      ? {
          rows: [
            ['Lattes', '$90', 90],
            ['Amazon impulse buys', '$75', 75],
            ['Delivery fees and tips', '$72', 72],
            ['Late-night rides and food', '$60', 60],
            ['Convenience stops', '$50', 50],
            ['Subscriptions', '$48', 48],
            ['Uncollected splits', '$40', 40],
          ] as const,
          total: ['A month', '$435'] as const,
          text: {
            title: 'Seven small leaks, added up for a month',
            desc: 'Lattes $90, Amazon impulse buys $75, delivery fees and tips $72, late-night rides and food $60, convenience stops $50, subscriptions $48 and uncollected splits $40: about $435 a month.',
            caption: 'None of them looks like much. Together: $435 a month.',
          },
        }
      : {
          rows: [
            ['Cà phê mang đi', '700.000₫', 700],
            ['Trà sữa', '585.000₫', 585],
            ['Ăn khuya, Grab đêm', '480.000₫', 480],
            ['Nạp game, livestream', '400.000₫', 400],
            ['Flash sale', '300.000₫', 300],
            ['Gói đăng ký', '250.000₫', 250],
            ['Phí ship, phí dịch vụ', '240.000₫', 240],
          ] as const,
          total: ['Một tháng', '2.955.000₫'] as const,
          text: {
            title: 'Bảy khoản rò rỉ nhỏ, cộng lại một tháng',
            desc: 'Cà phê mang đi 700.000₫, trà sữa 585.000₫, ăn khuya và Grab đêm 480.000₫, nạp game và livestream 400.000₫, flash sale 300.000₫, gói đăng ký 250.000₫, phí ship và phí dịch vụ 240.000₫: gần 3 triệu một tháng.',
            caption: 'Khoản nào cũng nhỏ. Cộng lại: gần 3 triệu một tháng.',
          },
        };
  const max = t.rows[0][2];
  const parts: string[] = [];
  let y = 18;
  for (const [name, amount, value] of t.rows) {
    parts.push(text(L, y + 12, name, { size: 13 }));
    parts.push(text(R, y + 12, amount, { cls: 'num', anchor: 'end', size: 12.5 }));
    parts.push(bar(L, y + 20, (value / max) * inner, 8, 'line'));
    y += 40;
  }
  parts.push(box(L, y + 4, inner, 48, 'accent', 24));
  parts.push(text(L + 20, y + 34, t.total[0], { cls: 'on', size: 14 }));
  parts.push(text(R - 20, y + 35, t.total[1], { cls: 'big', anchor: 'end', size: 22 }));
  return { text: t.text, height: y + 66, body: parts.join('') };
}

/** Budget together: two private days, one shared pot. */
export function couple(lang: BlogLang): Diagram {
  const t =
    lang === 'en'
      ? {
          people: [
            ['You', '+$660'],
            ['Alex', '+$580'],
          ],
          privateLines: ['your spending', 'your plan', 'your daily number'],
          privateLabel: 'ONLY YOU SEE',
          pot: ['Tokyo pot', '$1,240 of $3,000'] as const,
          fill: 1240 / 3000,
          note: 'Each of you sees the pot, never the other’s spending.',
          text: {
            title: 'Budget together: one shared pot, two private days',
            desc: 'You put $660 and Alex puts $580 into a shared Tokyo pot, which shows $1,240 of $3,000. Each person’s spending, plan and daily number stay private to them.',
            caption: 'Shared pots, private spending. 6pm counts; it never moves the money.',
          },
        }
      : {
          people: [
            ['Bạn', '+3.900.000₫'],
            ['Minh', '+3.500.000₫'],
          ],
          privateLines: ['chi tiêu của mình', 'kế hoạch tháng', 'con số mỗi ngày'],
          privateLabel: 'CHỈ MÌNH THẤY',
          pot: ['Hũ Đà Lạt', '7.400.000₫ / 18.000.000₫'] as const,
          fill: 7400 / 18000,
          note: 'Hai người cùng thấy hũ, không ai thấy chi tiêu của người kia.',
          text: {
            title: 'Cùng chia ngân sách: một hũ chung, hai ví riêng',
            desc: 'Bạn góp 3.900.000₫, Minh góp 3.500.000₫ vào hũ chung Đà Lạt, hũ có 7.400.000₫ trên 18.000.000₫. Chi tiêu, kế hoạch và con số mỗi ngày của mỗi người vẫn là riêng.',
            caption: 'Hũ chung, ví riêng. 6pm chỉ đếm, không bao giờ chuyển tiền.',
          },
        };
  const cw = (inner - 12) / 2;
  const parts: string[] = [];
  t.people.forEach(([name, put], i) => {
    const x = L + i * (cw + 12);
    parts.push(box(x, 16, cw, 112, 'card', 16));
    parts.push(text(x + 14, 40, name ?? '', { cls: 'strong', size: 15 }));
    parts.push(text(x + 14, 60, t.privateLabel, { cls: 'mono', size: 9.5 }));
    parts.push(text(x + 14, 82, t.privateLines, { cls: 'faint', size: 12 }));
    parts.push(arrow(x + cw / 2, 130, x + cw / 2 + (i === 0 ? 30 : -30), 176));
    parts.push(
      text(x + cw / 2 + (i === 0 ? -6 : 6), 158, put ?? '', {
        cls: 'num',
        anchor: i === 0 ? 'end' : 'start',
        size: 12,
      }),
    );
  });
  parts.push(box(L, 180, inner, 84, 'accent', 18));
  parts.push(text(L + 18, 208, t.pot[0], { cls: 'on', size: 15 }));
  parts.push(text(R - 18, 208, t.pot[1], { cls: 'on', anchor: 'end', size: 12.5 }));
  parts.push(bar(L + 18, 228, inner - 36, 12, 'track'));
  parts.push(bar(L + 18, 228, (inner - 36) * t.fill, 12, 'ink'));
  parts.push(text(W / 2, 292, t.note, { cls: 'faint', anchor: 'middle', size: 12 }));
  return { text: t.text, height: 306, body: parts.join('') };
}

/** What happens to a forwarded receipt email. */
export function email(lang: BlogLang): Diagram {
  const t =
    lang === 'en'
      ? {
          steps: [
            ['Your bank or a shop emails you', 'a card alert, an order, a renewal'],
            ['A filter forwards it', 'to your own address, like k7m2qx@at6pm.app'],
            ['Read in memory', 'no amount? dropped unread. Otherwise AI or rules'],
            ['Sealed until your phone fetches it', 'then deleted; the email itself is never kept'],
            ['Your Inbox', 'one spend, ready to keep at the close'],
          ],
          text: {
            title: 'What happens to a forwarded receipt email',
            desc: 'Your bank or a shop emails you; a filter forwards it to your own 6pm address; it is read in memory, and dropped unread if it prints no amount; what was read is sealed until your phone fetches it, then deleted; the spend appears in your Inbox.',
            caption: 'From alert email to Inbox. The email is read, never stored.',
          },
        }
      : {
          steps: [
            ['Ngân hàng hoặc cửa hàng gửi email', 'báo giao dịch, đơn hàng, gia hạn'],
            ['Bộ lọc chuyển tiếp email', 'về địa chỉ riêng, kiểu k7m2qx@at6pm.app'],
            ['Đọc trong bộ nhớ', 'không có số tiền: bỏ qua. Có thì AI hoặc quy tắc đọc'],
            ['Niêm phong tới khi máy bạn lấy về', 'rồi xoá; bản thân email không được lưu'],
            ['Hộp thư của bạn', 'một khoản chi, chờ bạn giữ lúc chốt ngày'],
          ],
          text: {
            title: 'Email hoá đơn được chuyển tiếp đi qua những đâu',
            desc: 'Ngân hàng hoặc cửa hàng gửi email; bộ lọc chuyển tiếp về địa chỉ 6pm riêng của bạn; email được đọc trong bộ nhớ, không có số tiền thì bỏ qua; phần đọc được niêm phong tới khi điện thoại lấy về rồi xoá; khoản chi hiện trong Hộp thư.',
            caption: 'Từ email ngân hàng tới Hộp thư. Email được đọc, không bao giờ được lưu.',
          },
        };
  const parts: string[] = [];
  t.steps.forEach(([head, sub], i) => {
    const y = 16 + i * 74;
    const last = i === t.steps.length - 1;
    parts.push(box(L, y, inner, 54, last ? 'accent' : 'card', 16));
    parts.push(text(L + 16, y + 23, head ?? '', { cls: last ? 'on' : 'strong', size: 14 }));
    parts.push(text(L + 16, y + 42, sub ?? '', { cls: last ? 'on' : 'faint', size: 12 }));
    if (!last) parts.push(arrow(W / 2, y + 56, W / 2, y + 72));
  });
  return { text: t.text, height: 16 + t.steps.length * 74 - 4, body: parts.join('') };
}
