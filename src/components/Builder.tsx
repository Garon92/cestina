import { useEffect, useState } from 'react';
import type { TaskApi } from '../engine/types';
import { sfx } from '../kit';

/**
 * Skládání slova z dílků (písmen nebo slabik) ve správném pořadí.
 * Správný dílek „skočí“ do dalšího okénka, špatný se zatřese. Po 2 chybách blikne správný dílek.
 * Na počítači jde psát i klávesnicí (písmena).
 */
export function Builder({
  target,
  tiles,
  api,
  render,
  onPiece,
  onComplete,
  big,
  showHint,
}: {
  target: string[];
  tiles: string[];
  api: TaskApi;
  render: (unit: string) => string;
  /** Po správném dílku (např. přečíst písmeno). */
  onPiece?: (unit: string) => void;
  onComplete: () => void;
  big?: boolean;
  /** Ukázat šedou předlohu v okénkách. */
  showHint?: boolean;
}) {
  const [filled, setFilled] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const script = api.mode === 'script' ? 'script' : '';
  const norm = (s: string) => s.toLocaleLowerCase('cs-CZ');

  const tap = (i: number) => {
    if (api.solved || used.includes(i) || filled >= target.length) return;
    const expected = target[filled]!;
    if (norm(tiles[i]!) === norm(expected)) {
      const nf = filled + 1;
      setUsed((u) => [...u, i]);
      setFilled(nf);
      if (nf >= target.length) onComplete();
      else {
        sfx.pop();
        onPiece?.(expected);
      }
    } else {
      setShake(i);
      window.setTimeout(() => setShake((s) => (s === i ? null : s)), 450);
      api.mistake();
    }
  };

  // Psaní z klávesnice (jen pro písmenkové dílky).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      const k = norm(e.key);
      const expected = target[filled];
      if (!expected) return;
      const want = norm(expected);
      // „ch“ se píše jako c (+ h)
      let match = want.startsWith(k) ? tiles.findIndex((t, i) => !used.includes(i) && norm(t) === want) : -1;
      if (match < 0) match = tiles.findIndex((t, i) => !used.includes(i) && norm(t) === k);
      if (match >= 0) {
        e.preventDefault();
        tap(match);
      } else if (/\p{L}/u.test(k) && !api.solved) {
        e.preventDefault();
        api.mistake();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const nextHint = api.mistakes >= 2 ? tiles.findIndex((t, i) => !used.includes(i) && norm(t) === norm(target[filled] ?? '')) : -1;

  return (
    <>
      <div className="slots" aria-label="Skládané slovo">
        {target.map((u, i) => (
          <span
            key={i}
            className={`slot ${script} ${i < filled ? 'is-filled' : ''} ${i === filled && !api.solved ? 'is-next' : ''}`}
            style={big ? { minWidth: 'clamp(4rem, 16vw, 6.5rem)' } : undefined}
            aria-label={i < filled ? render(u) : 'prázdné okénko'}
          >
            {i < filled ? render(u) : showHint ? <span style={{ opacity: 0.22 }}>{render(u)}</span> : ''}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-[40rem]" role="group" aria-label="Dílky">
        {tiles.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`tile tile--letter ${script} ${used.includes(i) ? 'is-done' : ''} ${shake === i ? 'is-wrong' : ''} ${nextHint === i ? 'is-hint' : ''}`}
            style={{
              aspectRatio: big ? 'auto' : 1,
              minWidth: big ? 'clamp(5rem, 20vw, 7rem)' : 'clamp(3.6rem, 13vw, 5rem)',
              minHeight: 'clamp(3.6rem, 13vw, 5rem)',
              fontSize: big ? 'clamp(1.6rem, 6vw, 2.4rem)' : 'clamp(1.8rem, 7vw, 2.8rem)',
              visibility: used.includes(i) ? 'hidden' : 'visible',
            }}
            onClick={() => tap(i)}
            aria-label={render(t)}
            data-tile={t}
            disabled={used.includes(i)}
          >
            {render(t)}
          </button>
        ))}
      </div>
    </>
  );
}
