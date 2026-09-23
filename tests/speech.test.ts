import { describe, expect, it } from 'vitest';
import { scoreVoice } from '../src/lib/speech';
import { caseLetter, caseSentence, caseWord, forSpeech, plural } from '../src/lib/text';

describe('výběr hlasu', () => {
  const v = (name: string, lang: string, localService = true) => ({ name, lang, localService });
  it('bere jen české hlasy a řadí je podle kvality', () => {
    expect(scoreVoice(v('Samantha', 'en-US'))).toBeLessThan(0);
    expect(scoreVoice(v('Google Deutsch', 'de-DE'))).toBeLessThan(0);
    const natural = scoreVoice(v('Microsoft Vlasta Online (Natural) - Czech', 'cs-CZ', false));
    const google = scoreVoice(v('Google čeština', 'cs-CZ', false));
    const zuzana = scoreVoice(v('Zuzana', 'cs-CZ'));
    const plain = scoreVoice(v('Czech', 'cs'));
    expect(natural).toBeGreaterThan(google);
    expect(google).toBeGreaterThan(plain);
    expect(zuzana).toBeGreaterThan(plain);
    expect(scoreVoice(v('Zuzana (vylepšený)', 'cs_CZ'))).toBeGreaterThan(zuzana);
  });
});

describe('text', () => {
  it('pro řeč vždy malými písmeny a místo mezery pauza', () => {
    expect(forSpeech('KOČKA PIJE ___.')).toBe('kočka pije  … .');
    expect(forSpeech('Chobotnice')).toBe('chobotnice');
  });
  it('písmo slov, vět a písmen', () => {
    expect(caseWord('čepice', 'upper')).toBe('ČEPICE');
    expect(caseWord('Čepice', 'lower')).toBe('čepice');
    expect(caseSentence('Kočka pije mléko.', 'lower')).toBe('Kočka pije mléko.');
    expect(caseSentence('Kočka pije mléko.', 'upper')).toBe('KOČKA PIJE MLÉKO.');
    expect(caseLetter({ upper: 'Ch', lower: 'ch' }, 'upper')).toBe('Ch');
    expect(caseLetter({ upper: 'Ch', lower: 'ch' }, 'script')).toBe('ch');
  });
  it('české tvary množného čísla', () => {
    expect(plural(1, 'hvězda', 'hvězdy', 'hvězd')).toBe('hvězda');
    expect(plural(3, 'hvězda', 'hvězdy', 'hvězd')).toBe('hvězdy');
    expect(plural(5, 'hvězda', 'hvězdy', 'hvězd')).toBe('hvězd');
    expect(plural(0, 'hvězda', 'hvězdy', 'hvězd')).toBe('hvězd');
  });
});
