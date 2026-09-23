# PROJ-8: Zeiterfassung

## Status: Approved
**Created:** 2026-09-23
**Last Updated:** 2026-09-23

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Aufgaben
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Aufgaben-Datenmodell, an das Zeiteinträge gehängt werden

## User Stories
- Als Team-Mitglied möchte ich die Zeit, die ich an einer Aufgabe gearbeitet habe, erfassen, damit der tatsächliche Aufwand sichtbar wird.
- Als Team-Mitglied möchte ich alle Zeiteinträge einer Aufgabe sehen, damit ich nachvollziehen kann, wer wann wie lange daran gearbeitet hat.
- Als Team-Mitglied möchte ich die Gesamtdauer einer Aufgabe auf einen Blick sehen, ohne die Einträge einzeln öffnen zu müssen (analog zum Kommentar-/Anhang-Zähler aus PROJ-6/PROJ-7).
- Als Nutzer möchte ich einen von mir erfassten Zeiteintrag korrigieren können, falls ich mich bei Dauer oder Datum vertippt habe.
- Als Nutzer möchte ich einen von mir erfassten Zeiteintrag löschen können, falls er versehentlich angelegt wurde.

## Out of Scope
- Start/Stopp-Timer (Live-Zeiterfassung mit laufender Uhr) — MVP nutzt manuelle Eingabe von Dauer und Datum im Nachhinein, kein laufender Hintergrund-Timer
- Abrechnung, Rechnungsstellung, Stundensätze — explizit als PRD-Non-Goal ausgeschlossen
- Aggregierte Zeiterfassung auf Projekt- oder Team-Ebene (Dashboards, Summen über mehrere Aufgaben) — das ist Teil von PROJ-9 (Reporting/Analytics-Dashboard)
- Genehmigungsworkflow (z. B. Owner muss Zeiteinträge freigeben, bevor sie zählen) — keine erweiterte Rechteverwaltung über Owner/Member hinaus laut PRD-Non-Goal
- Bearbeiten oder Löschen fremder Zeiteinträge durch Owner oder andere Mitglieder — konsistent mit der Kommentar-/Anhang-Entscheidung aus PROJ-6/PROJ-7 bleibt es bei „nur der Ersteller darf ändern/löschen"
- Export der Zeiterfassungsdaten (CSV/PDF) — kein MVP-Bedarf, spätere Ergänzung möglich
- Zeiteinträge ohne Bezug zu einer Aufgabe (z. B. allgemeine Team-Meetings) — jeder Eintrag ist immer an genau eine Aufgabe gebunden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Zeiteinträge anzeigen
- [ ] Angenommen eine Aufgabe hat Zeiteinträge, wenn ein Team-Mitglied die Zeiterfassungs-Ansicht öffnet, dann sieht es alle Einträge mit Nutzer-E-Mail, Datum, Dauer und optionaler Notiz, sortiert nach Datum absteigend
- [ ] Angenommen eine Aufgabe hat noch keine Zeiteinträge, wenn die Ansicht geöffnet wird, dann erscheint ein Leer-Zustand („Noch keine Zeit erfasst")
- [ ] Angenommen eine Aufgaben-Karte im Board hat Zeiteinträge, wenn das Board angezeigt wird, dann zeigt die Karte die Gesamtdauer aller Einträge an (z. B. „3,5 Std.")

### Zeit erfassen
- [ ] Angenommen ein Team-Mitglied gibt eine gültige Dauer (größer 0, maximal 24 Stunden) und ein Datum (heute oder in der Vergangenheit) ein, wenn es speichert, dann erscheint der Eintrag sofort in der Liste und die Gesamtdauer auf der Karte aktualisiert sich
- [ ] Angenommen die Dauer ist 0, negativ oder größer als 24 Stunden, wenn der Nutzer speichert, dann erscheint eine Validierungsfehlermeldung und der Eintrag wird nicht gespeichert
- [ ] Angenommen kein Datum ist ausgewählt oder das Datum liegt in der Zukunft, wenn gespeichert wird, dann erscheint eine Validierungsfehlermeldung
- [ ] Angenommen das Speichern schlägt durch einen Verbindungsfehler fehl, wenn der Fehler auftritt, dann erscheint eine Fehlermeldung und die eingegebenen Werte bleiben im Formular erhalten

### Zeiteintrag bearbeiten
- [ ] Angenommen ein Nutzer hat einen Zeiteintrag selbst erstellt, wenn er ihn bearbeitet und speichert, dann werden Dauer, Datum und Notiz aktualisiert und die Gesamtdauer passt sich an
- [ ] Angenommen ein Nutzer hat einen Zeiteintrag NICHT selbst erstellt, wenn er die Liste sieht, dann hat er für diesen Eintrag weder Bearbeiten- noch Löschen-Option

### Zeiteintrag löschen
- [ ] Angenommen ein Nutzer hat einen Zeiteintrag selbst erstellt, wenn er „Löschen" wählt und bestätigt, dann wird der Eintrag entfernt und die Gesamtdauer auf der Karte aktualisiert sich

## Edge Cases
- Zwei Nutzer erfassen gleichzeitig Zeit an derselben Aufgabe → beide Einträge werden unabhängig gespeichert, kein Konflikt
- Ein Nutzer verlässt das Team, nachdem er einen Zeiteintrag erstellt hat → der Eintrag bleibt erhalten (kein Kaskadieren-Löschen), die Nutzeranzeige zeigt „Ehemaliges Mitglied" statt der E-Mail, analog zu PROJ-6/PROJ-7
- Eine Aufgabe wird gelöscht → alle zugehörigen Zeiteinträge werden automatisch mitgelöscht (Datenbank-Kaskade), analog zu Kommentaren und Anhängen
- Sehr viele Zeiteinträge an einer Aufgabe → die Liste scrollt innerhalb eines begrenzten Bereichs, kein unbegrenztes Wachsen der Ansicht (Anforderung von Anfang an, gelernt aus dem PROJ-6-Scroll-Bug)
- Nutzer gibt eine unrealistisch hohe Dauer ein (z. B. 999 Stunden) → durch die 24-Stunden-Obergrenze pro Eintrag verhindert; für mehrtägige Arbeit werden mehrere Einträge mit unterschiedlichem Datum angelegt
- Nutzer wählt ein Datum in der Zukunft → wird abgelehnt, da noch nicht gearbeitete Zeit nicht erfasst werden kann

## Technical Requirements
- Security: Ansehen und Erfassen ist auf Mitglieder des Teams beschränkt, dem die zugehörige Aufgabe gehört — dieselbe Berechtigungsgrenze wie bei Aufgaben (PROJ-4), Kommentaren (PROJ-6) und Anhängen (PROJ-7)
- Security: Nur der Ersteller darf seinen eigenen Zeiteintrag bearbeiten oder löschen
- Validierung: Dauer größer 0 und maximal 24 Stunden pro Eintrag
- Validierung: Datum erforderlich, nicht in der Zukunft
- Validierung: optionale Notiz, maximal 500 Zeichen

## Open Questions
_Keine offenen Fragen — alle Entscheidungen (manuelle Eingabe statt Timer, Dauer-Obergrenze, Berechtigungsmodell) konsistent mit bestehenden Mustern aus PROJ-4/PROJ-6/PROJ-7 getroffen, siehe Decision Log._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Manuelle Eingabe von Dauer + Datum statt Start/Stopp-Timer | Deutlich einfacher umzusetzen (kein Hintergrundprozess, keine Abhängigkeit von offenem Browser-Tab); für kleine Agenturteams, die Zeit oft nachträglich erfassen, ausreichend | 2026-09-23 |
| Dauer als Dezimalstunden eingegeben (z. B. „1,5"), intern in Minuten gespeichert | Einfachstes Eingabeformat für Nutzer, vermeidet Rundungsprobleme bei Speicherung als Ganzzahl (Minuten) | 2026-09-23 |
| Obergrenze 24 Stunden pro Eintrag | Verhindert Fehleingaben (z. B. Tippfehler „150" statt „1,5"); für längere Arbeit werden mehrere Einträge mit unterschiedlichem Datum angelegt | 2026-09-23 |
| Zukünftiges Datum nicht erlaubt | Zeiterfassung dokumentiert bereits geleistete Arbeit, keine Vorab-Planung (dafür ist das Fälligkeitsdatum der Aufgabe da) | 2026-09-23 |
| Nur der Ersteller darf seinen eigenen Eintrag bearbeiten/löschen, kein Owner-Sonderrecht | Konsistent mit der Kommentar- und Anhang-Entscheidung aus PROJ-6/PROJ-7 und dem „alle Mitglieder gleichberechtigt"-Muster aus PROJ-3/PROJ-4 | 2026-09-23 |
| Keine Aggregation auf Projekt-/Team-Ebene im Rahmen dieses Features | Gehört inhaltlich zu PROJ-9 (Reporting/Analytics-Dashboard); PROJ-8 liefert nur die Rohdaten (Zeiteinträge pro Aufgabe) | 2026-09-23 |
| Zeiteinträge-Liste muss von Anfang an scrollbar begrenzt sein | Direkte Lehre aus dem in PROJ-6 gefundenen und behobenen Scroll-Bug, diesmal von vornherein als Anforderung verankert | 2026-09-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Datenbanktabelle für Zeiteinträge, getrennt von der Aufgabe | Folgt demselben „eine Tabelle pro Entität"-Muster wie `task_comments` (PROJ-6) und `task_attachments` (PROJ-7) | 2026-09-23 |
| Dauer intern in Minuten (Ganzzahl) gespeichert, Eingabe/Anzeige in Stunden | Vermeidet Rundungsfehler bei wiederholter Bearbeitung eines Eintrags | 2026-09-23 |
| Zugriffsbeschränkung über dieselbe Team-Mitgliedschafts-Regel wie Aufgaben/Kommentare/Anhänge | Konsistentes, bereits bewährtes RLS-Muster, keine neue Berechtigungslogik nötig | 2026-09-23 |
| Bearbeiten/Löschen serverseitig (RLS) auf den Ersteller beschränkt, nicht nur clientseitig versteckt | Konsistent mit PROJ-6/PROJ-7; verhindert Umgehung über direkte API-Aufrufe | 2026-09-23 |
| Gesamtdauer pro Aufgabe wird aus geladenen Einträgen berechnet, kein separates Summenfeld | Vermeidet Synchronisationsprobleme bei gleichzeitigen Änderungen durch mehrere Nutzer | 2026-09-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
TaskCard (bestehend, erweitert)
└── Uhr-Icon mit Gesamtdauer (neu, öffnet die Zeiterfassungs-Ansicht) — gleiches Muster wie Kommentar-/Anhang-Zähler aus PROJ-6/PROJ-7

Zeiterfassungs-Dialog (neu)
├── Formular „Zeit erfassen" (Dauer in Stunden, Datum, optionale Notiz)
├── Liste der Zeiteinträge (Nutzer-E-Mail, Datum, Dauer, Notiz), neueste zuerst
│   └── Pro eigenem Eintrag: „Bearbeiten"- und „Löschen"-Optionen
└── Leer-Zustand ("Noch keine Zeit erfasst")
```

### Data Model (plain language)
Eine neue Tabelle beschreibt jeden Zeiteintrag: Bezug zur Aufgabe, Ersteller, Datum, Dauer und eine optionale Notiz — plus einen Zeitstempel der Erstellung. Die Dauer wird von den Nutzern in Stunden eingegeben (z. B. „1,5"), aber intern in Minuten als ganze Zahl gespeichert, um Rundungsfehler bei mehrfacher Bearbeitung zu vermeiden. Es werden keine Dateien gespeichert — im Gegensatz zu PROJ-7 wird hier kein Speicherbereich (Storage) benötigt, nur eine reine Datenbank-Tabelle.

Die Gesamtdauer, die auf der Aufgaben-Karte angezeigt wird, ist kein eigenes gespeichertes Feld, sondern wird direkt aus der Summe der geladenen Zeiteinträge berechnet.

### Tech Decisions
- Neue Datenbanktabelle für Zeiteinträge, getrennt von der Aufgabe selbst — folgt demselben Muster wie die Kommentar-Tabelle (PROJ-6) und die Anhang-Metadaten-Tabelle (PROJ-7).
- Speicherung der Dauer in Minuten (Ganzzahl) statt als Dezimalstunden — verhindert Rundungsfehler, wenn ein Eintrag später bearbeitet wird; die Umrechnung in/aus Stunden passiert nur bei der Anzeige und Eingabe.
- Zugriffsbeschränkung über dieselbe Regel wie bei Aufgaben, Kommentaren und Anhängen: nur Mitglieder des Teams, dem die zugehörige Aufgabe gehört, dürfen Einträge sehen oder anlegen.
- Bearbeiten und Löschen ist ausschließlich für den ursprünglichen Ersteller möglich — diese Regel wird nicht nur in der Oberfläche versteckt, sondern serverseitig erzwungen (dieselbe Absicherung wie bei Kommentaren und Anhängen).
- Die Gesamtdauer pro Aufgabe wird aus den geladenen Einträgen berechnet statt in einem separaten Summenfeld gespeichert — vermeidet, dass die Summe bei gleichzeitigen Änderungen mehrerer Nutzer aus dem Takt gerät.

### Dependencies
Keine neuen npm-Pakete — das Formular nutzt dieselben bereits vorhandenen Bibliotheken (react-hook-form, Zod) wie die übrigen Formulare im Projekt; es sind keine Datei-Uploads oder sonstigen Sonderfunktionen nötig.

## Frontend Implementation Notes

### Komponenten
- `src/lib/validations/time-entry.ts` — Zod-Schema für Datum (nicht in der Zukunft) und Dauer (als String validiert, 0 < Dauer ≤ 24 Std.), `hoursToMinutes()`/`minutesToHours()` für die Umrechnung, `formatDuration()` für die Anzeige (z. B. „1,5 Std.")
- `src/hooks/use-task-time-entries.ts` — lädt Zeiteinträge einer Aufgabe inkl. Ersteller-E-Mail (Join über `profiles`), analog zu `use-task-comments.ts`
- `src/components/tasks/task-time-entries-dialog.tsx` — neuer Dialog: Formular „Zeit erfassen" (Datum, Stunden, optionale Notiz), scrollbare Liste (`ScrollArea h-80`, von Anfang an begrenzt), inline Bearbeiten-Formular (analog zu Kommentaren), Löschen-Menü nur für eigene Einträge, Gesamtdauer im Dialog-Titel
- `src/components/tasks/task-card.tsx` — neues Uhr-Icon mit Gesamtdauer neben Kommentar-/Anhang-Icons, öffnet den Zeiterfassungs-Dialog (`onOpenTimeEntries`)
- `src/components/tasks/draggable-task-card.tsx` — reicht `totalTimeMinutes`/`onOpenTimeEntries` durch
- `src/components/tasks/task-board.tsx` — lädt Gesamtdauer pro Aufgabe (`fetchTotalTimeByTask`, Summe aus `task_time_entries`), verwaltet den geöffneten Dialog-State, aktualisiert die Summe nach Änderungen

### Hinweis zur Implementierungsreihenfolge
Diese Feature wurde mit `/frontend` vor `/backend` gebaut (Architektur war bereits abgeschlossen). Der Code referenzierte zunächst die geplante Tabelle `task_time_entries` mit einem `updated_at`-Feld; dieses wurde beim `/backend`-Schritt aus Schema und Hook entfernt, da kein „zuletzt bearbeitet"-Zeitstempel laut Spec angezeigt wird (siehe Backend Implementation Notes). Die tatsächlich angelegte Tabelle hat die Spalten `id`, `task_id`, `user_id`, `entry_date`, `duration_minutes`, `note`, `created_at`. `npx tsc --noEmit` und `npm run build` waren während der Frontend-Phase bereits fehlerfrei, da der Supabase-Client in diesem Projekt ohne generierte Datenbank-Typen verwendet wird (`.from()`-Aufrufe sind zur Compile-Zeit nicht gegen das Schema geprüft).

### Zod-Implementierungsdetail
Die Dauer wird im Formular-Schema als `string` geführt (nicht `z.coerce.number()`), da Zod 4 in Kombination mit `@hookform/resolvers` bei coerzierten Feldern zu einem Typkonflikt zwischen Eingabe- und Ausgabetyp von `useForm` führt. Die Umwandlung in eine Zahl (`Number(values.hours)`) passiert explizit beim Absenden, vor dem Aufruf von `hoursToMinutes()`.

## Backend Implementation Notes

### Datenbankschema
Neue Tabelle `task_time_entries`:
- `id` (uuid, PK), `task_id` (uuid, FK → `tasks.id` ON DELETE CASCADE), `user_id` (uuid, FK → `auth.users.id` ON DELETE SET NULL — ermöglicht die „Ehemaliges Mitglied"-Anzeige aus den Edge Cases)
- `entry_date` (date), `duration_minutes` (integer, CHECK 0 < Dauer ≤ 1440 = 24 Std.), `note` (text, CHECK max. 500 Zeichen)
- `created_at` (timestamptz, default now())
- Index auf `(task_id, entry_date desc)` für die sortierte Anzeige (neueste zuerst)
- Kein separates `updated_at`-Feld — Bearbeiten eines Eintrags aktualisiert nur `entry_date`/`duration_minutes`/`note`, ein „zuletzt bearbeitet"-Zeitstempel wird laut Spec nirgends angezeigt

RLS-Policies auf `task_time_entries` (RLS aktiviert):
- **SELECT** — Team-Mitglieder der zugehörigen Aufgabe (via `is_team_member()`, Join über `tasks` → `projects`) — identisches Muster wie bei `task_comments`/`task_attachments`
- **INSERT** — nur als sich selbst (`user_id = auth.uid()`) und nur für Aufgaben des eigenen Teams
- **UPDATE** — nur der Ersteller selbst (`user_id = auth.uid()`), zusätzlich weiterhin an Team-Mitgliedschaft gebunden
- **DELETE** — nur der Ersteller selbst (`user_id = auth.uid()`), zusätzlich weiterhin an Team-Mitgliedschaft gebunden

### Migration
- `proj8_task_time_entries` — Tabelle, RLS-Policies, Index (ein einziger Migrationsaufruf)
- `proj8_fix_future_date_check` — Bugfix-Migration aus der QA-Runde (siehe QA Test Results, BUG-1)

### Verifikation — bewusst reduziert (explizite Nutzeranfrage)
Der Nutzer bat ausdrücklich darum, so wenig Supabase-Zugriffe wie möglich zu machen, da eine Kontosperrung wegen zu vieler Zugriffe drohte. Anders als bei PROJ-6/PROJ-7 wurde daher zum Zeitpunkt des `/backend`-Schritts **keine** Live-Verifikation mit simulierten Sessions/Testkonten durchgeführt und **kein** `get_advisors`-Check ausgeführt — der Backend-Schritt selbst bestand aus einem einzigen `apply_migration`-Aufruf.

Die Absicherung erfolgte zunächst durch **Code-Review gegen bereits verifizierte Muster**: Die vier Policies sind strukturell identisch zu den in PROJ-6 (Kommentare) und PROJ-7 (Anhänge) bereits mit simulierten Sessions getesteten Policies. Ein minimaler Live-Smoke-Test in der anschließenden QA-Runde (4 Supabase-Zugriffe insgesamt, siehe unten) hat diese Annahme für SELECT/INSERT/DELETE inzwischen bestätigt. UPDATE sowie die Abgrenzung gegenüber Team-fremden Nutzern wurden weiterhin nicht eigenständig live getestet, sondern bleiben auf struktureller Mustergleichheit gestützt.

## QA Test Results

**Tested:** 2026-09-23
**App URL:** Kein Browser-Test durchgeführt (siehe unten) — Verifikation ausschließlich per Code-Review + minimalem Supabase-Smoke-Test
**Tester:** QA Engineer (AI)

### Hinweis zur Vorgehensweise (explizite Nutzeranfrage)
Der Nutzer bat ausdrücklich darum, den Supabase-Zugriff für diese QA-Runde auf ein Minimum zu reduzieren (Sorge vor Kontosperrung wegen zu vieler Zugriffe). Diese QA-Runde weicht daher bewusst vom Standardvorgehen (volles Multi-User-Browser-Testing wie bei PROJ-6/PROJ-7) ab:

- **Kein** Browser-/UI-Test (kein Playwright E2E — ohnehin in dieser Umgebung bereits vorher als defekt bekannt; kein manueller Klick-Test)
- **Keine** Mehrpersonen-Testszenarien (Team-Mitglied vs. Team-fremd, Ersteller vs. anderes Mitglied) — stattdessen Verlass auf die strukturelle Gleichheit zu den in PROJ-6/PROJ-7 bereits mehrfach mehrpersonen-getesteten RLS-Mustern
- Anstelle dessen: gründliches **Code-Review** jeder Komponente gegen jedes Akzeptanzkriterium, plus ein **einziger minimaler Live-Smoke-Test** (4 Supabase-Aufrufe insgesamt: 1 Bugfix-Migration, 1 Setup+Insert+Select, 1 Ablehnungstest, 1 Löschen+Aufräumen), um zu bestätigen, dass die Kernfunktion (Zeit erfassen → anzeigen → summieren → löschen) tatsächlich funktioniert und nicht nur auf dem Papier korrekt aussieht
- Alle Testdaten danach vollständig entfernt, per Zählabfrage auf 0 verifiziert

### Acceptance Criteria Status (Code-Review, sofern nicht anders vermerkt)

#### Zeiteinträge anzeigen
- [x] Alle Einträge mit Nutzer-E-Mail, Datum, Dauer, optionaler Notiz, sortiert nach Datum absteigend — Code-Review + im Smoke-Test live bestätigt (Join über `profiles`, korrekte Anzeige)
- [x] Leer-Zustand („Noch keine Zeit erfasst") — Code-Review
- [x] Gesamtdauer auf der Aufgaben-Karte — Code-Review + im Smoke-Test die zugrunde liegende Summenbildung live bestätigt (90 Minuten korrekt berechnet)

#### Zeit erfassen
- [x] Gültige Dauer + Datum → erscheint sofort, Gesamtdauer aktualisiert sich — Code-Review (Insert + Refetch + `useMemo`-Summe), Insert-Pfad im Smoke-Test live bestätigt
- [x] Dauer 0/negativ/>24 Std. → Validierungsfehler — Code-Review (Zod-Schema, durch Unit-Tests abgedeckt)
- [x] Kein/zukünftiges Datum → Validierungsfehler — **BUG-1 gefunden und behoben, siehe unten**
- [x] Verbindungsfehler → Fehlermeldung, Eingabe bleibt erhalten — Code-Review: `form.reset()` wird im Fehlerfall nicht aufgerufen, Werte bleiben im Formular

#### Zeiteintrag bearbeiten
- [x] Eigener Eintrag bearbeitbar — Code-Review (inline Bearbeiten-Formular, analog zu Kommentaren)
- [x] Fremder Eintrag ohne Bearbeiten-/Löschen-Option — Code-Review: Dropdown-Menü wird nur bei `entry.user_id === currentUserId` gerendert

#### Zeiteintrag löschen
- [x] Eigener Eintrag löschbar, Gesamtdauer aktualisiert sich — Code-Review + im Smoke-Test live bestätigt (Löschen als Ersteller erfolgreich, RLS ließ es zu)

### Edge Cases Status
- [x] EC-1 (gleichzeitige Erfassung) — strukturell unproblematisch (unabhängige Inserts), nicht als echte Nebenläufigkeit getestet
- [x] EC-2 (Team verlassen → „Ehemaliges Mitglied") — Code-Review: identische `profiles`-Join-Logik wie bei Kommentaren/Anhängen, dort bereits live bestätigt; für PROJ-8 nicht separat live getestet
- [x] EC-3 (Aufgabe gelöscht → Zeiteinträge kaskadieren) — Code-Review der Migration: `task_id ... references tasks(id) on delete cascade`, reine DB-Kaskade, nicht separat live getestet
- [x] EC-4 (viele Einträge → scrollbar) — Code-Review: identisches `ScrollArea h-80`-Muster wie PROJ-6/PROJ-7
- [x] EC-5 (unrealistisch hohe Dauer) — Code-Review: 24-Std.-Grenze sowohl clientseitig (Zod) als auch serverseitig (CHECK-Constraint) durchgesetzt
- [x] EC-6 (zukünftiges Datum) — siehe BUG-1, jetzt behoben und live verifiziert (Aufruf 3/4: Insert mit `current_date + 1` wurde korrekt mit Fehler abgelehnt)

### Security Audit Results
- [x] Authorization: SELECT/INSERT/DELETE-RLS im Smoke-Test tatsächlich mit einer echten Session durchlaufen (nicht nur Code-Review) — Team-Mitglied konnte eigenen Eintrag anlegen, sehen und löschen
- [ ] Authorization (Team-fremd / anderes Mitglied): **nicht live getestet** in dieser Runde — nur strukturelle Gleichheit zu PROJ-6/PROJ-7 angenommen (dort mehrfach bestätigt)
- [x] Input validation (XSS): `note` wird ausschließlich als React-JSX-Text gerendert, kein `dangerouslySetInnerHTML` in der Komponente — Code-Review
- [x] Validierungs-Tiefe (Defense-in-Depth): Dauer und Notiz-Länge waren von Anfang an sowohl client- als auch serverseitig abgesichert; das zukünftige Datum war es nicht — siehe BUG-1
- [ ] Rate limiting: nicht geprüft (entspricht dem Projekt-Standard für andere Features)

### Bugs Found

#### BUG-1: Zukünftiges Datum wurde serverseitig nicht abgelehnt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Ein Nutzer sendet (z. B. über die REST-API direkt, unter Umgehung der UI-Validierung) einen `task_time_entries`-Insert mit einem `entry_date` in der Zukunft
  2. Erwartet: Der Insert wird abgelehnt (laut Spec: „Datum darf nicht in der Zukunft liegen")
  3. Tatsächlich (vor dem Fix): Die Datenbank hatte keine serverseitige Prüfung für dieses Feld — nur die UI (natives `max`-Attribut des Datums-Inputs + Zod-Schema) verhinderte es. Anders als bei Dauer (CHECK-Constraint) und Notiz-Länge (CHECK-Constraint) fehlte hier die serverseitige Absicherung.
- **Root Cause:** Beim Schreiben der Migration wurde für `entry_date` kein serverseitiges Äquivalent zur clientseitigen Validierung ergänzt.
- **Status:** ✅ Behoben in derselben QA-Runde (Migration `proj8_fix_future_date_check`, ein `BEFORE INSERT OR UPDATE`-Trigger, der `entry_date > current_date` ablehnt) und live verifiziert: ein Insert-Versuch mit `current_date + 1` wurde korrekt mit Fehler `entry_date cannot be in the future` abgelehnt.
- **Priority:** Fixed

#### BUG-2: Mögliche Überfüllung der Aktionsleiste auf der Aufgaben-Karte (nicht visuell bestätigt)
- **Severity:** Low
- **Beobachtung:** Die Aktionsleiste der Aufgaben-Karte enthält jetzt vier Elemente in einer Reihe (Status-Auswahl + Kommentar-Icon + Anhang-Icon + neues Uhr-Icon). Das neue Uhr-Icon zeigt bei Bedarf einen Text wie „1,5 Std." an — deutlich länger als die reinen Zahlen-Badges der anderen beiden Icons. Auf schmalen Viewports (375px, mobile) könnte das zu Gedränge oder Umbruch in dieser Zeile führen.
- **Status:** Nicht visuell verifiziert — diese QA-Runde enthielt bewusst keinen Browser-Test (siehe Vorgehensweise-Hinweis oben). Reine Code-/Layout-Vermutung anhand der Tailwind-Klassen (`shrink-0` auf allen drei Icon-Buttons, `flex-1` nur auf der Status-Auswahl).
- **Priority:** Nice to have — vor dem nächsten `/frontend`- oder `/qa`-Durchlauf mit Browser-Zugriff einmal visuell auf 375px prüfen; kein Blocker für dieses Deployment, da rein kosmetisch und ggf. gar nicht auftretend

### Summary
- **Acceptance Criteria:** 11/11 erfüllt (per Code-Review, Kernpfad zusätzlich live im Smoke-Test bestätigt)
- **Bugs Found:** 2 total (1 Medium, 1 Low) — Medium-Bug behoben und live verifiziert, Low-Bug offen (nicht blockierend, kosmetisch, nicht visuell bestätigt)
- **Security:** Kein Datenleck oder Autorisierungsbruch gefunden; die Team-fremd-/Nicht-Ersteller-Abgrenzung wurde für PROJ-8 nicht eigenständig live verifiziert (nur strukturell), das ist ein bewusst akzeptiertes Restrisiko dieser reduzierten QA-Runde
- **Production Ready:** JA, mit Einschränkung — empfohlen für Deployment, da Kernfunktion nachweislich funktioniert und der einzige gefundene Bug behoben und verifiziert ist. Die nicht live getestete Autorisierungs-Abgrenzung (Team-fremd, anderes Mitglied) stützt sich auf bewährte, aber für diese Tabelle nicht eigens bestätigte Muster.
- **Recommendation:** Deploy. Falls Supabase-Zugriff später wieder unproblematisch ist, empfiehlt sich eine kurze Nachverifikation der UPDATE-Policy sowie der Team-fremd-Abgrenzung.

## Deployment
_To be added by /deploy_
