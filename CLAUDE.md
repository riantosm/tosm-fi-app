# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repo ini. **Wajib di-update** setiap ada fitur, layar,
atau konvensi baru. Konvensi lengkap (struktur folder, penamaan, CHANGELOG, alur rilis) ada di
[`PROJECT_CONVENTIONS.md`](PROJECT_CONVENTIONS.md); ikuti dokumen itu.

**Tampilan wajib mengikuti [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md)** (token, tipografi, kerangka
layar HP, spesifikasi komponen, indeks frame pen). Baca dokumen itu sebelum membuat atau mengubah
layar/komponen. Kalau kode berbeda dari pen, ikuti pen; daftar selisih yang diketahui ada di §11.

## Batasan (WAJIB)

Hal berikut **DILARANG** kecuali user menyuruhnya secara eksplisit di chat. Izin hanya berlaku
untuk perintah yang disebut, bukan izin umum untuk seterusnya:

- ❌ **Build apa pun**: `npm run android`, `npm run ios`, `npx react-native run-*`,
  `./gradlew assemble*` / `npm run android-d` / `android-r`, `xcodebuild`.
- ❌ **Menjalankan emulator / simulator** atau menginstal ke device.
- ❌ **Menjalankan Metro**: `npm start`, `npx react-native start`.
- ❌ **`pod install`**.
- ❌ **`git commit` / `git push`**.

Boleh tanpa izin: membuat/mengedit file, `npm install`, `npx tsc --noEmit`, `npm run lint`.
Perintah build/run cukup **dituliskan** untuk user.

## Commands

```bash
npx tsc --noEmit                 # type-check
npm run lint                     # eslint
python3 documentation/regen-html.py   # render CHANGELOG.md → changelog.html

# Dijalankan user sendiri (lihat Batasan):
cd ios && bundle install && bundle exec pod install && cd ..
npm start                        # Metro
npm run android | npm run ios
npm run android-d | android-r    # assemble APK → otomatis tersalin ke documentation/
npm run android-c                # gradlew clean
```

## Project

**TosmFi**: versi mobile (React Native CLI 0.87, TypeScript, New Architecture) dari web app
`../tosm-fi-fe`, dengan backend `../tosm-fi-be` (Express/Mongo) yang sama. Package
`com.tosm.finance`, module native `TosmFiApp`, folder `tosm-fi-app`. Versi 1.0.0 (versionCode 1).

Web adalah acuan perilaku & API: saat mem-port layar, baca halaman/hook/layout web yang sesuai
(`tosm-fi-fe/src/app/pages`, `src/hooks`, `src/layouts`) beserta `tosm-fi-fe/CLAUDE.md`, lalu
tulis ulang dengan komponen RN di sini. Desain: Mist, lihat `DESIGN_SYSTEM.md` (sumber:
`../design/tosmfi-redesign.pen`, frame `… / HP`).

## Arsitektur

- **Alias `@/` → `src/`** di `tsconfig.json` (`paths`, tanpa `baseUrl` karena TS 6) **dan**
  `babel.config.js` (module-resolver). Plugin `react-native-worklets/plugin` wajib paling akhir.
- **Env**: `react-native-config`, `API_BASE_URL` di `.env` (di-gitignore; contoh di
  `.env.example`). Sekarang `https://tosm-fi-be.vercel.app/api` (backend produksi). Backend lokal:
  `http://10.0.2.2:3000/api` (emulator Android) / `http://localhost:3000/api` (simulator iOS).
  Ubah `.env` perlu rebuild native.
- **Navigasi** (`src/navigation/`): `ROUTES` di `paths.ts` satu-satunya sumber nama route.
  `RootNavigator` = native stack; guard auth memakai grup kondisional (`isLogin` →
  grup RequireAuth, selain itu grup RequireGuest Login/Register). Login/logout otomatis pindah
  grup, jangan `navigate` manual setelahnya. Layar admin (`SettingsUserApproval`,
  `SettingsErrorLog`) hanya terdaftar kalau `user.role === 'admin'`. `QuickAdd` & `ScanReceipt`
  dibuka sebagai modal.
