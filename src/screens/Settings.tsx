import { useState } from 'react';
import { HoldButton, HomeLink } from '../components/ui';
import { VoiceHelp } from '../components/VoiceHelp';
import { ALPHABET, LETTER_KEYS, LETTER_PRESETS } from '../data/alphabet';
import { confirmDialog, openSettingsDialog, resetApp, toast, KIT_VERSION } from '../kit';
import { CESTINA_SETTINGS } from '../lib/settingsSection';
import { say, speech, useSpeech } from '../lib/speech';
import { setAppSettings, useAppSettings, useProgress, type TraceTolerance } from '../lib/store';

const NUMBERS: [number, string][] = [
  [3, 'tři'],
  [4, 'čtyři'],
  [5, 'pět'],
  [6, 'šest'],
  [7, 'sedm'],
  [8, 'osm'],
  [9, 'devět'],
];

/**
 * Rodičovská zóna: podržet tlačítko 3 s a pak ťuknout na číslo napsané slovem (dítě, které teprve
 * čte, to nezvládne náhodou) – CESTINA-21.
 */
function ParentGate({ onPass }: { onPass: () => void }) {
  const [step, setStep] = useState<'hold' | 'number'>('hold');
  const [task] = useState(() => {
    const shuffled = [...NUMBERS].sort(() => Math.random() - 0.5);
    const target = shuffled[0]!;
    const options = shuffled.slice(0, 4).map(([n]) => n).sort(() => Math.random() - 0.5);
    return { target, options };
  });
  const [wrong, setWrong] = useState(false);
  if (step === 'hold') return <HoldButton ms={3000} onDone={() => setStep('number')}>Podržte 3 sekundy</HoldButton>;
  return (
    <div className="flex flex-col items-center gap-3" role="group" aria-label="Kontrola pro rodiče">
      <p className="font-bold">
        Ťukněte na číslo <span className="text-accent-text">{task.target[1]}</span>
      </p>
      <div className="flex gap-2">
        {task.options.map((n) => (
          <button
            key={n}
            type="button"
            className="g92-btn g92-btn--secondary g92-btn--lg"
            style={{ minWidth: 64, fontSize: '1.4rem' }}
            onClick={() => {
              if (n === task.target[0]) onPass();
              else {
                setWrong(true);
                setStep('hold');
              }
            }}
          >
            {n}
          </button>
        ))}
      </div>
      {wrong ? <p className="text-sm text-muted">To nebylo ono – zkuste to znovu.</p> : null}
    </div>
  );
}

const TOL: { v: TraceTolerance; label: string }[] = [
  { v: 'easy', label: 'Snadné' },
  { v: 'normal', label: 'Střední' },
  { v: 'hard', label: 'Přísné' },
];

