# Design System TosmFi Mobile — "Mist"

Acuan tunggal tampilan app mobile (`tosm-fi-app`). **Semua layar dan komponen baru wajib mengikuti
dokumen ini.** Kalau ada yang belum tercakup, lihat frame pen yang sesuai (§12), lalu tambahkan
aturannya ke sini.

- **Sumber visual**: `../design/tosmfi-redesign.pen` (pen.dev). Semua angka di dokumen ini diambil
  dari file itu (variabel, komponen `V2/*`, dan frame `… / HP · Light`).
- **Urutan prioritas**: pen > dokumen ini > kode. Kalau kode berbeda dari pen, kodenya yang salah
  (lihat §11 untuk selisih yang sudah diketahui).
- **Pen hanya dibaca.** Jangan mengedit file design. Untuk melihat frame, pakai pencil MCP:
  `execute` → `TakeScreenshot(["<id>"])`, atau `Export([...], "png", <dir>)` untuk resolusi penuh.
- Web (`../tosm-fi-fe/DESIGN_SYSTEM.md`) memakai design yang sama. Bedanya, web memakai Tailwind;
  di sini semuanya ditulis dengan `StyleSheet` dan token di `src/theme/`.
- Kanvas HP di pen berukuran **390 × 844** (1 px pen = 1 dp di RN).

---

## 1. Aturan emas

1. **Hanya token semantik.**
   - Warna diambil dari `src/theme/colors.ts`, jarak/radius/ukuran font dari `src/theme/metrics.ts`,
     dan bayangan dari `src/theme/shadows.ts`.
   - Tidak boleh ada hex inline di komponen atau layar.
   - **Satu-satunya pengecualian** adalah warna data user dari backend (warna dompet, kategori,
     instrumen). Warna itu dipakai lewat style inline. Untuk isian lembut (tile, chip), tambahkan
     alpha `26` (≈15%), misalnya `` `${color}26` ``.
2. **Pakai ulang komponen.** Pola yang muncul dua kali masuk ke `src/components/` (atomic, lihat
   `PROJECT_CONVENTIONS.md` §2). Jangan membuat tombol, chip, kartu, field, sheet, atau baris sendiri.
3. **Berat font maksimal 600.** `semibold` adalah yang paling tebal. Jangan memakai `bold`/`700`.
4. **Angka uang** memakai font angka (Outfit) dengan `fontVariant: ['tabular-nums']`.
5. **Ikon** hanya dari `lucide-react-native`, dengan nama yang sama seperti di pen (`sprout`,
   `wallet`, `tag`, `calendar-clock`, `target`, `chart-column`, `settings`, `chevron-right`, …).
   Ikon kategori tetap memakai nama yang tersimpan di backend.
6. **Semua yang bisa di-tap** memakai `atoms/PressableScale`.
7. **Semua teks lewat `t()`** (id/en/jp). Label panjang di tempat sempit (tile, chip) dibuat satu
   baris dengan `numberOfLines={1}`. Tidak boleh terbungkus ke baris baru dan tidak boleh meluber.
8. **Light dan dark** harus sama-sama terbaca. Komponen hanya memakai nama token; nilai light/dark
   ditukar di satu tempat (§2).

---

## 2. Warna

Nama di pen (`$token`) → key di `colors.ts`. Light / dark.

### Permukaan & teks

| Pen | `colors.` | Light | Dark | Dipakai untuk |
|---|---|---|---|---|
| `bg` | `bg` | `#F4F5FB` | `#25263A` | Latar layar |
| `surface` | `surface` | `#FFFFFF` | `#2E3047` | Kartu, sheet, bottom nav |
| `surface-2` | `surface2` | `#EFF0F8` | `#373A54` | Kotak di dalam kartu, field di sheet, chip tidak aktif, tombol ikon, tile menu |
| `surface-3` | `surface3` | `#EFF0F8`¹ | `#373A54`¹ | State tekan/hover di atas `surface-2` |
| `border` | `border` | `#E3E5F1` | `#42455F` | Garis pemisah, stroke field, handle sheet |
| `border-strong` | `borderStrong` | `#E3E5F1`¹ | `#42455F`¹ | Stroke yang perlu lebih tegas |
| `text` | `text` | `#24263A` | `#EEEFF8` | Teks utama |
| `text-2` | `text2` | `#565A75` | `#BFC1DA` | Teks sekunder, label field |
| `text-3` | `text3` | `#6E7290` | `#9A9DBA` | Meta, placeholder, eyebrow, chevron |

¹ Di pen, `surface-3` = `surface-2` dan `border-strong` = `border`. Kode (mengikuti web) memakai
`#E6E8F3` / `#D3D6E8` (dark `#3F425E` / `#4D5070`) supaya state tekan dan stroke tegas tetap
terlihat. Pakai keduanya hanya untuk keperluan itu.

### Brand

