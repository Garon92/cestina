import { Suspense, lazy, useEffect, useState } from 'react';
import { Modal } from './components/Modal';
import { CaseSwitch, SpeechCaption } from './components/ui';
import { isSessionId } from './engine/meta';
import { HELP_TITLE_LEARN, appTitle, h, setHelp, setSettingsSection, showHelp, vocative } from './kit';
import { CESTINA_SETTINGS } from './lib/settingsSection';
import { useRoute } from './lib/router';
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

const HELP = {
  title: HELP_TITLE_LEARN,
  howTo: HELP_STEPS,
  keys: [
    { keys: ['1', '2', '3', '4'], text: 'vybrat odpověď' },
    { keys: ['Esc'], text: 'přeskočit úlohu' },
    { keys: ['←', '→'], text: 'další písmeno v abecedě' },
    { keys: ['M'], text: 'zvuk zapnout / vypnout (mimo cvičení)' },
    { keys: ['?'], text: 'nápověda (mimo cvičení)' },
  ],
  extra: h(
    'p',
    { class: 'g92-hint' },
    'Pro rodiče: ⚙ nahoře – písmo, zvuky, předčítání, vzhled a jméno. Pod „Další nastavení pro rodiče…“ je výběr hlasu, rychlost řeči, počet úloh, procvičovaná písmena, přesnost obtahování a smazání postupu. Postup se ukládá v tomto zařízení.',
  ),
};

/** ⚙ v liště = kitový dialog + sekce čeština (viz lib/settingsSection.ts). */
function useSettingsSection() {
  useEffect(() => setSettingsSection(CESTINA_SETTINGS), []);
}

/**
 * Nápověda v appbaru (kit „?“). Dítě neumí číst, takže „🔊 Přečíst nahlas“ musí být úplně nahoře –
 * kit ho staví až za piktogramy, proto dialog otevíráme sami a tlačítko přidáme na začátek (CESTINA-16).
 */
function useAppHelp() {
  useEffect(() => setHelp(HELP), []);
  useEffect(() => {
    const onHelp = (e: Event) => {
      e.preventDefault();
      const d = showHelp(HELP);
      if (!d) return;
      const read = h(
        'button',
        { type: 'button', class: 'g92-btn g92-btn--lg g92-btn--block', onclick: () => void say(HELP_STEPS.map((x) => x.text).join(' ')) },
        '🔊 Přečíst nahlas',
      );
      d.body.prepend(read);
      read.focus({ preventScroll: true });
    };
    document.addEventListener('g92-help', onHelp);
    return () => document.removeEventListener('g92-help', onHelp);
  }, []);
}

export function App() {
  const route = useRoute();
  const settings = useAppSettings();
  const g = useG92Settings();
  const [voiceHelp, setVoiceHelp] = useState(false);
  const [welcome, setWelcome] = useState(() => !getAppSettings().onboarded);

  useAppHelp();
  useSettingsSection();

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
  let title = appTitle('cestina');
  if (!head) screen = <Home onVoiceHelp={() => setVoiceHelp(true)} />;
  else if (head === 'hra' && rest[0] && isSessionId(rest[0])) {
    screen = <Session key={`${rest[0]}-${route.query.get('pismeno') ?? ''}`} id={rest[0]} focus={route.query.get('pismeno') ?? undefined} />;
  } else if (head === 'abeceda') {
    screen = <Alphabet />;
    title = appTitle('cestina', 'Abeceda');
  } else if (head === 'pis') {
    screen = <TextReader />;
    title = appTitle('cestina', 'Piš a poslouchej');
  } else if (head === 'nalepky') {
    screen = <Stickers />;
    title = appTitle('cestina', 'Nálepky');
  } else if (head === 'pismenka') {
    screen = <Letters />;
    title = appTitle('cestina', 'Co už umím');
  } else if (head === 'nastaveni') {
    screen = <Settings />;
    title = appTitle('cestina', 'Pro rodiče');
  } else {
    screen = <Home onVoiceHelp={() => setVoiceHelp(true)} />;
  }

  useEffect(() => {
    document.title = title;
  }, [title]);

  const startWelcome = () => {
    setWelcome(false);
    setAppSettings({ onboarded: true });
    void say(`Ahoj, ${vocative(childName(g))}! Já jsem tvoje čeština. Ťukni na velké tlačítko Hrát a jdeme na to!`);
  };

  return (
    <div className="g92-app">
      {/* M/F/? z kitu jen mimo cvičení – v Diktátu a Skládání se píšou písmena (m, f…) na klávesnici. */}
      <g92-appbar app="cestina" keys={head !== 'hra'} />
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
          <p className="text-xs text-muted">Pro rodiče: jméno, hlas a výběr písmen najdete pod ⚙ nahoře.</p>
        </div>
      </Modal>
    </div>
  );
}
