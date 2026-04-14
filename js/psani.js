/* ══════════════════════════════════════════════
   Piš a poslouchej – volné psaní a čtení
   ══════════════════════════════════════════════ */

const textInput = document.getElementById('textInput');
const btnSpeak = document.getElementById('btnSpeak');
const btnClear = document.getElementById('btnClear');
const btnClearHistory = document.getElementById('btnClearHistory');
const roundInfo = document.getElementById('roundInfo');
const caseButtons = document.querySelectorAll('.text-case-toggle .btn');
const textHistoryWrap = document.getElementById('textHistoryWrap');
const textHistory = document.getElementById('textHistory');

const HISTORY_STORAGE_KEY = 'cestina_recent_texts';
const MAX_HISTORY_ITEMS = 5;

let caseMode = 'upper';
let recentTexts = loadRecentTexts();

function loadRecentTexts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => typeof item === 'string' && item.trim())
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

function saveRecentTexts() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(recentTexts));
}

function convertTextCase(value) {
  return caseMode === 'upper'
    ? value.toLocaleUpperCase('cs-CZ')
    : value.toLocaleLowerCase('cs-CZ');
}

function setTextValue(value) {
  textInput.value = convertTextCase(value);
}

function updateUi() {
  const value = textInput.value.trim();

  btnSpeak.disabled = !value;
  btnClear.disabled = !textInput.value;
  roundInfo.textContent = value
    ? 'Klikni na reproduktor a text se přečte'
    : recentTexts.length
      ? 'Napiš něco nového nebo si pusť něco z historie'
      : 'Napiš slovo nebo větu a klikni na reproduktor';
}

function applyCaseToCurrentText() {
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  setTextValue(textInput.value);
  textInput.setSelectionRange(start, end);
  renderHistory();
  updateUi();
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

function rememberText(value) {
  const trimmed = value.trim();
  if (!trimmed) return;

  recentTexts = [
    trimmed,
    ...recentTexts.filter(item => item !== trimmed)
  ].slice(0, MAX_HISTORY_ITEMS);

  saveRecentTexts();
  renderHistory();
}

function fillFromHistory(value) {
  setTextValue(value);
  updateUi();
  textInput.focus();
}

function renderHistory() {
  textHistory.innerHTML = '';
  textHistoryWrap.hidden = recentTexts.length === 0;

  recentTexts.forEach(item => {
    const row = document.createElement('div');
    row.className = 'text-history-item';

    const loadBtn = document.createElement('button');
    loadBtn.type = 'button';
    loadBtn.className = 'btn text-history-load';
    loadBtn.textContent = convertTextCase(item);
    loadBtn.title = 'Vrátit text do pole';
    loadBtn.addEventListener('click', () => fillFromHistory(item));

    const speakBtn = document.createElement('button');
    speakBtn.type = 'button';
    speakBtn.className = 'btn btn-primary text-history-speak';
    speakBtn.textContent = '🔊';
    speakBtn.setAttribute('aria-label', `Přečíst uložený text: ${item}`);
    speakBtn.addEventListener('click', () => speak(item, 0.85));

    row.append(loadBtn, speakBtn);
    textHistory.appendChild(row);
  });
}

function clearText() {
  rememberText(textInput.value);
  textInput.value = '';
  stopSpeaking();
  updateUi();
  textInput.focus();
}

function clearHistory() {
  recentTexts = [];
  saveRecentTexts();
  renderHistory();
  updateUi();
}

textInput.addEventListener('input', () => {
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  setTextValue(textInput.value);
  textInput.setSelectionRange(start, end);
  updateUi();
});

caseButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    caseButtons.forEach(item => item.classList.remove('active'));
    btn.classList.add('active');
    caseMode = btn.dataset.case;
    applyCaseToCurrentText();
    textInput.focus();
  });
});

btnSpeak.addEventListener('click', () => {
  const value = textInput.value.trim();
  if (!value) return;
  speak(value, 0.85);
});

btnClear.addEventListener('click', clearText);
btnClearHistory.addEventListener('click', clearHistory);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    btnSpeak.click();
  }

  if (e.key === 'Escape') {
    clearText();
  }
});

renderHistory();
updateUi();
textInput.focus();