| Pen | `colors.` | Light | Dark | Dipakai untuk |
|---|---|---|---|---|
| `primary` | `primary` | `#6A6DCD` | `#A3A6F5` | Tombol utama, LogoMark, tombol AI tengah, checkbox aktif |
| `primary-fg` | `primaryFg` | `#FFFFFF` | `#1E1F38` | Teks/ikon di atas `primary` |
| `primary-soft` | `primarySoft` | `#E8E9FA` | `#3C3F66` | Tombol soft, chip aktif, badge, slot tab aktif |
| `primary-text` | `primaryText` | `#5357B8` | `#B4B6F8` | Teks/ikon di atas `primary-soft`, tautan |
| `nav-active-bg` / `-fg` | `navActiveBg` / `navActiveFg` | `#E8E9FA` / `#4B4FB0` | `#3C3F66` / `#D0D2FF` | Item navigasi aktif |

### Uang & status

Setiap jenis punya tiga nada: **dasar** (grafik, titik, stroke), **`-soft`** (latar), dan
**`-text`** (teks/ikon di atas soft atau angka berwarna).

| Jenis | Dasar | `-soft` | `-text` | Dark (dasar / soft / text) |
|---|---|---|---|---|
| `income` (pemasukan) | `#8CCBB3` | `#E3F4EE` | `#2F7D62` | `#95D5BD` / `#34494A` / `#A9E0CB` |
| `expense` (pengeluaran, error, bahaya) | `#F2A7A0` | `#FDEBE9` | `#B84F4A` | `#F5B1AA` / `#4D3A49` / `#F8C0BA` |
| `investment` (investasi) | `#F3C98B` | `#FCF1DF` | `#8F6116` | `#F5D29C` / `#4B4446` / `#F8DCB0` |
| `cash` (tunai/dompet) | `#9DB4F0` | — | `#4561B0` | `#AFC2F5` / — / `#C0CFF8` |
| `warning` | = `investment` | = `investment-soft` | = `investment-text` | sama dengan investment |

- Angka pengeluaran ditulis dengan `expenseText` dan tanda minus asli `−` (U+2212), contohnya
  `−45.000`. Angka pemasukan memakai `incomeText` dan `+`. Transfer memakai warna netral `text`.
- `warning` belum ada di `colors.ts`. Kalau butuh, tambahkan sebagai alias investment, jangan nilai baru.

### Hero & grafik

| Pen | `colors.` | Light | Dark |
|---|---|---|---|
| `hero-bg` → `hero-bg-2` | `heroBg` → `heroBg2` | `#E6E7FB` → `#F7E9F1` | `#3A3D66` → `#45395E` |
| `hero-fg` / `hero-fg-2` | `heroFg` / `heroFg2` | `#23254A` / `#5B5E8A` | `#F4F4FF` / `#C3C5E8` |
| `chart-1` … `chart-6` | `chart1` … `chart6` | `#8B8EE0` `#F2A7A0` `#8CCBB3` `#F3C98B` `#9DB4F0` `#D3A6E0` | `#A3A6F5` `#F5B1AA` `#95D5BD` `#F5D29C` `#AFC2F5` `#DDB4EA` |
| scrim (sheet/modal) | `scrim` | `#1A1B2E` @ 45% | `#0A0A16` @ 60% |

- **Hero** berupa gradien linear `heroBg` → `heroBg2` (rotasi pen 250°, kira-kira dari kiri atas ke
  kanan bawah). Di RN butuh library gradien (`react-native-linear-gradient` atau `react-native-svg`
  `LinearGradient`, yang sudah terpasang). Selama belum ada, pakai `heroBg` polos.
- Untuk tombol bulat di atas hero, pakai putih transparan (`#FFFFFF66`, sedangkan Login `#FFFFFF80`).
  Ini satu-satunya putih transparan yang diizinkan; jadikan token `heroControl` saat dipakai.

---

## 3. Tipografi

**Font**:
- **Inter** untuk body (default).
- **Outfit** untuk judul (`display`) dan angka (`num`).
- Berat yang dipakai hanya 400 (regular), 500 (medium), dan 600 (semibold / "strong").
- File font belum terpasang (§11). Sebelum terpasang, font sistem dipakai sebagai cadangan.

| Peran | Font | Ukuran / berat | Warna | Contoh |
|---|---|---|---|---|
| Angka hero (Dashboard HP) | Outfit | 42 / 600, letterSpacing −1; prefix "IDR" 18/500 `heroFg2` | `heroFg` | `IDR 128.450.000` |
| Angka uang di sheet | Outfit | 40–44 / 600 | `text` | `IDR 45.000` |
| Judul app bar (halaman HP) | Outfit | 24 / 600 | `text` | Transaksi, Pengaturan |
| Headline Login/Register HP | Outfit | 26 / 600, letterSpacing −0.5 | `heroFg` | Catat, pahami, … |
| Judul form auth | Outfit | 26 / 600 | `text` | Selamat datang kembali |
| Judul sheet / dialog | Outfit | 21 / 600 | `text` | Catat transaksi |
| Judul kartu | Outfit | 18 / 600 | `text` | Transaksi terbaru |
| Wordmark "TosmFi" | Outfit | 19 / 600 | `text` / `heroFg` | — |
| Sapaan hero | Outfit | 17 / 500 | `heroFg2` | Selamat pagi, Andi |
| Body | Inter | 14 / 400 | `text2` | Paragraf |
| Label / judul baris | Inter | 14 / 600 | `text` | Kopi Kenangan |
| Angka di baris | Outfit | 14 / 600 | sesuai jenis uang | `−45.000` |
| Label field | Inter | 13 / 600 | `text2` | Username |
| Teks sekunder | Inter | 13 / 400 | `text2` / `text3` | Subjudul halaman |
| Meta baris | Inter | 12.5 / 400 | `text3` | Makan & Minum · GoPay |
| Helper / waktu | Inter | 12 / 400 | `text3` | 08.42 |
| Eyebrow / judul seksi | Inter | 11 / 600, UPPERCASE, letterSpacing 0.8–1 | `text3` | RINGKASAN, ADMIN |
| Header hari di daftar | Inter | 12 / 600, UPPERCASE, letterSpacing 0.6; total hari Outfit 12/400 | `text3` | HARI INI · −85.000 |
| Badge | Inter | 11 / 600 | `*Text` | Utama, 2 baru |

