---
title: Kebijakan Privasi
description: Apa yang disimpan 6pm di ponsel Anda, sedikit data yang keluar darinya, dan siapa yang menanganinya.
lede: 6pm menyimpan uang Anda di ponsel Anda. Halaman ini menjelaskan dengan tepat apa yang kami lakukan dengan sedikit data yang keluar darinya.
updated: '2026-11-25'
---

Ini adalah terjemahan untuk memudahkan Anda. Jika ada perbedaan, yang berlaku adalah [versi bahasa Inggris](/privacy).

## Ringkasnya

- Pengeluaran, rencana, dan diari Anda tersimpan di iPhone Anda, dalam basis data yang dienkripsi. Kami tidak dapat membacanya.
- 6pm tidak memerlukan akun. Anda hanya masuk, dengan Apple, jika menggunakan Anggaran bersama. Kami tidak pernah meminta nomor telepon, email, atau login bank Anda.
- Kami tidak menayangkan iklan dan tidak menjual data. Aplikasi ini tidak memiliki alat pelacak maupun analitik pihak ketiga. Aplikasi mengirim hitungan anonim tentang langkah yang dicapainya, seperti pembukaan pertama atau tutup hari pertama, dan Anda dapat mematikannya. Situs web ini menghitung kunjungan dengan Cloudflare Web Analytics, yang tidak memasang cookie dan tidak mengidentifikasi Anda.
- Beberapa hal kecil memang keluar dari ponsel Anda: ID perangkat anonim, hitungan anonim langkah yang dicapai aplikasi, status pembelian Anda, pembaruan aplikasi, laporan kerusakan (crash), pertanyaan yang Anda ajukan ke 6pm, suara Anda saat mengucapkan pengeluaran, beberapa fakta tentang hari Anda untuk kalimat teman Anda, foto struk yang tidak dapat dibaca ponsel Anda, kata-kata dan jumlah dalam notifikasi bank yang dibaca 6pm untuk Anda (dengan nomor rekening, kartu, dan telepon disembunyikan), email bank yang Anda teruskan ke alamat struk Anda, celengan bersama yang Anda kelola dengan seseorang di Anggaran bersama, dan, hanya jika Anda menyalakannya, cadangan terenkripsi Anda. Masing-masing dijelaskan di bawah.
- Anda dapat menyimpan seluruh AI 6pm di iPhone Anda saja (Pengaturan → AI). Dengan begitu, pertanyaan Anda, fakta untuk kalimat teman Anda, foto struk, notifikasi bank, dan suara Anda juga tetap di ponsel.

## Siapa kami

6pm dibuat oleh {{OWNER}} ("kami"). Anda dapat menghubungi kami di [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).

Kebijakan ini berlaku untuk aplikasi 6pm untuk iPhone dan Android serta situs web at6pm.app. Jika aplikasi Android bekerja secara berbeda, bagian "Di Android" di bawah menjelaskan caranya.

## Yang tetap di ponsel Anda

Semua yang Anda masukkan, dan semua yang ditangkap aplikasi untuk Anda, tetap di ponsel Anda. Artinya pengeluaran, jumlah, toko, kategori, dan catatan Anda, hari gajian dan rencana Anda, celengan Anda, diari Anda, serta pengaturan, tampilan, dan teman Anda.

Semuanya berada dalam basis data di ponsel Anda, dienkripsi dengan SQLCipher. Kuncinya dibuat di ponsel Anda saat pertama kali membuka 6pm dan disimpan di Rantai Kunci iOS, terikat pada perangkat ini. Kunci itu tidak pernah keluar dari ponsel, dan kami tidak pernah menerima kunci maupun basis datanya. Hanya beberapa fakta yang dijelaskan di bagian “Tanya 6pm dan kalimat teman Anda” yang dikirim, sebanyak yang diperlukan untuk satu kalimat setiap kali.

Karena kuncinya tetap di ponsel ini, data Anda tidak berpindah sendiri ke ponsel baru. Tanpa cadangan, data itu hanya ada di sini.

## Yang keluar dari ponsel Anda

Hanya hal-hal di bawah ini, dan hanya untuk alasan yang disebutkan.

### ID perangkat anonim

Saat aplikasi berkomunikasi dengan server kami, aplikasi terlebih dulu mendapatkan token acak yang mewakili salinan aplikasi Anda. Token itu disimpan di ponsel Anda. Server kami hanya menyimpan bentuk acaknya (hash SHA-256), ditambah bahasa aplikasi Anda serta waktu token itu pertama dan terakhir terlihat.

