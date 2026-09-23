# PROJ-10: Benachrichtigungen

## Status: In Progress
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
- `src/app/page.tsx` und `src/app/dashboard/page.tsx` — Glocke im jeweiligen Header eingebunden

### Bekannte Lücke: keine globale Kopfzeile im Projekt
Das Projekt hat aktuell keine gemeinsame Layout-Kopfzeile (`src/app/layout.tsx` enthält nur `<Toaster />`, jede Seite baut ihren eigenen Header). Die Glocke wurde daher nur auf den zwei Seiten mit vorhandenem Header eingebunden (Startseite, Dashboard). **Die Aufgaben-Detailseite (`/projects/[id]`) hat gar keinen Header** und zeigt die Glocke daher nicht — ein vorbestehender struktureller Zustand des Projekts, keine Neueinführung durch dieses Feature. Eine echte „von überall erreichbar"-Lösung würde einen größeren Refactor (gemeinsame Layout-Kopfzeile für alle eingeloggten Seiten) erfordern, der über den Rahmen dieses Features hinausgeht.

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

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
