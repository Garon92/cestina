/**
 * Česká abeceda – 42 písmen (včetně Ch a všech písmen s diakritikou).
 *
 * `key`   – kanonický klíč písmene (velká podoba, u Ch „CH“), používá se v postupu.
 * `upper` – jak písmeno ukazujeme jako velké (u Ch „Ch“, tak ho uvádí abeceda).
 * `lower` – malá podoba.
 * `say`   – co přečte hlasová syntéza jako NÁZEV písmene. Čeština v TTS jednotlivé znaky
 *           čte nespolehlivě (a velká písmena hláskuje), proto máme pevnou výslovnost.
 *           I a Y znějí stejně – proto „měkké i“ / „tvrdé y“, jak se to učí ve škole.
 * `word`  – ukázkové slovo (malými písmeny), `emoji` – obrázek k němu.
 */
export interface Letter {
  key: string;
  upper: string;
  lower: string;
  say: string;
  word: string;
  emoji: string;
  vowel: boolean;
  /** Písmeno vzniklé přidáním čárky/háčku/kroužku – základní písmeno. */
  base?: string;
}

const L = (
  key: string,
  upper: string,
  lower: string,
  say: string,
  word: string,
  emoji: string,
  vowel = false,
  base?: string,
): Letter => ({ key, upper, lower, say, word, emoji, vowel, ...(base ? { base } : {}) });

export const ALPHABET: readonly Letter[] = [
  L('A', 'A', 'a', 'a', 'auto', '🚗', true),
  L('Á', 'Á', 'á', 'dlouhé á', 'máma', '👩', true, 'A'),
  L('B', 'B', 'b', 'bé', 'balón', '🎈'),
  L('C', 'C', 'c', 'cé', 'cibule', '🧅'),
  L('Č', 'Č', 'č', 'čé', 'čepice', '🧢', false, 'C'),
  L('D', 'D', 'd', 'dé', 'dům', '🏠'),
  L('Ď', 'Ď', 'ď', 'ďé', 'loď', '🚢', false, 'D'),
  L('E', 'E', 'e', 'e', 'elf', '🧝', true),
  L('É', 'É', 'é', 'dlouhé é', 'mléko', '🥛', true, 'E'),
  L('Ě', 'Ě', 'ě', 'e s háčkem', 'měsíc', '🌙', true, 'E'),
  L('F', 'F', 'f', 'ef', 'fotoaparát', '📷'),
  L('G', 'G', 'g', 'gé', 'gorila', '🦍'),
  L('H', 'H', 'h', 'há', 'had', '🐍'),
  L('CH', 'Ch', 'ch', 'chá', 'chobotnice', '🐙'),
  L('I', 'I', 'i', 'měkké i', 'miminko', '👶', true),
  L('Í', 'Í', 'í', 'dlouhé měkké í', 'míč', '⚽', true, 'I'),
  L('J', 'J', 'j', 'jé', 'jablko', '🍎'),
  L('K', 'K', 'k', 'ká', 'kočka', '🐱'),
  L('L', 'L', 'l', 'el', 'liška', '🦊'),
  L('M', 'M', 'm', 'em', 'medvěd', '🐻'),
  L('N', 'N', 'n', 'en', 'nos', '👃'),
  L('Ň', 'Ň', 'ň', 'eň', 'kůň', '🐴', false, 'N'),
  L('O', 'O', 'o', 'o', 'orel', '🦅', true),
  L('Ó', 'Ó', 'ó', 'dlouhé ó', 'citrón', '🍋', true, 'O'),
  L('P', 'P', 'p', 'pé', 'pes', '🐶'),
  L('Q', 'Q', 'q', 'kvé', 'aquapark', '🏊'),
  L('R', 'R', 'r', 'er', 'ryba', '🐟'),
  L('Ř', 'Ř', 'ř', 'eř', 'řeka', '🏞️', false, 'R'),
  L('S', 'S', 's', 'es', 'slunce', '☀️'),
  L('Š', 'Š', 'š', 'eš', 'šnek', '🐌', false, 'S'),
  L('T', 'T', 't', 'té', 'tygr', '🐯'),
  L('Ť', 'Ť', 'ť', 'ťé', 'ťapka', '🐾', false, 'T'),
  L('U', 'U', 'u', 'u', 'ucho', '👂', true),
  L('Ú', 'Ú', 'ú', 'ú s čárkou', 'úsměv', '😊', true, 'U'),
  L('Ů', 'Ů', 'ů', 'ů s kroužkem', 'růže', '🌹', true, 'U'),
  L('V', 'V', 'v', 'vé', 'vlak', '🚂'),
  L('W', 'W', 'w', 'dvojité vé', 'wifi', '📶'),
  L('X', 'X', 'x', 'iks', 'xylofon', '🎶'),
  L('Y', 'Y', 'y', 'tvrdé y', 'myš', '🐭', true),
  L('Ý', 'Ý', 'ý', 'dlouhé tvrdé ý', 'sýr', '🧀', true, 'Y'),
  L('Z', 'Z', 'z', 'zet', 'zebra', '🦓'),
  L('Ž', 'Ž', 'ž', 'žet', 'žába', '🐸'),
];

export const LETTER_KEYS: readonly string[] = ALPHABET.map((l) => l.key);

const BY_KEY = new Map(ALPHABET.map((l) => [l.key, l]));

