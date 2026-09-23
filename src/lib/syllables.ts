/**
 * Dělení českých slov na slabiky – zjednodušená pravidla vhodná pro čtení ve slabikáři:
 *
 * - Jádro slabiky tvoří samohláska, dvojhláska (ou, au) nebo slabikotvorné r/l
 *   (mezi souhláskami nebo na konci slova po souhlásce: vlk, krk, ja-bl-ko, bo-br).
 * - „ch“ je jedna souhláska.
 * - Jedna souhláska mezi jádry patří do další slabiky (ma-ma, le-po).
 * - Více souhlásek: první zůstane v předchozí slabice, ostatní jdou do další (koč-ka, ses-tra, deš-tník).
 */

const VOWELS = new Set([...'aáeéěiíoóuúůyý']);

type Tok = { t: string; kind: 'V' | 'C' };

const lower = (t: Tok) => t.t.toLocaleLowerCase('cs-CZ');
/** Neslabikotvorné r / l (souhláska). */
const isLiquid = (t: Tok) => t.kind === 'C' && (lower(t) === 'r' || lower(t) === 'l');
const isSonorantOrJ = (t: Tok) => ['r', 'l', 'j', 'ř'].includes(lower(t));

function tokenize(word: string): Tok[] {
  const chars = [...word];
  const out: Tok[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const lc = c.toLocaleLowerCase('cs-CZ');
    const n = chars[i + 1];
    const ln = n?.toLocaleLowerCase('cs-CZ');
    if (lc === 'c' && ln === 'h') {
      out.push({ t: c + n, kind: 'C' });
      i++;
    } else if ((lc === 'o' || lc === 'a') && ln === 'u') {
      out.push({ t: c + n, kind: 'V' });
      i++;
    } else if (VOWELS.has(lc)) {
      out.push({ t: c, kind: 'V' });
    } else {
      out.push({ t: c, kind: 'C' });
    }
  }
  // Slabikotvorné r / l.
  for (let i = 0; i < out.length; i++) {
    const tok = out[i]!;
    const lt = tok.t.toLocaleLowerCase('cs-CZ');
    if (tok.kind !== 'C' || (lt !== 'r' && lt !== 'l')) continue;
    const prev = out[i - 1];
    const next = out[i + 1];
    if (prev && prev.kind === 'C' && (!next || next.kind === 'C')) {
      // Pokud je před r/l už jiné jádro bez samohlásky (např. „vrb“), stačí jedno.
      tok.kind = 'V';
    }
  }
  return out;
}

/** Rozdělí jedno slovo (bez mezer) na slabiky. */
export function syllabifyWord(word: string): string[] {
  if (!word) return [];
  const toks = tokenize(word);
  const nuclei: number[] = [];
  toks.forEach((t, i) => {
    if (t.kind === 'V') nuclei.push(i);
  });
  if (nuclei.length <= 1) return [word];

  // Pro každou dvojici jader určíme, kde začíná další slabika.
  const starts: number[] = [0];
  for (let k = 0; k < nuclei.length - 1; k++) {
    const a = nuclei[k]!;
    const b = nuclei[k + 1]!;
    const cons = b - a - 1;
    let start: number;
    if (cons <= 0) start = b; // hiát: ko-a-la
    else if (cons === 1) start = b - 1; // ma-ma
    else if (cons === 2 && isLiquid(toks[b - 1]!) && !isSonorantOrJ(toks[b - 2]!)) start = b - 2; // ze-bra, le-ta-dlo
    else start = a + 2; // koč-ka, ses-tra
    starts.push(start);
  }
  const syl: string[] = [];
  for (let s = 0; s < starts.length; s++) {
    const from = starts[s]!;
    const to = s + 1 < starts.length ? starts[s + 1]! : toks.length;
    syl.push(
      toks
        .slice(from, to)
        .map((t) => t.t)
        .join(''),
    );
  }
  return syl;
}

/** Rozdělí text (i víceslovný) na slabiky; mezery zůstanou jako samostatné položky „ “. */
export function syllabify(text: string): string[] {
  const parts = text.split(/(\s+)/);
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (/^\s+$/.test(p)) out.push(' ');
    else out.push(...syllabifyWord(p));
  }
  return out;
}

/** Slovo zapsané se spojovníky mezi slabikami: „ma-ma“. */
export function hyphenate(word: string, sep = '-'): string {
  return word
    .split(/\s+/)
    .map((w) => syllabifyWord(w).join(sep))
    .join(' ');
}

/** Počet slabik slova. */
export function syllableCount(word: string): number {
  return syllabify(word).filter((s) => s !== ' ').length;
}

/**
 * „Jednoduché“ slabikování – slovo, které se dá bezpečně ukázat po slabikách v úlohách pro začátečníky:
 * žádné slabikotvorné r/l, žádné shluky tří souhlásek, žádná víceslovná spojení.
 */
export function hasSimpleSyllables(word: string): boolean {
  if (/\s/.test(word)) return false;
  const toks = tokenize(word);
  let run = 0;
  for (const t of toks) {
    const lt = t.t.toLocaleLowerCase('cs-CZ');
    if (t.kind === 'V' && (lt === 'r' || lt === 'l')) return false;
    if (t.kind === 'C') {
      run++;
      if (run >= 3) return false;
    } else run = 0;
  }
  return true;
}

/** Otevřená slabika CV (souhláska + samohláska), např. MA, LE. */
export function isOpenSyllable(s: string): boolean {
  const toks = tokenize(s);
  return toks.length === 2 && toks[0]!.kind === 'C' && toks[1]!.kind === 'V';
}
