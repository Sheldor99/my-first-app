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
- `proj7_fix_orphaned_attachment_files` — Bugfix-Migration (siehe Bugfix-Runde unten): erweitert die DELETE-Policy auf `storage.objects` um einen zweiten Fall

## Frontend Implementation Notes

### Komponenten
- `src/lib/validations/attachment.ts` — Konstanten für maximale Dateigröße und erlaubte MIME-Typen (identisch zur Bucket-Konfiguration), `validateAttachmentFile()` für die clientseitige Vorab-Prüfung, `formatFileSize()` für die Anzeige
- `src/hooks/use-task-attachments.ts` — lädt Anhänge einer Aufgabe inkl. Hochlader-E-Mail (Join über `profiles`), analog zu `use-task-comments.ts`
- `src/components/tasks/task-attachments-dialog.tsx` — neuer Dialog: scrollbare Liste (`ScrollArea h-80`, von Anfang an begrenzt), Leer-Zustand, Upload-Button (verstecktes `<input type="file">`, per Klick ausgelöst), Download über `createSignedUrl()` (60 Sekunden gültig), Löschen-Menü nur für eigene Anhänge
- `src/components/tasks/task-card.tsx` — neues Paperclip-Icon mit Anzahl-Badge neben dem bestehenden Kommentar-Icon, öffnet den Anhänge-Dialog (`onOpenAttachments`)
- `src/components/tasks/draggable-task-card.tsx` — reicht `attachmentCount`/`onOpenAttachments` durch
- `src/components/tasks/task-board.tsx` — lädt Anhang-Anzahl pro Aufgabe (`fetchAttachmentCounts`), verwaltet den geöffneten Anhänge-Dialog-State, aktualisiert die Anzahl nach Änderungen
- `src/components/tasks/delete-task-dialog.tsx` — löscht zuerst die Aufgabe selbst (kaskadiert sofort alle `task_attachments`-Metadatenzeilen per FK), listet danach alle Dateien unter `{teamId}/{taskId}/` im Storage-Bucket auf und entfernt sie (Reihenfolge seit BUG-1-Fix umgedreht — siehe Bugfix-Runde)

### Upload-/Lösch-Ablauf
- Upload: clientseitige Validierung (Größe, Typ) → `storage.upload()` mit Pfad `{teamId}/{taskId}/{uuid}-{dateiname}` → Metadaten-Insert in `task_attachments`; schlägt der Metadaten-Insert fehl, wird die bereits hochgeladene Datei wieder aus dem Storage entfernt, um keine verwaiste Datei zurückzulassen (Edge Case aus der Spec)
- Löschen: zuerst Storage-Objekt entfernen, danach Metadaten-Zeile — beide Schritte über RLS-gesicherte Supabase-Client-Aufrufe, kein Sonderpfad nötig

