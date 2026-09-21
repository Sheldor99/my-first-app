# PROJ-3: Projekte anlegen/verwalten

## Status: Planned
**Created:** 2026-09-21
**Last Updated:** 2026-09-21

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — `teams`, `team_members`, `projects`-Schema mit RLS
- PROJ-2 (Login/Signup) — eingeloggter Nutzer als Voraussetzung

## User Stories
- Als neuer Nutzer ohne Team möchte ich mein erstes Team erstellen, damit ich überhaupt Projekte anlegen kann.
- Als Nutzer möchte ich ein weiteres Team erstellen können, damit ich getrennte Projektbereiche für verschiedene Kontexte (z. B. mehrere Kunden) habe.
- Als Nutzer mit mehreren Teams möchte ich zwischen ihnen wechseln können, damit ich die richtigen Projekte sehe.
- Als Team-Mitglied möchte ich ein Projekt anlegen, damit ich Arbeit strukturieren kann.
- Als Team-Mitglied möchte ich Projekte bearbeiten und löschen können, damit die Projektliste aktuell bleibt.
- Als Team-Mitglied möchte ich vor dem Löschen eines Projekts gewarnt werden, dass auch dessen Aufgaben gelöscht werden, damit ich nicht versehentlich Daten verliere.

## Out of Scope
- Team löschen — verschoben nach PROJ-11 (Team-Mitglieder einladen/verwalten), da es alle Projekte/Aufgaben aller Mitglieder betrifft
- Team-Mitglieder einladen, entfernen, Rollen ändern — PROJ-11
- Team umbenennen — nicht spezifiziert, eigenes künftiges Ticket falls benötigt
- Aufgaben (Tasks) innerhalb eines Projekts — PROJ-4
- Kanban-Board-Ansicht — PROJ-5
- Owner-exklusive Projekt-Rechte — alle Team-Mitglieder dürfen Projekte anlegen/bearbeiten/löschen (siehe Decision Log)
- Eigene Projekt-Detailseite — Bearbeiten läuft über einen Dialog direkt in der Projektliste
- Schutz „letzter Owner verlässt Team" — gehört zu PROJ-11
- Pagination/Suche bei sehr vielen Projekten — für MVP reicht eine einfache scrollbare Liste

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Team erstellen (Onboarding)
- [ ] Angenommen ein eingeloggter Nutzer ist in keinem Team Mitglied, wenn er die Startseite aufruft, dann sieht er einen „Team erstellen"-Screen anstelle einer Projektliste
- [ ] Angenommen der Nutzer lässt das Team-Namen-Feld leer, wenn er absendet, dann wird ein Validierungsfehler angezeigt
- [ ] Angenommen der Nutzer gibt einen Team-Namen mit mehr als 100 Zeichen ein, wenn er absendet, dann wird ein Validierungsfehler angezeigt
- [ ] Angenommen der Nutzer gibt einen gültigen Team-Namen ein, wenn er absendet, dann wird das Team erstellt, der Nutzer automatisch als Owner eingetragen, und er landet in der (leeren) Projektübersicht dieses Teams

### Team wechseln / weiteres Team erstellen
- [ ] Angenommen ein Nutzer ist Mitglied in mindestens einem Team, wenn er die Startseite aufruft, dann sieht er eine Team-Auswahl sowie die Projekte des aktuell ausgewählten Teams
- [ ] Angenommen ein Nutzer ist Mitglied in mehreren Teams, wenn er ein anderes Team in der Team-Auswahl wählt, dann wechselt die Projektliste zum ausgewählten Team
- [ ] Angenommen ein Nutzer klickt auf „Neues Team erstellen", wenn er einen gültigen Namen absendet, dann wird das neue Team erstellt und sofort als aktives Team angezeigt

### Projekte anzeigen
- [ ] Angenommen das aktive Team hat keine Projekte, wenn die Übersicht lädt, dann wird ein Empty State mit Hinweistext und einem „Erstes Projekt anlegen"-Button angezeigt
- [ ] Angenommen das aktive Team hat Projekte, wenn die Übersicht lädt, dann werden alle Projekte mit Name und (falls vorhanden) Beschreibung angezeigt

### Projekt anlegen
- [ ] Angenommen ein Team-Mitglied gibt einen gültigen Projektnamen (optional mit Beschreibung) ein, wenn es absendet, dann wird das Projekt erstellt und erscheint sofort in der Liste
- [ ] Angenommen das Namensfeld ist leer, wenn das Formular abgesendet wird, dann wird ein Validierungsfehler angezeigt
- [ ] Angenommen der Projektname überschreitet 100 Zeichen oder die Beschreibung überschreitet 500 Zeichen, wenn das Formular abgesendet wird, dann wird ein Validierungsfehler angezeigt