Tidak satu pun dari data ini terhubung dengan nama, email, atau apa pun tentang uang Anda. Kami menggunakannya untuk memeriksa bahwa permintaan berasal dari salinan aplikasi yang asli, untuk membatasi penyalahgunaan, dan untuk menghitung kira-kira berapa banyak perangkat yang menggunakan 6pm setiap hari.

### Hitungan anonim

Untuk melihat di mana pengguna baru tersendat, aplikasi mengirim ke server kami hitungan anonim tentang langkah yang dicapainya: bahwa aplikasi dibuka untuk pertama kali; langkah orientasi mana yang ditampilkan dan apakah orientasi diselesaikan; pada hari-hari mana di bulan pertamanya aplikasi dibuka; pada hari-hari mana di antaranya sesuatu tertangkap, dan lewat cara apa (notifikasi bank atau dompet digital, otomatisasi Wallet, email, struk yang dibagikan, pindaian, suara Anda, atau ketikan); hari-hari mana yang ditutup, dan berapa hari di minggu pertama yang tertangkap dan ditutup; apakah penawaran 6pm Max ditampilkan dan dari layar mana; apakah Max dibeli dan paket mana; dan, jika Max dibeli dengan kode dari salah satu saluran kami, saluran mana. Setiap laporan juga menyebutkan platform (iPhone atau Android), versi aplikasi, dan bahasa aplikasi, dan tidak ada yang lain.

Hitungan ini tidak memuat ID perangkat, ID instalasi, akun, jumlah, toko, nama bank, catatan, atau kata apa pun yang Anda ketik, dan dikirim tanpa ID perangkat anonim di atas. Server kami hanya menambahkan satu ke total untuk langkah itu pada hari itu; server tidak menyimpan catatan per ponsel, sehingga hitungan dari satu ponsel tidak dapat disatukan kembali. Ponsel Anda mengingat langkah mana yang sudah dikirim, sehingga setiap langkah hanya dikirim sekali. Seperti pada setiap permintaan, server kami menghitung permintaan per alamat IP hanya untuk memperlambat penyalahgunaan, dan tidak menyimpan alamat tersebut.

Anda dapat mematikan hitungan ini di Pengaturan → Privasi → Hitungan anonim. Langkah yang dicapai saat hitungan dimatikan tidak pernah dikirim, bahkan jika Anda menyalakannya kembali. Dalam mode di perangkat, hitungan ini mati.

### Pembelian

Apple, atau Google Play di Android, yang menerima pembayaran. Kami tidak pernah melihat kartu atau detail pembayaran Anda.

Untuk mengetahui apa yang telah Anda buka, 6pm menggunakan RevenueCat, layanan yang mencatat status pembelian. RevenueCat mengetahui dari Apple atau Google tampilan dan paket mana yang telah Anda beli, kapan, dan apakah uji coba atau langganan sedang aktif. RevenueCat mengaitkannya dengan ID pengguna aplikasi yang anonim, bukan dengan nama atau email Anda. Seperti kebanyakan alat pembelian, RevenueCat juga menerima detail teknis dasar dari ponsel Anda: versi aplikasi, model perangkat dan versi sistem, negara dan bahasa, serta alamat IP Anda.

Dengan cara inilah Max dan tampilan Anda tetap terbuka, dan "Pulihkan pembelian" berfungsi.

### Pembaruan aplikasi

Kami mengirim sebagian perbaikan aplikasi lewat udara (over the air), menggunakan layanan pembaruan Expo. Ponsel Anda menanyakan ke Expo apakah ada pembaruan yang menunggu. Permintaan itu memuat versi aplikasi, platform, dan alamat IP Anda. Permintaan itu tidak membawa apa pun tentang uang Anda.

### Laporan kerusakan

Saat aplikasi mengalami kerusakan (crash) atau galat, aplikasi mengirim laporan ke Sentry agar kami dapat memperbaikinya: apa yang salah di kode, layar tempat kejadiannya, versi aplikasi, model iPhone dan versi iOS, serta ID instalasi acak. Laporan tidak pernah memuat pengeluaran, jumlah, catatan, rencana, atau nama Anda, dan kami tidak melampirkan alamat IP Anda. Dalam mode di perangkat, tidak ada laporan kerusakan yang dikirim.

### Tanya 6pm dan kalimat teman Anda, menamai penerima pembayaran, dan membaca foto struk

