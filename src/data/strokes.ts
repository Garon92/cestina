/**
 * Tahy tiskacích písmen pro obtahování.
 *
 * Souřadnice: velikost písmene „100“ = výška velkého písmene. Účaří (spodní linka) je y = 100,
 * vrch velkých písmen y = 0, vrch malých písmen (x-výška) y = 45, dolní délka (p, j, y…) do y = 135.
 * Diakritika nad velkými písmeny je v záporném y. Každý tah je lomená čára ve správném směru psaní.
 * Úhly oblouků: 0° = vpravo, 90° = dolů (osa y míří dolů), rostoucí úhel = po směru hodinových ručiček.
 */
export type Pt = { x: number; y: number };

export interface Stroke {
  pts: Pt[];
  /** Tečka (i, j) – stačí se dotknout. */
  dot?: boolean;
}

export interface Glyph {
  strokes: Stroke[];
}

const P = (x: number, y: number): Pt => ({ x, y });

function line(...pts: [number, number][]): Pt[] {
  return pts.map(([x, y]) => P(x, y));
}

/** Oblouk elipsy ze startovního úhlu do koncového (stupně), `steps` bodů. */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, steps?: number): Pt[] {
  const n = steps ?? Math.max(8, Math.round(Math.abs(a1 - a0) / 8));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push(P(cx + rx * Math.cos(a), cy + ry * Math.sin(a)));
  }
  return out;
}

/** Spojí části do jednoho tahu (vynechá zdvojené body na švech). */
function path(...parts: Pt[][]): Pt[] {
  const out: Pt[] = [];
  for (const part of parts) {
    for (const p of part) {
      const last = out[out.length - 1];
      if (last && Math.hypot(last.x - p.x, last.y - p.y) < 0.01) continue;
      out.push(p);
    }
  }
  return out;
}

const S = (...pts: Pt[][]): Stroke => ({ pts: path(...pts) });
const DOT = (x: number, y: number): Stroke => ({ pts: [P(x, y - 1.5), P(x, y + 1.5)], dot: true });

// ─── VELKÁ písmena ───
const UPPER: Record<string, Stroke[]> = {
  A: [S(line([40, 0], [8, 100])), S(line([40, 0], [72, 100])), S(line([20, 64], [60, 64]))],
  B: [
    S(line([15, 0], [15, 100])),
    S(line([15, 0], [44, 0]), arc(44, 24, 24, 24, -90, 90), line([44, 48], [15, 48])),
    S(line([15, 48], [48, 48]), arc(48, 74, 26, 26, -90, 90), line([48, 100], [15, 100])),
  ],
  C: [S(arc(50, 50, 40, 50, -40, -320))],
  D: [S(line([15, 0], [15, 100])), S(line([15, 0], [35, 0]), arc(35, 50, 40, 50, -90, 90), line([35, 100], [15, 100]))],
  E: [S(line([15, 0], [15, 100])), S(line([15, 0], [65, 0])), S(line([15, 50], [55, 50])), S(line([15, 100], [65, 100]))],
  F: [S(line([15, 0], [15, 100])), S(line([15, 0], [65, 0])), S(line([15, 50], [55, 50]))],
  G: [S(arc(50, 50, 40, 50, -40, -360), line([90, 50], [58, 50]))],
  H: [S(line([15, 0], [15, 100])), S(line([75, 0], [75, 100])), S(line([15, 50], [75, 50]))],
  I: [S(line([30, 0], [30, 100]))],
  J: [S(line([58, 0], [58, 72]), arc(34, 72, 24, 28, 0, 180))],
  K: [S(line([15, 0], [15, 100])), S(line([70, 0], [15, 58], [72, 100]))],
  L: [S(line([15, 0], [15, 100], [65, 100]))],
  M: [S(line([10, 100], [10, 0], [45, 62], [80, 0], [80, 100]))],
  N: [S(line([15, 100], [15, 0], [75, 100], [75, 0]))],
  O: [S(arc(50, 50, 40, 50, -90, -450, 48))],
  P: [S(line([15, 0], [15, 100])), S(line([15, 0], [42, 0]), arc(42, 27, 27, 27, -90, 90), line([42, 54], [15, 54]))],
  Q: [S(arc(50, 50, 40, 50, -90, -450, 48)), S(line([56, 72], [88, 106]))],
  R: [
    S(line([15, 0], [15, 100])),
    S(line([15, 0], [42, 0]), arc(42, 27, 27, 27, -90, 90), line([42, 54], [15, 54])),
    S(line([38, 54], [72, 100])),
  ],
  S: [S(arc(46, 25, 28, 25, -25, -270), arc(46, 75, 30, 25, -90, 155))],
  T: [S(line([5, 0], [75, 0])), S(line([40, 0], [40, 100]))],
  U: [S(line([15, 0], [15, 64]), arc(45, 64, 30, 36, 180, 0), line([75, 64], [75, 0]))],
  V: [S(line([8, 0], [42, 100], [76, 0]))],
  W: [S(line([4, 0], [24, 100], [46, 32], [68, 100], [88, 0]))],
  X: [S(line([10, 0], [72, 100])), S(line([72, 0], [10, 100]))],
  Y: [S(line([8, 0], [40, 50])), S(line([72, 0], [40, 50], [40, 100]))],
  Z: [S(line([10, 0], [72, 0], [10, 100], [74, 100]))],
};

