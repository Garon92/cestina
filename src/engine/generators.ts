/**
 * Generátory úloh – čisté funkce (vstup: kontext s náhodou, výstup: pole úloh). Testované ve Vitestu.
 */
import {
  ALPHABET,
  SINGLE_LETTERS,
  confusablesOf,
  findLetter,
  firstLetterKey,
  letterByKey,
  soundsAlike,
  splitLetters,
  type Letter,
} from '../data/alphabet';
import { RHYME_GROUPS, type RhymeWord } from '../data/rhymes';
import { SENTENCES, type Sentence } from '../data/sentences';
import { STATEMENTS, type Statement } from '../data/statements';
import { PICTURE_WORDS, SINGLE_WORDS, WORDS, sameGroup, type Word } from '../data/words';
import { letterWeight, type Progress } from '../lib/progress';
import { cycleSample, levenshtein, pick, sample, shuffle, weightedSample, type Rng } from '../lib/random';
import { hasSimpleSyllables, syllabifyWord } from '../lib/syllables';
import type { LetterCase } from '../lib/text';

export interface GenContext {
  rng: Rng;
  count: number;
  /** Povolená písmena (klíče abecedy). */
  letters: readonly string[];
  progress: Progress;
  now: number;
  letterCase: LetterCase;
  /** Konkrétní písmeno (např. z Abecedy → Obtahuj). */
  focus?: string;
  /** Zařízení nemá český hlas (Míchanice pak vynechá poslechová cvičení). */
  noVoice?: boolean;
}

// ─── pomocné ───

function allowedLetters(ctx: GenContext, pool: readonly Letter[] = SINGLE_LETTERS): Letter[] {
  const set = new Set(ctx.letters);
  const list = pool.filter((l) => set.has(l.key));
  return list.length >= 4 ? list : [...pool];
}

/**
 * Adaptivně vybere `n` písmen – častěji ta, která se dítě učí nebo v nich chybuje.
 * Výběr s vracením, ale nedávno použitá písmena mají malou váhu (pestrost) a nikdy nejdou dvakrát za sebou.
 */
export function pickLetters(ctx: GenContext, n: number, pool: readonly Letter[] = allowedLetters(ctx)): Letter[] {
  const out: Letter[] = [];
  if (ctx.focus) {
    const f = findLetter(ctx.focus);
    if (f && pool.some((l) => l.key === f.key)) out.push(f);
  }
  const window = Math.max(1, Math.min(pool.length - 1, Math.floor(pool.length * 0.6)));
  while (out.length < n) {
    const recent = out.slice(-window).map((l) => l.key);
    const last = out[out.length - 1]?.key;
    const [l] = weightedSample(
      pool,
      1,
      (x) => {
        if (pool.length > 1 && x.key === last) return 0;
        const w = letterWeight(ctx.progress.letters[x.key], ctx.now);
        return recent.includes(x.key) ? w * 0.12 : w;
      },
      ctx.rng,
    );
    if (!l) break;
    out.push(l);
  }
  return out.slice(0, n);
}

/** Slovo se skládá jen z písmen, která dítě zná (ch = jedno písmeno). */
export function wordFitsLetters(word: string, allowed: ReadonlySet<string>): boolean {
  return splitLetters(word.replace(/\s+/g, '')).every((ch) => allowed.has(ch.toLocaleUpperCase('cs-CZ')));
}

/** Kolik různých písmen slova dítě ještě nezná. */
export function unknownLetters(word: string, allowed: ReadonlySet<string>): number {
  const miss = new Set(splitLetters(word.replace(/\s+/g, '')).map((ch) => ch.toLocaleUpperCase('cs-CZ')).filter((k) => !allowed.has(k)));
  return miss.size;
}

/**
 * Omezí seznam slov na ta, která jdou přečíst povolenými písmeny. Když jich je málo, přibírá postupně
 * slova s 1, 2, … neznámými písmeny (ne rovnou všechna slova – CESTINA-05).
 */
