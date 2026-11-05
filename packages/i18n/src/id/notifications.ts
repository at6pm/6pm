import type { Entry } from '../catalogue-types';
import type { enNotifications } from '../en-notifications';

export const idNotifications: { readonly [Key in keyof typeof enNotifications]: Entry } = {
  'notify.channel.payday': 'Hari gajian',
  'notify.channel.capture': 'Tangkap pengeluaran',
  'notify.channel.reminders': 'Pengingat yang kamu atur',

  'notify.close.leadSix': 'Sudah jam enam.',
  'notify.close.leadAt': 'Sudah jam {time}.',

  'notify.close.jarReady.soft': '{lead} Celengan {jar}-mu sudah siap.',
  'notify.close.jarReady.cheeky': '{lead} Celengan {jar}-mu sudah siap. Yuk, intip.',
  'notify.close.jarReady.roast': '{lead} Celengan {jar}-mu sudah siap. Siapa sangka kamu bisa.',
  'notify.close.jarReady.plain': '{lead} Celengan {jar} sudah siap.',

  'notify.close.countdown.soft': { other: '{lead} {count} hari lagi {festival}.' },
  'notify.close.countdown.cheeky': {
    other: '{lead} {count} hari lagi {festival}. Lampion mulai dipasang.',
  },
  'notify.close.countdown.roast': {
    other: '{lead} {count} hari lagi {festival}. Pegang erat dompetmu.',
  },
  'notify.close.countdown.plain': { other: '{lead} {count} hari lagi {festival}.' },
  'notify.close.countdownJar.soft': {
    other: '{lead} {count} hari lagi {festival}. Celengan {festival}-mu berisi {amount}.',
  },
  'notify.close.countdownJar.cheeky': {
    other: '{lead} {count} hari lagi {festival}. Celenganmu sudah menyimpan {amount}.',
  },
  'notify.close.countdownJar.roast': {
    other: '{lead} {count} hari lagi {festival}. {amount} di celengan. Jaga baik-baik.',
  },
  'notify.close.countdownJar.plain': {
    other: '{lead} {count} hari lagi {festival}. Celengan {festival} berisi {amount}.',
  },

  'notify.close.pay.soft': '{lead} Gajimu menunggu ditempatkan.',
  'notify.close.pay.cheeky': '{lead} Gaji sudah masuk. Yuk, kasih dia tugas.',
  'notify.close.pay.roast': '{lead} Gaji sudah mendarat. Tempatkan sebelum kabur ke mana-mana.',
  'notify.close.pay.plain': '{lead} Gajimu menunggu untuk dibagi.',

  'notify.close.bonus.soft': '{lead} Bonus {festival}-mu menunggu ditempatkan.',
  'notify.close.bonus.cheeky': '{lead} Bonus {festival}-mu sudah masuk. Yuk, bagi.',
  'notify.close.bonus.roast':
    '{lead} Bonus {festival} sudah mendarat. Tempatkan sebelum toko-toko menemukannya.',
  'notify.close.bonus.plain': '{lead} Bonus {festival}-mu menunggu untuk dibagi.',

  'notify.close.payback.soft': '{lead} {name} sudah bayar utangnya.',
  'notify.close.payback.cheeky': '{lead} {name} sudah bayar utangnya. Pertemanan aman.',
  'notify.close.payback.roast': '{lead} {name} beneran bayar utangnya.',
  'notify.close.payback.plain': '{lead} {name} sudah melunasi utangnya.',

  'notify.close.moneyIn.soft': '{lead} Ada uang masuk. Menunggu tutup hari.',
  'notify.close.moneyIn.cheeky': '{lead} Ada uang masuk. Yuk, kasih tahu mau ke mana.',
  'notify.close.moneyIn.roast': '{lead} Ada uang masuk. Jangan biarkan dia punya ide aneh.',
  'notify.close.moneyIn.plain': '{lead} Ada uang masuk. Tempatkan saat tutup hari.',

  'notify.close.yearCard.soft': '{lead} Tahun {year}-mu siap dikenang.',
  'notify.close.yearCard.cheeky': '{lead} Tahun {year}-mu sudah siap. Mau lihat?',
  'notify.close.yearCard.roast': '{lead} Seluruh tahun {year}-mu. Berani lihat?',
  'notify.close.yearCard.plain': '{lead} Kilas balik {year} sudah siap.',

  'notify.payday.amounts.soft': 'Hari gajian. {jars} ke celenganmu, {daily} sehari sampai {date}.',
  'notify.payday.amounts.cheeky': 'Gajian! {jars} ke celenganmu, {daily} sehari sampai {date}.',
  'notify.payday.amounts.roast':
    'Hari gajian. {jars} tersimpan sebelum sempat berkedip, {daily} sehari sampai {date}.',
  'notify.payday.amounts.plain': 'Hari gajian. {jars} ke celengan, {daily} sehari sampai {date}.',
  'notify.payday.noJars': 'Hari gajian. {daily} sehari sampai {date}.',
  'notify.payday.hidden': 'Hari gajian. Celenganmu sudah terisi.',
  'notify.payday.hiddenNoJars': 'Hari gajian. Bulan baru dimulai.',

  'notify.firstCatch.amounts.soft': 'Yang pertama tertangkap: {amount} · {name}. Semudah itu.',
  'notify.firstCatch.amounts.cheeky': 'Yang pertama tertangkap: {amount} · {name}. Gampang, kan?',
  'notify.firstCatch.amounts.roast':
    'Yang pertama tertangkap: {amount} · {name}. Nggak sakit, kan?',
  'notify.firstCatch.amounts.plain': 'Tangkapan pertama: {amount} · {name}.',
  'notify.firstCatch.hidden': 'Yang pertama dari {name} tertangkap. Semudah itu.',
  'notify.firstCatch.noName': 'Yang pertama tertangkap. Semudah itu.',

  'notify.quiet.soft':
    'Tidak ada kabar dari {way} selama {count} hari. Otomatisasinya masih aktif?',
  'notify.quiet.cheeky':
    'Tidak ada kabar dari {way} selama {count} hari. Lagi hemat, atau otomatisasinya mati?',
  'notify.quiet.roast':
    'Tidak ada kabar dari {way} selama {count} hari. Kamu super hemat, atau otomatisasinya mati.',
  'notify.quiet.plain':
    'Tidak ada kabar dari {way} selama {count} hari. Periksa apakah otomatisasi masih aktif.',
  'notify.quiet.yourAlerts': 'notifikasi bankmu',

  'notify.owed.one.soft': '{name} masih berutang {amount} padamu. Tagih saat kamu sempat.',
  'notify.owed.one.cheeky': '{name} masih berutang {amount} padamu. Saatnya colek pelan?',
  'notify.owed.one.roast': '{name} masih berutang {amount} padamu. Uangmu kangen kamu.',
  'notify.owed.one.plain': '{name} masih berutang {amount} padamu.',
  'notify.owed.oneHidden': '{name} masih berutang padamu. Tagih saat kamu sempat.',
  'notify.owed.noName': 'Masih ada utang {amount} ke kamu.',
  'notify.owed.noNameHidden': 'Ada yang masih berutang padamu. Tagih saat kamu sempat.',
  'notify.owed.many': '{count} orang masih berutang {amount} padamu.',
  'notify.owed.manyHidden': '{count} orang masih berutang padamu.',

  'settings.notifications': 'Notifikasi',
  'settings.notificationsOn': 'Nyala',
  'notify.settings.title': 'Notifikasi',
  'notify.settings.phone': 'Di ponsel ini',
  'notify.settings.allowed': 'Diizinkan',
  'notify.settings.turnOn': 'Nyalakan',
  'notify.settings.offInSettings': 'Mati di Pengaturan',
  'notify.settings.offSub': 'Tidak ada yang sampai sebelum dinyalakan.',
  'notify.settings.kinds': 'Yang dikirim 6pm',
  'notify.kind.close': 'Pengingat tutup hari',
  'notify.kind.close.sub': 'Setiap hari pukul {time}, dengan kabar hari itu',
  'notify.kind.payday': 'Hari gajian',
  'notify.kind.payday.sub': 'Pagi saat gajimu masuk, pukul 08:30',
  'notify.kind.capture': 'Tangkap pengeluaran',
  'notify.kind.capture.sub': 'Tangkapan pertamamu, dan jalur yang mendadak sepi',
  'notify.kind.reminders': 'Pengingat yang kamu atur',
  'notify.kind.reminders.sub': 'Siapa yang berutang, di hari pilihanmu',
  'notify.settings.lockScreen': 'Layar kunci',
  'notify.settings.amounts': 'Tampilkan jumlah di layar kunci',
  'notify.settings.amounts.sub': 'Jika mati, teksnya tanpa angka',
  'notify.settings.note':
    'Sekali sehari itu ritualnya: pengingat tutup hari membawa kabar hari itu. Paling banyak satu lagi per hari, dan antara 22:00 dan 08:00 hanya pengingat tutup harimu.',

  'owed.remind.button': 'Ingatkan aku',
  'owed.remind.threeDays': 'Dalam 3 hari',
  'owed.remind.week': 'Dalam seminggu',
  'owed.remind.payday': 'Saat gajian',
  'owed.remind.set': 'Diingatkan: {date}',
  'owed.remind.cancel': 'Jangan ingatkan',
  'owed.remind.toast': 'Aku ingatkan kamu: {date}, 10:00.',
  'owed.remind.off': 'Pengingat yang kamu atur mati di Pengaturan.',
};