// ─── malá písmena ───
const LOWER: Record<string, Stroke[]> = {
  a: [S(arc(45, 72.5, 25, 27.5, -30, -390, 40)), S(line([70, 45], [70, 100]))],
  b: [S(line([20, 0], [20, 100])), S(arc(45, 72.5, 25, 27.5, 180, 540, 40))],
  c: [S(arc(45, 72.5, 25, 27.5, -40, -320))],
  d: [S(arc(45, 72.5, 25, 27.5, -30, -390, 40)), S(line([70, 0], [70, 100]))],
  e: [S(line([20, 72.5], [70, 72.5]), arc(45, 72.5, 25, 27.5, 0, -320))],
  f: [S(arc(54, 18, 16, 16, -20, -180), line([38, 18], [38, 100])), S(line([22, 45], [58, 45]))],
  g: [S(arc(45, 72.5, 25, 27.5, -30, -390, 40)), S(line([70, 45], [70, 112]), arc(47, 112, 23, 22, 0, 165))],
  h: [S(line([20, 0], [20, 100])), S(arc(43, 68, 23, 23, 180, 360), line([66, 68], [66, 100]))],
  i: [S(line([35, 45], [35, 100])), DOT(35, 24)],
  j: [S(line([45, 45], [45, 114]), arc(27, 114, 18, 20, 0, 160)), DOT(45, 24)],
  k: [S(line([20, 0], [20, 100])), S(line([62, 45], [20, 76], [66, 100]))],
  l: [S(line([30, 0], [30, 100]))],
  m: [
    S(line([12, 45], [12, 100])),
    S(arc(29.5, 66, 17.5, 21, 180, 360), line([47, 66], [47, 100])),
    S(arc(64.5, 66, 17.5, 21, 180, 360), line([82, 66], [82, 100])),
  ],
  n: [S(line([20, 45], [20, 100])), S(arc(43, 68, 23, 23, 180, 360), line([66, 68], [66, 100]))],
  o: [S(arc(45, 72.5, 25, 27.5, -90, -450, 40))],
  p: [S(line([20, 45], [20, 135])), S(arc(45, 72.5, 25, 27.5, 180, 540, 40))],
  q: [S(arc(45, 72.5, 25, 27.5, -30, -390, 40)), S(line([70, 45], [70, 135]))],
  r: [S(line([20, 45], [20, 100])), S(arc(42, 70, 22, 22, 180, 305))],
  s: [S(arc(44, 58, 21, 13.5, -25, -270), arc(44, 86, 23, 14, -90, 155))],
  t: [S(line([34, 12], [34, 88]), arc(48, 88, 14, 12, 180, 90)), S(line([16, 45], [56, 45]))],
  u: [S(line([20, 45], [20, 77]), arc(43, 77, 23, 23, 180, 0), line([66, 77], [66, 45])), S(line([66, 45], [66, 100]))],
  v: [S(line([14, 45], [42, 100], [70, 45]))],
  w: [S(line([4, 45], [24, 100], [44, 58], [64, 100], [84, 45]))],
  x: [S(line([15, 45], [68, 100])), S(line([68, 45], [15, 100]))],
  y: [S(line([14, 45], [42, 100])), S(line([70, 45], [28, 135]))],
  z: [S(line([15, 45], [68, 45], [15, 100], [70, 100]))],
};

