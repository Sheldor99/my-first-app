# PROJ-7: Dateianhänge an Aufgaben

## Status: In Progress
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
| Neue Datenbanktabelle für Anhang-Metadaten (Aufgabe, Hochlader, Dateiname, Größe, Typ, Zeitstempel, Speicherpfad), Datei selbst liegt in Supabase Storage | Trennt strukturierte Metadaten (durchsuchbar, per RLS absicherbar) von der eigentlichen Binärdatei; folgt demselben „eine Tabelle pro Entität"-Muster wie `task_comments` aus PROJ-6 | 2026-09-23 |
| Privater Supabase-Storage-Bucket, Speicherpfad nach Team und Aufgabe organisiert, Zugriff nur über zeitlich begrenzte signierte URLs | Ermöglicht, dieselbe „nur Team-Mitglieder"-Regel direkt anhand des Speicherpfads durchzusetzen (Storage-eigene Zugriffsregeln, analog zu RLS auf normalen Tabellen); keine dauerhaft gültigen URLs | 2026-09-23 |
| Größen- und Typ-Grenzen (10 MB, Allowlist) werden als Bucket-Konfiguration hinterlegt, nicht nur clientseitig geprüft | Der Speicherdienst selbst lehnt zu große oder falsch typisierte Uploads ab — ein Umgehungsversuch über eine manipulierte Anfrage bleibt wirkungslos, erfüllt die Sicherheitsanforderung „serverseitige Prüfung" aus der Spec | 2026-09-23 |
| Löschen einer Aufgabe entfernt zuerst die zugehörigen Dateien aus dem Speicherbereich (clientseitig ausgelöst), danach kaskadiert die Datenbank die Metadaten-Zeilen | Vermeidet verwaiste Dateien, ohne einen serverseitigen Hintergrunddienst (z. B. Datenbank-Webhook + Edge Function) einführen zu müssen — passt zum bisherigen Muster des Projekts ganz ohne eigenen Server-Code. Bewusst in Kauf genommene Einschränkung: Ein Löschen der Aufgabe unter Umgehung der App (direkt auf Datenbankebene) würde in diesem Fall verwaiste Dateien hinterlassen; für ein kleines internes Team-Tool wird dieses Risiko als akzeptabel bewertet | 2026-09-23 |
| Anhänge-Ansicht als eigener Dialog mit Anzahl-Anzeige auf der Karte, analog zu PROJ-6 | Bewährtes, konsistentes UI-Muster; kein neues Interaktionskonzept nötig | 2026-09-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
TaskCard (bestehend, erweitert)
└── Anhang-Icon mit Anzahl (neu, öffnet die Anhänge-Ansicht) — gleiches Muster wie der Kommentar-Zähler aus PROJ-6

