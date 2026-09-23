import { useEffect } from 'react';
import { BigStars, EmojiPic, HomeIcon, SpeakButton } from '../components/ui';
import { vocative } from '../kit';
import { DAILY_GOAL, todayCount, type SessionOutcome } from '../lib/progress';
import { say } from '../lib/speech';
import { childName, getProgress, useG92Settings } from '../lib/store';
import { plural } from '../lib/text';
import type { ActivityMeta } from './meta';
import type { ReviewItem } from './types';

const TITLES: Record<number, string> = { 3: 'Výborně', 2: 'Moc dobře', 1: 'Dobrá práce', 0: 'Hotovo' };

export function Results({
  activity,
  outcome,
  correct,
  total,
  review,
  next,
  onAgain,
  onNext,
  onHome,
}: {
  activity: ActivityMeta;
  outcome: SessionOutcome;
  correct: number;
  total: number;
  review: ReviewItem[];
  next: ActivityMeta;
  onAgain: () => void;
  onNext: () => void;
  onHome: () => void;
}) {
  const g = useG92Settings();
  const name = vocative(childName(g));
  const title = `${TITLES[outcome.stars]}, ${name}!`;
  const today = todayCount(getProgress(), new Date());

  useEffect(() => {
    const stars = `${outcome.stars} ${plural(outcome.stars, 'hvězdičku', 'hvězdičky', 'hvězdiček')}`;
    const sticker = outcome.isNewSticker ? `A novou nálepku: ${outcome.sticker.name}!` : `A nálepku: ${outcome.sticker.name}.`;
    const t = window.setTimeout(() => void say(`${title} Máš ${stars}. ${sticker}`), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 py-2 w-full max-w-[40rem] mx-auto text-center">
      <p className="g92-eyebrow" style={{ color: 'var(--lvl)' }}>
        {activity.icon} {activity.title}
      </p>
      <h1 className="text-3xl sm:text-4xl font-black">{title}</h1>
      <BigStars n={outcome.stars} />
      <p className="text-lg font-bold text-muted">
        {correct} z {total} napoprvé
        {outcome.isNewBest && outcome.stars > 0 ? ' · nový rekord!' : ''}
      </p>

      <div className="panel w-full p-5 flex items-center gap-4 text-left" style={{ borderColor: 'var(--g92-gold)' }}>
        <button type="button" className="sticker-reveal bg-transparent border-0 cursor-pointer" onClick={() => void say(outcome.sticker.name)} aria-label={`Nálepka ${outcome.sticker.name}`}>
          <EmojiPic e={outcome.sticker.e} label={outcome.sticker.name} />
        </button>
        <div className="min-w-0">
          <p className="font-black text-xl">{outcome.isNewSticker ? 'Nová nálepka!' : 'Nálepka navíc!'}</p>
          <p className="text-muted font-bold">{outcome.sticker.name}</p>
          <a href="#/nalepky" className="text-accent-text font-bold underline text-sm">
            Otevřít album
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2 font-bold" aria-label={`Dnes ${today} z ${DAILY_GOAL} cvičení`}>
        <span className="text-muted">Dnes:</span>
        {Array.from({ length: DAILY_GOAL }, (_, i) => (
          <span key={i} className="text-2xl" aria-hidden="true" style={{ filter: i < today ? 'none' : 'grayscale(1) opacity(.35)' }}>
            🏆
          </span>
        ))}
        {today > DAILY_GOAL ? <span className="text-muted">+{today - DAILY_GOAL}</span> : null}
      </div>

      {review.length ? (
        <div className="panel w-full p-4 text-left">
          <p className="font-black mb-2">Tohle si ještě zopakujeme:</p>
          <ul className="flex flex-col gap-2">
            {review.slice(0, 8).map((r, i) => (
              <li key={i} className="flex items-center gap-3">
                <SpeakButton text={r.say} size={40} soft label={`Poslechnout: ${r.say}`} />
                {r.emoji ? (
                  <span className="text-2xl" aria-hidden="true">
                    {r.emoji}
                  </span>
                ) : null}
                <span className="font-bold text-lg">{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button type="button" className="g92-btn g92-btn--lg" onClick={onAgain} autoFocus>
          <span aria-hidden="true">🔁</span> Znovu
        </button>
        <button type="button" className="g92-btn g92-btn--secondary g92-btn--lg" onClick={onNext}>
          <span aria-hidden="true">{next.icon}</span> {next.title}
        </button>
        <button type="button" className="g92-btn g92-btn--ghost g92-btn--lg" onClick={onHome} aria-label="Domů">
          <span style={{ width: 22, height: 22, display: 'inline-grid' }}>
            <HomeIcon />
          </span>
          Domů
        </button>
      </div>
    </div>
  );
}
