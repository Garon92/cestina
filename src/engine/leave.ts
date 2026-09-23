import { confirmLeave as kitConfirmLeave, guardLeave } from '../kit';
import { setHashGuard } from '../lib/router';

const MESSAGE = 'Rozdělané cvičení se neuloží. Hvězdičky a nálepka jsou až na konci.';

/** „Skončit cvičení?“ – kitový dialog (Zůstat je výchozí, Odejít), pro 🏠 a Zpět v prohlížeči. */
export function confirmLeave(): Promise<boolean> {
  return kitConfirmLeave({ title: 'Skončit cvičení?', message: MESSAGE });
}

/**
 * Hlídání rozehraného cvičení (kit v0.7, C-01 / CESTINA-11):
 * - „Menu“ v liště → kit `g92-back` → „Odejít do menu?“,
 * - Zpět v prohlížeči / na Androidu uvnitř aplikace → náš hash router → „Skončit cvičení?“,
 * - zavření / obnovení stránky → dotaz prohlížeče.
 * Vrací funkci, která hlídání zruší.
 */
export function guardSession(): () => void {
  const offKit = guardLeave({ isActive: () => true, message: MESSAGE });
  const offHash = setHashGuard(() => confirmLeave());
  return () => {
    offKit();
    offHash();
  };
}
