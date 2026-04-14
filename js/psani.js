/* ══════════════════════════════════════════════
   Piš a poslouchej – volné psaní a čtení
   ══════════════════════════════════════════════ */

const textInput = document.getElementById('textInput');
const textPreview = document.getElementById('textPreview');
const btnSpeak = document.getElementById('btnSpeak');
const btnClear = document.getElementById('btnClear');
const roundInfo = document.getElementById('roundInfo');
const caseButtons = document.querySelectorAll('.text-case-toggle .btn');

let caseMode = 'upper';

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

  textPreview.textContent = value || convertTextCase('Sem napiš, co chceš přečíst');
  btnSpeak.disabled = !value;
  btnClear.disabled = !textInput.value;
  roundInfo.textContent = value
    ? 'Klikni na reproduktor a text se přečte'
    : 'Napiš slovo nebo větu a klikni na reproduktor';
}

function applyCaseToCurrentText() {
  const start = textInput.selectionStart;
  const end = textInput.selectionEnd;
  setTextValue(textInput.value);
  textInput.setSelectionRange(start, end);
  updateUi();
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

function clearText() {
  textInput.value = '';
  stopSpeaking();
  updateUi();
  textInput.focus();
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

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    btnSpeak.click();
  }

  if (e.key === 'Escape') {
    clearText();
  }
});

updateUi();
textInput.focus();
