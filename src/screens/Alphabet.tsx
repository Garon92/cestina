import { useEffect, useState } from 'react';
import { Modal } from '../components/Modal';
import { MiniStars, SpeakButton, HomeLink } from '../components/ui';
import { ALPHABET, type Letter } from '../data/alphabet';
import { sfx } from '../kit';
import { MASTERY_LABEL, letterMastery } from '../lib/progress';
import { navigate } from '../lib/router';
import { say } from '../lib/speech';
import { setAppSettings, useAppSettings, useProgress } from '../lib/store';

type View = 'upper' | 'lower' | 'both';

/** Ukázkové slovo se zvýrazněným písmenem. */
function HighlightWord({ letter, script }: { letter: Letter; script: boolean }) {
  const w = letter.word;
  const i = w.indexOf(letter.lower);
  const n = letter.lower.length;
  return (
    <span className={script ? 'script' : ''}>
      {w.slice(0, i)}
      <span style={{ color: 'var(--lvl)', textDecoration: 'underline', textUnderlineOffset: '0.15em' }}>{w.slice(i, i + n)}</span>
      {w.slice(i + n)}
    </span>
  );
}

export function Alphabet() {
  const settings = useAppSettings();
  const p = useProgress();
  const [view, setView] = useState<View>(settings.letterCase === 'upper' ? 'upper' : settings.letterCase === 'lower' ? 'lower' : 'both');
  const [open, setOpen] = useState<number | null>(null);
  const script = settings.letterCase === 'script';
  const cur = open !== null ? ALPHABET[open]! : null;

  const show = (i: number) => {
    const l = ALPHABET[i]!;
    setOpen(i);
    sfx.pop();
    void say(`${l.say}. ${l.word}.`);
  };

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      // Jen když je navrchu náš detail písmene, ne kitový dialog (nastavení, nápověda).
      if (document.querySelector('dialog[open]:not([aria-labelledby="letter-detail-title"])')) return;
      if (e.key === 'ArrowRight') show((open + 1) % ALPHABET.length);
      if (e.key === 'ArrowLeft') show((open - 1 + ALPHABET.length) % ALPHABET.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="screen" style={{ ['--lvl' as string]: '#e0479e' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <HomeLink />
          <h1 className="text-3xl font-black">Abeceda</h1>
          <SpeakButton text="Ťukni na písmenko a uslyšíš, jak se jmenuje." size={44} soft />
        </div>
        <div className="g92-segmented" role="group" aria-label="Zobrazení">
          {(
            [
              ['upper', 'VELKÁ'],
              ['lower', 'malá'],
              ['both', 'Obě'],
            ] as [View, string][]
          ).map(([v, label]) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} style={{ fontWeight: 900, minWidth: 64 }}>
              {label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={script}
            className="script"
            title="Psací písmo"
            aria-label="Psací písmo"
            onClick={() => setAppSettings({ letterCase: script ? 'upper' : 'script' })}
            style={{ minWidth: 64 }}
          >
            Aa
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(4.6rem, 22%), 1fr))' }}>
        {ALPHABET.map((l, i) => {
          const m = letterMastery(p.letters[l.key]);
          return (
            <button
              key={l.key}
              type="button"
              className={`letter-cell mastery-${m} ${script ? 'script' : ''}`}
              onClick={() => show(i)}
              aria-label={`${l.say}${m === 3 ? ', umím' : ''}`}
              style={script ? { fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' } : undefined}
            >
              {view === 'upper' ? l.upper : view === 'lower' ? l.lower : `${l.upper}${l.lower}`}
              {m === 3 ? (
                <span className="star-mark" aria-hidden="true">
                  ⭐
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted mt-4 text-center">Barva ukazuje, jak ti písmenko jde: šedá = ještě nezkoušené, žlutá = učím se, modrá = skoro, zelená = umím ⭐</p>

      <Modal
        open={cur !== null}
        onClose={() => setOpen(null)}
        title={cur ? `Písmeno ${cur.upper}` : ''}
        labelledBy="letter-detail-title"
        footer={
          cur ? (
            <>
              <button type="button" className="g92-btn g92-btn--ghost g92-btn--icon" aria-label="Předchozí písmeno" onClick={() => show((open! - 1 + ALPHABET.length) % ALPHABET.length)}>
                ◀
              </button>
              <button
                type="button"
                className="g92-btn"
                onClick={() => {
                  setOpen(null);
                  navigate(`hra/obtahuj?pismeno=${encodeURIComponent(cur.key)}`);
                }}
                disabled={cur.key === 'CH'}
              >
                <span aria-hidden="true">✍️</span> Obtahuj
              </button>
              <button type="button" className="g92-btn g92-btn--ghost g92-btn--icon" aria-label="Další písmeno" onClick={() => show((open! + 1) % ALPHABET.length)}>
                ▶
              </button>
            </>
          ) : null
        }
      >
        {cur ? (
          <div className="flex flex-col items-center gap-3 text-center" style={{ ['--lvl' as string]: '#e0479e' }}>
            <div className="flex items-end gap-5">
              <span className="prompt-letter" style={{ fontSize: 'clamp(5rem, 22vw, 8rem)' }}>
                {cur.upper}
              </span>
              <span className="prompt-letter" style={{ fontSize: 'clamp(4rem, 18vw, 6.5rem)', color: 'color-mix(in oklab, var(--lvl) 70%, var(--g92-text))' }}>
                {cur.lower}
              </span>
            </div>
            <div className="script text-4xl" aria-label="psací písmo" style={{ lineHeight: 1.6 }}>
              {cur.upper} {cur.lower}
            </div>
            <div className="flex items-center gap-3">
              <SpeakButton text={cur.say} size={56} label={`Jak se čte: ${cur.say}`} />
              <span className="font-bold text-muted">„{cur.say}“</span>
            </div>
            <button type="button" className="tile" style={{ padding: '0.6rem 1.2rem', flexDirection: 'row', gap: '0.8rem' }} onClick={() => void say(cur.word)}>
              <span className="text-5xl" aria-hidden="true">
                {cur.emoji}
              </span>
              <span className="text-3xl font-black">
                <HighlightWord letter={cur} script={script} />
              </span>
            </button>
            <div className="flex items-center gap-2 text-sm font-bold text-muted">
              <MiniStars n={letterMastery(p.letters[cur.key])} />
              {MASTERY_LABEL[letterMastery(p.letters[cur.key])]}
              {p.letters[cur.key]?.traced ? ` · obtaženo ${p.letters[cur.key]!.traced}×` : ''}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
