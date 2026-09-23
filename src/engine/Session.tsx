import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CaseSwitch, HomeIcon, ProgressDots, SpeakButton } from '../components/ui';
import { LETTER_KEYS } from '../data/alphabet';
import { confirmDialog, confetti, recordActivity, sfx, toast } from '../kit';
import { lettersMasteredRatio, ownedStickerCount, recordLetter, recordSession, type SessionOutcome } from '../lib/progress';
import { mulberry32 } from '../lib/random';
import { navigate } from '../lib/router';
import { say, speech } from '../lib/speech';
import { getProgress, updateProgress, useAppSettings } from '../lib/store';
import { ACTIVITY_BY_ID, LEVELS, recommend, type ActivityId } from './meta';
import { REGISTRY } from './registry';
import { Results } from './Results';
import type { LetterResult, ReviewItem, TaskApi } from './types';

const PRAISE = ['Výborně!', 'Správně!', 'Super!', 'Paráda!', 'Skvěle!', 'Bezva!', 'Jupí!', 'Přesně tak!'];

export function levelColor(id: ActivityId): string {
  const lvl = ACTIVITY_BY_ID.get(id)?.level;
  return LEVELS.find((l) => l.id === lvl)?.color ?? 'var(--accent)';
}

export function Session({ id, focus }: { id: ActivityId; focus?: string }) {
  const def = REGISTRY[id];
  const settings = useAppSettings();
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const tasks = useMemo(
    () =>
      def.generate({
        rng: mulberry32(seed),
        count: def.meta.size(settings.sessionLength),
        letters: settings.letters,
        progress: getProgress(),
        now: Date.now(),
        letterCase: settings.letterCase,
        focus,
      }),
    // Úlohy se generují jen při startu (a „Znovu“) – ne při změně písma uprostřed cvičení.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [def, seed],
  );
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState<number[]>(() => []);
  const [solved, setSolved] = useState(false);
  const [praise, setPraise] = useState<{ text: string; key: number } | null>(null);
  const [result, setResult] = useState<{ outcome: SessionOutcome; correct: number; total: number; review: ReviewItem[] } | null>(null);
  const seq = useRef(0);
  const streak = useRef(0);
  const bestStreak = useRef(0);

  const task = tasks[index];
  const prev = index > 0 ? tasks[index - 1] : undefined;
  const mode = settings.letterCase;
  const instruction = task !== undefined ? def.instruction(task, mode) : '';

  const promptText = useCallback(
    (withIntro: boolean) => {
      if (task === undefined) return '';
      const p = def.prompt(task, mode, withIntro ? undefined : prev);
      return withIntro ? [def.meta.intro, p].filter(Boolean).join(' … ') : p;
    },
    [def, mode, prev, task],
  );

  // Nové cvičení = nová sada.
  useEffect(() => {
    setIndex(0);
    setMistakes([]);
    setSolved(false);
    setResult(null);
    streak.current = 0;
    bestStreak.current = 0;
  }, [seed, id]);

  // Přečíst zadání na začátku každé úlohy.
  useEffect(() => {
    if (result || task === undefined) return;
    if (!settings.autoSpeak) return;
    const text = promptText(index === 0);
    const cap = def.caption?.(task, mode);
    const t = window.setTimeout(() => {
      if (text) void say(text, cap && index > 0 ? { caption: cap } : undefined);
    }, index === 0 ? 350 : 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, seed, result]);

  useEffect(() => () => speech.cancel(), []);

  const finish = useCallback(
    (finalMistakes: number[]) => {
      const total = tasks.length;
      const correct = tasks.filter((_, i) => (finalMistakes[i] ?? 0) === 0).length;
      const review = tasks.map((t, i) => ((finalMistakes[i] ?? 0) > 0 ? def.review(t) : null)).filter((x): x is ReviewItem => x !== null);
      let outcome!: SessionOutcome;
      const p = updateProgress((cur) => {
        outcome = recordSession(cur, { activityId: id, correct, total, bestStreak: bestStreak.current, now: Date.now(), rng: Math.random });
        return outcome.progress;
      });
      recordActivity('cestina', {
        progress: lettersMasteredRatio(p, LETTER_KEYS),
        metric: { label: 'Nálepky', value: ownedStickerCount(p) },
        note: def.meta.title,
      });
      setResult({ outcome, correct, total, review });
      sfx.win();
      if (outcome.stars === 3) window.setTimeout(() => confetti({ cannons: true }), 350);
      if (outcome.dailyGoalJustReached) {
        window.setTimeout(() => toast('Dnešní cíl splněn! 🏆', { variant: 'success', duration: 4000 }), 1200);
      }
    },
    [def, id, tasks],
  );

  const next = useCallback(
    (finalMistakes: number[]) => {
      if (index + 1 >= tasks.length) finish(finalMistakes);
      else {
        setIndex(index + 1);
        setSolved(false);
      }
    },
    [finish, index, tasks.length],
  );

  const api: TaskApi = {
    mistakes: mistakes[index] ?? 0,
    solved,
    mode,
    settings,
    repeatPrompt: () => void say([instruction, promptText(false)].filter(Boolean).join('. ')),
    mistake: (opts) => {
      if (solved) return;
      sfx.error();
      streak.current = 0;
      setMistakes((m) => {
        const c = [...m];
        c[index] = (c[index] ?? 0) + 1;
        return c;
      });
      if (opts?.say) void say(opts.say);
    },
    done: (opts) => {
      if (solved || task === undefined) return;
      setSolved(true);
      const my = ++seq.current;
      const miss = mistakes[index] ?? 0;
      sfx.success();
      if (miss === 0) {
        streak.current++;
        bestStreak.current = Math.max(bestStreak.current, streak.current);
      }
      // Postup po písmenech.
      const letters: LetterResult[] = opts?.letters ?? (def.letterOf?.(task) ? [{ key: def.letterOf(task)!, ok: miss === 0 }] : []);
      if (letters.length) {
        const now = Date.now();
        updateProgress((p) => letters.reduce((acc, r) => recordLetter(acc, r.key, r.ok, now), p));
      }
      const milestone = streak.current > 0 && streak.current % 5 === 0 ? `${streak.current} za sebou! 🔥` : null;
      const text = milestone ?? PRAISE[Math.floor(Math.random() * PRAISE.length)]!;
      setPraise({ text, key: my });
      const started = performance.now();
      const speakText = opts?.say ?? (Math.random() < 0.5 ? text.replace(/[🔥!]/gu, '').trim() : '');
      const spoken = speakText ? say(speakText) : Promise.resolve();
      const snapshot = [...mistakes];
      snapshot[index] = miss;
      void spoken.then(() => {
        const wait = Math.max(0, 900 - (performance.now() - started));
        window.setTimeout(() => {
          if (seq.current !== my) return;
          setPraise(null);
          next(snapshot);
        }, wait + 200);
      });
    },
  };

  /** Přeskočit úlohu (počítá se jako chyba) – pro případ, že dítě neví nebo nefunguje hlas. */
  const skip = () => {
    if (solved || task === undefined || result) return;
    const snapshot = [...mistakes];
    snapshot[index] = Math.max(1, snapshot[index] ?? 0);
    setMistakes(snapshot);
    streak.current = 0;
    const lk = def.letterOf?.(task);
    if (lk) updateProgress((p) => recordLetter(p, lk, false, Date.now()));
    seq.current++;
    speech.cancel();
    setPraise(null);
    next(snapshot);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      e.preventDefault();
      skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const exit = async () => {
    if (!result && index > 0) {
      const ok = await confirmDialog({
        title: 'Skončit cvičení?',
        message: 'Rozdělané cvičení se nedokončí. Hvězdičky a nálepka jsou až na konci.',
        confirmLabel: 'Ano, domů',
        cancelLabel: 'Hrát dál',
      });
      if (!ok) return;
    }
    speech.cancel();
    navigate('');
  };

  const lvl = levelColor(id);

  if (result) {
    const recommended = recommend(getProgress().activities, id);
    return (
      <div className="play" style={{ ['--lvl' as string]: lvl }}>
        <Results
          activity={def.meta}
          outcome={result.outcome}
          correct={result.correct}
          total={result.total}
          review={result.review}
          next={ACTIVITY_BY_ID.get(recommended)!}
          onAgain={() => setSeed(Math.floor(Math.random() * 1e9))}
          onNext={() => navigate(`hra/${recommended}`)}
          onHome={() => navigate('')}
        />
      </div>
    );
  }

  if (task === undefined) return null;
  if (import.meta.env.DEV) (window as unknown as { __cestina?: unknown }).__cestina = { id, index, task, total: tasks.length };
  const Comp = def.Component;
  const dotStates = tasks.map((_, i) => (i < index || (i === index && solved) ? ((mistakes[i] ?? 0) === 0 ? 'ok' : 'miss') : 'todo') as 'ok' | 'miss' | 'todo');

  return (
    <div className="play" style={{ ['--lvl' as string]: lvl }}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" className="g92-btn g92-btn--secondary g92-btn--icon" onClick={() => void exit()} aria-label="Domů" title="Domů">
          <span style={{ width: 24, height: 24, display: 'grid' }}>
            <HomeIcon />
          </span>
        </button>
        <div className="flex-1 min-w-0">
          <ProgressDots states={dotStates} current={index} />
        </div>
        <button type="button" className="g92-btn g92-btn--ghost g92-btn--icon" onClick={skip} aria-label="Přeskočit úlohu (Esc)" title="Přeskočit úlohu (Esc)" disabled={solved}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
            <path d="M3.5 6.2v11.6c0 .8.9 1.2 1.5.7L12 13v4.8c0 .8.9 1.2 1.5.7l7.4-5.8c.5-.4.5-1.1 0-1.5l-7.4-5.8c-.6-.5-1.5-.1-1.5.7V11L5 5.5c-.6-.5-1.5-.1-1.5.7Z" />
          </svg>
        </button>
        <CaseSwitch compact />
      </div>
      <div className="flex items-center justify-center gap-3 px-1">
        <SpeakButton text={() => [instruction, promptText(false)].filter(Boolean).join('. ')} size={52} label="Přečíst zadání" caption={def.caption?.(task, mode)} />
        <h1 className="text-xl sm:text-2xl font-black leading-tight text-balance">{instruction}</h1>
      </div>
      <main className="play-stage" aria-live="off">
        <Comp key={`${seed}-${index}`} task={task} api={api} index={index} />
      </main>
      {praise ? (
        <div className="praise" key={praise.key} aria-live="assertive">
          <div className="praise-bubble">{praise.text}</div>
        </div>
      ) : null}
    </div>
  );
}
