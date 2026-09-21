# PROJ-4: Aufgaben (Tasks): Status, Zuweisung, Fälligkeitsdatum

## Status: Planned
**Created:** 2026-09-21
**Last Updated:** 2026-09-21

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — `tasks`-Schema mit RLS bereits vorhanden
- PROJ-3 (Projekte anlegen/verwalten) — Projekte müssen existieren, bevor Aufgaben angelegt werden können

## User Stories
- Als Team-Mitglied möchte ich eine Aufgabe in einem Projekt anlegen, damit Arbeit nachvollziehbar strukturiert ist.
- Als Team-Mitglied möchte ich einer Aufgabe ein anderes Team-Mitglied zuweisen, damit klar ist, wer zuständig ist.
- Als Team-Mitglied möchte ich den Status einer Aufgabe ändern, damit der Fortschritt sichtbar ist.
- Als Team-Mitglied möchte ich ein Fälligkeitsdatum setzen, damit Deadlines nicht übersehen werden.
- Als Team-Mitglied möchte ich überfällige Aufgaben auf einen Blick erkennen, damit ich Prioritäten setzen kann.
- Als Team-Mitglied möchte ich eine Aufgabe bearbeiten oder löschen können, damit die Liste aktuell bleibt.

## Out of Scope
- Kanban-Board mit Drag & Drop — PROJ-5, baut direkt auf der hier eingeführten Projekt-Detailseite auf
- Kommentare zu Aufgaben — PROJ-6
- Dateianhänge an Aufgaben — PROJ-7
- Zeiterfassung — PROJ-8
- Benachrichtigungen bei Zuweisung/nahender Fälligkeit — PROJ-10
- Mehrfach-Zuweisung (mehrere Personen pro Aufgabe) — Schema aus PROJ-1 erlaubt nur eine `assignee_id`
- Volltext-/Filtersuche über Aufgaben — nicht MVP-kritisch, künftiges Ticket
- Profilverwaltung (Name ändern, Avatar) — die neue `profiles`-Tabelle speichert nur die E-Mail fürs Zuweisen, keine Verwaltungs-UI

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Aufgabenliste anzeigen
- [ ] Angenommen ein Projekt hat keine Aufgaben, wenn die Projekt-Detailseite lädt, dann wird ein Empty State mit einem „Erste Aufgabe anlegen"-Button angezeigt
- [ ] Angenommen ein Projekt hat Aufgaben, wenn die Detailseite lädt, dann werden sie gruppiert nach Status (To Do / In Progress / Done) angezeigt, innerhalb jeder Gruppe sortiert nach Fälligkeitsdatum (undatierte Aufgaben zuletzt)
- [ ] Angenommen eine Aufgabe hat ein Fälligkeitsdatum in der Vergangenheit und ist nicht „Done", wenn die Liste angezeigt wird, dann wird das Datum optisch hervorgehoben (z. B. rot)

### Aufgabe anlegen
- [ ] Angenommen ein Team-Mitglied gibt einen gültigen Titel ein (optional mit Beschreibung, Zuweisung, Fälligkeitsdatum), wenn es absendet, dann wird die Aufgabe mit Status „To Do" erstellt und erscheint in der Liste
- [ ] Angenommen das Titelfeld ist leer, wenn das Formular abgesendet wird, dann wird ein Validierungsfehler angezeigt
- [ ] Angenommen der Titel überschreitet 200 Zeichen oder die Beschreibung überschreitet 1000 Zeichen, wenn abgesendet wird, dann wird ein Validierungsfehler angezeigt
- [ ] Angenommen ein Team-Mitglied öffnet die Zuweisungs-Auswahl, wenn die Liste lädt, dann werden ausschließlich Mitglieder des aktuellen Teams angezeigt

### Aufgabe bearbeiten
- [ ] Angenommen ein Team-Mitglied ändert Titel, Beschreibung, Zuweisung oder Fälligkeitsdatum gültig, wenn es speichert, dann wird die Änderung übernommen und ist sofort sichtbar
- [ ] Angenommen das Titelfeld wird beim Bearbeiten geleert, wenn gespeichert wird, dann wird ein Validierungsfehler angezeigt und der Dialog bleibt offen

### Status ändern
- [ ] Angenommen ein Team-Mitglied ändert den Status einer Aufgabe (z. B. über eine Dropdown-Auswahl), wenn die Änderung gespeichert wird, dann erscheint die Aufgabe sofort in der entsprechenden Status-Gruppe

