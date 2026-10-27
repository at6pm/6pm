import type { Entry } from '../catalogue-types';
import type { enDuo } from '../en-duo';

// The phone folds ("dilipat") to close the day; the counter is the shop's "kasir".
export const idDuo: { readonly [Key in keyof typeof enDuo]: Entry } = {
  'duo.month.steady': 'Sesuai laju. Santai saja.',
  'duo.month.fast': 'Sedikit lebih cepat dari harinya.',
  'duo.month.paceLine': '{used}% uang {month} terpakai, {gone}% bulan sudah lewat.',
  'duo.month.daily': 'Angka harian',
  'duo.day.ofLine': 'dari {line} hari itu',
  'duo.day.previous': 'Hari sebelumnya',
  'duo.day.next': 'Hari berikutnya',
  'duo.ask.title': 'Kalau kamu pakai {amount}',
  'duo.ask.from': 'pratinjau dari Tanya',
  'duo.ask.spent': '{spent} terpakai · ~{amount} lagi',
  'duo.ask.left': 'sisa {left}',
  'duo.close.kept': 'Disimpan hari ini',
  'duo.close.ofLine': 'dari {line} hari ini · {left} masih milikmu',
  'duo.close.foldLater': 'Putuskan satu per satu, lalu lipat ponselnya untuk tutup hari.',
  'duo.close.foldNow': 'Lipat ponselnya untuk tutup hari.',
  'duo.market.title': 'Di kasir',
  'duo.market.left': 'Sisa hari ini',
  'duo.market.add': 'Tambah',
  'duo.market.leave': 'Tinggalkan kasir',
  'duo.scan.camera': 'Kamera dalam',
  'duo.scan.looking': 'Mencari kode QR',
  'duo.scan.stand': 'Berdirikan aku di meja kasir dan arahkan QR mereka ke bagian atas.',
  'duo.scan.to': 'ke {payee}',
  'duo.scan.paid': 'Dibayar',
  'duo.drop.title': 'Taruh baris transaksi bank di sini',
  'duo.drop.sub': '6pm membaca nama toko dan jumlahnya, lalu memasukkannya ke kategori yang tepat.',
  'duo.drop.caught': '{merchant} · {amount} tertangkap. Menunggu tutup hari.',
  'duo.drop.unread': 'Tidak ada jumlah di baris itu.',
};