// ─── diakritika ───
const carka = (cx: number, top: number): Stroke => S(line([cx + 7, top], [cx - 5, top + 16]));
const hacek = (cx: number, top: number): Stroke => S(line([cx - 11, top], [cx, top + 14], [cx + 11, top]));
const krouzek = (cx: number, cy: number): Stroke => S(arc(cx, cy, 8, 8, -90, -450, 24));
const apostrof = (x: number, top: number): Stroke => S(line([x + 3, top], [x - 1, top + 16]));

function bboxCenterX(strokes: Stroke[]): number {
  let min = Infinity;
  let max = -Infinity;
  for (const s of strokes) for (const p of s.pts) {
    min = Math.min(min, p.x);
    max = Math.max(max, p.x);
  }
  return (min + max) / 2;
}

const U = (k: string) => UPPER[k]!;
const Lw = (k: string) => LOWER[k]!;

function withUpper(base: string, extra: 'carka' | 'hacek' | 'krouzek'): Stroke[] {
  const s = U(base);
  const cx = bboxCenterX(s);
  const d = extra === 'carka' ? carka(cx, -30) : extra === 'hacek' ? hacek(cx, -28) : krouzek(cx, -18);
  return [...s, d];
}

function withLower(base: string, extra: 'carka' | 'hacek' | 'krouzek', cxOverride?: number): Stroke[] {
  const s = Lw(base).filter((st) => !st.dot);
  const cx = cxOverride ?? bboxCenterX(s);
  const d = extra === 'carka' ? carka(cx, 14) : extra === 'hacek' ? hacek(cx, 16) : krouzek(cx, 26);
  return [...s, d];
}

const GLYPHS_UPPER: Record<string, Stroke[]> = {
  ...UPPER,
  Á: withUpper('A', 'carka'),
  Č: withUpper('C', 'hacek'),
  Ď: withUpper('D', 'hacek'),
  É: withUpper('E', 'carka'),
  Ě: withUpper('E', 'hacek'),
  Í: withUpper('I', 'carka'),
  Ň: withUpper('N', 'hacek'),
  Ó: withUpper('O', 'carka'),
  Ř: withUpper('R', 'hacek'),
  Š: withUpper('S', 'hacek'),
  Ť: withUpper('T', 'hacek'),
  Ú: withUpper('U', 'carka'),
  Ů: withUpper('U', 'krouzek'),
  Ý: withUpper('Y', 'carka'),
  Ž: withUpper('Z', 'hacek'),
};

const GLYPHS_LOWER: Record<string, Stroke[]> = {
  ...LOWER,
  á: withLower('a', 'carka'),
  č: withLower('c', 'hacek'),
  ď: [...Lw('d'), apostrof(82, 0)],
  é: withLower('e', 'carka'),
  ě: withLower('e', 'hacek'),
  í: withLower('i', 'carka', 35),
  ň: withLower('n', 'hacek'),
  ó: withLower('o', 'carka'),
  ř: withLower('r', 'hacek', 36),
  š: withLower('s', 'hacek'),
  ť: [...Lw('t'), apostrof(48, 4)],
  ú: withLower('u', 'carka'),
  ů: withLower('u', 'krouzek'),
  ý: withLower('y', 'carka', 44),
  ž: withLower('z', 'hacek'),
};

/** Tahy pro dané písmeno (znak), nebo null (Ch se obtahuje jako C a h zvlášť). */
export function glyphFor(ch: string): Glyph | null {
  const strokes = GLYPHS_UPPER[ch] ?? GLYPHS_LOWER[ch];
  return strokes ? { strokes } : null;
}

export function traceableChars(): string[] {
  return [...Object.keys(GLYPHS_UPPER), ...Object.keys(GLYPHS_LOWER)];
}

/** Ohraničení glyfu (pro vystředění na plátně). */
export function glyphBounds(g: Glyph): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of g.strokes) for (const p of s.pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, maxX, minY, maxY };
}