Saat Anda mengajukan pertanyaan ke 6pm, misalnya "Sabtu keluar Rp800rb, aman nggak?", aplikasi mengirim kata-kata pertanyaan itu ke server kami, bersama nama kategori dan celengan Anda agar pertanyaannya dapat dipahami dengan baik. Server kami bertanya kepada Anthropic, sebuah layanan AI, apa yang ditanyakan. Jawabannya sendiri dihitung di ponsel Anda, dari catatan Anda sendiri, yang tidak pernah dikirim.

Untuk menulis kalimat teman Anda dan kata-kata sebuah jawaban, aplikasi mengirim ke server kami, lalu ke Anthropic, beberapa fakta yang menjadi pokok kalimat itu, yang sudah dihitung di ponsel Anda: misalnya sebuah jumlah, tempat, nama kategori atau celengan, atau perbandingan minggu ini dengan minggu lalu. Aplikasi tidak pernah mengirim daftar pengeluaran, rencana, atau saldo Anda. Tanpa koneksi, aplikasi menggunakan kalimat yang sudah tertulis di dalamnya.

Saat Anda membagikan tangkapan layar struk ke 6pm, teks di dalamnya dibaca di ponsel Anda. Jika aplikasi tidak dapat mengetahui kepada siapa Anda membayar, dan tidak ada aturan Anda sendiri yang mengenali namanya, aplikasi mengirim baris-baris struk itu ke server kami, lalu ke Anthropic, untuk menamai penerima pembayaran. Setiap angka dihapus terlebih dulu, sehingga jumlah, nomor rekening, dan kode referensi tidak pernah dikirim. Jika ada sesuatu yang mengandung digit sampai di server, server menolaknya tanpa membacanya.

Notifikasi bank atau dompet digital yang dibaca 6pm untuk Anda (lihat "Notifikasi bank dan dompet digital" di bawah) dibaca dua kali. Ponsel Anda membacanya lebih dulu, saat itu juga. Saat Anda berikutnya membuka 6pm, teks notifikasi itu dikirim ke server kami, lalu ke Anthropic, untuk dibaca kedua kalinya: apakah uang berpindah dan ke arah mana, jumlah tercetak mana yang dimaksud, siapa yang dibayar, dan kategori Anda mana yang cocok. Yang dikirim adalah nama aplikasi bank atau dompet digital, kata-kata notifikasi, jumlah yang tercetak di dalamnya (termasuk saldonya, jika tercetak), mata uang yang Anda gunakan untuk menghitung, dan nama kategori Anda. Kata-kata itu dapat memuat nama atau pesan transfer. Sebelum apa pun dikirim, ponsel Anda menyembunyikan angka panjang digit demi digit: angka apa pun sepanjang sembilan digit atau lebih, baik ditulis menyatu maupun berkelompok, nomor kartu, dan angka yang mengikuti kata seperti "TK", "account", atau "card". Karena itu nomor rekening, kartu, dan telepon tetap di ponsel Anda, dan server kami menolak teks yang masih memuat angka panjang. Jawabannya tidak pernah memuat jumlah: ponsel Anda menandai setiap jumlah dalam teks, jawabannya menyebut salah satu tanda itu, dan jumlah yang disimpan adalah jumlah yang dibaca ponsel Anda di tempat itu. Notifikasi yang sama sekali tidak dapat dibaca ponsel Anda, tetapi mencetak angka, menunggu di ponsel Anda paling lama dua hari untuk dibaca dengan cara yang sama, lalu dihapus. Begitu pula notifikasi yang sudah dibaca ponsel Anda, jika pembacaan keduanya tidak mendapat jawaban pada percobaan pertama (tidak ada koneksi, atau server kami terlalu lambat): teksnya menunggu di ponsel Anda, paling lama dua hari, sampai server menjawab, lalu dihapus. Notifikasi yang dikenali ponsel Anda sebagai kode sekali pakai, pemberitahuan masuk atau keamanan, pembayaran gagal, promosi, atau pemberitahuan saldo tidak pernah dikirim. Tanpa koneksi, hasil bacaan ponsel sendiri yang disimpan.

Jika ponsel Anda tidak dapat memastikan total atau mata uang sebuah struk yang dibagikan, ponsel mengirim foto struk itu saja ke server kami, lalu ke Anthropic, sebuah layanan AI, untuk membaca total, mata uang, toko, dan waktunya. Server kami tidak menyimpan atau mencatat foto itu, dan foto itu tidak dikirim ke pihak lain. Anthropic tidak menggunakannya untuk melatih modelnya, dan menghapusnya dalam 30 hari (lebih lama hanya jika foto itu ditandai melanggar kebijakan penggunaan Anthropic, atau jika hukum mewajibkannya). Tanpa koneksi, aplikasi menyimpan hasil bacaan ponsel Anda.

