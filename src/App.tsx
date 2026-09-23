import { useEffect, useState } from 'react';
import { Modal } from './components/Modal';
import { CaseSwitch, SpeechCaption } from './components/ui';
import { isActivityId } from './engine/meta';
import { Session } from './engine/Session';
import { greeting } from './kit';
import { navigate, useRoute } from './lib/router';
import { say, speech } from './lib/speech';
import { childName, getAppSettings, setAppSettings, useAppSettings, useG92Settings } from './lib/store';
import { Alphabet } from './screens/Alphabet';
import { Home } from './screens/Home';
import { Letters, Stickers } from './screens/Rewards';
import { Settings, VoiceHelp } from './screens/Settings';
import { TextReader } from './screens/TextReader';

function HelpContent() {
  const rows: [string, string][] = [
    ['🔊', 'Ťukni na reproduktor a uslyšíš, co máš dělat.'],
    ['▶', 'Velké tlačítko Hrát vybere, co je dobré procvičit.'],
    ['🔤 🧩 📖 📝', 'Cesta vede od písmenek přes slabiky a slova až k větám.'],
    ['⭐', 'Za každé cvičení dostaneš hvězdičky – tři jsou nejvíc.'],
    ['📒', 'A k tomu nálepku do alba. Sesbíráš všechny?'],
    ['✍️', 'V Obtahování piš prstem. Začni u zelené tečky a jeď po šipkách.'],
    ['A a 𝒶', 'Tady si vybereš písmo: VELKÁ, malá, nebo psací.'],
  ];
  return (
    <div className="flex flex-col gap-3">
      {rows.map(([icon, text]) => (
        <div key={text} className="flex items-center gap-3">
          <span className="text-2xl w-20 text-center shrink-0" aria-hidden="true">
            {icon}
          </span>
          <span className="flex-1">{text}</span>
          <button type="button" className="g92-btn g92-btn--ghost g92-btn--icon g92-btn--sm" onClick={() => void say(text)} aria-label={`Přečíst: ${text}`}>
            🔊
          </button>
        </div>
      ))}
      <p className="text-sm text-muted mt-2">
        Pro rodiče: v Nastavení (⚙) najdete výběr hlasu, rychlost řeči, počet úloh, výběr procvičovaných písmen a toleranci obtahování. Postup se ukládá v tomto
        zařízení.
      </p>
    </div>
  );
}

export function App() {
  const route = useRoute();
  const settings = useAppSettings();
  const g = useG92Settings();
  const [help, setHelp] = useState(false);
  const [voiceHelp, setVoiceHelp] = useState(false);
  const [welcome, setWelcome] = useState(() => !getAppSettings().onboarded);

  useEffect(() => {
    speech.init();
  }, []);

  useEffect(() => {
    speech.configure({ voiceURI: settings.voiceURI, rate: settings.rate });
  }, [settings.voiceURI, settings.rate]);

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
        help
        ong92-help={() => setHelp(true)}
        ong92-settings={(e: CustomEvent) => {
          e.preventDefault();
          navigate('nastaveni');
        }}
      />
      {screen}
      <SpeechCaption />
      <Modal open={help} onClose={() => setHelp(false)} title="Jak to funguje" labelledBy="help-title" wide>
        <HelpContent />
      </Modal>
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
