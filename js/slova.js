/* ══════════════════════════════════════════════
   Slova – slovo VELKÝMI, vyber malými
   ══════════════════════════════════════════════ */

const wordDisplay = document.getElementById('wordDisplay');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const btnSpeakEl = document.getElementById('btnSpeak');
const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreTotalEl = document.getElementById('scoreTotal');
const scoreStreakEl = document.getElementById('scoreStreak');
const btnSkip = document.getElementById('btnSkip');

let correct = 0;
let total = 0;
let streak = 0;
let locked = false;
let currentWord = null;
const pickWord = createNoRepeatPicker(WORDS);

function nextRound() {
  locked = false;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'feedback';

  currentWord = pickWord();

  wordDisplay.textContent = currentWord.word.toUpperCase();
  setTimeout(() => speak(currentWord.word, 0.8), 300);

  const choices = shuffle([currentWord.word, ...currentWord.distractors]);

  optionsEl.innerHTML = '';
  choices.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = w;
    btn.addEventListener('click', () => handleAnswer(btn, w));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(btn, chosen) {
  if (locked) return;
  locked = true;
  total++;

  const isCorrect = chosen === currentWord.word;
  const allBtns = optionsEl.querySelectorAll('.btn');

  if (isCorrect) {
    correct++;
    streak++;
    btn.classList.add('correct');
    feedbackEl.textContent = 'Správně! 🎉';
    feedbackEl.className = 'feedback correct-text';
    showStarsFromElement(btn, 18);
    speak(currentWord.word, 0.8);
  } else {
    streak = 0;
    btn.classList.add('wrong');
    feedbackEl.textContent = `Špatně – správně je ${currentWord.word}`;
    feedbackEl.className = 'feedback wrong-text';
    allBtns.forEach(b => {
      if (b.textContent === currentWord.word) b.classList.add('correct');
    });
  }

  updateScore();
  saveModuleScore('slova', isCorrect ? 1 : 0, 1, streak);
  setTimeout(nextRound, 1600);
}

function updateScore() {
  scoreCorrectEl.textContent = correct;
  scoreTotalEl.textContent = total;
  scoreStreakEl.textContent = streak;
}

btnSpeakEl.addEventListener('click', () => {
  if (currentWord) speak(currentWord.word, 0.8);
});

btnSkip.addEventListener('click', () => { if (!locked) nextRound(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !locked) nextRound(); });

nextRound();
