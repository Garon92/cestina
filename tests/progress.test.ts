import { describe, expect, it } from 'vitest';
import {
  DAILY_GOAL, dayKey, emptyProgress, letterMastery, migrateLegacyProgress, ownedStickerCount, recordLetter, recordSession,
  recordTraced, starsFor, streakDays, todayCount,
} from '../src/lib/progress';
import { STICKERS } from '../src/data/stickers';
import { mulberry32 } from '../src/lib/random';
import { ACTIVITY_BY_ID, MIX_POOL, planMix, recommend } from '../src/engine/meta';

describe('Míchanice', () => {
  it('střídá cvičení a drží se aktuální úrovně', () => {
    const plan = planMix({}, 200, mulberry32(9));
    expect(plan).toHaveLength(200);
    for (let i = 1; i < plan.length; i++) expect(plan[i]).not.toBe(plan[i - 1]);
    for (const id of plan) expect(MIX_POOL).toContain(id);
    const letters = plan.filter((id) => ACTIVITY_BY_ID.get(id)!.level === 'pismena').length;
    expect(letters).toBeGreaterThan(200 * 0.35);
    // Když má dítě písmenka hotová, těžiště se posune ke slabikám.
    const done = Object.fromEntries(MIX_POOL.filter((id) => ACTIVITY_BY_ID.get(id)!.level === 'pismena').map((id) => [id, { bestStars: 3 }]));
    const plan2 = planMix(done, 200, mulberry32(9));
    const syl = plan2.filter((id) => ACTIVITY_BY_ID.get(id)!.level === 'slabiky').length;
    expect(syl).toBeGreaterThan(200 * 0.3);
  });
});

const NOW = new Date(2026, 8, 23, 17, 0).getTime();

describe('hvězdy', () => {
  it('počítá hvězdy podle úspěšnosti', () => {
    expect(starsFor(0, 0)).toBe(0);
    expect(starsFor(8, 8)).toBe(3);
    expect(starsFor(9, 10)).toBe(3);
    expect(starsFor(7, 10)).toBe(2);
    expect(starsFor(6, 10)).toBe(2);
    expect(starsFor(2, 10)).toBe(1);
  });
});

describe('písmena', () => {
  it('„umím“ po sérii správných odpovědí, chyba sráží', () => {
    let p = emptyProgress();
    expect(letterMastery(p.letters.A)).toBe(0);
    p = recordLetter(p, 'A', true, NOW);
    expect(letterMastery(p.letters.A)).toBe(1);
    for (let i = 0; i < 5; i++) p = recordLetter(p, 'A', true, NOW);
    expect(letterMastery(p.letters.A)).toBe(3);
    p = recordLetter(p, 'A', false, NOW);
    p = recordLetter(p, 'A', false, NOW);
    expect(letterMastery(p.letters.A)).toBeLessThan(3);
    expect(p.letters.A!.recent.length).toBeLessThanOrEqual(10);
    p = recordTraced(p, 'A', NOW);
    expect(p.letters.A!.traced).toBe(1);
  });
  it('je neměnné (immutable)', () => {
    const p = emptyProgress();
    const q = recordLetter(p, 'B', true, NOW);
    expect(p.letters.B).toBeUndefined();
    expect(q.letters.B!.seen).toBe(1);
  });
});

describe('sezení, nálepky, denní cíl', () => {
  it('zapíše sezení, dá nálepku a počítá den', () => {
    const rng = mulberry32(7);
    let p = emptyProgress();
    const o = recordSession(p, { activityId: 'poslouchej', correct: 7, total: 8, bestStreak: 5, now: NOW, rng });
    expect(o.stars).toBe(2);
    expect(o.isNewSticker).toBe(true);
    expect(o.isNewBest).toBe(true);
    p = o.progress;
    expect(p.activities.poslouchej!.sessions).toBe(1);
    expect(ownedStickerCount(p)).toBe(1);
    expect(todayCount(p, new Date(NOW))).toBe(1);
    let reached = false;
    for (let i = 1; i < DAILY_GOAL; i++) {
      const r = recordSession(p, { activityId: 'vety', correct: 8, total: 8, bestStreak: 8, now: NOW, rng });
      p = r.progress;
      reached ||= r.dailyGoalJustReached;
    }
    expect(reached).toBe(true);
    expect(p.activities.vety!.bestStars).toBe(3);
  });
  it('nejdřív rozdá všechny nálepky, až pak opakuje', () => {
    const rng = mulberry32(3);
    let p = emptyProgress();
    for (let i = 0; i < STICKERS.length; i++) {
      const o = recordSession(p, { activityId: 'x', correct: 1, total: 1, bestStreak: 1, now: NOW, rng });
      expect(o.isNewSticker).toBe(true);
      p = o.progress;
    }
    expect(ownedStickerCount(p)).toBe(STICKERS.length);
    const again = recordSession(p, { activityId: 'x', correct: 1, total: 1, bestStreak: 1, now: NOW, rng });
    expect(again.isNewSticker).toBe(false);
  });
  it('série dní', () => {
    const p = emptyProgress();
    const d = (off: number) => dayKey(new Date(2026, 8, 23 - off));
    p.days = { [d(0)]: 1, [d(1)]: 2, [d(2)]: 1, [d(4)]: 1 };
    expect(streakDays(p, new Date(2026, 8, 23))).toBe(3);
    // dnes ještě nic → počítá se od včerejška
    const q = { ...p, days: { [d(1)]: 1, [d(2)]: 1 } };
    expect(streakDays(q, new Date(2026, 8, 23))).toBe(2);
    expect(streakDays(emptyProgress(), new Date(2026, 8, 23))).toBe(0);
  });
});

describe('migrace a doporučení', () => {
  it('převede starý postup', () => {
    const m = migrateLegacyProgress(
      { poznavani: { correct: 45, total: 50, bestStreak: 12 }, slova: { correct: 3, total: 10, bestStreak: 1 }, nesmysl: 5 },
      NOW,
    );
    expect(m.poznavani!.bestStars).toBe(3);
    expect(m.poznavani!.bestStreak).toBe(12);
    expect(m.slova!.bestStars).toBe(1);
    expect(Object.keys(m)).toHaveLength(2);
    expect(migrateLegacyProgress(null, NOW)).toEqual({});
  });
  it('doporučí nejnižší úroveň, kde chybí hvězdy', () => {
    expect(recommend({})).toBe('poslouchej');
    const all3 = { bestStars: 3, lastPlayed: 1, sessions: 1 };
    const s: Record<string, typeof all3> = {
      poslouchej: all3, poznavani: all3, parovani: all3, hledej: all3, zacina: all3, obtahuj: all3,
    };
    expect(['slabiky', 'cti-slabiky', 'skladej-slabiky']).toContain(recommend(s));
  });
});
