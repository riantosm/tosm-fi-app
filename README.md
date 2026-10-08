# TosmFi (mobile)

Aplikasi pencatat keuangan pribadi TosmFi untuk Android & iOS. React Native CLI 0.87 +
TypeScript, backend `../tosm-fi-be`.

## Setup

```bash
npm install
cp .env.example .env              # isi API_BASE_URL
cd ios && bundle install && bundle exec pod install && cd ..
```

## Menjalankan

```bash
npm start                         # Metro
npm run android                   # atau: npm run ios
```

## Build APK

```bash
npm run android-d                 # debug
npm run android-r                 # release
```

APK otomatis tersalin ke `documentation/`. Catatan rilis ada di
`documentation/CHANGELOG.md` (render: `python3 documentation/regen-html.py`).

Konvensi kode: [`PROJECT_CONVENTIONS.md`](PROJECT_CONVENTIONS.md). Panduan untuk Claude Code: [`CLAUDE.md`](CLAUDE.md).
