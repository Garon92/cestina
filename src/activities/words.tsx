import { useCallback, useEffect, useState } from 'react';
import { Builder } from '../components/Builder';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { EmojiPic, SpeakButton, WordText, scriptClass } from '../components/ui';
import { emojiFor } from '../data/words';
import {
  genCtiSlova,
  genDiktat,
  genRymy,
  genSkladani,
  genSlova,
  type CtiSlovaTask,
  type DiktatTask,
  type RymyTask,
  type SkladaniTask,
  type SlovaTask,
} from '../engine/generators';
import { ACTIVITY_BY_ID } from '../engine/meta';
import { defineActivity, type TaskApi } from '../engine/types';
import { say } from '../lib/speech';
import { caseWord } from '../lib/text';
import { sfx } from '../kit';

const up = (s: string) => s.toLocaleUpperCase('cs-CZ');

// ─── Co je napsáno? ───────────────────────────────────────────────────────

function CtiSlovaView({ task, api }: { task: CtiSlovaTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  return (
    <>
      <div className={`prompt-word ${script}`} aria-label={task.word}>
        <WordText word={task.word} mode={api.mode} syllables={api.settings.syllableColors} />
      </div>
      <ChoiceGrid
        api={api}
        variant="pic"
        answer={task.word}
        sayOnCorrect={task.word}
        sayOnWrong={(id) => `To je ${id}.`}
        options={task.options.map((o) => ({ id: o.w, label: o.w, content: <EmojiPic e={o.e} label={o.w} /> }))}
      />
    </>
  );
}

export const ctiSlova = defineActivity<CtiSlovaTask>({
  meta: ACTIVITY_BY_ID.get('cti-slova')!,
  generate: genCtiSlova,
  Component: ({ task, api }) => <CtiSlovaView task={task} api={api} />,
  instruction: () => 'Přečti slovo a najdi obrázek',
  prompt: () => '',
  review: (t) => ({ label: t.word, say: t.word, emoji: emojiFor(t.word) }),
});

// ─── Velká a malá slova ───────────────────────────────────────────────────

function SlovaView({ task, api }: { task: SlovaTask; api: TaskApi }) {
  const optScript = !task.reverse && api.mode === 'script' ? 'script' : '';
  const promptScript = task.reverse && api.mode === 'script' ? 'script' : '';
  return (
    <>
      <div className={`prompt-word ${promptScript}`} aria-label={task.word}>
        {task.reverse ? task.word : up(task.word)}
      </div>
      <ChoiceGrid
        api={api}
        variant="word"
        cols={2}
        answer={task.word}
        sayOnCorrect={task.word}
        sayOnWrong={(id) => `To je ${id}.`}
        options={task.options.map((w) => ({ id: w, label: w, className: optScript, content: task.reverse ? up(w) : w }))}
      />
    </>
  );
}

export const slova = defineActivity<SlovaTask>({
  meta: ACTIVITY_BY_ID.get('slova')!,
  generate: (ctx) => {
    const t = genSlova(ctx);
    // Obrácený směr jen v druhé polovině, ať se instrukce nemění pořád.
    const half = Math.ceil(t.length * 0.6);
    return t.map((x, i) => ({ ...x, reverse: i >= half }));
  },
  Component: ({ task, api }) => <SlovaView task={task} api={api} />,
  instruction: (t) => (t.reverse ? 'Najdi stejné slovo VELKÝMI písmeny' : 'Najdi stejné slovo malými písmeny'),
  prompt: (t, _m, prev) => (prev && prev.reverse !== t.reverse ? `Teď najdi slovo velkými písmeny. ${t.word}.` : t.word),
  review: (t) => ({ label: `${up(t.word)} = ${t.word}`, say: t.word, emoji: emojiFor(t.word) }),
});

// ─── Skládání ─────────────────────────────────────────────────────────────

function SkladaniView({ task, api }: { task: SkladaniTask; api: TaskApi }) {
  const [hint, setHint] = useState(false);
  return (
    <>
      <div className="flex items-center gap-4">
        {task.emoji ? (
          <button type="button" className="tile tile--pic" style={{ width: 'clamp(5.5rem, 22vmin, 8.5rem)' }} onClick={() => void say(task.word)} aria-label={`Obrázek: ${task.word}`}>
            <EmojiPic e={task.emoji} label={task.word} />
          </button>
        ) : null}
        <SpeakButton text={task.word} size={task.emoji ? 64 : 96} label="Poslechnout slovo" />
      </div>
      <Builder
        target={task.letters}
        tiles={task.pool}
        api={api}
        showHint={hint}
        render={(u) => caseWord(u, api.mode)}
        onComplete={() => api.done({ say: task.word })}
      />
      {!hint ? (
        <button type="button" className="g92-btn g92-btn--ghost" onClick={() => setHint(true)}>
          <span aria-hidden="true">👀</span> Ukázat slovo
        </button>
      ) : null}
    </>
  );
}

export const skladani = defineActivity<SkladaniTask>({
  meta: ACTIVITY_BY_ID.get('skladani')!,
  generate: genSkladani,
  Component: ({ task, api }) => <SkladaniView task={task} api={api} />,
  instruction: () => 'Slož slovo z písmenek',
  prompt: (t) => t.word,
  review: (t) => ({ label: t.word, say: t.word, emoji: t.emoji || undefined }),
});

// ─── Rýmy ─────────────────────────────────────────────────────────────────

function RymyView({ task, api }: { task: RymyTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  return (
    <>
      <div className="flex items-center gap-4">
        <button type="button" className="tile tile--pic" style={{ width: 'clamp(6rem, 24vmin, 9rem)' }} onClick={() => void say(task.target.w)} aria-label={`Obrázek: ${task.target.w}`}>
          <EmojiPic e={task.target.e} label={task.target.w} />
          <span className={`tile-caption ${script}`} style={{ fontSize: '1.1rem', color: 'var(--g92-text)' }}>
            {caseWord(task.target.w, api.mode)}
          </span>
        </button>
        <span className="text-4xl" aria-hidden="true">
          🎵
        </span>
      </div>
      <ChoiceGrid
        api={api}
        variant="pic"
        cols={3}
        answer={task.answer.w}
        sayOnCorrect={`${task.target.w} a ${task.answer.w}. To se rýmuje!`}
        sayOnWrong={(id) => `${task.target.w} a ${id}? To se nerýmuje.`}
        options={task.options.map((o) => ({
          id: o.w,
          label: o.w,
          content: (
            <>
              <EmojiPic e={o.e} label={o.w} />
              <span className={`tile-caption ${script}`}>{caseWord(o.w, api.mode)}</span>
            </>
          ),
        }))}
      />
    </>
  );
}

export const rymy = defineActivity<RymyTask>({
  meta: ACTIVITY_BY_ID.get('rymy')!,
  generate: genRymy,
  Component: ({ task, api }) => <RymyView task={task} api={api} />,
  instruction: (t) => `Co se rýmuje se slovem ${t.target.w}?`,
  prompt: (t) => `Co se rýmuje se slovem ${t.target.w}? ${t.options.map((o) => o.w).join(', ')}.`,
  review: (t) => ({ label: `${t.target.w} – ${t.answer.w}`, say: `${t.target.w}, ${t.answer.w}`, emoji: t.target.e }),
});

// ─── Diktát ───────────────────────────────────────────────────────────────

// 6 kláves na řádek = větší klávesy i na telefonu (q, w, x v diktátu nejsou).
const KB_ROWS = ['abcdef', 'ghijkl', 'mnoprs', 'tuvyz'];
const CARKA: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý' };
const HACEK: Record<string, string> = { c: 'č', d: 'ď', e: 'ě', n: 'ň', r: 'ř', s: 'š', t: 'ť', z: 'ž' };
const KROUZEK: Record<string, string> = { u: 'ů' };
const STRIP: Record<string, string> = Object.fromEntries(
  [...Object.entries(CARKA), ...Object.entries(HACEK), ...Object.entries(KROUZEK)].map(([a, b]) => [b, a]),
);

/** Přidá/změní diakritiku posledního písmene (čárka, háček, kroužek). */
export function applyMark(text: string, map: Record<string, string>): string {
  if (!text) return text;
  const chars = [...text];
  const last = chars[chars.length - 1]!;
  const base = STRIP[last] ?? last;
  const marked = map[base];
  chars[chars.length - 1] = marked && marked !== last ? marked : base;
  return chars.join('');
}

function DiktatView({ task, api }: { task: DiktatTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  const target = [...task.word];
  const [typed, setTyped] = useState('');
  const [marks, setMarks] = useState<('ok' | 'bad')[] | null>(null);
  const [fails, setFails] = useState(0);
  const max = target.length + 2;

  const type = useCallback(
    (ch: string) => {
      if (api.solved) return;
      sfx.tap();
      setMarks(null);
      setTyped((t) => ([...t].length >= max ? t : t + ch));
    },
    [api.solved, max],
  );
  const mark = (map: Record<string, string>) => {
    if (api.solved) return;
    sfx.tap();
    setMarks(null);
    setTyped((t) => applyMark(t, map));
  };
  const back = () => {
    if (api.solved) return;
    setMarks(null);
    setTyped((t) => [...t].slice(0, -1).join(''));
  };
  const check = () => {
    if (api.solved || !typed) return;
    const t = [...typed.toLocaleLowerCase('cs-CZ')];
    if (t.join('') === task.word) {
      setMarks(t.map(() => 'ok'));
      api.done({ say: `${task.word}. Správně napsáno!` });
      return;
    }
    setMarks(target.map((c, i) => (t[i] === c ? 'ok' : 'bad')));
    setFails((f) => f + 1);
    api.mistake();
    void say(fails >= 1 ? `Skoro. Píše se to takhle: ${task.word}.` : 'Skoro! Oprav červená písmenka.');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        back();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        check();
      } else if (e.key.length === 1 && /\p{L}/u.test(e.key)) {
        e.preventDefault();
        type(e.key.toLocaleLowerCase('cs-CZ'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const shownChars = [...typed];
  const len = Math.max(target.length, shownChars.length);
  return (
    <>
      <div className="flex items-center gap-4">
        {task.emoji ? (
          <button type="button" className="tile tile--pic" style={{ width: 'clamp(5rem, 20vmin, 7.5rem)' }} onClick={() => void say(task.word)} aria-label="Poslechnout slovo">
            <EmojiPic e={task.emoji} label="obrázek ke slovu" />
          </button>
        ) : null}
        <SpeakButton text={task.word} size={task.emoji ? 64 : 96} label="Poslechnout slovo" />
      </div>
      {fails >= 2 ? (
        <div className={`text-2xl font-black text-muted ${script}`} aria-label={`Nápověda: ${task.word}`}>
          {caseWord(task.word, api.mode)}
        </div>
      ) : null}
      <div className="slots diktat-slots" aria-live="polite" aria-label={`Napsáno: ${typed || 'nic'}`}>
        {Array.from({ length: len }, (_, i) => {
          const ch = shownChars[i];
          const m = marks?.[i];
          return (
            <span key={i} className={`slot ${script} ${ch ? 'is-filled' : ''} ${i === shownChars.length ? 'is-next' : ''} ${m === 'ok' ? 'is-ok' : m === 'bad' ? 'is-bad' : ''}`}>
              {ch ? caseWord(ch, api.mode) : ''}
            </span>
          );
        })}
      </div>
      <div className="kbd" role="group" aria-label="Klávesnice">
        {KB_ROWS.map((row) => (
          <div className="kbd-row" key={row}>
            {[...row].map((k) => (
              <button key={k} type="button" className={`kbd-key ${script}`} onClick={() => type(k)} aria-label={k}>
                {caseWord(k, api.mode)}
              </button>
            ))}
          </div>
        ))}
        <div className="kbd-row">
          <button type="button" className="kbd-key kbd-key--mod" onClick={() => mark(CARKA)} aria-label="Čárka nad posledním písmenem" title="čárka (á, é, í…)">
            <span className="kbd-mark" aria-hidden="true">´</span>
            <span className="kbd-example" aria-hidden="true">
              {caseWord('á', api.mode)}
            </span>
          </button>
          <button type="button" className="kbd-key kbd-key--mod" onClick={() => mark(HACEK)} aria-label="Háček nad posledním písmenem" title="háček (č, ř, š…)">
            <span className="kbd-mark" aria-hidden="true">ˇ</span>
            <span className="kbd-example" aria-hidden="true">
              {caseWord('č', api.mode)}
            </span>
          </button>
          <button type="button" className="kbd-key kbd-key--mod" onClick={() => mark(KROUZEK)} aria-label="Kroužek nad u" title="kroužek (ů)">
            <span className="kbd-mark" aria-hidden="true">°</span>
            <span className="kbd-example" aria-hidden="true">
              {caseWord('ů', api.mode)}
            </span>
          </button>
          <button type="button" className="kbd-key kbd-key--wide" onClick={back} aria-label="Smazat poslední písmeno">
            ⌫
          </button>
          <button
            type="button"
            className="kbd-key kbd-key--wide"
            style={{ background: 'var(--g92-success)', color: '#fff', borderColor: 'transparent' }}
            onClick={check}
            aria-label="Hotovo, zkontrolovat"
            disabled={!typed}
          >
            ✔
          </button>
        </div>
      </div>
    </>
  );
}

export const diktat = defineActivity<DiktatTask>({
  meta: ACTIVITY_BY_ID.get('diktat')!,
  generate: genDiktat,
  Component: ({ task, api }) => <DiktatView task={task} api={api} />,
  instruction: () => 'Poslouchej a napiš slovo',
  prompt: (t) => t.word,
  caption: (t) => `„${t.word}“`,
  review: (t) => ({ label: t.word, say: t.word, emoji: t.emoji || undefined }),
});
