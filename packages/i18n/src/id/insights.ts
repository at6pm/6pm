import type { Entry } from '../catalogue-types';
import type { enInsights } from '../en-insights';

// The companion says "aku" for itself and "kamu" for you, casual Jakarta texting with nih, deh, ya.
// The day's limit is "batas"; a pot is a "celengan"; closing the day is "tutup hari".
export const idInsights: { readonly [Key in keyof typeof enInsights]: Entry } = {
  'insight.compare.muchMore': 'jauh lebih banyak',
  'insight.compare.more': 'lebih banyak',
  'insight.compare.about': 'kurang lebih sama',
  'insight.compare.less': 'lebih sedikit',
  'insight.compare.muchLess': 'jauh lebih sedikit',

  'insight.todayOver.soft.1': 'Hari ini lewat {over}. Nggak apa-apa, besok masih ada {tomorrow}.',
  'insight.todayOver.soft.2':
    'Hari yang agak besar, lewat {over}. Rencananya menyesuaikan: besok {tomorrow}.',
  'insight.todayOver.cheeky.1': 'Lewat {over} hari ini. Besok {tomorrow}, lembaran baru.',
  'insight.todayOver.cheeky.2':
    'Hari ini tembus batas {over}. Plot twist; besok masih ada {tomorrow}.',
  'insight.todayOver.roast.1':
    'Lewat {over}. Batasnya sudah berjuang keras. Besok {tomorrow}, pelan-pelan ya.',
  'insight.todayOver.roast.2':
    'Batasnya bilang jangan, hari ini bilang tambah {over}. Besok {tomorrow}, ronde dua.',
  'insight.todayOver.plain': 'Hari ini lewat {over} dari batas. Batas besok {tomorrow}.',

  'insight.todayUnder.soft.1': 'Baru {spent}, masih {safe} aman. Stabil, mantap.',
  'insight.todayUnder.soft.2': 'Hari ini masih ada {safe}. Kamu baik-baik saja kok.',
  'insight.todayUnder.cheeky.1': 'Sisa {safe} hari ini. Pakai dengan bijak, atau simpan. Terserah.',
  'insight.todayUnder.cheeky.2': 'Sudah {spent}, sisa {safe}. Mulus.',
  'insight.todayUnder.roast.1':
    'Baru {spent}? Dompetnya sampai bingung, bingung yang bagus. Masih {safe} aman.',
  'insight.todayUnder.roast.2': 'Masih {safe} aman. Agak mencurigakan. Lanjutkan.',
  'insight.todayUnder.plain': 'Hari ini terpakai {spent}, masih {safe} aman.',

  'insight.noSpendYet.soft.1': 'Belum ada pengeluaran. Semua {line} hari ini masih milikmu.',
  'insight.noSpendYet.soft.2': 'Lembaran bersih: {line} untuk hari ini.',
  'insight.noSpendYet.cheeky.1': '{line} hari ini, belum tersentuh sedikit pun. Belum.',
  'insight.noSpendYet.cheeky.2': '{line} utuh hari ini, belum disentuh. Untuk sekarang.',
  'insight.noSpendYet.roast.1': 'Belum ada pengeluaran. {line} lagi nunggu langkahmu.',
  'insight.noSpendYet.roast.2': '{line} diam saja, belum dipakai. Mencurigakan. Lanjut.',
  'insight.noSpendYet.plain': 'Belum ada pengeluaran. Batas hari ini {line}.',

  'insight.waitingTonight.soft.1': {
    other: '{count} pengeluaran ({amount}) menunggu nanti malam. Paling semenit.',
  },
  'insight.waitingTonight.soft.2': {
    other: '{count} pengeluaran untuk dicek nanti malam, total {amount}.',
  },
  'insight.waitingTonight.cheeky.1': {
    other: '{count} pengeluaran ({amount}) menunggu vonismu nanti malam.',
  },
  'insight.waitingTonight.cheeky.2': {
    other: 'Tutup hari nanti malam: {count} pengeluaran, {amount}. Gampang.',
  },
  'insight.waitingTonight.roast.1': {
    other:
      '{count} pengeluaran, {amount}, menunggu. Mereka nggak bakal menutup diri sendiri; semenit beres.',
  },
  'insight.waitingTonight.roast.2': {
    other: '{count} pengeluaran, {amount}, menunggu kamu bilang “iya, itu aku”.',
  },
  'insight.waitingTonight.plain': {
    other: '{count} pengeluaran ({amount}) menunggu tutup hari nanti malam.',
  },

  'insight.paydaySoon.soft.1': { other: 'Gajian {count} hari lagi. Sedikit lagi.' },
  'insight.paydaySoon.soft.2': {
    other: '{count} hari lagi menuju gajian, {payday}. Bertahan ya.',
  },
  'insight.paydaySoon.cheeky.1': { other: 'Gajian {count} hari lagi. Udah kecium baunya.' },
  'insight.paydaySoon.cheeky.2': { other: '{count} kali tidur lagi sampai gajian.' },
  'insight.paydaySoon.roast.1': { other: '{count} hari lagi gajian. Tahan dulu.' },
  'insight.paydaySoon.roast.2': {
    other: 'Gajian {payday}. Sampai saat itu, dompetnya dikancing rapat.',
  },
  'insight.paydaySoon.plain': { other: 'Gajian {count} hari lagi, pada {payday}.' },

  'insight.billDueToday.soft.1': '{bill} ({amount}) jatuh tempo hari ini.',
  'insight.billDueToday.soft.2': 'Sekadar mengingatkan: {bill}, {amount}, jatuh tempo hari ini.',
  'insight.billDueToday.cheeky.1': '{bill} minta {amount}-nya hari ini.',
  'insight.billDueToday.cheeky.2': 'Bintang tamu hari ini: {bill}, {amount}.',
  'insight.billDueToday.roast.1': '{bill} jatuh tempo hari ini. Dia nggak bakal nunggu.',
  'insight.billDueToday.roast.2': '{amount} untuk {bill}, hari ini. Jangan di-ghosting.',
  'insight.billDueToday.plain': '{bill} ({amount}) jatuh tempo hari ini.',

  'insight.billDue.soft.1': { other: '{bill} ({amount}) jatuh tempo {count} hari lagi.' },
  'insight.billDue.soft.2': { other: 'Pengingat: {bill}, {amount}, {count} hari lagi.' },
  'insight.billDue.cheeky.1': { other: '{bill} datang menagih {amount} {count} hari lagi.' },
  'insight.billDue.cheeky.2': { other: '{count} hari lagi: {bill}, {amount}. Catat ya.' },
  'insight.billDue.roast.1': {
    other: '{bill} minta {amount} {count} hari lagi. Seperti biasa.',
  },
  'insight.billDue.roast.2': {
    other: '{amount} untuk {bill} {count} hari lagi. Jangan pura-pura kaget.',
  },
  'insight.billDue.plain': { other: '{bill} ({amount}) jatuh tempo {count} hari lagi.' },

  'insight.categoryPaceUp.soft.1':
    '{category} sudah {now} siklus ini, {compare} dibanding titik yang sama siklus lalu.',
  'insight.categoryPaceUp.soft.2': '{category} lagi melaju: sudah {now}, siklus lalu {before}.',
  'insight.categoryPaceUp.cheeky.1': '{category}: sudah {now}. Siklus lalu baru {before}. Hmm.',
  'insight.categoryPaceUp.cheeky.2': '{category} lagi naik daun: {now} vs {before}.',
  'insight.categoryPaceUp.roast.1':
    '{category} di {now}. Siklus lalu: {before}. Aku lihat kok. Seminggu santai, beres.',
  'insight.categoryPaceUp.roast.2':
    'Sudah {now} buat {category}; dulu {before}. Cuma bilang, dengan sayang.',
  'insight.categoryPaceUp.plain':
    '{category}: {now} siklus ini, {before} di titik yang sama siklus lalu.',

  'insight.categoryPaceDown.soft.1':
    '{category} turun jadi {now}, dari {before} siklus lalu. Manis.',
  'insight.categoryPaceDown.soft.2': '{category} {compare} dari siklus lalu: {now} vs {before}.',
  'insight.categoryPaceDown.cheeky.1': '{category}: {now}, turun dari {before}. Keren juga kamu.',
  'insight.categoryPaceDown.cheeky.2': '{category} lagi diet: {now} vs {before}.',
  'insight.categoryPaceDown.roast.1':
    '{category} cuma {now}? Dulu {before}. Pertahankan versi yang ini.',
  'insight.categoryPaceDown.roast.2': '{now} untuk {category}, turun dari {before}. Bertumbuh.',
  'insight.categoryPaceDown.plain':
    '{category}: {now} siklus ini, {before} di titik yang sama siklus lalu.',

  'insight.repeatMerchant.soft.1': '{merchant} {visits} kali minggu ini. Pasti mereka sayang kamu.',
  'insight.repeatMerchant.soft.2': '{visits} kali ke {merchant} sejak Senin, total {amount}.',
  'insight.repeatMerchant.cheeky.1': '{merchant} lagi? Sudah {visits} kali sejak Senin.',
  'insight.repeatMerchant.cheeky.2': 'Kamu dan {merchant}: {visits} kencan minggu ini, {amount}.',
  'insight.repeatMerchant.roast.1':
    '{merchant}, kunjungan ke-{visits}. Mereka sudah hafal namamu belum?',
  'insight.repeatMerchant.roast.2':
    '{amount} di {merchant} minggu ini. {visits} kali. Sudah jadi gaya hidup.',
  'insight.repeatMerchant.plain': '{merchant}: {visits} kunjungan minggu ini, {amount}.',

  'insight.firstTimeMerchant.soft.1': 'Pertama kali ke {merchant}. Semoga enak ya.',
  'insight.firstTimeMerchant.soft.2': 'Tempat baru: {merchant}, {amount}.',
  'insight.firstTimeMerchant.cheeky.1': '{merchant}? Tempat baru. Berani juga.',
  'insight.firstTimeMerchant.cheeky.2': 'Wah, {merchant}. Belum pernah lihat yang ini.',
  'insight.firstTimeMerchant.roast.1': '{merchant}. Tempat baru, dompet lama.',
  'insight.firstTimeMerchant.roast.2':
    'Pertama kali ke {merchant}. Jangan jadi kebiasaan. Atau jadi juga boleh.',
  'insight.firstTimeMerchant.plain': 'Pengeluaran pertama di {merchant}: {amount}.',

  'insight.biggestSpend.soft.1': 'Yang besar minggu ini: {amount} di {merchant}.',
  'insight.biggestSpend.soft.2':
    '{merchant}, {amount}: terbesar minggu ini. Rencananya sudah menampung.',
  'insight.biggestSpend.cheeky.1': 'Bintang utama minggu ini: {merchant}, {amount}.',
  'insight.biggestSpend.cheeky.2': '{amount} di {merchant}. Self-reward, katanya.',
  'insight.biggestSpend.roast.1': '{amount} di {merchant}. Tokoh utama minggu ini.',
  'insight.biggestSpend.roast.2':
    '{merchant} ambil {amount} minggu ini. Worth it? Nggak usah jawab. Rencananya sudah menampung.',
  'insight.biggestSpend.plain': 'Pengeluaran terbesar minggu ini: {amount} di {merchant}.',

  'insight.underStreak.soft.1': '{days} hari berturut-turut di bawah batas. Kamu stabil banget.',
  'insight.underStreak.soft.2': '{days} hari tenang berturut-turut.',
  'insight.underStreak.cheeky.1': '{days} hari di bawah batas. Lagi era streak.',
  'insight.underStreak.cheeky.2': 'Di bawah batas {days} hari berturut-turut. Jangan sampai sial.',
  'insight.underStreak.roast.1': '{days} hari di bawah batas. Aku sudah siapin lelucon. Sia-sia.',
  'insight.underStreak.roast.2': '{days} hari berturut-turut. Stok leluconku mulai habis.',
  'insight.underStreak.plain': '{days} hari yang ditutup berturut-turut, pas atau di bawah batas.',

  'insight.closeStreak.soft.1': '{days} hari tutup berturut-turut. Itulah ritualnya.',
  'insight.closeStreak.soft.2': 'Runtunan tutup hari {days} hari. Makasih sudah selalu datang.',
  'insight.closeStreak.cheeky.1': '{days} kali tutup hari beruntun. Kebiasaan baru: terbuka.',
  'insight.closeStreak.cheeky.2': 'Runtunan: {days}. Malam ini nambah lagi.',
  'insight.closeStreak.roast.1':
    '{days} hari tanpa bolong. Runtunan ini cocok di kamu; jangan diputus.',
  'insight.closeStreak.roast.2': '{days} kali tutup hari beruntun. Jangan putus sekarang.',
  'insight.closeStreak.plain': '{days} hari ditutup berturut-turut.',

  'insight.weekSpare.soft.1': {
    other: '{count} hari di bawah batas minggu ini: sisa {spare} berlanjut ke hari-hari depan.',
  },
  'insight.weekSpare.soft.2': { other: 'Sisa {spare} minggu ini, dibawa ke depan.' },
  'insight.weekSpare.cheeky.1': {
    other: 'Sisa {spare} dari {count} hari yang baik. Hari-hari depan bilang makasih.',
  },
  'insight.weekSpare.cheeky.2': { other: 'Minggu ini unggul {spare}. Mulus.' },
  'insight.weekSpare.roast.1': {
    other: '{count} hari di bawah, sisa {spare}. Jangan dihabiskan sekaligus.',
  },
  'insight.weekSpare.roast.2': { other: 'Minggu ini surplus {spare}. Oke, aku izinkan.' },
  'insight.weekSpare.plain': {
    other: 'Hari-hari yang ditutup minggu ini menyisakan {spare}.',
  },

  'insight.weekOver.soft.1':
    'Minggu ini lewat {over}. Hari-hari depan sedikit lebih kecil, dan itu nggak apa-apa.',
  'insight.weekOver.soft.2': 'Lewat {over} minggu ini. Nanti kita ratakan.',
  'insight.weekOver.cheeky.1': 'Minggu ini lewat {over}. Sisa bulan ini yang menyesuaikan.',
  'insight.weekOver.cheeky.2': 'Lewat {over} sejauh ini. Plot twist, bukan ending.',
  'insight.weekOver.roast.1':
    'Minggu ini: lewat {over}. Minggu depan lebih kalem, bulan ini masih kuat.',
  'insight.weekOver.roast.2': 'Lewat {over}. Minggu untuk dilupakan, bulan untuk memperbaiki.',
  'insight.weekOver.plain': 'Hari-hari yang ditutup minggu ini lewat {over} dari batas.',

  'insight.potMilestone.soft.1': 'Celengan {pot} sudah lewat {percent}%. Lihat, makin besar.',
  'insight.potMilestone.soft.2': 'Sudah {percent}% menuju {pot}.',
  'insight.potMilestone.cheeky.1': '{pot}: {percent}% jalan. Beneran kejadian.',
  'insight.potMilestone.cheeky.2': '{percent}% dari {pot}, beres. Terus diisi ya.',
  'insight.potMilestone.roast.1': 'Celengan {pot} di {percent}%. Celengannya menang. Biarkan saja.',
  'insight.potMilestone.roast.2': '{percent}% menuju {pot}. Jangan dibobol.',
  'insight.potMilestone.plain': 'Celengan {pot} sudah lewat {percent}% dari target.',

  'insight.potFull.soft.1': 'Celengan {pot} penuh. Kamu yang bikin itu.',
  'insight.potFull.soft.2': '{pot}: selesai. Nikmati sepenuhnya, ya.',
  'insight.potFull.cheeky.1': 'Celengan {pot} penuh! Konfeti, tapi pelan-pelan.',
  'insight.potFull.cheeky.2': '{pot}, terisi sampai penuh.',
  'insight.potFull.roast.1':
    'Celengan {pot} penuh. Aku sudah siapin lelucon; ternyata nggak perlu.',
  'insight.potFull.roast.2': 'Celengan penuh: {pot}. Sekarang pakai untuk tujuannya.',
  'insight.potFull.plain': 'Celengan {pot} sudah mencapai target.',

  'insight.workToClaim.soft.1': {
    other: '{count} pengeluaran kantor ({amount}) bisa diklaim.',
  },
  'insight.workToClaim.soft.2': {
    other: '{amount} untuk kantor, {count} pengeluaran, menunggu diklaim.',
  },
  'insight.workToClaim.cheeky.1': {
    other: 'Kantor berutang {amount} ke kamu. {count} struk banyaknya.',
  },
  'insight.workToClaim.cheeky.2': {
    other: '{count} pengeluaran kantor, {amount}. Ayo tagih.',
  },
  'insight.workToClaim.roast.1': {
    other: '{amount} utang kantor ke kamu. {count} kali. Jangan malu-malu.',
  },
  'insight.workToClaim.roast.2': {
    other: 'Kamu lagi mendanai kantor {amount}. Klaim, dong.',
  },
  'insight.workToClaim.plain': {
    other: '{count} pengeluaran kantor ({amount}) menunggu diklaim.',
  },
};
