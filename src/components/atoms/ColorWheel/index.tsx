import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { makeStyles } from '@/theme/makeStyles';
import { radius } from '@/theme/metrics';
import { hexToHsv, hsvToHex, type Hsv } from '@/utils/color';

export interface ColorWheelProps {
  value: string;
  onChange: (hex: string) => void;
}

const RING_SIZE = 240;
const RING_THICKNESS = 24;
const RING_RADIUS = RING_SIZE / 2 - RING_THICKNESS / 2;
/** Persegi terbesar di dalam lubang cincin, dikurangi sedikit ruang. */
const SQUARE_SIZE =
  Math.floor((RING_SIZE - RING_THICKNESS * 2) / Math.SQRT2) - 10;
const SQUARE_OFFSET = (RING_SIZE - SQUARE_SIZE) / 2;
const SEGMENTS = 90;
const CENTER = RING_SIZE / 2;

const hueColor = (hue: number) => hsvToHex(hue % 360, 100, 100);
/** Tampilan cincin dibuat pastel seperti pen (palet lembut); nilai hue tetap sama. */
const ringColor = (hue: number) => hsvToHex(hue % 360, 58, 96);

/** Cincin hue dari banyak busur kecil (SVG tidak punya conic gradient). */
function buildRingSegments() {
  const step = 360 / SEGMENTS;
  return Array.from({ length: SEGMENTS }, (_, index) => {
    // Sedikit tumpang-tindih supaya tidak ada garis tipis antar-busur.
    const start = ((index * step - 90 - 0.6) * Math.PI) / 180;
    const end = (((index + 1) * step - 90) * Math.PI) / 180;
    const x1 = CENTER + RING_RADIUS * Math.cos(start);
    const y1 = CENTER + RING_RADIUS * Math.sin(start);
    const x2 = CENTER + RING_RADIUS * Math.cos(end);
    const y2 = CENTER + RING_RADIUS * Math.sin(end);
    return {
      d: `M ${x1} ${y1} A ${RING_RADIUS} ${RING_RADIUS} 0 0 1 ${x2} ${y2}`,
      color: ringColor(index * step + step / 2),
    };
  });
}

const useStyles = makeStyles(({ colors }) => ({
  root: { width: RING_SIZE, height: RING_SIZE, alignSelf: 'center' },
  square: {
    position: 'absolute',
    left: SQUARE_OFFSET,
    top: SQUARE_OFFSET,
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    overflow: 'hidden',
    borderRadius: radius.control,
  },
  ringThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: colors.onData,
    shadowColor: colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  squareThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    marginLeft: -9,
    marginTop: -9,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.onData,
  },
}));

/**
 * Pemilih warna (pen `Warna custom`): cincin hue + persegi saturasi/kecerahan.
 * Nilai awal dibaca sekali — hue tidak bisa dipulihkan dari hitam/putih murni.
 */
export default function ColorWheel({ value, onChange }: ColorWheelProps) {
  const styles = useStyles();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const segments = useMemo(buildRingSegments, []);
  const latest = useRef({ hsv, onChange });
  latest.current = { hsv, onChange };

  const apply = (next: Hsv) => {
    setHsv(next);
    latest.current.onChange(hsvToHex(next.h, next.s, next.v));
  };
  const applyRef = useRef(apply);
  applyRef.current = apply;
  // Titik awal sentuhan (gerakan = titik awal + dx/dy; locationX berubah acuan di atas thumb).
  const ringStart = useRef({ x: 0, y: 0 });
  const squareStart = useRef({ x: 0, y: 0 });

  const ringResponder = useMemo(() => {
    const pick = (x: number, y: number) => {
      const angle = (Math.atan2(y - CENTER, x - CENTER) * 180) / Math.PI;
      applyRef.current({ ...latest.current.hsv, h: (angle + 90 + 360) % 360 });
    };
    return PanResponder.create({
      // Hanya pita warna yang memilih hue, bukan ruang kosong di sekitar persegi.
      onStartShouldSetPanResponder: event => {
        const { locationX, locationY } = event.nativeEvent;
        return (
          Math.hypot(locationX - CENTER, locationY - CENTER) >=
          RING_SIZE / 2 - RING_THICKNESS - 6
        );
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: event =>
        pick(event.nativeEvent.locationX, event.nativeEvent.locationY),
      onPanResponderMove: (_, gesture) => {
        const start = ringStart.current;
        pick(start.x + gesture.dx, start.y + gesture.dy);
      },
    });
  }, []);

  const squareResponder = useMemo(() => {
    const pick = (x: number, y: number) => {
      const clampedX = Math.min(Math.max(x, 0), SQUARE_SIZE);
      const clampedY = Math.min(Math.max(y, 0), SQUARE_SIZE);
      applyRef.current({
        ...latest.current.hsv,
        s: (clampedX / SQUARE_SIZE) * 100,
        v: 100 - (clampedY / SQUARE_SIZE) * 100,
      });
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: event => {
        squareStart.current = {
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
        };
        pick(squareStart.current.x, squareStart.current.y);
      },
      onPanResponderMove: (_, gesture) =>
        pick(
          squareStart.current.x + gesture.dx,
          squareStart.current.y + gesture.dy,
        ),
    });
  }, []);

  const thumbAngle = ((hsv.h - 90) * Math.PI) / 180;
  const pureHue = hueColor(hsv.h);
  const current = hsvToHex(hsv.h, hsv.s, hsv.v);

  return (
    <View style={styles.root}>
      <View
        style={StyleSheet.absoluteFill}
        onTouchStart={event => {
          ringStart.current = {
            x: event.nativeEvent.locationX,
            y: event.nativeEvent.locationY,
          };
        }}
        {...ringResponder.panHandlers}
      >
        <Svg width={RING_SIZE} height={RING_SIZE} pointerEvents="none">
          {segments.map(segment => (
            <Path
              key={segment.d}
              d={segment.d}
              stroke={segment.color}
              strokeWidth={RING_THICKNESS}
              fill="none"
            />
          ))}
        </Svg>
        <View
          pointerEvents="none"
          style={[
            styles.ringThumb,
            {
              left: CENTER + RING_RADIUS * Math.cos(thumbAngle) - 11,
              top: CENTER + RING_RADIUS * Math.sin(thumbAngle) - 11,
              backgroundColor: ringColor(hsv.h),
            },
          ]}
        />
      </View>

      <View style={styles.square} {...squareResponder.panHandlers}>
        <Svg width={SQUARE_SIZE} height={SQUARE_SIZE} pointerEvents="none">
          <Defs>
            <LinearGradient id="cwWhite" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="cwBlack" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Putih/hitam murni di sini adalah matematika HSV, bukan token tema. */}
          <Rect width="100%" height="100%" fill={pureHue} />
          <Rect width="100%" height="100%" fill="url(#cwWhite)" />
          <Rect width="100%" height="100%" fill="url(#cwBlack)" />
        </Svg>
        <View
          pointerEvents="none"
          style={[
            styles.squareThumb,
            {
              left: (hsv.s / 100) * SQUARE_SIZE,
              top: (1 - hsv.v / 100) * SQUARE_SIZE,
              backgroundColor: current,
            },
          ]}
        />
      </View>
    </View>
  );
}
