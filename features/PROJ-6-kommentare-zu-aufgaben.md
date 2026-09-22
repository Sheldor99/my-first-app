# PROJ-6: Kommentare zu Aufgaben

## Status: In Review
**Created:** 2026-09-22
**Last Updated:** 2026-09-22

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Aufgaben
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Aufgaben-Datenmodell, an das Kommentare gehängt werden

## User Stories
- Als Team-Mitglied möchte ich einen Kommentar zu einer Aufgabe hinzufügen, damit ich Rückfragen, Status-Updates oder Kontext mit dem Team teilen kann.
- Als Team-Mitglied möchte ich alle Kommentare zu einer Aufgabe chronologisch sehen, damit ich den Verlauf der Diskussion nachvollziehen kann.
- Als Team-Mitglied möchte ich sehen, wer wann welchen Kommentar geschrieben hat, damit ich weiß, mit wem ich es zu tun habe.
- Als Autor eines Kommentars möchte ich meinen eigenen Kommentar bearbeiten oder löschen können, falls ich mich vertippt habe oder ihn zurücknehmen möchte.
- Als Team-Mitglied möchte ich auf einen Blick sehen, wie viele Kommentare eine Aufgabe hat, ohne sie öffnen zu müssen, damit ich aktive Diskussionen erkenne.

