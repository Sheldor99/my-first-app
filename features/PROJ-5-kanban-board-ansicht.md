# PROJ-5: Kanban-Board-Ansicht pro Projekt

## Status: Deployed
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
| `@dnd-kit/core` + `@dnd-kit/utilities` für Drag & Drop statt Eigenbau, `react-beautiful-dnd` oder `@dnd-kit/sortable` | Aktiv gepflegt (im Gegensatz zu `react-beautiful-dnd`, das als deprecated gilt), eingebaute Touch- und Tastatur-Unterstützung deckt die Edge Cases „Touch-Gerät" und Barrierefreiheit ab. `@dnd-kit/sortable` wurde bewusst weggelassen — es ist für Neuanordnung *innerhalb* einer Liste gedacht, aber Spalten sind hier nur Drop-Ziele ohne gespeicherte Position (siehe Out-of-Scope-Entscheidung „keine manuelle Reihenfolge"); `@dnd-kit/core`s einfachere `useDraggable`/`useDroppable`-Primitive reichen aus. | 2026-09-21 |
| Drop-Handler ruft denselben Update-Call auf, den `TaskCard`s bestehende Status-Auswahl bereits nutzt | Kein zweiter Code-Pfad für dieselbe Aktion (Status ändern); Karte wird lokal sofort verschoben (optimistisch) und bei einem Fehler des Updates zurückgesetzt | 2026-09-21 |
| Bestehende `ScrollArea`-Komponente (shadcn/ui) für horizontales Board-Scrollen und vertikales Spalten-Scrollen, kein neues Scroll-Paket | Component bereits installiert und im Projekt etabliert; vermeidet ein zusätzliches Abhängigkeit für dieselbe Aufgabe | 2026-09-21 |
| Kein neuer Backend-Code oder neue RLS-Policy | Drag & Drop löst denselben `UPDATE`-Aufruf auf `tasks.status` aus, der bereits durch die RLS-Policies aus PROJ-1/PROJ-4 abgesichert ist | 2026-09-21 |
| Kollisionserkennung `pointerWithin` statt `closestCenter` | Während der Implementierung festgestellt: `closestCenter` wählt immer die nächstgelegene Spalte per Mittelpunkt-Distanz, auch wenn beim Loslassen außerhalb jeder Spalte losgelassen wird — das widerspricht der Edge-Case-Vorgabe „Loslassen außerhalb einer Spalte → keine Änderung". `pointerWithin` erkennt eine Spalte nur als Ziel, wenn der Mauszeiger tatsächlich darüber ist, sonst bleibt die Aufgabe unverändert | 2026-09-21 |

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
- `@dnd-kit/core` + `@dnd-kit/utilities` — Drag-and-Drop-Interaktion und Spalten-/Drop-Zonen-Erkennung. Keine weiteren neuen Pakete: alle UI-Bausteine (Karten, Scrollbereiche, Buttons) sind bereits installiert.

## Frontend Implementation Notes

`TaskList`/`task-list.tsx` aus PROJ-4 vollständig durch `TaskBoard`/`task-board.tsx` ersetzt (Datei gelöscht, alle Importe aktualisiert). Neue Komponenten in `src/components/tasks/`:

