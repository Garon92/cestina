export function VoiceHelp() {
  return (
    <div className="text-sm leading-relaxed flex flex-col gap-2">
      <p>Aplikace mluví hlasem, který je v zařízení. Když chybí český, stačí ho doinstalovat (zdarma):</p>
      <ul className="list-disc pl-5 flex flex-col gap-1">
        <li>
          <b>iPad / iPhone:</b> Nastavení → Přístupnost → Předčítaný obsah → Hlasy → Čeština (např. Zuzana, ideálně „vylepšená“).
        </li>
        <li>
          <b>Android:</b> Nastavení → Systém → Jazyky → Převod textu na řeč → Google → Nainstalovat hlasová data → Čeština.
        </li>
        <li>
          <b>Windows:</b> Nastavení → Čas a jazyk → Řeč → Přidat hlasy → Čeština. V prohlížeči Edge jsou české přirozené hlasy (Vlasta, Antonín) hned.
        </li>
        <li>
          <b>Mac:</b> Nastavení systému → Zpřístupnění → Předčítaný obsah → Systémový hlas → Spravovat hlasy → Čeština.
        </li>
        <li>
          <b>Chrome na počítači</b> má hlas „Google čeština“ (potřebuje internet).
        </li>
      </ul>
      <p>Po instalaci stránku obnovte. Bez hlasu aplikace funguje dál – co by řekla, ukáže jako titulek.</p>
    </div>
  );
}
