# Changelog — TosmFi

Semua perubahan penting dicatat di sini. Rilis terbaru di atas.

- **Baru**: fitur / layar / kemampuan yang sebelumnya tidak ada.
- **Ditingkatkan**: sesuatu yang sudah ada dibuat lebih baik (tampilan, performa, alur).
- **Perbaikan**: bug yang diperbaiki.

Kategori tanpa isi boleh dihilangkan.

---

## Belum dirilis

## v1.2.0 (versionCode 3)

_2026-10-15_

### Baru

- Tema: pilihan "Ikuti sistem" di sheet Lainnya, selain Terang dan Gelap.
- Scan struk: foto struk dari Catat cepat, AI membaca toko, total, tanggal, dan item lalu
  menampilkan pratinjau sebelum disimpan.
- Masuk: akun yang masih menunggu persetujuan admin kini diberi tahu dengan jelas.

### Ditingkatkan

- Transaksi: ketuk ringkasan Keluar/Masuk/Selisih untuk membuka Laporan; selisih minus berwarna
  merah.
- Atur urutan Dompet, Kategori, dan Budget kini menampilkan saldo, jenis, cakupan, dan pin.
- Aplikasi dikunci ke tampilan potret.
- Error yang tidak terduga kini dilaporkan ke Log Error admin, dengan layar "Coba Lagi".
- Logo baru TosmFi di dalam aplikasi, ikon launcher Android (termasuk ikon bertema Android 13), ikon
  iOS, dan layar pembuka iOS.

## v1.1.0 (versionCode 2)

_2026-10-14_

### Baru

- Laporan: Export PDF, Excel, atau CSV untuk periode yang dipilih, lalu simpan atau bagikan
  lewat menu bagikan Android.
- Investasi: filter instrumen di portofolio dan riwayat transaksi, ketuk grafik untuk melihat
  nilai & modal, serta buat instrumen atau akun baru langsung dari pemilih akun.

### Ditingkatkan

- Tipografi disamakan dengan versi web di semua halaman.
- Investasi: sparkline di daftar instrumen kini bergradasi seperti di kartu akun.

### Perbaikan

- Transaksi: tanggal hari ini yang dipilih di kalender kini terlihat terpilih.
- Transaksi: angka di ikon Filter, banner filter, dan tombol Reset kini selalu sesuai, termasuk
  saat hanya urutan yang diubah.

## v1.0.0 (versionCode 1)

_2026-10-09_

### Baru

- Tampilan baru Mist: tema terang/gelap, bottom nav mengambang, menu Lainnya, dan bahasa
  Indonesia, English, 日本語.
- Masuk & Daftar dengan pesan yang jelas; keluar akun (dengan konfirmasi) dari halaman Profil.
- Dashboard: kekayaan bersih, budget di-pin, ringkasan bulan ini, kesehatan finansial,
  pengeluaran per kategori, dompet, dan transaksi bulan ini.
- Transaksi: tab bulan, kalender, cari, sheet Filter, catat/ubah/hapus, serta bayar atau
  batalkan tagihan jadwal.
- Dompet, kategori, dan subkategori: tambah, ubah, hapus, atur urutan, plus koreksi saldo.
- Jadwal transaksi rutin dengan pengingat notifikasi jam 08.00.
- Budget per kategori/subkategori yang bisa di-pin ke Dashboard.
- Investasi: portofolio dan grafik, instrumen & akun, tarik dana, update nilai, dan transfer,
  bisa dicatat mundur.
- Laporan: ringkasan, cash flow, pengeluaran per kategori, tren 12 bulan, top pengeluaran, dan
  dompet paling aktif.
- Catat cepat (AI): catat transaksi lewat chat, dengan pratinjau sebelum disimpan.
- Edit Profil, Mata Uang, Reset Data, serta menu admin Permintaan Pengguna dan Log Error.

### Perbaikan

- Input tidak lagi tertutup keyboard, dan tombol kembali saat keyboard terbuka hanya menutup
  keyboard.
- Perpindahan halaman, membuka sheet, dan ganti bahasa/tema lebih cepat.
