import { useState } from 'react';
import { CaseSwitch, HoldButton } from '../components/ui';
import { VoiceHelp } from '../components/VoiceHelp';
import { ALPHABET, LETTER_KEYS, LETTER_PRESETS } from '../data/alphabet';
import { confirmDialog, openSettingsDialog, setSettings, toast, vocative, KIT_VERSION } from '../kit';
import { emptyProgress } from '../lib/progress';
import { href } from '../lib/router';
import { say, speech, useSpeech } from '../lib/speech';
import { childName, setAppSettings, setProgress, useAppSettings, useG92Settings, useProgress, type TraceTolerance } from '../lib/store';

const TOL: { v: TraceTolerance; label: string }[] = [
  { v: 'easy', label: 'Snadné' },
  { v: 'normal', label: 'Střední' },
  { v: 'hard', label: 'Přísné' },
];

export function Settings() {
  const s = useAppSettings();
  const g = useG92Settings();
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
      setProgress(emptyProgress());
      toast('Postup smazán.', { variant: 'success' });
    }
  };

  const voiceStatus =
    status === 'ready' ? `✅ Český hlas: ${voices.find((v) => v.uri === activeVoice)?.name ?? voices[0]?.name ?? ''}` : status === 'loading' ? '⏳ Načítám hlasy…' : status === 'no-czech' ? '🔇 Český hlas nenalezen' : '🔇 Prohlížeč neumí mluvit';

  return (
    <div className="screen screen--narrow">
      <div className="flex items-center gap-3 mb-5">
        <a className="g92-btn g92-btn--secondary g92-btn--icon" href={href('')} aria-label="Zpět domů">
          ←
        </a>
        <h1 className="text-3xl font-black">Nastavení</h1>
      </div>

      <section className="panel p-5 flex flex-col gap-5" aria-labelledby="set-kid">
        <h2 id="set-kid" className="text-xl font-black">
          Písmo a vzhled
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">Písmo</p>
            <p className="text-sm text-muted">Jak se píšou písmenka a slova ve všech cvičeních.</p>
          </div>
          <CaseSwitch />
        </div>
        <label className="g92-switch-row">
          <span>
            <span className="font-bold block">Barevné slabiky</span>
            <span className="text-sm text-muted">Slova ve cvičení „Co je napsáno?“ střídají barvu po slabikách.</span>
          </span>
          <input type="checkbox" className="g92-toggle" role="switch" checked={s.syllableColors} onChange={(e) => setAppSettings({ syllableColors: e.target.checked })} />
        </label>
        <label className="g92-switch-row">
          <span className="font-bold">Zvuky</span>
          <input type="checkbox" className="g92-toggle" role="switch" checked={g.sound} onChange={(e) => setSettings({ sound: e.target.checked })} />
        </label>
        <button type="button" className="g92-btn g92-btn--secondary self-start" onClick={() => openSettingsDialog({ hideName: true })}>
          <span aria-hidden="true">🎨</span> Vzhled, hlasitost, animace…
        </button>
      </section>

      {!unlocked ? (
        <section className="panel p-6 mt-5 text-center flex flex-col items-center gap-3">
          <p className="text-4xl" aria-hidden="true">
            👨‍👩‍👦
          </p>
          <p className="font-black text-xl">Pro rodiče</p>
          <p className="text-muted text-sm max-w-[26rem]">Hlas, délka cvičení, výběr písmen a smazání postupu. Pro odemčení podržte tlačítko.</p>
          <HoldButton onDone={() => setUnlocked(true)}>Podržte pro odemčení</HoldButton>
        </section>
      ) : (
        <>
          <section className="panel p-5 mt-5 flex flex-col gap-5" aria-labelledby="set-name">
            <h2 id="set-name" className="text-xl font-black">
              Dítě
            </h2>
            <div className="g92-field">
              <label className="g92-label" htmlFor="child-name">
                Jméno
              </label>
              <input
                id="child-name"
                className="g92-input"
                value={g.playerName}
                placeholder="Adámek"
                maxLength={40}
                onChange={(e) => setSettings({ playerName: e.target.value })}
              />
              <p className="g92-hint">Aplikace pozdraví: „Ahoj, {vocative(childName(g))}!“ (jméno sdílí všechny hry v menu)</p>
            </div>
          </section>

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
            <label className="g92-switch-row">
              <span>
                <span className="font-bold block">Předčítat zadání automaticky</span>
                <span className="text-sm text-muted">Na začátku každé úlohy aplikace řekne, co dělat.</span>
              </span>
              <input type="checkbox" className="g92-toggle" role="switch" checked={s.autoSpeak} onChange={(e) => setAppSettings({ autoSpeak: e.target.checked })} />
            </label>
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
              <p className="g92-hint mb-2">Cvičení s písmeny i slovy se přizpůsobí písmenům, která dítě už zná. Slova se berou jen z těchto písmen, pokud jich je dost.</p>
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
