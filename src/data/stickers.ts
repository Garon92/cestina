/** Album nálepek – za každé dokončené cvičení jedna nová. */
export interface Sticker {
  id: string;
  e: string;
  name: string;
  album: AlbumId;
}

export type AlbumId = 'zviratka' | 'vesmir' | 'mlsani' | 'jezdime' | 'pohadky';

export const ALBUMS: { id: AlbumId; label: string; icon: string }[] = [
  { id: 'zviratka', label: 'Zvířátka', icon: '🐾' },
  { id: 'vesmir', label: 'Příroda a vesmír', icon: '🌈' },
  { id: 'mlsani', label: 'Mlsání', icon: '🍭' },
  { id: 'jezdime', label: 'Jezdíme', icon: '🚂' },
  { id: 'pohadky', label: 'Pohádky a hry', icon: '🏰' },
];

const S = (album: AlbumId, list: [string, string][]): Sticker[] =>
  list.map(([e, name], i) => ({ id: `${album}-${i + 1}`, e, name, album }));

export const STICKERS: readonly Sticker[] = [
  ...S('zviratka', [
    ['🦁', 'lvíček'], ['🐯', 'tygřík'], ['🐼', 'panda'], ['🐨', 'koala'], ['🦊', 'liška'], ['🐸', 'žabka'],
    ['🐧', 'tučňák'], ['🦉', 'sovička'], ['🦄', 'jednorožec'], ['🐙', 'chobotnice'], ['🦋', 'motýlek'],
    ['🐞', 'beruška'], ['🐢', 'želvička'], ['🦒', 'žirafa'], ['🐘', 'slon'], ['🐬', 'delfín'], ['🦔', 'ježek'],
    ['🐿️', 'veverka'], ['🦖', 'tyranosaurus'], ['🐳', 'velryba'],
  ]),
  ...S('vesmir', [
    ['🚀', 'raketa'], ['🪐', 'planeta'], ['🌈', 'duha'], ['⭐', 'hvězda'], ['🌙', 'měsíc'], ['🌞', 'sluníčko'],
    ['🌻', 'slunečnice'], ['🍄', 'houba'], ['🌵', 'kaktus'], ['❄️', 'vločka'],
  ]),
  ...S('mlsani', [
    ['🍓', 'jahoda'], ['🍉', 'meloun'], ['🍦', 'zmrzlina'], ['🍩', 'kobliha'], ['🧁', 'dortík'], ['🍭', 'lízátko'],
    ['🍪', 'sušenka'], ['🍌', 'banán'], ['🥕', 'mrkev'], ['🍒', 'třešně'],
  ]),
  ...S('jezdime', [
    ['🚂', 'mašinka'], ['🚒', 'hasiči'], ['🚜', 'traktor'], ['🚁', 'vrtulník'], ['⛵', 'plachetnice'],
    ['🚲', 'kolo'], ['🏎️', 'závoďák'], ['🚌', 'autobus'], ['🛸', 'létající talíř'], ['🚑', 'sanitka'],
  ]),
  ...S('pohadky', [
    ['🏰', 'hrad'], ['👑', 'koruna'], ['🧚', 'víla'], ['🧙', 'čaroděj'], ['🐉', 'drak'], ['🤖', 'robot'],
    ['🎈', 'balónek'], ['🎁', 'dárek'], ['🧸', 'medvídek'], ['🎨', 'barvičky'], ['⚽', 'míč'], ['🎸', 'kytara'],
    ['🥁', 'buben'], ['🏆', 'pohár'], ['🎪', 'cirkus'],
  ]),
];

export const STICKER_BY_ID = new Map(STICKERS.map((s) => [s.id, s]));
