# PROJ-10: Benachrichtigungen

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
