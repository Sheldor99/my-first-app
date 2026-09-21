# PROJ-4: Aufgaben (Tasks): Status, Zuweisung, Fälligkeitsdatum

## Status: In Progress
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
| Neue `profiles`-Tabelle, automatisch befüllt bei Registrierung | `auth.users` ist clientseitig nicht per RLS abfragbar; ohne diese Tabelle könnte die Zuweisungs-Auswahl niemandem einen Namen zeigen | 2026-09-21 |
| Sichtbarkeit von `profiles`-Einträgen auf Nutzer mit gemeinsamer Team-Mitgliedschaft beschränkt | Verhindert, dass sich beliebige registrierte Nutzer gegenseitig entdecken können; nur echte Teamkollegen sind sichtbar | 2026-09-21 |
| Kein eigenes Backend/API für Aufgaben-Verwaltung | Konsistent mit PROJ-3: Supabase-Client greift direkt zu, abgesichert durch die bestehende RLS aus PROJ-1 | 2026-09-21 |
| Natives Datumsfeld statt eigenem Kalender-Widget für das Fälligkeitsdatum | Spart eine zusätzliche Abhängigkeit; für ein einzelnes Datumsfeld reicht der Standard-Datepicker des Browsers | 2026-09-21 |
| Statusänderung direkt per Dropdown in der Aufgaben-Karte, zusätzlich zum Bearbeiten-Dialog | Statuswechsel ist die häufigste Aktion; ein eigener Dialog dafür wäre unnötig umständlich | 2026-09-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
/projects/[id] (Projekt-Detailseite, neu)
├── Zurück-Link zur Startseite
├── Projekt-Header (Name, Beschreibung)
├── "+ Neue Aufgabe"-Button
├── Aufgabenliste, gruppiert nach Status
│   ├── "To Do"-Abschnitt
│   ├── "In Progress"-Abschnitt
│   ├── "Done"-Abschnitt
│   │   └── je Aufgaben-Karte: Titel, Zuweisung (Name/E-Mail), Fälligkeitsdatum (rot falls überfällig), Status-Dropdown (Schnellwechsel), ⋮-Menü (Bearbeiten/Löschen)
│   └── Empty State ("Noch keine Aufgaben" + CTA)
├── Aufgabe-Erstellen/Bearbeiten-Dialog (Titel, Beschreibung, Zuweisungs-Auswahl, Fälligkeitsdatum)
└── Lösch-Bestätigungsdialog
```

### Data Model (plain language)
Eine neue Tabelle: `profiles` — pro Nutzer ein Eintrag mit E-Mail-Adresse. Wird automatisch befüllt, sobald sich jemand registriert (ähnlicher Mechanismus wie der bestehende "Ersteller wird automatisch Owner"-Automatismus aus PROJ-1). Sichtbar ist ein Profil nur für Nutzer, die mindestens ein gemeinsames Team mit dieser Person haben.

Die `tasks`-Tabelle selbst existiert bereits vollständig seit PROJ-1 und braucht keine Änderung.

### Tech Decisions
- Neue `profiles`-Tabelle + automatischer Eintrag bei Registrierung: notwendig, weil `auth.users` aus Sicherheitsgründen nicht direkt abfragbar ist.
- Sichtbarkeit von Profilen auf gemeinsame Teams beschränkt: verhindert, dass fremde Nutzer sich gegenseitig entdecken können.
- Kein eigenes Backend/API nötig: Aufgaben-Verwaltung läuft wie bei Projekten direkt über den Supabase-Client.
- Einfaches Datumsfeld statt eigenem Kalender-Widget: spart Komplexität fürs MVP.
- Status-Änderung direkt in der Liste (Dropdown) zusätzlich zum Bearbeiten-Dialog: schnellerer Workflow für die häufigste Aktion.

### Dependencies
Keine neuen npm-Pakete — nur eine neue Datenbanktabelle (`profiles`) kommt hinzu.

## Implementation Notes (Backend Developer)

- Migration `proj4_profiles_table`: neue Tabelle `profiles` (`id` referenziert `auth.users`, `email`, `created_at`), RLS aktiviert.
- Trigger `on_auth_user_created` (Funktion `handle_new_user`, `SECURITY DEFINER`, nach dem Muster von `handle_new_team` aus PROJ-1) legt bei jeder Registrierung automatisch einen `profiles`-Eintrag an. `EXECUTE` auf die Trigger-Funktion ist für alle Rollen entzogen (nur intern vom Trigger-Mechanismus aufrufbar, kein direkter RPC-Zugriff).
- Helper-Funktion `shares_team_with(other_user_id)` (`SECURITY DEFINER`) prüft, ob der aufrufende Nutzer mindestens ein Team mit `other_user_id` teilt (Self-Join über `team_members`). `EXECUTE` bewusst auch an `anon` gewährt (analog zur Lehre aus PROJ-1 BUG-2) — die Funktion gibt nur einen von der eigenen `auth.uid()` abhängigen Boolean zurück, kein Datenleck.
- RLS-Policy auf `profiles`: sichtbar für den Profil-Inhaber selbst oder für Nutzer mit gemeinsamer Team-Mitgliedschaft (`id = auth.uid() OR shares_team_with(id)`).
- Index auf `profiles.email` (aktuell ungenutzt lt. Advisor, da noch keine Daten — erwartungsgemäß, analog zum PROJ-1-Start).
- Security-Advisor zeigt nur die erwarteten, bewusst akzeptierten WARN-Einträge (Helper-Funktionen müssen für `authenticated`/`anon` ausführbar bleiben, damit RLS funktioniert) — keine neuen Findings.

### Verifiziert (SQL, simulierte Sessions)
- Trigger legt bei Registrierung zuverlässig einen `profiles`-Eintrag mit korrekter E-Mail an.
- Sichtbarkeit bestätigt: Ein Nutzer sieht sein eigenes Profil sowie das eines Teamkollegen, aber **nicht** das eines Nutzers ohne gemeinsames Team (Cross-Check aus beiden Perspektiven: Owner sieht Teammate, Outsider sieht nur sich selbst).
- Alle Test-User und das Test-Team nach Abschluss vollständig entfernt.

### Noch offen (folgt in `/frontend`)
- Kein Task-CRUD, keine Projekt-Detailseite, kein Zuweisungs-UI gebaut — laut Tech Design läuft das direkt über den Supabase-Client ohne eigenes API-Backend, analog zu PROJ-3.

## Implementation Notes (Frontend Developer)

- `src/lib/validations/task.ts`: Zod-Schema (Titel Pflicht max. 200 Zeichen, Beschreibung optional max. 1000 Zeichen, `assignee_id` optionale UUID, `due_date` optionaler String).
- `src/hooks/use-team-members.ts`: Lädt Team-Mitglieder für die Zuweisungs-Auswahl über zwei einfache Abfragen (`team_members` → Liste der `user_id`s, dann `profiles` gefiltert per `.in()`) statt eines PostgREST-Embeds — `team_members` und `profiles` haben keine direkte Fremdschlüsselbeziehung zueinander (beide referenzieren nur `auth.users`), ein Embed wäre also nicht automatisch auflösbar gewesen.
- `src/app/projects/[id]/page.tsx`: Neue Projekt-Detailseite (Client Component, `useParams()`). Lädt das Projekt per `.maybeSingle()`; liefert die RLS aus PROJ-1 kein Ergebnis (falsche ID oder kein Zugriff), wird „Projekt nicht gefunden oder kein Zugriff" angezeigt statt eines Absturzes.
- `src/components/tasks/task-list.tsx`: Lädt Aufgaben fürs Projekt, gruppiert clientseitig nach Status (`todo`/`in_progress`/`done`), sortiert je Gruppe nach Fälligkeitsdatum (undatierte zuletzt), zeigt Empty State oder die drei Status-Abschnitte.
- `src/components/tasks/task-card.tsx`: Zeigt Titel, Zuweisung (E-Mail), Fälligkeitsdatum (rot + fett hervorgehoben, wenn überfällig **und** Status ≠ „Done"), Status-Dropdown für Schnellwechsel direkt in der Karte, ⋮-Menü für Bearbeiten/Löschen.
- `src/components/tasks/task-form-dialog.tsx`: Ein Dialog für Anlegen UND Bearbeiten (wie bei Projekten in PROJ-3), inkl. Zuweisungs-`Select` (befüllt über `useTeamMembers`) und nativem `<input type="date">` fürs Fälligkeitsdatum.
- `src/components/tasks/delete-task-dialog.tsx`: Einfacher Bestätigungsdialog (kein Cascade-Hinweis nötig, da Aufgaben keine Kind-Entitäten haben).
- `src/components/projects/project-card.tsx`: Projekt-Titel ist jetzt ein Link zu `/projects/[id]` (⋮-Menü mit Bearbeiten/Löschen-Dialogen aus PROJ-3 bleibt unverändert für die Projekt-Metadaten selbst).

### Manuelles Testen (Browser, echtes Supabase-Projekt)
- Team + Projekt erstellt, per Klick auf den Projekt-Titel korrekt zur neuen Detailseite navigiert.
- Aufgabe mit Titel, Zuweisung (einzig verfügbares Team-Mitglied wurde korrekt in der Auswahl angezeigt) und überfälligem Datum (01.01.2020) angelegt → erscheint sofort unter „To Do (1)", Fälligkeitsdatum rot hervorgehoben.
- Status per Dropdown auf „In Progress" geändert → Aufgabe wandert sofort in die richtige Gruppe.
- Status auf „Done" geändert → Überfällig-Hervorhebung verschwindet korrekt (Datum wieder normal dargestellt), obwohl das Datum weiterhin in der Vergangenheit liegt — bestätigt die Spec-Regel „nur wenn Status ≠ Done".
- Aufgabe über ⋮-Menü gelöscht → Bestätigungsdialog, nach Bestätigung verschwindet die Aufgabe, Empty State erscheint wieder.
- Leeres Titelfeld beim Anlegen → Validierungsfehler „Titel ist erforderlich".
- Direkter Aufruf von `/projects/<ungültige-id>` → „Projekt nicht gefunden oder kein Zugriff" statt Absturz.
- Alle Test-Daten (Team, Projekt, Aufgabe, Nutzer) nach Testende vollständig entfernt.

### Automatisierte Tests
- 9 neue Vitest-Unit-Tests für `task.ts` (Grenzwerte bei 200/1000 Zeichen, UUID-Validierung für `assignee_id`, optionales `null`). Zusammen mit den bestehenden Tests: **33/33 grün**.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
