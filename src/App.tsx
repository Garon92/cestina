import { Suspense, lazy, useEffect, useState } from 'react';
import { Modal } from './components/Modal';
import { CaseSwitch, SpeechCaption } from './components/ui';
import { isActivityId } from './engine/meta';
import { greeting, h, setHelp } from './kit';
import { navigate, useRoute } from './lib/router';
import { say, speech } from './lib/speech';
import { childName, getAppSettings, setAppSettings, useAppSettings, useG92Settings } from './lib/store';
import { VoiceHelp } from './components/VoiceHelp';
import { Home } from './screens/Home';

// Těžší části (cvičení s daty, abeceda…) se načítají až při otevření.
const Session = lazy(() => import('./engine/Session').then((m) => ({ default: m.Session })));
const Alphabet = lazy(() => import('./screens/Alphabet').then((m) => ({ default: m.Alphabet })));
const TextReader = lazy(() => import('./screens/TextReader').then((m) => ({ default: m.TextReader })));
const Settings = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })));
const Stickers = lazy(() => import('./screens/Rewards').then((m) => ({ default: m.Stickers })));
const Letters = lazy(() => import('./screens/Rewards').then((m) => ({ default: m.Letters })));

function Loading() {
  return (
    <div className="grid place-items-center py-24" role="status" aria-label="Načítám">
      <span className="g92-spinner" />
    </div>
  );
}

const HELP_STEPS = [
  { icon: '🔊', text: 'Ťukni na reproduktor a uslyšíš, co máš dělat.' },
  { icon: '▶️', text: 'Velké tlačítko Hrát vybere, co je dobré procvičit.' },
  { icon: '🔤', text: 'Cesta vede od písmenek přes slabiky a slova až k větám.' },
  { icon: '⭐', text: 'Za každé cvičení dostaneš hvězdičky – tři jsou nejvíc.' },
  { icon: '📒', text: 'A k tomu nálepku do alba. Sesbíráš všechny?' },
  { icon: '✍️', text: 'Při obtahování piš prstem. Začni u zelené tečky a jeď po šipkách.' },
  { icon: '🅰️', text: 'Vpravo nahoře si vybereš písmo: velká, malá, nebo psací.' },
];

/** Nápověda v appbaru (kit): piktogramy + tlačítko, které ji celou přečte nahlas. */
function useAppHelp() {
  useEffect(() => {
    const read = h(
      'button',
      { type: 'button', class: 'g92-btn g92-btn--soft', onclick: () => void say(HELP_STEPS.map((x) => x.text).join(' ')) },
      '🔊 Přečíst nahlas',
    );
    const note = h(
      'p',
      { class: 'g92-hint' },
      'Pro rodiče: v Nastavení (⚙) je výběr hlasu, rychlost řeči, počet úloh, procvičovaná písmena a přesnost obtahování. Postup se ukládá v tomto zařízení.',
    );
    return setHelp({
      title: 'Jak to funguje',
      howTo: HELP_STEPS,
      keys: [
        { keys: ['1', '2', '3', '4'], text: 'vybrat odpověď' },
        { keys: ['Esc'], text: 'přeskočit úlohu' },
        { keys: ['←', '→'], text: 'další písmeno v abecedě' },
      ],
      extra: h('div', { class: 'g92-stack' }, read, note),
    });
  }, []);
}

export function App() {
  const route = useRoute();
  const settings = useAppSettings();
  const g = useG92Settings();
  const [voiceHelp, setVoiceHelp] = useState(false);
  const [welcome, setWelcome] = useState(() => !getAppSettings().onboarded);

  useAppHelp();

  useEffect(() => {
    speech.init();
  }, []);

  useEffect(() => {
    speech.configure({ voiceURI: settings.voiceURI, rate: settings.rate });
  }, [settings.voiceURI, settings.rate]);

  // Psací písmo načíst dopředu, ať se písmenka neukážou nejdřív náhradním fontem.
  useEffect(() => {
    if (settings.letterCase === 'script') void document.fonts?.load('40px "Playwrite CZ"', 'aáčř').catch(() => {});
  }, [settings.letterCase]);

  // Odkazy na staré stránky (abeceda.html…) přesměrujeme v public/*.html; tady jen neznámé cesty → domů.
  const [head, ...rest] = route.path;
  let screen: React.ReactNode;
  let title = 'Čeština pro Adámka';
  if (!head) screen = <Home onVoiceHelp={() => setVoiceHelp(true)} />;
  else if (head === 'hra' && rest[0] && isActivityId(rest[0])) {
    screen = <Session key={`${rest[0]}-${route.query.get('pismeno') ?? ''}`} id={rest[0]} focus={route.query.get('pismeno') ?? undefined} />;
  } else if (head === 'abeceda') {
    screen = <Alphabet />;
    title = 'Abeceda – Čeština';
  } else if (head === 'pis') {
    screen = <TextReader />;
    title = 'Piš a poslouchej – Čeština';
  } else if (head === 'nalepky') {
    screen = <Stickers />;
    title = 'Nálepky – Čeština';
  } else if (head === 'pismenka') {
    screen = <Letters />;
    title = 'Co už umím – Čeština';
  } else if (head === 'nastaveni') {
    screen = <Settings />;
    title = 'Nastavení – Čeština';
  } else {
    screen = <Home onVoiceHelp={() => setVoiceHelp(true)} />;
  }

  useEffect(() => {
    document.title = title;
  }, [title]);

  const startWelcome = () => {
    setWelcome(false);
    setAppSettings({ onboarded: true });
    void say(`${greeting(childName(g))} Já jsem tvoje čeština. Ťukni na velké tlačítko Hrát a jdeme na to!`);
  };

  return (
    <div className="g92-app">
      <g92-appbar
        app="cestina"
        ong92-settings={(e: CustomEvent) => {
          e.preventDefault();
          navigate('nastaveni');
        }}
      />
      <Suspense fallback={<Loading />}>{screen}</Suspense>
      <SpeechCaption />
      <Modal open={voiceHelp} onClose={() => setVoiceHelp(false)} title="Český hlas" labelledBy="voice-title">
        <VoiceHelp />
      </Modal>
      <Modal
        open={welcome && !head}
        onClose={startWelcome}
        title="Vítej! 👋"
        labelledBy="welcome-title"
        footer={
          <button type="button" className="g92-btn g92-btn--lg g92-btn--block" onClick={startWelcome} autoFocus>
            <span aria-hidden="true">▶</span> Začít
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl" aria-hidden="true">
            🔤📖✍️
          </div>
          <p className="text-lg font-bold">Písmenka, slabiky, slova a věty. Hraj si, sbírej hvězdičky a nálepky!</p>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted">Jaké písmo se učíš?</p>
            <CaseSwitch />
          </div>
          <p className="text-xs text-muted">Pro rodiče: jméno, hlas a výběr písmen najdete v Nastavení (⚙ nahoře).</p>
        </div>
      </Modal>
    </div>
  );
}