export function filterByLetters<T extends { w: string }>(list: readonly T[], ctx: GenContext, min = 12): T[] {
  const set = new Set(ctx.letters);
  if (set.size >= ALPHABET.length) return [...list];
  const byUnknown = new Map<number, T[]>();
  for (const w of list) {
    const u = unknownLetters(w.w, set);
    byUnknown.set(u, [...(byUnknown.get(u) ?? []), w]);
  }
  const out: T[] = [];
  for (const u of [...byUnknown.keys()].sort((a, b) => a - b)) {
    if (out.length >= min) break;
    out.push(...byUnknown.get(u)!);
  }
  return out;
}

/** Distraktory k písmenu: zaměnitelná písmena + náhodná, bez stejně znějících (i/y). */
function letterDistractors(ctx: GenContext, target: Letter, n: number, lowerCase: boolean, pool: readonly Letter[]): Letter[] {
  const allowedPool = pool.filter((l) => l.key !== target.key && !soundsAlike(l.key, target.key));
  const conf = confusablesOf(target.key, lowerCase)
    .map((k) => allowedPool.find((l) => l.key === k))
    .filter((l): l is Letter => Boolean(l));
  const out: Letter[] = [];
  for (const l of shuffle(conf, ctx.rng)) {
    if (out.length >= Math.ceil(n / 2)) break;
    if (!out.some((o) => soundsAlike(o.key, l.key))) out.push(l);
  }
  const rest = shuffle(allowedPool.filter((l) => !out.includes(l)), ctx.rng);
  for (const l of rest) {
    if (out.length >= n) break;
    if (out.some((o) => soundsAlike(o.key, l.key))) continue;
    out.push(l);
  }
  return out.slice(0, n);
}

// ─── Písmenka ───

export interface PoznavaniTask {
  kind: 'poznavani';
  letter: string;
  /** true = ukazujeme velké, hledá se malé. */
  showUpper: boolean;
  options: string[];
}

export function genPoznavani(ctx: GenContext): PoznavaniTask[] {
  const pool = allowedLetters(ctx);
  return pickLetters(ctx, ctx.count, pool).map((l) => {
    const showUpper = ctx.rng() < 0.5;
    const d = letterDistractors(ctx, l, 3, showUpper, pool);
    return { kind: 'poznavani', letter: l.key, showUpper, options: shuffle([l.key, ...d.map((x) => x.key)], ctx.rng) };
  });
}

export interface PoslouchejTask {
  kind: 'poslouchej';
  letter: string;
  options: string[];
}

export function genPoslouchej(ctx: GenContext): PoslouchejTask[] {
  const pool = allowedLetters(ctx);
  return pickLetters(ctx, ctx.count, pool).map((l) => {
    const d = letterDistractors(ctx, l, 3, ctx.letterCase !== 'upper', pool);
    return { kind: 'poslouchej', letter: l.key, options: shuffle([l.key, ...d.map((x) => x.key)], ctx.rng) };
  });
}

export interface ParovaniTask {
  kind: 'parovani';
  left: string[];
  right: string[];
}

export function genParovani(ctx: GenContext, pairs = 5): ParovaniTask[] {
  const pool = allowedLetters(ctx);
  const tasks: ParovaniTask[] = [];
  for (let i = 0; i < ctx.count; i++) {
    // V jednom kole žádné dvojice, které vypadají v malém i velkém stejně zaměnitelně (i × y by šlo, jsou vidět).
    const picked = pickLetters({ ...ctx, focus: undefined }, pairs * 2, pool);
    const uniq: Letter[] = [];
    for (const l of picked) if (!uniq.some((u) => u.key === l.key)) uniq.push(l);
    for (const l of shuffle(pool, ctx.rng)) {
      if (uniq.length >= pairs) break;
      if (!uniq.some((u) => u.key === l.key)) uniq.push(l);
    }
    const keys = uniq.slice(0, pairs).map((l) => l.key);
    tasks.push({ kind: 'parovani', left: shuffle(keys, ctx.rng), right: shuffle(keys, ctx.rng) });
  }
  return tasks;
}