### Projekt bearbeiten
- [ ] Angenommen ein Team-Mitglied öffnet den Bearbeiten-Dialog eines Projekts und ändert Name und/oder Beschreibung gültig, wenn es speichert, dann wird die Änderung übernommen und in der Liste sichtbar
- [ ] Angenommen das Namensfeld wird beim Bearbeiten geleert, wenn gespeichert wird, dann wird ein Validierungsfehler angezeigt und der Dialog bleibt offen

### Projekt löschen
- [ ] Angenommen ein Team-Mitglied klickt auf „Löschen" bei einem Projekt, wenn der Klick verarbeitet wird, dann erscheint ein Bestätigungsdialog mit explizitem Hinweis, dass auch alle Aufgaben des Projekts gelöscht werden
- [ ] Angenommen der Bestätigungsdialog wird bestätigt, wenn die Löschung verarbeitet wird, dann wird das Projekt (inkl. aller Aufgaben, Cascade Delete lt. PROJ-1) entfernt und verschwindet aus der Liste
- [ ] Angenommen der Bestätigungsdialog wird abgebrochen, wenn der Nutzer auf „Abbrechen" klickt, dann bleibt das Projekt unverändert erhalten

## Edge Cases
- Netzwerkfehler beim Erstellen/Bearbeiten/Löschen eines Projekts oder Teams → Fehlermeldung anzeigen, Formulareingaben bleiben erhalten
- Doppeltes schnelles Klicken auf Absenden/Löschen-Bestätigung → Button wird während des laufenden Requests deaktiviert, kein Doppel-Request
- Nutzer verliert während einer offenen Sitzung seine Mitgliedschaft im aktiven Team (z. B. wurde entfernt) → nächste Aktion auf dieses Team schlägt fehl und zeigt eine klare Fehlermeldung (RLS blockiert serverseitig ohnehin)
- Sehr viele Projekte in einem Team → Liste ist scrollbar, keine harte Begrenzung im MVP
- Nutzer versucht über eine direkte URL auf Projekte eines Teams zuzugreifen, in dem er kein Mitglied ist → RLS aus PROJ-1 liefert keine Daten, UI zeigt eine sinnvolle leere/Fehler-Ansicht statt eines Absturzes

## Technical Requirements
- Security: Kein Zugriff auf Teams/Projekte ohne Mitgliedschaft — vollständig durch die RLS-Policies aus PROJ-1 abgesichert
- Validierung: Team-Name Pflichtfeld max. 100 Zeichen; Projektname Pflichtfeld max. 100 Zeichen; Projektbeschreibung optional max. 500 Zeichen

## Open Questions
_Keine offenen Fragen — im Interview geklärt._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Team-Erstellen als Teil von PROJ-3 statt eigenem Ticket | Ohne Team kann kein Projekt existieren (Schema-Zwang aus PROJ-1); als eigenes Onboarding-Ticket wäre es unnötig fragmentiert | 2026-09-21 |
| Multi-Team-Unterstützung mit Team-Switcher statt nur einem Team pro Nutzer | Deckt den Freelancer-/Mehrfach-Kunden-Anwendungsfall aus dem PRD ab (Nutzer kann Mitglied mehrerer Agenturteams sein) | 2026-09-21 |
| Alle Team-Mitglieder dürfen Projekte anlegen/bearbeiten/löschen (kein Owner-Only) | Entspricht der bestehenden RLS aus PROJ-1 und dem PRD-Zielbild kleiner, vertrauensvoller Teams | 2026-09-21 |
| Bestätigungsdialog beim Löschen nennt explizit die mitgelöschten Aufgaben | Cascade Delete ist eine potenziell überraschende, destruktive Nebenwirkung — Transparenz verhindert versehentlichen Datenverlust | 2026-09-21 |
| Projekt-Bearbeiten über Dialog in der Liste statt eigener Detailseite | Es gibt noch keine Unterseiten-Inhalte (Aufgaben kommen erst mit PROJ-4); eine Detailseite wäre aktuell leer/unnötig | 2026-09-21 |
| Team-Löschen aus PROJ-3 herausgenommen, verschoben nach PROJ-11 | Noch drastischere Aktion als Projekt-Löschen (betrifft alle Mitglieder); gehört inhaltlich zur Team-Verwaltung | 2026-09-21 |
| Projektname max. 100 Zeichen, Beschreibung max. 500 Zeichen | Großzügige, aber sinnvolle Grenzen für ein Projekt-Management-Tool | 2026-09-21 |

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