Anhänge-Dialog (neu)
├── Anhangliste (Dateiname, Hochlader-E-Mail, Zeitstempel, Größe)
│   └── Pro eigenem Anhang: „Löschen"-Option
├── Leer-Zustand ("Noch keine Anhänge")
└── "Datei hochladen"-Button (öffnet Datei-Auswahl-Dialog des Betriebssystems)
```

### Data Model (plain language)
Eine neue Tabelle beschreibt jeden Anhang: Bezug zur Aufgabe, Hochlader, Dateiname, Dateigröße, Dateityp und Zeitstempel — plus einen Verweis auf den tatsächlichen Speicherort. Die eigentlichen Dateien selbst liegen nicht in der Datenbank, sondern in einem separaten, privaten Speicherbereich (Supabase Storage), organisiert nach Team und Aufgabe, damit dieselbe „nur Team-Mitglieder"-Regel direkt am Speicherpfad geprüft werden kann.

### Tech Decisions
- Privater Speicherbereich statt öffentlich — Dateien sind ausschließlich über kurzlebige, autorisierte Download-Links erreichbar.
- Größen- und Typ-Beschränkungen werden direkt auf Speicherbereichs-Ebene durchgesetzt, nicht nur in der Benutzeroberfläche.
- Neue Datenbanktabelle für Anhang-Metadaten, getrennt von der eigentlichen Datei — folgt demselben Muster wie die Kommentar-Tabelle aus PROJ-6.
- Löschen einer Aufgabe entfernt zuerst alle zugehörigen Dateien aus dem Speicherbereich, dann die Aufgabe selbst — clientseitig ausgelöst, ohne zusätzlichen Hintergrunddienst. Bewusste Einschränkung: Ein Löschen der Aufgabe unter Umgehung der App würde verwaiste Dateien hinterlassen; für dieses kleine interne Team-Tool als akzeptabel bewertet (mit dem Nutzer abgestimmt).
- Anhänge über eine eigene Ansicht mit Anzahl-Anzeige auf der Karte, analog zu den Kommentaren aus PROJ-6.

### Dependencies
Keine neuen npm-Pakete — der bereits verwendete Supabase-Client unterstützt Datei-Uploads und signierte Download-Links direkt.

## Backend Implementation Notes

### Datenbankschema
Neue Tabelle `task_attachments`:
- `id` (uuid, PK), `task_id` (uuid, FK → `tasks.id` ON DELETE CASCADE), `uploader_id` (uuid, FK → `auth.users.id` ON DELETE SET NULL — ermöglicht die „Ehemaliges Mitglied"-Anzeige aus den Edge Cases)
- `file_name` (text), `file_size` (bigint, CHECK 0 < Größe ≤ 10485760), `mime_type` (text), `storage_path` (text)
- `created_at` (timestamptz, default now())
- Index auf `(task_id, created_at)` für die sortierte Anzeige in der Anhänge-Liste
- Keine UPDATE-Policy — Anhänge werden laut Spec nie bearbeitet, nur gelöscht und neu hochgeladen

RLS-Policies auf `task_attachments` (RLS aktiviert):
- **SELECT** — Team-Mitglieder der zugehörigen Aufgabe (via `is_team_member()`, Join über `tasks` → `projects`)
- **INSERT** — nur als sich selbst (`uploader_id = auth.uid()`) und nur für Aufgaben des eigenen Teams
- **DELETE** — nur der Hochladende selbst (`uploader_id = auth.uid()`), zusätzlich weiterhin an Team-Mitgliedschaft gebunden

### Speicherbereich (Supabase Storage)
Neuer privater Bucket `task-attachments`:
- `public = false`, `file_size_limit = 10485760` (10 MB), `allowed_mime_types` = vollständige Allowlist aus den Technical Requirements (Bilder, PDF, Office-Formate, Text, ZIP) — als Bucket-Konfiguration hinterlegt, damit die Größen-/Typ-Prüfung serverseitig erzwungen wird, nicht nur clientseitig
- Pfadstruktur: `{team_id}/{task_id}/{uuid}-{dateiname}` — die `team_id` als erstes Pfadsegment erlaubt es, `storage.foldername(name)[1]::uuid` zusammen mit der bestehenden `is_team_member()`-Funktion für die Storage-RLS zu verwenden, ohne im Storage-Policy-Ausdruck über die Metadaten-Tabelle joinen zu müssen

RLS-Policies auf `storage.objects` (nur für `bucket_id = 'task-attachments'`):
- **SELECT/INSERT** — Team-Mitglieder, geprüft anhand des im Pfad eingebetteten `team_id`
- **DELETE** — nur der Eigentümer der Datei (`owner = auth.uid()`, automatisch von Supabase Storage beim Upload gesetzt)

### Verifikation (simulierte Sessions, alle bestanden)
Tabellen-Ebene (`task_attachments`):
- Team-Mitglied kann eigenen Anhang anlegen und sehen ✓
- Anderes Team-Mitglied (nicht Hochlader) kann den Anhang sehen, aber nicht löschen (0 betroffene Zeilen) ✓
- Team-fremder Nutzer sieht 0 Zeilen, Insert wird von RLS abgelehnt, Delete betrifft 0 Zeilen ✓
- Hochlader selbst kann eigenen Anhang löschen ✓

Storage-Ebene (`storage.objects`, Bucket `task-attachments`):
- Team-Mitglied kann Objekt unter dem eigenen Team-Pfad anlegen und sehen ✓
- Anderes Team-Mitglied sieht das Objekt, kann es aber nicht löschen (0 betroffene Zeilen) ✓
- Team-fremder Nutzer sieht 0 Zeilen, Insert unter fremdem Team-Pfad wird von RLS abgelehnt, Delete betrifft 0 Zeilen ✓
- Eigentümer der Datei kann sie löschen ✓
- Bucket-Konfiguration bestätigt: `public=false`, `file_size_limit=10485760`, vollständige `allowed_mime_types`-Liste ✓

Hinweis: Direkte SQL-DELETEs auf `storage.objects` sind durch einen Supabase-eigenen Schutztrigger (`storage.protect_delete()`) grundsätzlich gesperrt und wurden für die Tests gezielt über die Session-Einstellung `storage.allow_delete_query` freigeschaltet — im späteren Produktivbetrieb laufen echte Löschungen ausschließlich über die Storage-API (Supabase-Client im Frontend), wie in der Architektur vorgesehen.

`get_advisors(type: "security")` nach beiden Migrationen geprüft — keine neuen Findings, alle gemeldeten Punkte betreffen bereits bestehende Funktionen aus früheren Features.

Alle Testdaten (Nutzer, Team, Projekt, Aufgabe, Anhang-Zeilen, Storage-Objekte) nach Abschluss vollständig entfernt und über Zählabfragen auf 0 verifiziert.

### Migrationen
- `proj7_task_attachments` — Tabelle, RLS-Policies, Index
- `proj7_task_attachments_bucket` — Bucket-Eintrag + Storage-RLS-Policies

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