`atoms/Typography` wajib menyediakan varian untuk peran-peran di atas (font, ukuran, dan berat
sekaligus). Jangan menulis `fontSize`/`fontWeight` bebas di layar.

---

## 4. Jarak, radius, bayangan

### Jarak (kelipatan 2, paling sering 4/8/12/16/20)

| Konteks | Nilai |
|---|---|
| Gutter layar HP (kiri/kanan) | **16** (header Login/hero Dashboard: 20) |
| Jarak antar-kartu / antar-seksi | **16** (halaman list seperti Pengaturan: 12) |
| Padding dalam kartu | **20** |
| Jarak di dalam kartu (judul → isi) | 14 |
| Bawah konten (ruang untuk bottom nav) | **130** (`MainLayout withTabBar`) |
| Field: label → kotak → helper | 8 |
| Antar-field dalam form | 16 (form auth), 20 (sheet) |
| Grup chip / tombol berdampingan | 8 (chip), 10 (tombol footer, tile) |

### Radius

| Token pen | Nilai | Untuk |
|---|---|---|
| `radius-control` | **12** | Tombol ikon kotak, tile menu, kotak catatan, key keypad, tile ikon baris menu |
| — | **14** | Kotak field input, banner |
| `radius-card` | **20** | Kartu, AmountCard, zona bahaya |
| — | **28** | Bottom sheet (sudut atas), dialog |
| — | **32** | Hero band Dashboard (sudut bawah), sheet form Login (sudut atas) |
| pill | **999** | Tombol teks, chip, badge, segmented, tombol ikon bulat, bottom nav, avatar, LogoMark |

### Bayangan (`shadows.ts`)

| Preset | Spesifikasi pen | Dipakai untuk |
|---|---|---|
| `card` | `#24263A` 8%, y 8, blur 28 | Kartu di atas `bg` |
| `nav` | `#24263A` 16%, y 10, blur 30 | Bottom nav mengambang |
| `pop` | `#000000` 20%, y 24, blur 60 | Sheet / dialog / StatusModal |
| `thumb` | `#24263A` 8%, y 2, blur 8 | Thumb segmented control |

Di Android, `elevation` hanya kira-kira. Pakai `card` = 3, `nav` = 8, `pop` = 12, `thumb` = 1.
Kartu **tanpa stroke** (`card-stroke` = 0). Batas kartu dibentuk oleh bayangan dan kontras dengan `bg`.

---

## 5. Kerangka layar HP

### 5.1 App bar (tinggi 64, padding horizontal 16, latar transparan di atas `bg`)

| Jenis layar | Kiri | Kanan |
|---|---|---|
| Halaman tab / menu (Transaksi, Pengaturan, Dompet, …) | `LogoMark` 32 + judul Outfit 24/600, jarak 10 | 0–3 `IconButton` bulat 38, latar `surface`, jarak 6 |
| Sub-halaman (Mata Uang, Edit Profil, detail) | `IconButton` kembali 38 (`chevron-left`/`arrow-left`) + judul 24/600 | opsional |
| Dashboard | Di dalam hero band: LogoMark 32 + wordmark 19 | Tombol bulat 36 `#FFFFFF66` (cari, tema) + Avatar 36 `primary` |

- Subjudul halaman (opsional) muncul di bawah app bar, di dalam konten: Inter 13 `text3`.

### 5.2 Hero band (Dashboard)

- Lebar penuh, sudut **bawah** 32, gradien hero, padding `0 20 28 20`, jarak antar-isi 18.
- Isi dari atas ke bawah:
  - app bar;
  - sapaan;
  - label "Total kekayaan bersih" dengan ikon `eye` 15;
  - angka hero;
  - dua chip ringkasan pill: `surface`, padding `10 14 10 10`, ikon bulat 34 di `surface2`, chevron 16.
- Hero blok lain (total investasi, identitas budget/profil) memakai gradien yang sama di dalam
  kartu radius 28 dengan padding 24.

### 5.3 Konten

- Kolom vertikal dengan padding `20 16 130 16` dan jarak 16. Seksi berupa **Kartu** (§6).
- Daftar di dalam kartu dikelompokkan per hari: header hari (§3) lalu baris-baris `TxRow`.

### 5.4 Bottom nav (tab bar mengambang)

- Ukuran: lebar layar − 40 (350 di 390), tinggi **64**, pill, latar `surface`, bayangan `nav`.
- Posisi: 20 dari kiri/kanan/bawah (bawah = `max(safe-area, 20)`).
- 5 slot sama lebar, dengan ikon saja dan tanpa label: Beranda `layout-grid`, Transaksi
  `arrow-left-right`, **AI tengah** (`sparkles`), Investasi `trending-up`, Lainnya `menu`.