export interface HledejTask {
  kind: 'hledej';
  letter: string;
  cells: string[];
}

export function genHledej(ctx: GenContext, size = 12): HledejTask[] {
  const pool = allowedLetters(ctx);
  const lower = ctx.letterCase !== 'upper';
  return pickLetters(ctx, ctx.count, pool).map((l) => {
    const hits = 3 + Math.floor(ctx.rng() * 2); // 3–4 výskyty
    const conf = confusablesOf(l.key, lower).filter((k) => k !== l.key && SINGLE_LETTERS.some((x) => x.key === k));
    const others = pool.filter((x) => x.key !== l.key).map((x) => x.key);
    const fill: string[] = [];
    while (fill.length < size - hits) {
      const useConf = conf.length && ctx.rng() < 0.55;
      fill.push(useConf ? pick(conf, ctx.rng) : pick(others, ctx.rng));
    }
    return { kind: 'hledej', letter: l.key, cells: shuffle([...Array<string>(hits).fill(l.key), ...fill], ctx.rng) };
  });
}

export interface ZacinaTask {
  kind: 'zacina';
  word: string;
  emoji: string;
  letter: string;
  options: string[];
}

/**
 * Obrázky, které dítě může pojmenovat jinak (a jiným prvním písmenem): 🧥 bunda × kabát, 📱 telefon × mobil,
 * 🚂 vlak × mašinka, 🏰 hrad × zámek… V „Na co začíná?“ by to byla nefér úloha, proto je vynecháme.
 */
export const AMBIGUOUS_NAMES = new Set([
  'bunda', 'čepice', 'boty', 'telefon', 'počítač', 'plachetnice', 'vlak', 'náklaďák', 'kobliha', 'palačinka', 'hrozny',
  'kaštan', 'pusa', 'máma', 'táta', 'čaroděj', 'hrad', 'fontána', 'batoh', 'dopis', 'kalhoty', 'vrtulník', 'voda',
  'králík', 'rak', 'květina', 'tráva', 'vlna', 'princ', 'zeměkoule', 'kuře', 'list', 'talíř', 'kbelík', 'holka',
  // z QA (CESTINA-09): ⚽ balón, 🚕 auto, 🚑 záchranka, 🌭 hotdog, 🥧 dort, 🏝️ palma, 👜 taška, 🗑️ popelnice…
  'míč', 'taxík', 'sanitka', 'párek', 'koláč', 'ostrov', 'kabelka', 'koš', 'palma', 'maso', 'medvídek', 'budík',
  'sopka', 'déšť', 'klaun',
]);

export function genZacina(ctx: GenContext): ZacinaTask[] {
  const allowed = new Set(ctx.letters);
  const base = PICTURE_WORDS.filter((w) => !/\s/.test(w.w) && !AMBIGUOUS_NAMES.has(w.w));
  let words = base.filter((w) => allowed.has(firstLetterKey(w.w)));
  if (words.length < 8) words = base;
  const pool = ALPHABET.filter((l) => allowed.has(l.key));
  const optPool = pool.length >= 6 ? pool : [...ALPHABET];
  // Nejdřív slova na písmena, která se dítě učí – vážený výběr podle prvního písmene.
  const chosen = weightedSample(words, Math.min(words.length, ctx.count), (w) => letterWeight(ctx.progress.letters[firstLetterKey(w.w)], ctx.now), ctx.rng);
  const list = chosen.length >= ctx.count ? chosen : cycleSample(words, ctx.count, ctx.rng);
  return list.map((w) => {
    const key = firstLetterKey(w.w);
    const target = letterByKey(key);
    const base = target.base ?? target.key;
    const cands = shuffle(
      optPool.filter((l) => l.key !== key && !soundsAlike(l.key, key) && (l.base ?? l.key) !== base && !['Q', 'W', 'X'].includes(l.key)),
      ctx.rng,
    );
    const opts: string[] = [];
    for (const l of cands) {
      if (opts.length >= 3) break;
      if (opts.some((o) => soundsAlike(o, l.key))) continue;
      opts.push(l.key);
    }
    return { kind: 'zacina', word: w.w, emoji: w.e, letter: key, options: shuffle([key, ...opts], ctx.rng) };
  });
}

