# Changelog — TosmFi

Semua perubahan penting dicatat di sini. Rilis terbaru di atas.

- **Baru**: fitur / layar / kemampuan yang sebelumnya tidak ada.
- **Ditingkatkan**: sesuatu yang sudah ada dibuat lebih baik (tampilan, performa, alur).
- **Perbaikan**: bug yang diperbaiki.

Kategori tanpa isi boleh dihilangkan.

---

## Belum dirilis

### Baru

- Tampilan Mist: font Inter & Outfit, bottom nav mengambang di semua halaman, dan menu
  Lainnya berupa sheet (profil, menu, tema, bahasa). Tombol keluar ada di halaman Profil.
- Tema terang/gelap: ikuti sistem atau pilih sendiri dari sheet Lainnya dan layar masuk.
- Masuk & Daftar: tampilan baru dengan pesan error/info yang jelas, plus pilihan bahasa
  (Indonesia, English, 日本語) langsung dari layar masuk.
- Keluar akun kini meminta konfirmasi.
- Dashboard: kekayaan bersih (bisa disembunyikan), budget yang di-pin, ringkasan bulan ini,
  kesehatan finansial, pengeluaran per kategori, dompet, dan transaksi bulan ini.
- Transaksi: tab bulan, ringkasan, kalender bertitik, cari, daftar lengkap, catat/ubah/hapus
  transaksi, serta bayar atau batalkan tagihan jadwal.
- Transaksi: semua filter (dompet, tipe, kategori, subkategori, rentang tanggal, urutan) ada di
  satu sheet Filter dari ikon kanan atas.
- Dompet: tambah, ubah nama & warna (termasuk warna custom), jadikan utama, hapus, atur urutan
  (seret atau tombol panah), tampilan grid/list, dan koreksi saldo.
- Kategori: tambah, ubah (jenis, ikon, nama, warna), hapus, atur urutan, dan kelola subkategori
  (tambah, ubah, hapus, seret untuk mengurutkan). Kategori & subkategori baru juga bisa dibuat
  langsung saat memilih kategori di form transaksi.
- Jadwal: lihat jatuh tempo berikutnya dan total rutin per bulan, tambah/ubah jadwal (harian,
  mingguan dengan pilihan hari, bulanan, tahunan), jeda/aktifkan, dan hapus.
- Pengingat notifikasi jam 08.00 di hari jatuh tempo jadwal (tanpa internet/server).
- Budget: buat/ubah/hapus budget (semua kategori atau kategori tertentu), sematkan ke Dashboard,
  atur urutan, lihat detail per kategori/subkategori, dan atur limit per kategori/subkategori.
- Investasi: nilai portofolio dengan grafik (bulan ini, tahun ini, semua), daftar instrumen,
  riwayat transaksi investasi (cari & filter), detail instrumen dengan grafik nilai vs modal per
  akun, tambah/ubah/hapus instrumen & akun, tarik dana (opsional setor ke dompet), update nilai
  (profit/rugi), transfer antar akun, serta ubah/hapus transaksi investasi.
- Investasi: tanggal & jam di Tarik dana, Transfer, dan Update nilai, jadi entri bisa dicatat
  mundur; Update nilai dibandingkan dengan nilai akun pada tanggal tersebut.
- Laporan: ringkasan pemasukan/pengeluaran/saldo bersih/jumlah transaksi dibanding periode
  sebelumnya, grafik cash flow (ketuk untuk detail, kumulatif atau per periode), pengeluaran per
  kategori, tren 12 bulan, top pengeluaran, dan dompet paling aktif. Periode hari, minggu, bulan,
  tahun, atau rentang tanggal sendiri.
- Laporan: Export PDF, Excel, atau CSV untuk periode yang dipilih (ringkasan, kategori, dompet, top
  pengeluaran, dan daftar transaksi), lalu simpan atau bagikan lewat menu bagikan Android.
- Catat cepat (AI): ketik transaksi seperti chat biasa ("makan siang 25rb"), AI menanyakan yang
  kurang (dompet, tanggal), menampilkan pratinjau, dan baru menyimpan setelah kamu tekan Simpan atau
  ketik "catat". Bisa merevisi lewat chat, banyak transaksi sekaligus (termasuk transfer, koreksi
  saldo, dan investasi), dan percakapan tidak hilang saat layar ditutup.
- Edit Profil: ubah nama & username (dengan konfirmasi) dan ubah password (login ulang setelahnya).
- Mata Uang: pilih IDR/USD/JPY dan jumlah desimal, dengan pratinjau.
- Pengaturan: jumlah pendaftaran baru di menu admin dan Zona Berbahaya (Reset Data).
- Admin: Permintaan Pengguna (aktifkan pendaftaran) dan Log Error (cari, filter, stack trace, hapus).

### Perbaikan

- Input di bagian bawah layar (misalnya password di Daftar, catatan di form) tidak lagi tertutup
  keyboard di semua halaman dan sheet.
- Tombol kembali saat keyboard terbuka kini hanya menutup keyboard, isian sheet tidak hilang.
- Bottom nav diberi garis tipis supaya tidak menyatu dengan latar.
- Perpindahan halaman, membuka sheet, dan ganti bahasa/tema lebih cepat.
- Cari ikon "kopi" kini menemukan ikon kopi.
- Transaksi: tanggal hari ini yang dipilih di kalender kini terlihat terpilih.
- Transaksi: urutan yang diubah ikut tampil di banner filter (sesuai angka di ikon Filter), dan
  Reset di banner mengembalikan semua filter, urutan, serta kata kunci.
