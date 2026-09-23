import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CaseSwitch, HomeIcon, ProgressDots, SpeakButton } from '../components/ui';
import { LETTER_KEYS } from '../data/alphabet';
import { STICKERS } from '../data/stickers';
import { confetti, createDaily, haptic, recordActivity, sfx, toast } from '../kit';
import { lettersMasteredRatio, ownedStickerCount, recordLetter, recordSession, starsRatio, type SessionOutcome } from '../lib/progress';
import { mulberry32 } from '../lib/random';
import { navigate } from '../lib/router';
import { confirmLeave, guardSession } from './leave';
import { say, speech, useSpeech, sayAuto } from '../lib/speech';
import { getProgress, updateProgress, useAppSettings } from '../lib/store';
import { ACTIVITIES, ACTIVITY_BY_ID, levelColor, recommend, type SessionId } from './meta';
import { sessionDef } from './registry';
import { Results } from './Results';
import type { LetterResult, ReviewItem, TaskApi } from './types';

const PRAISE = ['Výborně!', 'Správně!', 'Super!', 'Paráda!', 'Skvěle!', 'Bezva!', 'Jupí!', 'Přesně tak!'];

/** Denní počet vyřešených úloh + série dní (kit) – čte ho i menu („Dnes procvičeno“). */
export const daily = createDaily('cestina', { goal: 24, unit: ['úloha', 'úlohy', 'úloh'] });