- **Bottom nav global** (`navigation/AppBottomNav.tsx`, dirender di `App.tsx` dalam
  `NavigationContainer`): Beranda · Transaksi · AI tengah (`QuickAdd`) · Investasi · Lainnya.
  - Tampil di semua layar login kecuali `ROUTES_WITHOUT_NAV` (modal + auth).
  - Route aktif dilacak dari `navigationRef` (`onStateChange`).
  - `MainTabNavigator` hanya mengatur 3 tab (tab bar bawaannya disembunyikan).
  - Slot Lainnya membuka sheet `MoreMenuSheet`, bukan halaman, dan tetap ditandai aktif di
    `MORE_ROUTES`. Pindah antar-halaman Lainnya memakai `StackActions.replace` supaya stack tidak
    menumpuk.
  - Setiap layar yang tampil bersama nav memakai `MainLayout withTabBar` (ruang bawah 130).
  - Halaman menu (Dompet, Kategori, Jadwal, Budget, Laporan, Pengaturan) memakai LogoMark tanpa
    tombol kembali. Sub-halaman (Profil, Mata Uang, admin) memakai `onBack`.
- **Data lintas layar**: slice `wallet`, `category`, `budget`, `instrument`, `scheduleOccurrence`
  (direset saat logout lewat `resetOnSignOut`) dan hook `useWallets` / `useCategories` / `useBudgets` /
  `useInstruments` / `useScheduleOccurrences` (muat otomatis saat `idle`). Transaksi TIDAK disimpan:
  `useTransactions()` memberi `queryTransactions` + mutasi, dan `transaction.version` jadi sinyal
  refetch (setara array `transactions` di web). Format uang: `useMoneyFormat()` (`format`,
  `formatNumber`, `formatCompact` buatan sendiri, `formatSigned`).
- **Toast** (`contexts/ToastContext.tsx`): `const showToast = useToast(); showToast(msg, 'success' | 'error' | 'info')`.
  Toast dirender oleh `ToastHost` di `App.tsx` (melayang di atas bottom nav). Modal/route sheet ada di
  window native terpisah, jadi `SheetLayout` memasang `ToastHost` sendiri (posisi atas); hanya host yang
  terakhir terpasang yang merender toast. Feedback singkat
  (simpan/hapus berhasil, error jaringan) memakai toast; konfirmasi tetap memakai `ConfirmDialog`.
- **Back Android** (`hooks/useBackToExit.ts`): selama navigasi masih bisa kembali (stack,
  tab → Beranda, sheet/modal) back ditangani navigasi. Di layar paling awal, back pertama
  menampilkan toast "Ketuk sekali lagi untuk keluar", dan back kedua dalam 2 detik menutup app.
- **Sheet**: `templates/SheetLayout` = satu tampilan sheet (scrim, handle, judul/subjudul, back, aksi,
  isi scroll, footer tetap). `organisms/BottomSheet` = SheetLayout dalam Modal (pemilih). Form besar
  (Catat transaksi, Bayar tagihan) = route `presentation: 'transparentModal'` yang memakai SheetLayout.
  Pemilih siap pakai: `AmountCalculatorSheet`, `SelectCategorySheet`, `SelectSubCategorySheet`,
  `DateTimePickerSheet`, `DateRangeSheet`, `InvestmentTargetSheet`, `OptionSheet`.
- **Mutasi transaksi** (`useTransactions`): setelah API sukses, sinkron dompet/kategori jalan di latar
  belakang (tidak di-await) supaya form langsung tertutup.
- **Menambah layar** = 4 tempat: `ROUTES` → `RootStackParamList` (`navigation/types.ts`) →
  `RootNavigator` → `screens/<Nama>/index.tsx`.
- **State**: Redux Toolkit + redux-persist (AsyncStorage). Persist whitelist hanya `auth`
  (token + user + flag `sessionExpired`) dan `settings` (currency, decimalPlaces, language;
  `language: null` = ikuti bahasa perangkat). Data domain tidak di-persist; buat slice hanya kalau
  dipakai lintas layar, selain itu state lokal + panggil service langsung.
