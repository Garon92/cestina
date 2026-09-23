/**
 * Perzistentní úložiště aplikace (kit `createStore` → klíče `g92:cestina:*`) + React hooky.
 * Staré klíče (`cestina_progress`, `cestina_recent_texts`) se při prvním spuštění převedou.
 */
import { useSyncExternalStore } from 'react';
import { createStore, getSettingsSnapshot, subscribeSettings, type G92Settings } from '../kit';
import { COMMON_LETTERS, LETTER_KEYS } from '../data/alphabet';
import { emptyProgress, migrateLegacyProgress, type Progress } from './progress';
import type { LetterCase } from './text';

export type TraceTolerance = 'easy' | 'normal' | 'hard';

export interface AppSettings {
  letterCase: LetterCase;
  /** Barevně odlišené slabiky ve slovech (jako ve slabikáři). */
  syllableColors: boolean;
  /** Automaticky předčítat zadání. */
  autoSpeak: boolean;
  /** Vybraný hlas ('' = automaticky nejlepší český). */
  voiceURI: string;
  /** Rychlost řeči 0.6–1.2. */
  rate: number;
  /** Počet úloh v jednom cvičení. */
  sessionLength: number;
  /** Písmena, která se procvičují (klíče abecedy). */
  letters: string[];
  traceTolerance: TraceTolerance;
  /** Vždy ukazovat titulky k tomu, co aplikace říká. */
  captions: boolean;
  /** Uvítání už proběhlo. */
  onboarded: boolean;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  letterCase: 'upper',
  syllableColors: false,
  autoSpeak: true,
  voiceURI: '',
  rate: 0.9,
  sessionLength: 8,
  // Q, W, X jsou jen v cizích slovech – začátečník je nepotřebuje (CESTINA-14); rodič je může zapnout.
  letters: COMMON_LETTERS.map((l) => l.key),
  traceTolerance: 'normal',
  captions: false,
  onboarded: false,
};

interface Shape extends Record<string, unknown> {
  settings: AppSettings;
  progress: Progress;
  texts: string[];
}

export const store = createStore<Shape>('cestina', {
  version: 1,
  defaults: { settings: DEFAULT_APP_SETTINGS, progress: emptyProgress(), texts: [] },
  migrate(from, m) {
    if (from < 1) {
      const legacy = m.legacyJSON<unknown>('cestina_progress');
      const activities = migrateLegacyProgress(legacy, Date.now());
      if (Object.keys(activities).length) m.set('progress', { ...emptyProgress(), activities });
      const texts = m.legacyJSON<unknown>('cestina_recent_texts');
      if (Array.isArray(texts)) {
        m.set(
          'texts',
          texts.filter((t): t is string => typeof t === 'string' && t.trim() !== '').slice(0, 10),
        );
      }
      // Staré klíče necháváme – kdyby se někdo vrátil ke staré verzi, nic neztratí.
    }
  },
});

// ─── Nastavení aplikace (se sanitizací – starší uložená data nemusí mít všechna pole) ───

function sanitizeSettings(raw: unknown): AppSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<AppSettings>;
  const d = DEFAULT_APP_SETTINGS;
  const letters = Array.isArray(r.letters) ? r.letters.filter((k) => LETTER_KEYS.includes(k)) : d.letters;
  return {
    letterCase: r.letterCase === 'lower' || r.letterCase === 'script' || r.letterCase === 'upper' ? r.letterCase : d.letterCase,
    syllableColors: typeof r.syllableColors === 'boolean' ? r.syllableColors : d.syllableColors,
    autoSpeak: typeof r.autoSpeak === 'boolean' ? r.autoSpeak : d.autoSpeak,
    voiceURI: typeof r.voiceURI === 'string' ? r.voiceURI : d.voiceURI,
    rate: typeof r.rate === 'number' && r.rate >= 0.5 && r.rate <= 1.5 ? r.rate : d.rate,
    sessionLength: [5, 8, 10, 15].includes(Number(r.sessionLength)) ? Number(r.sessionLength) : d.sessionLength,
    letters: letters.length >= 4 ? letters : d.letters,
    traceTolerance: r.traceTolerance === 'easy' || r.traceTolerance === 'hard' || r.traceTolerance === 'normal' ? r.traceTolerance : d.traceTolerance,
    captions: typeof r.captions === 'boolean' ? r.captions : d.captions,
    onboarded: typeof r.onboarded === 'boolean' ? r.onboarded : d.onboarded,
  };
}

let lastRaw: unknown = undefined;
let lastSettings: AppSettings = DEFAULT_APP_SETTINGS;
export function getAppSettings(): AppSettings {
  const raw = store.get('settings');
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastSettings = sanitizeSettings(raw);
  }
  return lastSettings;
}

export function setAppSettings(patch: Partial<AppSettings>): void {
  store.set('settings', { ...getAppSettings(), ...patch });
}

const subscribeKey = (key: keyof Shape) => (cb: () => void) =>
  store.subscribe((k) => {
    if (k === key) cb();
  });

const subSettings = subscribeKey('settings');
export function useAppSettings(): AppSettings {
  return useSyncExternalStore(subSettings, getAppSettings, getAppSettings);
}

// ─── Postup ───

function sanitizeProgress(raw: unknown): Progress {
  const e = emptyProgress();
  if (!raw || typeof raw !== 'object') return e;
  const r = raw as Partial<Progress>;
  const obj = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as never) : {});
  return {
    activities: obj(r.activities),
    letters: obj(r.letters),
    stickers: obj(r.stickers),
    days: obj(r.days),
    totalSessions: typeof r.totalSessions === 'number' ? r.totalSessions : 0,
  };
}

let lastRawP: unknown = undefined;
let lastProgress: Progress = emptyProgress();
export function getProgress(): Progress {
  const raw = store.get('progress');
  if (raw !== lastRawP) {
    lastRawP = raw;
    lastProgress = sanitizeProgress(raw);
  }
  return lastProgress;
}

export function setProgress(p: Progress): void {
  store.set('progress', p);
}

export function updateProgress(fn: (p: Progress) => Progress): Progress {
  const next = fn(getProgress());
  setProgress(next);
  return next;
}

const subProgress = subscribeKey('progress');
export function useProgress(): Progress {
  return useSyncExternalStore(subProgress, getProgress, getProgress);
}

// ─── Historie textů (Piš a poslouchej) ───

export function getTexts(): string[] {
  const t = store.get('texts');
  return Array.isArray(t) ? t : [];
}
export function setTexts(texts: string[]): void {
  store.set('texts', texts.slice(0, 10));
}
const subTexts = subscribeKey('texts');
export function useTexts(): string[] {
  return useSyncExternalStore(subTexts, getTexts, getTexts);
}

// ─── Globální nastavení kitu (zvuk, motiv, jméno) ───

export function useG92Settings(): Readonly<G92Settings> {
  return useSyncExternalStore(subscribeSettings, getSettingsSnapshot, getSettingsSnapshot);
}

/** Jméno dítěte – z globálního nastavení, výchozí „Adámek“ (aplikace je pro Adámka). */
export function childName(s: Readonly<G92Settings>): string {
  return s.playerName.trim() || 'Adámek';
}
