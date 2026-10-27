import type { Entry } from '../catalogue-types';
import type { enAskChat } from '../en-ask-chat';

// Small talk in the companion's voice; the serious lines (distress, investing, unsafe) are plain and
// keep their numbers exactly.
export const idAskChat: { readonly [Key in keyof typeof enAskChat]: Entry } = {
  'ask.chat.greeting.soft': 'Hai! Aku di sini kapan pun kamu mau cek soal uangmu.',
  'ask.chat.greeting.cheeky': 'Halo halo. Tanya apa saja soal uang, angkamu ada di aku.',
  'ask.chat.greeting.roast': 'Oh, kamu. Mau tanya separah apa?',
  'ask.chat.greeting.plain': 'Halo. Tanyakan soal pengeluaran, tagihan, atau celenganmu.',
  'ask.chat.thanks.soft': 'Sama-sama. Jaga dirimu hari ini, ya.',
  'ask.chat.thanks.cheeky': 'Sama-sama! Bayarnya pakai tutup hari tepat waktu saja.',
  'ask.chat.thanks.roast': 'Jangan makasih ke aku. Makasih ke anggaran yang hampir kamu patuhi.',
  'ask.chat.thanks.plain': 'Sama-sama.',
  'ask.chat.offTopic.soft': 'Yang itu di luar bidangku. Tapi soal uang? Aku siap sepenuhnya.',
  'ask.chat.offTopic.cheeky': 'Bukan bagianku. Tanya saja ke mana uangmu pergi 👀',
  'ask.chat.offTopic.roast': 'Aku ini anggaran, bukan mesin pencari. Tanya soal pengeluaranmu.',
  'ask.chat.offTopic.plain': 'Aku hanya bisa membantu soal uangmu di 6pm.',
  'ask.chat.identity':
    'Aku temanmu di 6pm. Setiap angka yang kuberikan dihitung di ponselmu, dari pengeluaranmu sendiri. Aku program, bukan manusia.',
  'ask.chat.privacy':
    'Aku tidak bisa melihat rekening bankmu. Aku hanya tahu yang ada di 6pm, dan itu tetap di ponselmu. Untuk membaca pertanyaan, server kami melihat pertanyaannya serta nama kategori dan celenganmu; untuk menyusun satu kalimat, hanya beberapa fakta di dalamnya.',
  'ask.chat.venting.soft': 'Kedengarannya berat. Kamu nggak menanggungnya sendirian.',
  'ask.chat.venting.cheeky': 'Lagi berat, ya. Tarik napas: ini cuma angka, bukan vonis.',
  'ask.chat.venting.plain': 'Stres soal uang itu nyata.',
  'ask.chat.goingRight': 'Satu hal yang berjalan baik:',
  'ask.chat.freshStart': 'Besok mulai dengan batas yang baru.',
  'ask.chat.roast.soft': 'Yang lembut saja, ya:',
  'ask.chat.roast.cheeky': 'Oke, kamu yang minta.',
  'ask.chat.roast.roast': 'Siap-siap.',
  'ask.chat.roast.plain': 'Yang paling menonjol:',
  'ask.chat.roastNothing.soft': 'Nggak ada yang bisa diledek. Kamu lagi bagus.',
  'ask.chat.roastNothing.cheeky': 'Sudah kucek. Jujur? Nggak ada yang bisa di-roast. Nyebelin.',
  'ask.chat.roastNothing.roast': 'Aku mau nge-roast kamu. Kamu nggak kasih bahan. Tega.',
  'ask.chat.roastNothing.plain': 'Saat ini tidak ada yang menonjol.',
  'ask.chat.hype.soft': 'Kamu pantas dengar ini:',
  'ask.chat.hype.cheeky': 'Mode hype aktif:',
  'ask.chat.hype.roast': 'Baiklah. Harus diakui:',
  'ask.chat.hype.plain': 'Yang berjalan baik:',
  'ask.chat.hypeNothing.soft': 'Kamu datang dan mengecek. Itu sudah berarti.',
  'ask.chat.hypeNothing.cheeky': 'Kamu buka app anggaran dengan sengaja. Legenda.',
  'ask.chat.hypeNothing.roast':
    'Kamu ada di sini, itu lebih dari kebanyakan orang. Lumayan bangga.',
  'ask.chat.hypeNothing.plain': 'Teruskan. Lama-lama terkumpul.',
  'ask.chat.distress':
    'Aku sungguh ikut sedih kamu merasa begini. Kamu tidak harus menanggungnya sendirian: bicaralah dengan orang yang kamu percaya, atau hubungi layanan Ngày Mai di 096 306 1414 (13.00 sampai 20.30, Rabu sampai Minggu). Kalau kamu dalam bahaya sekarang, hubungi 115.',
  'ask.chat.investing':
    'Aku tidak bisa bilang harus investasi di mana atau kapan; itu butuh penasihat berlisensi. Aku bisa menunjukkan berapa sisa uangmu tiap bulan, atau seberapa cepat celengan terisi.',
  'ask.chat.unsafe':
    'Yang itu tidak bisa kubantu. Kalau uang lagi seret, aku bisa menunjukkan sisa sampai gajian atau apa yang bisa ditutup celenganmu. Kalau pemberi pinjaman ilegal mengancammu, hubungi polisi di 113.',
};
