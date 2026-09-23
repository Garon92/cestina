import { useState } from 'react';
import { ChoiceGrid } from '../components/ChoiceGrid';
import { SpeakButton, scriptClass } from '../components/ui';
import { genPravda, genVety, type PravdaTask, type VetyTask } from '../engine/generators';
import { ACTIVITY_BY_ID } from '../engine/meta';
import { defineActivity, type TaskApi } from '../engine/types';
import { caseSentence } from '../lib/text';

// ─── Doplň slovo ──────────────────────────────────────────────────────────

function VetyView({ task, api }: { task: VetyTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  const [filled, setFilled] = useState(false);
  const [before = '', after = ''] = task.sentence.s.split('___');
  const withGap = task.sentence.s.replace('___', '…');
  return (
    <>
      <div className="flex items-center gap-3 max-w-[44rem]">
        <p className={`prompt-sentence ${script}`}>
          {caseSentence(before, api.mode)}
          <span className={`blank ${filled ? 'is-filled' : ''}`}>{filled ? caseSentence(task.sentence.a, api.mode) : '____'}</span>
          {caseSentence(after, api.mode)}
        </p>
      </div>
      <SpeakButton text={filled ? task.sentence.s.replace('___', task.sentence.a) : withGap} size={56} soft label="Přečíst větu" />
      <ChoiceGrid
        api={api}
        variant="word"
        cols={task.options.length === 3 ? 3 : 2}
        answer={task.sentence.a}
        onCorrect={() => setFilled(true)}
        sayOnCorrect={task.sentence.s.replace('___', task.sentence.a)}
        sayOnWrong={(id) => `${task.sentence.s.replace('___', id)} … To ne!`}
        options={task.options.map((o) => ({ id: o, label: o, className: script, content: caseSentence(o, api.mode) }))}
      />
    </>
  );
}

export const vety = defineActivity<VetyTask>({
  meta: ACTIVITY_BY_ID.get('vety')!,
  generate: genVety,
  Component: ({ task, api }) => <VetyView task={task} api={api} />,
  instruction: () => 'Které slovo do věty patří?',
  prompt: (t) => t.sentence.s,
  caption: (t) => t.sentence.s.replace('___', '…'),
  review: (t) => ({ label: t.sentence.s.replace('___', t.sentence.a), say: t.sentence.s.replace('___', t.sentence.a) }),
});

// ─── Pravda, nebo ne? ─────────────────────────────────────────────────────

function PravdaView({ task, api }: { task: PravdaTask; api: TaskApi }) {
  const script = scriptClass(api.mode);
  const s = task.statement;
  return (
    <>
      {s.e ? (
        <div className="prompt-emoji" aria-hidden="true" style={{ fontSize: 'clamp(3.5rem, 15vmin, 6rem)' }}>
          {s.e}
        </div>
      ) : null}
      <p className={`prompt-sentence ${script}`} style={{ maxWidth: '40rem' }}>
        {caseSentence(s.s, api.mode)}
      </p>
      <SpeakButton text={s.s} size={56} soft label="Přečíst větu" />
      <ChoiceGrid
        api={api}
        variant="word"
        cols={2}
        answer={s.t ? 'ano' : 'ne'}
        sayOnCorrect={s.t ? 'Ano, to je pravda.' : 'Správně, to není pravda!'}
        sayOnWrong={() => 'Hmm. Přečti si to ještě jednou.'}
        options={[
          {
            id: 'ano',
            label: 'Pravda',
            content: (
              <>
                <span style={{ fontSize: '2.6rem' }} aria-hidden="true">
                  👍
                </span>
                <span>Pravda</span>
              </>
            ),
          },
          {
            id: 'ne',
            label: 'Není pravda',
            content: (
              <>
                <span style={{ fontSize: '2.6rem' }} aria-hidden="true">
                  👎
                </span>
                <span>Není pravda</span>
              </>
            ),
          },
        ]}
      />
    </>
  );
}

export const pravda = defineActivity<PravdaTask>({
  meta: ACTIVITY_BY_ID.get('pravda')!,
  generate: genPravda,
  Component: ({ task, api }) => <PravdaView task={task} api={api} />,
  instruction: () => 'Přečti větu. Je to pravda?',
  prompt: () => '',
  review: (t) => ({ label: `${t.statement.s} ${t.statement.t ? '👍' : '👎'}`, say: t.statement.s, emoji: t.statement.e }),
});
