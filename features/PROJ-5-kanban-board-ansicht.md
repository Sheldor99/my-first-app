# PROJ-5: Kanban-Board-Ansicht pro Projekt

## Status: Architected
**Created:** 2026-09-21
**Last Updated:** 2026-09-21

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Aufgaben
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Aufgaben-Datenmodell, Status-Werte (`todo`/`in_progress`/`done`) und die bestehende Listen-Ansicht, die durch das Board ersetzt wird

## User Stories
- Als Team-Mitglied möchte ich alle Aufgaben eines Projekts in einem Kanban-Board sehen, damit ich den Fortschritt auf einen Blick erfasse.
- Als Team-Mitglied möchte ich eine Aufgabe per Drag & Drop in eine andere Spalte ziehen, damit sich ihr Status sofort ändert, ohne ein Dropdown-Menü öffnen zu müssen.
- Als Team-Mitglied möchte ich den Status weiterhin über eine Klick-Alternative ändern können, falls Drag & Drop auf meinem Gerät unpraktisch ist.
- Als Team-Mitglied möchte ich auf dem Handy durch die Spalten horizontal scrollen können, damit das Board auch auf kleinen Bildschirmen nutzbar bleibt.
- Als Team-Mitglied möchte ich beim Fehlschlagen einer Statusänderung eine klare Fehlermeldung sehen, damit ich weiß, dass meine Änderung nicht gespeichert wurde.

## Out of Scope
- Manuelle Reihenfolge/Sortierung innerhalb einer Spalte — Aufgaben bleiben automatisch nach Fälligkeitsdatum sortiert (kein neues `position`-Feld, keine Reorder-Logik)
- Separate Listen-Ansicht als Alternative zum Board — das Board ersetzt die Listen-Ansicht aus PROJ-4 vollständig, kein Umschalten zwischen beiden
- Spalten-spezifische „+"-Buttons — es bleibt bei einem einzigen globalen „Neue Aufgabe"-Button, neue Aufgaben starten immer bei „To Do"
- Leeres Spalten-Gerüst bei einem komplett aufgabenlosen Projekt — stattdessen der bestehende zentrierte Leer-Zustand aus PROJ-4
- Zusätzliche/konfigurierbare Spalten, eigene Status oder WIP-Limits — Non-Goal laut PRD, Status bleibt auf die drei bestehenden Werte aus PROJ-4 beschränkt
- Echtzeit-Synchronisation zwischen mehreren gleichzeitig geöffneten Boards — kein Realtime-Feature im MVP (konsistent mit dem Rest der App); Änderungen anderer Nutzer werden erst beim nächsten Laden sichtbar

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Board anzeigen
- [ ] Angenommen ein Team-Mitglied öffnet ein Projekt mit vorhandenen Aufgaben, wenn die Seite lädt, dann sieht es drei Spalten (To Do, In Progress, Done) mit den jeweiligen Aufgaben als Karten
- [ ] Angenommen ein Projekt hat noch keine Aufgaben, wenn die Seite lädt, dann erscheint der bestehende zentrierte Leer-Zustand mit „Erste Aufgabe anlegen"-Button anstelle des Boards
- [ ] Angenommen die Aufgaben sind geladen, wenn die Anzahl pro Spaltenüberschrift angezeigt wird, dann stimmt sie mit der tatsächlichen Anzahl der Karten in dieser Spalte überein

### Drag & Drop
- [ ] Angenommen eine Aufgabe befindet sich in Spalte „To Do", wenn ein Nutzer sie per Drag & Drop nach „In Progress" zieht, dann ändert sich ihr Status sofort sichtbar und wird in der Datenbank gespeichert
- [ ] Angenommen das Speichern nach einem Drag & Drop schlägt fehl (z. B. Netzwerkfehler), wenn der Fehler auftritt, dann springt die Karte zurück in ihre ursprüngliche Spalte und eine Fehlermeldung wird angezeigt
- [ ] Angenommen eine Karte wird innerhalb derselben Spalte losgelassen (kein Spaltenwechsel), wenn der Drag-Vorgang endet, dann ändert sich nichts an Status oder Reihenfolge

### Klick-Fallback
- [ ] Angenommen ein Nutzer bevorzugt keine Drag-&-Drop-Interaktion, wenn er die bestehende Status-Auswahl auf der Karte nutzt, dann funktioniert der Statuswechsel identisch wie in PROJ-4

