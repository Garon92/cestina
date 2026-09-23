import { confirmDialog } from '../kit';

/** Zeptat se před odchodem z rozehraného cvičení (sdílí 🏠, Zpět v prohlížeči i „‹ Menu“ v liště). */
export function confirmLeave(): Promise<boolean> {
  return confirmDialog({
    title: 'Skončit cvičení?',
    message: 'Rozdělané cvičení se nedokončí. Hvězdičky a nálepka jsou až na konci.',
    confirmLabel: 'Ano, skončit',
    cancelLabel: 'Hrát dál',
    danger: true,
  });
}