- **API** (`src/services/api/`): satu `axiosInstance` (Bearer token dari store, `tzOffsetMinutes`
  otomatis di setiap GET, 401 saat sedang login → `onSessionExpired`). Envelope backend
  `{ message, data, isSuccess, status }` → tipe `ApiResponse<T>`. Fungsi service bernama
  `<aksi><Resource>Api`, error dibungkus `new Error(getApiErrorMessage(error, i18n.t(...)))`.
  Semua domain web sudah di-port (tipe + service): auth, wallet, category, transaction,
  instrument, investmentTransaction, report, schedule, scheduleOccurrence, budget, assistant,
  account, clientError, userApproval. Settings murni lokal (tidak ada service).
- **Auth** (`hooks/useAuth.ts`): `login` = `loginApi` lalu `getMeApi(token)`; baru dispatch
  `onLogin` kalau keduanya sukses (user `pending` ditolak oleh /user/me 403, sama dengan web).
  `logout` memanggil `/auth/logout` best-effort dan selalu membersihkan state + membatalkan
  semua pengingat. `useSessionBootstrap` menyegarkan user dari /user/me saat app dibuka.
- **i18n** (`src/i18n/`): i18next + react-i18next, bahasa `id` (fallback) / `en` / `jp`. Locale
  disalin dari web (`tosm-fi-fe/src/helpers/lang`, tanpa grup `apiDoc` & `footer`) supaya key
  sama saat mem-port layar. Grup `placeholder` khusus mobile. Tambah key di **ketiga** file.
  Semua teks UI lewat `t()`, tanpa string hardcoded.
- **Theme** (`src/theme/`): ikuti `DESIGN_SYSTEM.md`.
  - `colors.ts`: palet `lightColors` / `darkColors` (bentuk wajib sama). **Tidak ada ekspor statis `colors`.**
  - Dark/light: `contexts/ThemeContext.tsx` (`ThemeProvider`, `useTheme()`), preferensi
    `settings.theme` (`system`/`light`/`dark`, persisted). Style komponen WAJIB dibuat dengan
    `makeStyles(({ colors, shadows }) => …)` (`theme/makeStyles.ts`, cache per skema); warna
    dinamis lewat `useTheme().colors` / `.tones`.
  - `typography.ts`: `fonts` + `textStyles` per peran, dipakai lewat `<Typography variant>`.
  - `metrics.ts`: `spacing`, `layout`, `radius`.
  - `shadows.ts`: `createShadows(colors)` → card / nav / pop / thumb.
  - `tones.ts`: `createTones(colors)` → nada tile ikon.
  - Font Inter + Outfit (`src/assets/fonts`, tertaut via `react-native.config.js` +
    `npx react-native-asset`). Jangan memakai `fontWeight`, karena berat ditentukan oleh file font.
