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
  const u = new SpeechSynthesisUtterance(text.toLowerCase());
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
  // Krátká (3 písmena)
  { word: 'pes', distractors: ['les', 'nos', 'ves'] },
  { word: 'les', distractors: ['pes', 'ves', 'bez'] },
  { word: 'nos', distractors: ['pes', 'los', 'kos'] },
  { word: 'dům', distractors: ['lůj', 'sůl', 'stůl'] },
  { word: 'had', distractors: ['sad', 'lad', 'pad'] },
  { word: 'med', distractors: ['led', 'pes', 'les'] },
  { word: 'led', distractors: ['med', 'let', 'lev'] },
  { word: 'lev', distractors: ['led', 'let', 'les'] },
  { word: 'sob', distractors: ['bob', 'lob', 'rod'] },
  { word: 'sůl', distractors: ['dům', 'lůj', 'vůl'] },
  { word: 'míč', distractors: ['klíč', 'meč', 'keř'] },
  { word: 'rak', distractors: ['mak', 'pak', 'lak'] },
  { word: 'mák', distractors: ['rák', 'pás', 'lák'] },
  { word: 'sýr', distractors: ['pýr', 'výr', 'mír'] },
  // Krátká (4 písmena)
  { word: 'auto', distractors: ['okno', 'pero', 'rudo'] },
  { word: 'kolo', distractors: ['okno', 'molo', 'selo'] },
  { word: 'voda', distractors: ['ruka', 'nuda', 'hora'] },
  { word: 'hora', distractors: ['nora', 'kůra', 'voda'] },
  { word: 'ryba', distractors: ['žába', 'koza', 'ryma'] },
  { word: 'žába', distractors: ['ryba', 'tráva', 'kráva'] },
  { word: 'sova', distractors: ['koza', 'voda', 'hora'] },
  { word: 'koza', distractors: ['sova', 'hora', 'kosa'] },
  { word: 'mrak', distractors: ['drak', 'brak', 'vlak'] },
  { word: 'drak', distractors: ['mrak', 'brak', 'vlak'] },
  { word: 'vlak', distractors: ['pták', 'mrak', 'znak'] },
  { word: 'pták', distractors: ['vlak', 'mrak', 'znak'] },
  { word: 'sníh', distractors: ['smích', 'dech', 'hřích'] },
  { word: 'klíč', distractors: ['míč', 'meč', 'plíč'] },
  { word: 'dort', distractors: ['sport', 'port', 'kort'] },
  { word: 'myš', distractors: ['pyž', 'tuš', 'kuš'] },
  { word: 'orel', distractors: ['včel', 'osel', 'uzel'] },
  { word: 'osel', distractors: ['orel', 'uzel', 'pytel'] },
  { word: 'tygr', distractors: ['bobr', 'vichr', 'metr'] },
  { word: 'bobr', distractors: ['tygr', 'kopr', 'vichr'] },
  { word: 'hrad', distractors: ['brad', 'mrad', 'drak'] },
  { word: 'most', distractors: ['kost', 'post', 'host'] },
  { word: 'kost', distractors: ['most', 'post', 'host'] },
  // Střední (5 písmen)
  { word: 'máma', distractors: ['táta', 'žába', 'dáma'] },
  { word: 'táta', distractors: ['máma', 'bába', 'káva'] },
  { word: 'kočka', distractors: ['bočka', 'tečka', 'hračka'] },
  { word: 'liška', distractors: ['myška', 'hruška', 'ryska'] },
  { word: 'myška', distractors: ['liška', 'hruška', 'miska'] },
  { word: 'škola', distractors: ['včela', 'jízda', 'vlna'] },
  { word: 'kniha', distractors: ['ryba', 'liška', 'hlína'] },
  { word: 'tráva', distractors: ['kráva', 'sláva', 'brána'] },
  { word: 'kráva', distractors: ['tráva', 'sláva', 'brána'] },
  { word: 'strom', distractors: ['blesk', 'proud', 'drozd'] },
  { word: 'vítr', distractors: ['litr', 'mistr', 'filtr'] },
  { word: 'hruška', distractors: ['liška', 'myška', 'muška'] },
  { word: 'jelen', distractors: ['prsten', 'buben', 'ječmen'] },
  { word: 'komín', distractors: ['králík', 'tulipán', 'polštář'] },
  { word: 'lampa', distractors: ['pumpa', 'rampa', 'mamka'] },
  { word: 'lopata', distractors: ['hodina', 'polévka', 'peřina'] },
  { word: 'zámek', distractors: ['párek', 'mazec', 'háček'] },
  { word: 'hřeben', distractors: ['prsten', 'buben', 'ječmen'] },
  { word: 'polštář', distractors: ['kuchař', 'lékař', 'školák'] },
  { word: 'koláč', distractors: ['klobás', 'salám', 'guláš'] },
  { word: 'párek', distractors: ['háček', 'zámek', 'klíček'] },
  { word: 'slepice', distractors: ['polévka', 'peřina', 'čepice'] },
  // Střední a delší (6+ písmen)
  { word: 'slunce', distractors: ['srdce', 'hřiště', 'moře'] },
  { word: 'srdce', distractors: ['slunce', 'vejce', 'moře'] },
  { word: 'hvězda', distractors: ['cesta', 'vesta', 'pěna'] },
  { word: 'jablko', distractors: ['mléko', 'máslo', 'peklo'] },
  { word: 'medvěd', distractors: ['oběd', 'soused', 'hřebík'] },
  { word: 'zajíc', distractors: ['chlapec', 'kolíček', 'prstýnek'] },
  { word: 'květina', distractors: ['hodina', 'polévka', 'peřina'] },
  { word: 'motýl', distractors: ['kobyl', 'pýr', 'bubínek'] },
  { word: 'ptáček', distractors: ['háček', 'klíček', 'koláček'] },
  { word: 'králík', distractors: ['sešit', 'mazlík', 'tulipán'] },
  { word: 'pavouk', distractors: ['mazlík', 'oblouk', 'barák'] },
  { word: 'jahoda', distractors: ['hodina', 'pohoda', 'nehoda'] },
  { word: 'banán', distractors: ['sultán', 'tulipán', 'kaplan'] },
  { word: 'brambora', distractors: ['čokoláda', 'limonáda', 'marmeláda'] },
  { word: 'čokoláda', distractors: ['limonáda', 'marmeláda', 'brambora'] },
  { word: 'zmrzlina', distractors: ['čokoláda', 'limonáda', 'peřina'] },
  { word: 'ponožka', distractors: ['čepička', 'ručička', 'cestička'] },
  { word: 'batoh', distractors: ['balón', 'baron', 'bazén'] },
  { word: 'letadlo', distractors: ['divadlo', 'zrcadlo', 'jeviště'] },
  { word: 'divadlo', distractors: ['letadlo', 'zrcadlo', 'jeviště'] },
  { word: 'počítač', distractors: ['vodítko', 'kolečko', 'ležátko'] },
  { word: 'dinosaurus', distractors: ['autobus', 'kaktus', 'kompas'] },
  { word: 'tramvaj', distractors: ['kolotoč', 'houpačka', 'prolézačka'] },
  { word: 'kolotoč', distractors: ['tramvaj', 'houpačka', 'prolézačka'] },
  { word: 'houpačka', distractors: ['prolézačka', 'kolotoč', 'tramvaj'] },
  { word: 'žirafa', distractors: ['opice', 'papírna', 'zahrada'] },
  { word: 'velryba', distractors: ['želvička', 'veverka', 'polévka'] },
  { word: 'veverka', distractors: ['velryba', 'peřina', 'čepička'] },
  { word: 'sluníčko', distractors: ['kolečko', 'srdíčko', 'vajíčko'] },
  { word: 'srdíčko', distractors: ['sluníčko', 'kolečko', 'vajíčko'] },
  { word: 'perníček', distractors: ['klíček', 'koláček', 'ptáček'] },
  { word: 'třešně', distractors: ['višně', 'broskve', 'meruňky'] },
  { word: 'ježek', distractors: ['řízek', 'mazek', 'párek'] },
  { word: 'tunel', distractors: ['hotel', 'kotel', 'pytel'] },
  { word: 'robot', distractors: ['pokot', 'sopot', 'kokot'] },
  { word: 'raketa', distractors: ['paleta', 'planeta', 'gazeta'] },
  { word: 'planeta', distractors: ['raketa', 'paleta', 'gazeta'] },
  // Zvířata navíc
  { word: 'ovce', distractors: ['konce', 'slunce', 'srdce'] },
  { word: 'kozel', distractors: ['osel', 'pytel', 'kotel'] },
  { word: 'moucha', distractors: ['mucha', 'loucha', 'soucha'] },
  { word: 'komár', distractors: ['polár', 'sultán', 'bazén'] },
  { word: 'brouk', distractors: ['slouch', 'trouba', 'kroupa'] },
  { word: 'mravenec', distractors: ['chlapec', 'panenec', 'hrnec'] },
  { word: 'beruška', distractors: ['hruška', 'muška', 'paruška'] },
  { word: 'lachtan', distractors: ['kapitán', 'sultán', 'kaplan'] },
  { word: 'plameňák', distractors: ['tulipán', 'pelíšek', 'polštář'] },
  { word: 'kachna', distractors: ['buchta', 'snídaně', 'pastva'] },
  { word: 'holub', distractors: ['želud', 'bazén', 'budík'] },
  { word: 'vrabec', distractors: ['chlapec', 'hrnec', 'kolíček'] },
  { word: 'labuť', distractors: ['radost', 'pomoc', 'sladkost'] },
  { word: 'datel', distractors: ['hotel', 'kotel', 'pytel'] },
  { word: 'hroch', distractors: ['prach', 'strach', 'povrch'] },
  // Jídlo navíc
  { word: 'rohlík', distractors: ['králík', 'mazlík', 'klíček'] },
  { word: 'knedlík', distractors: ['králík', 'mazlík', 'klíček'] },
  { word: 'řízek', distractors: ['ježek', 'mazek', 'párek'] },
  { word: 'hranolky', distractors: ['hodinky', 'brusle', 'ponožky'] },
  { word: 'palačinka', distractors: ['čokoláda', 'limonáda', 'marmeláda'] },
  { word: 'špenát', distractors: ['salát', 'granát', 'pirát'] },
  { word: 'guláš', distractors: ['koláš', 'badláš', 'muláš'] },
  { word: 'limonáda', distractors: ['čokoláda', 'marmeláda', 'brambora'] },
  { word: 'marmeláda', distractors: ['limonáda', 'čokoláda', 'brambora'] },
  { word: 'šlehačka', distractors: ['houpačka', 'prolézačka', 'klouzačka'] },
  // Domácnost navíc
  { word: 'peřina', distractors: ['polévka', 'hodina', 'květina'] },
  { word: 'koberec', distractors: ['chlapec', 'hrnec', 'kolíček'] },
  { word: 'sporák', distractors: ['školák', 'voják', 'řezák'] },
  { word: 'vysavač', distractors: ['počítač', 'kolotoč', 'houpačka'] },
  { word: 'žehlička', distractors: ['houpačka', 'čepička', 'cestička'] },
  { word: 'zrcadlo', distractors: ['letadlo', 'divadlo', 'jeviště'] },
  { word: 'budík', distractors: ['dravík', 'mazlík', 'klíček'] },
  { word: 'zásuvka', distractors: ['čepička', 'cestička', 'zástěrka'] },
  // Příroda navíc
  { word: 'potok', distractors: ['strop', 'porost', 'podvod'] },
  { word: 'jezero', distractors: ['pero', 'metro', 'retro'] },
  { word: 'kopec', distractors: ['chlapec', 'hrnec', 'kolíček'] },
  { word: 'jeskyně', distractors: ['studánka', 'zahrádka', 'chaloupka'] },
  { word: 'vodopád', distractors: ['západ', 'hrad', 'výpad'] },
  { word: 'oceán', distractors: ['vulkán', 'sultán', 'kaplan'] },
  { word: 'sopka', distractors: ['polka', 'rolka', 'folka'] },
  // Oblečení
  { word: 'svetr', distractors: ['metr', 'vichr', 'bobr'] },
  { word: 'rukavice', distractors: ['slepice', 'čepice', 'lavice'] },
  { word: 'šála', distractors: ['žába', 'kráva', 'sláva'] },
  { word: 'kalhoty', distractors: ['hranolky', 'hodinky', 'ponožky'] },
  { word: 'mikina', distractors: ['hodina', 'malina', 'květina'] },
  { word: 'bunda', distractors: ['hunda', 'tunda', 'runda'] },
  // Doprava a technika navíc
  { word: 'motorka', distractors: ['čepička', 'cestička', 'zástěrka'] },
  { word: 'helikoptéra', distractors: ['limonáda', 'čokoláda', 'marmeláda'] },
  { word: 'koloběžka', distractors: ['houpačka', 'prolézačka', 'klouzačka'] },
  { word: 'buldozer', distractors: ['počítač', 'vysavač', 'kolotoč'] },
  // Hřiště a hry
  { word: 'klouzačka', distractors: ['houpačka', 'prolézačka', 'koloběžka'] },
  { word: 'pískoviště', distractors: ['kolečko', 'ležátko', 'vodítko'] },
  { word: 'prolézačka', distractors: ['houpačka', 'klouzačka', 'koloběžka'] },
  // Věci
  { word: 'dalekohled', distractors: ['fotoaparát', 'počítač', 'vysavač'] },
  { word: 'fotoaparát', distractors: ['dalekohled', 'počítač', 'vysavač'] },
  { word: 'hodiny', distractors: ['noviny', 'brusle', 'nůžky'] },
  { word: 'nůžky', distractors: ['brusle', 'hodinky', 'klíče'] },
  { word: 'brusle', distractors: ['nůžky', 'hodinky', 'ponožky'] },
  { word: 'pastelka', distractors: ['čepička', 'cestička', 'zástěrka'] },
  { word: 'penál', distractors: ['kanál', 'sandál', 'pedál'] },
  // Zvířata extra
  { word: 'krtek', distractors: ['prsten', 'chrtek', 'kornet'] },
  { word: 'kobyla', distractors: ['babička', 'hodinka', 'lavička'] },
  { word: 'sysel', distractors: ['kosel', 'vršek', 'burel'] },
  { word: 'tchoř', distractors: ['kohouř', 'lišáj', 'motýl'] },
  { word: 'losos', distractors: ['kokos', 'kolos', 'logos'] },
  { word: 'sumec', distractors: ['hrnec', 'konec', 'tanec'] },
  { word: 'čáp', distractors: ['háj', 'rák', 'dáj'] },
  { word: 'vrána', distractors: ['brána', 'sláva', 'tráva'] },
  { word: 'havran', distractors: ['bažant', 'kaplan', 'sultán'] },
  { word: 'bažant', distractors: ['havran', 'kaplan', 'sultán'] },
  { word: 'koroptev', distractors: ['konopné', 'kolotoč', 'koberec'] },
  { word: 'špaček', distractors: ['klíček', 'háček', 'koláček'] },
  { word: 'vlaštovka', distractors: ['čokoláda', 'limonáda', 'marmeláda'] },
  { word: 'žralok', distractors: ['hlemýžď', 'plameňák', 'pelikán'] },
  { word: 'velbloud', distractors: ['nosorožec', 'krokodýl', 'hroznýš'] },
  { word: 'hroznýš', distractors: ['velbloud', 'krokodýl', 'nosorožec'] },
  { word: 'mořský koník', distractors: ['mořská hvězdice', 'mořský ježek', 'mořská želva'] },
  // Jídlo extra
  { word: 'zelí', distractors: ['želé', 'medu', 'mléka'] },
  { word: 'salát', distractors: ['granát', 'pirát', 'špenát'] },
  { word: 'těstoviny', distractors: ['mandarinky', 'brusinky', 'borůvky'] },
  { word: 'buchta', distractors: ['kapsa', 'koule', 'deska'] },
  { word: 'chléb', distractors: ['strop', 'smích', 'blesk'] },
  { word: 'jogurt', distractors: ['kefír', 'pudink', 'tvaroh'] },
  { word: 'pudink', distractors: ['jogurt', 'kefír', 'tvaroh'] },
  { word: 'tvaroh', distractors: ['jogurt', 'pudink', 'kefír'] },
  { word: 'meloun', distractors: ['balón', 'citron', 'galon'] },
  { word: 'okurka', distractors: ['papruka', 'paprika', 'cibulka'] },
  { word: 'paprika', distractors: ['okurka', 'cibulka', 'petrželka'] },
  { word: 'cibule', distractors: ['jehle', 'kolíbka', 'čepice'] },
  { word: 'hruška', distractors: ['muška', 'liška', 'myška'] },
  { word: 'malina', distractors: ['hodina', 'lavina', 'krajina'] },
  { word: 'borůvka', distractors: ['koňovka', 'žárovka', 'oharovka'] },
  { word: 'višeň', distractors: ['břízen', 'jasen', 'kašen'] },
  // Příroda extra
  { word: 'skála', distractors: ['sláva', 'škola', 'brána'] },
  { word: 'louka', distractors: ['mouka', 'trouba', 'kroupa'] },
  { word: 'ostrov', distractors: ['oblouk', 'ostroh', 'ostříž'] },
  { word: 'pramen', distractors: ['plamen', 'kamen', 'hřeben'] },
  { word: 'ledovec', distractors: ['chlapec', 'hrnec', 'kolíček'] },
  { word: 'údolí', distractors: ['podlaží', 'nádobí', 'potrubí'] },
  { word: 'poušť', distractors: ['kohouť', 'chuť', 'pouť'] },
  // Stavby a místa
  { word: 'kostel', distractors: ['hotel', 'kotel', 'hostel'] },
  { word: 'věž', distractors: ['myš', 'věc', 'řeč'] },
  { word: 'maják', distractors: ['bazén', 'palác', 'párek'] },
  { word: 'studna', distractors: ['buchta', 'kapsa', 'bunda'] },
  { word: 'palác', distractors: ['koláč', 'guláš', 'salát'] },
  { word: 'brána', distractors: ['kráva', 'tráva', 'sláva'] },
  { word: 'fontána', distractors: ['čokoláda', 'limonáda', 'marmeláda'] },
  // Pohádkové
  { word: 'meč', distractors: ['klíč', 'míč', 'keř'] },
  { word: 'štít', distractors: ['svit', 'kvíz', 'kříž'] },
  { word: 'poklad', distractors: ['obklad', 'doklad', 'sklad'] },
  { word: 'koruna', distractors: ['pomůcka', 'panenka', 'studánka'] },
  { word: 'trůn', distractors: ['sloup', 'strop', 'proud'] },
  { word: 'jeskyně', distractors: ['studánka', 'zahrádka', 'chaloupka'] },
  // Nástroje a práce
  { word: 'kladivo', distractors: ['letadlo', 'divadlo', 'zrcadlo'] },
  { word: 'pilka', distractors: ['vilka', 'filka', 'šilka'] },
  { word: 'šroubovák', distractors: ['kolotoč', 'houpačka', 'dalekohled'] },
  { word: 'lopata', distractors: ['hodina', 'polévka', 'peřina'] },
  { word: 'hrábě', distractors: ['slabě', 'draze', 'hladce'] },
  { word: 'kolečko', distractors: ['srdíčko', 'sluníčko', 'vajíčko'] },
  // Hudební nástroje
  { word: 'kytara', distractors: ['gitara', 'cigára', 'kamera'] },
  { word: 'bubny', distractors: ['sudy', 'bedny', 'hrady'] },
  { word: 'housle', distractors: ['koule', 'ovoce', 'veslo'] },
  { word: 'flétna', distractors: ['plátna', 'brána', 'vrána'] },
  { word: 'trubka', distractors: ['hubka', 'dýmka', 'pumpa'] },
  { word: 'píšťalka', distractors: ['žárovka', 'ponožka', 'čepička'] },
  // Nářadí a škola
  { word: 'pravítko', distractors: ['vodítko', 'kolečko', 'ležátko'] },
  { word: 'kružítko', distractors: ['vodítko', 'pravítko', 'ležátko'] },
  { word: 'sešit', distractors: ['řezník', 'mazlík', 'lesník'] },
  { word: 'tabule', distractors: ['kapsle', 'lavice', 'postel'] },
];

