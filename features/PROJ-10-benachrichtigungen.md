# PROJ-10: Benachrichtigungen

## Status: Deployed
**Created:** 2026-09-23
**Last Updated:** 2026-09-23

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Aufgaben
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Zuweisungs-Ereignis als Trigger
- PROJ-6 (Kommentare zu Aufgaben) — Kommentar-Ereignis als Trigger

## User Stories
- Als Team-Mitglied möchte ich benachrichtigt werden, wenn mir eine Aufgabe zugewiesen wird, damit ich weiß, dass ich etwas zu tun habe.
- Als Team-Mitglied möchte ich benachrichtigt werden, wenn jemand einen Kommentar zu einer mir zugewiesenen Aufgabe hinzufügt, damit ich zeitnah reagieren kann.
- Als Team-Mitglied möchte ich alle meine Benachrichtigungen an einem Ort sehen, damit ich nichts verpasse.
- Als Team-Mitglied möchte ich auf einen Blick sehen, wie viele ungelesene Benachrichtigungen ich habe, ohne die Liste öffnen zu müssen.
- Als Team-Mitglied möchte ich Benachrichtigungen als gelesen markieren (einzeln oder alle auf einmal), damit meine Liste übersichtlich bleibt.

## Out of Scope
- E-Mail- oder Push-Benachrichtigungen — nur In-App-Benachrichtigungen im MVP, keine Drittanbieter-Integration (laut PRD-Non-Goal)
- Benachrichtigung bei überfälligen Aufgaben — bräuchte einen wiederkehrenden Hintergrundjob (Cron), nicht Teil des rein ereignisgesteuerten MVP; spätere Ergänzung möglich
- Konfigurierbare Benachrichtigungseinstellungen (welche Ereignisse, Stummschalten) — MVP hat feste, nicht abschaltbare Trigger
- Benachrichtigungen für Anhänge (PROJ-7) oder Zeiterfassung (PROJ-8) — nur die in der Roadmap deklarierten Abhängigkeiten (Zuweisung, Kommentare) sind im MVP-Scope
- Echtzeit-Push ohne Neuladen (z. B. über WebSockets/Realtime, während die Seite bereits offen ist) — MVP zeigt den Stand beim Laden/Neuladen der Seite
- Benachrichtigung an sich selbst über eigene Aktionen (z. B. Selbstzuweisung, Kommentar auf eigener Aufgabe) — ausdrücklich ausgeschlossen
- Löschen von Benachrichtigungen — nur „gelesen markieren" im MVP, kein Entfernen aus der Liste

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Benachrichtigung erhalten
- [ ] Angenommen ein Team-Mitglied wird von einer anderen Person einer Aufgabe zugewiesen, wenn die Zuweisung gespeichert wird, dann erhält die zugewiesene Person eine neue Benachrichtigung
- [ ] Angenommen ein Nutzer weist sich eine Aufgabe selbst zu, wenn die Zuweisung gespeichert wird, dann erhält er dafür keine Benachrichtigung
- [ ] Angenommen jemand kommentiert eine Aufgabe, die einem anderen Nutzer zugewiesen ist, wenn der Kommentar gespeichert wird, dann erhält die zugewiesene Person eine neue Benachrichtigung
- [ ] Angenommen ein Nutzer kommentiert eine ihm selbst zugewiesene Aufgabe, wenn der Kommentar gespeichert wird, dann erhält er dafür keine Benachrichtigung

### Benachrichtigungen anzeigen
- [ ] Angenommen ein Nutzer hat ungelesene Benachrichtigungen, wenn er eingeloggt ist, dann sieht er die Anzahl ungelesener Benachrichtigungen (z. B. an einem Glocken-Symbol), ohne die Liste öffnen zu müssen
- [ ] Angenommen ein Nutzer öffnet die Benachrichtigungsliste, wenn sie geladen ist, dann sieht er alle seine Benachrichtigungen mit Beschreibung, Zeitpunkt und Link zur betroffenen Aufgabe, neueste zuerst
- [ ] Angenommen ein Nutzer hat noch keine Benachrichtigungen, wenn er die Liste öffnet, dann erscheint ein Leer-Zustand

### Benachrichtigung als gelesen markieren
- [ ] Angenommen ein Nutzer klickt auf eine ungelesene Benachrichtigung, dann wird sie als gelesen markiert und die ungelesene Anzahl verringert sich
- [ ] Angenommen ein Nutzer wählt „Alle als gelesen markieren", dann werden alle seine ungelesenen Benachrichtigungen als gelesen markiert

