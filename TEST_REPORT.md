# Testbericht

Stand: 2026-09-15

Dieser Bericht beschreibt den automatisierten Testumfang des kombinierten Rubik-Cube-/Tetraeder-Solvers. Er unterscheidet ausdrücklich zwischen Code-Review, automatisierten Browser-/Unit-Tests und realen Geräte-/Safari-Tests.

## Automatisierte Tests

Der GitHub-Actions-Workflow erstellt vor dem Deployment ein deterministisches GitHub-Pages-Artefakt. Dabei wird der Rubik-Cube-Stand aus dem festgelegten Quell-Commit eingebettet und die `min2phase.js`-Abhängigkeit auf den unveränderlichen Commit `0ba83a6177d816f72af1a45c9015349da597456a` gepinnt.

### Syntax und Build

- JavaScript-Syntaxprüfung für Root-App, Feature-Module, Tetraeder-Core, Tetraeder-Worker, Visualisierung und Service Worker.
- JavaScript-Syntaxprüfung für den erzeugten lokalen Cube-Löser und dessen Worker.
- Build-Abbruch, falls die erwartete Cube-Solver-Quelle nicht eindeutig auf die gepinnte Version umgestellt werden kann.

### Tetraeder-Unit-Regression

- bekannte Referenzsequenz,
- vollständige Hauptzug-Sequenz,
- unabhängige Spitzendrehung,
- inverse Zugbeziehungen,
- physikalisch nicht erreichbarer Zustand,
- 20 deterministisch erzeugte Scrambles,
- erneute Ausführung und Verifikation jeder berechneten Lösung mit derselben internen Move-Engine.

Der zuletzt bestätigte P2-Lauf meldete: `known=4`, `full=11`, `tip=1`, `deterministicRandom=20`.

### Browser-E2E

Die E2E-Suite wird jeweils in Chromium und WebKit ausgeführt. Geprüft werden unter anderem:

- Puzzle-Auswahl und lokaler Wechsel zum eingebetteten Cube-Löser,
- Rückkehr zur Puzzle-Auswahl,
- Tetraeder-Schnelltest und vollständiger Test inklusive unabhängiger Spitzenzüge,
- Ablehnung unmöglicher Tetraederzustände,
- exakte Zuordnung zwischen Solver-Move und animierter Ebene,
- permanente Orientierungsmarker `V`, `L`, `R`, `U`,
- Reduced Motion,
- Pause/Fortsetzung der Animation bei ausgeblendeter Seite,
- Speicherung und validierte Wiederherstellung des Lösungsfortschritts,
- unveränderliche `min2phase.js`-Pinnung im erzeugten Pages-Build,
- Tetraeder-Eingabe auf einem iPhone-17-Pro-Portrait-Viewport mit 402 px Breite und bewusst auf 740 px reduziertem nutzbaren Safari-Höhenbereich: kein Seitenscrolling, alle wesentlichen Bedienelemente vollständig im Viewport und ausreichend große Dreiecks-Eingabe,
- iPhone-Landscape-Lösungsansicht ohne unerwünschtes Seitenscrolling,
- iPad Portrait und Landscape,
- Release-Oberfläche ohne `TESTVERSION`-Banner und ohne „Testversion“ im Seitentitel.

Die iPhone-17-Pro-Portrait-Regressionsprüfung verwendet absichtlich weniger als die volle Gerätehöhe, um die durch Safari-Adress-/Toolbar belegte Fläche konservativ zu berücksichtigen. Sie ist trotzdem eine automatisierte Viewport-Simulation und kein physischer Gerätetest.

## Deployment-Test

GitHub Pages wird nur nach erfolgreichem Build und erfolgreicher Regression deployed. Für denselben Workflow-Run wurde zusätzlich ein Re-Run getestet: Der zweite Versuch verwendete erfolgreich ein separates Artifact (`github-pages-2`) und deployte denselben Commit. Dadurch ist die Re-Run-Strategie praktisch verifiziert.

## Code-Review

Bei Änderungen werden insbesondere folgende Kopplungen geprüft:

- Solver-Move ↔ interner Cube-/Tetraeder-State,
- Move ↔ Textanweisung,
- Move ↔ betroffene Ebene und Drehrichtung der Animation,
- State nach Bestätigung ↔ dargestellte Sticker,
- relative Pfade, Service-Worker-Cache und GitHub-Pages-Unterpfad,
- Safe Areas und dynamische Viewports nach Layoutänderungen.

## Nicht durchgeführt

Für den hier dokumentierten Stand wurde **kein realer Browser-/Gerätetest auf einem physischen iPhone oder iPad** durchgeführt. WebKit-Tests und emulierte Viewportgrößen sind eine automatisierte Regression, aber kein Ersatz für einen realen Safari-Gerätetest.

Reale Gerätetests dürfen in diesem Bericht erst als bestanden markiert werden, wenn sie tatsächlich durchgeführt wurden.

## Veröffentlichung

GitHub Pages:

`https://eitsch723723.github.io/rubik-cube-tetraeder-solver/`