/* ── Sentence quiz data ── */

const SENTENCES = [
  // ═══ Zvířata ═══
  { sentence: 'Kočka pije ___.', answer: 'mléko', options: ['mléko', 'benzín', 'inkoust', 'lávu'] },
  { sentence: 'Pes má čtyři ___.', answer: 'nohy', options: ['nohy', 'křídla', 'kola', 'motory'] },
  { sentence: 'Ryba plave ve ___.', answer: 'vodě', options: ['vodě', 'čokoládě', 'polévce', 'marmeládě'] },
  { sentence: 'Žába skáče do ___.', answer: 'rybníka', options: ['rybníka', 'komína', 'ledničky', 'vulkánu'] },
  { sentence: 'Kráva žere ___.', answer: 'trávu', options: ['trávu', 'pizzu', 'zmrzlinu', 'špagety'] },
  { sentence: 'Medvěd spí v ___.', answer: 'jeskyni', options: ['jeskyni', 'tramvaji', 'vaně', 'skříni'] },
  { sentence: 'Liška žije v ___.', answer: 'lese', options: ['lese', 'ledničce', 'pračce', 'kabelce'] },
  { sentence: 'Zajíc má dlouhé ___.', answer: 'uši', options: ['uši', 'rohy', 'křídla', 'vousy'] },
  { sentence: 'Motýl má krásná ___.', answer: 'křídla', options: ['křídla', 'kola', 'boty', 'brýle'] },
  { sentence: 'Myška je ___.', answer: 'malá', options: ['malá', 'obrovská', 'fialová', 'průhledná'] },
  { sentence: 'Slon je velmi ___.', answer: 'velký', options: ['velký', 'maličký', 'lehký', 'rychlý'] },
  { sentence: 'Ptáček umí ___.', answer: 'létat', options: ['létat', 'řídit', 'vařit', 'číst'] },
  { sentence: 'Had nemá ___.', answer: 'nohy', options: ['nohy', 'hlavu', 'tělo', 'oči'] },
  { sentence: 'Opice leze po ___.', answer: 'stromě', options: ['stromě', 'autě', 'ledničce', 'komíně'] },
  { sentence: 'Kohout budí ___.', answer: 'ráno', options: ['ráno', 'v noci', 'nikdy', 'potichu'] },
  { sentence: 'Kůň běží po ___.', answer: 'louce', options: ['louce', 'střeše', 'vodě', 'oblaku'] },
  { sentence: 'Papoušek umí ___.', answer: 'mluvit', options: ['mluvit', 'plavat', 'létat pozpátku', 'vařit'] },
  { sentence: 'Včela dělá ___.', answer: 'med', options: ['med', 'máslo', 'sýr', 'čokoládu'] },
  { sentence: 'Krokodýl má velkou ___.', answer: 'tlamu', options: ['tlamu', 'čepici', 'kabelku', 'televizi'] },
  { sentence: 'Želva je velmi ___.', answer: 'pomalá', options: ['pomalá', 'rychlá', 'hlasitá', 'lehká'] },
  { sentence: 'Ježek má ostré ___.', answer: 'bodlinky', options: ['bodlinky', 'zuby', 'rohy', 'nehty'] },
  { sentence: 'Delfín žije v ___.', answer: 'moři', options: ['moři', 'lese', 'garáži', 'komoře'] },
  { sentence: 'Žirafa má dlouhý ___.', answer: 'krk', options: ['krk', 'ocas', 'zobák', 'roh'] },
  { sentence: 'Tučňák neumí ___.', answer: 'létat', options: ['létat', 'plavat', 'chodit', 'jíst'] },
  { sentence: 'Veverka sbírá ___.', answer: 'oříšky', options: ['oříšky', 'ponožky', 'bonbóny', 'klíče'] },
  { sentence: 'Chameleon mění ___.', answer: 'barvu', options: ['barvu', 'jméno', 'tvar', 'hlas'] },
  { sentence: 'Orel má ostrý ___.', answer: 'zobák', options: ['zobák', 'klobouk', 'nos', 'prst'] },
  { sentence: 'Netopýr létá v ___.', answer: 'noci', options: ['noci', 'vodě', 'zemi', 'pytli'] },
  { sentence: 'Kočka loví ___.', answer: 'myši', options: ['myši', 'auta', 'stromy', 'mraky'] },
  { sentence: 'Sova vidí ve ___.', answer: 'tmě', options: ['tmě', 'vodě', 'skříni', 'ledničce'] },
  { sentence: 'Kůň jí ___.', answer: 'oves', options: ['oves', 'pizzu', 'čokoládu', 'sýr'] },
  { sentence: 'Lev je král ___.', answer: 'zvířat', options: ['zvířat', 'stromů', 'aut', 'bot'] },
  { sentence: 'Hlemýžď nosí na zádech ___.', answer: 'ulitu', options: ['ulitu', 'batoh', 'čepici', 'televizi'] },
  { sentence: 'Papír nosí ___.', answer: 'včela', options: ['včela', 'ryba', 'kámen', 'strom'] },
  { sentence: 'Gorila je velká ___.', answer: 'opice', options: ['opice', 'kočka', 'ryba', 'myš'] },

  // ═══ Příroda a počasí ═══
  { sentence: 'Na nebi svítí ___.', answer: 'slunce', options: ['slunce', 'lampa', 'svíčka', 'baterka'] },
  { sentence: 'V zimě padá ___.', answer: 'sníh', options: ['sníh', 'čokoláda', 'písek', 'konfety'] },
  { sentence: 'V noci svítí ___.', answer: 'měsíc', options: ['měsíc', 'slunce', 'duha', 'semafor'] },
  { sentence: 'Květiny rostou na ___.', answer: 'louce', options: ['louce', 'střeše', 'stropě', 'záchodě'] },
  { sentence: 'Jablko roste na ___.', answer: 'stromě', options: ['stromě', 'střeše', 'židli', 'posteli'] },
  { sentence: 'Po dešti je na nebi ___.', answer: 'duha', options: ['duha', 'pizza', 'dort', 'kobliha'] },
  { sentence: 'Listí padá na ___.', answer: 'podzim', options: ['podzim', 'léto', 'jaro', 'oběd'] },
  { sentence: 'Sněhulák má nos z ___.', answer: 'mrkve', options: ['mrkve', 'banánu', 'párku', 'tužky'] },
  { sentence: 'Na jaře kvetou ___.', answer: 'květiny', options: ['květiny', 'kameny', 'boty', 'hrnce'] },
  { sentence: 'Voda v řece ___.', answer: 'teče', options: ['teče', 'spí', 'skáče', 'zpívá'] },
  { sentence: 'Hora je ___.', answer: 'vysoká', options: ['vysoká', 'tekutá', 'průhledná', 'měkká'] },
  { sentence: 'Strom má ___.', answer: 'kořeny', options: ['kořeny', 'kola', 'boty', 'peníze'] },
  { sentence: 'Na podzim fouká ___.', answer: 'vítr', options: ['vítr', 'zmrzlina', 'pizza', 'dort'] },
  { sentence: 'Bouřka přináší ___.', answer: 'blesky', options: ['blesky', 'bonbóny', 'koláče', 'květiny'] },
  { sentence: 'Déšť padá z ___.', answer: 'mraků', options: ['mraků', 'podlahy', 'skříně', 'auta'] },
  { sentence: 'V létě je ___.', answer: 'teplo', options: ['teplo', 'sníh', 'led', 'mráz'] },
  { sentence: 'V zimě je ___.', answer: 'zima', options: ['zima', 'horko', 'vedro', 'léto'] },
  { sentence: 'Řeka teče do ___.', answer: 'moře', options: ['moře', 'lesa', 'komína', 'školy'] },
  { sentence: 'V lese rostou ___.', answer: 'houby', options: ['houby', 'auta', 'domy', 'televize'] },
  { sentence: 'Tulipán je ___.', answer: 'květina', options: ['květina', 'zvíře', 'jídlo', 'auto'] },

  // ═══ Jídlo a pití ═══
  { sentence: 'Babička peče ___.', answer: 'koláč', options: ['koláč', 'ponožky', 'kameny', 'knihy'] },
  { sentence: 'K snídani jím ___.', answer: 'chleba', options: ['chleba', 'polštář', 'klíče', 'tužku'] },
  { sentence: 'Zmrzlina je ___.', answer: 'studená', options: ['studená', 'horká', 'slaná', 'tvrdá'] },
  { sentence: 'Citrón je ___.', answer: 'kyselý', options: ['kyselý', 'sladký', 'modrý', 'měkký'] },
  { sentence: 'Čokoláda je ___.', answer: 'sladká', options: ['sladká', 'kyselá', 'slaná', 'pálivá'] },
  { sentence: 'Polévku jíme ___.', answer: 'lžící', options: ['lžící', 'vidličkou', 'nožem', 'hřebenem'] },
  { sentence: 'Vodu pijeme ze ___.', answer: 'skleničky', options: ['skleničky', 'boty', 'klobouku', 'tašky'] },
  { sentence: 'Chleba mažeme ___.', answer: 'máslem', options: ['máslem', 'barvou', 'lepidlem', 'vodou'] },
  { sentence: 'Med dělají ___.', answer: 'včely', options: ['včely', 'kočky', 'auta', 'stromy'] },
  { sentence: 'Banán je ___.', answer: 'žlutý', options: ['žlutý', 'modrý', 'černý', 'průhledný'] },
  { sentence: 'Jahoda je ___.', answer: 'červená', options: ['červená', 'modrá', 'černá', 'fialová'] },
  { sentence: 'Mléko je ___.', answer: 'bílé', options: ['bílé', 'černé', 'zelené', 'oranžové'] },
  { sentence: 'Pizza se peče v ___.', answer: 'troubě', options: ['troubě', 'vaně', 'garáži', 'skříni'] },
  { sentence: 'Sůl je ___.', answer: 'slaná', options: ['slaná', 'sladká', 'kyselá', 'pálivá'] },
  { sentence: 'Cukr je ___.', answer: 'sladký', options: ['sladký', 'slaný', 'kyselý', 'pálivý'] },
  { sentence: 'Mrkev je ___.', answer: 'oranžová', options: ['oranžová', 'modrá', 'černá', 'průhledná'] },
  { sentence: 'Dort má nahoře ___.', answer: 'svíčky', options: ['svíčky', 'hřebíky', 'kameny', 'klíče'] },
  { sentence: 'Špagety jíme ___.', answer: 'vidličkou', options: ['vidličkou', 'lžící', 'nožem', 'hřebenem'] },
  { sentence: 'Jablko je ___.', answer: 'ovoce', options: ['ovoce', 'zelenina', 'maso', 'pečivo'] },
  { sentence: 'Brambora roste v ___.', answer: 'zemi', options: ['zemi', 'stromě', 'oblaku', 'řece'] },
  { sentence: 'Vajíčko má ___.', answer: 'skořápku', options: ['skořápku', 'kůru', 'srst', 'peří'] },
  { sentence: 'Párek jíme s ___.', answer: 'hořčicí', options: ['hořčicí', 'marmeládou', 'čokoládou', 'šlehačkou'] },

  // ═══ Rodina a domov ═══
  { sentence: 'Máma čte ___.', answer: 'knihu', options: ['knihu', 'stůl', 'auto', 'koberec'] },
  { sentence: 'Táta jezdí ___.', answer: 'autem', options: ['autem', 'postelí', 'skříní', 'židlí'] },
  { sentence: 'Spíme v ___.', answer: 'posteli', options: ['posteli', 'ledničce', 'pračce', 'sporáku'] },
  { sentence: 'Zuby si čistíme ___.', answer: 'kartáčkem', options: ['kartáčkem', 'vidličkou', 'klíčem', 'tužkou'] },
  { sentence: 'Na hlavě mám ___.', answer: 'čepici', options: ['čepici', 'hrnec', 'knihu', 'kytku'] },
  { sentence: 'Děti chodí do ___.', answer: 'školy', options: ['školy', 'lesa', 'komína', 'sopky'] },
  { sentence: 'Boty si zouvám u ___.', answer: 'dveří', options: ['dveří', 'stromu', 'plotu', 'řeky'] },
  { sentence: 'V koupelně je ___.', answer: 'vana', options: ['vana', 'sporák', 'auto', 'strom'] },
  { sentence: 'Oblečení máme ve ___.', answer: 'skříni', options: ['skříni', 'ledničce', 'troubě', 'garáži'] },
  { sentence: 'Televizi ___.', answer: 'sledujeme', options: ['sledujeme', 'jíme', 'pijeme', 'češeme'] },
  { sentence: 'Babička plete ___.', answer: 'svetr', options: ['svetr', 'auto', 'strom', 'psa'] },
  { sentence: 'Dědeček čte ___.', answer: 'noviny', options: ['noviny', 'polštář', 'koberec', 'ledničku'] },
  { sentence: 'Miminko spí v ___.', answer: 'postýlce', options: ['postýlce', 'garáži', 'kuchyni', 'komíně'] },
  { sentence: 'V kuchyni vaříme na ___.', answer: 'sporáku', options: ['sporáku', 'posteli', 'stole', 'podlaze'] },
  { sentence: 'Klíčem odemykáme ___.', answer: 'dveře', options: ['dveře', 'okno', 'strom', 'horu'] },
  { sentence: 'Doma se cítíme ___.', answer: 'bezpečně', options: ['bezpečně', 'mokře', 'slaně', 'zeleně'] },
  { sentence: 'Pes spí v ___.', answer: 'boudě', options: ['boudě', 'autě', 'kuchyni', 'ledničce'] },
  { sentence: 'Lampa svítí na ___.', answer: 'stole', options: ['stole', 'střeše', 'stromě', 'louce'] },
  { sentence: 'Hodiny ukazují ___.', answer: 'čas', options: ['čas', 'barvu', 'teplotu', 'hlad'] },
  { sentence: 'V zimě topíme v ___.', answer: 'kamnech', options: ['kamnech', 'ledničce', 'bazénu', 'autě'] },

  // ═══ Doprava ═══
  { sentence: 'Vlak jezdí po ___.', answer: 'kolejích', options: ['kolejích', 'vodě', 'oblacích', 'trávě'] },
  { sentence: 'Letadlo létá po ___.', answer: 'nebi', options: ['nebi', 'silnici', 'vodě', 'kolejích'] },
  { sentence: 'Loď pluje po ___.', answer: 'vodě', options: ['vodě', 'silnici', 'trávě', 'střeše'] },
  { sentence: 'Auto má čtyři ___.', answer: 'kola', options: ['kola', 'nohy', 'křídla', 'ocásky'] },
  { sentence: 'Na kole šlapeme do ___.', answer: 'pedálů', options: ['pedálů', 'volantu', 'okna', 'dveří'] },
  { sentence: 'Na semafor svítí ___.', answer: 'zelená', options: ['zelená', 'fialová', 'růžová', 'hnědá'] },
  { sentence: 'Tramvaj jezdí po ___.', answer: 'kolejích', options: ['kolejích', 'trávě', 'vodě', 'střeše'] },
  { sentence: 'Autobus vozí ___.', answer: 'lidi', options: ['lidi', 'kameny', 'stromy', 'mraky'] },
  { sentence: 'Hasiči jezdí ___.', answer: 'hasičákem', options: ['hasičákem', 'koněm', 'lodí', 'koštětem'] },
  { sentence: 'Záchranáři jezdí ___.', answer: 'sanitkou', options: ['sanitkou', 'koloběžkou', 'koněm', 'raketou'] },
  { sentence: 'Ponorka pluje pod ___.', answer: 'vodou', options: ['vodou', 'zemí', 'nebem', 'střechou'] },
  { sentence: 'Raketa letí do ___.', answer: 'vesmíru', options: ['vesmíru', 'lesa', 'rybníka', 'sklepa'] },

  // ═══ Škola a učení ═══
  { sentence: 'Píšeme ___.', answer: 'tužkou', options: ['tužkou', 'vidličkou', 'hřebenem', 'klíčem'] },
  { sentence: 'Kreslíme na ___.', answer: 'papír', options: ['papír', 'polštář', 'koberec', 'strop'] },
  { sentence: 'Ve škole sedíme v ___.', answer: 'lavici', options: ['lavici', 'autě', 'stromě', 'vaně'] },
  { sentence: 'Knihy jsou v ___.', answer: 'knihovně', options: ['knihovně', 'ledničce', 'garáži', 'kuchyni'] },
  { sentence: 'Počítáme do ___.', answer: 'deseti', options: ['deseti', 'banánu', 'kočky', 'modra'] },
  { sentence: 'Gumou ___.', answer: 'mažeme', options: ['mažeme', 'jíme', 'pijeme', 'vaříme'] },
  { sentence: 'Nůžkami ___.', answer: 'stříháme', options: ['stříháme', 'jíme', 'pijeme', 'čteme'] },
  { sentence: 'Lepidlem ___.', answer: 'lepíme', options: ['lepíme', 'jíme', 'myjeme', 'spíme'] },
  { sentence: 'Pastelkami ___.', answer: 'kreslíme', options: ['kreslíme', 'jíme', 'vaříme', 'spíme'] },
  { sentence: 'Penál je na ___.', answer: 'tužky', options: ['tužky', 'jídlo', 'boty', 'hračky'] },
  { sentence: 'Školní taška je na ___.', answer: 'zádech', options: ['zádech', 'hlavě', 'noze', 'stole'] },

  // ═══ Tělo ═══
  { sentence: 'Vidíme ___.', answer: 'očima', options: ['očima', 'ušima', 'nohama', 'koleny'] },
  { sentence: 'Slyšíme ___.', answer: 'ušima', options: ['ušima', 'nosem', 'loktem', 'kolenem'] },
  { sentence: 'Čicháme ___.', answer: 'nosem', options: ['nosem', 'uchem', 'kolenem', 'loktem'] },
  { sentence: 'Chodíme po ___.', answer: 'nohách', options: ['nohách', 'rukou', 'hlavě', 'uších'] },
  { sentence: 'Jídlo žvýkáme ___.', answer: 'zuby', options: ['zuby', 'očima', 'ušima', 'prsty'] },
  { sentence: 'Rukama ___.', answer: 'držíme', options: ['držíme', 'slyšíme', 'vidíme', 'čicháme'] },
  { sentence: 'Máme deset ___.', answer: 'prstů', options: ['prstů', 'nosů', 'hlav', 'očí'] },
  { sentence: 'Srdce nám ___.', answer: 'bije', options: ['bije', 'zpívá', 'tančí', 'létá'] },
  { sentence: 'Vlasy máme na ___.', answer: 'hlavě', options: ['hlavě', 'noze', 'ruce', 'koleni'] },
  { sentence: 'Jazyk je v ___.', answer: 'puse', options: ['puse', 'uchu', 'oku', 'noze'] },

  // ═══ Pohádky a fantazie ═══
  { sentence: 'Drak chrlí ___.', answer: 'oheň', options: ['oheň', 'zmrzlinu', 'bonbóny', 'bubliny'] },
  { sentence: 'Princezna žije na ___.', answer: 'zámku', options: ['zámku', 'střeše', 'tramvaji', 'hřišti'] },
  { sentence: 'Čarodějnice létá na ___.', answer: 'koštěti', options: ['koštěti', 'posteli', 'židli', 'kole'] },
  { sentence: 'Král nosí ___.', answer: 'korunu', options: ['korunu', 'helmu', 'čepici', 'pyžamo'] },
  { sentence: 'Jednorožec má na hlavě ___.', answer: 'roh', options: ['roh', 'klobouk', 'anténu', 'květ'] },
  { sentence: 'Víla má kouzelnou ___.', answer: 'hůlku', options: ['hůlku', 'vidličku', 'lžíci', 'tužku'] },
  { sentence: 'Princ jede na ___.', answer: 'koni', options: ['koni', 'žábě', 'myši', 'slimáku'] },
  { sentence: 'Obr je velmi ___.', answer: 'velký', options: ['velký', 'malý', 'tichý', 'rychlý'] },
  { sentence: 'Trpaslík je ___.', answer: 'malý', options: ['malý', 'obrovský', 'průhledný', 'tekutý'] },
  { sentence: 'Pinocchiovi roste ___.', answer: 'nos', options: ['nos', 'ucho', 'ruka', 'noha'] },
  { sentence: 'Perníková chaloupka je z ___.', answer: 'perníku', options: ['perníku', 'kamene', 'ledu', 'železa'] },
  { sentence: 'Vodník žije v ___.', answer: 'rybníce', options: ['rybníce', 'lese', 'horách', 'škole'] },
  { sentence: 'Ježibaba vaří ___.', answer: 'lektvar', options: ['lektvar', 'zmrzlinu', 'čaj', 'polévku'] },
  { sentence: 'Kouzelný koberec umí ___.', answer: 'létat', options: ['létat', 'plavat', 'zpívat', 'vařit'] },

  // ═══ Barvy a vlastnosti ═══
  { sentence: 'Tráva je ___.', answer: 'zelená', options: ['zelená', 'červená', 'modrá', 'černá'] },
  { sentence: 'Nebe je ___.', answer: 'modré', options: ['modré', 'zelené', 'červené', 'žluté'] },
  { sentence: 'Sníh je ___.', answer: 'bílý', options: ['bílý', 'černý', 'zelený', 'červený'] },
  { sentence: 'Uhlí je ___.', answer: 'černé', options: ['černé', 'bílé', 'růžové', 'žluté'] },
  { sentence: 'Oheň je ___.', answer: 'horký', options: ['horký', 'studený', 'mokrý', 'měkký'] },
  { sentence: 'Led je ___.', answer: 'studený', options: ['studený', 'horký', 'měkký', 'suchý'] },
  { sentence: 'Kámen je ___.', answer: 'tvrdý', options: ['tvrdý', 'měkký', 'sladký', 'mokrý'] },
  { sentence: 'Peříčko je ___.', answer: 'lehké', options: ['lehké', 'těžké', 'pálivé', 'hlasité'] },
  { sentence: 'Slunečnice je ___.', answer: 'žlutá', options: ['žlutá', 'modrá', 'černá', 'fialová'] },
  { sentence: 'Rajče je ___.', answer: 'červené', options: ['červené', 'modré', 'bílé', 'černé'] },
  { sentence: 'Kukuřice je ___.', answer: 'žlutá', options: ['žlutá', 'modrá', 'fialová', 'černá'] },
  { sentence: 'Borůvka je ___.', answer: 'modrá', options: ['modrá', 'žlutá', 'bílá', 'oranžová'] },
  { sentence: 'Polštář je ___.', answer: 'měkký', options: ['měkký', 'tvrdý', 'kyselý', 'slaný'] },
  { sentence: 'Železo je ___.', answer: 'těžké', options: ['těžké', 'lehké', 'sladké', 'mokré'] },

  // ═══ Denní režim ═══
  { sentence: 'Ráno vstáváme z ___.', answer: 'postele', options: ['postele', 'auta', 'stromu', 'komína'] },
  { sentence: 'Před jídlem si myjeme ___.', answer: 'ruce', options: ['ruce', 'boty', 'auto', 'psa'] },
  { sentence: 'Večer si čistíme ___.', answer: 'zuby', options: ['zuby', 'boty', 'auto', 'podlahu'] },
  { sentence: 'V noci ___.', answer: 'spíme', options: ['spíme', 'vaříme', 'běháme', 'sekáme'] },
  { sentence: 'Na hřišti si ___.', answer: 'hrajeme', options: ['hrajeme', 'spíme', 'vaříme', 'žehlíme'] },
  { sentence: 'Po obědě si dáme ___.', answer: 'zákusek', options: ['zákusek', 'sprchu', 'klíče', 'ponožky'] },
  { sentence: 'V neděli máme ___.', answer: 'volno', options: ['volno', 'školu', 'zkoušku', 'úklid'] },
  { sentence: 'K snídani pijeme ___.', answer: 'kakao', options: ['kakao', 'benzín', 'barvu', 'šampon'] },
  { sentence: 'Ráno si oblékáme ___.', answer: 'oblečení', options: ['oblečení', 'postel', 'auto', 'psa'] },
  { sentence: 'Večer si čteme ___.', answer: 'pohádku', options: ['pohádku', 'polštář', 'koberec', 'lampu'] },

  // ═══ Povolání ═══
  { sentence: 'Slepice snáší ___.', answer: 'vejce', options: ['vejce', 'míče', 'boty', 'knihy'] },
  { sentence: 'Kominík leze na ___.', answer: 'komín', options: ['komín', 'strom', 'lampu', 'kočku'] },
  { sentence: 'Rybář chytá ___.', answer: 'ryby', options: ['ryby', 'autobusy', 'mraky', 'slony'] },
  { sentence: 'Hasič hasí ___.', answer: 'oheň', options: ['oheň', 'zmrzlinu', 'televizi', 'ponožky'] },
  { sentence: 'Kuchař vaří ___.', answer: 'jídlo', options: ['jídlo', 'boty', 'kameny', 'knihy'] },
  { sentence: 'Zahradník sází ___.', answer: 'květiny', options: ['květiny', 'auta', 'televize', 'ponožky'] },
  { sentence: 'Učitel učí ___.', answer: 'děti', options: ['děti', 'kočky', 'stromy', 'mraky'] },
  { sentence: 'Pekař peče ___.', answer: 'chleba', options: ['chleba', 'kameny', 'klíče', 'ponožky'] },
  { sentence: 'Malíř maluje ___.', answer: 'obrázky', options: ['obrázky', 'polévku', 'koláče', 'ponožky'] },
  { sentence: 'Pošťák nosí ___.', answer: 'dopisy', options: ['dopisy', 'koně', 'stromy', 'mraky'] },
  { sentence: 'Doktor léčí ___.', answer: 'nemocné', options: ['nemocné', 'auta', 'kameny', 'stromy'] },
  { sentence: 'Zubař opravuje ___.', answer: 'zuby', options: ['zuby', 'auta', 'boty', 'hodiny'] },
  { sentence: 'Pilot řídí ___.', answer: 'letadlo', options: ['letadlo', 'kočárek', 'psa', 'koště'] },
  { sentence: 'Kapitán řídí ___.', answer: 'loď', options: ['loď', 'kolo', 'sáňky', 'koloběžku'] },
  { sentence: 'Policista řídí ___.', answer: 'dopravu', options: ['dopravu', 'kočku', 'strom', 'mrak'] },
  { sentence: 'Prodavačka prodává ___.', answer: 'zboží', options: ['zboží', 'mraky', 'hvězdy', 'sny'] },
  { sentence: 'Kovář kuje ___.', answer: 'železo', options: ['železo', 'čokoládu', 'máslo', 'sníh'] },
  { sentence: 'Švec šije ___.', answer: 'boty', options: ['boty', 'koláče', 'polévku', 'mraky'] },

  // ═══ Sport a hry ═══
  { sentence: 'Fotbalista kope do ___.', answer: 'míče', options: ['míče', 'kočky', 'stromu', 'učitele'] },
  { sentence: 'Plavec plave v ___.', answer: 'bazénu', options: ['bazénu', 'lese', 'obchodě', 'škole'] },
  { sentence: 'Hokejista hraje na ___.', answer: 'ledě', options: ['ledě', 'trávě', 'písku', 'vodě'] },
  { sentence: 'Tenista hraje ___.', answer: 'raketou', options: ['raketou', 'lžící', 'koštětem', 'tužkou'] },
  { sentence: 'Lyžař jezdí na ___.', answer: 'lyžích', options: ['lyžích', 'kolech', 'botách', 'rukou'] },
  { sentence: 'Na koloběžce se ___.', answer: 'odrážíme', options: ['odrážíme', 'vaříme', 'spíme', 'čteme'] },
  { sentence: 'Šachy jsou stolní ___.', answer: 'hra', options: ['hra', 'jídlo', 'zvíře', 'auto'] },
  { sentence: 'Při honěné se ___.', answer: 'honíme', options: ['honíme', 'spíme', 'jíme', 'učíme'] },

  // ═══ Roční období a svátky ═══
  { sentence: 'Na Vánoce zdobíme ___.', answer: 'stromeček', options: ['stromeček', 'psa', 'auto', 'ledničku'] },
  { sentence: 'Na Velikonoce malujeme ___.', answer: 'vajíčka', options: ['vajíčka', 'auta', 'boty', 'ponožky'] },
  { sentence: 'O narozeninách foukáme ___.', answer: 'svíčky', options: ['svíčky', 'boty', 'klíče', 'kameny'] },
  { sentence: 'Na Mikuláše chodí ___.', answer: 'čert', options: ['čert', 'drak', 'robot', 'medvěd'] },
  { sentence: 'V adventu otevíráme ___.', answer: 'kalendář', options: ['kalendář', 'ledničku', 'garáž', 'studnu'] },
  { sentence: 'Na jaře se probouzí ___.', answer: 'příroda', options: ['příroda', 'televize', 'auto', 'boty'] },
  { sentence: 'V létě jezdíme k ___.', answer: 'moři', options: ['moři', 'komínu', 'sopce', 'ledovci'] },
  { sentence: 'Na podzim sbíráme ___.', answer: 'kaštany', options: ['kaštany', 'hvězdy', 'mraky', 'sluníčka'] },

  // ═══ Nesmyslné a vtipné ═══
  { sentence: 'Krokodýl nosí ___.', answer: 'boty', options: ['boty', 'kravatu', 'brýle', 'korunu'] },
  { sentence: 'Robot jí ___.', answer: 'šroubky', options: ['šroubky', 'koláče', 'zmrzlinu', 'bonbóny'] },
  { sentence: 'Sněhulák se bojí ___.', answer: 'tepla', options: ['tepla', 'sněhu', 'ledu', 'zimy'] },
  { sentence: 'Astronaut létá do ___.', answer: 'vesmíru', options: ['vesmíru', 'lesa', 'školy', 'obchodu'] },
  { sentence: 'Dinosaurus žil před ___ lety.', answer: 'miliony', options: ['miliony', 'dvěma', 'pěti', 'deseti'] },
  { sentence: 'Slon nemůže ___.', answer: 'skákat', options: ['skákat', 'jíst', 'pít', 'chodit'] },
  { sentence: 'Moucha má ___ nohou.', answer: 'šest', options: ['šest', 'dvě', 'čtyři', 'deset'] },
  { sentence: 'Pavouk má ___ nohou.', answer: 'osm', options: ['osm', 'šest', 'čtyři', 'deset'] },
  { sentence: 'Blesk je rychlejší než ___.', answer: 'zvuk', options: ['zvuk', 'šnek', 'želva', 'auto'] },
  { sentence: 'Tučňáci žijí na ___.', answer: 'ledu', options: ['ledu', 'poušti', 'střeše', 'stromě'] },
  { sentence: 'Kaktus roste na ___.', answer: 'poušti', options: ['poušti', 'ledě', 'vodě', 'střeše'] },
  { sentence: 'Velbloud má na zádech ___.', answer: 'hrby', options: ['hrby', 'křídla', 'sedadla', 'kola'] },
  { sentence: 'Křeček si plní ___.', answer: 'tvářičky', options: ['tvářičky', 'boty', 'kapsy', 'uši'] },
  { sentence: 'Sova otáčí ___.', answer: 'hlavou', options: ['hlavou', 'nohama', 'ocasem', 'zobákem'] },
  { sentence: 'Plameňák stojí na ___ noze.', answer: 'jedné', options: ['jedné', 'třech', 'pěti', 'žádné'] },

  // ═══ Oblečení ═══
  { sentence: 'Rukavice nosíme na ___.', answer: 'rukou', options: ['rukou', 'hlavě', 'nohou', 'krku'] },
  { sentence: 'Šálu nosíme kolem ___.', answer: 'krku', options: ['krku', 'kolena', 'pasu', 'kotníku'] },
  { sentence: 'Čepici nosíme na ___.', answer: 'hlavě', options: ['hlavě', 'ruce', 'noze', 'krku'] },
  { sentence: 'Kalhoty nosíme na ___.', answer: 'nohách', options: ['nohách', 'rukou', 'hlavě', 'krku'] },
  { sentence: 'Svetr si oblékáme přes ___.', answer: 'hlavu', options: ['hlavu', 'nohy', 'boty', 'ruce'] },
  { sentence: 'Ponožky si dáváme na ___.', answer: 'nohy', options: ['nohy', 'ruce', 'hlavu', 'uši'] },
  { sentence: 'Bundu nosíme v ___.', answer: 'zimě', options: ['zimě', 'létě', 'vaně', 'posteli'] },
  { sentence: 'Plavky nosíme v ___.', answer: 'bazénu', options: ['bazénu', 'škole', 'obchodě', 'kuchyni'] },

  // ═══ Město a budovy ═══
  { sentence: 'V nemocnici léčí ___.', answer: 'doktor', options: ['doktor', 'kuchař', 'zahradník', 'malíř'] },
  { sentence: 'V obchodě kupujeme ___.', answer: 'jídlo', options: ['jídlo', 'mraky', 'stromy', 'hvězdy'] },
  { sentence: 'V divadle sledujeme ___.', answer: 'představení', options: ['představení', 'vaření', 'spánek', 'déšť'] },
  { sentence: 'V kině se promítá ___.', answer: 'film', options: ['film', 'polévka', 'koláč', 'zmrzlina'] },
  { sentence: 'Na poště posíláme ___.', answer: 'dopisy', options: ['dopisy', 'koláče', 'polévky', 'ponožky'] },
  { sentence: 'V knihovně si půjčujeme ___.', answer: 'knihy', options: ['knihy', 'koně', 'auta', 'kočky'] },
  { sentence: 'V lékárně kupujeme ___.', answer: 'léky', options: ['léky', 'hračky', 'zmrzlinu', 'koláče'] },
  { sentence: 'V zoo žijí ___.', answer: 'zvířata', options: ['zvířata', 'auta', 'domy', 'stroje'] },
  { sentence: 'Na stadionu hrají ___.', answer: 'fotbal', options: ['fotbal', 'na housle', 'kuličky', 'na schovávanou'] },
  { sentence: 'V parku rostou ___.', answer: 'stromy', options: ['stromy', 'domy', 'auta', 'televize'] },

  // ═══ Hudba ═══
  { sentence: 'Na klavír hrajeme ___.', answer: 'prsty', options: ['prsty', 'nohama', 'loktem', 'hlavou'] },
  { sentence: 'Bubeník bubnuje na ___.', answer: 'bubny', options: ['bubny', 'hrnce', 'stoly', 'kočky'] },
  { sentence: 'Kytarista hraje na ___.', answer: 'kytaru', options: ['kytaru', 'lžíci', 'koště', 'hřeben'] },
  { sentence: 'Zpěvák ___.', answer: 'zpívá', options: ['zpívá', 'vaří', 'spí', 'maluje'] },
  { sentence: 'Houslista hraje na ___.', answer: 'housle', options: ['housle', 'trumpetu', 'bubny', 'piáno'] },
  { sentence: 'Flétna se drží v ___.', answer: 'rukou', options: ['rukou', 'nohách', 'zubech', 'uších'] },
  { sentence: 'Na koncertě posloucháme ___.', answer: 'hudbu', options: ['hudbu', 'vaření', 'počasí', 'pračku'] },

  // ═══ Vesmír ═══
  { sentence: 'Měsíc obíhá kolem ___.', answer: 'Země', options: ['Země', 'Slunce', 'Marsu', 'hvězdy'] },
  { sentence: 'Země je ___.', answer: 'kulatá', options: ['kulatá', 'čtvercová', 'trojúhelníková', 'rovná'] },
  { sentence: 'Na obloze jsou v noci ___.', answer: 'hvězdy', options: ['hvězdy', 'slunce', 'duhy', 'mraky'] },
  { sentence: 'Mars je ___ planeta.', answer: 'červená', options: ['červená', 'modrá', 'zelená', 'žlutá'] },
  { sentence: 'Astronaut nosí ___.', answer: 'skafandr', options: ['skafandr', 'pyžamo', 'plavky', 'župan'] },
  { sentence: 'Slunce je ___.', answer: 'hvězda', options: ['hvězda', 'planeta', 'měsíc', 'kometa'] },

  // ═══ Zahrada ═══
  { sentence: 'V zahradě roste ___.', answer: 'tráva', options: ['tráva', 'auto', 'televize', 'postel'] },
  { sentence: 'Jablka trháme ze ___.', answer: 'stromu', options: ['stromu', 'střechy', 'komína', 'plotu'] },
  { sentence: 'Záhon zaléváme ___.', answer: 'konvičkou', options: ['konvičkou', 'vidličkou', 'tužkou', 'lžící'] },
  { sentence: 'Trávu sekáme ___.', answer: 'sekačkou', options: ['sekačkou', 'vidličkou', 'nůžkami', 'lžící'] },
  { sentence: 'Na zahrádce pěstujeme ___.', answer: 'zeleninu', options: ['zeleninu', 'auta', 'kočky', 'kameny'] },
  { sentence: 'Hrách roste na ___.', answer: 'keři', options: ['keři', 'střeše', 'komíně', 'autě'] },
  { sentence: 'V létě dozrávají ___.', answer: 'třešně', options: ['třešně', 'sněhové vločky', 'rampouchy', 'sněhuláci'] },
  { sentence: 'Kompost je ze ___.', answer: 'zbytků', options: ['zbytků', 'kamení', 'železa', 'skla'] },

  // ═══ Domácí mazlíčci ═══
  { sentence: 'Pejsek vrtí ___.', answer: 'ocasem', options: ['ocasem', 'hlavou', 'tlapkou', 'uchem'] },
  { sentence: 'Kočka předě a ___.', answer: 'vrní', options: ['vrní', 'štěká', 'kokrhá', 'mečí'] },
  { sentence: 'Křeček běhá v ___.', answer: 'kolečku', options: ['kolečku', 'autě', 'letadle', 'vlaku'] },
  { sentence: 'Rybičky žijí v ___.', answer: 'akváriu', options: ['akváriu', 'kleci', 'boudě', 'garáži'] },
  { sentence: 'Papoušek sedí na ___.', answer: 'bidýlku', options: ['bidýlku', 'autě', 'střeše', 'schodech'] },
  { sentence: 'Psa venčíme na ___.', answer: 'vodítku', options: ['vodítku', 'provaze', 'řetězu', 'laně'] },
  { sentence: 'Králíček jí ___.', answer: 'mrkev', options: ['mrkev', 'čokoládu', 'sýr', 'chléb'] },
  { sentence: 'Želva se schovává do ___.', answer: 'krunýře', options: ['krunýře', 'batohu', 'skříně', 'boty'] },

  // ═══ Matematika a čísla ═══
  { sentence: 'Jedna a jedna jsou ___.', answer: 'dvě', options: ['dvě', 'tři', 'čtyři', 'pět'] },
  { sentence: 'Čtverec má ___ strany.', answer: 'čtyři', options: ['čtyři', 'tři', 'pět', 'šest'] },
  { sentence: 'Trojúhelník má ___ strany.', answer: 'tři', options: ['tři', 'čtyři', 'dvě', 'pět'] },
  { sentence: 'Kruh je ___.', answer: 'kulatý', options: ['kulatý', 'hranatý', 'trojúhelníkový', 'čtvercový'] },
  { sentence: 'Dva a dva jsou ___.', answer: 'čtyři', options: ['čtyři', 'tři', 'pět', 'šest'] },
  { sentence: 'Pět prstů je na jedné ___.', answer: 'ruce', options: ['ruce', 'noze', 'hlavě', 'noze'] },
  { sentence: 'Hodina má šedesát ___.', answer: 'minut', options: ['minut', 'hodin', 'dní', 'měsíců'] },
  { sentence: 'Rok má dvanáct ___.', answer: 'měsíců', options: ['měsíců', 'dnů', 'hodin', 'minut'] },
  { sentence: 'Týden má sedm ___.', answer: 'dní', options: ['dní', 'měsíců', 'hodin', 'minut'] },

  // ═══ Přátelství a emoce ═══
  { sentence: 'Když jsme šťastní, ___.', answer: 'smějeme se', options: ['smějeme se', 'pláčeme', 'zlobíme se', 'spíme'] },
  { sentence: 'Když je nám smutno, ___.', answer: 'pláčeme', options: ['pláčeme', 'smějeme se', 'skáčeme', 'běháme'] },
  { sentence: 'Kamarádi si spolu ___.', answer: 'hrají', options: ['hrají', 'nadávají', 'perou se', 'ignorují'] },
  { sentence: 'Když někoho potkáme, řekneme ___.', answer: 'ahoj', options: ['ahoj', 'sbohem', 'au', 'uf'] },
  { sentence: 'Když něco dostaneme, řekneme ___.', answer: 'děkuji', options: ['děkuji', 'nechci', 'au', 'fuj'] },
  { sentence: 'Když odcházíme, řekneme ___.', answer: 'nashledanou', options: ['nashledanou', 'ahoj', 'děkuji', 'prosím'] },

  // ═══ Vtipné extra ═══
  { sentence: 'Žralok má spoustu ___.', answer: 'zubů', options: ['zubů', 'vlasů', 'knoflíků', 'bot'] },
  { sentence: 'Chobotnice má ___ chapadel.', answer: 'osm', options: ['osm', 'dvě', 'sto', 'nula'] },
  { sentence: 'Pštros strká hlavu do ___.', answer: 'písku', options: ['písku', 'vody', 'polévky', 'čokolády'] },
  { sentence: 'Lenochod je velmi ___.', answer: 'pomalý', options: ['pomalý', 'rychlý', 'hlučný', 'malý'] },
  { sentence: 'Kolibřík je velmi ___.', answer: 'malý', options: ['malý', 'velký', 'těžký', 'pomalý'] },
  { sentence: 'Gepard je nejrychlejší ___.', answer: 'zvíře', options: ['zvíře', 'auto', 'vlak', 'letadlo'] },
  { sentence: 'Nosorožec má na nose ___.', answer: 'roh', options: ['roh', 'klobouk', 'brýle', 'knír'] },
  { sentence: 'Pelikán má velký ___.', answer: 'zobák', options: ['zobák', 'klobouk', 'batoh', 'polštář'] },
  { sentence: 'Šnek nosí na zádech ___.', answer: 'ulitu', options: ['ulitu', 'batoh', 'deštník', 'klobouk'] },
  { sentence: 'Orangutan je chytrá ___.', answer: 'opice', options: ['opice', 'ryba', 'kočka', 'myš'] },
  { sentence: 'Sova je symbol ___.', answer: 'moudrosti', options: ['moudrosti', 'rychlosti', 'síly', 'krásy'] },
  { sentence: 'Myši se bojí ___.', answer: 'koček', options: ['koček', 'sýra', 'chleba', 'vody'] },
  { sentence: 'Krtek žije pod ___.', answer: 'zemí', options: ['zemí', 'vodou', 'nebem', 'střechou'] },
  { sentence: 'Netopýr visí ___.', answer: 'hlavou dolů', options: ['hlavou dolů', 'hlavou nahoru', 'na boku', 'na zádech'] },
  { sentence: 'Kočka se myje ___.', answer: 'jazykem', options: ['jazykem', 'kartáčkem', 'mýdlem', 'šamponem'] },
  { sentence: 'Papouškovi říkáme ___.', answer: 'Pepíku', options: ['Pepíku', 'Hafíku', 'Micko', 'Ferdo'] },
  { sentence: 'Sněhulák taje na ___.', answer: 'slunci', options: ['slunci', 'mrazu', 'sněhu', 'ledu'] },
  { sentence: 'Panda jí ___.', answer: 'bambus', options: ['bambus', 'maso', 'čokoládu', 'pizzu'] },
  { sentence: 'Koala spí ___ hodin denně.', answer: 'dvacet', options: ['dvacet', 'pět', 'jednu', 'nula'] },
  { sentence: 'Delfín dýchá ___.', answer: 'vzduchem', options: ['vzduchem', 'vodou', 'pískem', 'blátem'] },

  // ═══ Pohádky extra ═══
  { sentence: 'Popelka ztratila ___.', answer: 'střevíček', options: ['střevíček', 'čepici', 'batoh', 'klíče'] },
  { sentence: 'Červená Karkulka nese babičce ___.', answer: 'koláčky', options: ['koláčky', 'boty', 'kameny', 'klíče'] },
  { sentence: 'Jeníček a Mařenka našli ___.', answer: 'chaloupku', options: ['chaloupku', 'letadlo', 'autobus', 'tramvaj'] },
  { sentence: 'Šípková Růženka spala ___ let.', answer: 'sto', options: ['sto', 'pět', 'dvě', 'deset'] },
  { sentence: 'Sněhurka žila se ___ trpaslíky.', answer: 'sedmi', options: ['sedmi', 'třemi', 'dvěma', 'deseti'] },
  { sentence: 'Kocour v botách nosil ___.', answer: 'boty', options: ['boty', 'čepici', 'rukavice', 'šálu'] },
  { sentence: 'Zlatovláska měla zlaté ___.', answer: 'vlasy', options: ['vlasy', 'boty', 'zuby', 'ruce'] },
  { sentence: 'Honza šel do ___.', answer: 'světa', options: ['světa', 'postele', 'vany', 'skříně'] },
  { sentence: 'Budulínek otevřel ___.', answer: 'dveře', options: ['dveře', 'knihu', 'konzervu', 'deštník'] },
  { sentence: 'Otesánek snědl ___.', answer: 'všechno', options: ['všechno', 'nic', 'polévku', 'sníh'] },

  // ═══ Cestování ═══
  { sentence: 'Na dovolenou jezdíme k ___.', answer: 'moři', options: ['moři', 'popelnici', 'komínu', 'ledničce'] },
  { sentence: 'Na výletě nosíme ___.', answer: 'batoh', options: ['batoh', 'ledničku', 'televizi', 'pračku'] },
  { sentence: 'V kempu spíme ve ___.', answer: 'stanu', options: ['stanu', 'skříni', 'kuchyni', 'autě'] },
  { sentence: 'Na horách jezdíme na ___.', answer: 'lyžích', options: ['lyžích', 'autě', 'lodi', 'kole'] },
  { sentence: 'Na pláži stavíme z ___.', answer: 'písku', options: ['písku', 'sněhu', 'chleba', 'papíru'] },
  { sentence: 'Mapu používáme, když ___.', answer: 'cestujeme', options: ['cestujeme', 'spíme', 'jíme', 'vaříme'] },
  { sentence: 'Pas potřebujeme v ___.', answer: 'cizině', options: ['cizině', 'kuchyni', 'koupelně', 'ložnici'] },
  { sentence: 'Kufr nosíme na ___.', answer: 'letiště', options: ['letiště', 'hřiště', 'zahradu', 'střechu'] },

  // ═══ Nářadí a práce ═══
  { sentence: 'Kladivem zatloukáme ___.', answer: 'hřebíky', options: ['hřebíky', 'bonbóny', 'koláče', 'míče'] },
  { sentence: 'Pilkou řežeme ___.', answer: 'dřevo', options: ['dřevo', 'vodu', 'vzduch', 'mléko'] },
  { sentence: 'Šroubovákem utahujeme ___.', answer: 'šrouby', options: ['šrouby', 'knoflíky', 'zuby', 'oči'] },
  { sentence: 'Štětcem nanášíme ___.', answer: 'barvu', options: ['barvu', 'polévku', 'máslo', 'vodu'] },
  { sentence: 'Lopatou hážeme ___.', answer: 'hlínu', options: ['hlínu', 'mléko', 'vodu', 'vzduch'] },
  { sentence: 'Kleštěmi taháme ___.', answer: 'hřebíky', options: ['hřebíky', 'bonbóny', 'koláče', 'jahody'] },

  // ═══ Zvuky ═══
  { sentence: 'Pes dělá ___.', answer: 'haf', options: ['haf', 'mňau', 'kvák', 'bú'] },
  { sentence: 'Kočka dělá ___.', answer: 'mňau', options: ['mňau', 'haf', 'kokrhá', 'bú'] },
  { sentence: 'Kráva dělá ___.', answer: 'bú', options: ['bú', 'haf', 'mňau', 'kvák'] },
  { sentence: 'Kohout dělá ___.', answer: 'kykyryký', options: ['kykyryký', 'haf', 'mňau', 'bú'] },
  { sentence: 'Kachna dělá ___.', answer: 'kvák', options: ['kvák', 'haf', 'mňau', 'kokrhá'] },
  { sentence: 'Ovce dělá ___.', answer: 'bé', options: ['bé', 'haf', 'mňau', 'kvák'] },
  { sentence: 'Prase dělá ___.', answer: 'chro', options: ['chro', 'haf', 'mňau', 'bú'] },
  { sentence: 'Had dělá ___.', answer: 'sss', options: ['sss', 'haf', 'mňau', 'bú'] },
  { sentence: 'Včela dělá ___.', answer: 'bzz', options: ['bzz', 'haf', 'mňau', 'kvák'] },

  // ═══ Co k čemu patří ═══
  { sentence: 'Tužka patří do ___.', answer: 'penálu', options: ['penálu', 'ledničky', 'akvária', 'garáže'] },
  { sentence: 'Auto parkuje v ___.', answer: 'garáži', options: ['garáži', 'ledničce', 'skříni', 'penálu'] },
  { sentence: 'Mléko dáváme do ___.', answer: 'ledničky', options: ['ledničky', 'skříně', 'penálu', 'garáže'] },
  { sentence: 'Oblečení pověsíme na ___.', answer: 'věšák', options: ['věšák', 'strom', 'auto', 'psa'] },
  { sentence: 'Květiny dáváme do ___.', answer: 'vázy', options: ['vázy', 'boty', 'tašky', 'ledničky'] },
  { sentence: 'Odpadky házíme do ___.', answer: 'koše', options: ['koše', 'postele', 'vany', 'akvária'] },
  { sentence: 'Dopisy vhazujeme do ___.', answer: 'schránky', options: ['schránky', 'ledničky', 'garáže', 'studny'] },
  { sentence: 'Peníze ukládáme do ___.', answer: 'pokladničky', options: ['pokladničky', 'akvária', 'pračky', 'kbelíku'] },

  // ═══ Protiklady ═══
  { sentence: 'Opak slova velký je ___.', answer: 'malý', options: ['malý', 'rychlý', 'tichý', 'starý'] },
  { sentence: 'Opak slova horký je ___.', answer: 'studený', options: ['studený', 'sladký', 'tvrdý', 'starý'] },
  { sentence: 'Opak slova rychlý je ___.', answer: 'pomalý', options: ['pomalý', 'velký', 'sladký', 'mladý'] },
  { sentence: 'Opak slova těžký je ___.', answer: 'lehký', options: ['lehký', 'sladký', 'rychlý', 'starý'] },
  { sentence: 'Opak slova starý je ___.', answer: 'mladý', options: ['mladý', 'rychlý', 'sladký', 'velký'] },
  { sentence: 'Opak slova vysoko je ___.', answer: 'nízko', options: ['nízko', 'daleko', 'blízko', 'zpátky'] },
  { sentence: 'Opak slova den je ___.', answer: 'noc', options: ['noc', 'ráno', 'poledne', 'víkend'] },
  { sentence: 'Opak slova mokrý je ___.', answer: 'suchý', options: ['suchý', 'tichý', 'lehký', 'měkký'] },

  // ═══ Materiály ═══
  { sentence: 'Dům je ze ___.', answer: 'cihel', options: ['cihel', 'papíru', 'čokolády', 'másla'] },
  { sentence: 'Okno je ze ___.', answer: 'skla', options: ['skla', 'dřeva', 'papíru', 'látky'] },
  { sentence: 'Papír je ze ___.', answer: 'dřeva', options: ['dřeva', 'železa', 'skla', 'kamene'] },
  { sentence: 'Svetr je z ___.', answer: 'vlny', options: ['vlny', 'železa', 'skla', 'kamene'] },
  { sentence: 'Nůž je z ___.', answer: 'kovu', options: ['kovu', 'papíru', 'vlny', 'čokolády'] },
  { sentence: 'Pneumatika je z ___.', answer: 'gumy', options: ['gumy', 'skla', 'papíru', 'dřeva'] },

  // ═══ Co dělají věci ═══
  { sentence: 'Hodiny ___.', answer: 'tikají', options: ['tikají', 'štěkají', 'mňoukají', 'zpívají'] },
  { sentence: 'Telefon ___.', answer: 'zvoní', options: ['zvoní', 'vaří', 'pere', 'žehlí'] },
  { sentence: 'Pračka ___.', answer: 'pere', options: ['pere', 'vaří', 'žehlí', 'šije'] },
  { sentence: 'Trouba ___.', answer: 'peče', options: ['peče', 'pere', 'žehlí', 'šije'] },
  { sentence: 'Vysavač ___.', answer: 'vysává', options: ['vysává', 'vaří', 'pere', 'šije'] },
  { sentence: 'Žehlička ___.', answer: 'žehlí', options: ['žehlí', 'vaří', 'pere', 'šije'] },
  { sentence: 'Lednička ___.', answer: 'chladí', options: ['chladí', 'hřeje', 'pere', 'vaří'] },
  { sentence: 'Sporák ___.', answer: 'vaří', options: ['vaří', 'chladí', 'pere', 'žehlí'] },

  // ═══ Vtipné extra 2 ═══
  { sentence: 'Medvěd v zimě ___.', answer: 'spí', options: ['spí', 'plave', 'tančí', 'vaří'] },
  { sentence: 'Zmrzlina na slunci ___.', answer: 'taje', options: ['taje', 'zamrzne', 'vyroste', 'uletí'] },
  { sentence: 'Balón plníme ___.', answer: 'vzduchem', options: ['vzduchem', 'vodou', 'pískem', 'kameny'] },
  { sentence: 'Kominíkovi se říká, že přináší ___.', answer: 'štěstí', options: ['štěstí', 'smutek', 'déšť', 'sníh'] },
  { sentence: 'Duchové straší v ___.', answer: 'hradě', options: ['hradě', 'obchodě', 'škole', 'bazénu'] },
  { sentence: 'Piráti hledají ___.', answer: 'poklad', options: ['poklad', 'ponožky', 'brýle', 'klíče'] },
  { sentence: 'Slon pije chobotem ___.', answer: 'vodu', options: ['vodu', 'čaj', 'kakao', 'limonádu'] },
  { sentence: 'Opice se rády houpou na ___.', answer: 'větvích', options: ['větvích', 'autobusech', 'letadlech', 'střechách'] },
  { sentence: 'Žabák v pohádce byl ve skutečnosti ___.', answer: 'princ', options: ['princ', 'kuchař', 'učitel', 'pilot'] },
  { sentence: 'Čaroděj kouzlí pomocí ___.', answer: 'hůlky', options: ['hůlky', 'vidličky', 'lžíce', 'nože'] },
  { sentence: 'Na dort dáváme ___.', answer: 'šlehačku', options: ['šlehačku', 'ketchup', 'hořčici', 'sůl'] },
  { sentence: 'Sluneční brýle nosíme v ___.', answer: 'létě', options: ['létě', 'zimě', 'noci', 'dešti'] },
  { sentence: 'Deštník používáme, když ___.', answer: 'prší', options: ['prší', 'svítí', 'mrzne', 'fouká'] },
  { sentence: 'Na kole musíme mít ___.', answer: 'helmu', options: ['helmu', 'korunu', 'čelenku', 'věnec'] },
  { sentence: 'Sníh je ___ než déšť.', answer: 'studenější', options: ['studenější', 'teplejší', 'sladší', 'kyselejší'] },
  { sentence: 'Kompas ukazuje na ___.', answer: 'sever', options: ['sever', 'obchod', 'školu', 'hřiště'] },
  { sentence: 'Duha má ___ barev.', answer: 'sedm', options: ['sedm', 'tři', 'dvě', 'sto'] },
  { sentence: 'V pohádce kouzelník říká ___.', answer: 'abraka dabra', options: ['abraka dabra', 'dobrý den', 'nashledanou', 'děkuji'] },
  { sentence: 'Krtečkovy kalhoty jsou ___.', answer: 'červené', options: ['červené', 'modré', 'zelené', 'žluté'] },
  { sentence: 'Bob a Bobek jsou ___.', answer: 'králíci', options: ['králíci', 'kočky', 'psi', 'myši'] },
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

function createNoRepeatPicker(arr) {
  let queue = [];
  let last = null;
  return function next() {
    if (queue.length === 0) {
      queue = shuffle(arr);
      if (queue.length > 1 && queue[0] === last) {
        queue.push(queue.shift());
      }
    }
    last = queue.shift();
    return last;
  };
}
