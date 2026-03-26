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
  // Zvířata
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

  // Příroda a počasí
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

  // Jídlo a pití
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

  // Rodina a domov
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

  // Doprava
  { sentence: 'Vlak jezdí po ___.', answer: 'kolejích', options: ['kolejích', 'vodě', 'oblacích', 'trávě'] },
  { sentence: 'Letadlo létá po ___.', answer: 'nebi', options: ['nebi', 'silnici', 'vodě', 'kolejích'] },
  { sentence: 'Loď pluje po ___.', answer: 'vodě', options: ['vodě', 'silnici', 'trávě', 'střeše'] },
  { sentence: 'Auto má čtyři ___.', answer: 'kola', options: ['kola', 'nohy', 'křídla', 'ocásky'] },
  { sentence: 'Na kole šlapeme do ___.', answer: 'pedálů', options: ['pedálů', 'volantu', 'okna', 'dveří'] },
  { sentence: 'Na semafor svítí ___.', answer: 'zelená', options: ['zelená', 'fialová', 'růžová', 'hnědá'] },

  // Škola a učení
  { sentence: 'Píšeme ___.', answer: 'tužkou', options: ['tužkou', 'vidličkou', 'hřebenem', 'klíčem'] },
  { sentence: 'Kreslíme na ___.', answer: 'papír', options: ['papír', 'polštář', 'koberec', 'strop'] },
  { sentence: 'Ve škole sedíme v ___.', answer: 'lavici', options: ['lavici', 'autě', 'stromě', 'vaně'] },
  { sentence: 'Knihy jsou v ___.', answer: 'knihovně', options: ['knihovně', 'ledničce', 'garáži', 'kuchyni'] },
  { sentence: 'Počítáme do ___.', answer: 'deseti', options: ['deseti', 'banánu', 'kočky', 'modra'] },

  // Tělo
  { sentence: 'Vidíme ___.', answer: 'očima', options: ['očima', 'ušima', 'nohama', 'koleny'] },
  { sentence: 'Slyšíme ___.', answer: 'ušima', options: ['ušima', 'nosem', 'loktem', 'kolenem'] },
  { sentence: 'Čicháme ___.', answer: 'nosem', options: ['nosem', 'uchem', 'kolenem', 'loktem'] },
  { sentence: 'Chodíme po ___.', answer: 'nohách', options: ['nohách', 'rukou', 'hlavě', 'uších'] },
  { sentence: 'Jídlo žvýkáme ___.', answer: 'zuby', options: ['zuby', 'očima', 'ušima', 'prsty'] },

  // Pohádky a fantazie
  { sentence: 'Drak chrlí ___.', answer: 'oheň', options: ['oheň', 'zmrzlinu', 'bonbóny', 'bubliny'] },
  { sentence: 'Princezna žije na ___.', answer: 'zámku', options: ['zámku', 'střeše', 'tramvaji', 'hřišti'] },
  { sentence: 'Čarodějnice létá na ___.', answer: 'koštěti', options: ['koštěti', 'posteli', 'židli', 'kole'] },
  { sentence: 'Král nosí ___.', answer: 'korunu', options: ['korunu', 'helmu', 'čepici', 'pyžamo'] },
  { sentence: 'Jednorožec má na hlavě ___.', answer: 'roh', options: ['roh', 'klobouk', 'anténu', 'květ'] },
  { sentence: 'Víla má kouzelnou ___.', answer: 'hůlku', options: ['hůlku', 'vidličku', 'lžíci', 'tužku'] },

  // Barvy a vlastnosti
  { sentence: 'Tráva je ___.', answer: 'zelená', options: ['zelená', 'červená', 'modrá', 'černá'] },
  { sentence: 'Nebe je ___.', answer: 'modré', options: ['modré', 'zelené', 'červené', 'žluté'] },
  { sentence: 'Sníh je ___.', answer: 'bílý', options: ['bílý', 'černý', 'zelený', 'červený'] },
  { sentence: 'Uhlí je ___.', answer: 'černé', options: ['černé', 'bílé', 'růžové', 'žluté'] },
  { sentence: 'Oheň je ___.', answer: 'horký', options: ['horký', 'studený', 'mokrý', 'měkký'] },
  { sentence: 'Led je ___.', answer: 'studený', options: ['studený', 'horký', 'měkký', 'suchý'] },
  { sentence: 'Kámen je ___.', answer: 'tvrdý', options: ['tvrdý', 'měkký', 'sladký', 'mokrý'] },
  { sentence: 'Peříčko je ___.', answer: 'lehké', options: ['lehké', 'těžké', 'pálivé', 'hlasité'] },

  // Denní režim
  { sentence: 'Ráno vstáváme z ___.', answer: 'postele', options: ['postele', 'auta', 'stromu', 'komína'] },
  { sentence: 'Před jídlem si myjeme ___.', answer: 'ruce', options: ['ruce', 'boty', 'auto', 'psa'] },
  { sentence: 'Večer si čistíme ___.', answer: 'zuby', options: ['zuby', 'boty', 'auto', 'podlahu'] },
  { sentence: 'V noci ___.', answer: 'spíme', options: ['spíme', 'vaříme', 'běháme', 'sekáme'] },
  { sentence: 'Na hřišti si ___.', answer: 'hrajeme', options: ['hrajeme', 'spíme', 'vaříme', 'žehlíme'] },

  // Vtipné a nesmyslné (pro srandu s chybnými odpověďmi)
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
