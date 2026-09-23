# PROJ-7: Dateianhänge an Aufgaben

## Status: Planned
**Created:** 2026-09-23
**Last Updated:** 2026-09-23

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Aufgaben, Supabase Storage
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Aufgaben-Datenmodell, an das Anhänge gehängt werden

## User Stories
- Als Team-Mitglied möchte ich eine Datei an eine Aufgabe anhängen, damit relevante Dokumente, Screenshots oder Referenzmaterial direkt am Kontext verfügbar sind.
- Als Team-Mitglied möchte ich alle Anhänge einer Aufgabe sehen und herunterladen, damit ich auf geteiltes Material zugreifen kann.
- Als Team-Mitglied möchte ich auf einen Blick sehen, wie viele Anhänge eine Aufgabe hat, ohne sie öffnen zu müssen, damit ich vorhandenes Material erkenne (analog zum Kommentar-Zähler aus PROJ-6).
- Als Hochlader möchte ich einen von mir hinzugefügten Anhang wieder entfernen können, falls ich die falsche Datei hochgeladen habe.
- Als Team-Mitglied möchte ich sehen, wer wann welche Datei hochgeladen hat, damit ich weiß, woher ein Dokument stammt.

## Out of Scope
- Vorschaubilder/Thumbnails für Bilddateien — reine Dateiliste mit Download-Link im MVP, Thumbnails sind ein späteres Nice-to-have
- Inline-Vorschau von Dateien im Browser — MVP bietet nur einen Download-Link, keine eingebettete Anzeige (z. B. PDF-Viewer)
- Bearbeiten/Ersetzen einer hochgeladenen Datei — stattdessen löschen und neu hochladen
- Versionierung von Dateien — kein MVP-Bedarf
- Kommentare zu einzelnen Anhängen — bereits durch die aufgabenweiten Kommentare aus PROJ-6 abgedeckt
- Owner-Moderationsrecht (fremde Anhänge löschen) — konsistent mit der PROJ-6-Entscheidung bleibt es bei „nur der Hochladende darf löschen", keine erweiterte Rechteverwaltung laut PRD-Non-Goal
- Antiviren-/Malware-Scan der Dateiinhalte — Non-Goal fürs MVP (kleiner, vertrauenswürdiger Nutzerkreis); stattdessen eine Allowlist erlaubter Dateitypen als Basisschutz
- Drag-and-Drop-Upload — MVP nutzt einen normalen Datei-Auswahl-Dialog per Button, Drag-and-Drop kann später ergänzt werden
- Öffentlich zugängliche Download-Links — bewusst ausgeschlossen (siehe Decision Log), Zugriff bleibt an eingeloggte Team-Mitglieder gebunden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Anhänge anzeigen
- [ ] Angenommen eine Aufgabe hat Anhänge, wenn ein Team-Mitglied die Anhänge-Ansicht öffnet, dann sieht es alle Anhänge mit Dateiname, Hochlader-E-Mail, Zeitstempel und Dateigröße
- [ ] Angenommen eine Aufgabe hat noch keine Anhänge, wenn die Anhänge-Ansicht geöffnet wird, dann erscheint ein Leer-Zustand („Noch keine Anhänge")
- [ ] Angenommen eine Aufgaben-Karte im Board hat Anhänge, wenn das Board angezeigt wird, dann zeigt die Karte die Anzahl der Anhänge an

### Datei hochladen
- [ ] Angenommen ein Team-Mitglied wählt eine gültige Datei (erlaubter Typ, innerhalb der Größengrenze) aus und lädt sie hoch, wenn der Upload erfolgreich ist, dann erscheint die Datei sofort in der Anhänge-Liste
- [ ] Angenommen die ausgewählte Datei überschreitet die maximale Dateigröße (10 MB), wenn der Upload gestartet wird, dann erscheint eine Validierungsfehlermeldung und die Datei wird nicht hochgeladen
- [ ] Angenommen die ausgewählte Datei hat einen nicht erlaubten Dateityp, wenn der Upload gestartet wird, dann erscheint eine Validierungsfehlermeldung und die Datei wird nicht hochgeladen
- [ ] Angenommen der Upload schlägt durch einen Verbindungsfehler fehl, wenn der Fehler auftritt, dann erscheint eine Fehlermeldung und keine unvollständige/verwaiste Datei bleibt zurück

### Datei herunterladen
- [ ] Angenommen ein Team-Mitglied klickt auf einen Anhang, wenn der Download-Link angefordert wird, dann kann die Datei heruntergeladen werden
- [ ] Angenommen ein Nutzer ist kein Mitglied des zugehörigen Teams, wenn er versucht, über einen Download-Link auf die Datei zuzugreifen, dann wird der Zugriff verweigert

### Anhang löschen
- [ ] Angenommen ein Nutzer hat einen Anhang selbst hochgeladen, wenn er „Löschen" wählt und bestätigt, dann wird der Anhang entfernt (Datenbankeintrag und gespeicherte Datei)
- [ ] Angenommen ein Nutzer hat einen Anhang NICHT selbst hochgeladen, wenn er die Anhänge-Liste sieht, dann hat er für diesen Anhang keine Löschen-Option

## Edge Cases
- Zwei Nutzer laden gleichzeitig Dateien an dieselbe Aufgabe hoch → beide werden unabhängig gespeichert, kein Konflikt
- Zwei Dateien mit demselben Dateinamen werden an dieselbe Aufgabe hochgeladen → beide werden separat gespeichert und angezeigt, keine überschreibt die andere
- Eine Aufgabe wird gelöscht, während oder nachdem Anhänge hochgeladen wurden → alle zugehörigen Anhänge (Datenbankeintrag und gespeicherte Datei) werden mitgelöscht, keine verwaisten Dateien bleiben im Speicher zurück
- Ein Nutzer verlässt das Team, nachdem er einen Anhang hochgeladen hat → der Anhang bleibt erhalten (kein Kaskadieren-Löschen), die Hochlader-Anzeige zeigt „Ehemaliges Mitglied" statt der E-Mail, analog zum in PROJ-6 geklärten Verhalten
- Sehr viele Anhänge an einer Aufgabe → die Liste scrollt innerhalb eines begrenzten Bereichs, kein unbegrenztes Wachsen der Ansicht (ausdrücklich als Anforderung aufgenommen, nachdem dies in PROJ-6 zunächst ein Bug war)
- Nutzer versucht, eine Datei mit doppelter Dateiendung oder manipuliertem MIME-Type hochzuladen, um die Typ-Prüfung zu umgehen → Upload wird serverseitig anhand des tatsächlichen Dateityps abgelehnt, nicht nur clientseitig anhand der Dateiendung

## Technical Requirements
- Security: Dateien werden in einem privaten Speicherbereich abgelegt; Herunterladen ist ausschließlich über zeitlich begrenzte, autorisierte Zugriffslinks für eingeloggte Mitglieder des zugehörigen Teams möglich — keine dauerhaft öffentlichen URLs
- Security: Hochladen/Ansehen ist auf Mitglieder des Teams beschränkt, dem die zugehörige Aufgabe gehört — dieselbe Berechtigungsgrenze wie bei Aufgaben (PROJ-4) und Kommentaren (PROJ-6)
- Security: Nur der Hochladende darf seinen eigenen Anhang löschen
- Security: Typ-Prüfung erfolgt serverseitig anhand des tatsächlichen Dateiinhalts, nicht nur anhand der clientseitig angegebenen Dateiendung
- Validierung: maximale Dateigröße 10 MB pro Datei
- Validierung: erlaubte Dateitypen — gängige Bildformate (JPEG, PNG, GIF, WebP), PDF, Office-Dokumente (Word, Excel, PowerPoint), einfache Textdateien und ZIP-Archive; ausführbare Dateien und Skript-/Markup-Typen mit Ausführungsrisiko (z. B. .exe, .sh, .html, .svg, .js) sind gesperrt

## Open Questions
_Keine offenen Fragen — Speicher-Zugriffsmodell im Interview geklärt (siehe Decision Log), übrige Entscheidungen konsistent mit bestehenden Mustern aus PROJ-4/PROJ-6 getroffen._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Privater Speicherbereich mit zeitlich begrenzten, autorisierten Zugriffslinks statt öffentlicher Dauer-URLs | Passt zum bestehenden RLS-Sicherheitsmodell der App; verhindert, dass eine geleakte oder weitergeleitete URL dauerhaft und ohne Login Zugriff auf Kundendaten gewährt | 2026-09-23 |
| Nur der Hochladende darf seinen eigenen Anhang löschen, kein Owner-Sonderrecht | Konsistent mit der Kommentar-Entscheidung aus PROJ-6 und dem „alle Mitglieder gleichberechtigt"-Muster aus PROJ-3/PROJ-4 | 2026-09-23 |
| Maximale Dateigröße 10 MB | Ausreichend für Screenshots, PDFs und typische Office-Dokumente einer kleinen Agentur; verhindert exzessiven Speicherverbrauch/Missbrauch | 2026-09-23 |
| Allowlist erlaubter Dateitypen (Bilder, PDF, Office-Dokumente, Text, ZIP), ausführbare/Skript-Typen gesperrt | Reduziert das Risiko schädlicher Uploads, ohne einen vollständigen Malware-Scan implementieren zu müssen (Non-Goal fürs MVP) | 2026-09-23 |
| Kein Drag-and-Drop, kein Inline-Vorschau, keine Thumbnails im MVP | Hält den Umfang klein; ein einfacher Auswahl-Dialog mit Download-Link deckt den Kernbedarf ab, ohne zusätzliche Komplexität | 2026-09-23 |
| Anhänge-Liste muss von Anfang an scrollbar begrenzt sein, nicht unbegrenzt wachsen | Direkte Lehre aus dem in PROJ-6 gefundenen und behobenen Scroll-Bug — diesmal von vornherein als Anforderung in der Spec verankert | 2026-09-23 |

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