- **`task-board.tsx`** (ersetzt `task-list.tsx`): lädt Aufgaben, gruppiert/sortiert sie wie bisher, rendert die drei Spalten in einer `ScrollArea` (horizontal), enthält `DndContext` mit `pointerWithin`-Kollisionserkennung, `PointerSensor` (Aktivierung erst ab 8px Bewegung, damit Klicks auf Select/Menü nicht versehentlich einen Drag auslösen) und `TouchSensor` (150ms Verzögerung für Touch-Geräte). `updateTaskStatus()` ist die einzige Stelle, die den Status in der DB ändert — optimistisches Update, Rollback + Toast-Fehlermeldung bei Fehler. Wird sowohl vom Drag-Drop-`onDragEnd` als auch von `TaskCard`s Status-Auswahl aufgerufen (ein Code-Pfad, wie im Tech Design festgelegt).
- **`task-column.tsx`** (neu): Droppable Spalte via `useDroppable`, zeigt Überschrift mit Anzahl, hebt sich optisch hervor (`isOver`), wenn eine Karte gerade darüber schwebt; scrollt vertikal bei vielen Karten.
- **`draggable-task-card.tsx`** (neu): dünner Wrapper, der `useDraggable` aufruft und `TaskCard` mit `ref`/Transform-Style/Handle-Props versorgt. Getrennt von `TaskCard` gehalten, damit `TaskCard` in `DragOverlay` (die schwebende Vorschau beim Ziehen) ohne einen zweiten, kollidierenden `useDraggable`-Aufruf mit derselben ID wiederverwendet werden kann.
- **`task-card.tsx`** (überarbeitet): jetzt eine reine, `forwardRef`-fähige Präsentationskomponente ohne eigenen Datenbank-Zugriff — Layout auf schmalere Spaltenbreite umgestellt (vertikal gestapelt statt nebeneinander), neuer Greif-Icon-Handle (`GripVertical`) für Drag & Drop, bestehende Status-Auswahl und „⋮"-Menü (Bearbeiten/Löschen) unverändert als Klick-Fallback erhalten.
- **`task-form-dialog.tsx`, `delete-task-dialog.tsx`**: unverändert in ihrer Logik, nur der `Task`-Typ-Import auf `task-board.tsx` umgestellt.

**Bug während der manuellen Verifikation gefunden und behoben:** Die ursprünglich geplante Kollisionserkennung `closestCenter` schnappt immer zur nächstgelegenen Spalte, auch wenn weit außerhalb jeder Spalte losgelassen wird — das verletzte die Edge-Case-Vorgabe „Loslassen außerhalb einer Spalte → keine Änderung". Behoben durch Wechsel zu `pointerWithin` (siehe Technical Decisions oben), das nur erkennt, wenn der Zeiger tatsächlich über einer Spalte ist.

**Manuelle Verifikation im Browser** (mit temporären Test-Daten, anschließend vollständig aufgeräumt; Drag & Drop über direkt dispatchte PointerEvents getestet, da das Automatisierungs-Tool keine dnd-kit-kompatible Drag-Geste simulieren konnte):
- Board zeigt alle drei Spalten mit korrekten Zählern ✓
- Drag & Drop zwischen allen Spaltenkombinationen (To Do → In Progress, In Progress → To Do) verschiebt die Karte visuell sofort und speichert den neuen Status korrekt in der DB ✓
- Loslassen weit außerhalb aller Spalten ändert nichts (nach `pointerWithin`-Fix) ✓
- Klick-Fallback (Status-Auswahl auf der Karte) funktioniert unverändert ✓
- „Neue Aufgabe" erstellt eine Karte in „To Do" ✓
- Bearbeiten-/Löschen-Menü und Lösch-Bestätigungsdialog funktionieren unverändert ✓
- Leer-Zustand bei 0 Aufgaben zeigt den zentrierten Call-to-Action statt eines leeren Boards ✓
- `npm run build` (TypeScript-Check) und `npm test` (36/36) grün

## QA Test Results

**Tested:** 2026-09-22
**App URL:** http://localhost:3001
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Board anzeigen
- [x] Drei Spalten mit Aufgaben als Karten beim Öffnen eines Projekts mit vorhandenen Aufgaben
- [x] Zentrierter Leer-Zustand statt Board bei 0 Aufgaben
- [x] Spaltenüberschrift-Anzahl stimmt mit tatsächlicher Kartenanzahl überein (auch nach Drag & Drop, Erstellen, Löschen live verifiziert)