### Responsive Verhalten
- [ ] Angenommen ein Nutzer öffnet das Board auf einem schmalen Bildschirm (z. B. 375px), wenn die Seite lädt, dann sind alle drei Spalten nebeneinander sichtbar und durch horizontales Scrollen erreichbar

### Aufgabe erstellen/bearbeiten/löschen
- [ ] Angenommen ein Nutzer klickt auf „Neue Aufgabe", wenn das Formular abgeschickt wird, dann erscheint die neue Aufgabe als Karte in der Spalte „To Do"
- [ ] Angenommen eine Aufgabe wird bearbeitet oder gelöscht, wenn die Aktion abgeschlossen ist, dann aktualisiert sich das Board entsprechend (Karte verschwindet bei Löschung, Änderungen erscheinen sofort auf der Karte)

## Edge Cases
- Zwei Nutzer haben das Board gleichzeitig geöffnet, einer verschiebt eine Karte → der andere sieht die Änderung erst nach dem nächsten Laden/Reload (kein Realtime)
- Nutzer bricht einen Drag-Vorgang ab (z. B. Escape-Taste oder Loslassen außerhalb einer Spalte) → Karte bleibt unverändert in der ursprünglichen Spalte
- Eine Aufgabe wird von einem anderen Nutzer gelöscht, während gerade ein Drag-Vorgang dafür läuft → kein Absturz; das Speichern schlägt fehl und zeigt dieselbe Fehlermeldung wie beim Netzwerkfehler-Fall
- Sehr viele Aufgaben in einer Spalte (z. B. 50+) → Spalte scrollt vertikal innerhalb ihres Bereichs, die Spaltenhöhe bleibt auf den sichtbaren Viewport begrenzt
- Drag & Drop auf einem Touch-Gerät (Tablet) → funktioniert wie auf Desktop, sofern vom Browser/der Bibliothek unterstützt; der bestehende Klick-Mechanismus bleibt als Fallback verfügbar

## Technical Requirements
- Security: Keine neuen Berechtigungen nötig — Statusänderungen laufen weiterhin über die bestehende RLS-Policy aus PROJ-4/PROJ-1 (jedes Team-Mitglied darf Aufgaben seines Teams bearbeiten)
- Validierung: Keine neuen Validierungsregeln, Status bleibt auf die drei bestehenden Werte (`todo`, `in_progress`, `done`) beschränkt

## Open Questions
_Keine offenen Fragen — im Interview geklärt._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kanban-Board ersetzt die Listen-Ansicht komplett statt einer umschaltbaren Zusatz-Ansicht | Weniger Komplexität, ein einziger Ort für den Aufgaben-Workflow, passt zum PRD-Ziel „ohne Onboarding-Aufwand" | 2026-09-21 |
| Drag & Drop mit Klick-Fallback statt nur Klick-Mechanismus | Klassisches Kanban-Gefühl im MVP, Barrierefreiheit/Mobile bleiben durch die bestehende Status-Auswahl auf der Karte abgedeckt | 2026-09-21 |
| Keine manuelle Reihenfolge innerhalb einer Spalte, automatische Sortierung nach Fälligkeitsdatum bleibt bestehen | Vermeidet ein neues DB-Feld (`position`) und zusätzliche Reorder-Logik; die bestehende Sortierung reicht für Teams dieser Größe (3–10 Personen) aus | 2026-09-21 |
| Horizontales Scrollen der Spalten auf Mobile statt Stapeln | Bekanntes, bewährtes Kanban-Mobile-Muster; erhält die Spalten-Metapher auch auf kleinen Bildschirmen | 2026-09-21 |
| Optimistisches Verschieben mit Rollback bei Fehler | Fühlt sich nativ an (Standard-UX für Kanban-Boards); Fehlerfall wird klar kommuniziert statt trägem Warten auf Serverbestätigung | 2026-09-21 |
| Ein globaler „Neue Aufgabe"-Button statt Button pro Spalte | Entspricht 1:1 dem bestehenden PROJ-4-Muster, kein zusätzlicher UI-Aufwand nötig | 2026-09-21 |
| Zentrierter Leer-Zustand statt leerem Spalten-Gerüst bei 0 Aufgaben | Konsistent mit dem bestehenden PROJ-4-Verhalten, klarer Call-to-Action statt eines leer wirkenden Boards | 2026-09-21 |
| Kein Realtime zwischen mehreren gleichzeitig geöffneten Boards | Konsistent mit dem Rest der App (keine Realtime-Subscriptions bisher); die Teamgröße macht Konflikte selten genug, um sie nicht im MVP zu lösen | 2026-09-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `@dnd-kit/core` + `@dnd-kit/sortable` für Drag & Drop statt Eigenbau oder `react-beautiful-dnd` | Aktiv gepflegt (im Gegensatz zu `react-beautiful-dnd`, das als deprecated gilt), eingebaute Touch- und Tastatur-Unterstützung deckt die Edge Cases „Touch-Gerät" und Barrierefreiheit ohne Zusatzaufwand ab | 2026-09-21 |
| Drop-Handler ruft denselben Update-Call auf, den `TaskCard`s bestehende Status-Auswahl bereits nutzt | Kein zweiter Code-Pfad für dieselbe Aktion (Status ändern); Karte wird lokal sofort verschoben (optimistisch) und bei einem Fehler des Updates zurückgesetzt | 2026-09-21 |
| Bestehende `ScrollArea`-Komponente (shadcn/ui) für horizontales Board-Scrollen und vertikales Spalten-Scrollen, kein neues Scroll-Paket | Component bereits installiert und im Projekt etabliert; vermeidet ein zusätzliches Abhängigkeit für dieselbe Aufgabe | 2026-09-21 |
| Kein neuer Backend-Code oder neue RLS-Policy | Drag & Drop löst denselben `UPDATE`-Aufruf auf `tasks.status` aus, der bereits durch die RLS-Policies aus PROJ-1/PROJ-4 abgesichert ist | 2026-09-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
Projekt-Detailseite
└── Kanban-Board (ersetzt die bisherige Aufgaben-Liste aus PROJ-4)
    ├── "Neue Aufgabe"-Button (oben, global — unverändert aus PROJ-4)
    ├── Spalte "To Do" (Überschrift zeigt Anzahl)
    │   └── Aufgaben-Karten (ziehbar, bestehende TaskCard-Optik + Status-Auswahl als Fallback)
    ├── Spalte "In Progress"
    │   └── Aufgaben-Karten (ziehbar)
    ├── Spalte "Done"
    │   └── Aufgaben-Karten (ziehbar)
    └── Leer-Zustand (ersetzt das gesamte Board, wenn das Projekt 0 Aufgaben hat — unverändert aus PROJ-4)