- **Komponen** (atomic, folder + `index.tsx`):
  - atoms: `PressableScale` (primitive tap tunggal), `Typography`, `Button` (size `sm` untuk aksi
    app bar), `IconButton`, `LogoMark`, `Avatar`, `Badge`, `Gradient`, `WalletTile`, `ColorWheel`,
    `AiMark` (identitas AI: lingkaran `primary` + sparkles, xs/sm/md/lg), `Reveal` (animasi masuk ringan).
  - molecules/organisms tambahan: `OptionRow` (kartu radio), `SettingsPanel` (kartu bertile ikon),
    `InvestmentDateTimeField` (Tanggal + Jam berbagi satu `DateTimePickerSheet`). `PickerField`
    boleh tanpa label (label kosong).
  - molecules: `TextField`, `Card`, `Banner`, `EmptyState`, `MenuRow`, `MenuGroup`, `MenuTile`,
    `SegmentedControl` (teks atau ikon), `LanguagePill`, `ThemeToggleButton`.
  - organisms: `BottomSheet`, `ConfirmDialog`, `StatusModal` (pengganti `Alert.alert`),
    `LanguageSheet`, `TabBar`, `ColorPicker`, `CustomColorSheet`, `ReorderList` (dipakai juga
    nanti untuk Budget; varian `inset` tanpa panah untuk subkategori), `ActionSheet` (menu ⋮),
    `CategoryIconSheet`, `CategoryFormSheet`, `SubCategoryFormSheet`, `SelectCategoriesSheet`,
    `InvestmentTransactionList`. molecules baru: `AreaChart` (grafik area SVG ringan, kurva
    monoton, label sumbu X berjarak piksel), `ProfitLossPill`, `InvestmentAccountSummary`,
    `AmountField` (field nominal + kalkulator), `CheckboxRow`, `BudgetProgressBar`,
    `BudgetPercentBadge`. Helper grafik bersama di `utils/chart.ts` (`monotonePath`, `niceTicks`,
    `pickLabelIndexes`). `SegmentedControl` varian `solid` (nilai di luar opsi = tanpa thumb),
    `EmptyState` varian `inset` (kosong di dalam kartu).
  - Sinyal mutasi investasi: `transaction.investmentVersion` (`bumpInvestmentVersion`), dipakai
    `useInvestmentTransactions` / `useInvestmentData` (timeline, nilai bersih, tanggal pertama). Atom `CategoryIcon`
    (lingkaran `${warna}26` + ikon).
  - `BottomSheet`: back Android saat keyboard terbuka hanya menutup keyboard (sheet tetap).
  - Keyboard di sheet: Android edge-to-edge tidak me-resize window, jadi `SheetLayout` menambah
    padding bawah setinggi keyboard (`hooks/useKeyboardHeight`); iOS tetap `KeyboardAvoidingView`.
  - templates: `MainLayout`, `AuthLayout`, `PlaceholderLayout`.
  - Prop ikon berupa fungsi render `renderIcon(color, size?)`, supaya warna ikon mengikuti varian
    dan lolos aturan lint `no-unstable-nested-components`.
  - Hook shell: `useLogoutDialog` (konfirmasi keluar), `useLanguage` / `useLanguagePicker`,
    `useThemePreference`.
- **Satu salinan React (WAJIB)**: `moti` → `framer-motion@6` → `react-dom` terbaru, yang menarik
  React kedua ke `node_modules/moti/node_modules/react`, sehingga app crash `Cannot read property
  'useContext' of null` di Moti. Dicegah oleh `overrides.framer-motion` di `package.json`
  (`react: $react`, `react-dom` = versi React app). Saat menaikkan versi React, naikkan juga
  `react-dom` di overrides. Cek: `find node_modules -path "*/node_modules/react/package.json"` hanya
  boleh menemukan `node_modules/react`.
- **Animasi**: Reanimated 4 + react-native-worklets + moti. Preset di `utils/motion.ts`
  (`springs`, `transitions`, `fadeInUp`, `fadeIn`). Transisi moti **harus** lewat
  `transitions.*` karena tipe moti 0.30 belum cocok dengan Reanimated 4 (sudah di-cast di sana).
- **Notifikasi lokal**: `@notifee/react-native` tanpa Firebase.
  `services/notification/scheduleReminder.ts` (`requestNotificationPermission`,
  `scheduleReminder`, `syncScheduleReminders`, `cancelAllReminders`). `hooks/useScheduleReminders`
  (dipanggil di AppShell) memuat jadwal saat login dan memasang satu pengingat jam 08.00 di jatuh
  tempo berikutnya untuk tiap jadwal aktif (id `schedule-<idSchedule>`; yang dijeda/dihapus
  dibatalkan). Alarm `SET_AND_ALLOW_WHILE_IDLE` (tanpa izin exact alarm). Izin notifikasi diminta
  saat jadwal pertama dibuat. `index.js` mendaftarkan `notifee.onBackgroundEvent` (no-op).
- **Kamera**: `react-native-vision-camera` v5 (butuh `react-native-nitro-modules` +
  `react-native-nitro-image`). API v5: `useCameraPermission()` +
  `<Camera device="back" isActive />`. Dipakai di `ScanReceipt` (pratinjau saja). Izin:
  `CAMERA` di AndroidManifest, `NSCameraUsageDescription` di Info.plist.
