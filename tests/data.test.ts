import { describe, expect, it } from 'vitest';
import { ALPHABET, LETTER_KEYS, splitLetters, firstLetterKey, confusablesOf } from '../src/data/alphabet';
import { WORDS, PICTURE_WORDS } from '../src/data/words';
import { SENTENCES } from '../src/data/sentences';
import { STATEMENTS } from '../src/data/statements';
import { RHYME_GROUPS } from '../src/data/rhymes';
import { STICKERS } from '../src/data/stickers';
import { LEGACY_WORDS, FORBIDDEN } from './legacy';

const CZ_WORD = /^[a-záčďéěíňóřšťúůýž]+( [a-záčďéěíňóřšťúůýž]+)*$/;
const CZ_TEXT = /^[A-Za-zÁČĎÉĚÍŇÓŘŠŤÚŮÝŽáčďéěíňóřšťúůýž0-9 ,.!?„“:_-]+$/;

describe('abeceda', () => {
  it('má 42 písmen v pořadí české abecedy, bez duplicit', () => {
    expect(ALPHABET).toHaveLength(42);
    expect(new Set(LETTER_KEYS).size).toBe(42);
    expect(LETTER_KEYS.join(' ')).toBe(
      'A Á B C Č D Ď E É Ě F G H CH I Í J K L M N Ň O Ó P Q R Ř S Š T Ť U Ú Ů V W X Y Ý Z Ž',
    );
  });
  it('ukázkové slovo obsahuje dané písmeno', () => {
    for (const l of ALPHABET) {
      expect(l.word.includes(l.lower), `${l.key}: ${l.word}`).toBe(true);
      expect(CZ_WORD.test(l.word)).toBe(true);
    }
  });
  it('I a Y se jmenují různě (znějí stejně)', () => {
    const say = new Set(ALPHABET.map((l) => l.say));
    expect(say.size).toBe(42);
  });
  it('rozdělí ch jako jedno písmeno', () => {
    expect(splitLetters('chobotnice')).toEqual(['ch', 'o', 'b', 'o', 't', 'n', 'i', 'c', 'e']);
    expect(firstLetterKey('chléb')).toBe('CH');
    expect(firstLetterKey('čaj')).toBe('Č');
  });
  it('zaměnitelná písmena existují a neobsahují samo písmeno', () => {
    for (const k of LETTER_KEYS) {
      for (const lower of [true, false]) {
        const c = confusablesOf(k, lower);
        expect(c).not.toContain(k);
        for (const x of c) expect(LETTER_KEYS).toContain(x);
      }
    }
    expect(confusablesOf('B', true)).toContain('D');
    expect(confusablesOf('C', false)).toContain('Č');
  });
});

describe('slova', () => {
  it('jsou spisovně malými písmeny, bez duplicit', () => {
    const seen = new Set<string>();
    for (const w of WORDS) {
      expect(CZ_WORD.test(w.w), w.w).toBe(true);
      expect(seen.has(w.w), `duplicita ${w.w}`).toBe(false);
      seen.add(w.w);
    }
    expect(WORDS.length).toBeGreaterThan(400);
  });
  it('každé emoji obrázku je jen u jednoho slova', () => {
    const map = new Map<string, string>();
    for (const w of PICTURE_WORDS) {
      expect(map.has(w.e), `${w.e} u ${w.w} i ${map.get(w.e)}`).toBe(false);
      map.set(w.e, w.w);
    }
    expect(PICTURE_WORDS.length).toBeGreaterThan(200);
  });
  it('obsahují všechna slova ze staré verze', () => {
    const all = new Set(WORDS.map((w) => w.w));
    const missing = LEGACY_WORDS.filter((w) => !all.has(w));
    expect(missing).toEqual([]);
  });
  it('neobsahují nevhodná slova', () => {
    const texts = [
      ...WORDS.map((w) => w.w),
      ...SENTENCES.flatMap((s) => [s.s, s.a, ...s.o]),
      ...STATEMENTS.map((s) => s.s),
      ...ALPHABET.map((l) => l.word),
    ].map((t) => t.toLowerCase());
    for (const bad of FORBIDDEN) expect(texts.some((t) => t.split(/[^a-záčďéěíňóřšťúůýž]+/).includes(bad)), bad).toBe(false);
  });
});

describe('věty', () => {
  it('mají přesně jednu mezeru, správnou odpověď a 2–3 různé špatné možnosti', () => {
    for (const s of SENTENCES) {
      expect(s.s.split('___').length - 1, s.s).toBe(1);
      expect(s.o.length).toBeGreaterThanOrEqual(2);
      expect(s.o.length).toBeLessThanOrEqual(3);
      expect(new Set([s.a, ...s.o]).size, s.s).toBe(s.o.length + 1);
      expect(CZ_TEXT.test(s.s), s.s).toBe(true);
      expect(/^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(s.s), s.s).toBe(true);
      expect(/[.!?“]$/.test(s.s), s.s).toBe(true);
    }
    expect(SENTENCES.length).toBeGreaterThan(400);
  });
  it('se neopakují', () => {
    const keys = SENTENCES.map((s) => `${s.s}|${s.a}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('„Pravda, nebo ne?“ má vyvážené a unikátní věty', () => {
    const t = STATEMENTS.filter((s) => s.t).length;
    const f = STATEMENTS.length - t;
    expect(Math.abs(t - f)).toBeLessThan(10);
    expect(new Set(STATEMENTS.map((s) => s.s)).size).toBe(STATEMENTS.length);
    for (const s of STATEMENTS) expect(CZ_TEXT.test(s.s), s.s).toBe(true);
  });
});

describe('rýmy a nálepky', () => {
  it('rýmové skupiny mají stejný konec a slova se neopakují', () => {
    const all = RHYME_GROUPS.flat().map((w) => w.w);
    expect(new Set(all).size).toBe(all.length);
    for (const g of RHYME_GROUPS) {
      expect(g.length).toBeGreaterThanOrEqual(2);
      const tail = [...g[0]!.w].slice(-2).join('');
      for (const w of g) expect([...w.w].slice(-2).join(''), w.w).toBe(tail);
    }
  });
  it('nálepky mají unikátní id i obrázky', () => {
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    expect(new Set(STICKERS.map((s) => s.e)).size).toBe(STICKERS.length);
    expect(STICKERS.length).toBeGreaterThanOrEqual(60);
  });
});
