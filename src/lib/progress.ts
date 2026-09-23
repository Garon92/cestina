/**
 * Postup dítěte – čistá logika bez DOM (testovatelná).
 * - statistiky po aktivitách (sezení, nejlepší hvězdy, úspěšnost),
 * - postup po písmenech (posledních 10 pokusů → „umím“),
 * - nálepky, denní cíl a série dní.
 */
import { STICKERS, type Sticker } from '../data/stickers';
import { pick, type Rng } from './random';

export interface ActivityStats {
  sessions: number;
  bestStars: number;
  lastStars: number;
  correct: number;
  total: number;
  bestStreak: number;
  lastPlayed: number;
}

export interface LetterStats {
  seen: number;
  correct: number;
  /** posledních max. 10 pokusů: '1' = správně napoprvé, '0' = s chybou */
  recent: string;
  lastSeen: number;
  /** kolikrát bylo písmeno úspěšně obtaženo */
  traced: number;
}

export interface Progress {
  activities: Record<string, ActivityStats>;
  letters: Record<string, LetterStats>;
  /** id nálepky → počet kusů */
  stickers: Record<string, number>;
  /** 'YYYY-MM-DD' → počet dokončených cvičení ten den */
  days: Record<string, number>;
  totalSessions: number;
}

export const DAILY_GOAL = 3;
export const RECENT_LEN = 10;

export function emptyProgress(): Progress {
  return { activities: {}, letters: {}, stickers: {}, days: {}, totalSessions: 0 };
}

export function emptyActivity(): ActivityStats {
  return { sessions: 0, bestStars: 0, lastStars: 0, correct: 0, total: 0, bestStreak: 0, lastPlayed: 0 };
}

export function emptyLetter(): LetterStats {
  return { seen: 0, correct: 0, recent: '', lastSeen: 0, traced: 0 };
}

/** Hvězdy za sezení: ≥ 90 % → 3, ≥ 60 % → 2, jinak 1 (za dokončení vždy aspoň jedna). */
export function starsFor(correct: number, total: number): 0 | 1 | 2 | 3 {
  if (total <= 0) return 0;
  const r = correct / total;
  if (r >= 0.9) return 3;
  if (r >= 0.6) return 2;
  return 1;
}

/** 0 = ještě nezkoušené, 1 = učím se, 2 = skoro umím, 3 = umím. */
export type Mastery = 0 | 1 | 2 | 3;

export function letterMastery(s: LetterStats | undefined): Mastery {
  if (!s || s.seen === 0) return 0;
  const r = s.recent.slice(-6);
  const ok = [...r].filter((c) => c === '1').length;
  const acc = r.length ? ok / r.length : 0;
  if (s.seen >= 5 && r.length >= 5 && acc >= 0.8) return 3;
  if (s.seen >= 3 && acc >= 0.6) return 2;
  return 1;
}

export const MASTERY_LABEL: Record<Mastery, string> = {
  0: 'ještě nezkoušené',
  1: 'učím se',
  2: 'skoro umím',
  3: 'umím',
};

/**
 * Váha pro adaptivní výběr písmen: častěji písmena, která se dítě učí nebo v nich chybuje,
 * méně často ta, která už umí (ale pořád občas – opakování).
 */
export function letterWeight(s: LetterStats | undefined, now: number): number {
  const m = letterMastery(s);
  const base = m === 0 ? 2 : m === 1 ? 3.2 : m === 2 ? 2 : 0.7;
  const lastWrong = s?.recent.endsWith('0') ? 1.5 : 0;
  // Dlouho neviděné písmeno (víc než 3 dny) trochu přidat.
  const stale = s && s.lastSeen && now - s.lastSeen > 3 * 86400_000 ? 0.8 : 0;
  return base + lastWrong + stale;
}

export function recordLetter(p: Progress, key: string, ok: boolean, now: number): Progress {
  const prev = p.letters[key] ?? emptyLetter();
  const next: LetterStats = {
    ...prev,
    seen: prev.seen + 1,
    correct: prev.correct + (ok ? 1 : 0),
    recent: (prev.recent + (ok ? '1' : '0')).slice(-RECENT_LEN),
    lastSeen: now,
  };
  return { ...p, letters: { ...p.letters, [key]: next } };
}

