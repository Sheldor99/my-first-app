# PROJ-8: Zeiterfassung

## Status: Planned
**Created:** 2026-09-23
**Last Updated:** 2026-09-23

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — RLS-Berechtigungen für Teams/Aufgaben
- PROJ-4 (Aufgaben: Status, Zuweisung, Fälligkeitsdatum) — Aufgaben-Datenmodell, an das Zeiteinträge gehängt werden

## User Stories
- Als Team-Mitglied möchte ich die Zeit, die ich an einer Aufgabe gearbeitet habe, erfassen, damit der tatsächliche Aufwand sichtbar wird.
- Als Team-Mitglied möchte ich alle Zeiteinträge einer Aufgabe sehen, damit ich nachvollziehen kann, wer wann wie lange daran gearbeitet hat.
- Als Team-Mitglied möchte ich die Gesamtdauer einer Aufgabe auf einen Blick sehen, ohne die Einträge einzeln öffnen zu müssen (analog zum Kommentar-/Anhang-Zähler aus PROJ-6/PROJ-7).
- Als Nutzer möchte ich einen von mir erfassten Zeiteintrag korrigieren können, falls ich mich bei Dauer oder Datum vertippt habe.
- Als Nutzer möchte ich einen von mir erfassten Zeiteintrag löschen können, falls er versehentlich angelegt wurde.

