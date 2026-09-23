import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react';
import { glyphBounds, glyphFor, type Pt } from '../data/strokes';
import { StrokeTracer, resample } from '../lib/tracer';
import { prefersReducedMotion, sfx } from '../kit';

export interface TraceHandle {
  demo: () => void;
  restart: () => void;
}

interface Props {
  char: string;
  tol: number;
  onStroke?: (index: number, total: number) => void;
  onMistake?: (reason: 'off' | 'start') => void;
  onComplete?: () => void;
  handleRef?: Ref<TraceHandle>;
  /** Zamknout (po dokončení). */
  locked?: boolean;
}

const VIEW_TOP = -40;
const VIEW_BOTTOM = 142;

/**
 * Plátno pro obtahování písmene prstem nebo myší.
 * Vykreslí linky jako v sešitě, šedou „cestičku“ písmene, aktuální tah s šipkami a zelenou tečkou,
 * pokrok podél tahu a inkoust dítěte. Vyhodnocuje přes StrokeTracer (tolerance v jednotkách písmene).
 */
export function TraceCanvas({ char, tol, onStroke, onMistake, onComplete, handleRef, locked }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyph = glyphFor(char);
  const strokes = glyph?.strokes ?? [];
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const st = useRef({
    idx: 0,
    tracer: null as StrokeTracer | null,
    ink: [] as Pt[][],
    drawing: false,
    pointerId: -1,
    demoT: -1,
    demoRaf: 0,
    flashStart: 0,
    done: false,
    scale: 1,
    ox: 0,
    oy: 0,
    w: 0,
    h: 0,
  });

  // Nový znak → reset.
  useEffect(() => {
    const s = st.current;
    s.idx = 0;
    s.ink = [];
    s.done = false;
    s.tracer = strokes[0] ? new StrokeTracer(strokes[0], { tol }) : null;
    setStrokeIdx(0);
    setMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char, tol]);

  const colors = useCallback(() => {
    const cs = getComputedStyle(wrapRef.current ?? document.documentElement);
    const v = (n: string, f: string) => cs.getPropertyValue(n).trim() || f;
    return {
      lvl: v('--lvl', v('--accent', '#e0479e')),
      track: v('--g92-surface-3', '#e5e8f2'),
      line: v('--g92-border-strong', 'rgba(0,0,0,.2)'),
      lineSoft: v('--g92-border', 'rgba(0,0,0,.1)'),
      success: v('--g92-success', '#15803d'),
      text: v('--g92-text', '#161a2e'),
      surface: v('--g92-surface', '#fff'),
    };
  }, []);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const s = st.current;
    if (!cv || !glyph) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, s.w, s.h);
    const c = colors();
    const X = (x: number) => s.ox + x * s.scale;
    const Y = (y: number) => s.oy + y * s.scale;
    const poly = (pts: Pt[]) => {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
    };
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Linky jako v sešitě.
    const guide = (y: number, dash: number[], color: string, width = 2) => {
      ctx.save();
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(12, Y(y));
      ctx.lineTo(s.w - 12, Y(y));
      ctx.stroke();
      ctx.restore();
    };
    guide(0, [10, 8], c.lineSoft);
    guide(45, [4, 8], c.lineSoft);
    guide(100, [], c.line, 3);
    guide(135, [2, 10], c.lineSoft);

    // Cestička celého písmene (tolerance).
    ctx.strokeStyle = c.track;
    ctx.lineWidth = tol * 2 * s.scale;
    for (const str of strokes) {
      if (str.dot) {
        ctx.beginPath();
        ctx.arc(X(str.pts[0]!.x), Y((str.pts[0]!.y + str.pts[1]!.y) / 2), tol * s.scale, 0, Math.PI * 2);
        ctx.fillStyle = c.track;
        ctx.fill();
      } else {
        poly(str.pts);
        ctx.stroke();
      }
    }

    // Hotové tahy.
    ctx.strokeStyle = s.done ? c.success : c.lvl;
    ctx.fillStyle = s.done ? c.success : c.lvl;
    ctx.lineWidth = tol * 1.15 * s.scale;
    strokes.forEach((str, i) => {
      if (i >= s.idx && !s.done) return;
      if (str.dot) {
        ctx.beginPath();
        ctx.arc(X(str.pts[0]!.x), Y(str.pts[0]!.y + 1.5), tol * 0.75 * s.scale, 0, Math.PI * 2);
        ctx.fill();
      } else {
        poly(str.pts);
        ctx.stroke();
      }
    });

    const cur = strokes[s.idx];
    const tr = s.tracer;
    if (cur && tr && !s.done) {
      // Pokrok podél aktuálního tahu.
      if (tr.reached > 0) {
        ctx.strokeStyle = c.lvl;
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = tol * 1.15 * s.scale;
        poly(tr.samples.slice(0, tr.reached + 1));
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (!cur.dot) {
        // Středová čárkovaná čára se šipkami směru.
        ctx.save();
        ctx.setLineDash([2, 10]);
        ctx.strokeStyle = c.text;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 3;
        poly(cur.pts);
        ctx.stroke();
        ctx.restore();
        const pts = resample(cur.pts, 26);
        ctx.fillStyle = c.text;
        ctx.globalAlpha = 0.45;
        for (let i = 1; i < pts.length - 1; i++) {
          if (i <= Math.floor((tr.reached / Math.max(1, tr.samples.length - 1)) * (pts.length - 1))) continue;
          const a = pts[i - 1]!;
          const b = pts[i + 1]!;
          const ang = Math.atan2(b.y - a.y, b.x - a.x);
          const px = X(pts[i]!.x);
          const py = Y(pts[i]!.y);
          const sz = Math.max(6, 4 * s.scale);
          ctx.beginPath();
          ctx.moveTo(px + Math.cos(ang) * sz, py + Math.sin(ang) * sz);
          ctx.lineTo(px + Math.cos(ang + 2.5) * sz, py + Math.sin(ang + 2.5) * sz);
          ctx.lineTo(px + Math.cos(ang - 2.5) * sz, py + Math.sin(ang - 2.5) * sz);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // Startovní tečka s číslem tahu.
      const p0 = cur.dot ? { x: cur.pts[0]!.x, y: cur.pts[0]!.y + 1.5 } : cur.pts[0]!;
      const pulse = s.flashStart > performance.now() ? 1.35 : 1;
      const r = Math.max(13, tol * 0.7 * s.scale) * pulse;
      ctx.beginPath();
      ctx.arc(X(p0.x), Y(p0.y), r, 0, Math.PI * 2);
      ctx.fillStyle = c.success;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = c.surface;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `900 ${Math.round(r * 1.1)}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(s.idx + 1), X(p0.x), Y(p0.y) + 1);
    }

    // Inkoust dítěte.
    ctx.strokeStyle = c.text;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = Math.max(4, tol * 0.42 * s.scale);
    for (const line of s.ink) {
      if (line.length < 2) continue;
      poly(line);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Ukázka (prst jede po tahu).
    if (s.demoT >= 0 && cur) {
      const pts = cur.dot ? [cur.pts[0]!] : resample(cur.pts, 1);
      const p = pts[Math.min(pts.length - 1, Math.floor(s.demoT * (pts.length - 1)))]!;
      ctx.beginPath();
      ctx.arc(X(p.x), Y(p.y), Math.max(14, tol * 0.8 * s.scale), 0, Math.PI * 2);
      ctx.fillStyle = c.lvl;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.font = `${Math.round(Math.max(28, tol * 2 * s.scale))}px system-ui`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('👆', X(p.x) - 8, Y(p.y) + 4);
    }
  }, [colors, glyph, strokes, tol]);

  // Velikost plátna podle kontejneru (ostré i na retině).
  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv || !glyph) return;
    const b = glyphBounds(glyph);
    const layout = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      const s = st.current;
      s.w = r.width;
      s.h = r.height;
      const viewH = VIEW_BOTTOM - VIEW_TOP;
      const viewW = Math.max(b.maxX - b.minX + 50, 120);
      s.scale = Math.min(r.width / viewW, r.height / viewH);
      s.ox = r.width / 2 - ((b.minX + b.maxX) / 2) * s.scale;
      s.oy = (r.height - viewH * s.scale) / 2 - VIEW_TOP * s.scale;
      draw();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw, glyph]);

  useEffect(() => {
    draw();
  });

  if (import.meta.env.DEV) {
    // Háček pro automatické testy (playwright): převod souřadnic písmene na obrazovku.
    (window as unknown as { __trace?: unknown }).__trace = {
      strokes: strokes.map((x) => ({ pts: x.pts, dot: Boolean(x.dot) })),
      toScreen: (x: number, y: number) => {
        const r = canvasRef.current?.getBoundingClientRect();
        const s = st.current;
        return r ? { x: r.left + s.ox + x * s.scale, y: r.top + s.oy + y * s.scale } : null;
      },
    };
  }

  const toGlyph = (e: PointerEvent | React.PointerEvent): Pt => {
    const r = canvasRef.current!.getBoundingClientRect();
    const s = st.current;
    return { x: (e.clientX - r.left - s.ox) / s.scale, y: (e.clientY - r.top - s.oy) / s.scale };
  };

  const finishStroke = () => {
    const s = st.current;
    const tr = s.tracer;
    if (!tr) return;
    const res = tr.end();
    s.drawing = false;
    if (res.passed) {
      s.ink = [];
      s.idx++;
      setMsg(null);
      if (s.idx >= strokes.length) {
        s.done = true;
        s.tracer = null;
        setStrokeIdx(s.idx);
        draw();
        onComplete?.();
      } else {
        sfx.pop();
        s.tracer = new StrokeTracer(strokes[s.idx]!, { tol });
        setStrokeIdx(s.idx);
        onStroke?.(s.idx, strokes.length);
        draw();
      }
    } else {
      s.ink = [];
      tr.reset();
      setMsg('Kousek vedle – zkus to ještě jednou.');
      onMistake?.('off');
      draw();
    }
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (locked || s.done || !s.tracer) return;
    if (s.drawing) return;
    e.preventDefault();
    stopDemo();
    const p = toGlyph(e);
    const tr = s.tracer;
    const ok = (tr.hasProgress && tr.resume(p)) || tr.begin(p);
    if (!ok) {
      s.flashStart = performance.now() + 600;
      setMsg('Začni u zelené tečky.');
      onMistake?.('start');
      draw();
      window.setTimeout(draw, 650);
      return;
    }
    s.drawing = true;
    s.pointerId = e.pointerId;
    canvasRef.current?.setPointerCapture(e.pointerId);
    s.ink.push([p]);
    setMsg(null);
    if (tr.complete) finishStroke();
    else draw();
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (!s.drawing || e.pointerId !== s.pointerId || !s.tracer) return;
    const native = e.nativeEvent;
    const events = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [native];
    for (const ev of events.length ? events : [native]) {
      const p = toGlyph(ev);
      s.tracer.move(p);
      s.ink[s.ink.length - 1]?.push(p);
    }
    if (s.tracer.complete) finishStroke();
    else if (s.tracer.accuracy < 0.5 && s.ink.flat().length > 40) finishStroke();
    else draw();
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = st.current;
    if (!s.drawing || e.pointerId !== s.pointerId || !s.tracer) return;
    s.drawing = false;
    if (s.tracer.complete) finishStroke();
    else {
      // Zvednutý prst: rozdělanou práci necháme – dítě může navázat.
      s.tracer.lift();
      if (!s.tracer.hasProgress) s.ink = [];
      else setMsg('Pokračuj, kde jsi skončil.');
      draw();
    }
  };

  const stopDemo = () => {
    const s = st.current;
    if (s.demoRaf) cancelAnimationFrame(s.demoRaf);
    s.demoRaf = 0;
    s.demoT = -1;
  };

  const demo = useCallback(() => {
    const s = st.current;
    if (s.done) return;
    if (prefersReducedMotion()) {
      s.flashStart = performance.now() + 900;
      draw();
      window.setTimeout(draw, 950);
      return;
    }
    stopDemo();
    const start = performance.now();
    const cur = strokes[s.idx];
    const dur = cur?.dot ? 600 : 1400;
    const tick = (now: number) => {
      s.demoT = Math.min(1, (now - start) / dur);
      draw();
      if (s.demoT < 1) s.demoRaf = requestAnimationFrame(tick);
      else
        window.setTimeout(() => {
          s.demoT = -1;
          draw();
        }, 250);
    };
    s.demoRaf = requestAnimationFrame(tick);
  }, [draw, strokes]);

  const restart = useCallback(() => {
    const s = st.current;
    stopDemo();
    s.idx = 0;
    s.ink = [];
    s.done = false;
    s.tracer = strokes[0] ? new StrokeTracer(strokes[0], { tol }) : null;
    setStrokeIdx(0);
    setMsg(null);
    draw();
  }, [draw, strokes, tol]);

  useImperativeHandle(handleRef, () => ({ demo, restart }), [demo, restart]);

  useEffect(() => () => stopDemo(), []);

  if (!glyph) return <p className="text-muted">Tohle písmenko zatím obtahovat nejde.</p>;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="trace-wrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label={`Plocha na obtahování písmene ${char}. Tah ${Math.min(strokeIdx + 1, strokes.length)} z ${strokes.length}.`}
          role="img"
        />
      </div>
      <p className="min-h-[1.6em] font-bold text-muted text-center" aria-live="polite">
        {msg ?? (strokes.length > 1 ? `Tah ${Math.min(strokeIdx + 1, strokes.length)} z ${strokes.length}` : ' ')}
      </p>
    </div>
  );
}
