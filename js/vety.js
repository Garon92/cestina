/* ══════════════════════════════════════════════
   Věty – doplň chybějící slovo
   ══════════════════════════════════════════════ */

const sentenceDisplay = document.getElementById('sentenceDisplay');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreTotalEl = document.getElementById('scoreTotal');
const scoreStreakEl = document.getElementById('scoreStreak');
const btnSkip = document.getElementById('btnSkip');
const btnSpeak = document.getElementById('btnSpeak');
const toggleNormal = document.getElementById('toggleNormal');
const toggleUpper = document.getElementById('toggleUpper');

let correct = 0;
let total = 0;
let streak = 0;
let locked = false;
let currentSentence = null;
let upperMode = false;
const pickSentence = createNoRepeatPicker(SENTENCES);

function applyCase(text) {
  return upperMode ? text.toUpperCase() : text;
}

function speakSentenceWithoutAnswer() {
  if (!currentSentence) return;
  const parts = currentSentence.sentence.split('___');
  const withoutWord = (parts[0] || '').trim() + ' ... ' + (parts[1] || '').trim();
  speak(withoutWord, 0.85);
}

function nextRound() {
  locked = false;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'feedback';

  currentSentence = pickSentence();

  renderSentence();
  renderOptions();
}

function renderSentence() {
  const raw = currentSentence.sentence;
  const parts = raw.split('___');
  sentenceDisplay.innerHTML =
    `<span>${applyCase(parts[0])}</span>` +
    `<span class="sentence-blank">???</span>` +
    `<span>${applyCase(parts[1] || '')}</span>`;
}

function renderOptions() {
  const choices = shuffle([...currentSentence.options]);
  optionsEl.innerHTML = '';
  choices.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = applyCase(w);
    btn.dataset.word = w;
    btn.addEventListener('click', () => handleAnswer(btn, w));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(btn, chosen) {
  if (locked) return;

  const isCorrect = chosen === currentSentence.answer;

  if (isCorrect) {
    locked = true;
    total++;
    correct++;
    streak++;
    btn.classList.add('correct');
    feedbackEl.textContent = 'Správně! 🎉';
    feedbackEl.className = 'feedback correct-text';
    showStarsFromElement(btn, 18);

    const filled = currentSentence.sentence.replace('___', currentSentence.answer);
    speak(filled, 0.85);

    const parts = currentSentence.sentence.split('___');
    sentenceDisplay.innerHTML =
      `<span>${applyCase(parts[0])}</span>` +
      `<span class="sentence-filled">${applyCase(currentSentence.answer)}</span>` +
      `<span>${applyCase(parts[1] || '')}</span>`;

    updateScore();
    saveModuleScore('vety', 1, 1, streak);
    setTimeout(nextRound, 2000);
  } else {
    streak = 0;
    btn.classList.add('wrong');
    feedbackEl.textContent = 'To není správně – zkus to znovu!';
    feedbackEl.className = 'feedback wrong-text';

    const wrongFilled = currentSentence.sentence.replace('___', chosen);
    speak(wrongFilled, 0.85);

    setTimeout(() => {
      btn.classList.remove('wrong');
      feedbackEl.innerHTML = '&nbsp;';
      feedbackEl.className = 'feedback';
    }, 1500);
  }
}

function updateScore() {
  scoreCorrectEl.textContent = correct;
  scoreTotalEl.textContent = total;
  scoreStreakEl.textContent = streak;
}

function setMode(upper) {
  upperMode = upper;
  toggleNormal.classList.toggle('active', !upper);
  toggleUpper.classList.toggle('active', upper);
  if (currentSentence && !locked) {
    renderSentence();
    renderOptions();
  }
}

btnSpeak.addEventListener('click', speakSentenceWithoutAnswer);
toggleNormal.addEventListener('click', () => setMode(false));
toggleUpper.addEventListener('click', () => setMode(true));

btnSkip.addEventListener('click', () => { if (!locked) nextRound(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !locked) nextRound(); });

nextRound();
