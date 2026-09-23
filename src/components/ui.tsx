import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useRoute } from '../lib/router';
import { say, useSpeech } from '../lib/speech';
import { setAppSettings, useAppSettings } from '../lib/store';
import { syllabifyWord } from '../lib/syllables';
import { caseLetter, caseSentence, caseWord, type LetterCase } from '../lib/text';
import { sfx } from '../kit';

// ─── Ikony ─────────────────────────────────────────────────────────────────

export function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4Z" fill="currentColor" />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18.3 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" fill="currentColor" fillOpacity=".15" />
      <path d="M10 20v-5.5h4V20" />
    </svg>
  );
}

/** Návrat na domovskou obrazovku aplikace – 🏠 „Domů“ (liška „‹ Menu“ v liště vede ven z aplikace). */
export function HomeLink() {
  return (
    <a className="g92-btn g92-btn--secondary home-link" href="#/" aria-label="Domů" title="Domů">
      <span style={{ width: 22, height: 22, display: 'inline-grid' }}>
        <HomeIcon />
      </span>
      <span className="home-link-label">Domů</span>
    </a>
  );
}

// ─── Mluvící tlačítko ─────────────────────────────────────────────────────

export function SpeakButton({
  text,
  rate,
  size = 64,
  soft,
  label,
  caption,
  className = '',
}: {
  text: string | (() => string);
  rate?: number;
  size?: number;
  soft?: boolean;
  label?: string;
  caption?: string;
  className?: string;
}) {
  const { speaking } = useSpeech();
  const [mine, setMine] = useState(false);
  useEffect(() => {
    if (!speaking) setMine(false);
  }, [speaking]);
  const t = () => (typeof text === 'function' ? text() : text);
  return (
    <button
      type="button"
      className={`speak-btn ${soft ? 'speak-btn--soft' : ''} ${mine && speaking ? 'is-speaking' : ''} ${className}`}
      style={{ ['--speak-size' as string]: `${size}px` }}
      aria-label={label ?? 'Přečíst nahlas'}
      title={label ?? 'Přečíst nahlas'}
      onClick={(e) => {
        e.stopPropagation();
        setMine(true);
        void say(t(), { rate, caption });
      }}
    >
      <SpeakerIcon />
    </button>
  );
}

// ─── Hvězdičky ────────────────────────────────────────────────────────────

export function MiniStars({ n, max = 3, label }: { n: number; max?: number; label?: string }) {
  return (
    <span className="mini-stars" role="img" aria-label={label ?? `${n} z ${max} hvězd`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`mini-star ${i < n ? 'is-on' : ''}`} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

export function BigStars({ n }: { n: number }) {
  return (
    <div className="big-stars" role="img" aria-label={`${n} ze 3 hvězd`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`big-star ${i < n ? 'is-on' : ''}`} style={{ animationDelay: `${250 + i * 280}ms` }} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

export function ProgressDots({ states, current }: { states: ('ok' | 'miss' | 'todo')[]; current: number }) {
  // Hodně úloh (> 10) = souvislý proužek s počtem; tečky by se na telefonu nevešly (CESTINA-15).
  if (states.length > 10) {
    const done = states.filter((s) => s !== 'todo').length;
    return (
      <div className="progress-strip" role="progressbar" aria-valuemin={0} aria-valuemax={states.length} aria-valuenow={current} aria-label="Postup cvičením">
        <div className="progress-strip-track">
          {states.map((s, i) => (
            <span key={i} className={`progress-strip-seg ${i === current ? 'is-current' : ''} ${s === 'ok' ? 'is-ok' : s === 'miss' ? 'is-miss' : ''}`} />
          ))}
        </div>
        <span className="progress-strip-count" aria-hidden="true">
          {Math.min(done + 1, states.length)}/{states.length}
        </span>
      </div>
    );
  }
  return (
    <div className="dots" role="progressbar" aria-valuemin={0} aria-valuemax={states.length} aria-valuenow={current} aria-label="Postup cvičením">
      {states.map((s, i) => (
        <span key={i} className={`dot ${i === current ? 'is-current' : ''} ${s === 'ok' ? 'is-ok' : s === 'miss' ? 'is-miss' : ''}`} />
      ))}
    </div>
  );
}

// ─── Text v písmu dítěte ──────────────────────────────────────────────────

export function scriptClass(mode: LetterCase): string {
  return mode === 'script' ? 'script' : '';
}

/** Slovo v aktuálním písmu, volitelně s barevnými slabikami / se spojovníky. */
export function WordText({
  word,
  mode,
  syllables,
  hyphens,
}: {
  word: string;
  mode: LetterCase;
  syllables?: boolean;
  hyphens?: boolean;
}) {
  const text = caseWord(word, mode);
  if (!syllables && !hyphens) return <>{text}</>;
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, pi) => {
        if (/^\s+$/.test(p)) return <span key={pi}> </span>;
        const syl = syllabifyWord(p);
        return (
          <span key={pi}>
            {syl.map((s, i) => (
              <span key={i}>
                {i > 0 && hyphens ? <span className="syl-sep">-</span> : null}
                <span className={syllables ? (i % 2 === 0 ? 'syl-a' : 'syl-b') : ''}>{s}</span>
              </span>
            ))}
          </span>
        );
      })}
    </>
  );
}

