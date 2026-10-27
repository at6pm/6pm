# Glossary for 6pm's languages

The words 6pm's own ideas take in each language, so every screen, the companion and the native
surfaces say the same thing. English is the source; Vietnamese is the team's own and a reference
for tone. A new string uses these words; changing one here means changing it everywhere it shows.

## Voice

Warm, short, a little playful, never shaming. The companion teases a habit, never the person.
Serious mode is plain: no jokes, no slang. Buttons, chips, kickers and tab labels stay about as
short as the English, so the shorter of two good words wins.

| Language           | Code      | Address                                                                                  | Notes                                                                                                                                          |
| ------------------ | --------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Simplified Chinese | `zh-Hans` | 你 (never 您)                                                                            | Full-width punctuation (，。？！：), “ ” quotes; no space between Chinese and a number or `{placeholder}` amount is fine either way, be consistent |
| Japanese           | `ja`      | です・ます, friendly; the companion speaks casually (だね、よ)                           | 「」 quotes; no spaces between words; katakana only where an app would use it                                                                   |
| Korean             | `ko`      | 해요체 throughout; the companion is casual 해요체 or light 반말 in cheeky/roast           | Spaces as Korean writes them; counters (건, 개, 일) after numbers: `{count}건`                                                                |
| Thai               | `th`      | คุณ in the interface; the companion is gender-neutral, with นะ / เลย / แล้ว, never ครับ/ค่ะ | No spaces between words, a space between clauses; Thai digits are never used                                                                   |
| Indonesian         | `id`      | kamu (never Anda)                                                                        | Everyday Jakarta tone without slang in serious mode                                                                                            |
| Spanish            | `es`      | tú                                                                                       | Spain-neutral (es-ES), ¿…? and ¡…!, “ ” or « » quotes                                                                                          |
| French             | `fr`      | tu                                                                                       | No-break space (U+00A0) before : ; ? ! and inside « »; ’ as the apostrophe                                                                    |
| German             | `de`      | du (lowercase)                                                                           | „ “ quotes; prefer short compounds; ß becomes SS in all-caps kickers, as JavaScript uppercases it                                                        |

Uppercase kickers ("CAUGHT", "KEEP") are uppercase in Indonesian, Spanish, French and German; Chinese,
Japanese, Korean and Thai have no case and simply write the word. Placeholders (`{name}`, `{count}`,
`{amount}`) stay exactly as they are; amounts arrive already written (353k, $17.4k), so no currency
word is ever added around them.

## 6pm's ideas

