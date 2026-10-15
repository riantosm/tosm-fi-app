import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

export type LogoMarkSize = 'xs' | 'sm' | 'md' | 'lg';

export interface LogoMarkProps {
  /** xs 20 · sm 32 (app bar, auth) · md 42 · lg 56. */
  size?: LogoMarkSize;
}

const SIZES: Record<LogoMarkSize, number> = { xs: 20, sm: 32, md: 42, lg: 56 };

// Geometri "TF" sama dengan web (tosm-fi-fe atoms/LogoMark) dan design/brand/logo-*.svg.
const T_PATH =
  'M345 345H909A78 78 0 0 1 909 501H809A144 144 0 0 0 665 645V891A71 71 0 0 1 523 891V571A70 70 0 0 0 453 501H345A78 78 0 0 1 345 345Z';
const PEACH_LEAF =
  'M809 529H977A10 10 0 0 1 987 539A145 145 0 0 1 842 684H793A128 128 0 0 0 693 732V645A116 116 0 0 1 809 529Z';
const LILAC_LEAF =
  'M793 712H910A10 10 0 0 1 920 722V735A125 125 0 0 1 795 860A128 128 0 0 0 693 911V812A100 100 0 0 1 793 712Z';
/** Batang T yang melengkung ke kanan atas (lebih terang dari sisi kiri palang). */
const T_FRONT = 'M523 615C523 470 620 352 775 345H1000V1000H500Z';

/** Satu-satunya bentuk logo di dalam app: ikon app (tile gradien lilac + "TF" putih, daun peach & lilac). */
export default function LogoMark({ size = 'sm' }: LogoMarkProps) {
  const box = SIZES[size];
  return (
    <Svg
      width={box}
      height={box}
      viewBox="0 0 1024 1024"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#C8CBFD" />
          <Stop offset="0.45" stopColor="#9297F7" />
          <Stop offset="1" stopColor="#5F62D6" />
        </LinearGradient>
        <RadialGradient id="sheen" cx="0.18" cy="0.12" r="0.75">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="back" x1="0" y1="0" x2="0.35" y2="1">
          <Stop offset="0" stopColor="#E6E8FD" />
          <Stop offset="1" stopColor="#BEC1F5" />
        </LinearGradient>
        <LinearGradient id="front" x1="0.2" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#DCDEFB" />
        </LinearGradient>
        <LinearGradient id="peach" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE6BA" />
          <Stop offset="1" stopColor="#F5BC72" />
        </LinearGradient>
        <LinearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FBFBFF" />
          <Stop offset="1" stopColor="#CDD0F7" />
        </LinearGradient>
        <ClipPath id="t">
          <Path d={T_PATH} />
        </ClipPath>
      </Defs>
      <Rect width={1024} height={1024} rx={260} fill="url(#bg)" />
      <Rect width={1024} height={1024} rx={260} fill="url(#sheen)" />
      <G transform="translate(512 512) scale(0.91) translate(-627 -653.5)">
        <G clipPath="url(#t)">
          <Path d={T_PATH} fill="url(#back)" />
          <Path d={T_FRONT} fill="url(#front)" />
        </G>
        <Path d={PEACH_LEAF} fill="url(#peach)" />
        <Path d={LILAC_LEAF} fill="url(#leaf)" />
      </G>
    </Svg>
  );
}
