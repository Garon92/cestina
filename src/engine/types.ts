import type { ReactNode } from 'react';
import type { AppSettings } from '../lib/store';
import type { LetterCase } from '../lib/text';
import type { GenContext } from './generators';
import type { ActivityMeta } from './meta';

export interface LetterResult {
  key: string;
  ok: boolean;
}

export interface TaskApi {
  /** Dítě zkusilo špatnou odpověď. `say` = co říct (např. název špatného písmene). */
  mistake: (opts?: { say?: string }) => void;
  /** Úloha vyřešená. `say` = co říct jako odměnu (např. celé slovo), `letters` = výsledky po písmenech. */
  done: (opts?: { say?: string; letters?: LetterResult[] }) => void;
  /** Kolik chyb už v této úloze padlo (po 2 chybách ukazujeme nápovědu). */
  mistakes: number;
  /** Úloha je vyřešená – ovládání zamknout. */
  solved: boolean;
  mode: LetterCase;
  settings: AppSettings;
  /** Znovu přečte zadání úlohy. */
  repeatPrompt: () => void;
}

export interface TaskProps<T> {
  task: T;
  api: TaskApi;
  index: number;
}

export interface ReviewItem {
  label: string;
  say: string;
  emoji?: string;
}

export interface ActivityDef<T> {
  meta: ActivityMeta;
  generate: (ctx: GenContext) => T[];
  Component: (p: TaskProps<T>) => ReactNode;
  /** Krátká instrukce nad úlohou (text vedle reproduktoru). */
  instruction: (task: T, mode: LetterCase) => string;
  /** Co přečíst na začátku úlohy (po úvodní větě u první úlohy). */
  prompt: (task: T, mode: LetterCase, prev: T | undefined) => string;
  /** Titulek k promluvě (když chybí hlas) – default = text promluvy. */
  caption?: (task: T, mode: LetterCase) => string;
  /** Písmeno, kterého se úloha týká (pro postup „umím“). */
  letterOf?: (task: T) => string | undefined;
  /** Položka do přehledu chyb na konci. */
  review: (task: T) => ReviewItem;
}

// Pomocník pro typově bezpečnou registraci.
export function defineActivity<T>(def: ActivityDef<T>): ActivityDef<T> {
  return def;
}
