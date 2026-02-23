/* ══════════════════════════════════════════════
   Česká abeceda – sdílená logika
   ══════════════════════════════════════════════ */

const ALPHABET = [
  { letter: 'A',  lower: 'a',  word: 'Auto',     emoji: '🚗' },
  { letter: 'Á',  lower: 'á',  word: 'Áčko',     emoji: '🅰️' },
  { letter: 'B',  lower: 'b',  word: 'Balón',    emoji: '🎈' },
  { letter: 'C',  lower: 'c',  word: 'Citrón',   emoji: '🍋' },
  { letter: 'Č',  lower: 'č',  word: 'Čepice',   emoji: '🧢' },
  { letter: 'D',  lower: 'd',  word: 'Dům',      emoji: '🏠' },
  { letter: 'Ď',  lower: 'ď',  word: 'Ďábel',    emoji: '😈' },
  { letter: 'E',  lower: 'e',  word: 'Elf',      emoji: '🧝' },
  { letter: 'É',  lower: 'é',  word: 'Léto',     emoji: '☀️' },
  { letter: 'Ě',  lower: 'ě',  word: 'Měsíc',   emoji: '🌙' },
  { letter: 'F',  lower: 'f',  word: 'Fotbal',   emoji: '⚽' },
  { letter: 'G',  lower: 'g',  word: 'Gorila',   emoji: '🦍' },
  { letter: 'H',  lower: 'h',  word: 'Had',      emoji: '🐍' },
  { letter: 'Ch', lower: 'ch', word: 'Chobotnice',emoji: '🐙' },
  { letter: 'I',  lower: 'i',  word: 'Iglú',     emoji: '🏔️' },
  { letter: 'Í',  lower: 'í',  word: 'Míč',      emoji: '🏐' },
  { letter: 'J',  lower: 'j',  word: 'Jablko',   emoji: '🍎' },
  { letter: 'K',  lower: 'k',  word: 'Kočka',    emoji: '🐱' },
  { letter: 'L',  lower: 'l',  word: 'Liška',    emoji: '🦊' },
  { letter: 'M',  lower: 'm',  word: 'Medvěd',   emoji: '🐻' },
  { letter: 'N',  lower: 'n',  word: 'Nos',      emoji: '👃' },
  { letter: 'Ň',  lower: 'ň',  word: 'Koňík',   emoji: '🎠' },
  { letter: 'O',  lower: 'o',  word: 'Orel',     emoji: '🦅' },
  { letter: 'Ó',  lower: 'ó',  word: 'Citróny',  emoji: '🍋' },
  { letter: 'P',  lower: 'p',  word: 'Pes',      emoji: '🐶' },
  { letter: 'Q',  lower: 'q',  word: 'Kvíz',     emoji: '❓' },
  { letter: 'R',  lower: 'r',  word: 'Ryba',     emoji: '🐟' },
  { letter: 'Ř',  lower: 'ř',  word: 'Řeka',    emoji: '🏞️' },
  { letter: 'S',  lower: 's',  word: 'Slunce',   emoji: '☀️' },
  { letter: 'Š',  lower: 'š',  word: 'Škola',   emoji: '🏫' },
  { letter: 'T',  lower: 't',  word: 'Tygr',     emoji: '🐯' },
  { letter: 'Ť',  lower: 'ť',  word: 'Ťapka',   emoji: '🐾' },
  { letter: 'U',  lower: 'u',  word: 'Ulita',    emoji: '🐌' },
  { letter: 'Ú',  lower: 'ú',  word: 'Úl',      emoji: '🐝' },
  { letter: 'Ů',  lower: 'ů',  word: 'Růže',    emoji: '🌹' },
  { letter: 'V',  lower: 'v',  word: 'Vlak',     emoji: '🚂' },
  { letter: 'W',  lower: 'w',  word: 'Web',      emoji: '🌐' },
  { letter: 'X',  lower: 'x',  word: 'Xylofon',  emoji: '🎶' },
  { letter: 'Y',  lower: 'y',  word: 'Yak',      emoji: '🐃' },
  { letter: 'Ý',  lower: 'ý',  word: 'Sýr',     emoji: '🧀' },
  { letter: 'Z',  lower: 'z',  word: 'Zajíc',    emoji: '🐰' },
  { letter: 'Ž',  lower: 'ž',  word: 'Žába',    emoji: '🐸' },
];

/* Letters suitable for uppercase/lowercase quizzes (skip Ch – two-char digraph) */
const QUIZ_LETTERS = ALPHABET.filter(l => l.letter !== 'Ch');

/* ── Speech API ── */

function speak(text, rate = 0.9) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'cs-CZ';
  u.rate = rate;

  const voices = speechSynthesis.getVoices();
  const czVoice = voices.find(v => v.lang.startsWith('cs'));
  if (czVoice) u.voice = czVoice;

  speechSynthesis.speak(u);
}

function speakLetter(letterObj) {
  speak(letterObj.lower, 0.75);
}

/* Ensure voices are loaded (Chrome loads them async) */
if ('speechSynthesis' in window) {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

/* ── Star particles ── */

function createStarsContainer() {
  let c = document.querySelector('.stars-container');
  if (!c) {
    c = document.createElement('div');
    c.className = 'stars-container';
    document.body.appendChild(c);
  }
  return c;
}

function showStars(originX, originY, count = 20) {
  const container = createStarsContainer();
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '⭐';
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 180;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    star.style.left = originX + 'px';
    star.style.top = originY + 'px';
    star.style.setProperty('--dx', dx + 'px');
    star.style.setProperty('--dy', dy + 'px');
    star.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
    container.appendChild(star);
    star.addEventListener('animationend', () => star.remove());
  }
}

function showStarsFromElement(el, count = 20) {
  const rect = el.getBoundingClientRect();
  showStars(rect.left + rect.width / 2, rect.top + rect.height / 2, count);
}

/* ── Score / progress helpers ── */

const STORAGE_KEY = 'cestina_progress';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveModuleScore(module, correct, total, streak) {
  const p = loadProgress();
  if (!p[module]) p[module] = { correct: 0, total: 0, bestStreak: 0 };
  p[module].correct += correct;
  p[module].total += total;
  if (streak > p[module].bestStreak) p[module].bestStreak = streak;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function getModuleStars(module) {
  const p = loadProgress();
  const m = p[module];
  if (!m || m.total === 0) return 0;
  const pct = m.correct / m.total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}

/* ── Utility ── */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, count, exclude) {
  const pool = exclude ? arr.filter(x => x !== exclude) : [...arr];
  const shuffled = shuffle(pool);
  return shuffled.slice(0, count);
}
