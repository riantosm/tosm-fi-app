/**
 * Token warna Mist, sama dengan web tosm-fi-fe (src/css/index.css) dan
 * design/tosmfi-redesign.pen (01 Design System). Tabel lengkap: DESIGN_SYSTEM.md §2.
 *
 * Komponen TIDAK mengimpor palet ini langsung: ambil lewat `useTheme().colors` atau
 * `makeStyles(({ colors }) => …)` supaya ikut berganti light/dark. Bentuk `darkColors`
 * wajib sama persis dengan light.
 */
export const lightColors = {
  bg: '#F4F5FB',
  surface: '#FFFFFF',
  surface2: '#EFF0F8',
  surface3: '#E6E8F3',
  border: '#E3E5F1',
  borderStrong: '#D3D6E8',
  text: '#24263A',
  text2: '#565A75',
  text3: '#6E7290',

  primary: '#6A6DCD',
  primaryFg: '#FFFFFF',
  primarySoft: '#E8E9FA',
  primaryText: '#5357B8',

  income: '#8CCBB3',
  incomeSoft: '#E3F4EE',
  incomeText: '#2F7D62',
  expense: '#F2A7A0',
  expenseSoft: '#FDEBE9',
  expenseText: '#B84F4A',
  investment: '#F3C98B',
  investmentSoft: '#FCF1DF',
  investmentText: '#8F6116',
  cash: '#9DB4F0',
  cashText: '#4561B0',
  // warning = alias investment (pen: $warning / $warning-text)
  warning: '#F3C98B',
  warningSoft: '#FCF1DF',
  warningText: '#8F6116',

  heroBg: '#E6E7FB',
  heroBg2: '#F7E9F1',
  heroFg: '#23254A',
  heroFg2: '#5B5E8A',

  /** Tombol bulat di atas gradien hero (cari, tema). */
  heroControl: 'rgba(255, 255, 255, 0.5)',

  navActiveBg: '#E8E9FA',
  navActiveFg: '#4B4FB0',

  chart1: '#8B8EE0',
  chart2: '#F2A7A0',
  chart3: '#8CCBB3',
  chart4: '#F3C98B',
  chart5: '#9DB4F0',
  chart6: '#D3A6E0',
  /** Medali peringkat 2 & 3 (Top Pengeluaran Laporan); peringkat 1 = investment. */
  medalSilver: '#B7BACE',
  medalBronze: '#CF8E70',
  /** Blok kode (stack trace Log Error). */
  codeBg: '#2E3047',
  codeFg: '#D9DBF5',

  /** Teks/ikon di atas isian expenseText (Button danger). */
  onDanger: '#FFFFFF',
  /** Latar area media (pratinjau kamera, gambar penuh). */
  media: '#14152A',
  /** Warna netral transfer & koreksi saldo (setara web #8A94A0). */
  txNeutral: '#8A94A0',
  /** Teks/ikon di atas isian warna data user yang solid (monogram solid). */
  onData: '#FFFFFF',
  scrim: 'rgba(26, 27, 46, 0.45)',
  shadow: '#24263A',
  transparent: 'transparent',
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  bg: '#25263A',
  surface: '#2E3047',
  surface2: '#373A54',
  surface3: '#3F425E',
  border: '#42455F',
  borderStrong: '#4D5070',
  text: '#EEEFF8',
  text2: '#BFC1DA',
  text3: '#9A9DBA',

  primary: '#A3A6F5',
  primaryFg: '#1E1F38',
  primarySoft: '#3C3F66',
  primaryText: '#B4B6F8',

  income: '#95D5BD',
  incomeSoft: '#34494A',
  incomeText: '#A9E0CB',
  expense: '#F5B1AA',
  expenseSoft: '#4D3A49',
  expenseText: '#F8C0BA',
  investment: '#F5D29C',
  investmentSoft: '#4B4446',
  investmentText: '#F8DCB0',
  cash: '#AFC2F5',
  cashText: '#C0CFF8',
  warning: '#F5D29C',
  warningSoft: '#4B4446',
  warningText: '#F8DCB0',

  heroBg: '#3A3D66',
  heroBg2: '#45395E',
  heroFg: '#F4F4FF',
  heroFg2: '#C3C5E8',

  heroControl: 'rgba(255, 255, 255, 0.12)',

  navActiveBg: '#3C3F66',
  navActiveFg: '#D0D2FF',

  chart1: '#A3A6F5',
  chart2: '#F5B1AA',
  chart3: '#95D5BD',
  chart4: '#F5D29C',
  chart5: '#AFC2F5',
  chart6: '#DDB4EA',
  medalSilver: '#8D90AC',
  medalBronze: '#C98F72',
  codeBg: '#1F2034',
  codeFg: '#D9DBF5',

  onDanger: '#1E1F38',
  media: '#0A0A16',
  txNeutral: '#9AA3AE',
  onData: '#FFFFFF',
  scrim: 'rgba(10, 10, 22, 0.6)',
  shadow: '#000000',
  transparent: 'transparent',
};

export type ColorScheme = 'light' | 'dark';

export const palettes: Record<ColorScheme, ColorTokens> = {
  light: lightColors,
  dark: darkColors,
};
