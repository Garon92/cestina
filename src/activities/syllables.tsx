import { useState } from 'react';
import { Builder } from '../components/Builder';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { EmojiPic, SpeakButton, WordText, scriptClass } from '../components/ui';
import { emojiFor } from '../data/words';
import {
  genCtiSlabiky,
  genSkladejSlabiky,
  genSlabiky,
  type CtiSlabikyTask,
  type SkladejSlabikyTask,
  type SlabikyTask,
} from '../engine/generators';
import { ACTIVITY_BY_ID } from '../engine/meta';
import { defineActivity, type TaskApi } from '../engine/types';
import { say } from '../lib/speech';
import { hyphenate } from '../lib/syllables';
import { caseWord } from '../lib/text';

// ─── Slyšíš slabiku? ──────────────────────────────────────────────────────

function SlabikyView({ task, api }: { task: SlabikyTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  return (
    <>
      <SpeakButton text={task.syl} caption={`„${task.syl}“`} size={120} label="Poslechnout slabiku znovu" />
      <ChoiceGrid
        api={api}
        variant="letter"
        answer={task.syl}
        sayOnCorrect={task.syl}
        sayOnWrong={(id) => `To je ${id}. Hledáme ${task.syl}.`}
        options={task.options.map((s) => ({ id: s, label: s, className: script, content: caseWord(s, api.mode) }))}
      />
    </>
  );
}

export const slabiky = defineActivity<SlabikyTask>({
  meta: ACTIVITY_BY_ID.get('slabiky')!,
  generate: genSlabiky,
  Component: ({ task, api }) => <SlabikyView task={task} api={api} />,
  instruction: () => 'Poslouchej a najdi slabiku',
  prompt: (t) => t.syl,
  caption: (t) => `„${t.syl}“`,
  review: (t) => ({ label: t.syl.toLocaleUpperCase('cs-CZ'), say: t.syl }),
});

// ─── Čti po slabikách ─────────────────────────────────────────────────────

function CtiSlabikyView({ task, api }: { task: CtiSlabikyTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  return (
    <>
      <div className={`prompt-word ${script}`} aria-label={task.word}>
        <WordText word={task.word} mode={api.mode} syllables hyphens />
      </div>
      <ChoiceGrid
        api={api}
        variant="pic"
        cols={3}
        answer={task.word}
        sayOnCorrect={task.word}
        sayOnWrong={(id) => `To je ${id}.`}
        options={task.options.map((o) => ({ id: o.w, label: o.w, content: <EmojiPic e={o.e} label={o.w} /> }))}
      />
    </>
  );
}

export const ctiSlabiky = defineActivity<CtiSlabikyTask>({
  meta: ACTIVITY_BY_ID.get('cti-slabiky')!,
  generate: genCtiSlabiky,
  Component: ({ task, api }) => <CtiSlabikyView task={task} api={api} />,
  instruction: () => 'Přečti slovo a najdi obrázek',
  prompt: () => '',
  review: (t) => ({ label: hyphenate(t.word), say: t.word, emoji: emojiFor(t.word) }),
});

// ─── Slož ze slabik ───────────────────────────────────────────────────────

function SkladejSlabikyView({ task, api }: { task: SkladejSlabikyTask; api: TaskApi }) {
  const [hint, setHint] = useState(false);
  return (
    <>
      <div className="flex items-center gap-4">
        <button type="button" className="tile tile--pic" style={{ width: 'clamp(6rem, 24vmin, 9rem)' }} onClick={() => void say(task.word)} aria-label={`Obrázek: ${task.word}`}>
          <EmojiPic e={task.emoji} label={task.word} />
        </button>
        <SpeakButton text={task.word} size={64} label="Poslechnout slovo" />
      </div>
      <Builder
        target={task.syllables}
        tiles={task.tiles}
        api={api}
        big
        showHint={hint}
        render={(u) => caseWord(u, api.mode)}
        onPiece={(u) => void say(u)}
        onComplete={() => api.done({ say: `${task.syllables.join(' ')}. ${task.word}!` })}
      />
      {!hint && api.mistakes >= 1 ? (
        <button type="button" className="g92-btn g92-btn--ghost" onClick={() => setHint(true)}>
          <span aria-hidden="true">👀</span> Nápověda
        </button>
      ) : null}
    </>
  );
}

export const skladejSlabiky = defineActivity<SkladejSlabikyTask>({
  meta: ACTIVITY_BY_ID.get('skladej-slabiky')!,
  generate: genSkladejSlabiky,
  Component: ({ task, api }) => <SkladejSlabikyView task={task} api={api} />,
  instruction: () => 'Slož slovo ze slabik',
  prompt: (t) => t.word,
  review: (t) => ({ label: hyphenate(t.word), say: t.word, emoji: t.emoji }),
});