export interface ObtahujTask {
  kind: 'obtahuj';
  letter: string;
  /** Konkrétní znak k obtažení (velký nebo malý podle nastavení). */
  char: string;
}

export function genObtahuj(ctx: GenContext): ObtahujTask[] {
  const pool = allowedLetters(ctx);
  const upper = ctx.letterCase === 'upper';
  return pickLetters(ctx, ctx.count, pool).map((l) => ({ kind: 'obtahuj', letter: l.key, char: upper ? l.upper : l.lower }));
}

// ─── Slabiky ───

const SYL_CONSONANTS = ['M', 'L', 'P', 'S', 'T', 'V', 'N', 'D', 'K', 'J', 'B', 'R', 'Z', 'H', 'C', 'Č', 'Š', 'Ž', 'Ř'];
const SYL_VOWELS = ['A', 'E', 'I', 'O', 'U'];

/** Otevřené slabiky (souhláska + samohláska) z povolených písmen. */
export function syllablePool(ctx: GenContext): string[] {
  const set = new Set(ctx.letters);
  let cons = SYL_CONSONANTS.filter((c) => set.has(c));
  let vows = SYL_VOWELS.filter((v) => set.has(v));
  if (cons.length < 2) cons = SYL_CONSONANTS.slice(0, 8);
  if (vows.length < 2) vows = SYL_VOWELS;
  const out: string[] = [];
  for (const c of cons) for (const v of vows) out.push((c + v).toLocaleLowerCase('cs-CZ'));
  return out;
}

export interface SlabikyTask {
  kind: 'slabiky';
  syl: string;
  options: string[];
}

export function genSlabiky(ctx: GenContext): SlabikyTask[] {
  const pool = syllablePool(ctx);
  return cycleSample(pool, ctx.count, ctx.rng).map((syl) => {
    const c = syl.slice(0, syl.length - 1);
    const v = syl.slice(-1);
    const sameCons = shuffle(pool.filter((s) => s !== syl && s.startsWith(c)), ctx.rng).slice(0, 2);
    const sameVowel = shuffle(pool.filter((s) => s !== syl && s.endsWith(v) && !sameCons.includes(s)), ctx.rng).slice(0, 1);
    const opts = [...sameCons, ...sameVowel];
    for (const s of shuffle(pool, ctx.rng)) {
      if (opts.length >= 3) break;
      if (s !== syl && !opts.includes(s)) opts.push(s);
    }
    return { kind: 'slabiky', syl, options: shuffle([syl, ...opts.slice(0, 3)], ctx.rng) };
  });
}

/** Počet zavřených slabik (končí souhláskou) – čím víc, tím těžší čtení po slabikách. */
export function closedSyllables(word: string): number {
  return syllabifyWord(word).filter((s) => !/[aáeéěiíoóuúůyý]$/i.test(s)).length;
}

/**
 * Slova vhodná pro čtení po slabikách (2–3 slabiky, jednoduché, s obrázkem).
 * Pro začátečníky jen slova s nejvýš jednou zavřenou slabikou (MÁ-MA, KO-ČKA ne, SA-LÁT ano, TRAK-TOR ne).
 */
export function syllableWords(maxSyl = 3, maxClosed = 1): Word[] {
  return PICTURE_WORDS.filter((w) => {
    if (!hasSimpleSyllables(w.w)) return false;
    const n = syllabifyWord(w.w).length;
    return n >= 2 && n <= maxSyl && w.len <= 7 && closedSyllables(w.w) <= maxClosed;
  });
}