Saat Anda membuat kategori, aplikasi dapat mengirim namanya ke server kami, lalu ke Anthropic, untuk menyarankan ikon baginya.

Kami tidak menyimpan pertanyaan, baris struk, teks notifikasi, atau foto struk Anda. Untuk setiap permintaan, server kami hanya menyimpan seberapa banyak layanan AI yang digunakan, terkait dengan ID perangkat anonim Anda. Anthropic tidak menggunakan permintaan untuk melatih modelnya, dan menghapusnya dalam 30 hari (lebih lama hanya jika sebuah permintaan ditandai melanggar kebijakan penggunaan Anthropic, atau jika hukum mewajibkannya).

### Suara Anda

Saat Anda mengucapkan pengeluaran, aplikasi mengalirkan suara dari mikrofon Anda langsung ke layanan ucapan-ke-teks, Deepgram (atau ElevenLabs), hanya selama Anda menahan atau mengetuk mikrofon, dan menerima kembali kata-katanya. Server kami hanya memberi ponsel Anda kunci berumur pendek untuk ini dan mencatat bahwa satu transkripsi terjadi, terkait dengan ID perangkat anonim Anda. Server tidak pernah mendengar suaranya atau melihat kata-katanya. Untuk Deepgram, kami memilih keluar dari program peningkatan modelnya, sehingga suara hanya disimpan selama diubah menjadi teks. Tidak ada yang direkam di ponsel Anda. Tanpa koneksi, dalam mode di perangkat, atau setelah 10 transkripsi sehari tanpa 6pm Max, pengenalan ucapan Apple mengubah kata-kata Anda menjadi teks di ponsel Anda, dan tidak ada yang dikirim.

### Mode di perangkat

Di Pengaturan → AI, Anda dapat menyimpan AI 6pm di iPhone Anda saja. Dengan begitu, tidak ada apa pun dari "Tanya 6pm dan kalimat teman Anda" atau "Suara Anda" yang keluar darinya: pertanyaan dibaca, kalimat ditulis, dan struk dibaca di ponsel Anda, dengan model yang Anda unduh sekali. Model itu diunduh dari Hugging Face, yang melihat alamat IP Anda dan model mana yang Anda minta, dan tidak ada yang lain. Dalam mode ini email struk mati, laporan kerusakan dan hitungan anonim mati, dan Mode perjalanan mengetahui negara Anda dari zona waktu ponsel, bukan dari lokasi Anda.

### Email struk

6pm memberi ponsel Anda alamatnya sendiri, seperti k7m2qx@at6pm.app. Jika Anda meminta bank mengirim email ke alamat itu, atau meneruskan emailnya ke sana, pembayaran akan masuk ke Kotak masuk Anda.

Server kami membaca setiap email saat tiba. Email yang mencantumkan jumlah dikirim ke Anthropic, sebuah layanan AI, untuk membedakan pembayaran dari transfer antar-rekening Anda sendiri, pengembalian dana, atau promosi, dan untuk membaca kepada siapa Anda membayar, untuk apa, dan berapa; email tanpa jumlah dibuang tanpa dibaca. Jika email itu berisi pembayaran, server hanya menyimpan apa yang dibaca: jumlah dan mata uangnya, toko, kategori, waktu, alamat pengirim, dan catatan transfer. Server menguncinya dengan enkripsi sampai ponsel Anda mengambilnya, lalu menghapusnya. Email itu sendiri tidak pernah disimpan atau dicatat oleh 6pm dan tidak dikirim ke siapa pun selain Anthropic, yang tidak menggunakannya untuk melatih modelnya dan menghapusnya dalam 30 hari (lebih lama hanya jika email itu ditandai melanggar kebijakan penggunaan Anthropic, atau jika hukum mewajibkannya). Apa pun yang bukan struk dibuang. Struk yang belum diambil ponsel Anda setelah 30 hari dihapus tanpa dibaca.

Alamat itu terhubung dengan ID perangkat anonim Anda, bukan dengan nama Anda. Email dari siapa pun ke alamat itu dibaca dengan cara yang sama, jadi bagikan alamat itu hanya kepada bank Anda.

### Kurs (Mode perjalanan)

Dalam Mode perjalanan, aplikasi mengambil kurs hari itu dari server kami. Server kami mendapatkannya dari Frankfurter, layanan gratis yang menerbitkan kurs bank sentral. Permintaan itu tidak membawa apa pun tentang Anda atau uang Anda.

### Cadangan terenkripsi (6pm Max)

