import type { Entry } from '../catalogue-types';
import type { enInsightsHabits } from '../en-insights-habits';

// Same voice as the other insight lines: "aku" for itself, "kamu" for you, casual Jakarta texting,
// one slang word at most. Roast teases the purchase or the pattern, never the person.
export const idInsightsHabits: { readonly [Key in keyof typeof enInsightsHabits]: Entry } = {
  'insight.noSpendDay.soft.1': 'Sehari tanpa keluar uang sepeser pun: {kept} utuh di tempatnya.',
  'insight.noSpendDay.soft.2': 'Hari tanpa belanja. {kept} tersimpan, tenang dan manis.',
  'insight.noSpendDay.cheeky.1': 'Nol pengeluaran, {kept} utuh. Dompetnya libur sehari.',
  'insight.noSpendDay.cheeky.2': 'Seharian, nggak keluar apa-apa. {kept} bilang makasih.',
  'insight.noSpendDay.roast.1':
    'Nggak ada pengeluaran, {kept} utuh. Ini siapa, dan boleh tinggal lama?',
  'insight.noSpendDay.roast.2': 'Nol pengeluaran, {kept} tersimpan. Toko-toko pasti bertahan kok.',
  'insight.noSpendDay.plain':
    'Hari terakhir yang ditutup tanpa pengeluaran; {kept} dari batasnya tersimpan.',

  'insight.noSpendStreak.soft.1': '{days} hari tenang berturut-turut: {kept} tetap utuh.',
  'insight.noSpendStreak.soft.2': '{days} hari tanpa pengeluaran. {kept} tetap bersamamu.',
  'insight.noSpendStreak.cheeky.1': '{days} hari, nol pengeluaran. Dompetnya mulai curiga.',
  'insight.noSpendStreak.cheeky.2':
    '{days} hari tanpa belanja berturut-turut. {kept} lagi istirahat santai.',
  'insight.noSpendStreak.roast.1':
    '{days} hari, nggak ada satu pun pengeluaran. Kedai kopi langgananmu mulai khawatir.',
  'insight.noSpendStreak.roast.2':
    '{days} hari tanpa belanja, {kept} utuh. Santai, jangan jadi aneh.',
  'insight.noSpendStreak.plain':
    '{days} hari ditutup berturut-turut tanpa pengeluaran; {kept} tersimpan.',

  'insight.backUnder.soft.1':
    'Kembali di bawah batas setelah sehari lewat: sisa {spare}. Bagus banget.',
  'insight.backUnder.soft.2':
    'Sehari lewat, lalu sehari di bawah dengan sisa {spare}. Itu ritmenya.',
  'insight.backUnder.cheeky.1': 'Arc penebusan: kembali di bawah, sisa {spare}.',
  'insight.backUnder.cheeky.2': 'Sehari lewat, besoknya sisa {spare}. Seimbang.',
  'insight.backUnder.roast.1':
    'Sisa {spare}, tepat setelah sehari lewat. Permintaan maaf diterima.',
  'insight.backUnder.roast.2': 'Kembali di bawah, sisa {spare}. Comeback yang kita tunggu.',
  'insight.backUnder.plain': 'Kembali di bawah batas setelah sehari lewat, sisa {spare}.',

  'insight.logGap.soft.1': 'Belum ada catatan sejak {since}. Lagi tenang, atau lagi sibuk?',
  'insight.logGap.soft.2': 'Sudah {days} hari tanpa catatan pengeluaran. Ada yang mau ditambah?',
  'insight.logGap.cheeky.1': 'Belum ada catatan sejak {since}. Lagi bertapa, atau cuma sibuk?',
  'insight.logGap.cheeky.2': '{days} hari, nggak ada catatan. Dompetnya lagi liburan?',
  'insight.logGap.roast.1': 'Kosong sejak {since}. Beneran nggak ada, atau cuma belum dicatat?',
  'insight.logGap.roast.2': '{days} hari sunyi. Segelas kopi pun dihitung; catat, dan kita impas.',
  'insight.logGap.plain': 'Belum ada pengeluaran yang dicatat sejak {since}.',

  'insight.weekendHeavy.soft.1':
    'Belakangan, sehari di akhir pekan sekitar {weekend}, hari kerja {weekday}. Layak dipikirkan sebelum Sabtu.',
  'insight.weekendHeavy.soft.2':
    'Akhir pekan {weekend} sehari, hari kerja {weekday}. Pelan-pelan saja.',
  'insight.weekendHeavy.cheeky.1':
    'Hari kerja: {weekday} sehari. Akhir pekan: {weekend}. Sabtu sudah punya rencana buatmu.',
  'insight.weekendHeavy.cheeky.2':
    'Sehari akhir pekan rata-rata {weekend}, hari kerja {weekday}. Akhir pekan datang. Siap?',
  'insight.weekendHeavy.roast.1':
    '{weekday} di hari kerja, {weekend} di akhir pekan. Akhir pekan menang terus; seri saja, gimana?',
  'insight.weekendHeavy.roast.2':
    'Akhir pekan: {weekend} sehari. Hari kerja: {weekday}. Akhir pekan ini, tanding ulang?',
  'insight.weekendHeavy.plain':
    'Empat minggu terakhir: {weekend} per hari akhir pekan, {weekday} per hari kerja.',

  'insight.recordDay.soft.1':
    '{amount} hari ini, hari terbesar dalam {days} hari. Nggak apa-apa; besok mulai lagi.',
  'insight.recordDay.soft.2':
    '{amount} hari ini paling besar dalam {days} hari. Rencananya menyesuaikan.',
  'insight.recordDay.cheeky.1':
    '{amount} hari ini. Rekor baru, cuma bukan grafik yang kita mau. Besok mulai lagi.',
  'insight.recordDay.cheeky.2':
    'Rekor baru: {amount}, terbesar dalam {days} hari. Jangan dicetak dua kali, ya.',
  'insight.recordDay.roast.1':
    '{amount} hari ini, terbesar dalam {days} hari. Berani. Besok, encore yang lebih kecil.',
  'insight.recordDay.roast.2': '{amount} dalam sehari, rekor {days} hari. Bingkai, lalu istirahat.',
  'insight.recordDay.plain':
    '{amount} hari ini adalah pengeluaran harian terbesar dalam {days} hari terakhir.',

  'insight.likelySubscription.soft.1':
    '{merchant} menarik sekitar {amount} tiap bulan. Jadikan tagihan?',
  'insight.likelySubscription.soft.2':
    '{amount} ke {merchant}, {months} bulan berturut-turut. Mau dijadikan tagihan?',
  'insight.likelySubscription.cheeky.1':
    '{merchant} lagi, {amount}, tepat waktu banget. Ketahuan kamu, langganan. Jadikan tagihan?',
  'insight.likelySubscription.cheeky.2':
    '{months} bulan {merchant} seharga {amount}. Masih dipakai? Tambahkan sebagai tagihan.',
  'insight.likelySubscription.roast.1':
    '{merchant}: {amount}, {months} bulan berturut-turut. Masih dipakai, atau cuma dibayar?',
  'insight.likelySubscription.roast.2':
    '{amount} ke {merchant} tiap bulan. Mau lanjut? Jadikan tagihan. Kalau nggak, batalkan.',
  'insight.likelySubscription.plain':
    '{merchant} menarik sekitar {amount} per bulan selama {months} bulan. Bisa dijadikan tagihan.',

  'insight.lateNight.soft.1': '{amount} tengah malam di {merchant}. Semoga membantu.',
  'insight.lateNight.soft.2': '{merchant}, {amount}, setelah gelap. Tidur yang nyenyak.',
  'insight.lateNight.cheeky.1':
    '{amount} di {merchant}, jauh lewat jam tidur. Belanja ala burung hantu.',
  'insight.lateNight.cheeky.2': '{merchant} tengah malam, {amount}. Klasik.',
  'insight.lateNight.roast.1':
    '{amount} di {merchant} dini hari. Keputusan besar paling baik diambil saat terang.',
  'insight.lateNight.roast.2':
    '{merchant} malam-malam, {amount}. Lain kali, keranjangnya diinapkan dulu.',
  'insight.lateNight.plain': 'Pengeluaran larut malam: {amount} di {merchant}.',

  'insight.cycleHalfway.soft.1': 'Setengah siklus: {percent}% terpakai, sisa {left}.',
  'insight.cycleHalfway.soft.2':
    'Setengah siklus lewat, {left} masih bebas. Kamu terus mencatat, dan itu bagian tersulitnya.',
  'insight.cycleHalfway.cheeky.1': 'Turun minum. Skor: {percent}% terpakai, {left} buat dimainkan.',
  'insight.cycleHalfway.cheeky.2': 'Sudah setengah jalan. Sisa {left} buat babak kedua.',
  'insight.cycleHalfway.roast.1':
    'Turun minum: {percent}% terpakai. {left} buat babak kedua; mainkan dengan baik.',
  'insight.cycleHalfway.roast.2':
    'Setengah jalan, {percent}% habis, sisa {left}. Babak kedua yang menentukan.',
  'insight.cycleHalfway.plain': 'Sudah setengah siklus: {percent}% terpakai, sisa {left}.',

  'insight.firstWeekPaceUp.soft.1':
    'Minggu pertama memakai {percent}% siklus; laju rata adalah {even}%. Minggu-minggu depan bisa meratakannya.',
  'insight.firstWeekPaceUp.soft.2':
    'Minggu pertama yang sibuk: {percent}% uang siklus ini. Hari-hari tenang akan mengembalikannya.',
  'insight.firstWeekPaceUp.cheeky.1':
    'Minggu pertama: {percent}% habis, laju rata {even}%. Start yang kuat. Mungkin terlalu kuat.',
  'insight.firstWeekPaceUp.cheeky.2':
    'Minggu pertama ambil {percent}%. Ratanya {even}%. Atur napas.',
  'insight.firstWeekPaceUp.roast.1':
    'Minggu pertama makan {percent}% siklus. Ratanya {even}%. Minggu-minggu lain mau bicara.',
  'insight.firstWeekPaceUp.roast.2':
    '{percent}% dalam seminggu, padahal ratanya {even}%. Itu tadi sprint; sekarang jogging.',
  'insight.firstWeekPaceUp.plain':
    'Minggu pertama memakai {percent}% uang siklus; laju rata adalah {even}%.',

  'insight.firstWeekPaceDown.soft.1':
    'Minggu pertama cuma memakai {percent}% siklus; laju rata {even}%. Awal yang manis.',
  'insight.firstWeekPaceDown.soft.2':
    'Minggu pertama yang santai: {percent}% terpakai, {compare} dari laju rata.',
  'insight.firstWeekPaceDown.cheeky.1':
    'Minggu pertama: cuma {percent}%, di bawah rata {even}%. Start yang mulus.',
  'insight.firstWeekPaceDown.cheeky.2': 'Minggu pertama: {percent}%. Ratanya {even}%. Lihat itu.',
  'insight.firstWeekPaceDown.roast.1':
    'Minggu pertama pakai {percent}%, di bawah rata {even}%. Bagusnya mencurigakan. Pertahankan.',
  'insight.firstWeekPaceDown.roast.2':
    '{percent}% di minggu pertama, ratanya {even}%. Nggak ada komentar.',
  'insight.firstWeekPaceDown.plain':
    'Minggu pertama memakai {percent}% uang siklus; laju rata adalah {even}%.',

  'insight.paceSpare.soft.1':
    'Dengan laju ini, gajian ({payday}) datang dengan sisa sekitar {spare}.',
  'insight.paceSpare.soft.2':
    'Pertahankan, dan kamu sampai di {payday} dengan sisa sekitar {spare}.',
  'insight.paceSpare.cheeky.1':
    'Perkiraan sisa di {payday}: {spare}. Jangan dibelanjakan dalam kepala dulu.',
  'insight.paceSpare.cheeky.2': 'Dengan laju ini, sisa {spare} saat {payday}. Mantap.',
  'insight.paceSpare.roast.1':
    'Sisa {spare} saat {payday} dengan laju ini. Jangan dibelanjakan sebelum ada.',
  'insight.paceSpare.roast.2': 'Ramalan: sisa {spare} di {payday}. Jaga ramalannya tetap jujur.',
  'insight.paceSpare.plain':
    'Dengan laju sejauh ini, sisa sekitar {spare} di hari gajian, {payday}.',

  'insight.paceShort.soft.1':
    'Dengan laju ini, uang mulai seret sekitar {runsOut}, sebelum gajian ({payday}). Beberapa hari yang lebih kecil membereskannya.',
  'insight.paceShort.soft.2':
    'Pengingat: dengan laju ini, uangnya kurang sekitar {runsOut}. Hari yang lebih kecil membantu, dan masih ada waktu.',
  'insight.paceShort.cheeky.1':
    'Rute ini kehabisan bensin sekitar {runsOut}; gajian {payday}. Cari jalan lain?',
  'insight.paceShort.cheeky.2':
    'Dengan laju ini, uang habis sekitar {runsOut}. Gajian {payday}. Hari-hari santai di depan.',
  'insight.paceShort.roast.1':
    'Laju ini kering sekitar {runsOut}, dan gajian {payday}. Beberapa hari kalem, dan mendarat mulus.',
  'insight.paceShort.roast.2':
    '{runsOut}: uang habis dengan laju ini. {payday}: gajian. Yuk tutup celahnya.',
  'insight.paceShort.plain':
    'Dengan laju sejauh ini, uang habis sekitar {runsOut}, sebelum gajian pada {payday}.',
};
