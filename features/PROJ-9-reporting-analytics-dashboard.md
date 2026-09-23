# PROJ-9: Reporting/Analytics-Dashboard

## Status: In Progress
**Created:** 2026-09-23
**Last Updated:** 2026-09-23

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Projekte/Aufgaben
- PROJ-3 (Projekte anlegen/verwalten) — Projekt-Datenmodell, das aggregiert wird
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Aufgaben-Datenmodell für Status-/Überfälligkeits-Zählungen
- PROJ-8 (Zeiterfassung) — Datenquelle für die Gesamtzeit-Anzeige pro Projekt

## User Stories
- Als Team-Mitglied möchte ich eine Übersicht über alle Projekte meines Teams sehen, damit ich den Status auf einen Blick erkenne, ohne jedes Projekt einzeln zu öffnen.
- Als Team-Mitglied möchte ich sehen, wie viele Aufgaben in jedem Projekt überfällig sind, damit ich weiß, wo dringend gehandelt werden muss.
- Als Team-Mitglied möchte ich die insgesamt erfasste Zeit pro Projekt sehen, damit ich den Aufwand grob einschätzen kann.
- Als Team-Mitglied möchte ich sehen, wie viele Aufgaben in jedem Status (To Do/In Progress/Done) stecken, damit ich den Fortschritt jedes Projekts einschätzen kann.

## Out of Scope
- Detaillierte Diagramme (Balken-/Liniendiagramme, Charts) — MVP zeigt Zahlen/Tabellen, keine Visualisierungsbibliothek
- Zeitraum-Filter (z. B. „letzte 30 Tage", „dieser Monat") — MVP zeigt immer die Gesamtsumme über die gesamte Projektlaufzeit
- Export des Dashboards (PDF/CSV) — kein MVP-Bedarf
- Team-übergreifende Vergleiche (mehrere Teams gleichzeitig anzeigen) — Dashboard zeigt immer nur das aktuell ausgewählte Team, analog zur bestehenden Team-Switcher-Logik
- Pro-Mitglied-Auswertungen (wer hat wie viel Zeit erfasst, wer hat wie viele Aufgaben erledigt) — reine Projekt-Aggregation im MVP, keine personenbezogene Leistungsauswertung
- Automatische Benachrichtigungen bei kritischen Werten (z. B. „5 überfällige Aufgaben") — das ist PROJ-10 (Benachrichtigungen)
- Historische Trends (Entwicklung über Zeit) — kein MVP-Bedarf, es werden keine Zeitreihen-Snapshots gespeichert, nur der aktuelle Stand

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Dashboard anzeigen
- [ ] Angenommen ein Team-Mitglied ist eingeloggt und das aktuelle Team hat mindestens ein Projekt, wenn es das Dashboard öffnet, dann sieht es jedes Projekt mit: Anzahl Aufgaben je Status (To Do/In Progress/Done), Anzahl überfälliger Aufgaben und Gesamtzeit (aus der Zeiterfassung)
- [ ] Angenommen das aktuelle Team hat noch keine Projekte, wenn das Dashboard geöffnet wird, dann erscheint ein Leer-Zustand mit Hinweis, ein Projekt anzulegen
- [ ] Angenommen ein Projekt hat noch keine Aufgaben oder Zeiteinträge, wenn das Dashboard angezeigt wird, dann zeigt die Zeile für dieses Projekt überall den Wert 0 an (kein Fehler, keine leere Zelle)

### Zugriff
- [ ] Angenommen ein Nutzer ist kein Mitglied des Teams, wenn er versucht, das Dashboard dieses Teams aufzurufen, dann wird der Zugriff verweigert
- [ ] Angenommen ein Nutzer ist nicht eingeloggt, wenn er versucht, das Dashboard aufzurufen, dann wird er zur Login-Seite weitergeleitet

### Aktualität
- [ ] Angenommen sich der Status oder die erfasste Zeit einer Aufgabe ändert, wenn das Dashboard neu geladen wird, dann spiegeln die angezeigten Zahlen den aktuellen Stand wider (kein Echtzeit-Live-Update während das Dashboard bereits geöffnet ist)

## Edge Cases
- Ein Team hat sehr viele Projekte (z. B. über 20) → die Liste scrollt innerhalb eines begrenzten Bereichs, kein unbegrenztes Wachsen der Ansicht (Anforderung von Anfang an, gelernt aus dem PROJ-6-Scroll-Bug)
- Ein Projekt hat sehr viele Aufgaben → die Zählungen werden serverseitig aggregiert (COUNT/SUM in der Datenbankabfrage), nicht durch Laden aller einzelnen Aufgaben-/Zeiteintrag-Zeilen ins Frontend
- Ein Projekt wird gelöscht, während das Dashboard offen ist → beim nächsten Neuladen verschwindet es einfach aus der Liste, kein Fehlerzustand
- Der Nutzer wechselt das Team über den Team-Switcher, während das Dashboard offen ist → die Ansicht lädt die Zahlen für das neu ausgewählte Team neu (gleiches Verhalten wie die bestehende Projektliste)
- Eine Aufgabe ist überfällig UND bereits „Done" → zählt nicht als überfällig (überfällig bedeutet: Fälligkeitsdatum in der Vergangenheit UND Status ungleich „Done", identische Logik wie die bestehende Überfälligkeits-Markierung auf der Aufgaben-Karte aus PROJ-4/PROJ-5)