export interface CtiSlabikyTask {
  kind: 'cti-slabiky';
  word: string;
  syllables: string[];
  options: { w: string; e: string }[];
}

export function genCtiSlabiky(ctx: GenContext): CtiSlabikyTask[] {
  const base = filterByLetters(syllableWords(3), ctx, 10);
  // Nejdřív krátká dvouslabičná slova, pak delší.
  const short = base.filter((w) => syllabifyWord(w.w).length === 2 && w.len <= 5);
  const pool = short.length >= ctx.count ? short : base;
  return cycleSample(pool, ctx.count, ctx.rng).map((w) => ({
    kind: 'cti-slabiky',
    word: w.w,
    syllables: syllabifyWord(w.w),
    options: shuffle([w, ...pictureDistractors(ctx, w, 2, base)], ctx.rng).map(({ w: ww, e }) => ({ w: ww, e })),
  }));
}

export interface SkladejSlabikyTask {
  kind: 'skladej-slabiky';
  word: string;
  emoji: string;
  syllables: string[];
  tiles: string[];
}

export function genSkladejSlabiky(ctx: GenContext): SkladejSlabikyTask[] {
  const pool = filterByLetters(syllableWords(3), ctx, 10);
  const allSyl = [...new Set(pool.flatMap((w) => syllabifyWord(w.w)))];
  return cycleSample(pool, ctx.count, ctx.rng).map((w) => {
    const syl = syllabifyWord(w.w);
    const extra = shuffle(allSyl.filter((s) => !syl.includes(s)), ctx.rng).slice(0, syl.length >= 3 ? 1 : 2);
    return { kind: 'skladej-slabiky', word: w.w, emoji: w.e, syllables: syl, tiles: shuffle([...syl, ...extra], ctx.rng) };
  });
}

// ─── Slova ───

/** Obrázkové distraktory: jiné obrázky, přednostně slova se stejným začátkem nebo délkou (nutí číst celé). */
export function pictureDistractors(ctx: GenContext, target: Word, n: number, pool: readonly Word[] = PICTURE_WORDS): Word[] {
  const others = pool.filter((w) => w.w !== target.w && w.e !== target.e && !sameGroup(w.w, target.w));
  const first = firstLetterKey(target.w);
  const similar = others.filter((w) => firstLetterKey(w.w) === first || Math.abs(w.len - target.len) <= 1);
  const out = sample(similar, Math.min(similar.length, Math.ceil(n / 2)), ctx.rng);
  for (const w of shuffle(others, ctx.rng)) {
    if (out.length >= n) break;
    if (!out.includes(w)) out.push(w);
  }
  return out.slice(0, n);
}

export interface CtiSlovaTask {
  kind: 'cti-slova';
  word: string;
  options: { w: string; e: string }[];
}

export function genCtiSlova(ctx: GenContext): CtiSlovaTask[] {
  const pool = filterByLetters(
    PICTURE_WORDS.filter((w) => !/\s/.test(w.w)),
    ctx,
  );
  return cycleSample(pool, ctx.count, ctx.rng).map((w) => ({
    kind: 'cti-slova',
    word: w.w,
    options: shuffle([w, ...pictureDistractors(ctx, w, 3, pool)], ctx.rng).map(({ w: ww, e }) => ({ w: ww, e })),
  }));
}

/** Podobná (reálná) slova pro kvíz se slovy – malá Levenshteinova vzdálenost, podobná délka. */
export function similarWords(target: string, n: number, rng: Rng, pool: readonly Word[] = SINGLE_WORDS): string[] {
  const t = target.toLocaleLowerCase('cs-CZ');
  const scored = pool
    .filter((w) => w.w !== t)
    .map((w) => {
      const d = levenshtein(t, w.w);
      const lenDiff = Math.abs([...w.w].length - [...t].length);
      const sameStart = w.w[0] === t[0] ? -0.6 : 0;
      const sameEnd = w.w.slice(-2) === t.slice(-2) ? -0.5 : 0;
      return { w: w.w, s: d + lenDiff * 0.8 + sameStart + sameEnd + rng() * 0.9 };
    })
    .sort((a, b) => a.s - b.s);
  return scored.slice(0, n).map((x) => x.w);
}

