# Verbleibende Issues

## P2 – abgeschlossen am 2026-09-15

Die zuvor offenen P2-Punkte sind umgesetzt und werden durch die CI-Regressionssuite abgesichert:

1. **Reduced Motion – erledigt:** Die Tetraeder-Zuganimation berücksichtigt `prefers-reduced-motion` und zeigt bei reduzierter Bewegung einen statischen, eindeutig beschrifteten Zustand statt einer Dauerdrehung.
2. **Energieverbrauch – erledigt:** Die 3D-Ansicht baut ihre SVG-Sticker nicht mehr in jedem Frame neu auf. Nur betroffene Stickerpunkte werden aktualisiert; bei ausgeblendeter Seite (`document.hidden`) pausiert die Animation und wird beim Zurückkehren fortgesetzt.
3. **Cube-Solver-Abhängigkeit – erledigt:** `min2phase.js` wird im kombinierten Build auf den unveränderlichen Upstream-Commit `0ba83a6177d816f72af1a45c9015349da597456a` gepinnt. Der Build schlägt fehl, falls die erwartete Quelle nicht mehr patchbar ist.
4. **Zusätzliche Tetraeder-Testabdeckung – erledigt:** Neben den bekannten Referenzfällen werden mehrere feste Sequenzen und 20 deterministisch erzeugte Scrambles geprüft. Jede berechnete Lösung wird durch die interne Move-Engine erneut verifiziert.
5. **Orientierungsmarker – erledigt:** Die animierte 3D-Tetraederansicht zeigt permanent `V`, `L`, `R`, `U` direkt am Modell.
6. **Lösungsfortschritt – erledigt:** Lösungsmodus, Lösung und aktueller Schritt werden in `localStorage` gespeichert, vor Wiederherstellung erneut verifiziert und nach einem Reload fortgesetzt.
7. **GitHub-Pages-Re-Run – erledigt:** Pages-Artefakte verwenden pro Workflow-Attempt einen eindeutigen Namen (`github-pages-${{ github.run_attempt }}`), sodass ein Re-Run nicht mehr zwei gleichnamige Deploy-Artefakte erzeugt.

## Noch offen

1. **P3 – Testbanner:** Den sichtbaren Hinweis „TESTVERSION“ nach Abschluss der Testphase entfernen.
2. **P3 – Dokumentationspflege:** README/Testbericht nach größeren Architekturänderungen kontinuierlich aktuell halten.

## Testanforderung für den P2-Abschluss

Der P2-Status gilt nur als bestätigt, wenn der aktuelle `main`-Stand Build, Syntaxprüfungen, Solver-Unit-Tests, Chromium- und WebKit-E2E sowie den normalen Pages-Deploy erfolgreich durchläuft. Zusätzlich wird anschließend ein Re-Run desselben Workflow-Runs ausgeführt, um die neue Artifact-Strategie explizit zu verifizieren.
