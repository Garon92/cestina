import { MiniStars, SpeakButton } from '../components/ui';
import { ALPHABET, LETTER_KEYS } from '../data/alphabet';
import { ALBUMS, STICKERS } from '../data/stickers';
import { ACTIVITIES, LEVELS } from '../engine/meta';
import { sfx } from '../kit';
import { MASTERY_LABEL, letterMastery, ownedStickerCount, type Mastery } from '../lib/progress';
import { href, navigate } from '../lib/router';
import { say } from '../lib/speech';
import { useAppSettings, useProgress } from '../lib/store';
import { caseLetter, plural } from '../lib/text';

function Back() {
  return (
    <a className="g92-btn g92-btn--secondary g92-btn--icon" href={href('')} aria-label="Zpět domů">
      ←
    </a>
  );
}

export function Stickers() {
  const p = useProgress();
  const owned = ownedStickerCount(p);
  return (
    <div className="screen" style={{ ['--lvl' as string]: '#f5b700' }}>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <Back />
        <h1 className="text-3xl font-black">Moje nálepky</h1>
        <SpeakButton text={`Máš ${owned} ${plural(owned, 'nálepku', 'nálepky', 'nálepek')} z ${STICKERS.length}. Za každé dokončené cvičení dostaneš novou.`} size={44} soft />
      </div>
      <div className="flex items-center gap-3 mb-6">
        <div className="g92-progress g92-progress--lg flex-1" style={{ ['--value' as string]: String(owned / STICKERS.length) }} role="progressbar" aria-valuemin={0} aria-valuemax={STICKERS.length} aria-valuenow={owned} />
        <span className="font-black tabular-nums">
          {owned} / {STICKERS.length}
        </span>
      </div>
      {owned === 0 ? (
        <div className="panel p-6 text-center mb-6">
          <p className="text-5xl mb-2" aria-hidden="true">
            📒
          </p>
          <p className="font-black text-xl">Album je zatím prázdné</p>
          <p className="text-muted">Dokonči jakékoli cvičení a dostaneš první nálepku!</p>
          <a className="g92-btn g92-btn--lg mt-4" href={href('')}>
            Jdu hrát
          </a>
        </div>
      ) : null}
      {ALBUMS.map((a) => {
        const list = STICKERS.filter((s) => s.album === a.id);
        const have = list.filter((s) => p.stickers[s.id]).length;
        return (
          <section key={a.id} className="mb-6" aria-labelledby={`alb-${a.id}`}>
            <h2 id={`alb-${a.id}`} className="text-xl font-black mb-3">
              <span aria-hidden="true">{a.icon}</span> {a.label}{' '}
              <span className="text-muted text-base">
                {have}/{list.length}
              </span>
            </h2>
            <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(5rem, 22%), 1fr))' }}>
              {list.map((s) => {
                const n = p.stickers[s.id] ?? 0;
                return n ? (
                  <button
                    key={s.id}
                    type="button"
                    className="sticker"
                    onClick={() => {
                      sfx.pop();
                      void say(s.name);
                    }}
                    aria-label={`${s.name}${n > 1 ? `, ${n} kusy` : ''}`}
                  >
                    <span aria-hidden="true">{s.e}</span>
                    {n > 1 ? <span className="sticker-count">×{n}</span> : null}
                  </button>
                ) : (
                  <div key={s.id} className="sticker is-missing" aria-label="Ještě nemáš">
                    ?
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const LEGEND: Mastery[] = [0, 1, 2, 3];

export function Letters() {
  const p = useProgress();
  const settings = useAppSettings();
  const mastered = LETTER_KEYS.filter((k) => letterMastery(p.letters[k]) === 3).length;
  return (
    <div className="screen" style={{ ['--lvl' as string]: '#10a36e' }}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Back />
        <h1 className="text-3xl font-black">Co už umím</h1>
        <SpeakButton text={`Umíš ${mastered} ${plural(mastered, 'písmenko', 'písmenka', 'písmenek')} z ${LETTER_KEYS.length}.`} size={44} soft />
      </div>

      <section className="panel p-4 sm:p-5 mb-6" aria-labelledby="pismena-h">
        <h2 id="pismena-h" className="text-xl font-black mb-1">
          Písmenka <span className="text-muted text-base">⭐ {mastered}/{LETTER_KEYS.length}</span>
        </h2>
        <p className="text-sm text-muted mb-3">Ťukni na písmenko a obtáhni si ho.</p>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(4.2rem, 18%), 1fr))' }}>
          {ALPHABET.map((l) => {
            const m = letterMastery(p.letters[l.key]);
            return (
              <button
                key={l.key}
                type="button"
                className={`letter-cell mastery-${m} ${settings.letterCase === 'script' ? 'script' : ''}`}
                onClick={() => navigate(l.key === 'CH' ? 'abeceda' : `hra/obtahuj?pismeno=${encodeURIComponent(l.key)}`)}
                aria-label={`${l.say}: ${MASTERY_LABEL[m]}`}
              >
                {caseLetter(l, settings.letterCase)}
                {m === 3 ? (
                  <span className="star-mark" aria-hidden="true">
                    ⭐
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-sm font-bold">
          {LEGEND.map((m) => (
            <span key={m} className="flex items-center gap-2">
              <span className={`mastery-${m} inline-block w-5 h-5 rounded-md border border-border`} style={{ background: 'var(--m)' }} />
              {MASTERY_LABEL[m]}
            </span>
          ))}
        </div>
      </section>

      {LEVELS.map((lvl) => (
        <section key={lvl.id} className="mb-5" style={{ ['--lvl' as string]: lvl.color }}>
          <h2 className="text-xl font-black mb-2">
            <span aria-hidden="true">{lvl.icon}</span> {lvl.title}
          </h2>
          <div className="panel divide-y divide-border">
            {ACTIVITIES.filter((a) => a.level === lvl.id).map((a) => {
              const s = p.activities[a.id];
              const pct = s && s.total ? Math.round((s.correct / s.total) * 100) : null;
              return (
                <a key={a.id} href={href(`hra/${a.id}`)} className="flex items-center gap-3 p-3 hover:bg-surface-2 no-underline text-fg">
                  <span className="text-2xl" aria-hidden="true">
                    {a.icon}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="font-black block">{a.title}</span>
                    <span className="text-sm text-muted">
                      {s?.sessions ? `${s.sessions}× hráno` : s?.total ? 'z minulé verze' : 'ještě nehráno'}
                      {pct !== null ? ` · úspěšnost ${pct} %` : ''}
                      {s?.bestStreak ? ` · série ${s.bestStreak}` : ''}
                    </span>
                  </span>
                  <MiniStars n={s?.bestStars ?? 0} />
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
