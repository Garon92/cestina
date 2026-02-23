/* ══════════════════════════════════════════════
   Párování – spoj velká a malá písmenka
   ══════════════════════════════════════════════ */

const colLeft = document.getElementById('colLeft');
const colRight = document.getElementById('colRight');
const feedbackEl = document.getElementById('feedback');
const roundInfoEl = document.getElementById('roundInfo');
const scoreCorrectEl = document.getElementById('scoreCorrect');
const scoreRoundEl = document.getElementById('scoreRound');

const PAIR_COUNT = 5;
let round = 1;
let totalCorrect = 0;
let selectedLeft = null;
let selectedBtn = null;
let locked = false;
let currentPairs = [];

function startRound() {
  locked = false;
  selectedLeft = null;
  selectedBtn = null;
  feedbackEl.innerHTML = '&nbsp;';
  feedbackEl.className = 'feedback';
  roundInfoEl.textContent = `Spoj velké písmeno s malým (kolo ${round})`;

  currentPairs = shuffle(QUIZ_LETTERS).slice(0, PAIR_COUNT);
  const leftOrder = shuffle([...currentPairs]);
  const rightOrder = shuffle([...currentPairs]);

  colLeft.innerHTML = '';
  colRight.innerHTML = '';

  leftOrder.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = item.letter;
    btn.dataset.id = item.letter;
    btn.addEventListener('click', () => selectLeft(btn, item));
    colLeft.appendChild(btn);
  });

  rightOrder.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = item.lower;
    btn.dataset.id = item.letter;
    btn.addEventListener('click', () => selectRight(btn, item));
    colRight.appendChild(btn);
  });
}

function clearSelection() {
  colLeft.querySelectorAll('.btn').forEach(b => b.classList.remove('selected'));
  selectedLeft = null;
  selectedBtn = null;
}

function selectLeft(btn, item) {
  if (locked || btn.classList.contains('matched')) return;
  clearSelection();
  btn.classList.add('selected');
  selectedLeft = item;
  selectedBtn = btn;
}

function selectRight(btn, item) {
  if (locked || btn.classList.contains('matched') || !selectedLeft) return;
  locked = true;

  if (item.letter === selectedLeft.letter) {
    totalCorrect++;
    scoreCorrectEl.textContent = totalCorrect;

    btn.classList.add('correct');
    selectedBtn.classList.add('correct');

    feedbackEl.textContent = `${item.letter} = ${item.lower} ✓`;
    feedbackEl.className = 'feedback correct-text';

    showStarsFromElement(btn, 12);
    speakLetter(item);

    setTimeout(() => {
      btn.classList.remove('correct', 'selected');
      btn.classList.add('matched');
      selectedBtn.classList.remove('correct', 'selected');
      selectedBtn.classList.add('matched');
      clearSelection();
      locked = false;

      const remaining = colLeft.querySelectorAll('.btn:not(.matched)');
      if (remaining.length === 0) {
        feedbackEl.textContent = '🎉 Výborně! Všechna písmena spárována!';
        feedbackEl.className = 'feedback correct-text';
        saveModuleScore('parovani', PAIR_COUNT, PAIR_COUNT, 0);
        round++;
        scoreRoundEl.textContent = round;
        setTimeout(startRound, 2000);
      }
    }, 600);
  } else {
    btn.classList.add('wrong');
    feedbackEl.textContent = `To není správný pár – zkus to znovu`;
    feedbackEl.className = 'feedback wrong-text';
    saveModuleScore('parovani', 0, 1, 0);

    setTimeout(() => {
      btn.classList.remove('wrong');
      clearSelection();
      locked = false;
    }, 800);
  }
}

startRound();