- **Ikon**: `lucide-react-native` (set ikon sama dengan web `react-icons/lu`).
- **Export file** (`utils/reportExport.ts`): file dibuat di JS (versi library sama dengan web) lalu
  dibagikan sebagai data URI base64 lewat `react-native-share` (`filename` tanpa ekstensi; ekstensi
  dari mime). `metro.config.js` menjadikan `html2canvas`/`dompurify`/`canvg` modul kosong karena
  jsPDF hanya memakainya untuk fitur HTML/SVG; ubah config ini butuh restart Metro. Library
  di-import statis (`import()` dinamis gagal di Metro dev: "Requiring unknown module"; inlineRequires
  sudah membuat modul baru dijalankan saat dipakai). Share memakai `useInternalStorage: true`, karena
  FileProvider react-native-share hanya mencakup cache internal.
- **Keyboard (WAJIB untuk layout baru)**: Android edge-to-edge tidak me-resize window. `MainLayout`,
  `AuthLayout`, dan `SheetLayout` memendekkan area scroll setinggi keyboard (`useKeyboardHeight`)
  lalu `hooks/useRevealFocusedInput` menggulir input yang fokus ke atas keyboard (diukur dua kali,
  80 & 400 ms, karena sheet ikut memendek). Layar dengan ScrollView sendiri harus memakai pola sama.
- **Performa (diukur dengan profiler Hermes lewat inspector Metro)**:
  - `index.js` → `enableFreeze(true)` + tab `freezeOnBlur`: layar tak terlihat tidak ikut dirender ulang.
  - `PressableScale` memakai `Animated` bawaan + native driver (bukan worklet per instance).
  - Animasi masuk konten: `atoms/Reveal` (layout animation `entering`), **jangan** `<MotiView {...fadeInUp}>`.
    Moti tetap untuk animasi state (thumb, sheet, rotasi).
  - Format angka/tanggal lewat `utils/intl.ts` (`numberFormat`, `dateTimeFormat`, cache), jangan
    `new Intl.*` / `toLocaleDateString` langsung.
  - Context yang sering berubah dipisah state vs aksi (contoh `MoreSheetContext`), `RootNavigator`
    di-`memo`, daftar berat (`TransactionList`, `TransactionCalendar`, `MonthTabs`, `SummaryBar`)
    di-`memo` dengan prop stabil (`useMemo`/`useCallback`) di layar induk.
  - Build debug 2–4× lebih lambat (React DEV `createTask`, error stack); nilai performa di build release.

## Status layar