export interface SlovaTask {
  kind: 'slova';
  word: string;
  /** false = ukazuje se VELKY, hledá se malými; true = obráceně. */
  reverse: boolean;
  options: string[];
}

export function genSlova(ctx: GenContext): SlovaTask[] {
  const pool = filterByLetters(SINGLE_WORDS, ctx);
  return cycleSample(pool, ctx.count, ctx.rng).map((w) => ({
    kind: 'slova',
    word: w.w,
    reverse: ctx.rng() < 0.3,
    options: shuffle([w.w, ...similarWords(w.w, 3, ctx.rng, pool)], ctx.rng),
  }));
}

export interface SkladaniTask {
  kind: 'skladani';
  word: string;
  emoji: string;
  letters: string[];
  pool: string[];
}

export function genSkladani(ctx: GenContext): SkladaniTask[] {
  const base = filterByLetters(
    SINGLE_WORDS.filter((w) => w.len >= 3 && w.len <= 7),
    ctx,
  );
  // Přednost mají slova s obrázkem.
  const withPic = base.filter((w) => w.e);
  const pool = withPic.length >= ctx.count * 2 ? [...withPic, ...base.filter((w) => !w.e).slice(0, withPic.length / 3)] : base;
  return cycleSample(pool, ctx.count, ctx.rng).map((w) => {
    const letters = splitLetters(w.w);
    return { kind: 'skladani', word: w.w, emoji: w.e, letters, pool: shuffle(letters, ctx.rng) };
  });
}

const VOICED = new Set(['b', 'd', 'ď', 'g', 'v', 'z', 'ž', 'h']);
const VOICELESS = new Set(['p', 't', 'ť', 'k', 'f', 's', 'š', 'ch', 'c', 'č']);
const VOWELS = new Set([...'aáeéěiíoóuúůyý']);
/** Po měkkých souhláskách se píše vždy i/í – to dítě zvládne bez pravidel. */
const MEKKE = new Set(['ž', 'š', 'č', 'ř', 'c', 'j', 'ď', 'ť', 'ň']);

/**
 * Slovo se píše, jak se vyslovuje (vhodné na diktát pro začátečníky):
 * bez y/ý, bez i/í po obojetných souhláskách a po d/t/n, bez ě, bez ú/ů,
 * bez spodoby znělosti (had → [hat], vlajka apod.) a bez víceslovných spojení.
 */
export function isPhoneticWord(word: string): boolean {
  const w = word.toLocaleLowerCase('cs-CZ');
  if (/\s/.test(w) || /[yýěúůqwx]/.test(w)) return false;
  const L = splitLetters(w);
  for (let i = 0; i < L.length; i++) {
    const c = L[i]!;
    const prev = L[i - 1];
    // i/í jen po měkké souhlásce nebo samohlásce (po tvrdých/obojetných by se dítě muselo rozhodovat i × y).
    if ((c === 'i' || c === 'í') && prev && !MEKKE.has(prev) && !VOWELS.has(prev)) return false;
    const next = L[i + 1];
    if (next && ((VOICED.has(c) && VOICELESS.has(next)) || (VOICELESS.has(c) && VOICED.has(next) && next !== 'v'))) return false;
    // n před b/p zní jako m (bonbón → [bombón]).
    if (c === 'n' && (next === 'b' || next === 'p')) return false;
  }
  const last = L[L.length - 1]!;
  if (VOICED.has(last)) return false;
  return true;
}