## Out of Scope
- Dateianhänge in Kommentaren — eigenes Feature, siehe PROJ-7
- Benachrichtigungen bei neuen Kommentaren — eigenes Feature, siehe PROJ-10
- @Erwähnungen von Team-Mitgliedern — nicht im PRD vorgesehen, kein MVP-Bedarf
- Rich-Text- oder Markdown-Formatierung — nur Klartext im MVP, hält Eingabe und Anzeige einfach und sicher
- Bearbeiten/Löschen fremder Kommentare durch den Team-Owner (Moderation) — Kommentare bleiben bei „alle Mitglieder gleichberechtigt", konsistent mit PROJ-3/PROJ-4
- Echtzeit-Aktualisierung neuer Kommentare ohne Neuladen — konsistent mit dem Rest der App (kein Realtime-Feature im MVP)
- Verschachtelte Antworten/Threads — eine flache, chronologische Liste reicht für MVP

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Kommentare anzeigen
- [ ] Angenommen eine Aufgabe hat Kommentare, wenn ein Team-Mitglied die Kommentar-Ansicht öffnet, dann sieht es alle Kommentare chronologisch sortiert (älteste zuerst) mit Autor-E-Mail und Zeitstempel
- [ ] Angenommen eine Aufgabe hat noch keine Kommentare, wenn die Kommentar-Ansicht geöffnet wird, dann erscheint ein Leer-Zustand („Noch keine Kommentare")
- [ ] Angenommen eine Aufgaben-Karte im Board hat Kommentare, wenn das Board angezeigt wird, dann zeigt die Karte die Anzahl der Kommentare an

### Kommentar hinzufügen
- [ ] Angenommen ein Team-Mitglied gibt einen gültigen Kommentartext ein und sendet ab, wenn die Anfrage erfolgreich ist, dann erscheint der Kommentar sofort in der Liste und das Eingabefeld wird geleert
- [ ] Angenommen das Kommentarfeld ist leer oder enthält nur Leerzeichen, wenn abgesendet wird, dann erscheint eine Validierungsfehlermeldung und nichts wird gespeichert
- [ ] Angenommen der Kommentartext überschreitet die maximale Länge (2000 Zeichen), wenn abgesendet wird, dann erscheint eine Validierungsfehlermeldung

### Kommentar bearbeiten/löschen
- [ ] Angenommen ein Nutzer ist Autor eines Kommentars, wenn er „Bearbeiten" wählt, dann kann er den Text ändern und speichern
- [ ] Angenommen ein Nutzer ist NICHT Autor eines Kommentars, wenn er die Kommentarliste sieht, dann hat er für diesen Kommentar keine Bearbeiten-/Löschen-Option
- [ ] Angenommen ein Nutzer klickt „Löschen" bei einem eigenen Kommentar, wenn er die Löschung bestätigt, dann wird der Kommentar entfernt

### Fehlerfälle
- [ ] Angenommen die Verbindung schlägt beim Absenden eines Kommentars fehl, wenn der Fehler auftritt, dann erscheint eine Fehlermeldung und die Eingabe im Feld bleibt erhalten

## Edge Cases
- Zwei Nutzer kommentieren gleichzeitig dieselbe Aufgabe → beide Kommentare werden gespeichert, kein Konflikt, Reihenfolge nach Erstellzeitpunkt
- Eine Aufgabe wird gelöscht, während ein Nutzer gerade einen Kommentar dazu verfasst → das Speichern schlägt fehl (Aufgabe existiert nicht mehr), Fehlermeldung erscheint statt eines Absturzes
- Sehr viele Kommentare zu einer Aufgabe (50+) → die Liste scrollt innerhalb eines begrenzten Bereichs, kein unbegrenztes Wachsen der Ansicht
- Kommentar besteht nur aus Leerzeichen → wird wie ein leerer Kommentar behandelt und blockiert
- Ein Nutzer verlässt das Team, nachdem er Kommentare geschrieben hat → bestehende Kommentare bleiben mit seiner E-Mail sichtbar erhalten (kein Kaskadieren-Löschen), analog zum bestehenden Verhalten bei verwaisten Aufgaben-Zuweisungen aus PROJ-4

## Technical Requirements
- Security: Kommentare sind nur für Mitglieder des Teams sichtbar/erstellbar, dem die zugehörige Aufgabe gehört — dieselbe Berechtigungsgrenze wie bei Aufgaben aus PROJ-4
- Security: Nur der Autor darf seinen eigenen Kommentar bearbeiten oder löschen
- Validierung: Kommentartext 1–2000 Zeichen, kein reiner Leerzeichen-Text
- Kein Rich-Text- oder HTML-Rendering — reiner Klartext, konsistent mit dem restlichen XSS-Schutz der App

## Open Questions
_Keine offenen Fragen — Standardentscheidungen konsistent mit bestehenden Mustern der App getroffen (siehe Decision Log)._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Reiner Klartext statt Rich-Text/Markdown | Einfacherer, schnellerer MVP; kein zusätzliches XSS-Risiko durch HTML-Rendering | 2026-09-22 |
| Kein Owner-Moderationsrecht auf Kommentar-Ebene, nur der Autor darf bearbeiten/löschen | Konsistent mit dem „alle Mitglieder gleichberechtigt"-Muster aus PROJ-3/PROJ-4; keine erweiterte Rechteverwaltung laut PRD-Non-Goal | 2026-09-22 |
| Separater Kommentar-Zähler auf der Aufgaben-Karte im Board, Kommentare in einer eigenen Ansicht statt im Bearbeiten-Dialog der Aufgabe | Trennt Metadaten-Bearbeitung (Titel, Status, Zuweisung) von der Diskussion; macht aktive Diskussionen auf einen Blick sichtbar | 2026-09-22 |
| Zeichenlimit 2000 statt unbegrenzt oder kürzer | Großzügig genug für echte Diskussionsbeiträge, aber begrenzt genug um riesige Textblöcke zu vermeiden | 2026-09-22 |
| Kein Realtime, keine Benachrichtigungen, keine Anhänge, keine @Erwähnungen im MVP | Jeweils eigene Features (PROJ-7, PROJ-10) oder Non-Goals laut PRD; konsistent mit dem Rest der App (kein Realtime bisher) | 2026-09-22 |
| Kommentare bleiben erhalten, wenn der Autor das Team verlässt | Historischer Kontext der Diskussion bleibt nachvollziehbar; analog zum bewusst zurückgestellten Verhalten bei verwaisten Aufgaben-Zuweisungen (PROJ-4 BUG-1) | 2026-09-22 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigene Datenbanktabelle für Kommentare statt eines Textfelds auf der Aufgaben-Tabelle | Beliebig viele Kommentare pro Aufgabe möglich, saubere Struktur; entspricht dem „eine Tabelle pro Entität"-Muster aus PROJ-1/PROJ-4 | 2026-09-22 |
| Berechtigungsprüfung vollständig über Row Level Security, keine eigene Server-Logik | Gleiche Sicherheitsgrenze wie bei Aufgaben (PROJ-4/PROJ-1); Muster hat sich in allen bisherigen Features bewährt | 2026-09-22 |
| Kommentaranzahl auf der Karte wird bei jedem Laden aus der Kommentar-Tabelle gezählt, kein separates Zähler-Feld | Vermeidet Synchronisationsprobleme zwischen einem gespeicherten Zähler und der tatsächlichen Anzahl | 2026-09-22 |
| Kommentare in einem eigenen Dialog statt im bestehenden Aufgaben-Bearbeiten-Dialog | Trennt Metadaten-Bearbeitung von der Diskussion; kein Umbau des bestehenden `TaskFormDialog` nötig | 2026-09-22 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
TaskCard (bestehend, erweitert)
└── Kommentar-Icon mit Anzahl (neu, öffnet den Kommentare-Dialog)

Kommentare-Dialog (neu)
├── Kommentarliste (chronologisch, mit Autor-E-Mail + Zeitstempel)
│   └── Pro eigenem Kommentar: Bearbeiten/Löschen-Menü
├── Leer-Zustand ("Noch keine Kommentare")
└── Kommentar-hinzufügen-Formular (Textfeld + Button, unten fixiert)
```

### Data Model (plain language)
Eine neue Tabelle für Kommentare, jeweils mit Bezug zur Aufgabe, dem Autor, dem Text (max. 2000 Zeichen) und einem Erstellzeitpunkt. Kein neues Feld auf der bestehenden Aufgaben-Tabelle — die Anzahl der Kommentare auf der Karte wird beim Laden aus der Kommentar-Tabelle gezählt statt separat gepflegt, damit Zähler und tatsächliche Anzahl nie auseinanderlaufen können.

### Tech Decisions
- Eigene Datenbanktabelle statt Kommentare in der Aufgaben-Tabelle zu speichern — saubere Struktur, beliebig viele Kommentare pro Aufgabe möglich, entspricht dem „eine Tabelle pro Entität"-Muster aus PROJ-1/PROJ-4.
- Berechtigungsprüfung läuft komplett über die Datenbank (Row Level Security), genau wie bei Aufgaben/Projekten/Teams — kein zusätzlicher Server-Code nötig, gleiche Sicherheitsgrenze wie bei Aufgaben.
- Kommentaranzahl wird live gezählt statt in einem Extra-Feld gepflegt — vermeidet Synchronisationsprobleme zwischen Zähler und tatsächlicher Anzahl.
- Kein neues UI-Paket — Dialog, Textfeld, Badge sind bereits installiert und werden wiederverwendet.

### Dependencies
Keine neuen npm-Pakete.

## Backend Implementation Notes

Neue Tabelle `task_comments` via Migration `proj6_task_comments`:
- Spalten: `id`, `task_id` (FK auf `tasks`, `on delete cascade`), `author_id` (FK auf `auth.users`, `on delete set null`), `body` (Text), `created_at`, `updated_at`
- `CHECK (char_length(trim(body)) between 1 and 2000)` — setzt die Validierungsregeln aus der Spec auch auf DB-Ebene durch (Leerzeichen-only und Überlänge werden serverseitig abgelehnt, nicht nur clientseitig)
- `updated_at` wird über den bereits bestehenden `set_updated_at()`-Trigger (aus PROJ-4) automatisch gepflegt
- Index `idx_task_comments_task_id_created_at` für die chronologische Anzeige pro Aufgabe

**RLS-Policies** (Berechtigungsgrenze identisch zu `tasks`: Team-Mitgliedschaft über `task_id → tasks.project_id → projects.team_id`, geprüft mit der bestehenden `is_team_member()`-Funktion aus PROJ-1):
- SELECT: alle Team-Mitglieder
- INSERT: alle Team-Mitglieder, aber nur mit `author_id = auth.uid()` — verhindert, dass jemand einen Kommentar im Namen einer anderen Person postet
- UPDATE/DELETE: nur der Autor selbst (zusätzlich weiterhin an Team-Mitgliedschaft gebunden)

Kein API-Code nötig — wie bei allen bisherigen Features läuft der Zugriff direkt vom Client über den Supabase-Client, abgesichert durch RLS.

**Verifikation (simulierte Sessions via `SET LOCAL request.jwt.claims`, mit temporären Test-Usern, anschließend vollständig aufgeräumt):**
- Owner fügt Kommentar hinzu → erfolgreich, Team-Mitglied kann ihn sehen und selbst kommentieren ✓
- Team-Mitglied versucht, den Kommentar des Owners zu bearbeiten → RLS blockiert (0 betroffene Zeilen), Inhalt unverändert ✓
- Nicht-Team-Mitglied sieht keine Kommentare der Aufgabe (leeres Ergebnis) und kann keinen Kommentar hinzufügen (RLS-Fehler) ✓
- Team-Mitglied versucht, einen Kommentar im Namen des Owners zu posten (`author_id` fremd gesetzt) → RLS-Fehler, keine Impersonation möglich ✓
- Nur-Leerzeichen-Kommentar und Kommentar über 2000 Zeichen → beide von der CHECK-Constraint abgelehnt ✓
- Kommentar mit genau 2000 bzw. 1 Zeichen → beide akzeptiert (Grenzwerte korrekt) ✓
- Autor kann eigenen Kommentar bearbeiten und löschen ✓
- Kommentar bleibt sichtbar, nachdem der Autor das Team verlässt (kein Kaskadieren-Löschen bei Team-Austritt) ✓
- Löschen der zugehörigen Aufgabe kaskadiert korrekt zum Löschen aller ihrer Kommentare ✓
- `mcp__supabase__get_advisors` (security) geprüft: keine neuen Findings durch diese Migration

## Frontend Implementation Notes

Neue Dateien:
- **`src/lib/validations/comment.ts`**: `commentSchema` (Zod, `.trim()` + 1–2000 Zeichen) inkl. Tests — Leerzeichen-only wird durch `.trim()` vor der Längenprüfung korrekt als leer erkannt.
- **`src/hooks/use-task-comments.ts`**: lädt Kommentare einer Aufgabe chronologisch, löst Autor-E-Mails über einen zweiten Query gegen `profiles` auf (gleiches Zwei-Schritt-Muster wie `use-team-members.ts`, da keine direkte FK zwischen `task_comments` und `profiles` besteht). Ein Autor, der das Team verlassen hat, ist über `profiles`-RLS für verbleibende Mitglieder nicht mehr sichtbar — die UI zeigt in dem Fall „Ehemaliges Mitglied" statt der E-Mail (entspricht der spezifizierten „Kommentare bleiben erhalten"-Regel und dem bestehenden „Niemand zugewiesen"-Fallback-Muster aus PROJ-4).
- **`src/components/tasks/task-comments-dialog.tsx`** (neu): Dialog mit Kommentarliste (Autor, Zeitstempel, „⋮"-Menü nur bei eigenen Kommentaren), Leer-Zustand, Bearbeiten-Inline-Formular und Hinzufügen-Formular unten. Meldet die aktuelle Kommentaranzahl per Callback an `TaskBoard` zurück, sobald sie geladen ist.

Geänderte Dateien:
- **`task-card.tsx`**: neuer Kommentar-Button (Sprechblasen-Icon + Anzahl, Anzahl nur sichtbar wenn > 0) neben der Status-Auswahl; nur sichtbar, wenn `onOpenComments` übergeben wird (im `DragOverlay`-Vorschaubild bewusst weggelassen, da nicht interaktiv).
- **`draggable-task-card.tsx`**: neue optionale Props `commentCount`/`onOpenComments` durchgereicht.
- **`task-board.tsx`**: lädt beim Laden des Boards die Kommentaranzahl pro Aufgabe in einer einzigen Batch-Abfrage (`select task_id ... in (...)`, client-seitig gezählt), hält sie in einem `commentCounts`-State und übergibt sie an die Karten; verwaltet den geöffneten Kommentare-Dialog.

**Bug während der manuellen Verifikation gefunden und behoben:** Die ursprüngliche `onCommentsChanged`-Callback-Prop wurde als Inline-Funktion direkt im JSX übergeben, was bei jedem Render von `TaskBoard` eine neue Funktionsreferenz erzeugte. Da der Dialog diese Referenz in einem `useEffect`-Dependency-Array verwendet, löste das einen unendlichen Update-Loop aus („Maximum update depth exceeded"), sobald der Kommentare-Dialog geöffnet wurde. Behoben durch `useCallback` mit leerem Dependency-Array in `TaskBoard` für `handleCommentsChanged`.

**Manuelle Verifikation im Browser** (mit temporären Test-Daten, anschließend vollständig aufgeräumt):
- Kommentar-Zähler auf der Karte zeigt korrekt „1" bzw. nur das Icon ohne Zahl bei 0 Kommentaren ✓
- Dialog öffnen, bestehenden Kommentar sehen (Autor + Zeitstempel) ✓
- Neuen Kommentar hinzufügen → erscheint sofort, Feld wird geleert, Zähler auf der Karte aktualisiert sich ✓
- Eigenen Kommentar bearbeiten → Text ändert sich sofort ✓
- Eigenen Kommentar löschen → verschwindet sofort, Zähler aktualisiert sich zurück ✓
- Leeres bzw. nur-Leerzeichen-Kommentar absenden → Validierungsfehler „Kommentar darf nicht leer sein" ✓
- Leer-Zustand „Noch keine Kommentare" bei einer Aufgabe ohne Kommentare ✓
- Als zweiter Nutzer (Team-Mitglied, nicht Autor) eingeloggt: fremder Kommentar sichtbar, aber ohne „⋮"-Menü (kein Bearbeiten/Löschen) ✓
- XSS-Payload (`<img src=x onerror=alert(1)>`) als Kommentartext → wird als reiner Text angezeigt, nicht ausgeführt (React-Auto-Escaping) ✓
- `npm run build` (TypeScript-Check) und `npm test` (42/42, inkl. 6 neuer Tests für `commentSchema`) grün

## QA Test Results

**Tested:** 2026-09-22
**App URL:** http://localhost:3001
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Kommentare anzeigen
- [ ] **BUG-1 gefunden** (siehe unten): Kommentare sind zwar chronologisch sortiert und mit Autor/Zeitstempel versehen, aber bei mehr als ca. 5 Kommentaren sind ältere/weitere Kommentare unerreichbar (nicht scrollbar) — die Kriterien-Bedingung „sieht es **alle** Kommentare" ist damit nicht erfüllt, sobald eine Aufgabe genug Kommentare hat
- [x] Leer-Zustand „Noch keine Kommentare" korrekt
- [x] Kommentaranzahl auf der Karte im Board stimmt immer mit der tatsächlichen Anzahl überein (live mit 0, 1, 3 und 55 Kommentaren verifiziert)

#### Kommentar hinzufügen
- [x] Gültiger Kommentartext → erscheint sofort in der Liste, Feld wird geleert
- [x] Leeres oder nur-Leerzeichen-Feld → Validierungsfehler „Kommentar darf nicht leer sein", nichts gespeichert
- [x] Text über 2000 Zeichen → von der DB-Check-Constraint abgelehnt (clientseitige Zod-Validierung greift ebenfalls, siehe Backend-QA)

#### Kommentar bearbeiten/löschen
- [x] Autor kann eigenen Kommentar bearbeiten und speichern
- [x] Nicht-Autor sieht kein „⋮"-Menü bei fremden Kommentaren
- [x] Löschen mit Bestätigung entfernt den Kommentar sofort, Kartenzähler aktualisiert sich

#### Fehlerfälle
- [x] Simulierter Verbindungsfehler (Aufgabe während des Schreibens von einem anderen Nutzer gelöscht) → Fehlermeldung „Kommentar konnte nicht gespeichert werden…" erscheint, Eingabetext bleibt im Feld erhalten

### Edge Cases Status

#### EC-1: Zwei Nutzer kommentieren gleichzeitig dieselbe Aufgabe
- [x] Handled correctly (durch Architektur bestätigt, kein Live-Zwei-Sitzungen-Test) — unabhängige Inserts ohne Unique-Constraint-Konflikt, Reihenfolge ergibt sich automatisch aus `created_at`

#### EC-2: Aufgabe wird während des Schreibens gelöscht
- [x] Handled correctly — live reproduziert (Task per SQL während offener Kommentar-Eingabe gelöscht, dann abgesendet): Fehlermeldung erscheint, kein Absturz, Eingabetext bleibt erhalten

#### EC-3: Sehr viele Kommentare (50+)
- [ ] **BUG-1 gefunden** (siehe unten) — mit 55 Testkommentaren bestätigt: die Liste wächst nicht unbegrenzt (Dialog behält seine Größe), aber sie scrollt auch nicht — Kommentare ab ca. Nr. 6 sind vollständig unsichtbar und nicht erreichbar, weder per Mausrad noch anders

#### EC-4: Kommentar aus nur Leerzeichen
- [x] Handled correctly — wird wie leer behandelt und blockiert (bestätigt durch `.trim()` in der Zod-Validierung)

#### EC-5: Autor verlässt das Team, nachdem er kommentiert hat
- [ ] **BUG-2 gefunden** (siehe unten) — der Kommentar selbst bleibt sichtbar (kein Kaskadieren-Löschen, wie gefordert), aber entgegen dem Wortlaut der Spec „bleiben **mit seiner E-Mail** sichtbar" wird die E-Mail nicht angezeigt, sondern „Ehemaliges Mitglied" — Ursache: die bestehende `profiles`-RLS-Policy (`shares_team_with()`) aus PROJ-4 verweigert verbleibenden Mitgliedern den Zugriff auf das Profil eines Nutzers, der keine gemeinsame Teammitgliedschaft mehr hat

### Security Audit Results (Red Team)
- [x] Authentication: Ohne Login kein Zugriff (bestehender Proxy-Schutz aus PROJ-2, nicht verändert)
- [x] Authorization — direkter REST-Angriff mit echtem JWT eines Nutzers ohne Teammitgliedschaft: `GET task_comments` → leeres Ergebnis; `POST task_comments` (auch mit korrektem eigenem `author_id`) → 403 RLS-Fehler; `DELETE task_comments` → 0 betroffene Zeilen, alle 55 Kommentare in der DB unverändert
- [x] Authorization — Impersonationsversuch (Kommentar mit fremder `author_id` einfügen) → RLS-Fehler (bereits im Backend-Schritt verifiziert)
- [x] Input validation: Ungültiger/überlanger Text von der DB-Check-Constraint abgelehnt (Backend-Schritt), clientseitig zusätzlich durch Zod verhindert
- [x] XSS: `<img src=x onerror=alert(1)>` als Kommentartext → wird als reiner Text angezeigt, kein Script-Execute (React-Auto-Escaping)
- [x] Keine sensiblen Daten im Netzwerk-Traffic über das ohnehin öffentliche Supabase-Anon-Key-Modell hinaus

### Regression Testing
- [x] PROJ-5 (Kanban-Board): Drag & Drop zwischen Spalten funktioniert weiterhin unverändert (mit direkt dispatchten PointerEvents verifiziert, wie in der PROJ-5-QA), Kommentar-Button beeinträchtigt die Karten-Interaktion nicht
- [x] `npm test`: 42/42 bestehen
- [ ] `npm run test:e2e`: **Übersprungen** — Playwright-Browser-Installation in dieser Umgebung weiterhin nicht funktionsfähig, konsistent mit allen bisherigen QA-Zyklen in diesem Projekt
- [ ] Cross-Browser (Firefox/Safari): **Übersprungen**, konsistent mit der für dieses Projekt getroffenen Entscheidung, nur Chromium zu testen

### Bugs Found

#### BUG-1: Kommentarliste nicht scrollbar — Kommentare ab ca. Nr. 6 unerreichbar
- **Severity:** High
- **Steps to Reproduce:**
  1. Eine Aufgabe mit mehr als ca. 5–6 Kommentaren öffnen (in diesem Test: 55 Kommentare eingefügt)
  2. Kommentare-Dialog öffnen
  3. Erwartet: die ersten paar Kommentare sind sichtbar, der Rest ist über Scrollen in der Liste erreichbar
  4. Tatsächlich: nur die ersten ca. 5 Kommentare sind sichtbar; weder Mausrad-Scroll noch sonstige Interaktion zeigen weitere Kommentare. Per DOM-Inspektion bestätigt: Der innere Scroll-Viewport (`[data-radix-scroll-area-viewport]`) wächst auf die volle Inhaltshöhe (3504px bei 55 Kommentaren) mit `scrollHeight === clientHeight` (also nichts zum Scrollen *innerhalb* des Viewports), während der äußere `ScrollArea`-Container korrekt auf 320px (`max-h-80`) begrenzt ist und den Überschuss per `overflow: hidden` einfach abschneidet statt ihn scrollbar zu machen. Die `h-full`-Höhe der Radix-Viewport-Komponente löst sich offenbar nicht wie erwartet gegen die `max-h-80`-Begrenzung des Eltern-Elements auf.
- **Impact:** Bei jeder Aufgabe mit mehr als eine Handvoll Kommentaren sind ältere Kommentare faktisch unsichtbar und nicht bearbeitbar/löschbar — ein Kernversprechen des Features („alle Kommentare sehen") ist nicht erfüllt. Keine Datenverluste, keine Sicherheitslücke — die Kommentare existieren unverändert in der DB.
- **Priority:** Fix before deployment (blockiert laut Produktionsreife-Kriterium, da High-Bug)

#### BUG-2: Kommentare eines ehemaligen Team-Mitglieds zeigen „Ehemaliges Mitglied" statt der in der Spec geforderten E-Mail
- **Severity:** Low
- **Steps to Reproduce:**
  1. Mitglied A kommentiert eine Aufgabe
  2. Mitglied A verlässt das Team
  3. Ein verbleibendes Mitglied öffnet die Kommentare der Aufgabe
  4. Erwartet laut Spec-Edge-Case: „bestehende Kommentare bleiben **mit seiner E-Mail** sichtbar erhalten"
  5. Tatsächlich: Der Kommentar bleibt sichtbar (kein Datenverlust), aber statt der E-Mail erscheint „Ehemaliges Mitglied", weil die bestehende `profiles`-RLS-Policy (`shares_team_with()`, aus PROJ-4) dem verbleibenden Mitglied keinen Lesezugriff mehr auf das Profil des ausgetretenen Autors gewährt.
- **Assessment:** Dies ist eine bewusste, während der Frontend-Implementierung dokumentierte Design-Entscheidung (siehe Implementation Notes, analog zum „Niemand zugewiesen"-Fallback aus PROJ-4 BUG-1) — technisch korrekt und aus Datenschutzsicht sogar vorzugswürdig (kein Aufdecken der E-Mail einer Person, die keine gemeinsame Teammitgliedschaft mehr hat). Der Fund betrifft daher primär eine **Abweichung zwischen Spec-Text und tatsächlichem/beabsichtigtem Verhalten**, nicht zwingend einen Implementierungsfehler.
- **Priority:** Nice to have — Empfehlung: Spec-Text anpassen („bleibt sichtbar, ggf. als „Ehemaliges Mitglied" falls das Profil nicht mehr einsehbar ist") statt Verhalten zu ändern, da die aktuelle Lösung konsistenter und datensparsamer ist.

### Summary
- **Acceptance Criteria:** 7/9 passed (2 betroffen von BUG-1)
- **Bugs Found:** 2 total (0 critical, 1 high, 0 medium, 1 low)
- **Security:** Pass — Autorisierung, Input-Validierung und XSS-Schutz funktionieren korrekt
- **Production Ready:** NO — BUG-1 (High) muss vor dem Deployment behoben werden
- **Recommendation:** BUG-1 zuerst beheben (ScrollArea-Höhenvererbung korrigieren, z. B. durch explizite `height`-Klasse statt `max-h-80` auf dem `ScrollArea`-Root, oder Höhe direkt auf die Radix-`Viewport`-Komponente anwenden), dann erneut `/qa` ausführen. BUG-2 kann parallel oder später als reine Doku-Korrektur behandelt werden.

## Deployment
_To be added by /deploy_
