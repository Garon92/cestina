/**
 * Databanka slov. Každé slovo je spisovně, s diakritikou, malými písmeny (kromě víceslovných
 * spojení). Obrázek (emoji) má jen slovo, u kterého je obrázek jednoznačný – každé emoji je
 * v bance nanejvýš jednou, aby se v obrázkových úlohách nikdy nesešly dva stejné obrázky.
 */
import { splitLetters } from './alphabet';

export type CategoryId =
  | 'zvirata'
  | 'jidlo'
  | 'doma'
  | 'veci'
  | 'obleceni'
  | 'doprava'
  | 'priroda'
  | 'telo'
  | 'lide'
  | 'hudba'
  | 'mista';

export const CATEGORIES: Record<CategoryId, { label: string; icon: string }> = {
  zvirata: { label: 'Zvířata', icon: '🐾' },
  jidlo: { label: 'Jídlo', icon: '🍎' },
  doma: { label: 'Doma', icon: '🏠' },
  veci: { label: 'Věci a hračky', icon: '🎒' },
  obleceni: { label: 'Oblečení', icon: '👕' },
  doprava: { label: 'Doprava', icon: '🚗' },
  priroda: { label: 'Příroda', icon: '🌳' },
  telo: { label: 'Tělo', icon: '✋' },
  lide: { label: 'Lidé a pohádky', icon: '👪' },
  hudba: { label: 'Hudba a sport', icon: '🎵' },
  mista: { label: 'Místa', icon: '🏰' },
};

export interface Word {
  w: string;
  /** Emoji obrázek – prázdný řetězec = slovo bez obrázku. */
  e: string;
  cat: CategoryId;
  /** Počet písmen (ch = 1 písmeno). */
  len: number;
  /** 1 = krátké (do 4 písmen), 2 = střední (do 6), 3 = dlouhé. */
  level: 1 | 2 | 3;
}

type Raw = [word: string, emoji?: string];

