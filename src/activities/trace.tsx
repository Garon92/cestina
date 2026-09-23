import { useRef } from 'react';
import { TraceCanvas, type TraceHandle } from '../components/TraceCanvas';
import { letterByKey } from '../data/alphabet';
import { genObtahuj, type ObtahujTask } from '../engine/generators';
import { ACTIVITY_BY_ID } from '../engine/meta';
import { defineActivity, type TaskApi } from '../engine/types';
import { recordTraced } from '../lib/progress';
import { say } from '../lib/speech';
import { updateProgress } from '../lib/store';
import { TOLERANCE } from '../lib/tracer';

function ObtahujView({ task, api }: { task: ObtahujTask; api: TaskApi }) {
  const ref = useRef<TraceHandle>(null);
  const l = letterByKey(task.letter);
  const tol = TOLERANCE[api.settings.traceTolerance];
  const mistakes = useRef(0);
  return (
    <div className="trace-layout">
      <TraceCanvas
        char={task.char}
        tol={tol}
        handleRef={ref}
        locked={api.solved}
        onMistake={(reason) => {
          if (reason === 'off') {
            mistakes.current++;
            // Dítě neumí číst – chybu mu řekneme nahlas a hned ukážeme, jak na to (CESTINA-07).
            api.mistake({ say: 'Kousek vedle. Zkus to znovu.' });
            window.setTimeout(() => ref.current?.demo(), 450);
          } else void say('Začni u zelené tečky.');
        }}
        onLift={() => void say('Pokračuj, kde jsi skončil.')}
        onComplete={() => {
          updateProgress((p) => recordTraced(p, task.letter, Date.now()));
          api.done({ say: `${l.say}. ${l.word}.` });
        }}
      />
      <div className="trace-side">
        <div className="trace-model" aria-hidden="true">
          <span className="trace-model-letter">{task.char}</span>
          <span className="trace-model-word">
            <span aria-hidden="true">{l.emoji}</span> {l.word}
          </span>
        </div>
        <button type="button" className="g92-btn g92-btn--soft g92-btn--lg" onClick={() => ref.current?.demo()}>
          <span aria-hidden="true">👆</span> Ukaž mi
        </button>
        <button type="button" className="g92-btn g92-btn--ghost g92-btn--lg" onClick={() => ref.current?.restart()}>
          <span aria-hidden="true">↺</span> Znovu
        </button>
      </div>
    </div>
  );
}

export const obtahuj = defineActivity<ObtahujTask>({
  meta: ACTIVITY_BY_ID.get('obtahuj')!,
  generate: genObtahuj,
  Component: ({ task, api }) => <ObtahujView task={task} api={api} />,
  // Psací tahy zatím nemáme – v psacím režimu se obtahuje tiskací písmenko a řekneme to (CESTINA-19).
  instruction: (t, mode) => (mode === 'script' ? `Obtáhni tiskací písmenko ${t.char}` : `Obtáhni písmenko ${t.char}`),
  prompt: (t) => letterByKey(t.letter).say,
  letterOf: (t) => t.letter,
  review: (t) => ({ label: t.char, say: letterByKey(t.letter).say }),
});