#### Drag & Drop
- [x] Aufgabe von „To Do" nach „In Progress" gezogen → Status sofort sichtbar geändert und in der DB gespeichert (per direkt dispatchten PointerEvents getestet, da das Automatisierungs-Tool keine dnd-kit-kompatible Drag-Geste erzeugen kann; siehe Hinweis unten)
- [x] Fehlgeschlagenes Speichern (Netzwerkfehler simuliert via `fetch`-Patch) → Karte springt zurück in ursprüngliche Spalte, Fehlermeldung „Status konnte nicht geändert werden. Bitte versuche es erneut." erscheint
- [x] Loslassen innerhalb derselben Spalte → keine Änderung an Status oder Reihenfolge

#### Klick-Fallback
- [x] Status-Auswahl auf der Karte funktioniert identisch wie in PROJ-4

#### Responsive Verhalten
- [x] Strukturell verifiziert (siehe Hinweis unten): Spalten sind `w-72` (288px) mit `flex-shrink: 0` in einer `nowrap`-Flexbox, Gesamtbreite 912px, äußerer Container hat `overflow-x: scroll` — bei jeder Viewport-Breite unter ~912px scrollt das Board horizontal, alle Spalten bleiben nebeneinander erreichbar

#### Aufgabe erstellen/bearbeiten/löschen
- [x] „Neue Aufgabe" → Karte erscheint in „To Do"
- [x] Bearbeiten ändert die Karte sofort; Löschen (mit Bestätigungsdialog) entfernt die Karte sofort

**Hinweis zur Drag-&-Drop-Testmethode:** Das Browser-Automatisierungstool kann keine native Maus-Drag-Geste erzeugen, die dnd-kits `PointerSensor` als Drag erkennt (dnd-kit hängt seine Move-/Up-Listener direkt an das gezogene Element, nicht an `document`). Drag & Drop wurde daher durch direkt im Seitenkontext dispatchte `PointerEvent`-Sequenzen (`pointerdown` → mehrere `pointermove` → `pointerup`, alle auf dem tatsächlichen Drag-Handle-Element) verifiziert — dieselben Events, die dnd-kits Sensoren tatsächlich abonnieren, nur nicht über echte OS-Mausbewegung ausgelöst. Visuelle Effekte (schwebende Karte, leere Ausgangsspalte, Drop-Ziel-Hervorhebung) wurden dabei jeweils per Screenshot bestätigt.

**Hinweis zur Responsive-Testmethode:** Das `resize_window`-Tool hat in dieser Umgebung `window.innerWidth` der Seite nicht tatsächlich verändert (blieb bei 960px trotz angeforderter 375px), daher konnte kein echter 375px-Screenshot aufgenommen werden. Stattdessen wurden die berechneten Stile verifiziert, die das horizontale Scrollverhalten unabhängig von der tatsächlichen Fensterbreite garantieren (siehe oben).

### Edge Cases Status

#### EC-1: Zwei Nutzer haben das Board gleichzeitig geöffnet
- [x] Handled correctly (durch Architektur bestätigt, kein Live-Zwei-Sitzungen-Test) — keine Realtime-Subscription vorhanden, Änderungen anderer Nutzer werden erst beim nächsten Laden sichtbar, wie spezifiziert

#### EC-2: Drag-Vorgang abbrechen (Escape-Taste oder Loslassen außerhalb einer Spalte)
- [x] Handled correctly — Escape-Taste während eines aktiven Drags bricht ihn ab, Karte bleibt in ursprünglicher Spalte (dnd-kit-eigenes Verhalten, live verifiziert). Loslassen weit außerhalb aller Spalten ändert nichts (siehe BUG-Fix zu `pointerWithin` aus der Implementierung)

#### EC-3: Aufgabe wird von einem anderen Nutzer gelöscht, während ein Drag-Vorgang dafür läuft
- [x] Handled correctly — **BUG-1 gefunden und behoben** (siehe unten). Nach dem Fix zeigt die App korrekt die Fehlermeldung „Status konnte nicht geändert werden. Bitte versuche es erneut." und die Karte springt zurück in ihre ursprüngliche Spalte, exakt wie im Netzwerkfehler-Fall — mit demselben Live-Repro (Drag gestartet, Aufgabe währenddessen per SQL gelöscht, Drop ausgeführt) erneut verifiziert.