export function Settings() {
  const s = useAppSettings();
  const p = useProgress();
  const { status, voices, activeVoice } = useSpeech();
  const [unlocked, setUnlocked] = useState(false);
  const letterSet = new Set(s.letters);

  const toggleLetter = (k: string) => {
    const next = letterSet.has(k) ? s.letters.filter((x) => x !== k) : LETTER_KEYS.filter((x) => letterSet.has(x) || x === k);
    if (next.length < 4) {
      toast('Nech zapnutá aspoň 4 písmena.', { variant: 'danger' });
      return;
    }
    setAppSettings({ letters: next });
  };

  const resetProgress = async () => {
    const ok = await confirmDialog({
      title: 'Smazat celý postup?',
      message: 'Smažou se hvězdičky, nálepky a postup po písmenech. Nejde to vrátit.',
      confirmLabel: 'Smazat',
      danger: true,
    });
    if (ok) {
      // Kit smaže všechny klíče g92:cestina:* (postup, denní cíl a série, „naposledy hráno“ v menu – CESTINA-10);
      // nastavení, napsané texty, jméno a skrytý banner zůstávají. Reload = čisté cache úložiště.
      resetApp('cestina', { keep: ['settings', 'texts', '__version', 'voice-banner', 'name'] });
      location.reload();
    }
  };

  const voiceStatus =
    status === 'ready' ? `✅ Český hlas: ${voices.find((v) => v.uri === activeVoice)?.name ?? voices[0]?.name ?? ''}` : status === 'loading' ? '⏳ Načítám hlasy…' : status === 'no-czech' ? '🔇 Český hlas nenalezen' : '🔇 Prohlížeč neumí mluvit';

  return (
    <div className="screen screen--narrow">
      <div className="flex items-center gap-3 mb-5">
        <HomeLink />
        <h1 className="text-3xl font-black">Pro rodiče</h1>
      </div>

      <section className="panel p-5 flex flex-wrap items-center gap-4" aria-label="Základní nastavení">
        <p className="flex-1 min-w-[14rem] text-sm text-muted">
          Písmo, zvuky, předčítání, vzhled a jméno dítěte jsou v nastavení aplikace (⚙ nahoře). Tady je to, co se hodí jen rodičům.
        </p>
        <button type="button" className="g92-btn g92-btn--secondary" onClick={() => openSettingsDialog({ appId: 'cestina', ...CESTINA_SETTINGS, more: undefined })}>
          <span aria-hidden="true">⚙</span> Nastavení aplikace
        </button>
      </section>

      {!unlocked ? (
        <section className="panel p-6 mt-5 text-center flex flex-col items-center gap-3">
          <p className="text-4xl" aria-hidden="true">
            👨‍👩‍👦
          </p>
          <p className="font-black text-xl">Zamčeno pro děti</p>
          <p className="text-muted text-sm max-w-[26rem]">Hlas, délka cvičení, výběr písmen a smazání postupu. Pro odemčení podržte tlačítko a pak ťukněte na správné číslo.</p>
          <ParentGate onPass={() => setUnlocked(true)} />
        </section>
      ) : (
        <>
          <section className="panel p-5 mt-5 flex flex-col gap-5" aria-labelledby="set-voice">
            <h2 id="set-voice" className="text-xl font-black">
              Hlas
            </h2>
            <p className="font-bold">{voiceStatus}</p>
            {voices.length > 1 ? (
              <div className="g92-field">
                <label className="g92-label" htmlFor="voice">
                  Vybrat hlas
                </label>
                <select
                  id="voice"
                  className="g92-select"
                  value={s.voiceURI}
                  onChange={(e) => {
                    setAppSettings({ voiceURI: e.target.value });
                    speech.configure({ voiceURI: e.target.value });
                    void say('Ahoj! Takhle zní můj hlas.');
                  }}
                >
                  <option value="">Automaticky (nejlepší český)</option>
                  {voices.map((v) => (
                    <option key={v.uri} value={v.uri}>
                      {v.name} {v.local ? '' : '(online)'}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="g92-field">
              <label className="g92-label" htmlFor="rate">
                Rychlost řeči: {Math.round(s.rate * 100)} %
              </label>
              <input
                id="rate"
                type="range"
                className="g92-range"
                min={0.6}
                max={1.2}
                step={0.05}
                value={s.rate}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setAppSettings({ rate: r });
                  speech.configure({ rate: r });
                }}
                onPointerUp={() => void say('Máma má míč.')}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="g92-btn g92-btn--soft" onClick={() => void say('Ahoj! Já jsem tvoje čeština. Bé, cé, čé. Máma má míč.')}>
                <span aria-hidden="true">🔊</span> Vyzkoušet hlas
              </button>
            </div>
            <p className="g92-hint">Automatické předčítání zadání se zapíná a vypíná v nastavení aplikace (⚙ → Předčítání); ťuknutí na 🔊 mluví vždy.</p>
            <label className="g92-switch-row">
              <span>
                <span className="font-bold block">Titulky</span>
                <span className="text-sm text-muted">Ukazovat dole, co aplikace říká (i když hlas funguje).</span>
              </span>
              <input type="checkbox" className="g92-toggle" role="switch" checked={s.captions} onChange={(e) => setAppSettings({ captions: e.target.checked })} />
            </label>
            <details>
              <summary className="font-bold cursor-pointer">Jak doinstalovat český hlas</summary>
              <div className="mt-2">
                <VoiceHelp />
              </div>
            </details>
          </section>

          <section className="panel p-5 mt-5 flex flex-col gap-5" aria-labelledby="set-play">
            <h2 id="set-play" className="text-xl font-black">
              Cvičení
            </h2>
            <div className="g92-field">
              <span className="g92-label">Počet úloh v jednom cvičení</span>
              <div className="g92-segmented" role="group" aria-label="Počet úloh">
                {[5, 8, 10, 15].map((n) => (
                  <button key={n} type="button" aria-pressed={s.sessionLength === n} onClick={() => setAppSettings({ sessionLength: n })} style={{ minWidth: 56 }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="g92-field">
              <span className="g92-label">Obtahování písmen</span>
              <div className="g92-segmented" role="group" aria-label="Přesnost obtahování">
                {TOL.map((t) => (
                  <button key={t.v} type="button" aria-pressed={s.traceTolerance === t.v} onClick={() => setAppSettings({ traceTolerance: t.v })}>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="g92-hint">Snadné = velká tolerance pro malé prstíky.</p>
            </div>
            <div className="g92-field">
              <span className="g92-label">
                Procvičovaná písmena ({s.letters.length}/{LETTER_KEYS.length})
              </span>
              <p className="g92-hint mb-2">
                Cvičení s písmeny, slabikami i slovy se přizpůsobí písmenům, která dítě už zná – slova se berou přednostně z nich, a když jich je
                málo, přidají se ta s co nejméně neznámými písmeny. Věty, Pravda nebo ne? a Rýmy výběr nepoužívají.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {LETTER_PRESETS.map((pr) => (
                  <button
                    key={pr.id}
                    type="button"
                    className="g92-chip"
                    aria-pressed={pr.keys.length === s.letters.length && pr.keys.every((k) => letterSet.has(k))}
                    onClick={() => setAppSettings({ letters: [...pr.keys] })}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))' }}>
                {ALPHABET.map((l) => (
                  <button
                    key={l.key}
                    type="button"
                    className="g92-chip justify-center"
                    aria-pressed={letterSet.has(l.key)}
                    onClick={() => toggleLetter(l.key)}
                    aria-label={`${l.say}: ${letterSet.has(l.key) ? 'zapnuto' : 'vypnuto'}`}
                    style={{ fontWeight: 900, fontSize: '1.1rem', minHeight: 44 }}
                  >
                    {l.upper}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="panel p-5 mt-5 flex flex-col gap-3" aria-labelledby="set-data">
            <h2 id="set-data" className="text-xl font-black">
              Postup
            </h2>
            <p className="text-sm text-muted">
              Dokončených cvičení: {p.totalSessions} · postup se ukládá jen v tomto zařízení (v prohlížeči).
            </p>
            <button type="button" className="g92-btn g92-btn--danger self-start" onClick={() => void resetProgress()}>
              Smazat postup
            </button>
          </section>
        </>
      )}
      <p className="text-center text-xs text-subtle mt-8">Čeština pro Adámka · g92 kit {KIT_VERSION}</p>
    </div>
  );
}
