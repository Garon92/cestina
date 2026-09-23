/**
 * Rýmové skupiny – slova ve skupině se opravdu rýmují (stejně znějí od poslední přízvučné části,
 * včetně délky samohlásky), každé má jednoznačný obrázek. Slova z různých skupin se nerýmují.
 */
export interface RhymeWord {
  w: string;
  e: string;
}

const R = (...pairs: [string, string][]): RhymeWord[] => pairs.map(([w, e]) => ({ w, e }));

export const RHYME_GROUPS: readonly RhymeWord[][] = [
  R(['rak', '🦞'], ['drak', '🐉'], ['mrak', '☁️'], ['vlak', '🚂']),
  R(['led', '🧊'], ['med', '🍯']),
  R(['klíč', '🔑'], ['míč', '⚽']),
  R(['kost', '🦴'], ['most', '🌉']),
  R(['kráva', '🐄'], ['tráva', '🌿']),
  R(['voda', '💧'], ['jahoda', '🍓']),
  R(['opice', '🐒'], ['čepice', '🧢'], ['slepice', '🐔']),
  R(['raketa', '🚀'], ['planeta', '🪐'], ['trumpeta', '🎺'], ['kometa', '☄️']),
  R(['hruška', '🍐'], ['muška', '🪰']),
  R(['myška', '🐭'], ['liška', '🦊']),
  R(['balón', '🎈'], ['citrón', '🍋']),
  R(['čaj', '🍵'], ['tramvaj', '🚋']),
  R(['pták', '🐦'], ['sněhulák', '⛄'], ['tučňák', '🐧']),
  R(['had', '🐍'], ['hrad', '🏰']),
  R(['banán', '🍌'], ['tulipán', '🌷']),
  R(['bota', '👢'], ['nota', '🎵']),
  R(['vajíčko', '🥚'], ['sluníčko', '🌞'], ['srdíčko', '💖']),
  R(['sýr', '🧀'], ['netopýr', '🦇']),
  R(['slon', '🐘'], ['zvon', '🔔']),
  R(['pes', '🐶'], ['les', '🌲']),
  R(['klobouk', '🎩'], ['pavouk', '🕷️'], ['brouk', '🪲']),
  R(['mrkev', '🥕'], ['broskev', '🍑']),
  R(['kluk', '👦'], ['luk', '🏹']),
  R(['dárek', '🎁'], ['párek', '🌭']),
];
