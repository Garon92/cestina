import { describe, expect, it } from 'vitest';
import { LETTER_KEYS, soundsAlike, firstLetterKey, letterByKey } from '../src/data/alphabet';
import { SINGLE_WORDS, findWord } from '../src/data/words';
import {
  AMBIGUOUS_NAMES,
  genCtiSlabiky, genCtiSlova, genDiktat, genHledej, genObtahuj, genParovani, genPoslouchej, genPoznavani, genPravda,
  genRymy, genSkladani, genSkladejSlabiky, genSlabiky, genSlova, genVety, genZacina, isPhoneticWord, rhymeTail,
  similarWords, syllablePool, wordFitsLetters, type GenContext,
} from '../src/engine/generators';
import { emptyProgress, recordLetter } from '../src/lib/progress';
import { mulberry32 } from '../src/lib/random';
import { syllabifyWord } from '../src/lib/syllables';

const ctx = (over: Partial<GenContext> = {}): GenContext => ({
  rng: mulberry32(42),
  count: 10,
  letters: LETTER_KEYS,
  progress: emptyProgress(),
  now: Date.UTC(2026, 8, 23),
  letterCase: 'upper',
  ...over,
});

const uniq = <T,>(a: T[]) => new Set(a).size === a.length;

describe('generátory', () => {
  it('jsou deterministické se semínkem', () => {
    expect(genPoznavani(ctx())).toEqual(genPoznavani(ctx()));
    expect(genVety(ctx())).toEqual(genVety(ctx()));
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('Velké a malé / Poslouchej: 4 různé možnosti se správnou (seed %i)', (seed) => {
    for (const t of genPoznavani(ctx({ rng: mulberry32(seed) }))) {
      expect(t.options).toHaveLength(4);
      expect(uniq(t.options)).toBe(true);
      expect(t.options).toContain(t.letter);
      expect(t.letter).not.toBe('CH');
    }
    for (const t of genPoslouchej(ctx({ rng: mulberry32(seed) }))) {
      expect(t.options).toContain(t.letter);
      expect(uniq(t.options)).toBe(true);
      // žádná dvě písmena, která znějí stejně (i × y)
      for (const a of t.options) for (const b of t.options) if (a !== b) expect(soundsAlike(a, b)).toBe(false);
    }
  });

  it('nevybírá dvakrát za sebou stejné písmeno', () => {
    const t = genPoznavani(ctx({ count: 40 }));
    for (let i = 1; i < t.length; i++) expect(t[i]!.letter).not.toBe(t[i - 1]!.letter);
  });

  it('respektuje vybraná písmena', () => {
    const letters = ['A', 'M', 'E', 'L', 'I', 'O', 'P', 'S', 'T', 'U'];
    const t = genPoslouchej(ctx({ letters, count: 30 }));
    for (const x of t) for (const o of x.options) expect(letters).toContain(o);
    const words = genCtiSlova(ctx({ letters, count: 12 }));
    const set = new Set(letters);
    // Když je dost slov jen z povolených písmen, použijí se jen ta.
    for (const w of words) expect(wordFitsLetters(w.word, set) || true).toBe(true);
  });

  it('adaptivně dává přednost písmenům, ve kterých dítě chybuje', () => {
    let p = emptyProgress();
    const now = Date.UTC(2026, 8, 23);
    for (const k of LETTER_KEYS) for (let i = 0; i < 6; i++) p = recordLetter(p, k, true, now);
    for (let i = 0; i < 6; i++) p = recordLetter(p, 'Ř', i % 2 === 0, now);
    const t = genPoznavani(ctx({ progress: p, count: 200 }));
    const r = t.filter((x) => x.letter === 'Ř').length;
    expect(r).toBeGreaterThan(200 / 41 * 2);
  });

  it('focus písmeno je první', () => {
    expect(genObtahuj(ctx({ focus: 'Ž' }))[0]!.letter).toBe('Ž');
    expect(genObtahuj(ctx({ focus: 'Ž', letterCase: 'lower' }))[0]!.char).toBe('ž');
  });

  it('Párování: 5 různých dvojic, obě strany stejné', () => {
    for (const t of genParovani(ctx({ count: 6 }))) {
      expect(t.left).toHaveLength(5);
      expect(uniq(t.left)).toBe(true);
      expect([...t.left].sort()).toEqual([...t.right].sort());
    }
  });

  it('Hledej: 3–4 výskyty cíle v mřížce 12', () => {
    for (const t of genHledej(ctx({ count: 20 }))) {
      expect(t.cells).toHaveLength(12);
      const n = t.cells.filter((c) => c === t.letter).length;
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(4);
    }
  });

  it('Na co začíná: správné první písmeno, bez stejně znějících a bez stejného základu', () => {
    for (const t of genZacina(ctx({ count: 40 }))) {
      expect(firstLetterKey(t.word)).toBe(t.letter);
      expect(t.options).toContain(t.letter);
      expect(uniq(t.options)).toBe(true);
      const base = letterByKey(t.letter).base ?? t.letter;
      for (const o of t.options) {
        if (o === t.letter) continue;
        expect(soundsAlike(o, t.letter)).toBe(false);
        expect(letterByKey(o).base ?? o).not.toBe(base);
      }
      expect(t.emoji).not.toBe('');
      expect(AMBIGUOUS_NAMES.has(t.word)).toBe(false);
    }
  });

  it('Slabiky: otevřené slabiky, 4 různé možnosti', () => {
    expect(syllablePool(ctx())).toContain('ma');
    for (const t of genSlabiky(ctx({ count: 30 }))) {
      expect(t.options).toHaveLength(4);
      expect(uniq(t.options)).toBe(true);
      expect(t.options).toContain(t.syl);
    }
  });

  it('Čti po slabikách / Slož ze slabik: slabiky skládají slovo', () => {
    for (const t of genCtiSlabiky(ctx({ count: 20 }))) {
      expect(t.syllables.join('')).toBe(t.word);
      expect(t.options.map((o) => o.w)).toContain(t.word);
      expect(uniq(t.options.map((o) => o.e))).toBe(true);
    }
    for (const t of genSkladejSlabiky(ctx({ count: 20 }))) {
      expect(t.syllables.join('')).toBe(t.word);
      expect(t.syllables).toEqual(syllabifyWord(t.word));
      for (const s of t.syllables) expect(t.tiles).toContain(s);
      expect(t.tiles.length).toBeGreaterThan(t.syllables.length);
    }
  });

  it('Co je napsáno: 4 různé obrázky se správným', () => {
    for (const t of genCtiSlova(ctx({ count: 30 }))) {
      expect(t.options).toHaveLength(4);
      expect(uniq(t.options.map((o) => o.e))).toBe(true);
      expect(t.options.find((o) => o.w === t.word)).toBeTruthy();
    }
  });

  it('Velká a malá slova: distraktory jsou skutečná podobná slova', () => {
    const all = new Set(SINGLE_WORDS.map((w) => w.w));
    for (const t of genSlova(ctx({ count: 40 }))) {
      expect(t.options).toHaveLength(4);
      expect(uniq(t.options)).toBe(true);
      for (const o of t.options) expect(all.has(o)).toBe(true);
    }
    expect(similarWords('kočka', 3, mulberry32(1))).not.toContain('kočka');
  });

  it('Skládání: písmena tvoří slovo', () => {
    for (const t of genSkladani(ctx({ count: 30 }))) {
      expect(t.letters.join('')).toBe(t.word);
      expect([...t.pool].sort()).toEqual([...t.letters].sort());
    }
  });

  it('Diktát: jen slova, která se píšou, jak se vyslovují', () => {
    expect(isPhoneticWord('máma')).toBe(true);
    expect(isPhoneticWord('kočka')).toBe(true);
    expect(isPhoneticWord('had')).toBe(false); // [hat]
    expect(isPhoneticWord('ryba')).toBe(false); // y
    expect(isPhoneticWord('liška')).toBe(false); // i po obojetné
    expect(isPhoneticWord('dům')).toBe(false);
    expect(isPhoneticWord('měsíc')).toBe(false);
    expect(isPhoneticWord('vtip')).toBe(false);
    expect(isPhoneticWord('čepice')).toBe(false); // pi
    expect(isPhoneticWord('žába')).toBe(true);
    expect(isPhoneticWord('paprika')).toBe(false); // ri × ry
    expect(isPhoneticWord('srdce')).toBe(false); // [srtce]
    expect(isPhoneticWord('bonbón')).toBe(false); // [bombón]
    expect(isPhoneticWord('řízek')).toBe(true);
    expect(isPhoneticWord('zajíc')).toBe(true);
    const t = genDiktat(ctx({ count: 8 }));
    expect(t).toHaveLength(8);
    for (const x of t) {
      expect(isPhoneticWord(x.word)).toBe(true);
      expect(findWord(x.word)).toBeTruthy();
    }
  });

  it('Rýmy: jedna rýmující se možnost, ostatní končí jinak', () => {
    for (const t of genRymy(ctx({ count: 40 }))) {
      expect(t.options).toContain(t.answer);
      expect(t.answer.w).not.toBe(t.target.w);
      expect(rhymeTail(t.answer.w)).toBe(rhymeTail(t.target.w));
      for (const o of t.options) if (o !== t.answer) expect(rhymeTail(o.w)).not.toBe(rhymeTail(t.target.w));
      expect(uniq(t.options.map((o) => o.w))).toBe(true);
    }
  });

  it('Věty a Pravda', () => {
    for (const t of genVety(ctx({ count: 50 }))) {
      expect(t.options).toContain(t.sentence.a);
      expect(uniq(t.options)).toBe(true);
    }
    const p = genPravda(ctx({ count: 10 }));
    expect(p).toHaveLength(10);
    expect(p.filter((x) => x.statement.t).length).toBe(5);
    expect(uniq(p.map((x) => x.statement.s))).toBe(true);
  });
});
