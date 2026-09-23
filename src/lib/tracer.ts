/**
 * Vyhodnocení obtahování jednoho tahu – čistá logika (testovatelná).
 *
 * Model „sleduj cestu“: tah je převzorkovaný na body po `spacing`. Dítě musí začít u začátku tahu
 * a pokrok (`progress`) se posouvá jen dopředu – když je prst blízko některého z následujících bodů.
 * Tím se hlídá směr i pořadí a funguje to i pro uzavřené tvary (O) a tahy, které se vracejí (M, u).
 * Body daleko od tahu se počítají jako „mimo“; když jich je moc, tah neplatí.
 */
import type { Pt, Stroke } from '../data/strokes';

export interface TraceOptions {
  /** Tolerance vzdálenosti od tahu (ve stejných jednotkách jako tah). */
  tol: number;
  /** Rozestup vzorků (default tol / 3). */
  spacing?: number;
  /** Kolik procent tahu musí být pokryto (default 0.92). */
  minCoverage?: number;
  /** Minimální podíl bodů „na cestě“ (default 0.65). */
  minAccuracy?: number;
}

export interface TraceResult {
  complete: boolean;
  coverage: number;
  accuracy: number;
  passed: boolean;
}

export const TOLERANCE: Record<'easy' | 'normal' | 'hard', number> = { easy: 17, normal: 13, hard: 9 };

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Převzorkuje lomenou čáru na body po `spacing`. */
export function resample(pts: readonly Pt[], spacing: number): Pt[] {
  if (pts.length === 0) return [];
  const out: Pt[] = [{ ...pts[0]! }];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const seg = dist(a, b);
    if (seg === 0) continue;
    let t = spacing - carry;
    while (t <= seg) {
      out.push({ x: a.x + ((b.x - a.x) * t) / seg, y: a.y + ((b.y - a.y) * t) / seg });
      t += spacing;
    }
    carry = seg - (t - spacing);
  }
  const last = pts[pts.length - 1]!;
  if (dist(out[out.length - 1]!, last) > spacing * 0.25) out.push({ ...last });
  return out;
}

export function pathLength(pts: readonly Pt[]): number {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += dist(pts[i - 1]!, pts[i]!);
  return l;
}

export class StrokeTracer {
  readonly samples: Pt[];
  readonly tol: number;
  readonly dot: boolean;
  private progress = 0;
  private onPath = 0;
  private total = 0;
  private started = false;
  private last: Pt | null = null;
  private readonly lookahead: number;
  private readonly minCoverage: number;
  private readonly minAccuracy: number;

  constructor(stroke: Stroke, opts: TraceOptions) {
    this.tol = opts.tol;
    this.dot = Boolean(stroke.dot);
    const spacing = opts.spacing ?? Math.max(1, opts.tol / 3);
    this.samples = this.dot ? [centroid(stroke.pts)] : resample(stroke.pts, spacing);
    // Jak daleko dopředu smí prst „skočit“ (~2,5 tolerance po dráze).
    this.lookahead = Math.max(3, Math.ceil((opts.tol * 2.5) / spacing));
    this.minCoverage = opts.minCoverage ?? 0.92;
    this.minAccuracy = opts.minAccuracy ?? 0.65;
  }

  /** Začátek tahu – vrací false, když prst začal jinde než u začátku (pak se tah nezačne). */
  begin(p: Pt): boolean {
    const startTol = this.dot ? this.tol * 1.6 : this.tol * 1.7;
    if (dist(p, this.samples[0]!) > startTol) return false;
    this.started = true;
    this.progress = 0;
    this.onPath = 0;
    this.total = 0;
    this.last = null;
    this.feed(p);
    return true;
  }

  /** Další bod pohybu. Mezi vzdálenými body interpoluje, aby rychlý tah nic nepřeskočil. */
  move(p: Pt): void {
    if (!this.started) return;
    const prev = this.last;
    if (prev) {
      const d = dist(prev, p);
      const step = this.tol / 3;
      if (d > step) {
        const n = Math.ceil(d / step);
        for (let i = 1; i < n; i++) this.feed({ x: prev.x + ((p.x - prev.x) * i) / n, y: prev.y + ((p.y - prev.y) * i) / n });
      }
    }
    this.feed(p);
  }

  private feed(p: Pt): void {
    this.last = p;
    this.total++;
    const n = this.samples.length;
    const end = Math.min(n - 1, this.progress + this.lookahead);
    let best = -1;
    for (let i = this.progress; i <= end; i++) {
      if (dist(p, this.samples[i]!) <= this.tol) best = i;
    }
    if (best >= 0) this.progress = Math.max(this.progress, best);
    // „Na cestě“ = blízko kterékoli části tahu (s rezervou).
    let near = false;
    for (let i = 0; i < n; i++) {
      if (dist(p, this.samples[i]!) <= this.tol * 1.5) {
        near = true;
        break;
      }
    }
    if (near) this.onPath++;
  }

  get coverage(): number {
    if (this.dot) return this.started ? 1 : 0;
    const n = this.samples.length;
    return n <= 1 ? (this.started ? 1 : 0) : this.progress / (n - 1);
  }

  get accuracy(): number {
    return this.total ? this.onPath / this.total : 0;
  }

  /** Tah je dotažený do konce (lze vyhodnotit hned, bez zvednutí prstu). */
  get complete(): boolean {
    return this.started && this.coverage >= this.minCoverage;
  }

  /** Index vzorku, kam až dítě došlo (pro vykreslení pokroku). */
  get reached(): number {
    return this.progress;
  }

  end(): TraceResult {
    const coverage = this.coverage;
    const accuracy = this.accuracy;
    const complete = this.started && coverage >= this.minCoverage;
    const passed = complete && accuracy >= this.minAccuracy;
    this.started = false;
    return { complete, coverage, accuracy, passed };
  }
}

function centroid(pts: readonly Pt[]): Pt {
  const n = pts.length || 1;
  return { x: pts.reduce((s, p) => s + p.x, 0) / n, y: pts.reduce((s, p) => s + p.y, 0) / n };
}

/** Pohodlná funkce pro testy: obtáhne tah celou sekvencí bodů. */
export function traceStroke(stroke: Stroke, user: readonly Pt[], opts: TraceOptions): TraceResult {
  const t = new StrokeTracer(stroke, opts);
  if (!user.length || !t.begin(user[0]!)) return { complete: false, coverage: 0, accuracy: 0, passed: false };
  for (let i = 1; i < user.length; i++) t.move(user[i]!);
  return t.end();
}
