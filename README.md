# Rubik Cube + Tetraeder Solver

Kindgerechte Web-App zum Lösen eines 3×3 Rubik Cube und eines Rubik Tetraeders (Pyraminx). Dieses Repository bleibt bewusst vom ursprünglichen Repository `rubik-cube-solver` getrennt; dessen veröffentlichter Stand wird durch Änderungen hier nicht verändert.

## Aufbau

- `index.html` startet mit der Auswahl zwischen **Rubik Cube** und **Rubik Tetraeder**.
- Der Rubik-Cube-Löser wird beim CI-Build aus einem festgelegten Commit des ursprünglichen Repositorys nach `./cube/` übernommen. Er wird lokal innerhalb dieser GitHub-Pages-App geöffnet; es wird kein iframe verwendet.
- Der Cube-Solver `min2phase.js` wird beim Build auf den unveränderlichen Upstream-Commit `0ba83a6177d816f72af1a45c9015349da597456a` gepinnt. Der Build bricht ab, wenn die erwartete Quelle nicht mehr eindeutig patchbar ist.
- Der Tetraeder-Löser läuft direkt in der Root-App. Eingabe, Solver-State, Textanweisung und Animation verwenden dieselbe Move-Engine.
- Die App ist als PWA für GitHub Pages ausgelegt und verwendet relative Pfade, Manifest, Icons und Service Worker.

## Tetraeder-Solver

Unterstützt werden die vier Hauptzüge `U/R/L/B`, ihre Gegenrichtungen sowie die unabhängigen kleinen Spitzen `u/r/l/b`. Vor der Anzeige wird jede berechnete Lösung mit derselben internen Move-Engine erneut vollständig ausgeführt und verifiziert.

Weitere Sicherheits- und UX-Funktionen:

- Erkennung ungültiger bzw. physikalisch nicht erreichbarer Zustände.
- Permanente Orientierungsmarker `V`, `L`, `R`, `U` in der 3D-Ansicht.
- Wiederholte Zuganimation bis zur Bestätigung; bei `prefers-reduced-motion` statische eindeutige Darstellung.
- Pause der Animation bei ausgeblendeter Seite.
- Speicherung und validierte Wiederherstellung des Lösungsfortschritts nach Reload.
- Responsive Layouts für iPhone-/iPad-Viewportgrößen einschließlich Safe Areas.
- Kompakte Tetraeder-Eingabeansicht für iPhone-Portrait, sodass Header, Flächenwahl, Eingabedreieck, Farbauswahl und Navigation ohne Seitenscrolling erreichbar bleiben.

## Tests und Qualitätssicherung

GitHub Actions baut die veröffentlichte Seite deterministisch und führt vor dem Deployment aus:

- JavaScript-Syntaxprüfungen für App, Worker und eingebetteten Cube-Löser.
- Tetraeder-Unit-Regressionen einschließlich bekannter Sequenzen, Hauptzügen, Spitzenzügen, unmöglichen Zuständen und 20 deterministischen Scrambles.
- Browser-E2E in Chromium und WebKit.
- Prüfungen auf exakte Animation/Move-Zuordnung, Reduced Motion, Hintergrund-Pause, Fortschrittswiederherstellung und unveränderliche Cube-Solver-Abhängigkeit.
- Mobile Viewport-Regressionen für iPhone 17 Pro Portrait mit reduziertem Safari-Viewport, iPhone Landscape sowie iPad Portrait/Landscape.
- Prüfung, dass kein `TESTVERSION`-Banner oder entsprechender Seitentitel mehr ausgeliefert wird.

Details und Abgrenzung zwischen automatisierten und realen Gerätetests stehen in [`TEST_REPORT.md`](./TEST_REPORT.md).

## GitHub Pages

Veröffentlichte App:

`https://eitsch723723.github.io/rubik-cube-tetraeder-solver/`

Der Workflow deployt nur, wenn Build und automatisierte Regressionstests erfolgreich sind. Pages-Artefakte erhalten pro Workflow-Attempt einen eindeutigen Namen, sodass auch Re-Runs desselben Runs sauber deploybar bleiben.

## Dokumentationspflege

README, `TEST_REPORT.md` und `REMAINING_ISSUES.md` werden bei Änderungen an Architektur, Solver-Verhalten, Testumfang oder Deployment-Mechanik im selben Release aktualisiert. Aussagen über reale Safari-/Gerätetests werden nur aufgenommen, wenn diese tatsächlich durchgeführt wurden.
