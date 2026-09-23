/** Náhoda s volitelným semínkem (kvůli testům). */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const defaultRng: Rng = Math.random;

export function randInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

export function shuffle<T>(arr: readonly T[], rng: Rng = defaultRng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pick<T>(arr: readonly T[], rng: Rng = defaultRng): T {
  if (arr.length === 0) throw new Error('pick z prázdného pole');
  return arr[randInt(rng, arr.length)]!;
}

/** Vybere n různých prvků (nebo méně, pokud jich tolik není). */
export function sample<T>(arr: readonly T[], n: number, rng: Rng = defaultRng): T[] {
  return shuffle(arr, rng).slice(0, Math.max(0, n));
}

/**
 * Vážený výběr n různých prvků bez vracení.
 * `weight` musí být > 0; prvky s větší vahou přijdou na řadu častěji.
 */
export function weightedSample<T>(arr: readonly T[], n: number, weight: (x: T) => number, rng: Rng = defaultRng): T[] {
  const pool = arr.map((x) => ({ x, w: Math.max(1e-6, weight(x)) }));
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = rng() * total;
    let idx = 0;
    for (; idx < pool.length - 1; idx++) {
      r -= pool[idx]!.w;
      if (r <= 0) break;
    }
    out.push(pool[idx]!.x);
    pool.splice(idx, 1);
  }
  return out;
}

/**
 * Vybere `n` položek – když jich je v zásobě méně, začne znovu (bez dvou stejných za sebou).
 */
export function cycleSample<T>(arr: readonly T[], n: number, rng: Rng = defaultRng): T[] {
  if (arr.length === 0) return [];
  const out: T[] = [];
  while (out.length < n) {
    let round = shuffle(arr, rng);
    if (round.length > 1 && round[0] === out[out.length - 1]) round = [...round.slice(1), round[0]!];
    out.push(...round.slice(0, n - out.length));
  }
  return out;
}

/** Levenshteinova vzdálenost (pro hledání podobných slov). */
export function levenshtein(a: string, b: string): number {
  const A = [...a];
  const B = [...b];
  const dp = Array.from({ length: B.length + 1 }, (_, j) => j);
  for (let i = 1; i <= A.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= B.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (A[i - 1] === B[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[B.length]!;
}
