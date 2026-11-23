# Google Play listing

What the Play Console asks for before a build can go to a testing track, for `app.at6pm` (the dev
build is `app.at6pm.dev`). Android cannot use the iOS id: `ai.sixpm.app` is held on Play by a
developer account that was closed, and Play never frees a package name. The text
follows the App Store listing (`../README.md`, `store.config.json`), less what Android does not have
(Apple Pay, Siri, Budget together, the companion's Home Screen icon, on-device mode) and with what it
has instead (bank and wallet notifications). Android ships seven Home screen widgets, so the listing
names them.

## Graphics

| File                             | Slot                       | Size                                                                                                                               |
| -------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `icon-512.png`                   | App icon                   | 512 × 512                                                                                                                          |
| `{en-US,vi}/feature-graphic.png` | Feature graphic            | 1024 × 500, the App Store header creative cropped to its middle                                                                    |
| `{en-US,vi}/screenshots/*.png`   | Phone screenshots          | 1080 × 1920 (Play takes only 9:16)                                                                                                 |
| `{en-US,vi}/foldable/*.jpg`      | Foldable screenshots       | 01 opened 2880 × 2160 (4:3), 02 opened 2160 × 2160 (1:1), 03 cover screen 1350 × 2160 (10:16), then 04 and 06 at 4:3 and 05 at 3:4 |
| `{en-US,vi}/tablet-7/*.jpg`      | 7-inch tablet screenshots  | 1620 × 2880 (Play takes only 9:16 or 16:9)                                                                                         |
| `{en-US,vi}/tablet-10/*.jpg`     | 10-inch tablet screenshots | 1620 × 2880                                                                                                                        |

### Screenshots

Real captures of the developer build on the Android emulator (`sixpm-pixel`), in order: Today, the
Close, Bank alerts, the Inbox, Quick add, Plan and Diary. Each is the Friday fixture with the clock
pinned at 18:07 (`dev-command.json`: `{"seed":"friday","at":"18:07","route":"/close"}`, in dollars for
en-US and đồng for vi; its categories take the app's language). The screen is set to 2:1 (`adb shell wm size 1080x2160`), with the dev Tools button off and Android's demo status bar at
18:07 (`com.android.systemui.demo`); each is then scaled to 1920 tall and its own side edges extended to
1080 wide, since Play takes only 9:16. The app language follows Android's per-app language
(`cmd locale set-app-locales app.at6pm.dev --locales vi-VN`).

### Large screens

The foldable and tablet shots are a caption over a real capture in a plain device frame, as the
App Store's iPad set is. `compose/shots.mjs` lists them (canvas, caption, capture), `compose/shot.html`
draws one, and `node compose/compose.mjs <captures dir> <out dir>` renders them all with headless
Chrome; they are kept as JPEGs (quality 90). The captions are the App Store set's where a screen has
one (`design/prototype/StoreShot.dc.html`), in English and Vietnamese.

The captures are the developer build with the Friday fixture, the emulator's clock set to Friday
16 October 2026 at 18:07, gesture navigation, the dev Tools button off, in dollars for en-US and
đồng for vi (set the language with one `dev-command.json`, then seed with the next, so the seed's
categories are written in it):

- Foldable: the `sixpm-zfold8` emulator. Opened: Home (01), the Close as a book (02), the Diary
  (04), Plan (06). The cover screen: Home (03). Turned upright and half open
  (`adb emu sensor set hinge-angle0 100`): at the counter (05).
- Tablets: the `sixpm-pixel` emulator at a tablet's size, `adb shell wm size 1600x2560` (10-inch)
  and `1200x1920` (7-inch) with `wm density 320`: Today (01), the Close (02), Quick add (03),
  Plan (04), the Diary (05). A tablet has no fold, so it shows the phone's one column.

## Text

### en-US

**App name** (≤ 30): 6pm: Auto Expense Tracker

**Short description** (≤ 80): Expense tracker that logs itself from bank alerts. Know what's safe to spend.

**Full description** (≤ 4000):

```
6pm is an expense tracker that fills itself in. Pay by card or transfer, and the notification from your bank or wallet app becomes a line in your spending log: nothing to type, no bank login, no account linking. You always know what's safe to spend today and where your money went, for about a minute a day. Free.

YOUR BANK'S NOTIFICATIONS LOG THEMSELVES
Turn on notification access once, and every payment alert from your bank or wallet lands in your inbox by itself. Codes, failed payments and promotions are skipped. 6pm reads nothing from any other app.

KNOW WHAT'S SAFE TO SPEND TODAY
One number on your Today screen, worked out from your pay, your bills and what you have already spent. Spend less today and tomorrow's number grows.

A MINUTE A DAY AND YOUR BOOKS ARE DONE
Each evening 6pm shows you what it caught that day. Keep it, fix it or mark it not yours, and you're done. No catching up at the end of the month.

PAID IN CASH? ADD IT IN SECONDS
Scan a VietQR code, snap a receipt, forward a bank email, say it out loud, or tap it in on a quick keypad. What your bank doesn't announce still gets in.

ASK BEFORE YOU SPEND
Can I afford a dinner on Saturday? Ask 6pm answers from your own numbers.

BILLS AND SAVINGS SET ASIDE ON PAYDAY
Each payday your budget plan sets your bills aside and fills your pots, before anything counts as spendable. What's left is truly yours to spend.

SEE WHERE YOUR MONEY WENT
Every day is a page in your money diary. Look back over any month and see where it all went.

YOUR NUMBER ON YOUR HOME SCREEN
Widgets for today's number, this week, this month, a pot and today's receipt. Check before you spend, without opening the app.

LOOKS AND COMPANIONS
Eleven looks, from Sơn Mài lacquer to Neon Alley, that follow your real clock from dawn to midnight. Six companions keep you company.

PRIVATE BY DESIGN
No bank login, ever. Your data is encrypted on your phone. 6pm is open source.

6pm is free. 6pm Max adds every look, unlimited Ask and pots, Travel mode, the Year book, and encrypted backup and export.

6pm is not affiliated with or endorsed by any bank, wallet or payment network it works with. Bank and wallet names belong to their owners.

Terms of Use: https://at6pm.app/terms
Privacy Policy: https://at6pm.app/privacy
```

### vi

**Tên ứng dụng** (≤ 30): 6pm: Quản lý chi tiêu tự động

**Mô tả ngắn** (≤ 80): Sổ thu chi tự động ghi chi tiêu từ thông báo ngân hàng, VietQR, hoá đơn

**Mô tả đầy đủ**:

```
6pm là app quản lý chi tiêu tự động. Chuyển khoản hay quẹt thẻ xong, thông báo biến động số dư từ app ngân hàng và ví điện tử tự thành một dòng trong sổ thu chi: không cần nhập tay, không cần liên kết hay đăng nhập ngân hàng. Mỗi ngày chỉ mất chừng một phút, bạn luôn biết hôm nay còn tiêu được bao nhiêu và tiền đã đi đâu. Miễn phí.

THÔNG BÁO NGÂN HÀNG TỰ GHI
Bật quyền truy cập thông báo một lần, mọi thông báo biến động số dư của ngân hàng và ví tự về thẳng hộp thư. Mã OTP, giao dịch lỗi và khuyến mãi được bỏ qua. 6pm không đọc gì từ ứng dụng khác.

BIẾT HÔM NAY TIÊU ĐƯỢC BAO NHIÊU
Một con số trên màn hình Hôm nay, tính từ lương, hoá đơn và những gì bạn đã tiêu. Hôm nay tiêu ít hơn, ngày mai con số lớn hơn.

MỖI NGÀY MỘT PHÚT LÀ XONG SỔ
Mỗi tối, 6pm cho bạn xem những khoản đã ghi trong ngày. Giữ, sửa hoặc bỏ khoản không phải của bạn là xong. Không còn cảnh cuối tháng ngồi nhớ lại từng khoản.

TRẢ TIỀN MẶT? GHI TRONG VÀI GIÂY
Quét VietQR lúc trả tiền, chụp biên lai, chuyển tiếp email ngân hàng, nói một câu hoặc gõ nhanh số tiền. Khoản nào ngân hàng không báo vẫn vào sổ.

HỎI TRƯỚC KHI TIÊU
Thứ Bảy đi ăn 2 triệu có được không? Hỏi 6pm trả lời từ chính con số của bạn.

LƯƠNG VỀ, HOÁ ĐƠN VÀ TIỀN ĐỂ DÀNH ĐƯỢC ĐỂ RIÊNG TRƯỚC
Mỗi kỳ lương, kế hoạch chi tiêu để riêng hoá đơn và nạp các hũ trước, rồi mới tính tiền được tiêu. Phần còn lại, bạn cứ thoải mái tiêu.

CUỐI THÁNG THẤY TIỀN ĐÃ ĐI ĐÂU
Mỗi ngày là một trang nhật ký chi tiêu. Nhìn lại tháng nào cũng thấy ngay tiền đã đi đâu.

CON SỐ NGAY TRÊN MÀN HÌNH CHÍNH
Tiện ích cho số tiêu hôm nay, tuần này, tháng này, hũ và biên lai ngày. Xem trước khi tiêu, không cần mở app.

GIAO DIỆN VÀ BẠN ĐỒNG HÀNH
Mười một giao diện, từ Sơn Mài đến Neon Alley, đổi theo giờ thật từ bình minh đến nửa đêm. Sáu bạn đồng hành ở bên bạn.

RIÊNG TƯ TỪ ĐẦU
Không bao giờ hỏi mật khẩu ngân hàng. Dữ liệu được mã hoá trên điện thoại. 6pm là mã nguồn mở.

6pm miễn phí. 6pm Max mở mọi giao diện, Hỏi và hũ không giới hạn, chế độ Du lịch, Sổ năm, sao lưu mã hoá và xuất dữ liệu.

6pm không liên kết với, và không được bảo trợ bởi, bất kỳ ngân hàng, ví điện tử hay mạng thanh toán nào. Tên ngân hàng và ví thuộc về chủ sở hữu của chúng.

Điều khoản sử dụng: https://at6pm.app/vi/terms
Chính sách quyền riêng tư: https://at6pm.app/vi/privacy
```
The Vietnamese name and short description carry the words people search the store with ("quản lý chi
tiêu", "sổ thu chi", "tự động", "thông báo ngân hàng"): on 22 Nov 2026 nearly every app ranking for the
category had the phrase in its title and 6pm, under its English name, did not appear. The description
opens with the bank-alert capture and keeps that section first, and names no bank or wallet (the
founder's choice). The English listing follows the same pattern, with the category in its name since
Play has no subtitle. Both were sent for review on 22 Nov 2026.


The other nine languages on Play (de-DE, es-ES, es-419, fr-FR, id, ja-JP, ko-KR, th, zh-CN) carry the
same sections in the same order. Every section opens on what the person gets (payments that log
themselves, what is safe to spend, a minute a day, cash in seconds, bills and savings set aside,
where the money went, the number on the Home screen); the six o'clock close is described, not led
with. No listing names a bank or a wallet.

**Category**: Finance. **Tags**: Finance, Personal finance (Play has no budgeting tag). **Contact**:
hello@oddeggs.studio, the studio's address, as on its other listings; website https://at6pm.app.
Contact details publish at once when saved, with no review. **AI asset label**: none (the screenshots
are captures and the feature graphic is rendered from HTML).

## App content (Policy → App content)

| Form               | Answer                                                                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy     | https://at6pm.app/privacy (covers Android once the Android section is deployed)                                                                                                                                                                               |
| App access         | No account or login, but 6pm Max is paid and reviewers can't buy or use a trial, so the sign in details give three one-time promo codes from the promotion "App review: 6pm Max" (Max yearly free for 90 days, redeemed in the Play Store, until 30 Apr 2027) |
| Ads                | No ads                                                                                                                                                                                                                                                        |
| Content rating     | IARC questionnaire, category Utility/Productivity: no violence, sexuality, language, drugs, gambling or user-generated content shared with others; users do not interact; no location shared with others; digital purchases: yes                              |
| Target audience    | 18 and over (the policy says not made for children under 16)                                                                                                                                                                                                  |
| News app           | No                                                                                                                                                                                                                                                            |
| COVID-19 tracing   | No                                                                                                                                                                                                                                                            |
| Government app     | No                                                                                                                                                                                                                                                            |
| Financial features | Personal finance: budgeting and expense tracking. It does not move money, lend, hold deposits, trade or offer crypto                                                                                                                                          |
| Health             | No                                                                                                                                                                                                                                                            |
| Data safety        | See below                                                                                                                                                                                                                                                     |

### Data safety

Data **collected** (leaves the phone):

| Data type                                          | Collected | Shared | Why                                                                                                                          | Optional |
| -------------------------------------------------- | --------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| App info and performance → Crash logs, Diagnostics | Yes       | No     | Analytics (crash reports, Sentry; Android has no on-device mode to turn them off)                                            | No       |
| Device or other IDs                                | Yes       | No     | App functionality, fraud prevention (anonymous device token, stored hashed)                                                  | No       |
| Financial info → Purchase history                  | Yes       | No     | App functionality (RevenueCat purchase status)                                                                               | No       |
| Financial info → Other financial info              | Yes       | No     | App functionality: what a forwarded bank email holds, kept until the phone collects it; receipt photos the phone cannot read | Yes      |
| Messages → Emails                                  | Yes       | No     | App functionality: forwarded bank emails, read and not stored                                                                | Yes      |
| Photos                                             | Yes       | No     | App functionality: a receipt photo the phone cannot read, sent once to be read, not stored                                   | Yes      |
| Audio → Voice or sound recordings                  | Yes       | No     | App functionality: streamed to speech-to-text while you speak, not stored                                                    | Yes      |
| Messages → Other in-app messages                   | Yes       | No     | App functionality: questions asked to Ask 6pm, not stored                                                                    | Yes      |

None is marked as processed ephemerally: Anthropic keeps requests for up to 30 days. No account
creation (Budget together, the only sign-in, is not in the Android app). Data deletion link:
https://at6pm.app/privacy#your-choices-and-rights.

Processors (Anthropic, Deepgram, ElevenLabs, RevenueCat, Sentry, Cloudflare) act for 6pm, so this is
"collected", not "shared". Data is encrypted in transit. Users can ask for deletion (the policy's contact).

Bank and wallet notifications are part of "Other financial info": the phone reads each one first, then
its words and amounts (account, card and phone numbers hidden) go to our server to be read a second
time and are not stored. The form's answers for that type already said collected, not shared, optional,
so nothing in the Console changed when the second reading shipped (checked 21 Nov 2026).

**Not collected**: location (country worked out on the phone), contacts, calendar, files, web history.
The encrypted backup (Max) is end-to-end encrypted, so Play counts it as not collected.

### Permissions Play may ask about

| Permission                                         | Why                                                                                                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Notification listener (Notification access)        | Bank and wallet alerts, read on the phone first, only from known bank and wallet apps. The guide shows what is read before the switch is turned on. No declaration form exists for it |
| `SCHEDULE_EXACT_ALARM`                             | The daily close reminder at the time the person chose. Not `USE_EXACT_ALARM`, so no declaration                                                                                 |
| `CAMERA`, `RECORD_AUDIO`, coarse and fine location | Scan, voice, Travel mode (foreground only)                                                                                                                                      |
| No `READ_MEDIA_*`                                  | Scan uses the system Photo Picker; saving pictures needs no read access                                                                                                         |

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
- **Production**: the first production release, versionCode 15 (2.2.1), every country, full rollout,
  was sent for review on 21 Nov 2026 with managed publishing off, so it goes live when Google
  approves it. versionCode 17 (2.2.1: bank alerts posted before the listener was bound, a late
  second reading, its outcome in the capture log) went to closed testing in the same review, which
  restarted the production review that had begun minutes earlier. Both were approved about three
  hours later: 6pm has been public on Google Play since 21 Nov 2026, and the site links to the
  listing. versionCode 17 was sent to production the same afternoon as the first update.
- **Local builds**: `eas build --local` needs `ANDROID_HOME` set (the SDK is at
  `~/Library/Android/sdk`); every attempt takes the next versionCode, failed or not.
