# PROJ-6: Kommentare zu Aufgaben

## Status: Planned
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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