export interface DiktatTask {
  kind: 'diktat';
  word: string;
  emoji: string;
}

export function diktatWords(): Word[] {
  return SINGLE_WORDS.filter((w) => w.len >= 2 && w.len <= 7 && isPhoneticWord(w.w));
}

export function genDiktat(ctx: GenContext): DiktatTask[] {
  const all = filterByLetters(diktatWords(), ctx, 10);
  // Začínáme kratšími slovy, s obrázkem.
  const sorted = shuffle(all, ctx.rng).sort((a, b) => (a.e ? 0 : 1) - (b.e ? 0 : 1) || a.len - b.len);
  const easy = sorted.filter((w) => w.len <= 5);
  const pool = easy.length >= ctx.count * 2 ? easy : sorted;
  return cycleSample(pool, ctx.count, ctx.rng)
    .sort((a, b) => a.len - b.len)
    .map((w) => ({ kind: 'diktat', word: w.w, emoji: w.e }));
}

/** Poslední dvě písmena – hrubý „konec“ slova pro vyloučení skoro-rýmů. */
export function rhymeTail(w: string): string {
  return [...w].slice(-2).join('');
}

export interface RymyTask {
  kind: 'rymy';
  target: RhymeWord;
  answer: RhymeWord;
  options: RhymeWord[];
}

export function genRymy(ctx: GenContext): RymyTask[] {
  const groups = cycleSample(RHYME_GROUPS, ctx.count, ctx.rng);
  return groups.map((g) => {
    const [target, answer] = sample(g, 2, ctx.rng) as [RhymeWord, RhymeWord];
    // Špatné možnosti nesmí znít podobně na konci (hruška × liška končí obě na -ška).
    const end = rhymeTail(target.w);
    const otherGroups = shuffle(
      RHYME_GROUPS.filter((x) => x !== g && x.every((w) => rhymeTail(w.w) !== end)),
      ctx.rng,
    ).slice(0, 2);
    const wrong = otherGroups.map((og) => pick(og, ctx.rng));
    return { kind: 'rymy', target, answer, options: shuffle([answer, ...wrong], ctx.rng) };
  });
}

// ─── Věty ───

export interface VetyTask {
  kind: 'vety';
  sentence: Sentence;
  options: string[];
}

export function genVety(ctx: GenContext): VetyTask[] {
  return cycleSample(SENTENCES, ctx.count, ctx.rng).map((s) => ({
    kind: 'vety',
    sentence: s,
    options: shuffle([s.a, ...s.o.slice(0, 3)], ctx.rng),
  }));
}

export interface PravdaTask {
  kind: 'pravda';
  statement: Statement;
}

export function genPravda(ctx: GenContext): PravdaTask[] {
  const t = shuffle(
    STATEMENTS.filter((s) => s.t),
    ctx.rng,
  );
  const f = shuffle(
    STATEMENTS.filter((s) => !s.t),
    ctx.rng,
  );
  // Zhruba půl na půl pravdivé a nepravdivé, náhodně které převáží.
  const nTrue = ctx.count % 2 === 0 ? ctx.count / 2 : ctx.rng() < 0.5 ? Math.ceil(ctx.count / 2) : Math.floor(ctx.count / 2);
  const out = shuffle([...t.slice(0, nTrue), ...f.slice(0, ctx.count - nTrue)], ctx.rng);
  return out.map((statement) => ({ kind: 'pravda', statement }));
}

export type AnyTask =
  | PoznavaniTask
  | PoslouchejTask
  | ParovaniTask
  | HledejTask
  | ZacinaTask
  | ObtahujTask
  | SlabikyTask
  | CtiSlabikyTask
  | SkladejSlabikyTask
  | CtiSlovaTask
  | SlovaTask
  | SkladaniTask
  | DiktatTask
  | RymyTask
  | VetyTask
  | PravdaTask;

/** Všechna slova v bance (pro testy a statistiku). */
export const ALL_WORDS = WORDS;
