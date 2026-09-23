import { hledej, parovani, poslouchej, poznavani, zacina } from '../activities/letters';
import { pravda, vety } from '../activities/sentences';
import { ctiSlabiky, skladejSlabiky, slabiky } from '../activities/syllables';
import { obtahuj } from '../activities/trace';
import { ctiSlova, diktat, rymy, skladani, slova } from '../activities/words';
import type { ActivityId } from './meta';
import type { ActivityDef } from './types';

const erase = <T,>(d: ActivityDef<T>) => d as unknown as ActivityDef<unknown>;

export const REGISTRY: Record<ActivityId, ActivityDef<unknown>> = {
  poznavani: erase(poznavani),
  parovani: erase(parovani),
  poslouchej: erase(poslouchej),
  hledej: erase(hledej),
  zacina: erase(zacina),
  obtahuj: erase(obtahuj),
  slabiky: erase(slabiky),
  'cti-slabiky': erase(ctiSlabiky),
  'skladej-slabiky': erase(skladejSlabiky),
  'cti-slova': erase(ctiSlova),
  slova: erase(slova),
  skladani: erase(skladani),
  diktat: erase(diktat),
  rymy: erase(rymy),
  vety: erase(vety),
  pravda: erase(pravda),
};