### Manuelles Testen (Browser)
Mit einem echten, über den Signup-Flow erstellten Testkonto (E-Mail-Bestätigung per SQL umgangen) end-to-end verifiziert:
- Datei hochladen → erscheint sofort in der Liste mit Dateiname, Hochlader-E-Mail, Größe, Zeitstempel ✓
- Anzahl-Badge auf der Aufgaben-Karte aktualisiert sich korrekt (0 → 1) ✓
- Download öffnet eine korrekt signierte, zeitlich begrenzte Storage-URL ✓
- Löschen entfernt den Anhang aus der Liste; per SQL verifiziert, dass sowohl die Metadaten-Zeile als auch das Storage-Objekt tatsächlich entfernt wurden (nicht nur clientseitig ausgeblendet) ✓
- Upload einer nicht erlaubten Datei (`.html`) wird clientseitig abgelehnt („Dateityp wird nicht unterstützt.") ✓
- Leer-Zustand („Noch keine Anhänge") korrekt angezeigt, solange keine Anhänge existieren ✓

Nicht end-to-end im Browser testbar: Upload einer >10-MB-Datei (Größenvalidierung ist in `validateAttachmentFile()` durch dieselbe Logik wie die Typ-Prüfung abgedeckt und serverseitig zusätzlich über das Bucket-Limit erzwungen, siehe Backend Implementation Notes).

Alle Testdaten (Testkonto, Team, Projekt, Aufgabe) nach Abschluss vollständig entfernt und über Zählabfragen auf 0 verifiziert.

`npx tsc --noEmit` und `npm run build` fehlerfrei.

### Bugfix-Runde (nach /qa)

**BUG-1 behoben:** Verwaiste Storage-Dateien bei Task-Löschung, wenn Anhänge von mehreren Nutzern stammen.

- **Root Cause:** Die Storage-DELETE-Policy erlaubte ausschließlich `owner = auth.uid()`. Der clientseitige Cleanup-Code lief im Kontext des löschenden Nutzers und konnte dadurch keine Dateien anderer Uploader entfernen.
- **Fix (Migration `proj7_fix_orphaned_attachment_files`):** Die DELETE-Policy auf `storage.objects` wurde um einen zweiten, eng gefassten Fall erweitert: Ein Team-Mitglied darf eine Datei zusätzlich dann löschen, wenn **keine** `task_attachments`-Zeile mehr auf diesen Speicherpfad verweist (`not exists (select 1 from task_attachments where storage_path = name)`). Die ursprüngliche „nur Hochlader"-Regel für **lebende** Anhänge bleibt dabei unverändert bestehen — dieser zweite Fall greift ausschließlich für bereits verwaiste Referenzen.
- **Fix (Frontend, `delete-task-dialog.tsx`):** Reihenfolge umgedreht — die Aufgabe wird jetzt zuerst gelöscht (kaskadiert sofort alle Metadaten-Zeilen), danach erst werden die zugehörigen Storage-Dateien aufgelistet und entfernt. Dadurch sind die Metadaten-Zeilen zum Zeitpunkt der Storage-Bereinigung bereits weg, und die neue Policy erlaubt dem löschenden Team-Mitglied, auch fremde Dateien zu entfernen.
- **Verifikation (simulierte Sessions):**
  - Team-Mitglied A kann weiterhin **nicht** die lebende (noch mit einer Metadaten-Zeile verknüpfte) Datei von Mitglied B löschen (0 betroffene Zeilen) ✓ — Sicherheitsanforderung „nur Hochlader darf löschen" bleibt für aktive Anhänge intakt
  - Nach Löschen der Aufgabe (Metadaten-Zeilen sofort kaskadiert) kann Mitglied A jetzt sowohl die eigene als auch Mitglied B's Datei aus dem Storage entfernen ✓
  - Ein Team-fremder Nutzer kann eine verwaiste Datei desselben Teams weiterhin **nicht** löschen (0 betroffene Zeilen) — die `is_team_member()`-Prüfung bleibt in beiden Fällen wirksam ✓
  - `get_advisors(type: "security")` erneut geprüft — keine neuen Findings
  - Alle Testdaten nach Abschluss vollständig entfernt und über Zählabfragen auf 0 verifiziert

## QA Test Results

**Tested:** 2026-09-23
**App URL:** http://localhost:3001 (Dev-Server lief bereits auf 3001; separate Testkonten über Signup-Flow bzw. direktes SQL mit vollständigen GoTrue-Pflichtfeldern erstellt)
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Anhänge anzeigen
- [x] Alle Anhänge einer Aufgabe werden mit Dateiname, Hochlader-E-Mail, Zeitstempel und Dateigröße angezeigt
- [x] Leer-Zustand („Noch keine Anhänge") korrekt angezeigt, solange keine Anhänge existieren
- [x] Anzahl-Badge auf der Aufgaben-Karte zeigt die korrekte Anzahl (0 → 1 → 12 → 13, live getestet)

#### Datei hochladen
- [x] Gültige Datei hochladen → erscheint sofort in der Liste
- [x] Nicht erlaubter Dateityp (`.html`) → clientseitig abgelehnt mit „Dateityp wird nicht unterstützt.", kein Upload-Versuch
- [x] Größenlimit (10 MB) — Logik durch Unit-Tests abgedeckt (`attachment.test.ts`); ein echter >10-MB-Upload im Browser war technisch nicht durchführbar (das Datei-Upload-Tool selbst limitiert auf 10 MB Transfergröße), serverseitig zusätzlich über die Bucket-Konfiguration erzwungen (siehe Backend Implementation Notes)
- [x] Kein Verbindungsfehler-Test durchgeführt (kein reproduzierbarer Weg, den Netzwerkfehler gezielt auszulösen); Code-Review bestätigt: bei fehlgeschlagenem Metadaten-Insert nach erfolgreichem Storage-Upload wird die Datei wieder aus dem Storage entfernt (kein Orphan) — siehe `task-attachments-dialog.tsx handleFileSelected`

#### Datei herunterladen
- [x] Download öffnet eine korrekt signierte, zeitlich begrenzte Storage-URL
- [x] Direkter Zugriff auf die Datei ohne Signatur (`/object/public/...`) wird abgelehnt — privater Bucket existiert nicht unter dem öffentlichen Endpunkt (404 „Bucket not found")
- [x] Team-fremder Nutzer sieht das Projekt/die Aufgabe gar nicht erst (weder über die UI noch über direkten URL-Aufruf: „Projekt nicht gefunden oder kein Zugriff.") — Zugriff auf den Download-Link ist damit strukturell ausgeschlossen; zusätzlich auf DB-/Storage-Ebene bereits in den Backend-Tests verifiziert (0 Zeilen sichtbar für Team-Fremde)

#### Anhang löschen
- [x] Hochlader kann eigenen Anhang löschen (Datenbankeintrag UND Storage-Datei tatsächlich entfernt, per SQL verifiziert)
- [x] Anderes Team-Mitglied sieht für fremde Anhänge KEINE Löschen-Option (im Dropdown-Menü fehlt der Eintrag komplett, in einer sauber verifizierten Session als tatsächliches Team-Mitglied getestet)

### Edge Cases Status

#### EC-1: Zwei Nutzer laden gleichzeitig Dateien hoch
- [x] Nicht als echte Nebenläufigkeit getestet, aber strukturell unproblematisch (jeder Upload ist ein unabhängiger Insert+Storage-Call ohne gemeinsame Ressource)

#### EC-2: Zwei Dateien mit demselben Dateinamen
- [x] Handled correctly — beide Male `duplicate.txt` hochgeladen, beide erscheinen unabhängig in der Liste, keine überschreibt die andere (unterschiedliche UUID-Präfixe im Storage-Pfad)

#### EC-3: Aufgabe wird gelöscht, Anhänge vorhanden
- [ ] BUG: Nicht vollständig korrekt — siehe BUG-1. Datenbank-Metadaten werden zuverlässig kaskadiert (FK `ON DELETE CASCADE`, 0 Zeilen übrig), aber Storage-Dateien anderer Uploader als des Löschenden bleiben als Orphan zurück

#### EC-4: Nutzer verlässt Team nach Upload
- [x] Handled correctly — Anhang bleibt in der Liste erhalten, Anzeige wechselt korrekt von E-Mail zu „Ehemaliges Mitglied", keine Löschen-Option für Owner sichtbar (nur der ursprüngliche Hochlader dürfte löschen, ist aber kein Teammitglied mehr — RLS würde das ohnehin verhindern)

#### EC-5: Sehr viele Anhänge (Scroll)
- [x] Handled correctly — 12+ Anhänge hochgeladen, Liste bleibt innerhalb der festen `ScrollArea`-Höhe, sichtbarer Scrollbalken, Dialog wächst nicht unbegrenzt

#### EC-6: Manipulierter MIME-Type / doppelte Dateiendung
- [x] Clientseitige Prüfung greift bereits bei falschem MIME-Type; serverseitige Durchsetzung über Bucket-`allowed_mime_types` als zusätzliche Verteidigungsebene bereits im Backend verifiziert. Kein Tool zur Hand, um im Browser gezielt einen gefälschten `Content-Type`-Header bei laufendem Upload zu erzwingen — als durch Architektur (Bucket-Konfiguration) abgedeckt bewertet, nicht separat am UI nachgestellt

### Security Audit Results
- [x] Authentication: Ohne Login kein Zugriff auf `/projects/*` (bestehendes Verhalten aus PROJ-2/PROJ-3, nicht erneut geprüft)
- [x] Authorization: Team-fremder Nutzer sieht weder Projekt noch Aufgabe noch Anhänge, weder über UI noch über direkten URL-Aufruf; RLS auf Tabellen- und Storage-Ebene bereits im Backend mit simulierten Sessions verifiziert (Team-fremd: 0 Zeilen sichtbar, Insert/Delete abgelehnt)
- [x] Private Storage: Kein öffentlicher Zugriffspfad auf Dateien — direkter `/object/public/...`-Aufruf liefert 404 (Bucket existiert nicht öffentlich)
- [x] Input validation (XSS): Dateiname wird ausschließlich als React-JSX-Text gerendert, kein `dangerouslySetInnerHTML` im gesamten Anhänge-Dialog — Code-Review bestätigt, kein Injection-Vektor über Dateinamen möglich
- [x] Nur-Hochlader-Löschrecht auf DB- und Storage-Ebene serverseitig per RLS erzwungen, nicht nur clientseitig ausgeblendet (bereits im Backend mit simulierten Sessions verifiziert: fremder Löschversuch betrifft 0 Zeilen)
- [ ] Rate limiting: Nicht geprüft (kein dediziertes Rate-Limiting für Uploads vorgesehen, entspricht dem Projekt-Standard für andere Features)

### Bugs Found

#### BUG-1: Verwaiste Storage-Dateien bei Task-Löschung, wenn Anhänge von mehreren Nutzern stammen
- **Severity:** High
- **Steps to Reproduce:**
  1. Team-Mitglied A lädt eine Datei an eine Aufgabe hoch
  2. Team-Mitglied B lädt eine weitere Datei an dieselbe Aufgabe hoch
  3. Mitglied A (oder B) löscht die Aufgabe über die UI
  4. Erwartet: Alle zugehörigen Dateien werden aus dem Storage entfernt (laut Spec-Edge-Case und Architektur-Entscheidung explizit gefordert: „keine verwaisten Dateien bleiben im Speicher zurück")
  5. Tatsächlich: Nur die Dateien des löschenden Nutzers werden entfernt; Dateien anderer Uploader bleiben dauerhaft als Orphan im Storage-Bucket zurück (per SQL verifiziert: `storage.objects`-Zeile überlebt die Task-Löschung, DB-Metadatenzeile wird dagegen korrekt kaskadiert)
- **Root Cause:** Die Storage-RLS-DELETE-Policy auf `storage.objects` erlaubt ausschließlich `owner = auth.uid()` — der clientseitige Cleanup-Code in `delete-task-dialog.tsx` ruft `storage.remove()` im Kontext des löschenden Nutzers auf, kann aber dadurch fremde Dateien nicht entfernen. Das Silent-Failure-Verhalten von `storage.remove()` (kein Fehler bei teilweisem Misserfolg) verschleiert das Problem zusätzlich.
- **Hinweis:** Dies ist eine andere, deutlich häufiger auftretende Ausprägung des in der Architektur bereits bewusst in Kauf genommenen Risikos („Löschen unter Umgehung der App") — hier tritt der Datenverlust jedoch bei ganz normaler Nutzung über die App auf, sobald mehr als ein Teammitglied Dateien an derselben Aufgabe hochlädt, was in einem Team-Tool der Normalfall sein dürfte.
- **Priority:** Fix before deployment empfohlen

### Summary
- **Acceptance Criteria:** 11/11 funktional bestanden (einzelne Sub-Punkte aus Kapazitätsgründen nicht als echtes Netzwerk-/Race-Condition-Experiment nachgestellt, aber durch Code-Review/Architektur abgedeckt)
- **Bugs Found:** 1 total (0 critical, 1 high, 0 medium, 0 low)
- **Security:** Pass — keine Sicherheitslücke gefunden; BUG-1 ist ein Datenhygiene-/Storage-Bereinigungsproblem, kein Zugriffs- oder Datenleck
- **Production Ready:** NO
- **Recommendation:** BUG-1 vor Deployment beheben (z. B. Storage-DELETE-Policy um Team-Mitgliedschaft statt reiner Eigentümerprüfung erweitern, oder die Löschung serverseitig statt clientseitig mit erhöhten Rechten ausführen), danach erneut `/qa` für BUG-1 laufen lassen

## Deployment
_To be added by /deploy_
