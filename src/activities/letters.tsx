import { useMemo, useState } from 'react';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { EmojiPic, SpeakButton, scriptClass } from '../components/ui';
import { letterByKey } from '../data/alphabet';
import {
  genHledej,
  genParovani,
  genPoslouchej,
  genPoznavani,
  genZacina,
  type HledejTask,
  type ParovaniTask,
  type PoslouchejTask,
  type PoznavaniTask,
  type ZacinaTask,
} from '../engine/generators';
import { ACTIVITY_BY_ID } from '../engine/meta';
import { defineActivity, type TaskApi } from '../engine/types';
import { say, sayAuto } from '../lib/speech';
import { caseLetter, capitalize, caseWord, type LetterCase } from '../lib/text';
import { sfx } from '../kit';

const L = letterByKey;
const shown = (key: string, mode: LetterCase) => caseLetter(L(key), mode);
const name = (key: string) => L(key).say;

// ─── Velké a malé ─────────────────────────────────────────────────────────

function PoznavaniView({ task, api }: { task: PoznavaniTask; api: TaskApi }) {
  const script = api.mode === 'script' ? 'script' : '';
  const l = L(task.letter);
  return (
    <>
      <div className={`prompt-letter ${script}`} aria-label={`Písmeno ${l.say}`}>
        {task.showUpper ? l.upper : l.lower}
      </div>
      <ChoiceGrid
        api={api}
        variant="letter"
        answer={task.letter}
        sayOnCorrect={`${task.showUpper ? 'Velké' : 'Malé'} ${l.say} a ${task.showUpper ? 'malé' : 'velké'} ${l.say}.`}
        sayOnWrong={(id) => `To je ${name(id)}.`}
        options={task.options.map((k) => ({
          id: k,
          label: name(k),
          className: script,
          content: task.showUpper ? L(k).lower : L(k).upper,
        }))}
      />
    </>
  );
}

export const poznavani = defineActivity<PoznavaniTask>({
  meta: ACTIVITY_BY_ID.get('poznavani')!,
  generate: (ctx) => {
    // První polovina: velké → malé, druhá: malé → velké (instrukce se mění jen jednou).
    const tasks = genPoznavani(ctx);
    const half = Math.ceil(tasks.length / 2);
    return tasks.map((t, i) => ({ ...t, showUpper: i < half }));
  },
  Component: ({ task, api }) => <PoznavaniView task={task} api={api} />,
  instruction: (t) => (t.showUpper ? 'Najdi malé písmenko' : 'Najdi velké písmenko'),
  prompt: (t, _m, prev) => (!prev || prev.showUpper !== t.showUpper ? (t.showUpper ? 'Najdi malé písmenko.' : 'Teď najdi velké písmenko.') : ''),
  letterOf: (t) => t.letter,
  review: (t) => ({ label: `${L(t.letter).upper} ${L(t.letter).lower}`, say: name(t.letter) }),
});

// ─── Poslouchej ───────────────────────────────────────────────────────────

