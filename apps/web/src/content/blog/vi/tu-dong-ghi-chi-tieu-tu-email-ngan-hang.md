---
title: "Tự động ghi chi tiêu từ email ngân hàng và hoá đơn"
description: "Chuyển tiếp email biên lai, hoá đơn điện tử, email ngân hàng về một địa chỉ riêng, 6pm tự ghi chi tiêu. Cách lọc Gmail, Outlook, iCloud từng bước."
slug: tu-dong-ghi-chi-tieu-tu-email-ngan-hang
lang: vi
pubDate: 2026-10-21
tags: [ghi chi tiêu tự động, email ngân hàng, hoá đơn điện tử, gmail, 6pm]
related: [bank-alert-emails-expense-log, cach-ghi-chi-tieu-tu-dong-tren-iphone, quet-vietqr-tu-ghi-chi-tieu, chup-hoa-don-ghi-chi-tieu]
cta: "Lấy địa chỉ email riêng của bạn trong 6pm, lọc một lần, chi tiêu tự về."
hero: [close-caught]
---

# Tự động ghi chi tiêu từ email ngân hàng và hoá đơn

Mỗi iPhone cài 6pm có một địa chỉ email riêng, kiểu k7m2qx@at6pm.app. Bạn đặt bộ lọc để hộp thư tự chuyển tiếp email biên lai, hoá đơn điện tử hay thông báo giao dịch tới đó. 6pm đọc số tiền, nơi trả, danh mục, rồi xếp vào Hộp thư chờ bạn chốt lúc 18:00. Cài một lần, dùng mãi.

## Nói thật trước: ngân hàng Việt ít gửi email cho từng giao dịch

Nếu bạn tìm "email biến động số dư Vietcombank" hay "Techcombank gửi email giao dịch", bạn sẽ thấy phần lớn ngân hàng lớn đã chuyển thông báo biến động số dư vào app (OTT) hoặc SMS. Techcombank chuyển thông báo sang app từ 2020, thông báo giao dịch thẻ tín dụng sang app từ 2023. MB cho đăng ký biến động số dư miễn phí ngay trong App MBBank. Vietcombank có OTT Alert trong VCB Digibank.

Vậy email còn đáng dùng không? Có, vì bạn vẫn nhận nhiều email có số tiền hơn bạn nghĩ:

- **Hoá đơn điện tử** gửi về email đã đăng ký khi bạn xin xuất hoá đơn ở quán, siêu thị, điện lực.
- **Biên lai từ app và dịch vụ**: Grab (khi bạn bật hoá đơn qua email), App Store và iCloud của Apple, các gói đăng ký.
- **Email xác nhận đơn hàng** từ các trang mua sắm có in số tiền.
- **Thẻ quốc tế, tài khoản nước ngoài**, ví như Wise, nếu bạn bật thông báo qua email.
- **Ngân hàng của bạn**, nếu trong phần cài đặt thông báo có tuỳ chọn gửi email. Hãy kiểm tra trong app ngân hàng; mỗi nơi một khác.

Còn chuyển khoản trong nước, cách nhanh nhất vẫn là [quét VietQR bằng 6pm](/vi/blog/quet-vietqr-tu-ghi-chi-tieu) ngay ở quầy, hoặc chia sẻ màn hình "chuyển khoản thành công" từ app ngân hàng sang 6pm.

## 6pm đọc email như thế nào

Khi một email tới địa chỉ của bạn:

1. **Email không in số tiền nào bị bỏ qua, không đọc.** Bản tin khuyến mãi không làm phiền bạn.
2. **Email có số tiền được một mô hình AI (của Anthropic) đọc** để phân biệt: đây là một khoản chi, hay chuyển tiền giữa hai tài khoản của chính bạn, hoàn tiền, giao dịch lỗi, cập nhật đơn hàng hay quảng cáo. Nó đọc luôn bạn đã trả cho ai, cho việc gì, bằng loại tiền gì. Thẻ bị trừ bằng đô la thì khoản chi giữ nguyên đô la.
3. **Số tiền chỉ được giữ khi nó thật sự in trong email.** AI không đoán số.
4. **Phần đã đọc được mã hoá và giữ trên máy chủ đến khi điện thoại của bạn lấy về, rồi bị xoá.** Bản thân email không bao giờ được 6pm lưu hay ghi log.