- Slot berukuran 44, pill. Slot aktif berlatar `primarySoft` dengan ikon `primaryText`; slot tidak
  aktif tanpa latar dengan ikon `text3`. Ikon berukuran 21.
- Tombol AI tengah berukuran 48, latar `primary`, ikon 22 `primaryFg`.
- **Lainnya** membuka **bottom sheet** (§6.14), bukan pindah halaman. Slot Lainnya tetap ditandai
  aktif saat pengguna berada di halaman yang dibuka dari sheet itu (Dompet, Kategori, Jadwal,
  Budget, Laporan, Pengaturan, Profil).

### 5.5 Bottom sheet & dialog

- **Sheet**: latar `surface`, sudut atas 28, padding `12 20 34 20` (+ safe-area bawah), jarak antar-isi 20.
  - Handle di atas: 44 × 5, pill, warna `border`, di tengah.
  - Header: judul Outfit 21 di kiri, tombol tutup `IconButton` bulat 38 (`x`) di kanan.
  - Footer: dua tombol sama lebar dengan tinggi **50**, kiri Outline (Batal) dan kanan Primary (Simpan).
- Latar belakang sheet berupa `scrim` di atas layar.
- **Dialog konfirmasi** (hapus, keluar, reset) berupa kartu di **tengah**, bukan sheet. Kartunya
  memakai radius 28, bayangan `pop`, ikon status bulat, judul 21, body 14 `text2`, dan dua tombol.
  `organisms/StatusModal` adalah varian satu tombol.

### 5.6 Auth (Login / Register)

- Seluruh layar berlatar gradien hero (rotasi 210°).
- **Header** (padding `18 20 28 20`, jarak 22):
  - baris atas berisi brand (LogoMark 32 + wordmark) dan tombol tema bulat 38 `#FFFFFF80`;
  - di bawahnya headline Outfit 26.
- **Sheet form** mengisi sisa layar: `surface`, sudut atas 32, padding `28 20 20 20`. Isinya:
  - judul 26 + subjudul 14 `text2`;
  - field dengan jarak 16;
  - baris opsi ("Ingat saya" + "Lupa password?");
  - tombol utama tinggi **52**;
  - tautan pindah ("Belum punya akun? **Daftar sekarang**").
- Pemilih bahasa berupa pill di bawah sheet: `surface` + stroke `border`, ikon `languages` 15,
  teks 13, `chevron-up`.
- Pesan error/info memakai **Banner** (§6.9) di atas field, bukan modal.

---

## 6. Komponen

Kolom "RN" menunjukkan lokasi komponen di kode. Komponen yang ditandai *belum* dibuat dulu saat
pertama kali dibutuhkan, mengikuti spesifikasinya di sini.

| # | Komponen (pen) | RN |
|---|---|---|
| 6.1 | Button | `atoms/Button` |
| 6.2 | IconButton | `atoms/IconButton` |
| 6.3 | Chip / Chip Active / Chip outline | `atoms/Chip` *belum* |
| 6.4 | Badge | `atoms/Badge` |
| 6.5 | SegmentedControl | `molecules/SegmentedControl` |
| 6.6 | Field / Textarea / PickerField | `molecules/TextField` (`outlined`/`filled`); Textarea & PickerField *belum* |
| 6.7 | Checkbox | `atoms/Checkbox` *belum* |
| 6.8 | LogoMark / Avatar | `atoms/LogoMark`, `atoms/Avatar` |
| 6.9 | Banner | `molecules/Banner` |
| 6.10 | Card + SectionHead | `molecules/Card`; `molecules/SectionHead` *belum* |
| 6.11 | TxRow | `molecules/TxRow` *belum* |
| 6.12 | MenuRow / MenuGroup | `molecules/MenuRow`, `molecules/MenuGroup` |
| 6.13 | AmountCard + Keypad | `molecules/AmountCard`, `molecules/Keypad` *belum* |
| 6.14 | Sheet Lainnya | `navigation/MoreMenuSheet.tsx` (+ `molecules/MenuTile`, `organisms/BottomSheet`) |
| 6.15 | EmptyState / Loading / Error | `molecules/EmptyState`, … |

### 6.1 Button

- Bentuk **pill**, dengan isi ikon 17 + label Inter 14/600 berjarak 8.
- Tinggi: **50** di footer sheet, **52** untuk submit auth, dan 44 di dalam kartu (misalnya
  Bayar/Batalkan di baris jadwal). Padding horizontal 18.

| Varian | Latar | Teks/ikon | Stroke |
|---|---|---|---|
| `primary` | `primary` | `primaryFg` | — |
| `soft` | `primarySoft` | `primaryText` | — |
| `outline` | `surface` | `text` | `border` 1 |
| `ghost` | transparan | `primaryText` | — |
| `danger` (aksi hapus/reset utama) | `expenseText` | `#FFFFFF`/`surface` | — |
| `dangerSoft` (Keluar) | `expenseSoft` | `expenseText` | — |

- "Tambah …" di dasar kartu (contoh: Tambah dompet) memakai varian `soft`, lebar penuh, dengan ikon `plus`.
- State loading menampilkan spinner berwarna teks varian. Disabled memakai opacity 0.55.