Cadangan adalah fitur 6pm Max, dan fitur ini mati sampai Anda menyalakannya. Cadangan dienkripsi ujung ke ujung: kuncinya tetap di Rantai Kunci iCloud Anda, dan server kami hanya menyimpan ciphertext di bawah token anonim. Ciphertext adalah data teracak yang tidak dapat kami baca.

Apple menyinkronkan kunci itu antarperangkat Anda melalui Rantai Kunci iCloud, di bawah Apple ID Anda dan ketentuan Apple. Jika Anda kehilangan kunci sekaligus ponsel Anda, tidak ada seorang pun, termasuk kami, yang dapat membuka cadangan itu.

### Anggaran bersama

Anggaran bersama memungkinkan dua orang mengelola celengan bersama yang sama-sama mereka isi. Ini satu-satunya bagian 6pm yang memakai proses masuk, dan tidak ada yang terjadi kecuali Anda memulainya atau membuka undangan.

- **Masuk dengan Apple.** Saat Anda memulai atau bergabung, Anda masuk dengan Apple. Apple memberi kami ID tetap untuk Anda yang hanya berlaku untuk 6pm dan, pada kali pertama, nama depan Anda jika Anda memilih membagikannya. Kami tidak pernah meminta email Anda. Server kami menghubungkan ID itu dengan ID perangkat anonim Anda. Saat Anda menghapus akun, server kami juga meminta Apple mengakhiri akses 6pm, sehingga 6pm keluar dari daftar "Masuk dengan Apple" di pengaturan Apple ID Anda.
- **Apa yang dibagikan.** Server kami menyimpan nama depan Anda, nama, ikon, warna, target, dan bulan setiap celengan bersama, serta setiap jumlah yang menurut Anda masing-masing telah dimasukkan, beserta siapa yang menambahkannya dan kapan. Pasangan Anda melihat semua ini, dan Anda melihat miliknya. Tidak ada hal lain dari ponsel Anda yang dibagikan: tidak pengeluaran, rencana, angka harian, maupun celengan pribadi Anda.
- **Undangan.** Tautan undangan hanya berlaku sekali dan selama 7 hari. Server kami hanya menyimpan bentuk acaknya.
- **Keluar.** Anda berdua dapat keluar kapan saja. Keluar mengakhiri Anggaran bersama bagi Anda berdua dan menghapus celengan bersama beserta seluruh isinya dari server kami. Setiap ponsel menyimpan, sebagai riwayat, jumlah yang dimasukkan oleh pemiliknya sendiri.
- **Menghapus akun Anda.** "Hapus akun Anggaran bersama" di aplikasi menghapus proses masuk Anda, nama Anda, dan semua yang Anda bagikan dari server kami, dan juga mengakhirinya bagi pasangan Anda. Menghentikan penggunaan Apple ID Anda oleh 6pm di pengaturan Apple ID Anda memiliki efek yang sama.

6pm tidak pernah memindahkan uang. Jumlah di celengan bersama adalah apa yang menurut Anda masing-masing telah disisihkan; jumlah itu hanya menghitung.

### Daftar peluncuran (situs web)

Jika Anda bergabung dengan daftar peluncuran di situs web ini, kami menyimpan alamat email Anda, bahasa halaman, waktu Anda bergabung, dan urutan Anda dalam antrean. Jika Anda menggunakan kalkulator kebocoran sebelum bergabung, kami juga menyimpan angka bulanan yang ditampilkannya. Kalkulator itu sendiri berjalan di peramban Anda, dan tidak ada yang dikirim kecuali Anda bergabung.

Kami menggunakan data ini hanya untuk memberi tahu Anda saat 6pm 2.0 dirilis. Data ini disimpan sampai Anda meminta kami menghapusnya.

### Mengunjungi situs web

Situs web ini tidak memasang cookie. Situs ini menghitung kunjungan dengan Cloudflare Web Analytics, yang hanya memberi kami total, seperti tayangan halaman, halaman atau tautan asal Anda, negara Anda, dan jenis perangkat Anda. Layanan itu tidak menggunakan cookie atau penyimpanan lokal dan tidak mengikuti Anda di berbagai situs atau mengidentifikasi Anda. Fontnya disajikan dari situs ini sendiri. Situs ini berjalan di Cloudflare, yang menangani setiap permintaan dan dapat menyimpan log teknis biasa, seperti alamat IP dan jenis peramban Anda, untuk menjalankan dan melindungi layanan. Untuk memperlambat penyalahgunaan, server kami menghitung permintaan per alamat IP. Alamat itu hanya menjadi kunci penghitung. Kami tidak menyimpannya.

