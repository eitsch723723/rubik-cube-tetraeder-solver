# Verbleibende Issues nach P0/P1-Release

Diese Punkte wurden bewusst nicht als Teil der P0/P1-Korrekturen umgesetzt und sollen später erneut bewertet werden.

1. **P2 – Reduced Motion:** Die wiederholte Tetraeder-Zuganimation soll `prefers-reduced-motion` berücksichtigen.
2. **P2 – Energieverbrauch:** Die Tetraeder-Animation rendert während des Wartens fortlaufend SVG-Geometrie neu. Optimieren und bei `document.hidden` pausieren.
3. **P2 – Cube-Solver-Abhängigkeit:** `min2phase.js` wird weiterhin über jsDelivr von `@master` geladen. Auf festen Commit pinnen oder lokal ausliefern.
4. **P2 – Zusätzliche Tetraeder-Testabdeckung:** Die neue CI testet Hauptzüge, Spitzenzüge, Voll-Scramble, unmöglichen Zustand und Visual-Mapping. Zusätzlich wären weitere bekannte/randomisierte Sequenzen sinnvoll.
5. **P2 – Orientierungsmarker:** In der animierten 3D-Tetraederansicht permanente Orientierungsmarker für V/L/R/U ergänzen.
6. **P2 – Lösungsfortschritt speichern:** Tetraeder-Lösungsmodus und aktueller Schritt werden noch nicht in `localStorage` persistiert.
7. **P2 – GitHub-Pages-Re-Run:** Ein Re-Run des bestehenden `test-and-build`-Jobs erzeugt ein zweites Artifact namens `github-pages`. Der nachgelagerte `deploy-pages`-Job schlägt dann mit „Multiple artifacts named github-pages“ fehl. Der normale neue Push-/Workflow-Run funktioniert; für sichere Re-Runs sollte die Artifact-/Workflow-Strategie angepasst werden.
8. **P3 – Testbanner:** Den sichtbaren Hinweis „TESTVERSION“ nach Abschluss der Testphase entfernen.
9. **P3 – Dokumentationspflege:** README/Testbericht nach größeren Architekturänderungen kontinuierlich aktuell halten.

## Teststatus 2026-09-15

- P1-Regressionssuite erneut ausgeführt: Build, Syntaxprüfungen, Solver-Unit-Tests, Chromium und WebKit erfolgreich.
- Die oben aufgeführten P2-Punkte wurden im Code-Review erneut geprüft und sind weiterhin offen; sie dürfen nicht als bereits implementiert betrachtet werden.
