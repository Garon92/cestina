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

function getHistoryShortcutLabel(index) {
  return index === 9 ? '0' : String(index + 1);
}

function getHistoryIndexForCode(code) {
  const topRowMap = {
    Digit1: 0,
    Digit2: 1,
    Digit3: 2,
    Digit4: 3,
    Digit5: 4,
    Digit6: 5,
    Digit7: 6,
    Digit8: 7,
    Digit9: 8,
    Digit0: 9,
    Numpad1: 0,
    Numpad2: 1,
    Numpad3: 2,
    Numpad4: 3,
    Numpad5: 4,
    Numpad6: 5,
    Numpad7: 6,
    Numpad8: 7,
    Numpad9: 8,
    Numpad0: 9
  };

  return Object.hasOwn(topRowMap, code) ? topRowMap[code] : null;
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
    label.title = `${getHistoryShortcutLabel(index)}: ${item}`;

    const shortcut = document.createElement('span');
    shortcut.className = 'text-history-key';
    shortcut.textContent = getHistoryShortcutLabel(index);

    const text = document.createElement('span');
    text.className = 'text-history-text';
    text.textContent = convertTextCase(item);

    label.append(shortcut, text);

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
  clearInput();
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

  if (!e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(document.activeElement)) {
    const index = getHistoryIndexForCode(e.code);
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