function PoslouchejView({ task, api }: { task: PoslouchejTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  return (
    <>
      <SpeakButton text={name(task.letter)} caption={`„${name(task.letter)}“`} size={120} label="Poslechnout písmenko znovu" />
      <ChoiceGrid
        api={api}
        variant="letter"
        answer={task.letter}
        sayOnCorrect={name(task.letter)}
        sayOnWrong={(id) => `To je ${name(id)}. Hledáme ${name(task.letter)}.`}
        options={task.options.map((k) => ({ id: k, label: shown(k, api.mode), className: script, content: shown(k, api.mode) }))}
      />
    </>
  );
}

export const poslouchej = defineActivity<PoslouchejTask>({
  meta: ACTIVITY_BY_ID.get('poslouchej')!,
  generate: genPoslouchej,
  Component: ({ task, api }) => <PoslouchejView task={task} api={api} />,
  instruction: () => 'Poslouchej a najdi písmenko',
  prompt: (t) => name(t.letter),
  caption: (t) => `„${name(t.letter)}“`,
  letterOf: (t) => t.letter,
  review: (t) => ({ label: `${L(t.letter).upper} ${L(t.letter).lower}`, say: name(t.letter) }),
});

// ─── Hledej písmenko ──────────────────────────────────────────────────────

function HledejView({ task, api }: { task: HledejTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  const [found, setFound] = useState<number[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const total = task.cells.filter((c) => c === task.letter).length;
  const tap = (i: number) => {
    if (api.solved || found.includes(i)) return;
    if (task.cells[i] === task.letter) {
      const next = [...found, i];
      setFound(next);
      if (next.length >= total) api.done({ say: `Všechna ${name(task.letter)}!` });
      else {
        sfx.pop();
        void sayAuto(name(task.letter));
      }
    } else {
      setShake(i);
      window.setTimeout(() => setShake((s) => (s === i ? null : s)), 450);
      api.mistake();
      void sayAuto(`To je ${name(task.cells[i]!)}.`);
    }
  };
  const hint = api.mistakes >= 2;
  return (
    <>
      <div className="flex items-center gap-4">
        <div className={`prompt-letter ${script}`} style={{ fontSize: 'clamp(4rem, 16vmin, 7rem)' }}>
          {shown(task.letter, api.mode)}
        </div>
        <div className="text-center">
          <div className="text-4xl font-black tabular-nums">
            {found.length} / {total}
          </div>
          <div className="text-muted font-bold text-sm">nalezeno</div>
        </div>
      </div>
      <div className="hledej-grid grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-[34rem]" role="group" aria-label="Písmenka">
        {task.cells.map((c, i) => {
          const isFound = found.includes(i);
          return (
            <button
              key={i}
              type="button"
              className={`tile tile--letter ${script} ${isFound ? 'is-correct' : ''} ${shake === i ? 'is-wrong' : ''} ${hint && !isFound && c === task.letter ? 'is-hint' : ''}`}
              style={{ fontSize: 'clamp(2rem, 8vw, 3.4rem)' }}
              onClick={() => tap(i)}
              aria-label={`${shown(c, api.mode)}${isFound ? ', nalezeno' : ''}`}
              data-cell={c}
              aria-pressed={isFound}
            >
              {shown(c, api.mode)}
            </button>
          );
        })}
      </div>
    </>
  );
}

export const hledej = defineActivity<HledejTask>({
  meta: ACTIVITY_BY_ID.get('hledej')!,
  generate: genHledej,
  Component: ({ task, api }) => <HledejView task={task} api={api} />,
  instruction: (t, m) => `Najdi všechna písmenka ${shown(t.letter, m)}`,
  prompt: (t) => `Najdi všechna ${name(t.letter)}.`,
  letterOf: (t) => t.letter,
  review: (t) => ({ label: `${L(t.letter).upper} ${L(t.letter).lower}`, say: name(t.letter) }),
});

// ─── Na co začíná? ────────────────────────────────────────────────────────

function ZacinaView({ task, api }: { task: ZacinaTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  const [solved, setSolved] = useState(false);
  const w = caseWord(task.word, api.mode);
  const first = task.letter === 'CH' ? w.slice(0, 2) : w.slice(0, 1);
  return (
    <>
      <button type="button" className="tile tile--pic tile--hero" onClick={() => void say(task.word)} aria-label={`Obrázek: ${task.word}. Ťukni a uslyšíš slovo.`}>
        <EmojiPic e={task.emoji} label={task.word} />
      </button>
      <div className={`prompt-word ${script}`} aria-live="polite" style={{ minHeight: '1.2em' }}>
        {solved ? (
          <>
            <span className="syl-a" style={{ textDecoration: 'underline', textUnderlineOffset: '0.12em' }}>
              {first}
            </span>
            {w.slice(first.length)}
          </>
        ) : (
          <span className="text-subtle">{'_ '.repeat(Math.min(6, [...task.word].length)).trim()}</span>
        )}
      </div>
      <ChoiceGrid
        api={api}
        variant="letter"
        answer={task.letter}
        onCorrect={() => setSolved(true)}
        sayOnCorrect={`${capitalize(task.word)} začíná na ${name(task.letter)}.`}
        sayOnWrong={(id) => `To je ${name(id)}. Poslouchej: ${task.word}.`}
        options={task.options.map((k) => ({ id: k, label: name(k), className: script, content: shown(k, api.mode) }))}
      />
    </>
  );
}

export const zacina = defineActivity<ZacinaTask>({
  meta: ACTIVITY_BY_ID.get('zacina')!,
  generate: genZacina,
  Component: ({ task, api }) => <ZacinaView task={task} api={api} />,
  instruction: () => 'Na jaké písmenko začíná slovo?',
  prompt: (t) => t.word,
  letterOf: (t) => t.letter,
  review: (t) => ({ label: `${t.word} → ${L(t.letter).upper}`, say: `${t.word}, ${name(t.letter)}`, emoji: t.emoji }),
});

// ─── Párování ─────────────────────────────────────────────────────────────

const PAIR_COLORS = ['#e0479e', '#2f7cf6', '#f97316', '#10a36e', '#8b5cf6'];

function ParovaniView({ task, api }: { task: ParovaniTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  const [sel, setSel] = useState<{ side: 'L' | 'R'; key: string } | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const [missed, setMissed] = useState<string[]>([]);
  const colorOf = useMemo(() => new Map(task.left.map((k, i) => [k, PAIR_COLORS[i % PAIR_COLORS.length]!])), [task.left]);

  const tap = (side: 'L' | 'R', key: string) => {
    if (api.solved || matched.includes(key)) return;
    if (!sel || sel.side === side) {
      sfx.tap();
      setSel({ side, key });
      return;
    }
    if (sel.key === key) {
      const next = [...matched, key];
      setMatched(next);
      setSel(null);
      if (next.length === task.left.length) {
        // Skóre po dvojicích (1 chyba z 5 párů = 80 %, ne celé kolo špatně) – CESTINA-13.
        const ok = task.left.filter((k) => !missed.includes(k)).length;
        api.done({
          say: 'Všechny páry!',
          letters: task.left.map((k) => ({ key: k, ok: !missed.includes(k) })),
          score: ok / task.left.length,
          detail: task.left.filter((k) => missed.includes(k)),
        });
      } else {
        sfx.pop();
        void sayAuto(name(key));
      }
    } else {
      const id = `${side}-${key}`;
      setBad(id);
      window.setTimeout(() => setBad((b) => (b === id ? null : b)), 450);
      setMissed((m) => [...new Set([...m, sel.key, key])]);
      setSel(null);
      api.mistake();
    }
  };

  const col = (side: 'L' | 'R', keys: string[]) => (
    <div className="pairs-col flex flex-col gap-2 sm:gap-3 flex-1 max-w-[11rem]" role="group" aria-label={side === 'L' ? 'Velká písmena' : 'Malá písmena'}>
      {keys.map((k) => {
        const isM = matched.includes(k);
        const isSel = sel?.side === side && sel.key === k;
        const c = colorOf.get(k)!;
        return (
          <button
            key={k}
            type="button"
            className={`tile tile--letter pair-tile ${script} ${isSel ? 'is-selected' : ''} ${bad === `${side}-${k}` ? 'is-wrong' : ''}`}
            style={{
              ...(isM ? { background: `color-mix(in oklab, ${c} 22%, var(--g92-surface))`, borderColor: c, boxShadow: `0 4px 0 color-mix(in oklab, ${c} 50%, transparent)` } : {}),
            }}
            onClick={() => tap(side, k)}
            aria-pressed={isSel}
            data-pair={`${side}-${k}`}
            aria-label={`${side === 'L' ? 'velké' : 'malé'} ${name(k)}${isM ? ', spárováno' : ''}`}
          >
            {side === 'L' ? L(k).upper : L(k).lower}
            {isM ? (
              <span aria-hidden="true" style={{ position: 'absolute', right: 8, top: 4, fontSize: '1rem', color: c }}>
                ✔
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="pairs flex justify-center gap-6 sm:gap-16 w-full">
      {col('L', task.left)}
      {col('R', task.right)}
    </div>
  );
}

export const parovani = defineActivity<ParovaniTask>({
  meta: ACTIVITY_BY_ID.get('parovani')!,
  generate: (ctx) => genParovani(ctx),
  Component: ({ task, api }) => <ParovaniView task={task} api={api} />,
  instruction: () => 'Spoj velké písmenko s malým',
  prompt: () => '',
  // V přehledu jen písmena, která se spletla (ne celé kolo).
  review: (t, detail) => {
    const keys = Array.isArray(detail) && detail.length ? (detail as string[]) : t.left;
    return { label: keys.map((k) => `${L(k).upper}${L(k).lower}`).join(' '), say: keys.map(name).join(', ') };
  },
});
