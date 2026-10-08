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
  - `colors.ts`: token Mist; `colors` = light; `darkColors` disiapkan, toggle belum ada.
  - `typography.ts`: `fonts` + `textStyles` per peran, dipakai lewat `<Typography variant>`.
  - `metrics.ts`: `spacing`, `layout`, `radius`.
  - `shadows.ts`: card / nav / pop / thumb.
  - `tones.ts`: nada tile ikon.
  - Font Inter + Outfit (`src/assets/fonts`, tertaut via `react-native.config.js` +
    `npx react-native-asset`). Jangan memakai `fontWeight`, karena berat ditentukan oleh file font.
- **Komponen** (atomic, folder + `index.tsx`):
  - atoms: `PressableScale` (primitive tap tunggal), `Typography`, `Button`, `IconButton`,
    `LogoMark`, `Avatar`, `Badge`, `Gradient`.
  - molecules: `TextField`, `Card`, `Banner`, `EmptyState`, `MenuRow`, `MenuGroup`, `MenuTile`,
    `SegmentedControl`, `LanguagePill`.
  - organisms: `BottomSheet`, `ConfirmDialog`, `StatusModal` (pengganti `Alert.alert`),
    `LanguageSheet`, `TabBar`.
  - templates: `MainLayout`, `AuthLayout`, `PlaceholderLayout`.
  - Prop ikon berupa fungsi render `renderIcon(color, size?)`, supaya warna ikon mengikuti varian
    dan lolos aturan lint `no-unstable-nested-components`.
  - Hook shell: `useLogoutDialog` (konfirmasi keluar), `useLanguage` / `useLanguagePicker`.
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
  `scheduleReminder`, `cancelReminder`, `cancelAllReminders`) untuk pengingat Jadwal; belum
  disambungkan ke UI.
- **Kamera**: `react-native-vision-camera` v5 (butuh `react-native-nitro-modules` +
  `react-native-nitro-image`). API v5: `useCameraPermission()` +
  `<Camera device="back" isActive />`. Dipakai di `ScanReceipt` (pratinjau saja). Izin:
  `CAMERA` di AndroidManifest, `NSCameraUsageDescription` di Info.plist.
- **Ikon**: `lucide-react-native` (set ikon sama dengan web `react-icons/lu`).

## Status layar

| Layar | Status |
|---|---|
| Login, Register | Fungsional (API asli, validasi, StatusModal, info sesi berakhir) |
| Sheet Lainnya | Fungsional (profil, grid 6 menu, bahasa ID/EN/JP, keluar + konfirmasi) |
| Profile | Identitas + info akun + logout (konfirmasi) |
| Settings | Menu (Admin: Permintaan Pengguna, Log Error; Umum: Mata Uang) |
| ScanReceipt | Izin + pratinjau kamera |
| Dashboard, Transactions, Investment, Wallet, Categories, Schedule, Budgets, Reports, SettingsCurrency, SettingsUserApproval, SettingsErrorLog, QuickAdd | Placeholder (`PlaceholderLayout`), service sudah siap |

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
