import { useEffect, useState, type ReactNode } from 'react';
import type { TaskApi } from '../engine/types';
import { sayAuto } from '../lib/speech';

export interface Choice {
  id: string;
  content: ReactNode;
  /** Popisek pro čtečky obrazovky. */
  label: string;
  className?: string;
}

/**
 * Mřížka odpovědí: správná → zeleně a `api.done()`, špatná → zatřese se, zešedne a `api.mistake()`.
 * Po dvou chybách začne správná odpověď jemně blikat (nápověda), ať dítě nikdy neuvízne.
 * Klávesy 1–9 vyberou odpověď (pro počítač).
 */
export function ChoiceGrid({
  options,
  answer,
  api,
  variant,
  cols,
  onCorrect,
  sayOnWrong,
  sayOnCorrect,
}: {
  options: Choice[];
  answer: string;
  api: TaskApi;
  variant: 'letter' | 'word' | 'pic';
  cols?: 2 | 3 | 4;
  onCorrect?: () => void;
  sayOnWrong?: (id: string) => string | undefined;
  sayOnCorrect?: string;
}) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [shaking, setShaking] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (id: string) => {
    if (api.solved || picked || wrong.includes(id)) return;
    if (id === answer) {
      setPicked(id);
      onCorrect?.();
      api.done(sayOnCorrect ? { say: sayOnCorrect } : undefined);
    } else {
      setWrong((w) => [...w, id]);
      setShaking(id);
      window.setTimeout(() => setShaking((s) => (s === id ? null : s)), 450);
      const s = sayOnWrong?.(id);
      api.mistake();
      if (s) void sayAuto(s);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= options.length) {
        e.preventDefault();
        choose(options[n - 1]!.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const n = cols ?? (options.length === 3 ? 3 : 4);
  const hint = api.mistakes >= 2 && !picked;
  return (
    <div className={`choices choices--${n}`} role="group" aria-label="Možnosti">
      {options.map((o, i) => {
        const isWrong = wrong.includes(o.id);
        const cls = [
          'tile',
          `tile--${variant}`,
          o.className ?? '',
          picked === o.id ? 'is-correct' : '',
          shaking === o.id ? 'is-wrong' : isWrong ? 'is-dim' : '',
          picked && picked !== o.id ? 'is-dim' : '',
          hint && o.id === answer ? 'is-hint' : '',
        ].join(' ');
        return (
          <button
            key={o.id}
            type="button"
            className={cls}
            onClick={() => choose(o.id)}
            aria-label={`${i + 1}: ${o.label}`}
            data-choice={o.id}
            aria-disabled={isWrong || Boolean(picked)}
          >
            {o.content}
          </button>
        );
      })}
    </div>
  );
}
