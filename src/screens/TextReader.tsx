import { useEffect, useRef, useState } from 'react';
import { SpeakerIcon } from '../components/ui';
import { confirmDialog, sfx } from '../kit';
import { href } from '../lib/router';
import { say, speech, useSpeech } from '../lib/speech';
import { setTexts, useTexts } from '../lib/store';

type Mode = 'upper' | 'lower' | 'script';
const MAX = 10;

const DIGIT_CODES: Record<string, number> = {};
for (let i = 1; i <= 10; i++) {
  DIGIT_CODES[`Digit${i % 10}`] = i - 1;
  DIGIT_CODES[`Numpad${i % 10}`] = i - 1;
}

function convert(v: string, m: Mode): string {
  if (m === 'upper') return v.toLocaleUpperCase('cs-CZ');
  if (m === 'lower') return v.toLocaleLowerCase('cs-CZ');
  return v;
}

/**
 * „Piš a poslouchej“ – dítě (nebo rodič) napíše cokoli a aplikace to přečte.
 * Historie posledních 10 textů (posun, mazání), klávesy 1–0 přehrají historii,
 * Ctrl+Enter přečte, Esc smaže rozepsaný text.
 */
export function TextReader() {
  const texts = useTexts();
  const { speaking } = useSpeech();
  const [mode, setMode] = useState<Mode>('upper');
  const [value, setValue] = useState('');
  const [playing, setPlaying] = useState<number | 'input' | null>(null);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!speaking) setPlaying(null);
  }, [speaking]);

  useEffect(() => {
    ta.current?.focus();
  }, []);

  const speakText = (t: string, who: number | 'input') => {
    if (!t.trim()) return;
    setPlaying(who);
    void say(t, { rate: 0.95 });
  };

  const save = () => {
    const t = value.trim();
    if (!t) return;
    setTexts([t, ...texts.filter((x) => x !== t)].slice(0, MAX));
    sfx.pop();
    setValue('');
    speech.cancel();
    ta.current?.focus();
  };

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= texts.length) return;
    const next = [...texts];
    [next[i], next[j]] = [next[j]!, next[i]!];
    setTexts(next);
  };

  const remove = (i: number) => setTexts(texts.filter((_, k) => k !== i));

  const clearAll = async () => {
    if (await confirmDialog({ title: 'Vymazat celou historii?', message: 'Uložené texty se smažou.', confirmLabel: 'Vymazat', danger: true })) setTexts([]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        speakText(value, 'input');
        return;
      }
      if (e.key === 'Escape') {
        setValue('');
        speech.cancel();
        ta.current?.focus();
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing = target?.closest('input, textarea, [contenteditable="true"]');
      if (typing || e.ctrlKey || e.metaKey || e.altKey) return;
      const idx = DIGIT_CODES[e.code];
      if (idx !== undefined && idx < texts.length) {
        e.preventDefault();
        speakText(texts[idx]!, idx);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const script = mode === 'script' ? 'script' : '';
  return (
    <div className="screen screen--narrow" style={{ ['--lvl' as string]: '#8b5cf6' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <a className="g92-btn g92-btn--secondary g92-btn--icon" href={href('')} aria-label="Zpět domů">
            ←
          </a>
          <h1 className="text-3xl font-black">Piš a poslouchej</h1>
        </div>
        <div className="g92-segmented" role="group" aria-label="Písmo">
          {(
            [
              ['upper', 'VELKÁ'],
              ['lower', 'malá'],
              ['script', 'psací'],
            ] as [Mode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              className={m === 'script' ? 'script' : ''}
              style={{ fontWeight: m === 'script' ? 400 : 900, minWidth: 70 }}
              onClick={() => {
                setMode(m);
                setValue((v) => convert(v, m));
                ta.current?.focus();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="panel p-4 sm:p-5">
        <label htmlFor="reader-input" className="g92-label mb-2 block">
          Napiš slovo nebo větu
        </label>
        <textarea
          id="reader-input"
          ref={ta}
          className={`g92-textarea w-full ${script}`}
          rows={4}
          spellCheck={false}
          autoCapitalize="off"
          value={value}
          onChange={(e) => {
            const el = e.target;
            const s = el.selectionStart;
            const en = el.selectionEnd;
            setValue(convert(el.value, mode));
            requestAnimationFrame(() => el.setSelectionRange(s, en));
          }}
          style={{ fontSize: script ? 'clamp(1.4rem, 5vw, 2rem)' : 'clamp(1.6rem, 6vw, 2.6rem)', fontWeight: 900, lineHeight: script ? 1.8 : 1.3, minHeight: '8rem' }}
          placeholder={mode === 'upper' ? 'MÁMA MÁ MÍČ' : 'máma má míč'}
        />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <button
            type="button"
            className={`speak-btn ${playing === 'input' && speaking ? 'is-speaking' : ''}`}
            style={{ ['--speak-size' as string]: '72px' }}
            onClick={() => speakText(value, 'input')}
            disabled={!value.trim()}
            aria-label="Přečíst text"
          >
            <SpeakerIcon />
          </button>
          <button type="button" className="g92-btn g92-btn--secondary g92-btn--lg" onClick={save} disabled={!value.trim()}>
            <span aria-hidden="true">💾</span> Uložit
          </button>
          <p className="text-sm text-muted flex-1 min-w-[12rem]">
            <kbd className="g92-kbd">Ctrl</kbd>+<kbd className="g92-kbd">Enter</kbd> přečte text, klávesy <kbd className="g92-kbd">1</kbd>–<kbd className="g92-kbd">0</kbd> přehrají historii,{' '}
            <kbd className="g92-kbd">Esc</kbd> smaže.
          </p>
        </div>
      </div>

      {texts.length ? (
        <section className="panel p-4 sm:p-5 mt-5" aria-labelledby="hist-h">
          <div className="flex items-center justify-between mb-3">
            <h2 id="hist-h" className="font-black text-lg">
              Posledních {MAX} textů
            </h2>
            <button type="button" className="g92-btn g92-btn--ghost g92-btn--sm" onClick={() => void clearAll()}>
              Vymazat vše
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {texts.map((t, i) => (
              <li key={`${t}-${i}`} className="flex items-center gap-2 rounded-2xl bg-surface-2 p-2">
                <div className="flex flex-col">
                  <button type="button" className="g92-btn g92-btn--ghost g92-btn--sm" style={{ minHeight: 30, padding: '0 8px' }} disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Posunout nahoru: ${t}`}>
                    ▲
                  </button>
                  <button
                    type="button"
                    className="g92-btn g92-btn--ghost g92-btn--sm"
                    style={{ minHeight: 30, padding: '0 8px' }}
                    disabled={i === texts.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Posunout dolů: ${t}`}
                  >
                    ▼
                  </button>
                </div>
                <kbd className="g92-kbd" title={`Klávesa ${i === 9 ? 0 : i + 1}`}>
                  {i === 9 ? 0 : i + 1}
                </kbd>
                <span className={`flex-1 min-w-0 font-black text-xl break-words ${script}`}>{convert(t, mode)}</span>
                <button type="button" className="g92-btn g92-btn--ghost g92-btn--icon" onClick={() => remove(i)} aria-label={`Smazat: ${t}`} title="Smazat">
                  🗑
                </button>
                <button
                  type="button"
                  className={`speak-btn ${playing === i && speaking ? 'is-speaking' : ''}`}
                  style={{ ['--speak-size' as string]: '48px' }}
                  onClick={() => speakText(t, i)}
                  aria-label={`Přečíst: ${t}`}
                >
                  <SpeakerIcon />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-muted text-center mt-6">Uložené texty se objeví tady – pak je stačí jen ťuknout a přečtou se.</p>
      )}
    </div>
  );
}
