/* ══════════════════════════════════════════════
   Piš a poslouchej – volné psaní a čtení
   ══════════════════════════════════════════════ */

const textInput = document.getElementById('textInput');
const btnSpeak = document.getElementById('btnSpeak');
const btnSave = document.getElementById('btnSave');
const btnClearHistory = document.getElementById('btnClearHistory');
const roundInfo = document.getElementById('roundInfo');
const caseButtons = document.querySelectorAll('.text-case-toggle .btn');
const textHistoryWrap = document.getElementById('textHistoryWrap');
const textHistory = document.getElementById('textHistory');

const HISTORY_STORAGE_KEY = 'cestina_recent_texts';
const MAX_HISTORY_ITEMS = 10;

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
  btnSave.disabled = !textInput.value;
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

function playHistoryAt(index) {
  const item = recentTexts[index];
  if (!item) return;
  speak(item, 0.85);
}

function getHistoryIndexForKey(key) {
  if (key === '0') return 9;

  const numeric = Number.parseInt(key, 10);
  if (numeric >= 1 && numeric <= 9) return numeric - 1;

  return null;
}

function isTypingTarget(target) {
  if (!target) return false;
  if (target === textInput) return true;
  if (target.isContentEditable) return true;
  if (target instanceof HTMLElement) {
    return target.closest('input, textarea, [contenteditable="true"]') !== null;
  }
  return false;
}

function moveHistoryItem(index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= recentTexts.length) return;

  const [item] = recentTexts.splice(index, 1);
  recentTexts.splice(nextIndex, 0, item);
  saveRecentTexts();
  renderHistory();
  updateUi();
}

function removeHistoryItem(index) {
  if (index < 0 || index >= recentTexts.length) return;

  recentTexts.splice(index, 1);
  saveRecentTexts();
  renderHistory();
  updateUi();
}

function renderHistory() {
  textHistory.innerHTML = '';
  textHistoryWrap.hidden = recentTexts.length === 0;

  recentTexts.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'text-history-item';

    const moveControls = document.createElement('div');
    moveControls.className = 'text-history-moves';

    const moveUpBtn = document.createElement('button');
    moveUpBtn.type = 'button';
    moveUpBtn.className = 'btn text-history-move';
    moveUpBtn.textContent = '▲';
    moveUpBtn.title = 'Posunout nahoru';
    moveUpBtn.setAttribute('aria-label', `Posunout text nahoru: ${item}`);
    moveUpBtn.disabled = index === 0;
    moveUpBtn.addEventListener('click', () => moveHistoryItem(index, -1));

    const moveDownBtn = document.createElement('button');
    moveDownBtn.type = 'button';
    moveDownBtn.className = 'btn text-history-move';
    moveDownBtn.textContent = '▼';
    moveDownBtn.title = 'Posunout dolů';
    moveDownBtn.setAttribute('aria-label', `Posunout text dolů: ${item}`);
    moveDownBtn.disabled = index === recentTexts.length - 1;
    moveDownBtn.addEventListener('click', () => moveHistoryItem(index, 1));

    moveControls.append(moveUpBtn, moveDownBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn text-history-delete';
    deleteBtn.textContent = '🗑';
    deleteBtn.title = 'Smazat tento text';
    deleteBtn.setAttribute('aria-label', `Smazat uložený text: ${item}`);
    deleteBtn.addEventListener('click', () => removeHistoryItem(index));

    const label = document.createElement('div');
    label.className = 'text-history-label';
    label.textContent = convertTextCase(item);
    label.title = item;

    const speakBtn = document.createElement('button');
    speakBtn.type = 'button';
    speakBtn.className = 'btn btn-primary text-history-speak';
    speakBtn.textContent = '🔊';
    speakBtn.setAttribute('aria-label', `Přečíst uložený text: ${item}`);
    speakBtn.addEventListener('click', () => speak(item, 0.85));

    row.append(moveControls, deleteBtn, label, speakBtn);
    textHistory.appendChild(row);
  });
}

function saveCurrentText() {
  rememberText(textInput.value);
  updateUi();
  textInput.focus();
}

function clearInput() {
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

btnSave.addEventListener('click', saveCurrentText);
btnClearHistory.addEventListener('click', clearHistory);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    btnSpeak.click();
  }

  if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && !isTypingTarget(document.activeElement)) {
    const index = getHistoryIndexForKey(e.key);
    if (index !== null && index < recentTexts.length) {
      playHistoryAt(index);
    }
  }

  if (e.key === 'Escape') {
    clearInput();
  }
});

renderHistory();
updateUi();
textInput.focus();