## Out of Scope
- Start/Stopp-Timer (Live-Zeiterfassung mit laufender Uhr) — MVP nutzt manuelle Eingabe von Dauer und Datum im Nachhinein, kein laufender Hintergrund-Timer
- Abrechnung, Rechnungsstellung, Stundensätze — explizit als PRD-Non-Goal ausgeschlossen
- Aggregierte Zeiterfassung auf Projekt- oder Team-Ebene (Dashboards, Summen über mehrere Aufgaben) — das ist Teil von PROJ-9 (Reporting/Analytics-Dashboard)
- Genehmigungsworkflow (z. B. Owner muss Zeiteinträge freigeben, bevor sie zählen) — keine erweiterte Rechteverwaltung über Owner/Member hinaus laut PRD-Non-Goal
- Bearbeiten oder Löschen fremder Zeiteinträge durch Owner oder andere Mitglieder — konsistent mit der Kommentar-/Anhang-Entscheidung aus PROJ-6/PROJ-7 bleibt es bei „nur der Ersteller darf ändern/löschen"
- Export der Zeiterfassungsdaten (CSV/PDF) — kein MVP-Bedarf, spätere Ergänzung möglich
- Zeiteinträge ohne Bezug zu einer Aufgabe (z. B. allgemeine Team-Meetings) — jeder Eintrag ist immer an genau eine Aufgabe gebunden

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Zeiteinträge anzeigen
- [ ] Angenommen eine Aufgabe hat Zeiteinträge, wenn ein Team-Mitglied die Zeiterfassungs-Ansicht öffnet, dann sieht es alle Einträge mit Nutzer-E-Mail, Datum, Dauer und optionaler Notiz, sortiert nach Datum absteigend
- [ ] Angenommen eine Aufgabe hat noch keine Zeiteinträge, wenn die Ansicht geöffnet wird, dann erscheint ein Leer-Zustand („Noch keine Zeit erfasst")
- [ ] Angenommen eine Aufgaben-Karte im Board hat Zeiteinträge, wenn das Board angezeigt wird, dann zeigt die Karte die Gesamtdauer aller Einträge an (z. B. „3,5 Std.")

### Zeit erfassen
- [ ] Angenommen ein Team-Mitglied gibt eine gültige Dauer (größer 0, maximal 24 Stunden) und ein Datum (heute oder in der Vergangenheit) ein, wenn es speichert, dann erscheint der Eintrag sofort in der Liste und die Gesamtdauer auf der Karte aktualisiert sich
- [ ] Angenommen die Dauer ist 0, negativ oder größer als 24 Stunden, wenn der Nutzer speichert, dann erscheint eine Validierungsfehlermeldung und der Eintrag wird nicht gespeichert
- [ ] Angenommen kein Datum ist ausgewählt oder das Datum liegt in der Zukunft, wenn gespeichert wird, dann erscheint eine Validierungsfehlermeldung
- [ ] Angenommen das Speichern schlägt durch einen Verbindungsfehler fehl, wenn der Fehler auftritt, dann erscheint eine Fehlermeldung und die eingegebenen Werte bleiben im Formular erhalten

### Zeiteintrag bearbeiten
- [ ] Angenommen ein Nutzer hat einen Zeiteintrag selbst erstellt, wenn er ihn bearbeitet und speichert, dann werden Dauer, Datum und Notiz aktualisiert und die Gesamtdauer passt sich an
- [ ] Angenommen ein Nutzer hat einen Zeiteintrag NICHT selbst erstellt, wenn er die Liste sieht, dann hat er für diesen Eintrag weder Bearbeiten- noch Löschen-Option

### Zeiteintrag löschen
- [ ] Angenommen ein Nutzer hat einen Zeiteintrag selbst erstellt, wenn er „Löschen" wählt und bestätigt, dann wird der Eintrag entfernt und die Gesamtdauer auf der Karte aktualisiert sich

## Edge Cases
- Zwei Nutzer erfassen gleichzeitig Zeit an derselben Aufgabe → beide Einträge werden unabhängig gespeichert, kein Konflikt
- Ein Nutzer verlässt das Team, nachdem er einen Zeiteintrag erstellt hat → der Eintrag bleibt erhalten (kein Kaskadieren-Löschen), die Nutzeranzeige zeigt „Ehemaliges Mitglied" statt der E-Mail, analog zu PROJ-6/PROJ-7
- Eine Aufgabe wird gelöscht → alle zugehörigen Zeiteinträge werden automatisch mitgelöscht (Datenbank-Kaskade), analog zu Kommentaren und Anhängen
- Sehr viele Zeiteinträge an einer Aufgabe → die Liste scrollt innerhalb eines begrenzten Bereichs, kein unbegrenztes Wachsen der Ansicht (Anforderung von Anfang an, gelernt aus dem PROJ-6-Scroll-Bug)
- Nutzer gibt eine unrealistisch hohe Dauer ein (z. B. 999 Stunden) → durch die 24-Stunden-Obergrenze pro Eintrag verhindert; für mehrtägige Arbeit werden mehrere Einträge mit unterschiedlichem Datum angelegt
- Nutzer wählt ein Datum in der Zukunft → wird abgelehnt, da noch nicht gearbeitete Zeit nicht erfasst werden kann

## Technical Requirements
- Security: Ansehen und Erfassen ist auf Mitglieder des Teams beschränkt, dem die zugehörige Aufgabe gehört — dieselbe Berechtigungsgrenze wie bei Aufgaben (PROJ-4), Kommentaren (PROJ-6) und Anhängen (PROJ-7)
- Security: Nur der Ersteller darf seinen eigenen Zeiteintrag bearbeiten oder löschen
- Validierung: Dauer größer 0 und maximal 24 Stunden pro Eintrag
- Validierung: Datum erforderlich, nicht in der Zukunft
- Validierung: optionale Notiz, maximal 500 Zeichen

## Open Questions
_Keine offenen Fragen — alle Entscheidungen (manuelle Eingabe statt Timer, Dauer-Obergrenze, Berechtigungsmodell) konsistent mit bestehenden Mustern aus PROJ-4/PROJ-6/PROJ-7 getroffen, siehe Decision Log._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Manuelle Eingabe von Dauer + Datum statt Start/Stopp-Timer | Deutlich einfacher umzusetzen (kein Hintergrundprozess, keine Abhängigkeit von offenem Browser-Tab); für kleine Agenturteams, die Zeit oft nachträglich erfassen, ausreichend | 2026-09-23 |
| Dauer als Dezimalstunden eingegeben (z. B. „1,5"), intern in Minuten gespeichert | Einfachstes Eingabeformat für Nutzer, vermeidet Rundungsprobleme bei Speicherung als Ganzzahl (Minuten) | 2026-09-23 |
| Obergrenze 24 Stunden pro Eintrag | Verhindert Fehleingaben (z. B. Tippfehler „150" statt „1,5"); für längere Arbeit werden mehrere Einträge mit unterschiedlichem Datum angelegt | 2026-09-23 |
| Zukünftiges Datum nicht erlaubt | Zeiterfassung dokumentiert bereits geleistete Arbeit, keine Vorab-Planung (dafür ist das Fälligkeitsdatum der Aufgabe da) | 2026-09-23 |
| Nur der Ersteller darf seinen eigenen Eintrag bearbeiten/löschen, kein Owner-Sonderrecht | Konsistent mit der Kommentar- und Anhang-Entscheidung aus PROJ-6/PROJ-7 und dem „alle Mitglieder gleichberechtigt"-Muster aus PROJ-3/PROJ-4 | 2026-09-23 |
| Keine Aggregation auf Projekt-/Team-Ebene im Rahmen dieses Features | Gehört inhaltlich zu PROJ-9 (Reporting/Analytics-Dashboard); PROJ-8 liefert nur die Rohdaten (Zeiteinträge pro Aufgabe) | 2026-09-23 |
| Zeiteinträge-Liste muss von Anfang an scrollbar begrenzt sein | Direkte Lehre aus dem in PROJ-6 gefundenen und behobenen Scroll-Bug, diesmal von vornherein als Anforderung verankert | 2026-09-23 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Neue Datenbanktabelle für Zeiteinträge, getrennt von der Aufgabe | Folgt demselben „eine Tabelle pro Entität"-Muster wie `task_comments` (PROJ-6) und `task_attachments` (PROJ-7) | 2026-09-23 |
| Dauer intern in Minuten (Ganzzahl) gespeichert, Eingabe/Anzeige in Stunden | Vermeidet Rundungsfehler bei wiederholter Bearbeitung eines Eintrags | 2026-09-23 |
| Zugriffsbeschränkung über dieselbe Team-Mitgliedschafts-Regel wie Aufgaben/Kommentare/Anhänge | Konsistentes, bereits bewährtes RLS-Muster, keine neue Berechtigungslogik nötig | 2026-09-23 |
| Bearbeiten/Löschen serverseitig (RLS) auf den Ersteller beschränkt, nicht nur clientseitig versteckt | Konsistent mit PROJ-6/PROJ-7; verhindert Umgehung über direkte API-Aufrufe | 2026-09-23 |
| Gesamtdauer pro Aufgabe wird aus geladenen Einträgen berechnet, kein separates Summenfeld | Vermeidet Synchronisationsprobleme bei gleichzeitigen Änderungen durch mehrere Nutzer | 2026-09-23 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
TaskCard (bestehend, erweitert)
└── Uhr-Icon mit Gesamtdauer (neu, öffnet die Zeiterfassungs-Ansicht) — gleiches Muster wie Kommentar-/Anhang-Zähler aus PROJ-6/PROJ-7

Zeiterfassungs-Dialog (neu)
├── Formular „Zeit erfassen" (Dauer in Stunden, Datum, optionale Notiz)
├── Liste der Zeiteinträge (Nutzer-E-Mail, Datum, Dauer, Notiz), neueste zuerst
│   └── Pro eigenem Eintrag: „Bearbeiten"- und „Löschen"-Optionen
└── Leer-Zustand ("Noch keine Zeit erfasst")
```

### Data Model (plain language)
Eine neue Tabelle beschreibt jeden Zeiteintrag: Bezug zur Aufgabe, Ersteller, Datum, Dauer und eine optionale Notiz — plus einen Zeitstempel der Erstellung. Die Dauer wird von den Nutzern in Stunden eingegeben (z. B. „1,5"), aber intern in Minuten als ganze Zahl gespeichert, um Rundungsfehler bei mehrfacher Bearbeitung zu vermeiden. Es werden keine Dateien gespeichert — im Gegensatz zu PROJ-7 wird hier kein Speicherbereich (Storage) benötigt, nur eine reine Datenbank-Tabelle.

Die Gesamtdauer, die auf der Aufgaben-Karte angezeigt wird, ist kein eigenes gespeichertes Feld, sondern wird direkt aus der Summe der geladenen Zeiteinträge berechnet.

### Tech Decisions
- Neue Datenbanktabelle für Zeiteinträge, getrennt von der Aufgabe selbst — folgt demselben Muster wie die Kommentar-Tabelle (PROJ-6) und die Anhang-Metadaten-Tabelle (PROJ-7).
- Speicherung der Dauer in Minuten (Ganzzahl) statt als Dezimalstunden — verhindert Rundungsfehler, wenn ein Eintrag später bearbeitet wird; die Umrechnung in/aus Stunden passiert nur bei der Anzeige und Eingabe.
- Zugriffsbeschränkung über dieselbe Regel wie bei Aufgaben, Kommentaren und Anhängen: nur Mitglieder des Teams, dem die zugehörige Aufgabe gehört, dürfen Einträge sehen oder anlegen.
- Bearbeiten und Löschen ist ausschließlich für den ursprünglichen Ersteller möglich — diese Regel wird nicht nur in der Oberfläche versteckt, sondern serverseitig erzwungen (dieselbe Absicherung wie bei Kommentaren und Anhängen).
- Die Gesamtdauer pro Aufgabe wird aus den geladenen Einträgen berechnet statt in einem separaten Summenfeld gespeichert — vermeidet, dass die Summe bei gleichzeitigen Änderungen mehrerer Nutzer aus dem Takt gerät.

### Dependencies
Keine neuen npm-Pakete — das Formular nutzt dieselben bereits vorhandenen Bibliotheken (react-hook-form, Zod) wie die übrigen Formulare im Projekt; es sind keine Datei-Uploads oder sonstigen Sonderfunktionen nötig.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
