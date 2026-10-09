/** Kemiringan monoton (Fritsch–Carlson) supaya kurva halus tanpa melewati titik data. */
export function monotonePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) {
    return '';
  }
  if (n === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    slope.push((points[i + 1].y - points[i].y) / (dx[i] || 1));
  }
  const tangent: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    tangent.push(
      slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2,
    );
  }
  tangent.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangent[i] = t * a * slope[i];
      tangent[i + 1] = t * b * slope[i];
    }
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const step = dx[i] / 3;
    d += ` C ${points[i].x + step} ${points[i].y + tangent[i] * step} ${
      points[i + 1].x - step
    } ${points[i + 1].y - tangent[i + 1] * step} ${points[i + 1].x} ${
      points[i + 1].y
    }`;
  }
  return d;
}

/** Batas atas sumbu Y yang "bulat" (1/2/2,5/5 × 10ⁿ) + titik tick-nya dari 0. */
export function niceTicks(max: number, intervals = 4): number[] {
  if (max <= 0) {
    return Array.from({ length: intervals + 1 }, (_, index) => index);
  }
  const rough = max / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= rough) ??
    10 * magnitude;
  return Array.from({ length: intervals + 1 }, (_, index) => index * step);
}

/**
 * Indeks label sumbu X yang tidak bertumpuk (jarak piksel ≥ `minGap`); label terakhir selalu
 * ikut (titik "sekarang"), menggeser label sebelumnya kalau terlalu dekat.
 */
export function pickLabelIndexes(xs: number[], minGap: number): number[] {
  const indexes: number[] = [];
  xs.forEach((x, index) => {
    const last = indexes[indexes.length - 1];
    if (last === undefined || x - xs[last] >= minGap) {
      indexes.push(index);
    }
  });
  const lastIndex = xs.length - 1;
  if (xs.length > 1 && indexes[indexes.length - 1] !== lastIndex) {
    if (
      indexes.length > 1 &&
      xs[lastIndex] - xs[indexes[indexes.length - 1]] < minGap
    ) {
      indexes.pop();
    }
    indexes.push(lastIndex);
  }
  return indexes;
}