const RAW: Record<CategoryId, Raw[]> = {
  zvirata: [
    ['pes', '🐶'], ['kočka', '🐱'], ['myš', '🐭'], ['králík', '🐰'], ['liška', '🦊'], ['medvěd', '🐻'],
    ['lev', '🦁'], ['tygr', '🐯'], ['slon', '🐘'], ['opice', '🐒'], ['žirafa', '🦒'], ['zebra', '🦓'],
    ['kůň', '🐴'], ['kráva', '🐄'], ['prase', '🐷'], ['ovce', '🐑'], ['koza', '🐐'], ['slepice', '🐔'],
    ['kohout', '🐓'], ['kuře', '🐤'], ['kachna', '🦆'], ['sova', '🦉'], ['orel', '🦅'], ['papoušek', '🦜'],
    ['tučňák', '🐧'], ['labuť', '🦢'], ['páv', '🦚'], ['ryba', '🐟'], ['žralok', '🦈'], ['velryba', '🐳'],
    ['delfín', '🐬'], ['chobotnice', '🐙'], ['krab', '🦀'], ['rak', '🦞'], ['šnek', '🐌'], ['motýl', '🦋'],
    ['včela', '🐝'], ['beruška', '🐞'], ['mravenec', '🐜'], ['pavouk', '🕷️'], ['had', '🐍'], ['žába', '🐸'],
    ['želva', '🐢'], ['krokodýl', '🐊'], ['ježek', '🦔'], ['netopýr', '🦇'], ['veverka', '🐿️'], ['jelen', '🦌'],
    ['velbloud', '🐫'], ['klokan', '🦘'], ['panda', '🐼'], ['koala', '🐨'], ['lama', '🦙'], ['hroch', '🦛'],
    ['nosorožec', '🦏'], ['vlk', '🐺'], ['bobr', '🦫'], ['tuleň', '🦭'], ['krocan', '🦃'], ['holub', '🕊️'],
    ['pták', '🐦'], ['gorila', '🦍'], ['plameňák', '🦩'], ['lenochod', '🦥'], ['mýval', '🦝'],
    ['dinosaurus', '🦕'], ['drak', '🐉'], ['jednorožec', '🦄'], ['moucha', '🪰'], ['komár', '🦟'],
    ['brouk', '🪲'], ['žížala', '🪱'],
    ['myška'], ['ptáček'], ['zajíc'], ['sob'], ['lachtan'], ['osel'], ['kozel'], ['datel'], ['vrabec'],
    ['vrána'], ['havran'], ['bažant'], ['koroptev'], ['špaček'], ['vlaštovka'], ['čáp'], ['krtek'],
    ['kobyla'], ['sysel'], ['tchoř'], ['losos'], ['sumec'], ['kapr'], ['hroznýš'], ['mořský koník'],
    ['kos'], ['jezevec'], ['sokol'], ['štika'], ['kotě'], ['štěně'], ['hříbě'], ['tele'],
  ],
  jidlo: [
    ['jablko', '🍎'], ['hruška', '🍐'], ['banán', '🍌'], ['jahoda', '🍓'], ['třešně', '🍒'], ['hrozny', '🍇'],
    ['citrón', '🍋'], ['pomeranč', '🍊'], ['meloun', '🍉'], ['ananas', '🍍'], ['broskev', '🍑'], ['kiwi', '🥝'],
    ['mrkev', '🥕'], ['rajče', '🍅'], ['okurka', '🥒'], ['paprika', '🫑'], ['kukuřice', '🌽'], ['brambora', '🥔'],
    ['cibule', '🧅'], ['česnek', '🧄'], ['houba', '🍄'], ['chléb', '🍞'], ['sýr', '🧀'], ['vejce', '🥚'],
    ['mléko', '🥛'], ['med', '🍯'], ['dort', '🎂'], ['polévka', '🍲'], ['zmrzlina', '🍦'], ['bonbón', '🍬'],
    ['lízátko', '🍭'], ['čokoláda', '🍫'], ['sušenka', '🍪'], ['koláč', '🥧'], ['palačinka', '🥞'],
    ['párek', '🌭'], ['hranolky', '🍟'], ['rýže', '🍚'], ['špagety', '🍝'], ['salát', '🥗'], ['máslo', '🧈'],
    ['sůl', '🧂'], ['čaj', '🍵'], ['kobliha', '🍩'], ['preclík', '🥨'], ['kokos', '🥥'], ['avokádo', '🥑'],
    ['kaštan', '🌰'], ['dýně', '🎃'],
    ['rohlík'], ['knedlík'], ['řízek'], ['špenát'], ['guláš'], ['limonáda'], ['marmeláda'], ['šlehačka'],
    ['zelí'], ['těstoviny'], ['buchta'], ['jogurt'], ['pudink'], ['tvaroh'], ['malina'], ['borůvka'],
    ['višeň'], ['perníček'], ['mák'], ['hrách'], ['oříšek'], ['kakao'], ['šťáva'], ['vánočka'],
  ],
  doma: [
    ['dům', '🏠'], ['postel', '🛏️'], ['židle', '🪑'], ['dveře', '🚪'], ['okno', '🪟'], ['klíč', '🔑'],
    ['žárovka', '💡'], ['budík', '⏰'], ['telefon', '📱'], ['televize', '📺'], ['počítač', '💻'],
    ['svíčka', '🕯️'], ['vana', '🛁'], ['sprcha', '🚿'], ['mýdlo', '🧼'], ['kartáček', '🪥'], ['koště', '🧹'],
    ['kbelík', '🪣'], ['lžíce', '🥄'], ['hodiny', '🕰️'], ['talíř', '🍽️'], ['zrcadlo', '🪞'], ['koš', '🗑️'],
    ['lampa'], ['lopata'], ['hřeben'], ['polštář'], ['peřina'], ['koberec'], ['sporák'], ['vysavač'],
    ['žehlička'], ['zásuvka'], ['komín'], ['hrnek'], ['stůl'], ['skříň'], ['kuchyně'], ['pokoj'], ['střecha'],
  ],
  veci: [
    ['kniha', '📖'], ['tužka', '✏️'], ['pastelka', '🖍️'], ['nůžky', '✂️'], ['batoh', '🎒'], ['deštník', '☂️'],
    ['dárek', '🎁'], ['balón', '🎈'], ['míč', '⚽'], ['kostka', '🎲'], ['medvídek', '🧸'], ['zvonek', '🔔'],
    ['sešit', '📓'], ['pravítko', '📏'], ['lupa', '🔍'], ['magnet', '🧲'], ['kladivo', '🔨'], ['pilka', '🪚'],
    ['šroubovák', '🪛'], ['fotoaparát', '📷'], ['dalekohled', '🔭'], ['dopis', '✉️'], ['noviny', '📰'],
    ['mapa', '🗺️'], ['vlajka', '🚩'], ['baterka', '🔦'], ['meč', '🗡️'], ['štít', '🛡️'], ['diamant', '💎'],
    ['tabule'], ['penál'], ['kružítko'], ['hrábě'], ['kolečko'], ['píšťalka'], ['ponožka'], ['tunel'],
    ['poklad'], ['trůn'], ['panenka'], ['kostky'], ['hračka'], ['guma'], ['lepidlo'], ['papír'],
  ],
  obleceni: [
    ['tričko', '👕'], ['kalhoty', '👖'], ['šaty', '👗'], ['bunda', '🧥'], ['ponožky', '🧦'], ['rukavice', '🧤'],
    ['šála', '🧣'], ['čepice', '🧢'], ['klobouk', '🎩'], ['boty', '👟'], ['brýle', '👓'], ['koruna', '👑'],
    ['plavky', '🩱'], ['kabelka', '👜'], ['prsten', '💍'],
    ['svetr'], ['mikina'], ['sukně'], ['pyžamo'], ['helma'], ['kšiltovka'], ['bačkory'],
  ],
  doprava: [
    ['auto', '🚗'], ['autobus', '🚌'], ['vlak', '🚂'], ['tramvaj', '🚋'], ['letadlo', '✈️'], ['loď', '🚢'],
    ['plachetnice', '⛵'], ['raketa', '🚀'], ['vrtulník', '🚁'], ['traktor', '🚜'], ['sanitka', '🚑'],
    ['taxík', '🚕'], ['motorka', '🏍️'], ['kolo', '🚲'], ['koloběžka', '🛴'], ['náklaďák', '🚚'],
    ['brusle', '⛸️'], ['lyže', '🎿'], ['sáňky', '🛷'], ['semafor', '🚦'], ['kotva', '⚓'],
    ['helikoptéra'], ['buldozer'], ['metro'], ['ponorka'], ['bagr'], ['kočárek'],
  ],
  priroda: [
    ['slunce', '☀️'], ['měsíc', '🌙'], ['hvězda', '⭐'], ['mrak', '☁️'], ['déšť', '🌧️'], ['duha', '🌈'],
    ['blesk', '⚡'], ['vločka', '❄️'], ['sněhulák', '⛄'], ['strom', '🌳'], ['tulipán', '🌷'], ['růže', '🌹'],
    ['slunečnice', '🌻'], ['kaktus', '🌵'], ['list', '🍁'], ['hora', '⛰️'], ['sopka', '🌋'], ['ostrov', '🏝️'],
    ['vlna', '🌊'], ['oheň', '🔥'], ['kámen', '🪨'], ['voda', '💧'], ['planeta', '🪐'], ['květina', '🌼'],
    ['mušle', '🐚'], ['tráva', '🌿'], ['vítr', '🌬️'], ['kometa', '☄️'], ['led', '🧊'], ['zeměkoule', '🌍'],
    ['les'], ['ves'], ['sníh'], ['potok'], ['jezero'], ['kopec'], ['jeskyně'], ['vodopád'], ['oceán'],
    ['skála'], ['louka'], ['pramen'], ['ledovec'], ['údolí'], ['poušť'], ['sluníčko'], ['řeka'], ['moře'],
    ['písek'], ['bláto'], ['rybník'], ['pole'], ['zahrada'], ['kytka'],
  ],
  telo: [
    ['oko', '👁️'], ['ucho', '👂'], ['nos', '👃'], ['pusa', '👄'], ['ruka', '✋'], ['noha', '🦵'], ['zub', '🦷'],
    ['srdce', '❤️'], ['mozek', '🧠'], ['kost', '🦴'], ['jazyk', '👅'],
    ['srdíčko'], ['hlava'], ['vlasy'], ['prst'], ['koleno'], ['loket'], ['bříško'], ['záda'], ['krk'],
  ],
  lide: [
    ['máma', '👩'], ['táta', '👨'], ['miminko', '👶'], ['babička', '👵'], ['děda', '👴'], ['kluk', '👦'],
    ['holka', '👧'], ['princezna', '👸'], ['princ', '🤴'], ['víla', '🧚'], ['čaroděj', '🧙'], ['klaun', '🤡'],
    ['robot', '🤖'], ['duch', '👻'], ['mimozemšťan', '👽'], ['anděl', '👼'],
    ['bratr'], ['sestra'], ['teta'], ['strýc'], ['kamarád'], ['paní'], ['pán'], ['král'], ['obr'],
    ['trpaslík'], ['rytíř'], ['pirát'], ['kouzelník'], ['doktor'], ['hasič'], ['kuchař'], ['učitel'],
  ],
  hudba: [
    ['buben', '🥁'], ['kytara', '🎸'], ['trumpeta', '🎺'], ['housle', '🎻'], ['klavír', '🎹'], ['pohár', '🏆'],
    ['medaile', '🏅'],
    ['flétna'], ['trubka'], ['bubny'], ['písnička'], ['fotbal'], ['tenis'], ['hokej'], ['branka'],
  ],
  mista: [
    ['hrad', '🏰'], ['stan', '⛺'], ['most', '🌉'], ['škola', '🏫'], ['kostel', '⛪'], ['věž', '🗼'],
    ['fontána', '⛲'], ['kolotoč', '🎠'],
    ['zámek'], ['palác'], ['maják'], ['studna'], ['brána'], ['divadlo'], ['houpačka'], ['klouzačka'],
    ['pískoviště'], ['prolézačka'], ['hřiště'], ['obchod'], ['zoo'], ['park'], ['město'], ['nádraží'],
  ],
};