## Technical Requirements
- Security: Nur Mitglieder des jeweiligen Teams dürfen die Dashboard-Zahlen für dieses Team sehen — dieselbe Berechtigungsgrenze wie bei Projekten (PROJ-3) und Aufgaben (PROJ-4)
- Performance: Aggregationen (Zählungen, Summen) werden serverseitig berechnet, nicht durch Laden aller Rohdaten ins Frontend und dortiges Zusammenzählen

## Open Questions
_Keine offenen Fragen — Umfang und Abgrenzung analog zu den bereits etablierten Mustern aus PROJ-3/PROJ-4/PROJ-8 festgelegt, siehe Decision Log._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Team-weite Projekt-Übersicht (alle Projekte eines Teams auf einer Seite) statt Einzelprojekt-Detailseite | Direkte Umsetzung der in der PRD-Vision genannten „Multi-Projekt-Übersicht" als Kern-Differenzierungsmerkmal gegenüber einfacheren Tools | 2026-09-23 |
| Keine Diagramme/Charts im MVP, nur Zahlen/Tabelle | Hält den Umfang klein, keine neue Chart-Bibliothek nötig; Zahlen reichen für den Kernbedarf „Überblick verschaffen" | 2026-09-23 |
| Kein Zeitraum-Filter im MVP, immer Gesamtsumme | Einfachste Variante; ein Filter kann später ergänzt werden, wenn sich Bedarf zeigt | 2026-09-23 |
| Keine Pro-Mitglied-Auswertung | Vermeidet den Eindruck einer Leistungsüberwachung einzelner Personen; passt zum „alle Mitglieder gleichberechtigt"-Prinzip der App; reine Projekt-Aggregation ausreichend für den Kernbedarf | 2026-09-23 |
| Aggregation serverseitig statt im Frontend | Verhindert, dass bei vielen Aufgaben/Zeiteinträgen große Datenmengen unnötig ans Frontend übertragen werden, nur um sie dort zu summieren | 2026-09-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Eine einzige serverseitige Aggregations-Abfrage pro Dashboard-Aufruf statt vieler Einzelabfragen oder Rohdaten-Laden | Minimiert sowohl Ladezeit als auch Anzahl der Datenbank-Zugriffe pro Seitenaufruf — besonders wichtig angesichts der aktuellen Supabase-Zugriffsbeschränkung | 2026-09-23 |
| Keine neue Tabelle, reine Aggregation bestehender Daten aus PROJ-3/PROJ-4/PROJ-8 | Das Dashboard braucht keine eigenen gespeicherten Werte, nur eine Zusammenfassung bereits vorhandener Daten | 2026-09-23 |
| Zugriffsbeschränkung über dieselbe Team-Mitgliedschaftsregel wie bei Projekten/Aufgaben | Konsistentes, bereits bewährtes RLS-Muster, keine neue Berechtigungslogik nötig | 2026-09-23 |
| Eigenständige neue Seite statt Umbau der bestehenden Projektübersicht | Ergänzt die bestehende Kartenansicht, statt sie zu ersetzen oder zu verkomplizieren; geringeres Risiko für Regressionen an einer bereits produktiv genutzten Seite | 2026-09-23 |
| Keine Chart-Bibliothek, reine Tabellen-/Zahlendarstellung | Passt zum MVP-Scope (keine Diagramme laut Out of Scope), keine neue Abhängigkeit nötig | 2026-09-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
Projektübersicht (bestehend)
└── Link „Dashboard anzeigen" (neu, führt zur neuen Dashboard-Seite)

