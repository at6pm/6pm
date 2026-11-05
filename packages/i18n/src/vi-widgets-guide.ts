import type { Entry } from './catalogue-types';
import type { enWidgetsGuide } from './en-widgets-guide';

export const viWidgetsGuide: { readonly [Key in keyof typeof enWidgetsGuide]: Entry } = {
  'widgetsGuide.title': 'Tiện ích & điều khiển',
  'widgetsGuide.headline': '6pm, chỉ một cái liếc hay một lần bấm.',
  'widgetsGuide.lede':
    'Để số tiêu được hôm nay ở chỗ bạn vẫn nhìn, và mở Quét QR hay Thêm nhanh mà không cần tìm app.',
  'widgetsGuide.lookMax': 'Vẽ theo giao diện của bạn.',
  'widgetsGuide.lookFree': 'Miễn phí, màu Golden Hour. Có Max thì theo giao diện của bạn.',
  'widgetsGuide.hide.title': 'Ẩn số tiền',
  'widgetsGuide.hide.what': 'Tiện ích hiện ••• cho đến khi Face ID mở khoá máy.',
  'widgetsGuide.hide.whatAndroid': 'Tiện ích hiện ••• thay cho mọi số tiền.',
  'widgetsGuide.howToAdd': 'Cách thêm',
  'widgetsGuide.whenItShows': 'Khi nào hiện',

  'widgetsGuide.home.title': 'Tiện ích Màn hình chính',
  'widgetsGuide.home.what':
    'Những tấm bưu thiếp nhỏ của ngày: bầu trời thật của giờ này, mặt trời ở đúng chỗ, và một con số.',
  'widgetsGuide.home.small': 'Nhỏ',
  'widgetsGuide.home.medium': 'Vừa',
  'widgetsGuide.home.large': 'Lớn',
  'widgetsGuide.home.smallWhat':
    'Con số hôm nay trên bầu trời của nó, một hũ đếm ngược, hoặc những tối bạn chốt liên tiếp.',
  'widgetsGuide.home.mediumWhat': 'Con số cùng bầu trời và các hũ của bạn. Chạm vào hũ để mở.',
  'widgetsGuide.home.largeWhat':
    'Cả tháng thành những mặt trời: mỗi tối bạn đã chốt, và bao nhiêu lần trong mức.',
  'widgetsGuide.home.step1': 'Chạm và giữ một chỗ trống trên Màn hình chính đến khi các app rung.',
  'widgetsGuide.home.step2': 'Chạm Sửa ở góc trên, rồi Thêm tiện ích.',
  'widgetsGuide.home.step3': 'Tìm 6pm, vuốt tới cỡ bạn muốn, rồi chạm Thêm tiện ích.',

  'widgetsGuide.lock.title': 'Tiện ích Màn hình khoá',
  'widgetsGuide.lock.what': 'Xem hôm nay còn bao nhiêu mà không cần mở khoá.',
  'widgetsGuide.lock.ring': 'Vòng',
  'widgetsGuide.lock.card': 'Thẻ',
  'widgetsGuide.lock.step1': 'Chạm và giữ Màn hình khoá, rồi chạm Tuỳ chỉnh.',
  'widgetsGuide.lock.step2': 'Chọn Màn hình khoá, rồi chạm vào ô dưới đồng hồ.',
  'widgetsGuide.lock.step3': 'Chạm 6pm, rồi chọn vòng, con số trên một dòng hoặc một hũ.',

  'widgetsGuide.control.title': 'Trung tâm điều khiển',
  'widgetsGuide.control.what': 'Vuốt xuống, chạm một lần là vào Quét QR hay Thêm nhanh.',
  'widgetsGuide.control.needs': 'iOS 18 trở lên',
  'widgetsGuide.control.step1': 'Vuốt xuống từ góc trên bên phải màn hình.',
  'widgetsGuide.control.step2': 'Chạm và giữ một chỗ trống, rồi chạm Thêm điều khiển.',
  'widgetsGuide.control.step3': 'Tìm 6pm và chọn Quét QR hoặc Thêm nhanh.',
  'widgetsGuide.control.note':
    'Hai nút này cũng thay được đèn pin hay camera ở cuối Màn hình khoá.',

  'widgetsGuide.action.title': 'Nút Tác vụ',
  'widgetsGuide.action.what': 'Nhấn giữ nút bên cạnh máy để mở Quét QR.',
  'widgetsGuide.action.needs': 'iPhone 15 Pro trở lên',
  'widgetsGuide.action.step1': 'Mở Cài đặt, rồi Nút Tác vụ.',
  'widgetsGuide.action.step2': 'Vuốt tới Điều khiển, rồi chạm tên điều khiển bên dưới.',
  'widgetsGuide.action.step3': 'Tìm 6pm và chọn Quét QR hoặc Thêm nhanh.',
  'widgetsGuide.action.note':
    'Thích nói hơn? Nói với Siri “Log in 6pm”, rồi số tiền (Siri chưa có tiếng Việt).',

  'widgetsGuide.live.title': 'Hoạt động trực tiếp',
  'widgetsGuide.live.what':
    'Đến sáu giờ, việc chốt ngày hiện trên màn hình khoá, và nó chờ ở đó khi có khoản QR đang chờ hay khi bạn đi du lịch.',
  'widgetsGuide.live.step1':
    'Quét QR rồi trả trong app ngân hàng. Khoản đó chờ ngay trên Màn hình khoá.',
  'widgetsGuide.live.step2': 'Chạm Đã trả khi tiền đã đi. Nó tự đóng.',
  'widgetsGuide.live.step3': 'Không thấy? Vào Cài đặt, mở 6pm và bật Hoạt động trực tiếp.',

  'widgetsGuide.home.addSafe': 'Thêm Hôm nay tiêu được',
  'widgetsGuide.lock.jar': 'Hũ',
  'widgetsGuide.home.addStreak': 'Thêm Chuỗi tối',
  'widgetsGuide.home.addJar': 'Thêm một hũ',
  'widgetsGuide.home.addToday': 'Thêm Tháng của tôi',
  'widgetsGuide.tiles.title': 'Ô Cài đặt nhanh',
  'widgetsGuide.tiles.what': 'Vuốt xuống, chạm một lần là vào Quét QR hay Thêm nhanh.',
  'widgetsGuide.tiles.step1': 'Vuốt từ đỉnh màn hình xuống hai lần.',
  'widgetsGuide.tiles.step2': 'Chạm biểu tượng bút chì để sửa các ô.',
  'widgetsGuide.tiles.step3': 'Tìm Quét QR và Thêm nhanh của 6pm rồi kéo lên.',
  'widgetsGuide.tiles.addScan': 'Thêm ô Quét QR',
  'widgetsGuide.tiles.addQuickAdd': 'Thêm ô Thêm nhanh',
  'widgetsGuide.tiles.scanIn': 'Quét QR đã có trong Cài đặt nhanh',
  'widgetsGuide.tiles.quickAddIn': 'Thêm nhanh đã có trong Cài đặt nhanh',
};
