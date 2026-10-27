import type { Entry } from './catalogue-types';
import type { enCaptureAlerts } from './en-capture-alerts';

/** The labels inside the pictured screens are the Vietnamese iOS ones. */
export const viCaptureAlerts: { readonly [Key in keyof typeof enCaptureAlerts]: Entry } = {
  'native.intents.catchAlert.title': 'Bắt thông báo ngân hàng',
  'native.intents.catchAlert.description':
    'Đọc thông báo của ngân hàng hoặc ví ngay trên iPhone và để khoản tiền vừa chuyển động vào Inbox của 6pm. Mã OTP, giao dịch không thành công và khuyến mãi được bỏ qua.',
  'native.intents.catchAlert.alertTitle': 'Tiêu đề',
  'native.intents.catchAlert.subtitle': 'Tiêu đề phụ',
  'native.intents.catchAlert.body': 'Nội dung',
  'native.intents.catchAlert.date': 'Ngày',
  'native.intents.catchAlert.app': 'Ứng dụng',

  'capture.alerts.name': 'Thông báo ngân hàng',
  'capture.alerts.sub': 'Thông báo của ngân hàng và ví tự ghi vào 6pm',
  'capture.alerts.headline': 'Ngân hàng báo tới đâu, 6pm ghi tới đó.',
  'capture.alerts.time': 'Khoảng một phút, một lần',
  'capture.alerts.step1': 'Trong Phím tắt, tạo một tự động hóa cho thông báo',
  'capture.alerts.step1Chip': 'Tự động hóa → Thông báo',
  'capture.alerts.step2': 'Chọn các ứng dụng ngân hàng và ví của bạn',
  'capture.alerts.step3': 'Cho nó chạy “Bắt thông báo ngân hàng”',
  'capture.alerts.step3Chip': 'Bắt thông báo ngân hàng',
  'capture.alerts.tip':
    'Mã OTP, giao dịch không thành công và khuyến mãi được bỏ qua. Khoản đã bắt qua Apple Pay hay email sẽ không bị ghi hai lần.',
  'capture.alerts.privacy': 'Thông báo được đọc ngay trên iPhone và không bao giờ rời khỏi máy.',
  'capture.alerts.cameIn': '{amount} vào',
  'capture.alerts.skip.code': 'mã OTP, đã bỏ qua',
  'capture.alerts.skip.failed': 'giao dịch lỗi, đã bỏ qua',
  'capture.alerts.skip.promo': 'khuyến mãi, đã bỏ qua',
  'capture.alerts.skip.balance': 'báo số dư, đã bỏ qua',
  'capture.alerts.skip.security': 'báo bảo mật, đã bỏ qua',
  'capture.alerts.skip.unread': 'không phải giao dịch, đã bỏ qua',
  'capture.alerts.actionAdd': 'Lấy phím tắt của 6pm',
  'capture.alerts.actionOpen': 'Mở Phím tắt',

  'capture.walk.alerts.s1Title': 'Mở Tự động hóa và chạm +',
  'capture.walk.alerts.s1Body':
    'Trong Phím tắt, chạm Thư viện, rồi Tự động hóa, rồi +. Nếu thấy “Mô tả phím tắt”, chạm Sửa.',
  'capture.walk.alerts.s2Title': 'Thêm bộ kích hoạt Thông báo',
  'capture.walk.alerts.s2Body':
    'Ở bảng phía dưới, chạm Tự động hóa rồi chạm Thông báo. Thẻ “Khi tôi nhận được thông báo từ Ứng dụng” sẽ hiện ra.',
  'capture.walk.alerts.s3Title': 'Chọn ngân hàng và ví',
  'capture.walk.alerts.s3Body':
    'Chạm Ứng dụng và chọn ngân hàng của bạn. Chạm + để thêm từng ứng dụng ngân hàng và ví khác bạn hay trả tiền.',
  'capture.walk.alerts.s4Title': 'Thêm “Bắt thông báo ngân hàng”',
  'capture.walk.alerts.s4Body':
    'Chạm Tìm kiếm, gõ “thông báo ngân hàng” rồi chạm Bắt thông báo ngân hàng của 6pm. Đặt Tiêu đề, Tiêu đề phụ, Nội dung và Ngày theo chính Thông báo đó.',
  'capture.walk.alerts.s5Title': 'Để Thông báo tắt, rồi quay lại',
  'capture.walk.alerts.s5Body':
    'Chạm › trên bộ kích hoạt: để Tự động hóa bật và Thông báo tắt, để thông báo được bắt lặng lẽ. Quay lại là đã lưu.',
  'capture.walk.alerts.s6Title': 'Thử ngay',
  'capture.walk.alerts.s6Body':
    'Trả một khoản nhỏ từ một trong các ứng dụng đó. Thông báo về là khoản tiền đã nằm trong Inbox.',
  'capture.walk.alerts.l1Title': 'Thêm phím tắt của 6pm',
  'capture.walk.alerts.l1Body':
    'Chạm “Lấy phím tắt của 6pm” ở trên, rồi Thêm phím tắt. Nó tên là “Catch a bank alert”.',
  'capture.walk.alerts.l2Body':
    'Mở nó trong Phím tắt, chạm Ứng dụng ở trên cùng và chọn ngân hàng, rồi chạm + cho từng ngân hàng và ví khác.',
  'capture.walk.alerts.mistake1':
    'Để trống Tiêu đề, Nội dung hoặc Ngày. Chạm từng ô và chọn của Thông báo, không thì chẳng ghi được gì.',
  'capture.walk.alerts.mistake2':
    'Bật Thông báo. Mỗi thông báo ngân hàng sẽ báo bạn thêm lần nữa thay vì được bắt lặng lẽ.',
  'capture.walk.alerts.mistake3':
    'Chỉ chọn một ứng dụng. Đánh dấu mọi ngân hàng và ví bạn dùng, cả MoMo và ZaloPay.',

  'capture.walk.ios.notification': 'Thông báo',
  'capture.walk.ios.notificationEx': '“Khi tôi nhận được thông báo từ Tin tức”',
  'capture.walk.ios.whenNotified': 'Khi tôi nhận được thông báo từ',
  'capture.walk.ios.notificationTitle': 'Thông báo › Tiêu đề',
  'capture.walk.ios.notificationBody': 'Thông báo › Nội dung',
  'capture.walk.ios.notificationDate': 'Thông báo › Ngày',
  'capture.walk.ios.notificationSummary': 'Khi tôi nhận được thông báo từ MB Bank hoặc MoMo',
  'capture.walk.ios.alertSearch': 'thông báo ngân hàng',
  'capture.walk.ios.now': 'bây giờ',
  'capture.walk.test.alertRow': 'Thông báo ngân hàng · chờ duyệt',

  'capture.siri.name': 'Nói với Siri',
  'capture.siri.sub': 'Nói “Log in 6pm”, rồi nói khoản gì',
  'capture.siri.headline': 'Ghi khoản chi bằng giọng nói, không cần mở 6pm.',
  'capture.siri.time': 'Không cần cài gì',
  'capture.siri.step1': 'Nói “Hey Siri, log in 6pm”',
  'capture.siri.step1Chip': 'Log in 6pm',
  'capture.siri.step2': 'Siri hỏi bao nhiêu. Nói món gì và bao nhiêu',
  'capture.siri.step2Chip': '“phở forty-five k”',
  'capture.siri.step3': 'Khoản chi vào ngay chi tiêu hôm nay',
  'capture.siri.step3Chip': 'Hôm nay',
  'capture.siri.tip':
    'Siri chưa nghe được tiếng Việt, nên hãy nói tiếng Anh với nó. Muốn nói tiếng Việt, giữ nút Thêm nhanh.',

  'capture.backTap.name': 'Chạm vào mặt sau',
  'capture.backTap.sub': 'Gõ hai lần vào mặt sau iPhone để ghi khoản chi',
  'capture.backTap.headline': 'Gõ hai lần sau lưng máy, Thêm nhanh mở ngay.',
  'capture.backTap.time': 'Ba mươi giây, một lần',
  'capture.backTap.step1': 'Mở Cài đặt, rồi Trợ năng, Cảm ứng, Chạm vào mặt sau',
  'capture.backTap.step1Chip': 'Chạm vào mặt sau',
  'capture.backTap.step2': 'Chọn Chạm hai lần, rồi Thêm nhanh của 6pm',
  'capture.backTap.step2Chip': 'Chạm hai lần → Thêm nhanh',
  'capture.backTap.step3': 'Gõ hai lần vào mặt sau iPhone. Thêm nhanh mở ra',
  'capture.backTap.step3Chip': 'Thêm nhanh',
  'capture.backTap.tip':
    'Không thấy Thêm nhanh? Trong Phím tắt, chạm +, thêm Thêm nhanh của 6pm rồi lưu. Chạm ba lần cũng được.',
  'capture.walk.ios.notificationSubtitle': 'Thông báo › Tiêu đề phụ',
  'capture.walk.ios.notify': 'Thông báo',
  'capture.walk.ios.cancel': 'Hủy',
};