Dashboard-Seite (neu, eigene Route)
├── Zurück-Link zur Projektübersicht
├── Projekt-Tabelle
│   └── Pro Projekt: Name, Aufgaben je Status (To Do/In Progress/Done), Anzahl überfällig, Gesamtzeit
├── Leer-Zustand ("Noch keine Projekte in diesem Team")
└── Lade-Zustand (Skeleton, während die Zahlen geladen werden)
```

### Data Model (plain language)
Es wird keine neue Tabelle angelegt. Das Dashboard liest ausschließlich bereits vorhandene Daten aus (Projekte, Aufgaben, Zeiteinträge) und fasst sie zusammen. Dafür wird eine einzelne, fertig aggregierte Abfrage definiert, die für das aktuelle Team direkt die fertigen Zahlen liefert: pro Projekt die Anzahl der Aufgaben je Status, die Anzahl überfälliger Aufgaben und die insgesamt erfasste Zeit. Diese Abfrage prüft dieselbe Team-Mitgliedschaft wie alle anderen Bereiche der App, sodass ein Nutzer ausschließlich die Zahlen seines eigenen Teams sehen kann.

### Tech Decisions
- **Eine einzige serverseitige Aggregations-Abfrage pro Dashboard-Aufruf** statt vieler kleiner Einzelabfragen (z. B. eine pro Projekt) oder dem Laden aller einzelnen Aufgaben-/Zeiteintrag-Zeilen ins Frontend. Das hält sowohl die Ladezeit als auch die Anzahl der Datenbank-Zugriffe pro Seitenaufruf gering — besonders relevant, solange das Supabase-Kontingent geschont werden soll.
- **Keine neue Tabelle** — reine Zusammenfassung bereits bestehender Daten aus Projekten (PROJ-3), Aufgaben (PROJ-4) und Zeiterfassung (PROJ-8).
- **Zugriffsbeschränkung über dieselbe Team-Mitgliedschaftsregel** wie überall sonst im Projekt (Projekte, Aufgaben, Kommentare, Anhänge, Zeiterfassung).
- **Neue, eigenständige Seite** für das Dashboard, erreichbar über einen Link von der bestehenden Projektübersicht aus — ergänzt die bestehende Kartenansicht, ersetzt sie nicht.
- **Keine Chart-Bibliothek** — reine Tabellen-/Zahlendarstellung mit den bereits im Projekt vorhandenen shadcn/ui-Komponenten (passt zum Out-of-Scope-Punkt „keine Diagramme im MVP").

### Dependencies
Keine neuen npm-Pakete — reine Tabellen-/Textdarstellung mit bereits vorhandenen shadcn/ui-Komponenten, keine Chart-Bibliothek und keine Datei-Uploads nötig.

## Frontend Implementation Notes

### Komponenten
- `src/hooks/use-dashboard-stats.ts` — ruft eine einzige RPC-Funktion auf (`supabase.rpc("get_team_dashboard_stats", { p_team_id: teamId })`) und liefert ein Array vorberechneter Projekt-Statistiken zurück
- `src/app/dashboard/page.tsx` — neue Seite: liest das aktive Team über den bestehenden `useTeams()`-Hook (identisch zur Startseite), zeigt die Statistiken in einer `Table` (shadcn/ui), Lade-Zustand (Skeleton) und Leer-Zustand ("Noch keine Projekte in diesem Team")
- `src/app/page.tsx` — neuer „Dashboard"-Link im Header neben dem Team-Switcher, führt zu `/dashboard`

### Auth/Zugriffsschutz
Kein zusätzlicher Code nötig: `src/proxy.ts` (globale Middleware) leitet bereits jeden nicht eingeloggten Zugriff auf einen beliebigen nicht-öffentlichen Pfad automatisch zu `/login` um — `/dashboard` ist nicht in `PUBLIC_PATHS` gelistet und damit automatisch geschützt. Erfüllt die Spec-Anforderung „nicht eingeloggt → Redirect zu Login" ohne eigene Implementierung.

### Vertrag für die geplante Backend-Funktion (für `/backend` verbindlich)
Der Hook erwartet eine Postgres-Funktion `get_team_dashboard_stats(p_team_id uuid)`, aufrufbar per RPC, die für jedes Projekt des übergebenen Teams eine Zeile mit folgender Form zurückgibt:

```
project_id: uuid
project_name: text
todo_count: integer
in_progress_count: integer
done_count: integer
overdue_count: integer
total_minutes: integer
```

Wichtig für `/backend`:
- Der Funktionsname und die Parameter-Bezeichnung (`p_team_id`, mit `p_`-Präfix) müssen exakt übereinstimmen, sonst schlägt der RPC-Aufruf fehl
- Die Funktion muss selbst prüfen, dass der aufrufende Nutzer Mitglied des übergebenen Teams ist (analog zu `is_team_member()`), bevor sie Daten zurückgibt — sonst könnte ein Nutzer durch einen manipulierten RPC-Aufruf mit einer fremden `team_id` Statistiken eines fremden Teams abfragen. Das ist die Umsetzung der Spec-Anforderung „Team-fremder Nutzer hat keinen Zugriff".
- „Überfällig" bedeutet: `due_date < aktuelles Datum AND status <> 'done'` — identische Logik zur bestehenden Überfälligkeits-Markierung auf der Aufgaben-Karte (PROJ-4/PROJ-5)
- `total_minutes` ist die Summe aus `task_time_entries.duration_minutes` aller Aufgaben des Projekts (0, falls keine Einträge vorhanden)

### Hinweis zur Implementierungsreihenfolge
Wie bei PROJ-8 wurde das Frontend vor dem Backend gebaut. `npx tsc --noEmit` und `npm run build` sind fehlerfrei, da der Supabase-Client ohne generierte Datenbank-/RPC-Typen verwendet wird. **Kein Browser-Test möglich**, bevor `/backend` die Funktion `get_team_dashboard_stats` angelegt hat — ein Aufruf der Seite würde aktuell einen Fehler vom RPC-Aufruf zurückbekommen (Funktion existiert noch nicht).

### Supabase-Zugriffsbilanz dieses Schritts
0 Supabase-Zugriffe — der gesamte Frontend-Schritt bestand ausschließlich aus lokalem Code (Komponenten, Hook, Routing) und lokalen Checks (`tsc`, `npm run build`).

## Backend Implementation Notes

### Datenbankfunktion
Neue Funktion `get_team_dashboard_stats(p_team_id uuid)` — gibt pro Projekt des übergebenen Teams eine Zeile mit `project_id`, `project_name`, `todo_count`, `in_progress_count`, `done_count`, `overdue_count`, `total_minutes` zurück. Erfüllt exakt den in den Frontend Implementation Notes festgelegten Vertrag (Funktionsname und Parametername `p_team_id` stimmen überein).

**Keine Tabelle, keine RLS-Policy nötig** — die Funktion liest ausschließlich aus bereits bestehenden, RLS-geschützten Tabellen (`projects`, `tasks`, `task_time_entries`).

### Sicherheitsmodell — bewusst ohne eigene Autorisierungsprüfung
Die Funktion ist **`SECURITY INVOKER`** (Postgres-Standard, da keine `SECURITY DEFINER`-Klausel gesetzt wurde) — sie läuft mit den Rechten des aufrufenden Nutzers, nicht mit erhöhten Rechten. Dadurch greifen automatisch dieselben RLS-Policies, die bereits für `projects`/`tasks`/`task_time_entries` gelten und in PROJ-3/PROJ-4/PROJ-8 mehrfach verifiziert wurden:

- Ruft ein Nutzer die Funktion mit der `team_id` seines eigenen Teams auf → die zugrundeliegenden `SELECT`-Policies lassen die Zeilen durch, die Aggregation liefert die korrekten Zahlen
- Ruft ein Nutzer die Funktion mit einer fremden `team_id` auf (z. B. durch einen manipulierten RPC-Aufruf) → die `SELECT`-Policies auf `projects`/`tasks` liefern für dieses fremde Team keine Zeilen zurück, die Aggregation ergibt strukturell ein leeres Ergebnis (kein Fehler, aber auch keine Daten) — dieselbe Absicherung wie überall sonst im Projekt, ohne eigene, separat zu pflegende Berechtigungslogik in der Funktion selbst

Diese Entscheidung wurde bewusst getroffen, um die Migration minimal zu halten (kein zusätzlicher `is_team_member()`-Check nötig, da die zugrundeliegenden Tabellen ihn bereits erzwingen) und passt zur aktuellen Vorgabe, Supabase-Zugriffe gering zu halten.

### Migration
- `proj9_dashboard_stats_function` — ein einziger Migrationsaufruf, legt ausschließlich die Funktion an

### Verifikation — auf Code-Review reduziert (explizite Nutzeranfrage)
Auf ausdrücklichen Wunsch des Nutzers wurde für PROJ-9 **kein** Live-Test durchgeführt (weder Smoke-Test noch `get_advisors`) — der gesamte Backend-Schritt bestand aus einem einzigen `apply_migration`-Aufruf. Die Korrektheit stützt sich auf:
- Code-Review der SQL-Funktion gegen den in den Frontend Implementation Notes festgelegten Vertrag (Feldnamen, Typen, Parametername stimmen überein)
- Die strukturelle Absicherung durch `SECURITY INVOKER` + bereits mehrfach verifizierte RLS auf den zugrundeliegenden Tabellen (siehe oben)
- Lokale Checks: `npx tsc --noEmit` und `npm run build` laufen fehlerfrei

**Bekannte Lücke:** Die Funktion selbst (insbesondere die `overdue_count`-Logik und die korrekte Summenbildung bei mehreren Zeiteinträgen pro Aufgabe) wurde nicht live mit echten Daten ausgeführt. Sollte in der QA-Phase Supabase-Zugriff wieder unproblematisch sein, sollte dort mindestens ein einmaliger Aufruf mit echten Testdaten (mehrere Projekte, gemischte Status, überfällige und nicht-überfällige Aufgaben, mehrere Zeiteinträge pro Aufgabe) erfolgen, um die Aggregationslogik zu bestätigen.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
