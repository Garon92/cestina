/** Popis aktivit (bez Reactu – používá se i v testech a pro doporučení). */

export type LevelId = 'pismena' | 'slabiky' | 'slova' | 'vety';

export type ActivityId =
  | 'poznavani'
  | 'parovani'
  | 'poslouchej'
  | 'hledej'
  | 'zacina'
  | 'obtahuj'
  | 'slabiky'
  | 'skladej-slabiky'
  | 'cti-slabiky'
  | 'cti-slova'
  | 'slova'
  | 'skladani'
  | 'diktat'
  | 'rymy'
  | 'vety'
  | 'pravda';

export interface ActivityMeta {
  id: ActivityId;
  level: LevelId;
  title: string;
  /** Krátký popis na kartě (pro rodiče, dítě má ikonu). */
  desc: string;
  icon: string;
  /** Co aplikace řekne na začátku cvičení. */
  intro: string;
  /** Počet úloh v sezení podle délky z nastavení. */
  size: (len: number) => number;
  /** Aktivita potřebuje hlas (poslech) – bez hlasu ukážeme titulek. */
  needsVoice?: boolean;
  /** Nová aktivita (štítek „Nové“ dokud ji dítě nezkusí). */
  isNew?: boolean;
}

export const LEVELS: { id: LevelId; title: string; icon: string; color: string; say: string }[] = [
  { id: 'pismena', title: 'Písmenka', icon: '🔤', color: '#e0479e', say: 'Písmenka' },
  { id: 'slabiky', title: 'Slabiky', icon: '🧩', color: '#f97316', say: 'Slabiky' },
  { id: 'slova', title: 'Slova', icon: '📖', color: '#2f7cf6', say: 'Slova' },
  { id: 'vety', title: 'Věty', icon: '📝', color: '#10a36e', say: 'Věty' },
];

const same = (n: number) => n;

