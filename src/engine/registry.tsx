import { hledej, parovani, poslouchej, poznavani, zacina } from '../activities/letters';
import { pravda, vety } from '../activities/sentences';
import { ctiSlabiky, skladejSlabiky, slabiky } from '../activities/syllables';
import { obtahuj } from '../activities/trace';
import { ctiSlova, diktat, rymy, skladani, slova } from '../activities/words';
import { MIX_META, levelColor, planMix, type ActivityId, type SessionId } from './meta';
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

// ─── Míchanice ──────────────────────────────────────────────────────────────

export interface MixTask {
  id: ActivityId;
  task: unknown;
}

/** Míchanice: úlohy z různých cvičení (plán viz planMix). */
export const mix: ActivityDef<MixTask> = {
  meta: MIX_META,
  generate: (ctx) =>
    planMix(ctx.progress.activities, ctx.count, ctx.rng).flatMap((id) => {
      const [task] = REGISTRY[id].generate({ ...ctx, count: 1 });
      return task === undefined ? [] : [{ id, task }];
    }),
  Component: ({ task, api, index }) => {
    const inner = REGISTRY[task.id];
    const Comp = inner.Component;
    return (
      <div className="play-stage" style={{ ['--lvl' as string]: levelColor(task.id) }}>
        <Comp task={task.task} api={api} index={index} />
      </div>
    );
  },
  instruction: (t, mode) => REGISTRY[t.id].instruction(t.task, mode),
  prompt: (t, mode, prev) => {
    const inner = REGISTRY[t.id];
    if (prev && prev.id === t.id) return inner.prompt(t.task, mode, prev.task);
    return [inner.meta.intro, inner.prompt(t.task, mode, undefined)].filter(Boolean).join(' … ');
  },
  caption: (t, mode) => REGISTRY[t.id].caption?.(t.task, mode) ?? '',
  letterOf: (t) => REGISTRY[t.id].letterOf?.(t.task),
  review: (t) => REGISTRY[t.id].review(t.task),
};

export function sessionDef(id: SessionId): ActivityDef<unknown> {
  return id === 'mix' ? erase(mix) : REGISTRY[id];
}