#### EC-4: Sehr viele Aufgaben in einer Spalte (55 Testaufgaben eingefügt)
- [x] Handled correctly — Spalte scrollt vertikal innerhalb ihres begrenzten Bereichs, andere Spalten bleiben unverändert kurz, Seitenlayout bricht nicht

#### EC-5: Drag & Drop auf einem Touch-Gerät
- [ ] Nicht mit echter Touch-Hardware getestet (kein Touch-Gerät in dieser Umgebung verfügbar). Code-Review: `TouchSensor` ist mit `{ delay: 150, tolerance: 8 }` konfiguriert, der bestehende Klick-Mechanismus bleibt als Fallback vollständig erhalten. Gleiche Einschränkung wie bei vorherigen QA-Zyklen (PROJ-4) für Touch-spezifisches Verhalten.

### Security Audit Results (Red Team)
- [x] Authentication: Ohne Login kein Zugriff (bestehender Proxy-Schutz aus PROJ-2, nicht verändert)
- [x] Authorization — direkter REST-Angriff mit echtem JWT eines Nutzers, der nicht Mitglied des Teams ist: `PATCH /rest/v1/tasks` auf eine fremde Aufgabe → 0 betroffene Zeilen, Status in der DB unverändert (RLS aus PROJ-1/PROJ-4 greift unverändert für den neuen Drag-Drop-Pfad, da derselbe Update-Call verwendet wird)
- [x] Authorization (positiv): legitimes Team-Mitglied kann dieselbe Aufgabe erfolgreich per REST aktualisieren
- [x] Input validation: Ungültiger Status-Wert (inkl. SQL-Injection-artigem String) per direktem REST-Call → von der bestehenden DB-Check-Constraint `tasks_status_check` abgelehnt (HTTP 400), PostgREST parametrisiert Werte ohnehin, kein Injection-Risiko
- [x] XSS: Aufgabentitel `<img src=x onerror=alert(1)>` wird als reiner Text angezeigt, nicht ausgeführt (React-Auto-Escaping, gilt auch für das neue Karten-Layout)
- [x] Keine neuen Secrets oder sensiblen Daten im Netzwerk-Traffic (reine Wiederverwendung des bestehenden `tasks`-Update-Aufrufs)

### Regression Testing
- [x] PROJ-3 (Projekte anlegen/verwalten): Projektliste und -navigation unverändert funktionsfähig
- [x] PROJ-11 (Team-Mitglieder verwalten): „Team verwalten"-Dialog vollständig funktionsfähig (Mitgliederliste, Rollenänderung, Hinzufügen/Entfernen) — keine Beeinträchtigung durch die Board-Änderungen
- [x] `npm test`: 36/36 bestehen (keine neuen Unit-Tests nötig — PROJ-5 führt keine neue reine Logik ein, nur DOM-/dnd-kit-Integration)
- [ ] `npm run test:e2e`: **Übersprungen** — Playwright-Browser-Installation in dieser Umgebung weiterhin nicht funktionsfähig, konsistent mit allen bisherigen QA-Zyklen in diesem Projekt
- [ ] Cross-Browser (Firefox/Safari): **Übersprungen**, konsistent mit der für dieses Projekt getroffenen Entscheidung, nur Chromium zu testen

### Bugs Found