```
Auf schmalen Bildschirmen scrollt die Reihe der drei Spalten horizontal; jede einzelne Spalte scrollt bei vielen Karten zusätzlich vertikal innerhalb ihres eigenen Bereichs.

### Data Model (plain language)
Keine neue Tabelle, kein neues Feld. Die bereits vorhandene `status`-Spalte einer Aufgabe (aus PROJ-4) bleibt die einzige Quelle der Wahrheit — eine Karte in eine andere Spalte zu ziehen ist exakt dieselbe Aktion wie heute schon die Status-Auswahl auf der Karte zu benutzen, nur über Ziehen statt über ein Menü ausgelöst. Die Reihenfolge innerhalb einer Spalte wird nie gespeichert, sondern beim Anzeigen automatisch nach Fälligkeitsdatum berechnet (wie bisher).

### Tech Decisions
- Drag-and-drop läuft über eine kleine, spezialisierte Zusatzbibliothek statt selbstgebauter Logik — sie kümmert sich um die „Physik" des Ziehens (Mausverfolgung, Touch-Gesten, Loslassen erkennen) und unterstützt von Haus aus auch Tablets und Tastaturbedienung.
- Optimistisches Verschieben nutzt denselben Speicherweg wie die bestehende Status-Auswahl — die Karte springt beim Ziehen sofort in die neue Spalte, im Hintergrund läuft derselbe Speichervorgang wie bei einem Dropdown-Wechsel; schlägt er fehl, springt die Karte zurück und eine Fehlermeldung erscheint.
- Horizontales/vertikales Scrollen nutzt einen bereits im Projekt vorhandenen UI-Baustein — kein neues Paket nötig, nur eine neue Anordnung der Spalten nebeneinander statt untereinander.
- Kein Backend-Bedarf — reine Frontend-Änderung; die Berechtigungsprüfung, wer eine Aufgabe verschieben darf, existiert bereits vollständig aus PROJ-4/PROJ-1 und wird unverändert wiederverwendet.

### Dependencies
- `@dnd-kit/core` + `@dnd-kit/sortable` — Drag-and-Drop-Interaktion und Spalten-/Drop-Zonen-Erkennung. Keine weiteren neuen Pakete: alle UI-Bausteine (Karten, Scrollbereiche, Buttons) sind bereits installiert.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
