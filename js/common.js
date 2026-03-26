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

/* ── Word quiz data ── */

const WORDS = [
  { word: 'pes', distractors: ['les', 'nos', 'ves'] },
  { word: 'kočka', distractors: ['bočka', 'tečka', 'hračka'] },
  { word: 'dům', distractors: ['lůj', 'sůl', 'stůl'] },
  { word: 'auto', distractors: ['okno', 'pero', 'rudo'] },
  { word: 'strom', distractors: ['blesk', 'proud', 'drozd'] },
  { word: 'míč', distractors: ['klíč', 'meč', 'plíč'] },
  { word: 'slunce', distractors: ['srdce', 'hřiště', 'moře'] },
  { word: 'máma', distractors: ['táta', 'žába', 'dáma'] },
  { word: 'táta', distractors: ['máma', 'bába', 'káva'] },
  { word: 'škola', distractors: ['včela', 'jízda', 'vlna'] },
  { word: 'kniha', distractors: ['ryba', 'liška', 'hlína'] },
  { word: 'voda', distractors: ['ruka', 'nuda', 'hora'] },
  { word: 'kolo', distractors: ['okno', 'molo', 'selo'] },
  { word: 'žába', distractors: ['ryba', 'tráva', 'kráva'] },
  { word: 'liška', distractors: ['myška', 'hruška', 'ryska'] },
  { word: 'jablko', distractors: ['mléko', 'máslo', 'peklo'] },
  { word: 'medvěd', distractors: ['oběd', 'soused', 'hřebík'] },
  { word: 'zajíc', distractors: ['chlapec', 'kolíček', 'prstýnek'] },
  { word: 'ryba', distractors: ['žába', 'koza', 'ryma'] },
  { word: 'vlak', distractors: ['pták', 'mrak', 'znak'] },
  { word: 'hora', distractors: ['nora', 'kůra', 'voda'] },
  { word: 'hvězda', distractors: ['cesta', 'vesta', 'pěna'] },
  { word: 'srdce', distractors: ['slunce', 'vejce', 'pekáč'] },
  { word: 'les', distractors: ['pes', 'ves', 'bez'] },
  { word: 'květina', distractors: ['hodina', 'polévka', 'peřina'] },
  { word: 'motýl', distractors: ['kobyl', 'bavlna', 'pýr'] },
  { word: 'tráva', distractors: ['kráva', 'sláva', 'brána'] },
  { word: 'mrak', distractors: ['drak', 'brak', 'vlak'] },
  { word: 'ptáček', distractors: ['háček', 'klíček', 'koláček'] },
  { word: 'sníh', distractors: ['smích', 'dech', 'pich'] },
];

/* ── Sentence quiz data ── */

const SENTENCES = [
  { sentence: 'Kočka pije ___.', answer: 'mléko', options: ['mléko', 'voda', 'chléb', 'káva'] },
  { sentence: 'Pes má čtyři ___.', answer: 'nohy', options: ['nohy', 'ruce', 'oči', 'uši'] },
  { sentence: 'Na nebi svítí ___.', answer: 'slunce', options: ['slunce', 'lampa', 'svíčka', 'oheň'] },
  { sentence: 'Ryba plave ve ___.', answer: 'vodě', options: ['vodě', 'trávě', 'písku', 'vzduchu'] },
  { sentence: 'V zimě padá ___.', answer: 'sníh', options: ['sníh', 'déšť', 'listí', 'písek'] },
  { sentence: 'Jablko roste na ___.', answer: 'stromě', options: ['stromě', 'zemi', 'střeše', 'poli'] },
  { sentence: 'Ptáček umí ___.', answer: 'létat', options: ['létat', 'plavat', 'kopat', 'psát'] },
  { sentence: 'Děti chodí do ___.', answer: 'školy', options: ['školy', 'lesa', 'nebe', 'řeky'] },
  { sentence: 'Máma čte ___.', answer: 'knihu', options: ['knihu', 'stůl', 'okno', 'trávu'] },
  { sentence: 'Táta jezdí ___.', answer: 'autem', options: ['autem', 'kolem', 'letadlem', 'lodí'] },
  { sentence: 'Žába skáče do ___.', answer: 'rybníka', options: ['rybníka', 'školy', 'postele', 'skříně'] },
  { sentence: 'Kráva žere ___.', answer: 'trávu', options: ['trávu', 'maso', 'rybu', 'sýr'] },
  { sentence: 'Na hlavě mám ___.', answer: 'čepici', options: ['čepici', 'botu', 'tašku', 'knihu'] },
  { sentence: 'V noci svítí ___.', answer: 'měsíc', options: ['měsíc', 'slunce', 'duha', 'mrak'] },
  { sentence: 'Medvěd spí v ___.', answer: 'jeskyni', options: ['jeskyni', 'škole', 'domě', 'autě'] },
  { sentence: 'Liška žije v ___.', answer: 'lese', options: ['lese', 'moři', 'městě', 'škole'] },
  { sentence: 'Květiny rostou na ___.', answer: 'louce', options: ['louce', 'střeše', 'stole', 'židli'] },
  { sentence: 'Vlak jezdí po ___.', answer: 'kolejích', options: ['kolejích', 'vodě', 'silnici', 'trávě'] },
  { sentence: 'Motýl má krásná ___.', answer: 'křídla', options: ['křídla', 'kola', 'nohy', 'rohy'] },
  { sentence: 'Babička peče ___.', answer: 'koláč', options: ['koláč', 'polévku', 'salát', 'zmrzlinu'] },
  { sentence: 'Drak chrlí ___.', answer: 'oheň', options: ['oheň', 'vodu', 'sníh', 'vítr'] },
  { sentence: 'Myška je ___.', answer: 'malá', options: ['malá', 'velká', 'modrá', 'rychlá'] },
  { sentence: 'Slon je velmi ___.', answer: 'velký', options: ['velký', 'malý', 'rychlý', 'tichý'] },
  { sentence: 'Zajíc má dlouhé ___.', answer: 'uši', options: ['uši', 'nohy', 'rohy', 'zuby'] },
];

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
