/** Druh písma, kterým dítě čte: VELKÁ TISKACÍ, malá tiskací, nebo psací. */
export type LetterCase = 'upper' | 'lower' | 'script';

export const CASE_LABEL: Record<LetterCase, string> = {
  upper: 'VELKÁ TISKACÍ',
  lower: 'malá tiskací',
  script: 'psací',
};

const up = (s: string) => s.toLocaleUpperCase('cs-CZ');
const low = (s: string) => s.toLocaleLowerCase('cs-CZ');

/** Slovo (podstatné jméno apod.) v daném písmu. */
export function caseWord(word: string, mode: LetterCase): string {
  return mode === 'upper' ? up(word) : low(word);
}

/** Věta – VELKÁ = vše velkými, jinak přirozeně (velké písmeno na začátku). */
export function caseSentence(text: string, mode: LetterCase): string {
  return mode === 'upper' ? up(text) : text;
}

/** Písmeno: velké písmeno „Ch“ zůstává „Ch“, v textu VELKÝMI je to „CH“. */
export function caseLetter(letter: { upper: string; lower: string }, mode: LetterCase): string {
  return mode === 'upper' ? letter.upper : letter.lower;
}

/** Text k přečtení syntézou – vždy malými (velká písmena čte čeština v TTS jako zkratky). */
export function forSpeech(text: string): string {
  return low(text).replace(/_{2,}/g, ' … ');
}

export function capitalize(s: string): string {
  return s ? up(s[0]!) + s.slice(1) : s;
}

/** Česká množná čísla: plural(3, 'hvězda', 'hvězdy', 'hvězd'). */
export function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}