| Layar | Status |
|---|---|
| Login, Register | Fungsional (API asli, validasi, StatusModal, info sesi berakhir) |
| Sheet Lainnya | Fungsional (profil, grid 6 menu, tema Terang/Gelap/Ikuti sistem, bahasa ID/EN/JP; logout hanya di Profil) |
| Profile (Edit Profil) | Fungsional (pen `S5xzK`/`eCXQt`): identitas bergradien (avatar, @username, peran), Informasi Akun (nama/username + konfirmasi simpan, `useAuth().updateProfile`), Ubah Password (validasi min 6 & konfirmasi, sukses → sesi dibersihkan & kembali ke Login, `changePassword`), tombol Keluar (satu-satunya tempat logout) |
| Settings | Fungsional (pen `k0SKz`): Admin (Permintaan Pengguna + badge "n baru" dari `hooks/useUserApproval`, Log Error), Umum (Mata Uang + ringkasan), Zona Berbahaya Reset Data (konfirmasi → `resetAccountDataApi` + aksi `accountDataReset` yang mengosongkan semua slice data akun). "Backend API" web sengaja tidak dibawa |
| ScanReceipt | Izin + pratinjau kamera. Belum ada pintu masuk (tombolnya dulu di placeholder QuickAdd; Catat cepat versi pen/web tidak punya scan struk) |
| Dashboard | Fungsional (pen `yHRM4`): hero (kekayaan bersih, sembunyikan saldo, cari, tema, avatar → sheet Lainnya), budget di-pin, ringkasan bulan (bar), kesehatan finansial, pengeluaran per kategori (donut + drill-down), dompet (tap → jadikan utama; tap dompet utama → koreksi saldo; Tambah dompet → form), transaksi bulan ini (infinite scroll), batalkan tagihan, pull-to-refresh. Tap baris → edit transaksi, Bayar tagihan, bar/kategori/cari → buka Transaksi dengan filter. |
| Transactions | Fungsional (pen `PIoO4`): tab bulan, ringkasan, header hanya Cari + Filter; sheet Filter (`screens/Transactions/FilterSheet`: dompet, tipe, kategori → sub, rentang tanggal, urutan; draf diterapkan dengan "Terapkan", angka filter aktif di ikon) + banner aktif (`ActiveFilterBanner`), kalender bertitik (tap = filter hari), cari (debounce 1 dtk), daftar infinite scroll, bayar/batal tagihan, menerima filter awal lewat params `TransactionsParams` |
| TransactionForm (route modal) | Catat/edit: 3 tipe (transfer + tukar dompet), subkategori cepat, kalkulator, kategori/subkategori, tanggal & jam, dompet, catat sebagai investasi, duplikat, hapus. Dibuka via `navigate(ROUTES.TRANSACTION_FORM, { transaction? })`; dari Catat cepat lewat "Catat manual". Pemilih kategori punya tile "Baru" dan pemilih subkategori punya "Subkategori baru" (langsung terpilih setelah dibuat) |
| PayOccurrence (route modal) | Bayar/terima tagihan jadwal |
| Wallet | Fungsional (pen `cnoOe`/`YYZ1Z`/`PWG8l`/`ZcRnk`): ringkasan total + bar porsi, tampilan grid/list (`settings.walletViewMode`, persisted), atur urutan (seret grip ⠿ atau panah, `organisms/ReorderList`), kosong, pull-to-refresh. Tap dompet → WalletForm |
| WalletForm (route modal) | Tambah/edit dompet (pen `KiasV`/`nrR3J`): pratinjau, nama, saldo awal (baru saja), warna preset + "Warna custom" (`organisms/ColorPicker` → `CustomColorSheet` + `atoms/ColorWheel`), jadikan utama (bintang), hapus (konfirmasi). Petunjuk saldo → ganti ke Koreksi saldo |
| BalanceCorrection (route modal) | Koreksi saldo (pen `kdRVQ`): params `{ idWallet, transaction? }`, kalkulator dari saldo dompet, pill selisih, tanggal, catatan, simpan/edit/hapus transaksi `correction`. Dibuka dari dompet utama (Dashboard), petunjuk saldo (WalletForm), dan baris koreksi di daftar transaksi (`navigation/openTransaction.ts`) |
| Categories | Fungsional (pen `auPuW`/`y0vxv`/`ZVCxG`): tab Semua/Pengeluaran/Pemasukan, kartu kategori + pill subkategori (muat satu baris, "+N", "+"), menu ⋮ (`organisms/ActionSheet`: edit/hapus), atur urutan, kosong, pull-to-refresh. Form: `organisms/CategoryFormSheet` (jenis, ikon `CategoryIconSheet`, nama, warna, daftar subkategori seret/edit/hapus), `organisms/SubCategoryFormSheet` |
| Schedule | Fungsional (pen `a0SVGi`/`go3lT`): jatuh tempo berikutnya, keluar/masuk rutin per bulan, seksi Aktif/Dijeda, kartu jadwal (jeda/aktifkan, edit, hapus + konfirmasi), kosong, pull-to-refresh. Logika aturan ulang di `utils/schedule.ts` (port schedule-utils web) |
| ScheduleForm (route modal) | Tambah/edit jadwal (pen `nHHvn`/`W9TVu`): jenis, kategori/subkategori, nominal, judul, dompet, ulangi (harian/mingguan + pilih hari/bulanan/tahunan), tanggal mulai, pratinjau + catatan pengingat, catatan |
| Budgets | Fungsional (pen `Lu9SC`/`JqSyG`): kartu budget (terpakai/limit, persen, bar + penanda "Hari ini", sisa per hari, pin), atur urutan, kosong, pull-to-refresh. Tap kartu → BudgetDetail |
| BudgetDetail | Hero (terpakai, limit, bar, sisa/per hari/hari lagi), pin/lepas Dashboard, edit, "Per kategori" + subkategori (expand), sheet "Atur limit" (`screens/BudgetDetail/SetLimitSheet`, 0 = hapus limit). Dibuka juga dari budget di Dashboard |
| BudgetForm (route modal) | Tambah/edit/hapus budget (pen `O98YEF`): nama, cakupan semua/kategori tertentu (`organisms/SelectCategoriesSheet`, multi-pilih + kategori baru), limit, warna |
| Investment (tab) | Fungsional (pen `Q1BjKl`/`dZKTE`): hero nilai + P/L vs modal + periode Bulan ini/Tahun ini/Semua + grafik area (`molecules/AreaChart`, SVG), daftar instrumen (sparkline bergradasi, urutkan nilai/kenaikan via OptionSheet), filter portofolio (chip instrumen multi-pilih → hero, grafik `useNetWorthTimeline(..., idInstruments)`, total, daftar), ledger investasi (cari, chip tipe + chip instrumen pilih-satu, infinite scroll), transfer antar akun, kosong. Grafik hero & riwayat instrumen: tap = tooltip (`AreaChart renderTooltip`, kartu pindah ke bawah bila titik di separuh atas). Tap baris ledger → edit transaksi |
| InstrumentDetail | Ringkasan akun terpilih (ketuk kartu akun untuk memilih), grafik riwayat nilai vs modal (Hari/Bulan/Tahun), kartu akun (Edit/Tarik/P/L), ledger instrumen + filter tipe |
| Form investasi (route modal) | InstrumentForm (tambah → langsung buka detail; hapus), InvestmentAccountForm (instrumen terkunci; hapus = soft delete), InvestmentWithdraw (opsional setor ke dompet = transaksi pemasukan), InvestmentProfitLoss (nilai baru → profit/rugi), InvestmentTransfer (dari/ke via `InvestmentTargetSheet` + `excludeAccountId`, pratinjau saldo; picker punya tile "+ Baru" & "Akun baru" yang membuat lalu langsung memilih; isi form dibagi `organisms/InstrumentFields` & `InvestmentAccountFields` dengan layar form), InvestmentTransactionEdit (nominal, perubahan negatif untuk P/L, tanggal/jam, catatan untuk tarik; hapus). Tarik/Transfer/Update nilai/Edit punya Tanggal & Jam (`organisms/InvestmentDateTimeField`) untuk entri bertanggal mundur; Update nilai membandingkan dengan nilai akun per tanggal itu (`timelineValueAt`, sama dengan backend `198866f`) |
| Reports | Fungsional (pen `S5YW9`/`CaSg9`): strip periode Hari/Minggu/Bulan/Tahun + custom range (`DateRangeSheet`), ringkasan 2 × 2 + perubahan vs periode lalu, Cash Flow (tap = tooltip, legenda sembunyikan seri, kumulatif/per periode), pengeluaran per kategori, Tren Bulanan 12 bulan (tap batang), Top Pengeluaran, Dompet Paling Aktif, pull-to-refresh. Data: `hooks/useReports` (satu endpoint per kartu, muat ulang saat `transaction.version` berubah), periode `utils/reportPeriod.ts`. Export (tombol unduh di header → `screens/Reports/ReportExportSheet`, pen `MVyzc`): `hooks/useReportExport` menyusun dokumen yang sama dengan web (daftar transaksi periode dimuat saat export), `utils/reportExport.ts` membuat PDF (jsPDF + autotable) / Excel (SheetJS `xlsx`) / CSV sebagai base64 lalu `react-native-share` membuka share sheet |
| QuickAdd (Catat cepat AI, modal) | Fungsional (pen `E5vp0` dkk.): chat ke `POST /assistant/chat` → pratinjau draft per hari (`screens/QuickAdd/AssistantPreviewCard`, tampilan TxRow sama dengan Transaksi/ledger investasi) → Simpan (`POST /assistant/commit`, satu batch) / Batal, juga lewat chat ("ok, catat"). Jawaban cepat (dompet bertitik warna, "Pilih tanggal" → `DateTimePickerSheet`), revisi dengan chip "lama → baru", validasi per baris, banner kuota/koneksi + Coba lagi, Mulai baru, Catat manual (ganti ke TransactionForm). State di `contexts/AssistantChatContext` (`hooks/useAssistantChat`, port web) supaya chat bertahan saat layar ditutup; direset saat logout |
| SettingsCurrency | Fungsional (pen `TPJ9e`): pilih mata uang (IDR/USD/JPY) + format desimal 0/1/2 dengan contoh per opsi & pratinjau (`molecules/OptionRow`, `organisms/SettingsPanel`), disimpan di `settings` |
| SettingsUserApproval (admin) | Fungsional (pen `DaxsW`): jumlah menunggu/aktif, daftar pendaftaran (menunggu di atas) + Aktifkan, pull-to-refresh |
| SettingsErrorLog (admin) | Fungsional (pen `IMPbc`): cari (debounce 400 ms), filter environment, kartu error (Baru/environment, pesan mono, meta, stack trace bisa dibuka), hapus + konfirmasi. GET /errors menandai sudah dibaca, jadi kueri sama tidak diulang |