export function SentenceText({ text, mode }: { text: string; mode: LetterCase }) {
  return <>{caseSentence(text, mode)}</>;
}

export function LetterText({ letter, mode }: { letter: { upper: string; lower: string }; mode: LetterCase }) {
  return <>{caseLetter(letter, mode)}</>;
}

// ─── Přepínač písma ───────────────────────────────────────────────────────

const CASES: { v: LetterCase; label: string; show: string }[] = [
  { v: 'upper', label: 'Velká tiskací písmena', show: 'A' },
  { v: 'lower', label: 'Malá tiskací písmena', show: 'a' },
  { v: 'script', label: 'Psací písmo', show: 'a' },
];

export function CaseSwitch({ compact }: { compact?: boolean }) {
  const s = useAppSettings();
  return (
    <div className="g92-segmented" role="group" aria-label="Písmo" style={compact ? { padding: 3 } : undefined}>
      {CASES.map((c) => (
        <button
          key={c.v}
          type="button"
          aria-pressed={s.letterCase === c.v}
          aria-label={c.label}
          title={c.label}
          onClick={() => {
            sfx.tap();
            setAppSettings({ letterCase: c.v });
          }}
          className={c.v === 'script' ? 'script' : ''}
          style={{
            fontWeight: c.v === 'script' ? 400 : 900,
            fontSize: c.v === 'script' ? '1.05rem' : '1.3rem',
            minWidth: compact ? 40 : 52,
            minHeight: compact ? 38 : 44,
            paddingInline: compact ? 8 : 12,
          }}
        >
          {c.show}
        </button>
      ))}
    </div>
  );
}

// ─── Titulek řeči a stav hlasu ────────────────────────────────────────────

/** Když chybí český hlas (nebo jsou zapnuté titulky), ukáže, co aplikace „říká“. */
export function SpeechCaption() {
  const { caption, status } = useSpeech();
  const settings = useAppSettings();
  const [visible, setVisible] = useState<{ text: string; at: number } | null>(null);
  const show = settings.captions || status === 'no-czech' || status === 'unsupported';
  const route = useRoute();
  // Nová obrazovka = starý titulek pryč.
  useEffect(() => setVisible(null), [route]);
  useEffect(() => {
    if (!caption || !show) return;
    setVisible(caption);
    const t = window.setTimeout(() => setVisible((v) => (v === caption ? null : v)), Math.min(7000, 2600 + caption.text.length * 70));
    return () => window.clearTimeout(t);
  }, [caption, show]);
  if (!visible || !show) return null;
  return (
    <div className={`caption ${route.path[0] === 'hra' ? 'caption--top' : ''}`} role="status" aria-live="polite">
      <span aria-hidden="true">🗣️</span>
      <span>{visible.text}</span>
    </div>
  );
}

const BANNER_KEY = 'g92:cestina:voice-banner';

export function SpeechBanner({ onHelp }: { onHelp?: () => void }) {
  const { status } = useSpeech();
  // Zavření si pamatujeme trvale (CESTINA-22); na domovské obrazovce pak zůstane jen malý čip 🔇.
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(BANNER_KEY) === '0';
    } catch {
      return false;
    }
  });
  if (hidden || (status !== 'no-czech' && status !== 'unsupported')) return null;
  return (
    <div className="panel flex items-start gap-3 p-4 mb-4" role="note" style={{ borderColor: 'var(--g92-warning)' }}>
      <span className="text-3xl" aria-hidden="true">
        🔇
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold">{status === 'unsupported' ? 'Tento prohlížeč neumí mluvit.' : 'Chybí český hlas.'}</p>
        <p className="text-muted text-sm mt-1">
          Aplikace funguje i tak – co by řekla, ukáže dole jako titulek, ať to můžete dítěti přečíst.
          {onHelp ? ' ' : ''}
          {onHelp ? (
            <button type="button" className="underline font-bold text-accent-text" onClick={onHelp}>
              Jak zapnout český hlas?
            </button>
          ) : null}
        </p>
      </div>
      <button
        type="button"
        className="g92-btn g92-btn--ghost g92-btn--icon g92-btn--sm"
        aria-label="Skrýt upozornění"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(BANNER_KEY, '0');
          } catch {
            /* ignore */
          }
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Podržením odemknout (rodičovská zóna) ────────────────────────────────

export function HoldButton({ onDone, children, ms = 1600 }: { onDone: () => void; children: ReactNode; ms?: number }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(0);
  const start = () => {
    setHolding(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      sfx.levelUp();
      onDone();
    }, ms);
  };
  const stop = () => {
    setHolding(false);
    window.clearTimeout(timer.current);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      className={`g92-btn g92-btn--secondary g92-btn--lg hold-btn ${holding ? 'is-holding' : ''}`}
      style={{ ['--hold-ms' as string]: `${ms}ms` }}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) start();
      }}
      onKeyUp={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="hold-fill" aria-hidden="true" />
      <span className="relative">{children}</span>
    </button>
  );
}

export function EmojiPic({ e, label, className = '' }: { e: string; label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={className}>
      {e}
    </span>
  );
}