## Edge Cases
- Eine Aufgabe wird gelöscht, nachdem eine Benachrichtigung dazu erstellt wurde → die Benachrichtigung wird mitgelöscht (Datenbank-Kaskade), kein toter Link oder Fehlerzustand
- Ein Nutzer verlässt das Team, nachdem er eine Benachrichtigung ausgelöst hat (z. B. durch einen Kommentar) → für den Empfänger bleibt die Benachrichtigung erhalten, die Anzeige zeigt „Ehemaliges Mitglied" statt des Namens, analog zu PROJ-6/PROJ-7/PROJ-8
- Sehr viele Benachrichtigungen → die Liste scrollt innerhalb eines begrenzten Bereichs, kein unbegrenztes Wachsen der Ansicht (Anforderung von Anfang an, gelernt aus dem PROJ-6-Scroll-Bug und dem in PROJ-9 übersehenen Fall)
- Die Zuweisung einer Aufgabe wechselt mehrfach schnell hintereinander (Person A → B → C) → jede tatsächliche Zuweisungsänderung an eine andere Person erzeugt eine eigene Benachrichtigung für die jeweils neu zugewiesene Person
- Ein Kommentar wird gelöscht, nachdem er eine Benachrichtigung ausgelöst hat → die Benachrichtigung bleibt bestehen, da sie ein historisches Ereignis dokumentiert und keinen Live-Zustand des Kommentars abbildet

## Technical Requirements
- Security: Ein Nutzer darf ausschließlich seine eigenen Benachrichtigungen sehen und als gelesen markieren — keine Einsicht in Benachrichtigungen anderer Nutzer, auch nicht innerhalb desselben Teams
- Performance: Die Anzahl ungelesener Benachrichtigungen soll effizient abfragbar sein (Zählung), nicht durch Laden aller Benachrichtigungs-Zeilen ins Frontend

## Open Questions
_Keine offenen Fragen — Umfang und Trigger-Auswahl konsistent mit den in INDEX.md deklarierten Abhängigkeiten (PROJ-4, PROJ-6) und den etablierten Mustern aus PROJ-6/7/8/9 festgelegt, siehe Decision Log._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur zwei Trigger im MVP: Zuweisung und Kommentar auf eigener Aufgabe | Entspricht genau den in der Roadmap deklarierten Abhängigkeiten (PROJ-4, PROJ-6); hält den Umfang klein und testbar | 2026-09-23 |
| Keine Benachrichtigung bei überfälligen Aufgaben im MVP | Würde einen wiederkehrenden Hintergrundjob erfordern — neue Infrastruktur-Kategorie, die es im Projekt noch nicht gibt; bewusst für eine spätere Erweiterung zurückgestellt | 2026-09-23 |
| Keine E-Mail-/Push-Benachrichtigungen | Passt zum PRD-Non-Goal „keine Integrationen mit Drittsystemen"; In-App reicht für ein kleines, eng zusammenarbeitendes Team | 2026-09-23 |
| Keine Selbstbenachrichtigung bei eigenen Aktionen | Vermeidet unnötigen Lärm; ein Nutzer weiß bereits, was er selbst getan hat | 2026-09-23 |
| Nur „gelesen markieren", kein Löschen von Benachrichtigungen | Einfachster Zustand (gelesen/ungelesen) reicht für den Kernbedarf; Löschen wäre zusätzliche Komplexität ohne klaren Mehrwert im MVP | 2026-09-23 |
| Kein Echtzeit-Update (kein Realtime/WebSocket) | Konsistent mit dem übrigen Projekt, das durchgehend auf Neuladen statt Live-Sync setzt (z. B. PROJ-9-Dashboard); vermeidet neue technische Komplexität | 2026-09-23 |
| Benachrichtigungsliste muss von Anfang an scrollbar begrenzt sein | Direkte Lehre aus dem PROJ-6-Scroll-Bug und dem in PROJ-9 (BUG-1) übersehenen Fall — diesmal von vornherein als Anforderung verankert | 2026-09-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Automatische Erzeugung von Benachrichtigungen durch die Datenbank (Trigger) statt durch App-Code | Garantiert, dass jede tatsächliche Zuweisungs-/Kommentar-Änderung zuverlässig eine Benachrichtigung auslöst, unabhängig vom Code-Pfad; folgt dem bereits etablierten Muster automatischer DB-Regeln im Projekt | 2026-09-23 |
| Neue eigenständige Tabelle für Benachrichtigungen | Klare Trennung von Aufgaben/Kommentaren, folgt dem „eine Tabelle pro Entität"-Muster aus PROJ-6/7/8 | 2026-09-23 |
| Zugriffsregel: nur der Empfänger sieht seine eigenen Benachrichtigungen (kein Team-weiter Zugriff) | Benachrichtigungen sind persönlich, anders als die sonst team-weite Sichtbarkeit bei Aufgaben/Kommentaren/Anhängen | 2026-09-23 |
| Ungelesene Anzahl per Zählabfrage statt Laden aller Zeilen | Performance-Anforderung aus der Spec direkt umgesetzt | 2026-09-23 |
| Dropdown/Sheet ab der Glocke statt eigener Seite | Schneller Zugriff von überall in der App, kein unnötiger Seitenwechsel | 2026-09-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
App-Header (bestehend, auf der Startseite)
└── Benachrichtigungs-Glocke mit Anzahl ungelesen (neu) — öffnet die Benachrichtigungs-Ansicht