## Ukuran APK (R8, shrink, ABI)

APK release 123,7 MB → 24,1 MB (2026-10-08) tanpa membuang fitur. Konfigurasinya:
- `android/app/build.gradle`: `enableProguardInReleaseBuilds = true` (R8 + `shrinkResources`),
  `androidResources.localeFilters = ["en", "in", "ja"]` (hanya terjemahan library; UI lewat i18n
  JS), `packaging.jniLibs.useLegacyPackaging true` (`.so` dikompres, manifest jadi
  `extractNativeLibs=true`).
- `android/gradle.properties`: `reactNativeArchitectures=armeabi-v7a,arm64-v8a` (tanpa x86;
  emulator di Mac Apple Silicon = arm64).
- `android/app/proguard-rules.pro`, setiap rule wajib:
  - `com.tosm.finance.BuildConfig` (react-native-config, `Class.forName`). Tanpa ini `API_BASE_URL` kosong.
  - `com.margelo.nitro.**` (vision-camera v5: implementasi Hybrid dipanggil dari C++ lewat JNI). Ongkosnya hanya ~40 KB.
  - Target `Class.forName` milik Fresco (`*MemoryChunkPool`, `nativecode`, `animated`, `webpsupport`).
    Tanpa ini **semua `<Image>` kosong di release tanpa error apa pun**. Gejalanya kotak logo di Login kosong.
- `res/raw/keep_tosmfi.xml`: `tools:keep` untuk `string/build_config_package`, karena dibaca
  react-native-config lewat `getIdentifier`. Jangan menamai file ini `keep.xml`.
- Library native baru → cek rule ProGuard di README-nya dan uji **release** (debug tidak menjalankan
  R8). Verifikasi dengan `/resize-rn` (`apk_size.py check/breakdown/manifest-diff`). Saat build untuk
  mengukur: `./gradlew assembleRelease -x copyReleaseApkToChangelog` supaya `documentation/` tidak tertimpa.

## Rilis & dokumentasi

Ikuti `PROJECT_CONVENTIONS.md` §5: perubahan yang terlihat user → bullet di
`documentation/CHANGELOG.md` bagian `## Belum dirilis` di commit yang sama. Saat rilis: naikkan
`versionName`/`versionCode` di `android/app/build.gradle` (dan `MARKETING_VERSION` /
`CURRENT_PROJECT_VERSION` iOS), jalankan `regen-html.py`, lalu git tag `v<versi>`. APK otomatis
tersalin ke `documentation/` sebagai `TosmFi-v<versi>(<code>)-<buildType>.apk` (di-gitignore).