| English                         | zh-Hans      | ja                   | ko               | th                     | id                       | es                     | fr                       | de                    |
| ------------------------------- | ------------ | -------------------- | ---------------- | ---------------------- | ------------------------ | ---------------------- | ------------------------ | --------------------- |
| Safe to spend today             | 今天可以花   | 今日使えるお金       | 오늘 쓸 수 있는 돈 | วันนี้ใช้ได้           | Aman dipakai hari ini    | Puedes gastar hoy      | À dépenser aujourd’hui   | Heute verfügbar       |
| daily number                    | 每日额度     | 今日の数字           | 하루 금액        | ยอดรายวัน              | angka harian             | número del día         | chiffre du jour          | Tageszahl             |
| the close (noun)                | 日结         | 締め                 | 마감             | ปิดวัน                 | tutup hari               | el cierre              | la clôture               | der Tagesabschluss    |
| close your day / Close day      | 结束今天     | 今日を締める         | 오늘 마감하기    | ปิดวันนี้              | Tutup hari ini           | Cierra tu día          | Clôture ta journée       | Schließ deinen Tag ab |
| caught (captured on its own)    | 记下         | キャッチ             | 잡힌 / 잡았어요  | จับได้                 | tertangkap               | pillado                | repéré                   | erwischt              |
| Keep (swipe right)              | 保留         | 残す                 | 맞아요           | เก็บไว้                | Simpan                   | Guardar                | Garder                   | Behalten              |
| Not mine (swipe down)           | 不是我的     | 自分のじゃない       | 내 거 아님       | ไม่ใช่ของฉัน           | Bukan punyaku            | No es mío              | Pas à moi                | Nicht meins           |
| Edit (swipe left)               | 修改         | 編集                 | 수정             | แก้ไข                  | Ubah                     | Editar                 | Modifier                 | Ändern                |
| Inbox                           | 收件箱       | インボックス         | 수신함           | Inbox                  | Kotak masuk              | Bandeja                | Boîte de réception       | Eingang               |
| (money) Diary                   | 消费日记     | お金日記             | 머니 다이어리    | ไดอารี่เงิน            | Diari uang               | Diario                 | Journal                  | Tagebuch              |
| Plan                            | 计划         | プラン               | 플랜             | แผน                    | Rencana                  | Plan                   | Plan                     | Plan                  |
| Future you                      | 未来的你     | 未来の自分           | 미래의 나        | ตัวคุณในอนาคต          | Kamu di masa depan       | Tu yo del futuro       | Toi du futur             | Zukunfts-Ich          |
| pot (an occasion saved for)     | 存钱罐       | 貯金箱               | 저금통           | กระปุก                 | celengan                 | hucha                  | cagnotte                 | Spartopf              |
| payday                          | 发薪日       | 給料日               | 월급날           | วันเงินเดือนออก        | hari gajian              | día de cobro           | jour de paie             | Zahltag               |
| pay cycle                       | 发薪周期     | 給料サイクル         | 월급 주기        | รอบเงินเดือน           | siklus gaji              | ciclo de pago          | cycle de paie            | Gehaltszyklus         |
| free money                      | 可自由花的钱 | 自由に使えるお金     | 여윳돈           | เงินใช้ได้อิสระ        | uang bebas               | dinero libre           | argent libre             | freies Geld           |
| bills                           | 固定账单     | 固定費               | 고정비           | บิลประจำ               | tagihan                  | facturas               | factures                 | Fixkosten             |
| Claim back (work spends)        | 报销         | 経費精算             | 경비 청구        | เบิกคืน                | Klaim kantor             | Reembolso              | Note de frais            | Erstattung            |
| Quick add                       | 快速记账     | クイック追加         | 빠른 추가        | เพิ่มด่วน              | Tambah cepat             | Añadir rápido          | Ajout rapide             | Schnell erfassen      |
| Scan / Scan to pay              | 扫码 / 扫码付款 | スキャン / スキャンして支払う | 스캔 / 스캔해서 결제 | สแกน / สแกนจ่าย | Pindai / Pindai & bayar  | Escanear / Escanea y paga | Scanner / Scanner et payer | Scannen / Scannen & zahlen |
| Ask 6pm                         | 问问 6pm     | 6pmに聞く            | 6pm에게 묻기     | ถาม 6pm                | Tanya 6pm                | Pregunta a 6pm         | Demande à 6pm            | Frag 6pm              |
| receipt (the close's, a bank's) | 小票         | レシート             | 영수증           | ใบเสร็จ                | struk                    | ticket                 | ticket                   | Beleg                 |
| Year book                       | 年度纪念册   | イヤーブック         | 이어북           | สมุดประจำปี            | Buku tahunan             | Anuario                | Album de l’année         | Jahrbuch              |
| Looks (paid themes)             | 外观         | 着せかえ             | 룩               | ลุค                    | Tampilan                 | Estilos                | Looks                    | Looks                 |
| companion                       | 小伙伴       | 相棒                 | 짝꿍             | เพื่อนคู่ใจ            | teman                    | compañero              | compagnon                | Begleiter             |
| Serious mode                    | 严肃模式     | まじめモード         | 진지 모드        | โหมดจริงจัง            | Mode serius              | Modo serio             | Mode sérieux             | Ernst-Modus           |
| Travel mode                     | 旅行模式     | 旅行モード           | 여행 모드        | โหมดเดินทาง            | Mode perjalanan          | Modo viaje             | Mode voyage              | Reisemodus            |
| Budget together                 | 一起记账     | ふたりで家計         | 함께 예산        | งบด้วยกัน              | Anggaran bersama         | Presupuesto en pareja  | Budget à deux            | Gemeinsam budgetieren |
| money in (income)               | 进账         | 入金                 | 들어온 돈        | เงินเข้า               | uang masuk               | dinero que entra       | rentrées                 | Einnahmen             |
| spread it (money in, over the days) | 分到每天 | 毎日に分ける | 나눠 쓰기 | กระจายไปทุกวัน | Bagi rata | Repártelo | Répartir | Verteilen |
| save it (money in, to Future you) | 存给未来的你 | 未来の自分へ | 미래의 나에게 | เก็บให้ตัวคุณในอนาคต | Simpan untuk masa depan | Para tu yo del futuro | Pour toi du futur | Fürs Zukunfts-Ich |
| your pay (what payday brings) | 工资 | 給料 | 월급 | เงินเดือน | gaji | tu sueldo | ta paie | dein Gehalt |
| what you can count on (the plan's income) | 稳定到手的钱 | 当てにできるお金 | 믿고 쓸 수 있는 돈 | เงินที่นับได้แน่ | uang yang pasti masuk | con lo que puedes contar | ce sur quoi tu peux compter | womit du rechnen kannst |
| refund (a shop gives money back) | 退款 | 返金 | 환불 | เงินคืน | pengembalian dana | devolución | remboursement | Rückerstattung |
| paying me back (a person repays) | 还我钱 | 立て替え分の返金 | 갚은 돈 | คืนเงินให้ฉัน | bayar balik | me lo devuelve | me rembourse | zahlt mir zurück |
| bank alert (a captured notification) | 银行通知 | 銀行の通知 | 은행 알림 | แจ้งเตือนธนาคาร | notifikasi bank | aviso del banco | alerte bancaire | Bankmitteilung |

Kept as they are in every language: 6pm, 6pm Max (Max), VietQR, NAPAS 247, Apple Pay, Siri, iPhone,
App Store, iCloud, Google Play, bank and wallet names, and the companions' names (Nhang, Bánh Bao,
Giọt, Hạc Giấy). Vietnamese foods the English keeps in Vietnamese (Nước mía, Xôi, Phở) stay too.
The looks' names are translated as Vietnamese translates them (Golden Hour, Monsoon, Lantern River).