## Yang digunakan aplikasi di ponsel Anda

- **Kamera.** Pindai menggunakan kamera untuk membaca kode QR, seperti VietQR. Gambarnya tidak pernah disimpan atau dikirim. Hanya detail pembayaran dalam kode itu yang digunakan, di ponsel Anda. Jika Anda menolak akses kamera, semua fitur lain tetap berfungsi.
- **Mikrofon dan ucapan.** Saat Anda mengucapkan pengeluaran, suaranya dikirim ke layanan ucapan-ke-teks seperti dijelaskan di "Suara Anda", atau diubah menjadi teks di ponsel Anda oleh pengenalan ucapan di perangkat milik Apple. Rekamannya tidak pernah disimpan.
- **Foto.** 6pm menyimpan gambar yang Anda pilih untuk dibagikan, seperti kartu hari Anda, ke perpustakaan foto Anda. 6pm tidak pernah membaca perpustakaan Anda. Tangkapan layar struk yang Anda bagikan ke 6pm dibaca di ponsel Anda, lalu dilepas; hanya struk yang tidak dapat dibaca ponsel Anda yang dikirim untuk dibaca, seperti dijelaskan di atas.
- **Lokasi.** Hanya setelah Anda menyalakan Mode perjalanan, dan hanya selama aplikasi terbuka, 6pm memeriksa di negara mana Anda berada, agar dapat mengganti mata uang. Sistem ponsel Anda sendiri yang mengubah posisi menjadi nama negara dan kota. 6pm menyimpan nama negara dan kota itu di ponsel Anda, dan tidak mengirim apa pun tentang keberadaan Anda kepada kami. Dalam mode di perangkat, 6pm sama sekali tidak menggunakan lokasi Anda: negara Anda diambil dari zona waktu ponsel.
- **Widget, Aktivitas Langsung, dan Siri.** Widget, Aktivitas Langsung, pintasan, dan kontrol Anda membaca dan menulis melalui folder bersama di ponsel Anda. Tidak ada isinya yang melewati server kami.
- **Papan klip.** Saat Anda menyerahkan pembayaran ke aplikasi bank Anda, 6pm menyalin jumlahnya agar Anda dapat menempelkannya. 6pm menulis ke papan klip. 6pm tidak pernah membaca isinya.
- **Aplikasi bank.** Aplikasi memeriksa di ponsel Anda apakah aplikasi bank tertentu terpasang, dan membuka aplikasi yang Anda pilih, atau halamannya di App Store. Kami tidak mengirim apa pun ke bank. Kebijakan bank Anda sendiri berlaku begitu Anda berada di aplikasinya.
- **Notifikasi bank dan dompet digital.** Hanya jika Anda mengaturnya, 6pm membaca notifikasi yang dikirim aplikasi bank dan dompet digital Anda saat uang berpindah, untuk mencatat pembayaran bagi Anda. Di iPhone, otomatisasi Pintasan yang Anda buat menyerahkan setiap notifikasi dari aplikasi yang Anda pilih kepada 6pm. Di Android, 6pm hanya membacanya setelah Anda menyalakannya di Akses notifikasi, dan hanya dari aplikasi bank dan dompet digital yang dikenal 6pm; notifikasi dari aplikasi lain dilepas tanpa dibaca. Bagaimanapun caranya, setiap notifikasi dibaca di ponsel Anda. Uang yang berpindah disimpan di Kotak masuk Anda, di ponsel Anda; kode, pembayaran gagal, promosi, dan pemberitahuan saldo dilewati dan tidak disimpan di mana pun. Notifikasi yang tidak dapat dibaca ponsel tetapi mencetak angka menunggu di ponsel Anda, paling lama dua hari, untuk pembacaan kedua yang dijelaskan berikut ini. Begitu pula notifikasi yang sudah dibaca ponsel, jika pembacaan kedua itu tidak mendapat jawaban pada percobaan pertama. Kecuali AI 6pm disimpan di ponsel Anda saja, notifikasi tentang uang kemudian dibaca kedua kalinya oleh server kami: kata-kata dan jumlahnya dikirim, dengan nomor rekening, kartu, dan telepon disembunyikan terlebih dulu, seperti dijelaskan di "Tanya 6pm dan kalimat teman Anda, menamai penerima pembayaran, dan membaca foto struk". Tidak ada hal lain dari notifikasi yang dikirim kepada kami atau siapa pun, dan jika AI 6pm disimpan di ponsel Anda saja, tidak ada yang dikirim sama sekali. Di Android, 6pm kemudian menampilkan notifikasi senyap miliknya sendiri yang menyebutkan apa yang ditangkapnya. Anda dapat mematikannya kapan saja: di iPhone dengan menghapus otomatisasinya, di Android di Akses notifikasi.
- **Notifikasi.** Pengingat harian pada jam tutup hari Anda diatur di ponsel Anda. Tidak ada push jarak jauh, dan tidak ada token notifikasi yang dikirim kepada kami.

