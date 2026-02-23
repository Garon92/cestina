/* ══════════════════════════════════════════════
   Abeceda – přehled všech písmen
   ══════════════════════════════════════════════ */

const grid = document.getElementById('letterGrid');
const detail = document.getElementById('detail');
const detailBig = document.getElementById('detailBig');
const detailSmall = document.getElementById('detailSmall');
const detailWord = document.getElementById('detailWord');
const detailSpeak = document.getElementById('detailSpeak');
const toggleBtns = document.querySelectorAll('.view-toggle .btn');

let currentView = 'upper';
let currentLetter = null;

function renderGrid() {
  grid.innerHTML = '';
  ALPHABET.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn';

    if (currentView === 'upper') {
      btn.textContent = item.letter;
    } else if (currentView === 'lower') {
      btn.textContent = item.lower;
    } else {
      btn.innerHTML = `${item.letter}<span style="font-size:0.7em;color:var(--gray);display:block">${item.lower}</span>`;
    }

    btn.addEventListener('click', () => openDetail(item));
    grid.appendChild(btn);
  });
}

function openDetail(item) {
  currentLetter = item;
  detailBig.textContent = item.letter;
  detailSmall.textContent = item.lower;
  const wordStart = item.word.charAt(0).toUpperCase();
  const base = item.letter.length > 1 ? item.letter.charAt(0) : item.letter;
  const prep = (wordStart === base) ? 'jako' : 've slově';
  detailWord.innerHTML = `${item.letter} ${prep} <strong>${item.word}</strong><span class="emoji">${item.emoji}</span>`;
  detail.classList.add('open');
  speakLetter(item);
}

function closeDetail() {
  detail.classList.remove('open');
  currentLetter = null;
}

detail.addEventListener('click', e => {
  if (e.target === detail) closeDetail();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDetail();
});

detailSpeak.addEventListener('click', e => {
  e.stopPropagation();
  if (currentLetter) speakLetter(currentLetter);
});

toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    renderGrid();
  });
});

renderGrid();
