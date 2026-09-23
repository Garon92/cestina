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

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    if (location.hash === currentHash) return;
    currentHash = location.hash;
    current = parse();
    for (const fn of [...listeners]) fn();
    // Nová obrazovka začíná nahoře.
    window.scrollTo({ top: 0 });
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

export function navigate(path: string, opts: { replace?: boolean } = {}): void {
  const h = href(path);
  if (opts.replace) {
    history.replaceState(null, '', h);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else location.hash = h;
}