#### BUG-1: Von einem anderen Nutzer gelöschte Aufgabe bleibt nach Drag & Drop als „erfolgreich verschoben" sichtbar
- **Severity:** Medium
- **Status:** Fixed (auf Nutzerwunsch sofort behoben, nicht zurückgestellt)
- **Steps to Reproduce:**
  1. Nutzer A öffnet das Board eines Projekts und beginnt, eine Aufgabe per Drag & Drop zu verschieben (Pointer gedrückt halten, über eine andere Spalte bewegen, aber noch nicht loslassen)
  2. Während der Drag-Vorgang läuft, löscht Nutzer B (oder ein Admin-Zugriff) genau diese Aufgabe aus der Datenbank
  3. Nutzer A lässt die Karte in der neuen Spalte los
  4. Erwartet: Die Karte springt zurück bzw. verschwindet, und es erscheint dieselbe Fehlermeldung wie beim Netzwerkfehler-Fall („Status konnte nicht geändert werden…"), wie im Edge Case der Spec beschrieben
  5. Tatsächlich (vor dem Fix): Die Karte blieb in der neuen Spalte sichtbar, keine Fehlermeldung erschien. Grund: Supabase/PostgREST meldet ein `UPDATE` auf eine nicht mehr existierende Zeile nicht als Fehler zurück (0 betroffene Zeilen = technisch „erfolgreiche" Anfrage ohne `error`-Objekt), daher griff der bestehende Rollback-Code-Pfad nicht.
- **Fix:** `updateTaskStatus()` in `task-board.tsx` hängt jetzt `.select("id")` an das Update an und behandelt ein leeres Ergebnis-Array (0 betroffene Zeilen) genauso wie ein `error`-Objekt — löst denselben Rollback- und Toast-Pfad aus. Mit demselben Live-Repro erneut verifiziert: Fehlermeldung erscheint korrekt, Karte bleibt in ursprünglicher Spalte.
- **Priority:** Fixed before deployment

### Summary
- **Acceptance Criteria:** 10/10 passed
- **Bugs Found:** 1 total (0 critical, 0 high, 1 medium, 0 low) — **fixed and re-verified**
- **Security:** Pass — Autorisierung, Input-Validierung und XSS-Schutz funktionieren korrekt für den neuen Drag-Drop-Pfad, da er denselben abgesicherten Update-Aufruf wie der bestehende Klick-Mechanismus nutzt
- **Production Ready:** YES
- **Recommendation:** Deploy.

## Deployment

**Deployed:** 2026-09-22
**Art:** Lokaler Produktions-Build (`npm run build` + `npm run start`), bewusst kein Vercel-Deployment (konsistent mit PROJ-1/2/3/4/11)
**URL:** http://localhost:3000 (nur lokal erreichbar)
**Backend:** Keine neuen Migrationen — reine Frontend-Änderung, nutzt bestehende `tasks`-RLS-Policies aus PROJ-1/PROJ-4 unverändert

### Durchgeführte Checks
- [x] `npm run build` erfolgreich (keine TypeScript-Fehler)
- [x] Lokaler Produktions-Server (`next start`, testweise auf Port 3011, da 3000/3001 durch laufende Dev-Server belegt waren) startet fehlerfrei, Routenschutz greift korrekt (`/` → 307 Redirect, `/login` → 200)
- [x] Keine Secrets im Git-Repo (nur `.env.local.example` getrackt, keine neuen Env-Vars für PROJ-5 nötig)
- [x] QA-Freigabe vorhanden (Approved), BUG-1 (Medium) bereits vor diesem Deploy gefixt und re-verifiziert
- [x] Arbeitsverzeichnis sauber, alle Commits vorhanden
- [ ] `npm run lint` weiterhin nicht lauffähig — vorbestehendes Problem seit PROJ-1 (Next.js 16 hat `next lint` entfernt, ESLint-9-Flat-Config-Migration steht aus), unverändert, weiterhin zurückgestellt

### Bekannte offene Punkte
- ESLint-Konfiguration weiterhin nicht repariert
- Playwright-E2E-Tests weiterhin nicht ausführbar in dieser Umgebung (Browser-Installation schlägt wiederholt fehl, `__dirlock`-Konflikt)
- Vor einem echten Public-Launch: Vercel-Setup, Error-Tracking, Security-Headers, Lighthouse-Check (weiterhin nicht durchgeführt, da nur lokal deployed)
