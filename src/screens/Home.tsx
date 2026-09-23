import { CaseSwitch, MiniStars, SpeakButton, SpeechBanner } from '../components/ui';
import { LETTER_KEYS } from '../data/alphabet';
import { STICKERS } from '../data/stickers';
import { ACTIVITIES, LEVELS, recommend, type ActivityMeta } from '../engine/meta';
import { greeting, vocative } from '../kit';
import { DAILY_GOAL, letterMastery, ownedStickerCount, streakDays, todayCount } from '../lib/progress';
import { href } from '../lib/router';
import { useSpeech } from '../lib/speech';
import { childName, useG92Settings, useProgress } from '../lib/store';
import { plural } from '../lib/text';

function ActivityCard({ a, stars, played, noVoice }: { a: ActivityMeta; stars: number; played: boolean; noVoice: boolean }) {
  return (
    <a className="act-card" href={href(`hra/${a.id}`)} aria-label={`${a.title}. ${a.desc}.${stars ? ` ${stars} ${plural(stars, 'hvězda', 'hvězdy', 'hvězd')}.` : ''}`}>
      {a.isNew && !played ? <span className="badge-new">Nové</span> : null}
      <span className="act-icon" aria-hidden="true">
        {a.icon}
      </span>
      <span className="act-title">{a.title}</span>
      <span className="act-desc">{a.desc}</span>
      <MiniStars n={stars} />
      {noVoice && a.needsVoice ? (
        <span className="text-xs font-bold text-muted" title="Potřebuje hlas – bez hlasu ukáže titulek">
          🔇 s titulky
        </span>
      ) : null}
    </a>
  );
}

export function Home({ onVoiceHelp }: { onVoiceHelp: () => void }) {
  const p = useProgress();
  const g = useG92Settings();
  const { status } = useSpeech();
  const name = childName(g);
  const hello = `Ahoj, ${vocative(name)}!`;
  const today = todayCount(p, new Date());
  const streak = streakDays(p, new Date());
  const stickers = ownedStickerCount(p);
  const mastered = LETTER_KEYS.filter((k) => letterMastery(p.letters[k]) === 3).length;
  const rec = ACTIVITIES.find((a) => a.id === recommend(p.activities))!;
  const noVoice = status === 'no-czech' || status === 'unsupported';

  return (
    <div className="screen">
      <SpeechBanner onHelp={onVoiceHelp} />

      <section className="panel p-5 sm:p-7 relative overflow-hidden" aria-labelledby="hello">
        <div className="flex items-center gap-3">
          <h1 id="hello" className="text-3xl sm:text-4xl font-black leading-tight">
            {hello} <span aria-hidden="true">👋</span>
          </h1>
          <SpeakButton text={`${greeting(name)} Co si dnes zahrajeme?`} size={48} soft label="Přečíst pozdrav" />
        </div>
        <p className="text-muted font-bold mt-1">Co si dnes zahrajeme?</p>

        <div className="flex flex-wrap gap-2 mt-4">
          <span className="g92-chip" aria-label={`Dnes ${today} z ${DAILY_GOAL} cvičení`}>
            <span aria-hidden="true">🏆</span> Dnes {Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}
          </span>
          {streak > 0 ? (
            <span className="g92-chip">
              <span aria-hidden="true">🔥</span> {streak} {plural(streak, 'den', 'dny', 'dní')} v řadě
            </span>
          ) : null}
          <a className="g92-chip" href={href('nalepky')}>
            <span aria-hidden="true">📒</span> Nálepky {stickers}/{STICKERS.length}
          </a>
          <a className="g92-chip" href={href('pismenka')}>
            <span aria-hidden="true">⭐</span> Umím {mastered}/{LETTER_KEYS.length} písmen
          </a>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <a className="g92-btn g92-btn--xl w-full sm:w-auto" href={href(`hra/${rec.id}`)} style={{ minHeight: 72, fontSize: '1.4rem' }}>
            <span aria-hidden="true" style={{ fontSize: '1.8rem' }}>
              ▶
            </span>
            Hrát: {rec.title}
          </a>
          <a
            className="g92-btn g92-btn--secondary g92-btn--xl w-full sm:w-auto"
            href={href('hra/mix')}
            style={{ minHeight: 72, fontSize: '1.3rem' }}
            title="Úlohy z různých cvičení"
          >
            <span aria-hidden="true" style={{ fontSize: '1.7rem' }}>
              🎲
            </span>
            Míchanice
            {p.activities.mix?.bestStars ? <MiniStars n={p.activities.mix.bestStars} /> : null}
          </a>
        </div>
        <div aria-hidden="true" className="hidden sm:block absolute -right-3 -top-4 text-[7rem] opacity-15 rotate-12 select-none pointer-events-none">
          🔤
        </div>
      </section>

      <nav className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4" aria-label="Další">
        <a className="act-card" href={href('abeceda')} style={{ ['--lvl' as string]: '#e0479e' }}>
          <span className="act-icon" aria-hidden="true">
            🔤
          </span>
          <span className="act-title">Abeceda</span>
        </a>
        <a className="act-card" href={href('pis')} style={{ ['--lvl' as string]: '#8b5cf6' }}>
          <span className="act-icon" aria-hidden="true">
            ⌨️
          </span>
          <span className="act-title">Piš a poslouchej</span>
        </a>
        <a className="act-card" href={href('nalepky')} style={{ ['--lvl' as string]: '#f5b700' }}>
          <span className="act-icon" aria-hidden="true">
            📒
          </span>
          <span className="act-title">Nálepky</span>
        </a>
        <a className="act-card" href={href('pismenka')} style={{ ['--lvl' as string]: '#10a36e' }}>
          <span className="act-icon" aria-hidden="true">
            ⭐
          </span>
          <span className="act-title">Co už umím</span>
        </a>
      </nav>

      {LEVELS.map((lvl, li) => (
        <section key={lvl.id} style={{ ['--lvl' as string]: lvl.color }} aria-labelledby={`lvl-${lvl.id}`}>
          <div className="level-head">
            <span className="level-badge" aria-hidden="true">
              {lvl.icon}
            </span>
            <h2 id={`lvl-${lvl.id}`} className="text-2xl font-black">
              <span className="text-muted text-base font-bold mr-1">{li + 1}.</span>
              {lvl.title}
            </h2>
            <SpeakButton text={lvl.say} size={40} soft label={`Přečíst: ${lvl.title}`} />
          </div>
          <div className="act-grid">
            {ACTIVITIES.filter((a) => a.level === lvl.id).map((a) => (
              <ActivityCard key={a.id} a={a} stars={p.activities[a.id]?.bestStars ?? 0} played={(p.activities[a.id]?.sessions ?? 0) > 0} noVoice={noVoice} />
            ))}
          </div>
        </section>
      ))}

      <section className="panel p-4 sm:p-5 mt-8 flex flex-wrap items-center gap-4 justify-between">
        <div>
          <p className="font-black">Písmo</p>
          <p className="text-sm text-muted">VELKÁ tiskací, malá tiskací, nebo psací.</p>
        </div>
        <CaseSwitch />
        <a className="g92-btn g92-btn--ghost" href={href('nastaveni')}>
          <span aria-hidden="true">⚙️</span> Pro rodiče
        </a>
      </section>
    </div>
  );
}
