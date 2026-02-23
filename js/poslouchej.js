/* ══════════════════════════════════════════════
   Poslouchej a vyber – poslechový kvíz
   ══════════════════════════════════════════════ */

const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const roundInfoEl = document.getElementById('roundInfo');
const btnSpeakEl = document.getElementById('btnSpeak');
const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreTotalEl = document.getElementById('scoreTotal');
const scoreStreakEl = document.getElementById('scoreStreak');
const btnSkip = document.getElementById('btnSkip');

let correct = 0;
let total = 0;
let streak = 0;
let locked = false;
let currentAnswer = null;

/* Randomly show upper or lower in the choices */
let showUpper = true;

function nextRound() {
  locked = false;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'feedback';
  showUpper = Math.random() < 0.5;

  const target = QUIZ_LETTERS[Math.floor(Math.random() * QUIZ_LETTERS.length)];
  currentAnswer = target;

  roundInfoEl.textContent = 'Poslechni si písmenko a vyber správné';

  const distractors = pickRandom(QUIZ_LETTERS, 3, target);
  const choices = shuffle([target, ...distractors]);

  optionsEl.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = showUpper ? ch.letter : ch.lower;
    btn.addEventListener('click', () => handleAnswer(btn, ch));
    optionsEl.appendChild(btn);
  });

  setTimeout(() => speakLetter(currentAnswer), 300);
}

function handleAnswer(btn, chosen) {
  if (locked) return;
  locked = true;
  total++;

  const allBtns = optionsEl.querySelectorAll('.btn');

  if (chosen === currentAnswer) {
    correct++;
    streak++;
    btn.classList.add('correct');
    feedbackEl.textContent = `Správně! ${currentAnswer.letter} = ${currentAnswer.lower} 🎉`;
    feedbackEl.className = 'feedback correct-text';
    showStarsFromElement(btn, 18);
    speakLetter(currentAnswer);
  } else {
    streak = 0;
    btn.classList.add('wrong');
    const correctLabel = showUpper ? currentAnswer.letter : currentAnswer.lower;
    feedbackEl.textContent = `Špatně – správně je ${correctLabel}`;
    feedbackEl.className = 'feedback wrong-text';
    allBtns.forEach(b => {
      const label = b.textContent;
      if (label === correctLabel) b.classList.add('correct');
    });
  }

  updateScore();
  saveModuleScore('poslouchej', chosen === currentAnswer ? 1 : 0, 1, streak);
  setTimeout(nextRound, 1800);
}

function updateScore() {
  scoreCorrectEl.textContent = correct;
  scoreTotalEl.textContent = total;
  scoreStreakEl.textContent = streak;
}

btnSpeakEl.addEventListener('click', () => {
  if (currentAnswer) speakLetter(currentAnswer);
});

btnSkip.addEventListener('click', () => { if (!locked) nextRound(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !locked) nextRound(); });

nextRound();