### 6.2 IconButton

- Ukuran **38** (app bar, header sheet), 40 (pen master), dan 42 (kalkulator di AmountCard).
- Ikon berukuran 18. Bentuk bulat (pill) di app bar/sheet; radius 12 kalau tampil sebagai tombol kotak.
- Varian:
  - `surface2` (default, ikon `text2`);
  - `surface` (di atas `bg`);
  - `hero` (`#FFFFFF66`);
  - `primary`.
- Wajib punya `accessibilityLabel`.

### 6.3 Chip

- Pill, padding `7 14`, teks 13.
- **Default** (filter / pilihan cepat): latar `surface2`, teks `text2` 500.
- **Aktif**: latar `primarySoft`, teks `primaryText` 600.
- **Outline** (pemilih dompet): padding `8 12`, latar `surface`, stroke `border`, titik warna dompet 8
  sebelum label, jarak 7. Saat aktif, latar `primarySoft` + stroke `primary`.
- Deretan chip yang bisa meluber dibuat scroll horizontal.

### 6.4 Badge

- Pill, padding `3 9`, teks Inter 11/600.
- Nada: `primary` (Utama), `income` (2 baru), `expense` (3 baru), `investment`, `neutral`
  (`surface2`/`text2`).

### 6.5 SegmentedControl

- Track: pill, latar `surface2`, padding 4, jarak 4.
- Segmen: pill, padding vertikal 10, teks 13.5.
- Segmen aktif: latar `surface`, bayangan `thumb`, teks 600. Warnanya mengikuti konteks: Pengeluaran
  `expenseText`, Pemasukan `incomeText`, dan netral `text`.
- Segmen tidak aktif: teks `text3` 500.
- Thumb bergeser dengan animasi (§9).
- Varian kecil (tema, bahasa di sheet Lainnya): track `surface`, thumb `primarySoft`, isi ikon/teks pendek.

### 6.6 Field

- Label Inter 13/600 `text2` → kotak → helper 12 `text3` (error: `expenseText`). Jarak 8.
- **Kotak**: tinggi **52**, radius **14**, padding horizontal 16. Isinya ikon depan 18 `text3`
  (opsional), nilai 14 `text` (placeholder `text3`), lalu ikon/aksi belakang 18 (opsional).
- Dua varian latar:
  - di atas `surface` polos (form auth): latar `surface` + stroke `border`;
  - di dalam sheet/kartu form: latar `surface2` tanpa stroke.
- Fokus: stroke `primary`. Error: stroke `expense`.
- **Textarea**: kotak tinggi 72+, padding `14 16`, radius 12, latar `surface2`.
- **PickerField** (tanggal & jam, pemilih): bentuk kotak sama dengan ikon depan dan `chevron-down` di
  belakang. Menekannya membuka sheet pemilih.

### 6.7 Checkbox

- Kotak 22, radius 7. Tidak aktif: stroke `text3`. Aktif: latar `primary` dengan centang `primaryFg`.
- Baris opsi berbingkai (contoh "Catat sebagai investasi"): padding 14, radius 16, stroke `border`.
  Isinya checkbox, judul 14/600 + sub 12.5 `text3`, dan ikon konteks di kanan.

### 6.8 LogoMark & Avatar

- **LogoMark**: lingkaran `primary` dengan ikon lucide **`sprout`** berwarna `primaryFg`. Ukuran
  32 (ikon 16) dipakai di app bar dan auth. Ukuran lain: 20/11, 42/20, 56/28. Ini satu-satunya bentuk
  logo di dalam app; PNG logo hanya untuk ikon launcher dan splash.
- **Avatar**: lingkaran berisi inisial Outfit 15/600. Ukuran 36 di app bar Dashboard (latar `primary`,
  teks `primaryFg`) dan 44 di sheet Lainnya (latar `primarySoft`, teks `primaryText`).

### 6.9 Banner (pesan inline)

- Radius 14, padding `12 14`, jarak 12.
- Isinya ikon bulat 28 berlatar `surface` (ikon 16 dengan warna nada), judul 13.5/600 berwarna nada,
  dan body 13 `text2`.
- Nada:
  - `error` (expense);
  - `warning` (investment), misalnya akun menunggu persetujuan;
  - `info` (primary), misalnya sesi berakhir atau catatan persetujuan di Register;
  - `success` (income).

### 6.10 Card & SectionHead

- **Card**: latar `surface`, radius 20, padding 20, bayangan `card`, tanpa stroke. Jarak antar-isi 14.
- **Card list** (menu Pengaturan): padding `4 14`. Baris dipisah garis 1 `border`.
- **Kotak dalam kartu** (item dompet, item kategori): latar `surface2`, radius 12–14, padding 12–14.
- **SectionHead**: kolom kiri berisi eyebrow (11/600 caps `text3`) di atas judul (Outfit 18/600,
  jarak 2). Di kanan ada tautan "Lihat semua / Semua / Kelola / Laporan" (13/600 `primaryText` +
  `arrow-right` 14).
- **Zona bahaya**: latar `expenseSoft`, stroke `expense`, radius 20, padding 16. Judul dengan ikon
  `triangle-alert` `expenseText`, lalu body 12.5, lalu Button `danger` pill.

### 6.11 TxRow (satu-satunya bentuk baris transaksi)