export function letterByKey(key: string): Letter {
  const l = BY_KEY.get(key.toLocaleUpperCase('cs-CZ'));
  if (!l) throw new Error(`Neznámé písmeno: ${key}`);
  return l;
}

export function findLetter(key: string): Letter | undefined {
  return BY_KEY.get(key.toLocaleUpperCase('cs-CZ'));
}

/** Písmena, která jde použít v kvízech s jedním znakem (bez Ch – je to spřežka ze dvou znaků). */
export const SINGLE_LETTERS: readonly Letter[] = ALPHABET.filter((l) => l.key !== 'CH');

/** Písmena, se kterými se v textu opravdu setkáme (Q, W, X jsou jen v cizích slovech). */
export const COMMON_LETTERS: readonly Letter[] = ALPHABET.filter((l) => !['Q', 'W', 'X'].includes(l.key));

/**
 * Písmena, která si děti snadno spletou – slouží jako „zlomyslné“ distraktory.
 * Klíče jsou kanonické (velké), dvojice platí oběma směry.
 */
const CONFUSABLE_UPPER: Record<string, string[]> = {
  M: ['N', 'W'], N: ['M', 'H'], W: ['M', 'V'], E: ['F', 'B'], F: ['E', 'P'], O: ['Q', 'C', 'D'],
  Q: ['O', 'G'], C: ['G', 'O'], G: ['C', 'Q'], P: ['R', 'B'], R: ['P', 'B'], B: ['P', 'R', 'D'],
  D: ['O', 'B'], I: ['J', 'L'], J: ['I', 'L'], L: ['I', 'J'], U: ['V', 'J'], V: ['U', 'Y'],
  K: ['X', 'R'], X: ['K', 'Y'], Y: ['V', 'X'], S: ['Z'], Z: ['S', 'N'], H: ['N'], T: ['I', 'Y'],
  A: ['H'],
};
const CONFUSABLE_LOWER: Record<string, string[]> = {
  B: ['D', 'P'], D: ['B', 'Q'], P: ['Q', 'B'], Q: ['P', 'D'], M: ['N', 'W'], N: ['U', 'M', 'H'],
  U: ['N', 'V'], H: ['N', 'K'], I: ['J', 'L'], J: ['I'], L: ['I', 'T'], T: ['F', 'L'], F: ['T'],
  E: ['C', 'O'], C: ['E', 'O'], O: ['A', 'C'], A: ['O', 'D'], S: ['Z'], Z: ['S'], V: ['Y', 'W'],
  Y: ['V', 'J'], W: ['V', 'M'], K: ['H'], R: ['N'], G: ['Q'],
};

/** Vrátí zaměnitelná písmena pro danou podobu (velká/malá). Háčky a čárky se dědí ze základu. */
export function confusablesOf(key: string, lowerCase: boolean): string[] {
  const letter = findLetter(key);
  const base = letter?.base ?? key;
  const table = lowerCase ? CONFUSABLE_LOWER : CONFUSABLE_UPPER;
  const out = new Set<string>(table[base] ?? []);
  // Stejné písmeno s jinou diakritikou je taky dobrý „chyták“ (C × Č, E × Ě…).
  for (const l of ALPHABET) {
    if (l.key !== key && (l.base === base || l.key === base || (letter?.base && l.base === letter.base))) out.add(l.key);
  }
  out.delete(key);
  return [...out].filter((k) => BY_KEY.has(k));
}

/** Skupiny písmen stejného zvuku, které se nesmí objevit společně jako možnosti v poslechových úlohách. */
export function soundsAlike(a: string, b: string): boolean {
  const g = (k: string) => (k === 'Y' ? 'I' : k === 'Ý' ? 'Í' : k === 'Ů' ? 'Ú' : k);
  return g(a) === g(b);
}

/** Vrátí první písmeno slova jako klíč abecedy (respektuje spřežku „ch“). */
export function firstLetterKey(word: string): string {
  const w = word.toLocaleLowerCase('cs-CZ');
  if (w.startsWith('ch')) return 'CH';
  return (w[0] ?? '').toLocaleUpperCase('cs-CZ');
}

/** Rozdělí slovo na písmena české abecedy (ch = jedno písmeno). */
export function splitLetters(word: string): string[] {
  const out: string[] = [];
  const chars = [...word];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const n = chars[i + 1];
    if ((c === 'c' || c === 'C') && (n === 'h' || n === 'H')) {
      out.push(c + n);
      i++;
    } else out.push(c);
  }
  return out;
}

/** Předdefinované sady písmen pro nastavení (pořadí podle běžných slabikářů). */
export const LETTER_PRESETS: { id: string; label: string; keys: string[] }[] = [
  { id: 'vse', label: 'Všechna písmena', keys: [...LETTER_KEYS] },
  { id: 'bezne', label: 'Bez Q, W, X', keys: COMMON_LETTERS.map((l) => l.key) },
  {
    id: 'zacatek',
    label: 'První písmena (A M E L I O P S T U)',
    keys: ['A', 'M', 'E', 'L', 'I', 'O', 'P', 'S', 'T', 'U'],
  },
  {
    id: 'bez-diakritiky',
    label: 'Bez háčků a čárek',
    keys: ALPHABET.filter((l) => !l.base && !['Q', 'W', 'X'].includes(l.key)).map((l) => l.key),
  },
  { id: 'samohlasky', label: 'Samohlásky', keys: ALPHABET.filter((l) => l.vowel).map((l) => l.key) },
];