<!-- media: diagram-email -->

Bản miễn phí có 50 lượt đọc bằng AI mỗi ngày. Quá số đó, hoặc khi AI không trả lời, các quy tắc đơn giản hơn sẽ đọc thay, nên không biên lai nào bị mất. 6pm Max không giới hạn lượt đọc.

Một điểm hay: nếu cùng một khoản đến từ hai nơi, ví dụ email ngân hàng và email biên lai của cửa hàng, 6pm gộp thành một dòng "Thấy qua 2 nguồn", và nếu email ngân hàng không ghi tên nơi trả thì giữ tên cửa hàng. Không ghi trùng.

## Cài đặt từng bước

### Bước 1: lấy địa chỉ của bạn

Mở 6pm, vào phần hướng dẫn ghi chi tiêu (hoặc Cài đặt), chạm **Sao chép địa chỉ**. Địa chỉ gắn với máy của bạn, không gắn với tên hay số điện thoại.

### Bước 2: Gmail

Gmail không cho đặt chuyển tiếp trong app điện thoại, nên bạn cần mở Gmail trên máy tính:

1. Bấm bánh răng, chọn **Xem tất cả chế độ cài đặt**.
2. Mở thẻ **Chuyển tiếp và POP/IMAP**, chọn **Thêm địa chỉ chuyển tiếp**, dán địa chỉ 6pm.
3. Gmail gửi mã xác nhận tới địa chỉ đó, và 6pm hiện mã ngay trong app. Nhập mã vào ô Xác minh.
4. Đừng chuyển tiếp tất cả. Mở tuỳ chọn tìm kiếm, điền các địa chỉ gửi biên lai vào ô **Từ**, ví dụ nơi gửi hoá đơn điện tử của bạn.
5. Chọn **Tạo bộ lọc**, tích **Chuyển tiếp tới**, chọn địa chỉ 6pm, rồi **Tạo bộ lọc**.

### Outlook.com

Trên web, vào **Cài đặt → Thư → Quy tắc**, thêm quy tắc: khi thư đến từ các địa chỉ gửi biên lai, chuyển tiếp tới địa chỉ 6pm. Outlook có thể bắt bạn đăng nhập lại trước khi lưu.

### iCloud Mail

Trên icloud.com/mail, vào **Cài đặt → Quy tắc → +**. Nếu thư đến từ một địa chỉ gửi biên lai thì chuyển tiếp tới địa chỉ 6pm. Mỗi địa chỉ gửi một quy tắc, có thể mất khoảng 15 phút mới bắt đầu chạy.

### Bước 3: thử

Chuyển tiếp tay một email biên lai cũ có số tiền tới địa chỉ 6pm. Mở 6pm, khoản đó nằm trong Hộp thư.

## Một ví dụ: tháng của Huy

Huy, 26 tuổi, làm thiết kế ở Quận 3, đặt bộ lọc cho ba nơi: hoá đơn điện tử, biên lai Grab và biên lai Apple. Tuần đầu:

| Email | Số tiền | 6pm xếp vào |
|---|---|---|
| Hoá đơn điện tử siêu thị | 312.000₫ | Đi chợ |
| Biên lai Grab car về nhà | 86.000₫ | Đi lại |
| Biên lai iCloud+ | 59.000₫ | Hoá đơn hay Giải trí, Huy chọn |
| Email khuyến mãi 11.11 | không có số tiền | bỏ qua, không đọc |

<!-- media: close-swipe-clip -->

Tối thứ Sáu, Huy mở 6pm lúc 18:00, vuốt bốn tờ biên lai (ba từ email, một bát phở quét QR), đóng dấu **ĐÃ CHỐT**. Không gõ một số nào.

## Riêng tư: cái gì đi đâu

Email biên lai là cách ghi duy nhất cần máy chủ đọc thư của bạn, nên 6pm nói rõ:

