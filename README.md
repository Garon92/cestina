# Čeština pro Adámka

Hravé procvičování čtení a psaní pro malé čtenáře – od písmenek přes slabiky a slova až k větám.
Aplikace mluví česky (Web Speech API), ukazuje obrázky místo textu, kde to jde, a odměňuje hvězdičkami
a nálepkami. Běží na tabletu, telefonu i počítači a funguje i offline (PWA).

**Web:** <https://garon92.github.io/cestina/>

## Co v ní je

| úroveň | cvičení |
|---|---|
| 🔤 Písmenka | Poslouchej · Velké a malé · Párování · Hledej písmenko · Na co začíná? · Obtahuj (psaní prstem) |
| 🧩 Slabiky | Slyšíš slabiku? · Čti po slabikách · Slož ze slabik |
| 📖 Slova | Co je napsáno? · Velká a malá slova · Skládání · Rýmy · Diktát (klávesnice s háčky a čárkami) |
| 📝 Věty | Pravda, nebo ne? · Doplň slovo |

K tomu **Míchanice** 🎲 (úlohy z různých cvičení podle toho, kde dítě zrovna je), **Abeceda** (všech 42 písmen s výslovností a obrázkem), **Piš a poslouchej** (napiš cokoli a aplikace to
přečte, historie 10 textů, klávesy 1–0), **album nálepek**, přehled **Co už umím** (postup po písmenech) a
**nastavení pro rodiče** (hlas, rychlost řeči, délka cvičení, výběr procvičovaných písmen, tolerance obtahování).

- Písmo: VELKÁ TISKACÍ / malá tiskací / psací (font Playwrite CZ) – přepínač je v každém cvičení.
- Každé cvičení = sezení o 5–15 úlohách → hvězdičky (1–3), nálepka, přehled chyb s poslechem.
- Adaptivní výběr: častěji písmena, ve kterých dítě chybuje; písmeno je „umím“, když aspoň 80 % z posledních (min. 5) pokusů bylo správně napoprvé.
- Bez českého hlasu aplikace funguje dál a ukazuje titulky (co by řekla), s návodem, jak hlas doinstalovat.

## Vývoj

```bash
npm install
npm run dev        # http://localhost:5172/cestina/
npm run typecheck
npm test           # Vitest: data, slabikování, generátory úloh, postup, obtahování
npm run build      # → dist/
npm run preview
```

Stack: Vite + React 19 + TypeScript (strict) + Tailwind 4 + vite-plugin-pwa, sdílený design systém **g92 kit**
(`src/kit/` – vendorovaná kopie z repozitáře `menu`, needitovat; aktualizace `bash ../menu/kit/sync.sh cestina`).

```
src/
  data/        abeceda, slova (s obrázky), věty, rýmy, nálepky, tahy písmen pro obtahování
  lib/         řeč (TTS), slabikování, vyhodnocení obtahování, postup, úložiště, router
  engine/      popis aktivit, generátory úloh, sezení a výsledky
  activities/  jednotlivá cvičení (React)
  screens/     domů, abeceda, nálepky, co už umím, nastavení, piš a poslouchej
  components/  sdílené prvky (dlaždice odpovědí, skládání, plátno na obtahování…)
tests/         Vitest
```

Postup se ukládá do `localStorage` pod klíči `g92:cestina:*` (postup ze staré verze – `cestina_progress`,
`cestina_recent_texts` – se při prvním spuštění převede). Staré adresy (`abeceda.html`, `psani.html`…) přesměrují
na nová místa.

Nasazení: GitHub Actions (`.github/workflows/deploy.yml`) – build a publikace na GitHub Pages při pushi do `main`.