export const ACTIVITIES: readonly ActivityMeta[] = [
  // ─── Písmenka ───
  {
    id: 'poslouchej',
    level: 'pismena',
    title: 'Poslouchej',
    desc: 'Uslyšíš písmenko a najdeš ho',
    icon: '👂',
    intro: 'Poslouchej a najdi písmenko.',
    size: same,
    needsVoice: true,
  },
  {
    id: 'poznavani',
    level: 'pismena',
    title: 'Velké a malé',
    desc: 'Najdi k velkému písmenu malé',
    icon: '🔍',
    intro: 'Najdi stejné písmenko.',
    size: same,
  },
  {
    id: 'parovani',
    level: 'pismena',
    title: 'Párování',
    desc: 'Spoj velká a malá písmenka',
    icon: '🔗',
    intro: 'Spoj velká a malá písmenka.',
    size: (n) => Math.max(2, Math.round(n / 2)),
  },
  {
    id: 'hledej',
    level: 'pismena',
    title: 'Hledej písmenko',
    desc: 'Najdi všechna stejná písmenka',
    icon: '🕵️',
    intro: 'Najdi všechna stejná písmenka.',
    size: (n) => Math.max(3, Math.min(n, 8)),
    isNew: true,
  },
  {
    id: 'zacina',
    level: 'pismena',
    title: 'Na co začíná?',
    desc: 'První hláska slova',
    icon: '🐱',
    intro: 'Na jaké písmenko začíná slovo?',
    size: same,
    needsVoice: true,
    isNew: true,
  },
  {
    id: 'obtahuj',
    level: 'pismena',
    title: 'Obtahuj',
    desc: 'Piš písmenka prstem',
    icon: '✍️',
    intro: 'Obtáhni písmenko prstem. Začni u zelené tečky.',
    size: (n) => Math.max(3, Math.min(n, 6)),
    isNew: true,
  },
  // ─── Slabiky ───
  {
    id: 'slabiky',
    level: 'slabiky',
    title: 'Slyšíš slabiku?',
    desc: 'MA, ME, MI… poslouchej a najdi',
    icon: '👂',
    intro: 'Poslouchej a najdi slabiku.',
    size: same,
    needsVoice: true,
    isNew: true,
  },
  {
    id: 'cti-slabiky',
    level: 'slabiky',
    title: 'Čti po slabikách',
    desc: 'MA-MA, LE-PO… a najdi obrázek',
    icon: '👀',
    intro: 'Přečti slovo po slabikách a ukaž obrázek.',
    size: same,
    isNew: true,
  },
  {
    id: 'skladej-slabiky',
    level: 'slabiky',
    title: 'Slož ze slabik',
    desc: 'Poskládej slovo ze slabik',
    icon: '🧩',
    intro: 'Poskládej slovo ze slabik.',
    size: same,
    isNew: true,
  },
  // ─── Slova ───
  {
    id: 'cti-slova',
    level: 'slova',
    title: 'Co je napsáno?',
    desc: 'Přečti slovo a najdi obrázek',
    icon: '🖼️',
    intro: 'Přečti slovo a najdi správný obrázek.',
    size: same,
    isNew: true,
  },
  {
    id: 'slova',
    level: 'slova',
    title: 'Velká a malá slova',
    desc: 'Najdi stejné slovo jiným písmem',
    icon: '🔠',
    intro: 'Najdi stejné slovo.',
    size: same,
  },
  {
    id: 'skladani',
    level: 'slova',
    title: 'Skládání',
    desc: 'Slož slovo z písmenek',
    icon: '🧱',
    intro: 'Slož slovo z písmenek.',
    size: same,
  },
  {
    id: 'rymy',
    level: 'slova',
    title: 'Rýmy',
    desc: 'Co se rýmuje?',
    icon: '🎵',
    intro: 'Najdi slovo, které se rýmuje.',
    size: same,
    needsVoice: true,
    isNew: true,
  },
  {
    id: 'diktat',
    level: 'slova',
    title: 'Diktát',
    desc: 'Napiš slovo, které uslyšíš',
    icon: '⌨️',
    intro: 'Poslouchej a napiš slovo.',
    size: (n) => Math.max(3, Math.min(n, 8)),
    needsVoice: true,
    isNew: true,
  },
  // ─── Věty ───
  {
    id: 'pravda',
    level: 'vety',
    title: 'Pravda, nebo ne?',
    desc: 'Přečti větu – je pravdivá?',
    icon: '🤔',
    intro: 'Přečti větu. Je to pravda?',
    size: same,
    isNew: true,
  },
  {
    id: 'vety',
    level: 'vety',
    title: 'Doplň slovo',
    desc: 'Které slovo do věty patří?',
    icon: '✏️',
    intro: 'Doplň slovo do věty.',
    size: same,
  },
];

export const ACTIVITY_BY_ID = new Map(ACTIVITIES.map((a) => [a.id, a]));

export function isActivityId(id: string): id is ActivityId {
  return ACTIVITY_BY_ID.has(id as ActivityId);
}

/**
 * Doporučená další aktivita: nejnižší úroveň, ve které je něco nehrané nebo pod 3 hvězdami,
 * přednost má to, co se nehrálo nejdéle.
 */
export function recommend(
  stats: Record<string, { bestStars: number; lastPlayed: number; sessions: number } | undefined>,
  exclude?: ActivityId,
): ActivityId {
  const candidates = ACTIVITIES.filter((a) => a.id !== exclude);
  for (const level of LEVELS) {
    const inLevel = candidates.filter((a) => a.level === level.id);
    const weak = inLevel.filter((a) => (stats[a.id]?.bestStars ?? 0) < 3);
    if (weak.length) {
      weak.sort((a, b) => (stats[a.id]?.lastPlayed ?? 0) - (stats[b.id]?.lastPlayed ?? 0));
      return weak[0]!.id;
    }
  }
  const all = [...candidates].sort((a, b) => (stats[a.id]?.lastPlayed ?? 0) - (stats[b.id]?.lastPlayed ?? 0));
  return all[0]!.id;
}