export function recordTraced(p: Progress, key: string, now: number): Progress {
  const prev = p.letters[key] ?? emptyLetter();
  return { ...p, letters: { ...p.letters, [key]: { ...prev, traced: prev.traced + 1, lastSeen: now } } };
}

export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Počet po sobě jdoucích dní s aspoň jedním cvičením (dnešek, nebo včerejšek, pokud dnes ještě nic). */
export function streakDays(p: Progress, today: Date): number {
  let d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!p.days[dayKey(d)]) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  let n = 0;
  while (p.days[dayKey(d)]) {
    n++;
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1);
  }
  return n;
}

export function todayCount(p: Progress, today: Date): number {
  return p.days[dayKey(today)] ?? 0;
}

export function ownedStickerCount(p: Progress): number {
  return Object.keys(p.stickers).filter((id) => (p.stickers[id] ?? 0) > 0).length;
}

/** Nová nálepka – přednostně taková, kterou dítě ještě nemá. */
export function pickSticker(p: Progress, rng: Rng): Sticker {
  const missing = STICKERS.filter((s) => !p.stickers[s.id]);
  return pick(missing.length ? missing : STICKERS, rng);
}

export interface SessionInput {
  activityId: string;
  correct: number;
  total: number;
  bestStreak: number;
  now: number;
  rng: Rng;
}

export interface SessionOutcome {
  progress: Progress;
  stars: 0 | 1 | 2 | 3;
  sticker: Sticker;
  isNewSticker: boolean;
  isNewBest: boolean;
  dailyGoalJustReached: boolean;
}

export function recordSession(p: Progress, input: SessionInput): SessionOutcome {
  const stars = starsFor(input.correct, input.total);
  const prev = p.activities[input.activityId] ?? emptyActivity();
  const stats: ActivityStats = {
    sessions: prev.sessions + 1,
    bestStars: Math.max(prev.bestStars, stars),
    lastStars: stars,
    correct: prev.correct + input.correct,
    total: prev.total + input.total,
    bestStreak: Math.max(prev.bestStreak, input.bestStreak),
    lastPlayed: input.now,
  };
  const dk = dayKey(new Date(input.now));
  const before = p.days[dk] ?? 0;
  const sticker = pickSticker(p, input.rng);
  const isNewSticker = !p.stickers[sticker.id];
  const progress: Progress = {
    ...p,
    activities: { ...p.activities, [input.activityId]: stats },
    stickers: { ...p.stickers, [sticker.id]: (p.stickers[sticker.id] ?? 0) + 1 },
    days: { ...p.days, [dk]: before + 1 },
    totalSessions: p.totalSessions + 1,
  };
  return {
    progress,
    stars,
    sticker,
    isNewSticker,
    isNewBest: stars > prev.bestStars,
    dailyGoalJustReached: before < DAILY_GOAL && before + 1 >= DAILY_GOAL,
  };
}

/** Převod postupu ze staré verze (localStorage `cestina_progress`). */
export function migrateLegacyProgress(raw: unknown, now: number): Record<string, ActivityStats> {
  const out: Record<string, ActivityStats> = {};
  if (!raw || typeof raw !== 'object') return out;
  const map: Record<string, string> = {
    poznavani: 'poznavani',
    parovani: 'parovani',
    poslouchej: 'poslouchej',
    slova: 'slova',
    vety: 'vety',
    skladani: 'skladani',
  };
  for (const [oldId, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = map[oldId];
    if (!id || !v || typeof v !== 'object') continue;
    const o = v as { correct?: unknown; total?: unknown; bestStreak?: unknown };
    const correct = Number(o.correct) || 0;
    const total = Number(o.total) || 0;
    if (total <= 0) continue;
    const stars = starsFor(correct, total);
    out[id] = {
      sessions: 0,
      bestStars: stars,
      lastStars: stars,
      correct,
      total,
      bestStreak: Number(o.bestStreak) || 0,
      lastPlayed: now,
    };
  }
  return out;
}

/** Podíl písmen, která dítě „umí“ (pro menu / přehled). */
export function lettersMasteredRatio(p: Progress, keys: readonly string[]): number {
  if (!keys.length) return 0;
  return keys.filter((k) => letterMastery(p.letters[k]) === 3).length / keys.length;
}
