import { h, type SettingsSection } from '../kit';
import { getAppSettings, setAppSettings } from './store';
import type { LetterCase } from './text';

/**
 * Sekce čeština v kitovém dialogu nastavení (⚙): písmo a barevné slabiky. Zvuky, Předčítání, Vzhled,
 * Animace a jméno dodá kit; dlouhé nastavení pro rodiče je za řádkem „Další nastavení…“ (C-11).
 */
const extra = () => {
  const s = getAppSettings();
  const caseBtn = (v: LetterCase, label: string, show: string) =>
    h(
      'button',
      {
        type: 'button',
        'aria-pressed': String(s.letterCase === v),
        'aria-label': label,
        class: v === 'script' ? 'script' : '',
        style: `font-weight:${v === 'script' ? 400 : 900};font-size:1.2rem;min-width:52px`,
        onclick: (e: Event) => {
          setAppSettings({ letterCase: v });
          const group = (e.currentTarget as HTMLElement).parentElement!;
          for (const b of group.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === e.currentTarget));
        },
      },
      show,
    );
  const syl = h('input', { type: 'checkbox', class: 'g92-toggle', role: 'switch', id: 'cz-syl' }) as HTMLInputElement;
  syl.checked = s.syllableColors;
  syl.addEventListener('change', () => setAppSettings({ syllableColors: syl.checked }));
  return h(
    'div',
    { class: 'g92-stack', style: '--g92-gap: var(--g92-space-4)' },
    h(
      'div',
      { class: 'g92-field' },
      h('span', { class: 'g92-label' }, 'Písmo'),
      h(
        'div',
        { class: 'g92-segmented', role: 'group', 'aria-label': 'Písmo' },
        caseBtn('upper', 'Velká tiskací', 'A'),
        caseBtn('lower', 'Malá tiskací', 'a'),
        caseBtn('script', 'Psací', 'a'),
      ),
    ),
    h('label', { class: 'g92-switch-row', for: 'cz-syl' }, h('span', { class: 'g92-label' }, 'Barevné slabiky'), syl),
  );
};

export const CESTINA_SETTINGS: SettingsSection = {
  extra,
  // Jméno patří dítěti v této aplikaci – angličtina ho nepřepíše (C-08).
  nameMode: 'app',
  showVoice: true,
  more: { label: 'Další nastavení pro rodiče…', href: '#/nastaveni' },
};