function makeWord(w: string, e: string, cat: CategoryId): Word {
  const len = splitLetters(w.replace(/\s+/g, '')).length;
  const level: Word['level'] = len <= 4 ? 1 : len <= 6 ? 2 : 3;
  return { w, e, cat, len, level };
}

const seen = new Set<string>();
export const WORDS: readonly Word[] = (Object.keys(RAW) as CategoryId[]).flatMap((cat) =>
  RAW[cat]
    .filter(([w]) => {
      // Stejné slovo může být ve dvou kategoriích jen jednou (první výskyt vyhrává).
      if (seen.has(w)) return false;
      seen.add(w);
      return true;
    })
    .map(([w, e]) => makeWord(w, e ?? '', cat)),
);

/** Slova s obrázkem (pro obrázkové úlohy). */
export const PICTURE_WORDS: readonly Word[] = WORDS.filter((w) => w.e !== '');

/** Jednoslovná slova (pro skládání, diktát…). */
export const SINGLE_WORDS: readonly Word[] = WORDS.filter((w) => !/\s/.test(w.w));

const INDEX = new Map(WORDS.map((w) => [w.w, w]));
export function findWord(w: string): Word | undefined {
  return INDEX.get(w);
}

/** Emoji ke slovu, pokud ho máme (i ze skloňovaného tvaru se nic nehádá – jen přesná shoda). */
export function emojiFor(w: string): string {
  return INDEX.get(w)?.e ?? '';
}
