/* ══════════════════════════════════════════════
   Poznávání písmen – kvíz
   ══════════════════════════════════════════════ */

const questionEl = document.getElementById('questionLetter');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const roundInfoEl = document.getElementById('roundInfo');
const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreTotalEl = document.getElementById('scoreTotal');
const scoreStreakEl = document.getElementById('scoreStreak');
const btnSkip = document.getElementById('btnSkip');

let correct = 0;
let total = 0;
let streak = 0;
let locked = false;
let currentAnswer = null;

/* true = show uppercase, pick matching lowercase.
   false = show lowercase, pick matching uppercase. */
let showUpper = true;

function nextRound() {
  locked = false;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'feedback';

  showUpper = Math.random() < 0.5;

  const target = QUIZ_LETTERS[Math.floor(Math.random() * QUIZ_LETTERS.length)];
  currentAnswer = target;

  if (showUpper) {
    questionEl.textContent = target.letter;
    roundInfoEl.textContent = 'Najdi správné malé písmenko';
  } else {
    questionEl.textContent = target.lower;
    roundInfoEl.textContent = 'Najdi správné VELKÉ písmenko';
  }

  const distractors = pickRandom(QUIZ_LETTERS, 3, target);
  const choices = shuffle([target, ...distractors]);

  optionsEl.innerHTML = '';
  choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = showUpper ? ch.lower : ch.letter;
    btn.addEventListener('click', () => handleAnswer(btn, ch));
    optionsEl.appendChild(btn);
  });
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
    feedbackEl.textContent = 'Správně! 🎉';
    feedbackEl.className = 'feedback correct-text';
    showStarsFromElement(btn, 18);
    speakLetter(currentAnswer);
  } else {
    streak = 0;
    btn.classList.add('wrong');
    feedbackEl.textContent = `Špatně – správně je ${showUpper ? currentAnswer.lower : currentAnswer.letter}`;
    feedbackEl.className = 'feedback wrong-text';
    allBtns.forEach(b => {
      const label = b.textContent;
      const match = showUpper ? currentAnswer.lower : currentAnswer.letter;
      if (label === match) b.classList.add('correct');
    });
  }

  updateScore();
  saveModuleScore('poznavani', chosen === currentAnswer ? 1 : 0, 1, streak);
  setTimeout(nextRound, 1500);
}

function updateScore() {
  scoreCorrectEl.textContent = correct;
  scoreTotalEl.textContent = total;
  scoreStreakEl.textContent = streak;
}

btnSkip.addEventListener('click', () => { if (!locked) nextRound(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !locked) nextRound(); });

nextRound();