## Di Android

Aplikasi Android bekerja seperti dijelaskan di atas, dengan perbedaan berikut:

- **Kunci data Anda** dikunci oleh Android Keystore di ponsel Anda, bukan oleh Rantai Kunci iOS. Cadangan cloud aplikasi bawaan Android dimatikan untuk 6pm, sehingga data Anda tidak pernah disalin ke akun Google Anda.
- **Cadangan** menyimpan kuncinya di ponsel Anda, bukan di Rantai Kunci iCloud, sehingga cadangan hanya dapat dibuka di ponsel yang membuatnya.
- **Pembelian** melalui Google Play. Google yang menerima pembayaran, dan RevenueCat mengetahui status pembelian Anda dari Google.
- **Mode di perangkat** tidak tersedia: 6pm tidak memiliki model yang dapat dijalankan di ponsel Android.
- **Ucapan di ponsel Anda**, saat layanan ucapan-ke-teks tidak digunakan (offline, atau setelah 10 kali sehari tanpa 6pm Max), memakai pengenalan ucapan di perangkat milik Android, dan hanya untuk bahasa yang sudah diunduh ke ponsel Anda, sehingga suaranya tidak pernah keluar dari ponsel.
- **Foto.** Pindai memilih gambar melalui pemilih foto bawaan Android, yang hanya memberikan gambar yang Anda pilih kepada 6pm. 6pm tidak pernah membaca galeri Anda.
- **Anggaran bersama**, widget, Aktivitas Langsung, dan Siri tidak ada di aplikasi Android.

## Yang tidak kami lakukan

- Kami tidak menayangkan iklan.
- Kami tidak menjual data Anda atau membagikannya untuk pemasaran.
- Kami tidak membuat profil Anda.
- Versi aplikasi ini tidak memiliki alat analitik, iklan, atau pelacakan pihak ketiga.

Jika Anda memilih membagikan analitik kepada pengembang aplikasi di Pengaturan iOS, Apple dapat memberi kami data kerusakan dan penggunaan yang anonim. Kami tidak dapat mengetahui dari siapa data itu berasal.

## Siapa yang menangani data untuk kami

Perusahaan-perusahaan ini menjalankan bagian layanan yang dijelaskan di atas. Mereka dapat menangani data Anda di negara lain, termasuk Amerika Serikat dan Tiongkok.

