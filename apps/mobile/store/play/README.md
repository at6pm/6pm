# Google Play listing

What the Play Console asks for before a build can go to a testing track, for `app.at6pm` (the dev
build is `app.at6pm.dev`). Android cannot use the iOS id: `ai.sixpm.app` is held on Play by a
developer account that was closed, and Play never frees a package name. The text
follows the App Store listing (`../README.md`, `store.config.json`), less what Android does not have
(Apple Pay, widgets, Siri, Budget together, the companion's Home Screen icon, on-device mode) and
with what it has instead (bank and wallet notifications).

## Graphics

| File | Slot | Size |
| --- | --- | --- |
| `icon-512.png` | App icon | 512 × 512 |
| `{en-US,vi}/feature-graphic.png` | Feature graphic | 1024 × 500, the App Store header creative cropped to its middle |
| `{en-US,vi}/screenshots/*.png` | Phone screenshots | 1080 × 1920 (Play takes only 9:16) |

### Screenshots

Real captures of the developer build on the Android emulator (`sixpm-pixel`), in order: Today, the
Close, Bank alerts, the Inbox, Quick add, Plan and Diary. Each is the Friday fixture with the clock
pinned at 18:07 (`dev-command.json`: `{"seed":"friday","at":"18:07","route":"/close"}`, in dollars for
en-US and đồng for vi; its categories take the app's language). The screen is set to 2:1 (`adb shell wm size 1080x2160`), with the dev Tools button off and Android's demo status bar at
18:07 (`com.android.systemui.demo`); each is then scaled to 1920 tall and its own side edges extended to
1080 wide, since Play takes only 9:16. The app language follows Android's per-app language
(`cmd locale set-app-locales app.at6pm.dev --locales vi-VN`).

## Text

### en-US

**App name** (≤ 30): 6pm: Safe to Spend

**Short description** (≤ 80): Know what’s safe to spend today. Close your day in one swipe at six.

**Full description** (≤ 4000):

```
Most budget apps want an hour a week. 6pm wants one minute a day. All day it catches what you spend: your bank's notifications, VietQR scans, receipt photos, bank emails, your voice. At six, you swipe once to close the day. Tomorrow morning you get one number: what's safe to spend today.

KNOW WHAT'S SAFE TO SPEND TODAY
One number on your Today screen, worked out from your pay, your bills and what you have already spent. Spend less today and tomorrow's number grows.

CLOSE YOUR DAY IN ONE SWIPE
At six, 6pm shows what it caught. Keep it, edit it, or mark it not yours, then swipe once. The day is closed.

YOUR BANK'S NOTIFICATIONS LOG THEMSELVES
Turn on notification access once, and every payment alert from your bank or wallet lands in your inbox, read on your phone. Codes, failed payments and promotions are skipped. 6pm reads nothing from any other app.

SIX WAYS TO LOG, ONE INBOX
Bank notifications, VietQR scans, receipt photos, forwarded bank emails, your voice and a quick keypad. Everything lands in one inbox for the close.

ASK BEFORE YOU SPEND
Can I afford a dinner on Saturday? Ask 6pm answers from your own numbers.

A BUDGET PLANNER THAT PAYS YOU FIRST
Bills are set aside and pots fill each pay cycle before anything is called spendable.

A MONEY DIARY YOU'LL ACTUALLY KEEP
Every closed day is a page. Look back at a month in one glance.

LOOKS AND COMPANIONS
Eleven looks, from Sơn Mài lacquer to Neon Alley, that follow your real clock from dawn to midnight. Six companions keep you company.

PRIVATE BY DESIGN
No bank login, ever. Your money stays encrypted on your phone. 6pm is open source.

6pm is free. 6pm Max adds every look, unlimited Ask and pots, Travel mode, the Year book, and encrypted backup and export.

6pm is not affiliated with or endorsed by any bank, wallet or payment network it works with. Bank and wallet names belong to their owners.

Terms of Use: https://at6pm.app/terms
Privacy Policy: https://at6pm.app/privacy
```

### vi

**Tên ứng dụng**: 6pm: Safe to Spend

**Mô tả ngắn** (≤ 80): Biết hôm nay tiêu được bao nhiêu. Chốt ngày bằng một cú vuốt lúc 6 giờ.

**Mô tả đầy đủ**:

```
Phần lớn app chi tiêu cần một giờ mỗi tuần. 6pm chỉ cần một phút mỗi ngày. Cả ngày, app tự ghi: thông báo ngân hàng, VietQR, biên lai, email ngân hàng, giọng nói. Sáu giờ tối, bạn vuốt một lần để chốt ngày. Sáng mai, chỉ một con số: hôm nay tiêu được bao nhiêu.

BIẾT HÔM NAY TIÊU ĐƯỢC BAO NHIÊU
Một con số trên màn hình Hôm nay, tính từ lương, hoá đơn và những gì bạn đã tiêu. Hôm nay tiêu ít hơn, ngày mai con số lớn hơn.

CHỐT NGÀY BẰNG MỘT CÚ VUỐT
Sáu giờ tối, 6pm cho bạn xem những gì đã ghi. Giữ, sửa hoặc đánh dấu không phải của bạn, rồi vuốt một lần. Ngày đã chốt.

THÔNG BÁO NGÂN HÀNG TỰ GHI
Bật quyền truy cập thông báo một lần, mọi thông báo biến động số dư của ngân hàng và ví về thẳng hộp thư, đọc ngay trên máy. Mã OTP, giao dịch lỗi và khuyến mãi được bỏ qua. 6pm không đọc gì từ ứng dụng khác.

SÁU CÁCH GHI, MỘT HỘP THƯ
Thông báo ngân hàng, quét VietQR, chụp biên lai, chuyển tiếp email ngân hàng, giọng nói và bàn phím nhanh. Mọi khoản về một hộp thư để chốt ngày.

HỎI TRƯỚC KHI TIÊU
Thứ Bảy đi ăn 2 triệu có được không? Hỏi 6pm trả lời từ chính con số của bạn.

KẾ HOẠCH CHI TIÊU TRẢ CHO BẠN TRƯỚC
Hoá đơn được để riêng, các hũ được nạp mỗi kỳ lương trước khi tính tiền được tiêu.

NHẬT KÝ CHI TIÊU BẠN SẼ GIỮ ĐƯỢC
Mỗi ngày đã chốt là một trang. Nhìn lại cả tháng trong một cái liếc.

GIAO DIỆN VÀ BẠN ĐỒNG HÀNH
Mười một giao diện, từ Sơn Mài đến Neon Alley, đổi theo giờ thật từ bình minh đến nửa đêm. Sáu bạn đồng hành ở bên bạn.

RIÊNG TƯ TỪ ĐẦU
Không bao giờ hỏi mật khẩu ngân hàng. Dữ liệu được mã hoá trên điện thoại. 6pm là mã nguồn mở.

6pm miễn phí. 6pm Max mở mọi giao diện, Hỏi và hũ không giới hạn, chế độ Du lịch, Sổ năm, sao lưu mã hoá và xuất dữ liệu.

6pm không liên kết với, và không được bảo trợ bởi, bất kỳ ngân hàng, ví điện tử hay mạng thanh toán nào. Tên ngân hàng và ví thuộc về chủ sở hữu của chúng.

Điều khoản sử dụng: https://at6pm.app/vi/terms
Chính sách quyền riêng tư: https://at6pm.app/vi/privacy
```

**Category**: Finance. **Tags**: Budgeting, Personal finance. **Contact**: k7m2qx@at6pm.app (the
privacy policy's contact); website https://at6pm.app. **AI asset label**: none (the screenshots are
captures and the feature graphic is rendered from HTML).

## App content (Policy → App content)

| Form | Answer |
| --- | --- |
| Privacy policy | https://at6pm.app/privacy (covers Android once the Android section is deployed) |
| App access | No account or login, but 6pm Max is paid and reviewers can't buy or use a trial, so the sign in details give three one-time promo codes from the promotion "App review: 6pm Max" (Max yearly free for 90 days, redeemed in the Play Store, until 30 Apr 2027) |
| Ads | No ads |
| Content rating | IARC questionnaire, category Utility/Productivity: no violence, sexuality, language, drugs, gambling or user-generated content shared with others; users do not interact; no location shared with others; digital purchases: yes |
| Target audience | 18 and over (the policy says not made for children under 16) |
| News app | No |
| COVID-19 tracing | No |
| Government app | No |
| Financial features | Personal finance: budgeting and expense tracking. It does not move money, lend, hold deposits, trade or offer crypto |
| Health | No |
| Data safety | See below |

### Data safety

Data **collected** (leaves the phone):

| Data type | Collected | Shared | Why | Optional |
| --- | --- | --- | --- | --- |
| App info and performance → Crash logs, Diagnostics | Yes | No | Analytics (crash reports, Sentry; Android has no on-device mode to turn them off) | No |
| Device or other IDs | Yes | No | App functionality, fraud prevention (anonymous device token, stored hashed) | No |
| Financial info → Purchase history | Yes | No | App functionality (RevenueCat purchase status) | No |
| Financial info → Other financial info | Yes | No | App functionality: what a forwarded bank email holds, kept until the phone collects it; receipt photos the phone cannot read | Yes |
| Messages → Emails | Yes | No | App functionality: forwarded bank emails, read and not stored | Yes |
| Photos | Yes | No | App functionality: a receipt photo the phone cannot read, sent once to be read, not stored | Yes |
| Audio → Voice or sound recordings | Yes | No | App functionality: streamed to speech-to-text while you speak, not stored | Yes |
| Messages → Other in-app messages | Yes | No | App functionality: questions asked to Ask 6pm, not stored | Yes |

None is marked as processed ephemerally: Anthropic keeps requests for up to 30 days. No account
creation (Budget together, the only sign-in, is not in the Android app). Data deletion link:
https://at6pm.app/privacy#your-choices-and-rights.

Processors (Anthropic, Deepgram, ElevenLabs, RevenueCat, Sentry, Cloudflare) act for 6pm, so this is
"collected", not "shared". Data is encrypted in transit. Users can ask for deletion (the policy's contact).

**Not collected**: bank and wallet notifications (read on the phone only), location (country worked out
on the phone), contacts, calendar, files, web history. The encrypted backup (Max) is end-to-end
encrypted, so Play counts it as not collected.

### Permissions Play may ask about

| Permission | Why |
| --- | --- |
| Notification listener (Notification access) | Bank and wallet alerts, read on the phone, only from known bank and wallet apps. The guide shows what is read before the switch is turned on. No declaration form exists for it |
| `SCHEDULE_EXACT_ALARM` | The daily close reminder at the time the person chose. Not `USE_EXACT_ALARM`, so no declaration |
| `CAMERA`, `RECORD_AUDIO`, coarse and fine location | Scan, voice, Travel mode (foreground only) |
| No `READ_MEDIA_*` | Scan uses the system Photo Picker; saving pictures needs no read access |

## Billing

- **RevenueCat**: the app "6pm (Play Store)" in the 6pm project, package `app.at6pm`; its public key is
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` in the `prd` profile. Purchases are read with the service
  account `sixpm-revenuecat@sixpm-play.iam.gserviceaccount.com` (Google Cloud project `sixpm-play`),
  which has view, financial data and order permissions on this app only in the Play Console, and
  Pub/Sub Admin and Monitoring Viewer in its project. Real-time notifications go through
  `projects/sixpm-play/topics/Play-Store-Notifications`.
- **Subscriptions**: `ai.sixpm.app.max.monthly` and `ai.sixpm.app.max.yearly`, base plans `monthly` and
  `yearly` (auto-renewing, 7-day grace period), $4.99 and $34.99 with Play's conversion elsewhere and
  99.000₫ and 799.000₫ in Vietnam. Each has the offer `free-trial`: 7 days, for anyone who never had a
  subscription in the app (the App Store's one trial per group). `yearly` is the backwards compatible
  plan, which promo codes need.
- **Looks**: one-time products `ai.sixpm.app.look.<id>` with the purchase option `buy`, priced in đồng
  (49.000₫ classic, 99.000₫ living scenes) and converted by Play elsewhere, as the App Store does.
- **RevenueCat**: the 11 products are imported (non-consumable looks); both Max plans are attached to
  `max` and each look to its `look_<id>`. The app asks for products by id, so no offering is needed.

## Releases

- **Upload**: Play takes the first build of a new app only through the Console. Later builds can go by
  `eas submit -p android --profile prd` once a Google service account key is added in EAS.
- **Internal testing**: the first build, versionCode 2 (2.1.0), went to internal testing on 31 Oct
  2026 for the account's "Internal" testers list. It was built before the RevenueCat Android key was
  in `prd`, so Max and looks are unavailable in it.
- **Closed testing**: the "Alpha" track, every country, versionCode 4 (2.1.0, with the key; 3 was a
  failed local build), sent for review with the app content on 1 Nov 2026. Testers come from the
  "Internal" list until a Google Group is added. Production needs 12 or more testers opted in for 14
  days in a row.
- **Local builds**: `eas build --local` needs `ANDROID_HOME` set (the SDK is at
  `~/Library/Android/sdk`); every attempt takes the next versionCode, failed or not.
