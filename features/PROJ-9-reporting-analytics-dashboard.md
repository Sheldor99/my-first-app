# PROJ-9: Reporting/Analytics-Dashboard

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