- **Apple** memproses pembayaran, Rantai Kunci iCloud, dan Masuk dengan Apple. [Kebijakan privasi Apple](https://www.apple.com/legal/privacy/).
- **Google** memproses pembayaran melalui Google Play di Android. [Kebijakan privasi Google](https://policies.google.com/privacy).
- **RevenueCat** mencatat status pembelian. [Kebijakan privasi RevenueCat](https://www.revenuecat.com/privacy).
- **Cloudflare** menghosting situs web dan server kami, serta menghitung kunjungan ke situs web. [Kebijakan privasi Cloudflare](https://www.cloudflare.com/privacypolicy/).
- **Sentry** menerima laporan kerusakan. [Kebijakan privasi Sentry](https://sentry.io/privacy/).
- **Anthropic** membaca pertanyaan yang Anda ajukan, menulis kalimat teman Anda dari fakta tentang hari Anda yang dijelaskan di atas, menyarankan ikon untuk kategori Anda dari namanya, menamai penerima pembayaran dari baris struk tanpa angka, membaca untuk kedua kalinya notifikasi bank dan dompet digital yang dijelaskan di atas, membaca foto struk yang tidak dapat dibaca ponsel Anda, dan membaca email bank dan toko yang Anda teruskan ke alamat struk Anda. [Kebijakan privasi Anthropic](https://www.anthropic.com/legal/privacy).
- **Deepgram** mengubah suara Anda menjadi teks saat Anda mengucapkan pengeluaran. [Kebijakan privasi Deepgram](https://deepgram.com/privacy).
- **ElevenLabs** dapat melakukan hal yang sama sebagai pengganti Deepgram. [Kebijakan privasi ElevenLabs](https://elevenlabs.io/privacy-policy).
- **Hugging Face** menghosting model yang dapat Anda unduh untuk mode di perangkat. [Kebijakan privasi Hugging Face](https://huggingface.co/privacy).
- **Expo** mengirimkan pembaruan aplikasi lewat udara. [Kebijakan privasi Expo](https://expo.dev/privacy).

Kami menggunakan mereka hanya untuk tujuan-tujuan ini.

## Berapa lama kami menyimpan data

- **Di ponsel Anda.** Sampai Anda menghapusnya. "Hapus semua data" di Pengaturan menghapus pengeluaran, rencana, dan diari Anda dari ponsel dan mematikan pengingat. Menghapus aplikasi juga menghapus datanya.
- **ID perangkat.** Selama aplikasi digunakan di perangkat itu.
- **Hitungan anonim.** Disimpan sebagai total harian. Hitungan ini tidak memuat apa pun yang mengarah ke sebuah ponsel atau seseorang.
- **Laporan kerusakan.** Hingga 90 hari, lalu dihapus.
- **Email struk.** Sampai ponsel Anda mengambil struknya, dan tidak pernah lebih dari 30 hari. Alamat struk Anda berlaku selama ID perangkat Anda.
- **Pertanyaan, fakta untuk kalimat, baris struk, dan email yang diteruskan.** Kami tidak menyimpannya. Anthropic menghapusnya dalam 30 hari, seperti dijelaskan di atas.
- **Foto struk.** Kami tidak menyimpannya. Anthropic menghapusnya dalam 30 hari, seperti dijelaskan di atas.
- **Suara Anda.** Kami tidak menyimpannya. Deepgram hanya menanganinya selama Anda berbicara; ElevenLabs menyimpannya sesuai kebijakannya sendiri.
- **Cadangan.** Sampai Anda menghapusnya. Saat Anda menghapusnya, kami menghapus data terenkripsi itu dari server kami.
- **Anggaran bersama.** Celengan bersama sampai salah satu dari Anda keluar; proses masuk dan nama Anda sampai Anda menghapus akun Anggaran bersama. Keduanya langsung menghapus data dari server kami.
- **Daftar peluncuran.** Sampai Anda meminta kami menghapus email Anda.
- **Catatan pembelian.** Apple, Google, dan RevenueCat menyimpannya sesuai kebijakan mereka sendiri dan hukum.

## Pilihan dan hak Anda

Anda mengendalikan data di ponsel Anda: Anda dapat mengubah atau menghapus data apa pun di aplikasi.

Untuk apa pun yang kami simpan tentang Anda, Anda dapat meminta kami memberi tahu apa itu, memperbaikinya, menghapusnya, atau berhenti menggunakannya. Hubungi kami di [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}). Kami akan menjawab segera, dan dalam jangka waktu yang diberikan hukum kepada kami. Server kami menyimpan sangat sedikit data yang mengarah ke seseorang, sehingga kami mungkin meminta sesuatu yang membantu kami menemukannya, seperti email yang Anda gunakan untuk daftar peluncuran.

Anda juga dapat mengajukan keluhan kepada otoritas pelindungan data di tempat tinggal Anda.

## Anak-anak

6pm tidak dibuat untuk anak di bawah 16 tahun, dan kami tidak dengan sengaja mengumpulkan data mereka. Jika Anda mengira seorang anak telah mengirimi kami sesuatu, hubungi kami dan kami akan menghapusnya.

## Keamanan

Data Anda dienkripsi di ponsel Anda. Lalu lintas ke server kami menggunakan HTTPS. Cadangan dienkripsi sebelum keluar dari ponsel Anda, dan struk dari email Anda disimpan dalam keadaan terenkripsi sampai ponsel Anda mengambilnya. Server kami hanya menyimpan token perangkat dalam bentuk hash. Tidak ada sistem yang benar-benar aman, jadi jika Anda menemukan masalah, mohon beri tahu kami.

## Perubahan kebijakan ini

Saat kami mengubah kebijakan ini, kami akan memperbarui tanggal di bagian atas. Jika perubahannya penting, kami akan memberi tahu Anda di aplikasi atau di halaman ini sebelum perubahan itu berlaku.

## Hukum dan cara menghubungi kami

Kami menangani data pribadi berdasarkan hukum Vietnam, termasuk Undang-Undang Pelindungan Data Pribadi. Jika Anda tinggal di tempat lain, hak yang diberikan negara Anda sendiri tetap berlaku.

Ada pertanyaan? Telepon atau kirim pesan kepada {{OWNER}} di [{{CONTACT_PHONE}}](tel:{{CONTACT_TEL}}).