## Apple's names in each language

Use the name the iPhone itself shows in that language.

| English         | zh-Hans  | ja                         | ko          | th                | id                | es                      | fr                    | de                 |
| --------------- | -------- | -------------------------- | ----------- | ----------------- | ----------------- | ----------------------- | --------------------- | ------------------ |
| Shortcuts       | 快捷指令 | ショートカット             | 단축어      | คำสั่งลัด         | Pintasan          | Atajos                  | Raccourcis            | Kurzbefehle        |
| Settings        | 设置     | 設定                       | 설정        | การตั้งค่า        | Pengaturan        | Ajustes                 | Réglages              | Einstellungen      |
| Photos          | 照片     | 写真                       | 사진        | รูปภาพ            | Foto              | Fotos                   | Photos                | Fotos              |
| Wallet          | 钱包     | ウォレット                 | 지갑        | กระเป๋าสตางค์     | Dompet            | Cartera                 | Cartes                | Wallet             |
| Mail            | 邮件     | メール                     | Mail        | เมล               | Mail              | Mail                    | Mail                  | Mail               |
| Lock Screen     | 锁定屏幕 | ロック画面                 | 잠금 화면   | หน้าจอล็อค        | Layar Terkunci    | pantalla de bloqueo     | écran verrouillé      | Sperrbildschirm    |
| Home Screen     | 主屏幕   | ホーム画面                 | 홈 화면     | หน้าจอโฮม         | Layar Utama       | pantalla de inicio      | écran d’accueil       | Home-Bildschirm    |
| Control Center  | 控制中心 | コントロールセンター       | 제어 센터   | ศูนย์ควบคุม       | Pusat Kontrol     | centro de control       | centre de contrôle    | Kontrollzentrum    |
| Action button   | 操作按钮 | アクションボタン           | 동작 버튼   | ปุ่มการทำงาน      | Tombol Tindakan   | botón de acción         | bouton Action         | Aktionstaste       |
| Live Activity   | 实时活动 | ライブアクティビティ       | 실시간 현황 | กิจกรรมสด         | Aktivitas Langsung | Actividad en vivo      | Activité en direct    | Live-Aktivität     |
| Dynamic Island  | 灵动岛   | ダイナミックアイランド     | Dynamic Island | Dynamic Island | Dynamic Island    | Dynamic Island          | Dynamic Island        | Dynamic Island     |
| Share (sheet)   | 共享     | 共有                       | 공유        | แชร์              | Bagikan           | Compartir               | Partager              | Teilen             |
| Widget          | 小组件   | ウィジェット               | 위젯        | วิดเจ็ต           | widget            | widget                  | widget                | Widget             |
| Focus           | 专注模式 | 集中モード                 | 집중 모드   | โฟกัส             | Fokus             | Concentración           | Concentration         | Fokus              |

Siri's spoken phrases for 6pm's App Shortcuts (`native.appShortcuts.*`) are written into each
language's `AppShortcuts.strings` where Siri speaks that language (Chinese, Japanese, Korean, Thai,
Spanish, French and German). Siri has no Vietnamese or Indonesian, so there the phrases stay
English, and any line that quotes a phrase quotes the English one ("Log in 6pm"). The titles and
descriptions around them follow the phone's language everywhere.