- Email chỉ được gửi tới Anthropic để đọc, không tới ai khác. Anthropic không dùng nó để huấn luyện mô hình và xoá trong vòng 30 ngày.
- 6pm không lưu, không ghi log email. Phần đọc được giữ mã hoá đến khi điện thoại lấy về, sau đó xoá. Biên lai không được lấy sau 30 ngày thì bị xoá mà không đọc.
- Ai gửi thư tới địa chỉ đó cũng được đọc như nhau, nên chỉ đưa nó cho ngân hàng và nơi gửi biên lai.
- Nếu bạn bật chế độ giữ AI trên iPhone (Cài đặt → AI), email biên lai sẽ tắt. Khi đó dùng quét QR, chụp hoá đơn hoặc chia sẻ biên lai.

Chúng tôi không lưu giao dịch của bạn; chúng nằm trên iPhone của bạn, được mã hoá. Không đăng nhập ngân hàng.

## Câu hỏi thường gặp

### Vietcombank, Techcombank, MB có gửi email biến động số dư không?

Theo thông tin công khai, các ngân hàng này chủ yếu báo biến động số dư qua app và SMS. Hãy kiểm tra phần cài đặt thông báo trong app ngân hàng của bạn; nếu có tuỳ chọn email, chỉ cần lọc và chuyển tiếp như trên.

### Ghi chi tiêu từ email có mất phí không?

Không. Email biên lai miễn phí, với 50 lượt đọc bằng AI mỗi ngày, quá số đó thì quy tắc đơn giản đọc thay. 6pm Max bỏ giới hạn lượt đọc AI.

### Email khuyến mãi có bị ghi thành chi tiêu không?

Email không có số tiền bị bỏ qua mà không đọc. Email có số tiền nhưng chỉ là quảng cáo, hoàn tiền hay chuyển giữa tài khoản của bạn sẽ được nhận ra và không ghi thành khoản chi.

### Một khoản vừa có email ngân hàng vừa có email cửa hàng thì sao?

Cùng số tiền, từ hai người gửi khác nhau, cách nhau không quá 3 phút: 6pm gộp thành một dòng, và giữ tên cửa hàng nếu email ngân hàng không ghi tên.

### Tôi có cần tạo tài khoản 6pm không?

Không. Địa chỉ email gắn với mã thiết bị ẩn danh, không gắn với tên, email hay số điện thoại của bạn.

## Thử 6pm

6pm lên App Store lúc 18:00 thứ Sáu, 6/11/2026. Muốn dùng trước? Tham gia bản beta công khai trên TestFlight: [testflight.apple.com/join/a8UrvT5P](https://testflight.apple.com/join/a8UrvT5P). Xem thêm tại [at6pm.app/vi](https://at6pm.app/vi), và các cách ghi khác trong bài [ghi chi tiêu tự động trên iPhone](/vi/blog/cach-ghi-chi-tieu-tu-dong-tren-iphone).

Nguồn: [Techcombank chuyển thông báo biến động số dư sang app](https://techcombank.com/thong-tin/thong-bao/techcombank-chuyen-doi-hinh-thuc-thong-bao-bien-dong-so-du-qua-ung-dung-fst-mobile-thay-the-cho-tin-nhan-sms), [Techcombank chuyển thông báo giao dịch thẻ tín dụng sang app](https://techcombank.com/thong-tin/thong-bao/chuyen-doi-hinh-thuc-thong-bao-giao-dich-the-tin-dung-qua-techcombank-mobile-thay-the-tin-nhan-sms), [Biến động số dư miễn phí trong App MBBank](https://thitruongtaichinhtiente.vn/cach-nhan-bien-dong-so-du-tai-khoan-voi-muc-phi-0-dong-tai-mb-39391.html), [Vietcombank: thông báo số dư bằng giọng nói và OTT](https://vnba.org.vn/vi/vietcombank-ra-mat-tinh-nang--thong-bao-so-du-bang-giong-noi-16850.htm), [Chính sách quyền riêng tư của 6pm](https://at6pm.app/vi/privacy).
