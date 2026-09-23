import { describe, expect, it } from 'vitest';
import { hasSimpleSyllables, hyphenate, isOpenSyllable, syllabify, syllabifyWord, syllableCount } from '../src/lib/syllables';

const GOLDEN: Record<string, string> = {
  máma: 'má-ma',
  táta: 'tá-ta',
  lepo: 'le-po',
  auto: 'au-to',
  autobus: 'au-to-bus',
  kočka: 'koč-ka',
  myška: 'myš-ka',
  kolo: 'ko-lo',
  pes: 'pes',
  vlk: 'vlk',
  krk: 'krk',
  jablko: 'ja-bl-ko',
  bobr: 'bo-br',
  tygr: 'ty-gr',
  vítr: 'ví-tr',
  mrkev: 'mr-kev',
  hrnec: 'hr-nec',
  zmrzlina: 'zmr-zli-na',
  zebra: 'ze-bra',
  letadlo: 'le-ta-dlo',
  sestra: 'ses-tra',
  deštník: 'deš-tník',
  hvězda: 'hvěz-da',
  koala: 'ko-a-la',
  oceán: 'o-ce-án',
  chobotnice: 'cho-bot-ni-ce',
  moucha: 'mou-cha',
  pavouk: 'pa-vouk',
  dinosaurus: 'di-no-sau-rus',
  slunce: 'slun-ce',
  princezna: 'prin-cez-na',
  čokoláda: 'čo-ko-lá-da',
  kukuřice: 'ku-ku-ři-ce',
  tramvaj: 'tram-vaj',
  sluníčko: 'slu-níč-ko',
  veverka: 've-ver-ka',
  kobliha: 'ko-bli-ha',
  jednorožec: 'jed-no-ro-žec',
  papoušek: 'pa-pou-šek',
  ostrov: 'os-trov',
};

describe('slabikování', () => {
  it.each(Object.entries(GOLDEN))('%s → %s', (word, expected) => {
    expect(hyphenate(word)).toBe(expected);
  });
  it('zachová všechna písmena a velikost', () => {
    for (const w of ['MÁMA', 'Chobotnice', 'Auto']) expect(syllabifyWord(w).join('')).toBe(w);
    expect(hyphenate('MÁMA')).toBe('MÁ-MA');
    expect(syllabifyWord('CHOBOTNICE')[0]).toBe('CHO');
  });
  it('víceslovné výrazy dělí po slovech', () => {
    expect(syllabify('mořský koník')).toEqual(['moř', 'ský', ' ', 'ko', 'ník']);
    expect(syllableCount('mořský koník')).toBe(4);
  });
  it('rozpozná jednoduché slabiky', () => {
    expect(hasSimpleSyllables('máma')).toBe(true);
    expect(hasSimpleSyllables('kočka')).toBe(true);
    expect(hasSimpleSyllables('jablko')).toBe(false); // slabikotvorné l
    expect(hasSimpleSyllables('deštník')).toBe(false); // tři souhlásky
    expect(isOpenSyllable('ma')).toBe(true);
    expect(isOpenSyllable('cho')).toBe(true);
    expect(isOpenSyllable('mak')).toBe(false);
  });
});