- Padding vertikal 12, jarak 14.
- **Tile** 42, radius 12 (pen master) atau bulat 40 (AmountCard). Latar `${warnaKategori}26`
  dengan ikon kategori 19 berwarna kategori.
- **Teks**: judul 14/600 `text`, lalu meta 12.5 `text3` ("Kategori · Dompet", transfer
  "BCA → Jago"), jarak 3.
- **Kanan** (rata kanan): nominal Outfit 14/600 (warna sesuai jenis uang, §2), lalu waktu 12 `text3`.
- **Jadwal jatuh tempo** di dalam daftar memakai kotak `investmentSoft` radius 14. Isinya baris
  "Netflix · hari ini" dan dua Button 44 (Batalkan `outline`, Bayar `primary` + ikon `check`).
- Dipakai untuk baris transaksi, transfer, jadwal, ledger investasi, dan preview Catat Cepat.

### 6.12 MenuRow & daftar menu

- Padding vertikal 13, jarak 12.
- Isinya tile ikon 38 (radius 12, latar `*Soft`, ikon 18 `*Text`), lalu judul 14/600 + deskripsi
  12 `text3` (boleh 2 baris), lalu badge opsional, lalu `chevron-right` 16 `text3`.
- Baris-baris dikumpulkan dalam **Card list** (§6.10) di bawah eyebrow seksi (ADMIN, UMUM).
- Nada tile per menu:
  - Permintaan Pengguna → income;
  - Log Error → expense;
  - Mata Uang → investment;
  - Dompet/Laporan → primary;
  - Kategori → expense;
  - Jadwal → investment;
  - Budget → income;
  - Pengaturan → `surface`.

### 6.13 AmountCard & Keypad (form uang)

- **AmountCard**: latar `surface2`, radius 20, padding 18, jarak 14.
  - Atas: tombol kategori, berisi tile bulat 40 `${warna}26`, nama 14/600 + subkategori 12.5, dan chevron.
  - Pemisah: garis 1 `border`.
  - Bawah: "IDR" 18 `text3` + angka Outfit 40–44/600 di kiri, dan IconButton kalkulator 42 latar
    `surface` di kanan.
- **Keypad**: grid 4 kolom dengan jarak 8. Key tinggi 56, radius 12, latar `surface2`, angka Outfit
  21/500.
  - Operator `÷ × − +` memakai latar `primarySoft` dengan teks `primaryText`.
  - Baris terakhir berisi ⌫ (ikon 22 `text2`) dan "Selesai" (latar `primary`, radius 16, Inter 15/600).
  - Urutan baris: `7 8 9 ÷ / 4 5 6 × / 1 2 3 − / 000 0 , +`.

### 6.14 Sheet "Lainnya" (dibuka dari slot Lainnya)

Bottom sheet dengan padding `12 16 34 16` dan jarak 14. Isinya dari atas:

1. Handle.
2. **Kartu profil**: latar `surface2`, radius 12, padding 12. Avatar 44, nama 14/600, tautan
   "Edit Profil" 12/600 `primaryText`, dan chevron.
3. **Grid 3 × 2 tile**: setiap tile berlatar `surface2`, radius 12, padding `14 6`, jarak 8. Ikon
   40 radius 13 (latar `*Soft`, lihat nada §6.12), label 12.5/600. Jarak antar-tile 10. Urutannya
   Dompet, Kategori, Jadwal, Budget, Laporan, Pengaturan.
4. **Dua kotak berdampingan**: tema (ikon + segmented ☀/☾) dan bahasa (ikon `languages` + segmented
   ID/EN/JP).
5. **Keluar**: Button `dangerSoft` lebar penuh dengan ikon `log-out`.

### 6.15 Status layar

- **Kosong**: EmptyState berisi ikon dalam tile `primarySoft` 72 radius 24, judul Outfit 18–20/600,
  deskripsi 13–14 `text2`, dan tombol aksi utama (misalnya "Tambah dompet"). Di dalam kartu pakai
  versi ringkas.
- **Loading**: skeleton berbentuk konten (diutamakan), atau loader brand (LogoMark di dalam cincin
  berputar + "Memuat…").
- **Error**: Banner `error` untuk error di dalam layar. Feedback sesaat memakai toast atau StatusModal.

---

## 7. Pola layar (template)

```tsx
<MainLayout title={t('nav.wallet')} withTabBar headerRight={<IconButton … />}>
  <Card>
    <SectionHead eyebrow={t('…')} title={t('…')} actionLabel={t('…')} onAction={…} />
    …
  </Card>
  <Card>…</Card>
</MainLayout>
```

- Halaman yang tampil bersama bottom nav (tab dan halaman dari sheet Lainnya) memakai
  `withTabBar`, karena bottom nav tetap terlihat di semua layar utama.
- Seksi muncul berurutan dengan animasi fade-up (§9), jeda 50 ms per kartu.
- Hero hanya ada di Dashboard, Investasi (total), detail Budget, dan Profil.

---

## 8. Grafik

Spesifikasi mengikuti section "Grafik" di `SzSDf`. Library RN belum dipilih: kandidatnya
`react-native-svg` (sudah terpasang) atau `victory-native`/`react-native-gifted-charts`. Apa pun
pilihannya, aturannya sama:

- **Warna**: pemasukan `chart1`, pengeluaran `chart2`, investasi `investment`. Kategori memakai warna
  data user, atau berurutan `chart1…6` kalau tidak ada.
- **Area/line**: garis 2.5, isian gradien (opacity 0.32 → 0), grid horizontal `border` tanpa garis
  vertikal, tanpa garis sumbu, label sumbu 11 `text3`, titik aktif r 7 dengan stroke `surface`.
- **Bar**: sudut atas 8 / bawah 3. Bar aktif berwarna penuh, sisanya versi soft. Label nilai di atas
  bar memakai Outfit 13/600 berwarna jenis. Label kategori di bawah 12 `text2`.
- **Donut**: tebal ±20, sudut segmen membulat, jarak antar-segmen 3. Di tengahnya total Outfit
  26/600 + label 12 `text3` ("total keluar").
- **Ring progres budget**: diameter 52, tebal 5. Track `surface2`, isi berwarna kategori (lewat
  limit: `expense`). Persen di tengah Outfit 12/600.
- **Gauge skor** (Kesehatan finansial): busur 270°, track `surface2`, isi `primary`, angka Outfit
  44/600 + Badge di tengah.
- **Tooltip**: kartu `surface`, radius 14, bayangan `pop`, stroke `border`.

---

## 9. Animasi

Semua preset ada di `src/utils/motion.ts` (Reanimated 4 + moti). Jangan menulis konfigurasi spring/timing inline.

| Di mana | Bagaimana |
|---|---|
| Tap (tombol, chip, tile, baris) | `PressableScale` (skala 0.96, `springs.press`) |
| Kartu/seksi muncul | `fadeInUp` (260 ms), stagger 50 ms |
| Indikator aktif (tab, segmented, chip) | `transitions.indicator` (stiffness 420, damping 34) |
| Sheet / dialog muncul | `transitions.pop` |
| Ganti angka | Boleh fade singkat; jangan pakai counter yang menunda angka bisa dibaca |

Durasi berada di 180–500 ms, dan animasi tidak boleh memblokir input. Hormati pengaturan
"kurangi gerakan" di sistem (`useReducedMotion` dari Reanimated).

---

## 10. Dark mode

- Semua token di §2 punya nilai dark (pen: tema `mode: dark`). `darkColors` di `colors.ts` sudah
  berisi nilai-nilai itu.
- Toggle tema ada di sheet Lainnya (§6.14) dan di app bar Login. Saat diimplementasikan, komponen
  harus membaca warna dari hook tema (misalnya `useThemeColors()`), bukan dari `colors` statis.
- Frame referensi dark: Dashboard HP `kUFIm`.

---

## 11. Status implementasi vs pen

Sudah sesuai pen (2026-10-08):

- **Font**: Inter + Outfit (Regular/Medium/SemiBold) di `src/assets/fonts`, tertaut lewat
  `react-native.config.js` + `npx react-native-asset`. Lisensi OFL ada di `licenses/`.
- **Tipografi**: `theme/typography.ts` (`fonts`, `textStyles` per peran). Maksimal SemiBold, dan berat
  ditentukan oleh file font (tanpa `fontWeight`).
- **Token**: `metrics.radius` (control/field/card/sheet/hero/pill), `layout` (gutter, appBar, ruang
  bottom nav 130), `shadows` (card/nav/pop/thumb), `colors.warning*`, `heroControl`, `onDanger`, dan
  `theme/tones.ts`.
- **App bar** (`MainLayout`): tinggi 64, LogoMark atau tombol kembali 38, judul Outfit 24.
- **Bottom nav global** (`navigation/AppBottomNav.tsx`): tampil di semua layar login kecuali modal.
  Slot Lainnya membuka **sheet** (`navigation/MoreMenuSheet.tsx`) dan tetap aktif di halaman
  turunannya.
- **Login/Register**: header gradien + sheet form, Banner untuk error/info, dan pemilih bahasa.
- **Logo**: `atoms/LogoMark` (sprout). PNG logo sudah dihapus dari app.
- **Komponen baru**:
  - atoms: `IconButton`, `LogoMark`, `Avatar`, `Badge`, `Gradient`;
  - molecules: `Card`, `Banner`, `MenuGroup`, `MenuTile`, `SegmentedControl`, `LanguagePill`;
  - organisms: `BottomSheet`, `ConfirmDialog`, `LanguageSheet`.
- **Konvensi prop ikon**: fungsi render bernama `renderIcon`/`renderLeadingIcon` yang menerima warna
  (dan ukuran). Dengan begitu warna ikon selalu mengikuti varian komponen.

Belum dikerjakan:

| Area | Catatan |
|---|---|
| Dark mode | `darkColors` sudah ada; butuh hook tema + toggle (di sheet Lainnya dan app bar Login, sesuai pen) |
| "Ingat saya" & "Lupa password?" (Login) | Ada di pen, tapi belum ada perilakunya (sesi selalu diingat, belum ada endpoint lupa password) |
| Hero band Dashboard, grafik, TxRow, AmountCard, Keypad, Chip | Dibuat saat layar terkait di-port |
| Badge jumlah baru di menu admin Pengaturan | Butuh data hitungan dari API |

## 12. Indeks frame pen (HP)

Buka dengan pencil MCP pada `../design/tosmfi-redesign.pen`.