export function Session({ id, focus }: { id: SessionId; focus?: string }) {
  const def = sessionDef(id);
  const settings = useAppSettings();
  const { status } = useSpeech();
  const noVoice = status === 'no-czech' || status === 'unsupported';
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
        noVoice,
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
  /** Přeskočené úlohy, dílčí skóre (Párování) a data pro přehled chyb – po úlohách. */
  const skipped = useRef<boolean[]>([]);
  const scores = useRef<(number | undefined)[]>([]);
  const details = useRef<unknown[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

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
    skipped.current = [];
    scores.current = [];
    details.current = [];
  }, [seed, id]);

  // Přečíst zadání na začátku každé úlohy.
  useEffect(() => {
    if (result || task === undefined) return;
    const text = promptText(index === 0);
    const cap = def.caption?.(task, mode);
    const t = window.setTimeout(() => {
      if (text) void sayAuto(text, cap ? { caption: index === 0 ? `${def.meta.intro} ${cap}` : cap } : undefined);
    }, index === 0 ? 350 : 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, seed, result]);

  // Klávesnice: po každé nové úloze fokus na první odpověď (ne na <body>) – CESTINA-26.
  useEffect(() => {
    if (result) return;
    const t = window.setTimeout(() => {
      const stage = stageRef.current;
      if (!stage || stage.contains(document.activeElement)) return;
      const ok = ':not([disabled]):not([aria-disabled="true"])';
      const first =
        stage.querySelector<HTMLElement>(`[data-choice]${ok}, [data-cell]${ok}, [data-pair]${ok}, [data-tile]${ok}, .kbd-key${ok}`) ??
        stage.querySelector<HTMLElement>(`button${ok}`);
      (first ?? stage).focus({ preventScroll: true });
    }, 60);
    return () => window.clearTimeout(t);
  }, [index, seed, result]);

  // Rozehrané cvičení hlídá odchod přes Zpět v prohlížeči / na Androidu (CESTINA-11).
  const active = !result && (index > 0 || (mistakes[0] ?? 0) > 0 || solved);
  useEffect(() => (active ? guardSession() : undefined), [active]);

  useEffect(() => () => speech.cancel(), []);

  const finish = useCallback(
    (finalMistakes: number[]) => {
      const total = tasks.length;
      let correct = 0;
      tasks.forEach((_, i) => {
        if (skipped.current[i]) return;
        const sc = scores.current[i];
        correct += sc !== undefined ? sc : (finalMistakes[i] ?? 0) === 0 ? 1 : 0;
      });
      correct = Math.round(correct * 100) / 100;
      const skippedCount = skipped.current.filter(Boolean).length;
      const review = tasks
        .map((t, i) => {
          const sc = scores.current[i];
          const wrong = skipped.current[i] || (sc !== undefined ? sc < 1 : (finalMistakes[i] ?? 0) > 0);
          return wrong ? def.review(t, details.current[i]) : null;
        })
        .filter((x): x is ReviewItem => x !== null);
      let outcome!: SessionOutcome;
      const p = updateProgress((cur) => {
        outcome = recordSession(cur, {
          activityId: id,
          correct,
          total,
          skipped: skippedCount,
          bestStreak: bestStreak.current,
          now: Date.now(),
          rng: Math.random,
        });
        return outcome.progress;
      });
      recordActivity('cestina', {
        // Postup pro menu: půl hvězdičky ze všech cvičení, půl písmenka „umím“.
        progress: 0.5 * starsRatio(p, ACTIVITIES.map((a) => a.id)) + 0.5 * lettersMasteredRatio(p, LETTER_KEYS),
        metric: { value: ownedStickerCount(p), of: STICKERS.length, unit: ['nálepka', 'nálepky', 'nálepek'] },
        note: def.meta.title,
        // „Pokračovat“ v menu otevře rovnou poslední cvičení.
        href: `/cestina/#/hra/${id}`,
      });
      setResult({ outcome, correct, total, review });
      if (outcome.stars > 0) sfx.win();
      else sfx.flip();
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
      haptic('error');
      streak.current = 0;
      setMistakes((m) => {
        const c = [...m];
        c[index] = (c[index] ?? 0) + 1;
        return c;
      });
      if (opts?.say) void sayAuto(opts.say);
    },
    done: (opts) => {
      if (solved || task === undefined) return;
      setSolved(true);
      const my = ++seq.current;
      const miss = mistakes[index] ?? 0;
      if (opts?.score !== undefined) scores.current[index] = Math.max(0, Math.min(1, opts.score));
      if (opts?.detail !== undefined) details.current[index] = opts.detail;
      sfx.success();
      haptic('success');
      daily.record();
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
      const spoken = speakText ? sayAuto(speakText) : Promise.resolve();
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

  /** Přeskočit úlohu – nepočítá se jako vyřešená (za samé přeskakování nejsou hvězdy ani nálepka). */
  const skip = () => {
    if (solved || task === undefined || result) return;
    const snapshot = [...mistakes];
    snapshot[index] = Math.max(1, snapshot[index] ?? 0);
    skipped.current[index] = true;
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
    if (active && !(await confirmLeave())) return;
    speech.cancel();
    navigate('', { force: true });
  };

  const lvl = levelColor(id);

  if (result) {
    const recommended = recommend(getProgress().activities, id === 'mix' ? undefined : id, { noVoice });
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
      <div className="play-head">
        <div className="play-bar">
          <button type="button" className="play-home g92-btn g92-btn--secondary g92-btn--icon" onClick={() => void exit()} aria-label="Domů" title="Domů">
            <span style={{ width: 24, height: 24, display: 'grid' }}>
              <HomeIcon />
            </span>
          </button>
          <div className="play-dots">
            <ProgressDots states={dotStates} current={index} />
          </div>
          <button
            type="button"
            className="play-skip g92-btn g92-btn--ghost g92-btn--icon"
            onClick={skip}
            aria-label="Přeskočit úlohu (Esc)"
            title="Přeskočit úlohu (Esc)"
            disabled={solved}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
              <path d="M3.5 6.2v11.6c0 .8.9 1.2 1.5.7L12 13v4.8c0 .8.9 1.2 1.5.7l7.4-5.8c.5-.4.5-1.1 0-1.5l-7.4-5.8c-.6-.5-1.5-.1-1.5.7V11L5 5.5c-.6-.5-1.5-.1-1.5.7Z" />
            </svg>
          </button>
          <div className="play-case">
            <CaseSwitch compact />
          </div>
        </div>
        <div className="play-instr">
          <SpeakButton
            className="play-instr-speak"
            text={() => [instruction, promptText(false)].filter(Boolean).join('. ')}
            size={52}
            label="Přečíst zadání"
            caption={def.caption?.(task, mode)}
          />
          <h1 className="play-instr-text">{instruction}</h1>
        </div>
      </div>
      <main className="flex flex-1 flex-col">
        <div key={`${seed}-${index}`} ref={stageRef} tabIndex={-1} className="play-stage g92-anim-float-in">
          <Comp task={task} api={api} index={index} />
        </div>
      </main>
      {praise ? (
        <div className="praise" key={praise.key} aria-hidden="true">
          <div className="praise-bubble">{praise.text}</div>
        </div>
      ) : null}
      <p className="g92-sr-only" aria-live="assertive">
        {praise ? praise.text : (mistakes[index] ?? 0) > 0 ? `To není ono, zkus to znovu (${mistakes[index]}).` : ''}
      </p>
    </div>
  );
}
