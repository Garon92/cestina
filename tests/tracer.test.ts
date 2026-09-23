import { describe, expect, it } from 'vitest';
import { SINGLE_LETTERS } from '../src/data/alphabet';
import { glyphFor, type Pt } from '../src/data/strokes';
import { StrokeTracer, TOLERANCE, resample, traceStroke } from '../src/lib/tracer';
import { mulberry32 } from '../src/lib/random';

const opts = { tol: TOLERANCE.normal };

describe('tahy písmen', () => {
  it('existují pro všechna písmena (velká i malá)', () => {
    for (const l of SINGLE_LETTERS) {
      expect(glyphFor(l.upper), l.upper).not.toBeNull();
      expect(glyphFor(l.lower), l.lower).not.toBeNull();
    }
  });
  it('háčky a čárky jsou tah navíc', () => {
    expect(glyphFor('Č')!.strokes.length).toBe(glyphFor('C')!.strokes.length + 1);
    expect(glyphFor('í')!.strokes.length).toBe(2); // bez tečky, s čárkou
    expect(glyphFor('i')!.strokes.some((s) => s.dot)).toBe(true);
  });
});

describe('vyhodnocení obtahování', () => {
  it('přesné obtažení každého tahu projde', () => {
    for (const l of SINGLE_LETTERS) {
      for (const ch of [l.upper, l.lower]) {
        for (const s of glyphFor(ch)!.strokes) {
          const user = resample(s.pts, 2);
          const r = traceStroke(s, user, opts);
          expect(r.passed, `${ch}`).toBe(true);
        }
      }
    }
  });
  it('mírně roztřesená ruka projde', () => {
    const rng = mulberry32(5);
    const s = glyphFor('S')!.strokes[0]!;
    const user = resample(s.pts, 3).map((p) => ({ x: p.x + (rng() - 0.5) * 12, y: p.y + (rng() - 0.5) * 12 }));
    expect(traceStroke(s, user, opts).passed).toBe(true);
  });
  it('opačný směr neprojde (začátek je jinde)', () => {
    const s = glyphFor('L')!.strokes[0]!;
    const user = resample(s.pts, 2).reverse();
    const r = traceStroke(s, user, opts);
    expect(r.passed).toBe(false);
    const t = new StrokeTracer(s, opts);
    expect(t.begin(user[0]!)).toBe(false);
  });
  it('nedokončený tah neprojde', () => {
    const s = glyphFor('O')!.strokes[0]!;
    const pts = resample(s.pts, 2);
    const r = traceStroke(s, pts.slice(0, Math.floor(pts.length / 2)), opts);
    expect(r.complete).toBe(false);
    expect(r.passed).toBe(false);
  });
  it('čmárání mimo tah neprojde', () => {
    const s = glyphFor('I')!.strokes[0]!;
    const start = s.pts[0]!;
    const user: Pt[] = [start];
    for (let i = 0; i < 60; i++) user.push({ x: start.x + 60 * Math.sin(i), y: start.y + i * 1.7 });
    user.push(s.pts[s.pts.length - 1]!);
    expect(traceStroke(s, user, opts).passed).toBe(false);
  });
  it('rychlý tah s velkými skoky mezi body projde (interpolace)', () => {
    const s = glyphFor('Z')!.strokes[0]!;
    const r = traceStroke(s, s.pts, opts); // jen rohové body
    expect(r.passed).toBe(true);
  });
  it('tečka stačí ťuknout', () => {
    const dot = glyphFor('i')!.strokes.find((s) => s.dot)!;
    const r = traceStroke(dot, [{ x: dot.pts[0]!.x + 3, y: dot.pts[0]!.y }], opts);
    expect(r.passed).toBe(true);
  });
  it('přísnější tolerance odmítne velkou odchylku', () => {
    const s = glyphFor('H')!.strokes[0]!;
    const user = resample(s.pts, 2).map((p) => ({ x: p.x + 14, y: p.y }));
    expect(traceStroke(s, user, { tol: TOLERANCE.easy }).passed).toBe(true);
    expect(traceStroke(s, user, { tol: TOLERANCE.hard }).passed).toBe(false);
  });
});
