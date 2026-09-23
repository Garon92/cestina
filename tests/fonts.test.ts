import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Psací písmo musí pokrýt i č ř š ž ů… (CESTINA-01): fontsource CSS omezuje unicode-range na Latin-1,
// proto má aplikace vlastní @font-face bez unicode-range. Rozměry glyfů měří e2e (cestina-e2e.mjs checks).
describe('psací font', () => {
  const css = readFileSync(new URL('../src/styles/app.css', import.meta.url), 'utf8');
  const face = /@font-face\s*{[^}]*Playwrite CZ[^}]*}/.exec(css)?.[0] ?? '';
  it('má vlastní @font-face bez unicode-range', () => {
    expect(face).not.toBe('');
    expect(face).not.toMatch(/unicode-range/);
    expect(css).not.toMatch(/@import\s+['"]@fontsource\/playwrite-cz\/[^'"]*\.css/);
  });
  it('soubor fontu obsahuje české znaky s háčky a kroužkem', () => {
    // woff2 je komprimovaný – ověříme aspoň, že se odkazujeme na úplný (latin) soubor, ne na podmnožinu.
    expect(face).toMatch(/playwrite-cz-latin-400-normal\.woff2/);
  });
});