### Aufgabe löschen
- [ ] Angenommen ein Team-Mitglied klickt auf „Löschen" bei einer Aufgabe, wenn der Klick verarbeitet wird, dann erscheint ein Bestätigungsdialog
- [ ] Angenommen der Bestätigungsdialog wird bestätigt, wenn die Löschung verarbeitet wird, dann wird die Aufgabe entfernt und verschwindet aus der Liste
- [ ] Angenommen der Bestätigungsdialog wird abgebrochen, wenn der Nutzer auf „Abbrechen" klickt, dann bleibt die Aufgabe unverändert erhalten

### Zuweisung
- [ ] Angenommen eine Aufgabe wird einem Team-Mitglied zugewiesen, wenn die Liste angezeigt wird, dann ist die zugewiesene Person bei der Aufgabe sichtbar
- [ ] Angenommen die Zuweisung einer Aufgabe wird entfernt (auf „Niemand" gesetzt), wenn gespeichert wird, dann zeigt die Aufgabe keine zugewiesene Person mehr

## Edge Cases
- Netzwerkfehler beim Erstellen/Bearbeiten/Löschen einer Aufgabe → Fehlermeldung anzeigen, Eingaben bleiben erhalten
- Doppeltes schnelles Klicken auf Absenden/Löschen-Bestätigung → Button wird während des laufenden Requests deaktiviert, kein Doppel-Request
- Ein zugewiesenes Team-Mitglied verlässt später das Team (Funktion kommt mit PROJ-11) → Aufgabe behält die (dann verwaiste) Zuweisung; die Anzeige muss damit umgehen können, ohne abzustürzen (z. B. „Ehemaliges Mitglied" statt leerem/kaputtem Namen) — Hinweis für `/architecture`
- Fälligkeitsdatum in der Vergangenheit beim Anlegen einer neuen Aufgabe → wird zugelassen (z. B. nachträgliche Erfassung erledigter Arbeit), keine Blockade, nur die visuelle Überfällig-Kennzeichnung greift
- Sehr viele Aufgaben in einem Projekt → Liste bleibt scrollbar, keine Pagination im MVP

## Technical Requirements
- Security: Aufgaben sind weiterhin durch die RLS-Policies aus PROJ-1 abgesichert (nur Team-Mitglieder); die neue `profiles`-Tabelle ist nur für Mitglieder eines gemeinsamen Teams sichtbar
- Validierung: Titel Pflichtfeld max. 200 Zeichen; Beschreibung optional max. 1000 Zeichen

## Open Questions
_Keine offenen Fragen — im Interview geklärt._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Projekt-Detailseite (`/projects/[id]`) mit einfacher Aufgabenliste eingeführt | Aufgaben brauchen zwingend eine Ansicht innerhalb eines Projekts; PROJ-3 hatte bewusst keine Detailseite, da es noch keine Unterseiten-Inhalte gab | 2026-09-21 |
| Neue `profiles`-Tabelle (E-Mail pro Nutzer) eingeführt | `auth.users` ist clientseitig nicht per RLS abfragbar; ohne diese Tabelle könnte die Zuweisungs-Auswahl keine Mitgliedernamen anzeigen — notwendige Voraussetzung für die „Zuweisung"-Anforderung aus dem PRD | 2026-09-21 |
| Aufgabenliste vor PROJ-5 gruppiert nach Status statt als reine chronologische Liste | Gibt schon eine sinnvolle Struktur vor, die später nahtlos zum Kanban-Board (PROJ-5) wird, ohne Drag & Drop vorwegzunehmen | 2026-09-21 |
| Überfällige Aufgaben werden visuell hervorgehoben | Nützlicher Hinweis auf Prioritäten ohne zusätzliche Interaktion oder Benachrichtigungslogik (die kommt erst mit PROJ-10) | 2026-09-21 |
| Titel max. 200 Zeichen, Beschreibung max. 1000 Zeichen | Aufgabenbeschreibungen dürfen länger sein als Projektbeschreibungen (mehr Detailbedarf), Titel bleibt kompakt | 2026-09-21 |
| Alle Team-Mitglieder dürfen Aufgaben anlegen/bearbeiten/löschen/zuweisen (kein Owner-Only) | Konsistent mit der Entscheidung aus PROJ-3 und der bestehenden RLS aus PROJ-1 | 2026-09-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
