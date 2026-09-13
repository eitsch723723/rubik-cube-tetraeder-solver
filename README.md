# Rubik Cube + Tetraeder Solver – separate Testversion

Dieses Repository ist bewusst von `rubik-cube-solver` getrennt. Die veröffentlichte Cube-App wird nicht verändert.

## Verhalten

- `index.html` startet mit einer Puzzle-Auswahl.
- Beide Auswahlkarten zeigen echte, kontinuierlich rotierende 3D-SVG-Modelle.
- **Rubik Cube** öffnet die unveränderte produktive Cube-App unter `https://eitsch723723.github.io/rubik-cube-solver/`.
- **Rubik Tetraeder** öffnet die neue Tetraeder-Test-GUI innerhalb dieses Repositorys.
- Die Tetraeder-GUI ist initial wirklich ausgeblendet (`[hidden]{display:none!important}`), damit sie nicht unter der Auswahl erscheint.
- Die Eingabefläche ist ein echtes 9-Felder-SVG-Dreieck ohne schwarzen Unterbau.

## Tetraeder-Solver

Aktueller Testumfang: die vier Hauptzüge `U/R/L/B` und ihre Gegenrichtungen. Jede gefundene Lösung wird mit derselben internen Move-Engine erneut ausgeführt und verifiziert, bevor sie angezeigt wird. Separat verdrehte kleine Spitzen sind noch nicht Teil dieses Testumfangs.

## GitHub Pages

GitHub Pages ist für `main` / `/ (root)` aktiviert. Die Testversion wird veröffentlicht unter:

`https://eitsch723723.github.io/rubik-cube-tetraeder-solver/`

Veröffentlichung nach Aktivierung von GitHub Pages erneut angestoßen am 2026-09-13.