Benachrichtigungs-Ansicht (neu, Dropdown/Sheet ab der Glocke, kein eigener Seitenwechsel)
├── „Alle als gelesen markieren"-Button
├── Liste der Benachrichtigungen (Beschreibung, Zeitpunkt, Link zur betroffenen Aufgabe), neueste zuerst
│   └── Klick auf eine Benachrichtigung → als gelesen markieren + Sprung zur Aufgabe
└── Leer-Zustand ("Keine Benachrichtigungen")
```

### Data Model (plain language)
Eine neue Tabelle beschreibt jede Benachrichtigung: für wen sie bestimmt ist, welche Aufgabe betroffen ist, welche Art von Ereignis sie ausgelöst hat (Zuweisung oder Kommentar), wer das Ereignis ausgelöst hat, ob sie bereits gelesen wurde, und ein Zeitstempel. Die Einträge werden nicht von der App selbst beim Speichern erzeugt, sondern automatisch von der Datenbank, sobald eine Zuweisung geändert oder ein Kommentar hinzugefügt wird — so kann keine Codeänderung versehentlich vergessen, eine Benachrichtigung auszulösen.

### Tech Decisions
- **Automatische Erzeugung durch die Datenbank** (nicht durch die App-Oberfläche) bei Zuweisung/Kommentar — stellt sicher, dass jede tatsächliche Änderung zuverlässig eine Benachrichtigung auslöst, unabhängig davon, über welchen Weg im Code die Änderung passiert. Folgt demselben Muster wie bereits bestehende automatische Datenbank-Regeln im Projekt (z. B. die automatische Owner-Zuweisung bei Team-Erstellung).
- **Neue, eigenständige Tabelle** für Benachrichtigungen, getrennt von Aufgaben/Kommentaren.
- **Strengere Zugriffsregel als sonst im Projekt üblich:** Ein Nutzer sieht ausschließlich seine eigenen Benachrichtigungen — anders als bei Aufgaben/Kommentaren/Anhängen, wo alle Team-Mitglieder alles sehen, ist eine Benachrichtigung rein persönlich.
- **Ungelesene Anzahl über eine schnelle Zählabfrage**, nicht durch Laden aller Benachrichtigungs-Zeilen ins Frontend.
- **Dropdown/Sheet statt eigener Seite** — die Glocke ist von überall in der App erreichbar, ein Seitenwechsel würde den schnellen Zugriff unnötig verlangsamen.

### Dependencies
Keine neuen npm-Pakete — Verwendung bereits vorhandener shadcn/ui-Komponenten (Popover oder Sheet, kombiniert mit der bereits mehrfach genutzten ScrollArea für die scrollbare Liste).

## Frontend Implementation Notes

### Komponenten
- `src/hooks/use-notifications.ts` — lädt Benachrichtigungen des eingeloggten Nutzers (`recipient_id = auth.uid()`), reichert sie mit Aufgaben-Titel/Projekt-ID (Join über `tasks`) und Auslöser-E-Mail (Join über `profiles`) an; `markAsRead(id)` und `markAllAsRead()` mit optimistischem UI-Update und Rollback per Neuladen bei Fehler
- `src/components/notifications/notification-bell.tsx` — Glocken-Icon mit Anzahl-Badge, öffnet ein `Popover` mit scrollbarer Liste (`ScrollArea h-80`, von Anfang an begrenzt), „Alle als gelesen markieren"-Button, Leer-Zustand („Keine Benachrichtigungen")
- `src/components/layout/app-header.tsx` — neue, gemeinsame Kopfzeile (Team-Switcher, Dashboard-Link, Glocke, E-Mail, Logout), selbstständig (lädt eigene Auth-/Team-Daten)
- `src/components/layout/team-provider.tsx` — React-Context, der `useTeams()` einmal zentral hält, damit `AppHeader` und die Seiteninhalte denselben Team-Zustand teilen (ein Team-Wechsel im Header aktualisiert sofort die Projektliste/das Dashboard, ohne Neuladen)
- `src/app/(main)/layout.tsx` — neues Layout für die Routen-Gruppe `(main)`, umschließt `AppHeader` + `TeamProvider` um alle eingeloggten Seiten

### Nachträglicher Refactor: gemeinsame Layout-Kopfzeile (auf Nutzerwunsch)
Ursprünglich hatte das Projekt keine gemeinsame Kopfzeile — jede Seite baute ihre eigene. Auf ausdrücklichen Wunsch wurde das nachträglich behoben:
- `src/app/page.tsx`, `src/app/dashboard/page.tsx` und `src/app/projects/[id]/page.tsx` wurden nach `src/app/(main)/...` verschoben (Next.js Route-Gruppe — ändert die URLs nicht: weiterhin `/`, `/dashboard`, `/projects/[id]`)
- Beide bisherigen Seiten-Header (Startseite, Dashboard) wurden entfernt und durch die eine gemeinsame `AppHeader`-Komponente im neuen `(main)/layout.tsx` ersetzt
- **Nebeneffekt:** Die Aufgaben-Detailseite (`/projects/[id]`) hat jetzt zum ersten Mal überhaupt eine Kopfzeile (vorher gar keine) — Glocke, Team-Switcher und Dashboard-Link sind jetzt auch dort sichtbar
- **Löst nebenbei BUG-2 aus der PROJ-9-QA** (kein Team-Switcher auf der Dashboard-Seite) — die Dashboard-Seite hat jetzt denselben Team-Switcher wie überall sonst
- Öffentliche Seiten (`/login`, `/signup`, `/forgot-password`, `/reset-password`) liegen weiterhin außerhalb der `(main)`-Gruppe und sind unverändert ohne Kopfzeile

### Verlinkung zur Aufgabe
Da einzelne Aufgaben keine eigene URL/Ankerstelle im Aufgaben-Board haben, verlinkt eine Benachrichtigung auf die Projektseite (`/projects/{project_id}`), auf der die Aufgabe liegt — nicht direkt auf die Aufgabe selbst (kein Scroll-to/Highlight). Das erfüllt die Spec-Anforderung „Link zur betroffenen Aufgabe" auf der gröbsten sinnvollen Ebene, die mit der bestehenden Board-Struktur möglich ist, ohne das Board selbst zu erweitern.

### Vertrag für die geplante Backend-Tabelle (für `/backend` verbindlich)
Der Hook erwartet eine Tabelle `notifications` mit mindestens folgenden Spalten:

```
id: uuid
recipient_id: uuid       -- für wen die Benachrichtigung ist
task_id: uuid (nullable) -- betroffene Aufgabe, FK auf tasks(id) ON DELETE CASCADE
actor_id: uuid (nullable) -- wer das Ereignis ausgelöst hat, FK auf auth.users(id) ON DELETE SET NULL
type: text                -- 'assignment' | 'comment'
is_read: boolean
created_at: timestamptz
```

Wichtig für `/backend`:
- `task_id` muss `ON DELETE CASCADE` auf `tasks(id)` gesetzt sein — erfüllt den Spec-Edge-Case „Aufgabe gelöscht → Benachrichtigung wird mitgelöscht"
- `actor_id` muss `ON DELETE SET NULL` auf `auth.users(id)` gesetzt sein — ermöglicht die „Ehemaliges Mitglied"-Anzeige, analog zu PROJ-6/7/8
- Die Zeilen müssen laut Architektur-Entscheidung **automatisch per Datenbank-Trigger** entstehen (bei Zuweisungsänderung auf `tasks` und bei Insert auf `task_comments`), nicht durch App-Code
- RLS: `recipient_id = auth.uid()` für SELECT und UPDATE — strenger als das sonstige Team-weite Muster, siehe Architektur-Entscheidung
- Keine Selbstbenachrichtigung: Trigger muss prüfen, dass `actor_id <> recipient_id`, bevor eine Zeile eingefügt wird

### Hinweis zur Implementierungsreihenfolge
Wie bei PROJ-8/PROJ-9 wurde das Frontend vor dem Backend gebaut. `npx tsc --noEmit` und `npm run build` sind fehlerfrei, da der Supabase-Client ohne generierte Datenbank-Typen verwendet wird. **Kein Browser-Test möglich**, bevor `/backend` die Tabelle `notifications` und die auslösenden Trigger angelegt hat.

### Supabase-Zugriffsbilanz dieses Schritts
0 Supabase-Zugriffe — ausschließlich lokaler Code und lokale Checks (`tsc`, `npm run build`).

## Backend Implementation Notes

### Datenbankschema
Neue Tabelle `notifications`:
- `id` (uuid, PK), `recipient_id` (uuid, FK → `auth.users.id` ON DELETE CASCADE — für wen die Benachrichtigung ist), `task_id` (uuid, FK → `tasks.id` ON DELETE CASCADE — erfüllt den Edge Case „Aufgabe gelöscht → Benachrichtigung mitgelöscht"), `actor_id` (uuid, FK → `auth.users.id` ON DELETE SET NULL — ermöglicht „Ehemaliges Mitglied")
- `type` (text, CHECK `in ('assignment', 'comment')`), `is_read` (boolean, default false), `created_at` (timestamptz, default now())
- Index auf `(recipient_id, created_at desc)` für die sortierte Anzeige und die schnelle Zählung ungelesener Einträge

RLS-Policies auf `notifications` (RLS aktiviert):
- **SELECT** — nur `recipient_id = auth.uid()` (strenger als das sonstige Team-weite Muster, siehe Architektur-Entscheidung)
- **UPDATE** — nur `recipient_id = auth.uid()` (für „als gelesen markieren")
- **Keine INSERT/DELETE-Policy für normale Nutzer** — Benachrichtigungen entstehen ausschließlich über die unten beschriebenen Trigger, kein Client darf sie direkt anlegen oder löschen

### Automatische Erzeugung per Trigger (wie in der Architektur festgelegt)
Zwei `SECURITY DEFINER`-Trigger-Funktionen (notwendig, da eine Benachrichtigung für eine *andere* Person als den Handelnden angelegt wird — eine normale RLS-Policy könnte das nicht erlauben, da `recipient_id` dabei nie `auth.uid()` des Auslösers ist):

- `notify_task_assignment()` — `AFTER UPDATE` auf `tasks`. Legt eine Benachrichtigung an, wenn `assignee_id` sich tatsächlich ändert (`IS DISTINCT FROM`), der neue Assignee nicht null ist, und der neue Assignee nicht der Handelnde selbst ist (`<> auth.uid()`) — erfüllt „keine Selbstbenachrichtigung bei Selbstzuweisung"
- `notify_task_comment()` — `AFTER INSERT` auf `task_comments`. Ermittelt den `assignee_id` der kommentierten Aufgabe; legt eine Benachrichtigung an, wenn ein Assignee gesetzt ist und dieser nicht der Kommentator selbst ist — erfüllt „keine Selbstbenachrichtigung bei eigenem Kommentar"

Beide Funktionen lesen `auth.uid()` innerhalb der Trigger-Funktion, um den Handelnden zu ermitteln — das funktioniert unabhängig von `SECURITY DEFINER`, da `auth.uid()` eine sitzungsbezogene Einstellung ausliest, keine Berechtigung der ausführenden Rolle.

### Migration
- `proj10_notifications` — ein einziger Migrationsaufruf: Tabelle, RLS-Policies, Index, beide Trigger-Funktionen und Trigger
- `proj10_fix_assignee_team_membership_check` — Bugfix-Migration aus der QA-Runde (siehe QA Test Results, BUG-1): ersetzt `notify_task_assignment()` um eine Team-Mitgliedschaftsprüfung für `new.assignee_id`

### Verifikation — auf Code-Review reduziert (explizite Nutzeranfrage)
Auf ausdrücklichen Wunsch des Nutzers wurde **kein** Live-Test durchgeführt — der gesamte Backend-Schritt bestand aus einem einzigen `apply_migration`-Aufruf. Die Korrektheit stützt sich auf:
- Code-Review der SQL gegen den in den Frontend Implementation Notes festgelegten Vertrag (Spaltennamen, Typen stimmen überein)
- Sorgfältiges Lesen der Trigger-Bedingungen (`IS DISTINCT FROM`, `<> auth.uid()`, `<> new.author_id`) gegen die entsprechenden Acceptance Criteria
- Lokale Checks: `npx tsc --noEmit` und `npm run build` laufen fehlerfrei

**Bekannte Lücke:** Die Trigger-Logik wurde nie mit echten Daten ausgeführt — insbesondere nicht bestätigt: (1) dass eine Zuweisungsänderung durch eine dritte Person tatsächlich eine Benachrichtigung für den neuen Assignee erzeugt, (2) dass Selbstzuweisung/Selbstkommentar korrekt KEINE Benachrichtigung erzeugt, (3) dass ein Nutzer ausschließlich seine eigenen Benachrichtigungen sieht. Sollte in der QA-Phase Supabase-Zugriff wieder unproblematisch sein, sollte dort ein einmaliger Smoke-Test mit zwei Testnutzern erfolgen (Zuweisung + Kommentar, jeweils mit und ohne Selbstbezug).

## QA Test Results

**Tested:** 2026-09-23
**App URL:** Kein Browser-Test durchgeführt (siehe unten) — Verifikation per Code-Review + einem gezielten Sicherheits-Check
**Tester:** QA Engineer (AI)

### Hinweis zur Vorgehensweise (explizite Nutzeranfrage + eine Ausnahme)
Der Nutzer bat um minimalen Supabase-Zugriff für diese QA-Runde. Diese Runde bestand daher überwiegend aus Code-Review + der bestehenden Vitest-Suite. **Eine Ausnahme:** Ein beim Code-Review entdeckter, sicherheitsrelevanter Verdacht (siehe BUG-1) wurde mit 3 gezielten, rein lesenden Supabase-Abfragen verifiziert (RLS-Policy-Definition von `tasks`, Trigger-Liste, `get_advisors`) — das war laut Projekt-Vereinbarung explizit erlaubt, da Sicherheitsfragen Vorrang vor der Zugriffs-Minimierung haben.

### Acceptance Criteria Status (per Code-Review)

#### Benachrichtigung erhalten
- [x] Zuweisung durch andere Person → Benachrichtigung — Code-Review: Trigger-Bedingung `new.assignee_id IS NOT NULL AND IS DISTINCT FROM old.assignee_id AND <> auth.uid()` korrekt
- [x] Selbstzuweisung → keine Benachrichtigung — durch dieselbe Bedingung abgedeckt (`<> auth.uid()`)
- [x] Kommentar auf fremd zugewiesener Aufgabe → Benachrichtigung — Trigger prüft `v_assignee_id <> new.author_id`
- [x] Kommentar auf eigener Aufgabe → keine Benachrichtigung — durch dieselbe Bedingung abgedeckt

#### Benachrichtigungen anzeigen
- [x] Ungelesene Anzahl sichtbar ohne Liste zu öffnen — Badge am Glocken-Icon, immer sichtbar
- [x] Liste mit Beschreibung, Zeitpunkt, Link zur Aufgabe, neueste zuerst — Hook sortiert `created_at desc`; Link führt auf `/projects/{project_id}` (siehe Scope-Anmerkung in den Frontend-Notizen zur fehlenden Aufgaben-Detailansicht)
- [x] Leer-Zustand — vorhanden

#### Als gelesen markieren
- [x] Klick auf ungelesene Benachrichtigung → gelesen, Anzahl sinkt — optimistisches Update + Neuladen bei Fehler
- [x] „Alle als gelesen markieren" — analog umgesetzt

### Edge Cases Status
- [x] Aufgabe gelöscht → Benachrichtigung kaskadiert — `task_id ... references tasks(id) on delete cascade` in der Migration bestätigt
- [x] Mitglied verlässt Team → „Ehemaliges Mitglied" — identisches `profiles`-Join-Muster wie PROJ-6/7/8, dort bereits live bestätigt
- [x] Viele Benachrichtigungen → scrollbar — `ScrollArea h-80` von Anfang an vorhanden
- [x] Schnelle Zuweisungswechsel → je eine eigene Benachrichtigung pro tatsächlicher Änderung — durch Row-Level-Trigger-Semantik (pro UPDATE eine Auswertung) gegeben
- [x] Kommentar gelöscht → Benachrichtigung bleibt — keine FK-Kopplung von `notifications` an `task_comments`, strukturell unmöglich, dass ein Comment-Delete die Notification löscht

### Security Audit Results
- [x] RLS SELECT/UPDATE auf `notifications`: `recipient_id = auth.uid()` — Code-Review, nicht live mit zwei echten Nutzern getestet (siehe bekannte Lücke aus `/backend`)
- [x] XSS: `notificationText()` wird als reiner JSX-Text gerendert, kein `dangerouslySetInnerHTML`
- [x] **BUG-1 (siehe unten): behoben und live re-verifiziert**
- [x] `get_advisors(type: "security")` geprüft: `notify_task_assignment`/`notify_task_comment` sind laut Linter theoretisch per RPC aufrufbar (`anon`/`authenticated`) — praktisch ungefährlich, da Postgres Funktionen mit `RETURNS trigger` außerhalb eines echten Trigger-Kontexts grundsätzlich nicht direkt ausführen lässt (Fehler „trigger functions can only be called as triggers")
- Nebenbefund (nicht PROJ-10 zuzurechnen): `get_advisors` zeigt, dass die PROJ-8/PROJ-9-Funktionen `reject_future_time_entry_date` und `get_team_dashboard_stats` kein `SET search_path` haben (unser PROJ-10-Funktionen haben es korrekt gesetzt) — vorbestehende Lücke, hier nur der Vollständigkeit halber vermerkt, kein PROJ-10-Bug

### Bugs Found

#### BUG-1: Zuweisungs-Trigger validiert `assignee_id` nicht gegen Team-Mitgliedschaft — bestätigter Informationsleck
- **Severity:** High
- **Steps to Reproduce:**
  1. Team-Mitglied A kennt (z. B. aus einem anderen Kontext) die User-ID einer beliebigen Person X, die **nicht** Mitglied des Teams ist
  2. A weist eine Aufgabe des Teams per direktem API-Aufruf (unter Umgehung der UI-Dropdown-Einschränkung, die nur Team-Mitglieder zur Auswahl anbietet) `assignee_id = X` zu
  3. Erwartet: Die Zuweisung wird abgelehnt, oder zumindest keine Benachrichtigung an X ausgelöst
  4. Tatsächlich (bestätigt per SQL-Review): Die `UPDATE`-RLS-Policy auf `tasks` prüft nur, ob **A** (der Aktualisierende) Team-Mitglied ist (`USING is_team_member(...)`) — es gibt **keine `WITH CHECK`-Klausel**, die den neuen `assignee_id`-Wert selbst validiert. Der `notify_task_assignment`-Trigger prüft ebenfalls nicht, ob `new.assignee_id` Team-Mitglied ist, und legt anstandslos eine Benachrichtigung für X an — X erhält dadurch den Aufgaben-Titel und die Information, dass diese Aufgabe existiert, obwohl X keinerlei Zugriffsrecht auf das Team hat
- **Root Cause:** Zwei zusammenwirkende Lücken: (1) `tasks.assignee_id` wird serverseitig nirgends auf tatsächliche Team-Mitglieder beschränkt — eine bereits in PROJ-4 angelegte, bisher folgenlose Lücke, da eine „falsche" Zuweisung vorher nur zu einer stillen Fehlanzeige führte; (2) PROJ-10s neuer Trigger vertraut `assignee_id` blind und macht die Lücke erstmals aktiv ausnutzbar (Informationsleck statt nur einer stillen Dateninkonsistenz)
- **Priority:** Fix before deployment — Blocker
- **Status:** ✅ Behoben (Migration `proj10_fix_assignee_team_membership_check`) — `notify_task_assignment()` ermittelt jetzt zusätzlich das Team der Aufgabe (`projects.team_id` über `new.project_id`) und prüft per `EXISTS`-Abfrage gegen `team_members`, ob `new.assignee_id` tatsächlich Mitglied dieses Teams ist, **bevor** eine Benachrichtigung angelegt wird. Die tieferliegende Lücke in PROJ-4 (fehlende `WITH CHECK`-Klausel auf der `tasks`-UPDATE-Policy) bleibt bewusst unangetastet — das war explizit nicht Teil dieses Fixes, da der Trigger-seitige Check das konkrete Informationsleck bereits vollständig schließt, unabhängig davon, ob `assignee_id` selbst weiterhin auf beliebige User-IDs gesetzt werden kann.
- **Re-Test (2026-09-23, minimaler Live-Test mit 3 echten Testnutzern):** Team-Mitglied A weist eine Aufgabe zunächst einem echten Team-Mitglied B zu, dann demselben Task-Datensatz einem Team-fremden Nutzer X. Ergebnis (per Admin-Abfrage ohne RLS-Filterung verifiziert): **genau eine** Benachrichtigungszeile existiert — `recipient_id = B`, `type = 'assignment'` — für X wurde **keine** Benachrichtigung angelegt. Die Zuweisung an X selbst wird weiterhin nicht verhindert (bekannte, bewusst unangetastete Restlücke aus PROJ-4), aber der Informationsleck über die Benachrichtigung ist geschlossen. Alle Testdaten (3 Nutzer, Team, Projekt, Aufgabe, Benachrichtigung) danach vollständig entfernt und auf 0 verifiziert.
- **Hinweis zur Zugriffsbilanz:** Für Fix + Verifikation wurden 6 Supabase-Zugriffe benötigt (mehr als die anfänglich geschätzten ~3) — ein Zwischenschritt lieferte fälschlich ein leeres Ergebnis, weil die eigene Prüf-Abfrage nach `SET LOCAL role authenticated` selbst der `recipient_id = auth.uid()`-RLS-Policy unterlag und dadurch die Benachrichtigungen anderer Nutzer nicht sehen konnte — kein Fehler im Fix selbst, sondern ein Fehler in der ersten Testmethodik, der zwei zusätzliche Diagnose-Abfragen kostete.

#### BUG-2: Kein Fehler-Feedback beim Markieren als gelesen
- **Severity:** Low
- **Beobachtung:** Schlägt `markAsRead`/`markAllAsRead` in `use-notifications.ts` fehl, wird stillschweigend neu geladen (Rollback des optimistischen Updates) — anders als bei jedem anderen Feature im Projekt (Kommentare, Anhänge, Zeiterfassung) erscheint **kein** `toast.error(...)`. Der Nutzer bemerkt einen Fehlschlag nicht.
- **Priority:** Nice to have

#### BUG-3: Doppelter `auth.getUser()`-Aufruf auf der Startseite
- **Severity:** Low
- **Beobachtung:** `src/app/(main)/page.tsx` und `src/components/layout/app-header.tsx` laden unabhängig voneinander den eingeloggten Nutzer, statt sich einen gemeinsamen Zustand zu teilen (wie es für den Team-Zustand bereits sauber über `TeamProvider` gelöst wurde). Funktional harmlos, nur eine unnötige zusätzliche Anfrage pro Seitenaufruf.
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 11/11 per Code-Review erfüllt
- **Bugs Found:** 3 total (1 High **behoben und live re-verifiziert**, 0 medium, 2 low offen/nicht blockierend)
- **Security:** BUG-1 war ein bestätigter Autorisierungs-/Informationsleck-Fehler, mit einem minimalen Live-Test (3 echte Testnutzer) verifiziert behoben — Team-fremde Zuweisung erzeugt jetzt nachweislich keine Benachrichtigung mehr, legitime Zuweisung weiterhin korrekt
- **Production Ready:** JA — kein Critical/High-Bug mehr offen. BUG-2/BUG-3 sind Low und nicht blockierend.
- **Recommendation:** Deploy. Optional, nicht blockierend: die tieferliegende Lücke in PROJ-4 schließen (`WITH CHECK`-Klausel auf der `tasks`-UPDATE-Policy, die `assignee_id` gegen Team-Mitgliedschaft prüft) — der akute Informationsleck über Benachrichtigungen ist bereits geschlossen, aber `assignee_id` kann weiterhin auf beliebige User-IDs gesetzt werden, was bei zukünftigen Features erneut relevant werden könnte.

## Deployment
**Deployed:** 2026-09-23
**Art:** Lokales Deployment — kein Vercel-Deployment (Projektentscheidung, gilt für alle Features)

### Pre-Deployment Checks
- [x] `npm run build` erfolgreich (Turbopack, keine Fehler; Routen unverändert trotz `(main)`-Routen-Gruppe: `/`, `/dashboard`, `/projects/[id]`)
- [ ] `npm run lint` — bekannte, vorbestehende Lücke im Template, nicht spezifisch für PROJ-10
- [x] QA freigegeben (Status: Approved, BUG-1 behoben und live re-verifiziert, BUG-2/BUG-3 sind Low/nicht blockierend)
- [x] Beide Migrationen bereits im Live-Supabase-Projekt angewendet (`proj10_notifications`, `proj10_fix_assignee_team_membership_check`) — für `/deploy` keine weitere Migration nötig
- [x] Keine Secrets im Git-Verlauf committet
- [x] Aller Code committet

### Verifikation — über den Login-Check hinaus, da diese Runde einen bereichsübergreifenden Refactor enthält
Anders als bei PROJ-8/PROJ-9 (reiner Login-Seiten-Check, 0 Supabase-Zugriffe) wurde für dieses Deployment ein **etwas tieferer** Live-Test als „notwendig" eingestuft: Der gemeinsame Layout-Header (`(main)/layout.tsx` + `AppHeader`) betrifft **alle** authentifizierten Seiten, nicht nur PROJ-10 selbst — ein reiner Login-Check hätte das Risiko einer Regression auf der Start-, Dashboard- oder Projektseite im Produktions-Build nicht abgedeckt.

Mit einem echten Testkonto (Team + Projekt + Aufgabe) durchgeführt:
- `npm run build` + `npm run start` auf Scratch-Port 3041
- **Startseite** (`/`): gemeinsamer Header rendert korrekt (Team-Switcher, Dashboard-Link, Glocke, E-Mail, Logout)
- **Dashboard** (`/dashboard`): Header inkl. Team-Switcher (bestätigt nebenbei den PROJ-9-BUG-2-Fix); `get_team_dashboard_stats` liefert im Produktions-Build erstmals live korrekte Zahlen (1 To Do, 0 sonst, 0 Std.) — schließt die in PROJ-9 offen gebliebene „nie live getestet"-Lücke für diese Funktion nebenbei
- **Projektseite** (`/projects/[id]`): hat jetzt zum ersten Mal überhaupt einen Header (vorher keiner); Aufgaben-Board rendert korrekt mit allen drei Icons (Kommentare, Anhänge, Zeiterfassung)
- Benachrichtigungs-Glocke geöffnet: Popover zeigt korrekt den Leer-Zustand („Keine Benachrichtigungen")
- Keine Konsolenfehler auf allen drei Seiten
- Alle Testdaten (1 Nutzer, Team, Projekt, Aufgabe) danach vollständig entfernt und auf 0 verifiziert
- Produktions-Server danach gestoppt

### Bookkeeping
- Git-Tag `v1.10.0-PROJ-10` erstellt
- `features/INDEX.md`: Status auf **Deployed** gesetzt
- `docs/PRD.md`: Roadmap-Status auf **Deployed** gesetzt