### Fondasi & komponen

- **Fondasi** (warna, tipografi, grafik, komponen): `SzSDf`. Section-nya: Warna `aCBwz`,
  Tipografi `V5ETL`, Grafik `aersU`, Komponen `J8gne`.
- **Komponen master**: `XlPND`. Komponen reusable:
  - Button: `xlCDD` (Primary), `kFwkQ` (Soft), `V9DCU` (Outline);
  - `dcH6B` (IconButton);
  - Chip: `DwUxY` (Chip), `pOwKE` (Chip Active);
  - `rE1JY` (Badge);
  - `NZnut` (TxRow);
  - `n24Wn` (SectionHead);
  - `wGrId` (Field);
  - `apyP9` (Banner);
  - `EmEfQ` (LogoMark);
  - `l7liq` (Keypad);
  - `Kfj6B` (PreviewCard);
  - `F5ueUE` (Backdrop/Mobile).

### Halaman

| Halaman | HP | Halaman | HP |
|---|---|---|---|
| Login | `w7RD5` | Register | `kkOoB` |
| Dashboard | `yHRM4` (dark `kUFIm`) | Transaksi | `PIoO4` |
| Transaksi · Filter aktif | `z5AbmD` | Dompet | `cnoOe` |
| Dompet · List | `YYZ1Z` | Dompet · Atur urutan | `PWG8l` |
| Dompet · Kosong | `ZcRnk` | Kategori | `auPuW` |
| Kategori · Atur urutan | `y0vxv` | Kategori · Kosong | `ZVCxG` |
| Jadwal | `a0SVGi` | Jadwal · Kosong | `go3lT` |
| Budget | `Lu9SC` | Budget · Detail | `NFM3f` |
| Budget · Kosong | `JqSyG` | Investasi | `Q1BjKl` |
| Investasi · Detail | `Dn41X` | Investasi · Kosong | `dZKTE` |
| Laporan | `S5YW9` | Laporan · State | `CaSg9` |
| Edit Profil | `S5xzK` | Pengaturan | `k0SKz` |
| Mata Uang | `TPJ9e` | Permintaan Pengguna | `DaxsW` |
| Log Error | `IMPbc` | Menu Lainnya (sheet) | `TRDlX` |
| Toast | `vFxAJ` | Layar Error | `KG1bZ` |
| Loading | `WG5B9` | | |

Backend API (`y12zG`) khusus web, jadi tidak di-port.

### Popup HP (bottom sheet)

| Area | Frame |
|---|---|
| Transaksi | Catat `C4Bk35`, Transfer `DcLW7`, Edit `z5FDD`, Pilih kategori `DSIav`, Pilih subkategori `c2WsJ`, Kalkulator `U0tbU`, Tanggal & jam `k2oQp`, Catat ke investasi `C4brtg`, Rentang tanggal `TtzF7`, Urutkan `qFQeP` |
| Dompet | Koreksi saldo `kdRVQ`, Tambah `KiasV`, Edit `nrR3J`, Warna custom `yRiTX`, Hapus `GDBqu` |
| Jadwal | Bayar `U7rLyW`, Batal `WaYzd`, Tambah `nHHvn`, Edit `W9TVu`, Tanggal mulai `G6xy19`, Hapus `KSoo2` |
| Kategori | Tambah `gyYoq`, Edit `Fuwp0`, Pilih ikon `o8mD9`, Edit subkategori `XqmP6`, Hapus `fjWxZ` |
| Budget | Tambah `O98YEF`, Pilih kategori `Jt53V`, Atur limit `R4Ro9g`, Hapus `A4B0e2` |
| Investasi | Edit instrumen `WTcV3`, Tambah akun `o12ZPM`, Tarik dana `p6ZH8`, Transfer antar akun `JdZov`, Update nilai `pJ1a2`, Edit transaksi `ngkTb`, Pilih instrumen `Scg3T`, Pilih akun `Iyrbl`, Urutkan `CNNda` |
| Laporan | Export `MVyzc`, Custom range `xBWFe` |
| Profil & pengaturan | Simpan profil `eCXQt`, Keluar `PlMkh`, Reset data `H9Gnu`, Hapus log `PdN9s` |

### Catat Cepat (AI) HP

| State | Frame |
|---|---|
| Panel kosong | `E5vp0` |
| Memproses | `uYwK3` |
| Tanya · Tanggal | `WmIDv` |
| Tanya · Dompet | `ijckz` |
| Tanya · Akun investasi | `muCPn` |
| Preview | `jGlb6` |
| Preview campuran | `oWIdX` |
| Revisi | `GSWLR` |
| Menyimpan | `gczRw` |
| Berhasil | `cHPm3` |
| Dibatalkan | `JgODX` |
| Dashboard setelah tersimpan | `oFfQd` |
| Error · Kuota penuh | `OMiRj` |
| Error · Koneksi gagal | `eD13h` |
| Error · Tidak paham | `ep4oD` |
| Error · Validasi | `BzqI8` |

Komponen chat:
- Bubble: `x2nw8j` (AI), `Rai2k` (User), `kXtDC` (Success);
- `qPY9y` (QuickReply);
- `GHkzR` (TypingIndicator);
- `Vtw1n` (ChatInput);
- `Kfj6B` (PreviewCard).
