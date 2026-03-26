/* ══════════════════════════════════════════════
   Skládání – složi slovo z rozházených písmen
   ══════════════════════════════════════════════ */

const buildArea = document.getElementById('buildArea');
const poolArea = document.getElementById('poolArea');
const wordHint = document.getElementById('wordHint');
const feedbackEl = document.getElementById('feedback');
const btnSpeakEl = document.getElementById('btnSpeak');
const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreTotalEl = document.getElementById('scoreTotal');
const scoreStreakEl = document.getElementById('scoreStreak');
const btnSkip = document.getElementById('btnSkip');
const toggleLower = document.getElementById('toggleLower');
const toggleUpper = document.getElementById('toggleUpper');
const toggleHidden = document.getElementById('toggleHidden');
const toggleShown = document.getElementById('toggleShown');

let correct = 0;
let total = 0;
let streak = 0;
let currentWord = '';
let letters = [];
let nextIndex = 0;
let upperMode = false;
let showWord = false;
let mistakes = 0;

const SKLADANI_WORDS = [
  'pes', 'les', 'nos', 'ves', 'dům', 'sůl', 'míč', 'klíč',
  'had', 'med', 'led', 'lev', 'sob', 'rak', 'sýr', 'myš',
  'auto', 'kolo', 'ryba', 'žába', 'voda', 'hora', 'mrak', 'vlak',
  'sova', 'koza', 'drak', 'dort', 'osel', 'hrad', 'most', 'kost',
  'kočka', 'liška', 'kniha', 'škola', 'tráva', 'kráva', 'máma', 'táta',
  'strom', 'medvěd', 'jablko', 'slunce', 'květina', 'motýl', 'zajíc',
  'balón', 'ptáček', 'hvězda', 'srdce', 'sníh', 'ovce', 'holub',
  'rohlík', 'banán', 'jahoda', 'koláč', 'párek', 'ježek', 'robot',
  'lampa', 'zámek', 'komín', 'batoh', 'tunel', 'hruška', 'jelen',
  'svetr', 'bunda', 'budík', 'raketa', 'potok', 'kopec', 'penál',
];

const pickSkladaniWord = createNoRepeatPicker(SKLADANI_WORDS);

function applyCase(text) {
  return upperMode ? text.toUpperCase() : text.toLowerCase();
}

function nextRound() {
  mistakes = 0;
  nextIndex = 0;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'feedback';

  currentWord = pickSkladaniWord();
  letters = currentWord.split('');

  renderHint();
  renderBuild();
  renderPool();

  setTimeout(() => speak(currentWord, 0.8), 300);
}

function renderHint() {
  if (showWord) {
    wordHint.textContent = applyCase(currentWord);
    wordHint.classList.remove('hint-hidden');
  } else {
    wordHint.textContent = '';
    wordHint.classList.add('hint-hidden');
  }
}

function renderBuild() {
  buildArea.innerHTML = '';
  letters.forEach((ch, i) => {
    const slot = document.createElement('span');
    slot.className = 'build-slot';
    if (i < nextIndex) {
      slot.textContent = applyCase(ch);
      slot.classList.add('filled');
    }
    buildArea.appendChild(slot);
  });
}

function renderPool() {
  poolArea.innerHTML = '';
  const shuffled = shuffle(letters.map((ch, i) => ({ ch, i })));
  shuffled.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn pool-letter';
    btn.textContent = applyCase(item.ch);
    btn.dataset.idx = item.i;

    if (item.i < nextIndex) {
      btn.classList.add('used');
    }

    btn.addEventListener('click', () => handlePick(btn, item));
    poolArea.appendChild(btn);
  });
}

function handlePick(btn, item) {
  if (btn.classList.contains('used')) return;

  const expected = letters[nextIndex];
  if (item.ch === expected) {
    nextIndex++;
    btn.classList.add('used', 'correct');

    renderBuild();

    if (nextIndex === letters.length) {
      total++;
      if (mistakes === 0) {
        correct++;
        streak++;
      } else {
        streak = 0;
      }
      updateScore();
      saveModuleScore('skladani', mistakes === 0 ? 1 : 0, 1, streak);

      feedbackEl.textContent = mistakes === 0 ? 'Výborně! Bez chyby! 🎉' : 'Hotovo! 👍';
      feedbackEl.className = 'feedback correct-text';
      showStarsFromElement(buildArea, 22);
      speak(currentWord, 0.8);

      setTimeout(nextRound, 2000);
    }
  } else {
    mistakes++;
    btn.classList.add('wrong');
    feedbackEl.textContent = `To není správné písmenko – hledáš "${applyCase(expected)}"`;
    feedbackEl.className = 'feedback wrong-text';
    setTimeout(() => {
      btn.classList.remove('wrong');
      if (nextIndex < letters.length) {
        feedbackEl.innerHTML = '&nbsp;';
        feedbackEl.className = 'feedback';
      }
    }, 700);
  }
}

function updateScore() {
  scoreCorrectEl.textContent = correct;
  scoreTotalEl.textContent = total;
  scoreStreakEl.textContent = streak;
}

function setUpperMode(upper) {
  upperMode = upper;
  toggleLower.classList.toggle('active', !upper);
  toggleUpper.classList.toggle('active', upper);
  renderHint();
  renderBuild();
  renderPool();
}

function setShowWord(show) {
  showWord = show;
  toggleHidden.classList.toggle('active', !show);
  toggleShown.classList.toggle('active', show);
  renderHint();
}

toggleLower.addEventListener('click', () => setUpperMode(false));
toggleUpper.addEventListener('click', () => setUpperMode(true));
toggleHidden.addEventListener('click', () => setShowWord(false));
toggleShown.addEventListener('click', () => setShowWord(true));

btnSpeakEl.addEventListener('click', () => speak(currentWord, 0.8));
btnSkip.addEventListener('click', nextRound);
document.addEventListener('keydown', e => { if (e.key === 'Escape') nextRound(); });

nextRound();
