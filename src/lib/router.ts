/** Minimalistický hash router: #/, #/hra/poslouchej?pismeno=M, #/abeceda, … */
import { useSyncExternalStore } from 'react';

export interface Route {
  path: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const raw = typeof location === 'undefined' ? '' : location.hash.replace(/^#\/?/, '');
  const [p = '', q = ''] = raw.split('?');
  return { path: p.split('/').filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(q) };
}

let current = parse();
let currentHash = typeof location === 'undefined' ? '' : location.hash;
const listeners = new Set<() => void>();

// ─── Hlídání odchodu z rozehraného cvičení (tlačítko Zpět v prohlížeči / na Androidu) ───
type LeaveGuard = () => Promise<boolean>;
let guard: LeaveGuard | null = null;
let asking = false;

/** Dokud je nastavený, odchod přes historii (Zpět) se nejdřív zeptá. `null` = hlídání vypnout. */
export function setLeaveGuard(fn: LeaveGuard | null): void {
  guard = fn;
}

export function hasLeaveGuard(): boolean {
  return guard !== null;
}

function commit(): void {
  currentHash = location.hash;
  current = parse();
  for (const fn of [...listeners]) fn();
  // Nová obrazovka začíná nahoře.
  window.scrollTo({ top: 0 });
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    if (location.hash === currentHash) return;
    if (guard && !asking) {
      // Vrátit adresu zpět (nový záznam v historii) a zeptat se; při souhlasu odejít tam, kam dítě chtělo.
      const target = location.hash;
      const g = guard;
      history.pushState(null, '', currentHash || '#/');
      asking = true;
      void g().then((ok) => {
        asking = false;
        if (!ok) return;
        guard = null;
        history.replaceState(null, '', target || '#/');
        commit();
      });
      return;
    }
    commit();
  });
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

export function href(path: string): string {
  return `#/${path.replace(/^\/+/, '')}`;
}

export function navigate(path: string, opts: { replace?: boolean; force?: boolean } = {}): void {
  if (opts.force) guard = null;
  const h = href(path);
  if (opts.replace) {
    history.replaceState(null, '', h);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else location.hash = h;
}
