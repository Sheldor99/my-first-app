# PROJ-3: Projekte anlegen/verwalten

## Status: Deployed
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
| Kein eigenes Backend/API für Team-/Projekt-Verwaltung | Supabase-Client greift direkt auf `teams`/`team_members`/`projects` zu, abgesichert durch die bestehende RLS aus PROJ-1; keine zusätzliche Schicht nötig | 2026-09-21 |
| "Aktives Team" wird nur im Browser (localStorage) gespeichert, nicht in der Datenbank | Reine Anzeige-Präferenz ohne geschäftliche Relevanz; vermeidet unnötige Datenbank-Komplexität | 2026-09-21 |
| Keine neuen npm-Pakete nötig | Alle benötigten shadcn/ui-Bausteine (Dialog, DropdownMenu, Select, AlertDialog) sowie react-hook-form/Zod sind bereits installiert | 2026-09-21 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
/ (Startseite, eingeloggter Bereich)
├── Team-Auswahl (Dropdown)
│   ├── Liste der Teams, in denen der Nutzer Mitglied ist
│   └── "+ Neues Team erstellen"-Option
│
├── Kein-Team-Zustand (statt Projektliste, wenn Nutzer noch in keinem Team ist)
│   └── "Team erstellen"-Formular (nur Name)
│
├── Projekt-Übersicht (für das aktuell ausgewählte Team)
│   ├── Empty State ("Noch keine Projekte" + "Erstes Projekt anlegen"-Button)
│   ├── Projekt-Karten (je Projekt: Name, Beschreibung, ⋮-Menü)
│   │   └── ⋮-Menü → Bearbeiten / Löschen
│   └── "+ Neues Projekt"-Button
│
├── Team-Erstellen-Dialog (Formular: Name) — wiederverwendet für Onboarding UND "Neues Team erstellen"
├── Projekt-Erstellen-Dialog (Formular: Name, Beschreibung)
├── Projekt-Bearbeiten-Dialog (wie oben, vorausgefüllt)
└── Lösch-Bestätigungsdialog (Warnhinweis: "Projekt und alle Aufgaben werden unwiderruflich gelöscht")
```

### Data Model (plain language)
Keine neue Datenbanktabelle nötig. Die Tabellen `teams`, `team_members` und `projects` samt Zugriffsregeln existieren bereits vollständig seit PROJ-1. PROJ-3 baut ausschließlich die Oberfläche und Verbindungslogik darauf auf.

Einzige neue "Information": Welches Team gerade aktiv ist — das wird nur im Browser des Nutzers gemerkt (nicht in der Datenbank), ähnlich wie eine zuletzt gewählte Einstellung.

### Tech Decisions
- Kein eigenes Backend/API nötig: Team- und Projekt-Verwaltung läuft direkt über den bereits vorhandenen Supabase-Client — abgesichert durch die Datenbank-Zugriffsregeln aus PROJ-1.
- "Aktives Team" wird nur im Browser gespeichert, nicht in der Datenbank: reine Anzeige-Präferenz. Beim ersten Besuch wird automatisch das erste Team ausgewählt.
- Formulare mit react-hook-form + Zod: konsistent mit PROJ-2.
- Alle benötigten UI-Bausteine (Dialoge, Dropdown-Menü, Auswahlfeld, Bestätigungsdialog) sind bereits installiert.

### Dependencies
Keine neuen Pakete — alles Notwendige ist bereits im Projekt vorhanden.

## Implementation Notes (Frontend Developer)

- `src/lib/validations/team.ts`, `src/lib/validations/project.ts`: Zod-Schemas (Team-Name max. 100 Zeichen; Projektname max. 100, Beschreibung optional max. 500 Zeichen).
- `src/hooks/use-teams.ts`: Lädt die Teams des eingeloggten Nutzers (RLS filtert automatisch auf Mitgliedschaften), verwaltet das aktive Team inkl. Persistierung in `localStorage` (Fallback auf das erste Team, falls der gespeicherte Wert ungültig/leer ist).
- `src/components/teams/create-team-form.tsx`: Die eigentliche Team-Erstellen-Formularlogik, wiederverwendet sowohl im Onboarding (inline auf der Startseite, kein Dialog) als auch im `TeamFormDialog` (für "Neues Team erstellen" über den Switcher) — vermeidet Duplizierung.
- `src/components/teams/team-switcher.tsx`: Dropdown mit allen Teams des Nutzers + "Neues Team erstellen"-Eintrag; neu erstelltes Team wird sofort aktiv.
- `src/components/projects/project-list.tsx`: Lädt Projekte für das aktive Team, zeigt Empty State oder Grid aus `ProjectCard`s, orchestriert Erstellen-/Bearbeiten-/Lösch-Dialoge.
- `src/components/projects/project-form-dialog.tsx`: Ein Dialog für Anlegen UND Bearbeiten (unterscheidet über optionale `project`-Prop).
- `src/components/projects/delete-project-dialog.tsx`: AlertDialog mit explizitem Hinweis auf mitgelöschte Aufgaben.
- `src/app/page.tsx`: komplett neu aufgebaut — Auth-Check (unverändert aus PROJ-2) + Team-Onboarding-Zustand (kein Team) + Header mit Team-Switcher/Logout + Projekt-Übersicht für das aktive Team.

### Manuelles Testen (Browser, echtes Supabase-Projekt)
Mit einem temporären, per SQL angelegten Test-User (danach vollständig inkl. aller angelegten Teams/Projekte gelöscht) end-to-end durchgespielt:
- Onboarding-Zustand (kein Team) zeigt korrekt das "Team erstellen"-Formular statt Projektliste
- Team erstellen → automatisch aktiv, Owner-Trigger aus PROJ-1 greift, Projekt-Übersicht (leer) erscheint
- Empty State mit "Erstes Projekt anlegen"-CTA korrekt
- Projekt anlegen (Name + Beschreibung) → erscheint sofort in der Liste
- Projekt bearbeiten über ⋮-Menü → Dialog vorausgefüllt, Speichern übernimmt Änderung sofort sichtbar
- Projekt löschen → Bestätigungsdialog mit korrektem Hinweis auf mitgelöschte Aufgaben; „Abbrechen" behält das Projekt, „Löschen" entfernt es
- Zweites Team über Switcher erstellt → wird sofort aktiv, eigene (leere) Projektliste — Isolation zwischen Teams bestätigt (Projekt aus Team A taucht nicht in Team B auf und umgekehrt)
- Team-Wechsel über Switcher in beide Richtungen verifiziert
- Leeres Projektnamen-Feld beim Anlegen → Validierungsfehler „Projektname ist erforderlich", kein Request

## QA Test Results

**Tested:** 2026-09-21
**App URL:** http://localhost:3001
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### Team erstellen (Onboarding)
- [x] Nutzer ohne Team sieht „Team erstellen"-Screen statt Projektliste (frisch verifiziert)
- [x] Leerer Team-Name → Validierungsfehler (Unit-Test + Code-Review der Zod-Regel)
- [x] Team-Name > 100 Zeichen → Validierungsfehler (Unit-Test bestätigt Grenze exakt bei 100/101 Zeichen)
- [x] Gültiger Team-Name → Team erstellt, Nutzer automatisch Owner (Trigger aus PROJ-1 greift), landet in leerer Projektübersicht

#### Team wechseln / weiteres Team erstellen
- [x] Nutzer mit ≥1 Team sieht Team-Auswahl + Projekte des aktiven Teams
- [x] Team-Wechsel über Auswahl → Projektliste wechselt korrekt (in beide Richtungen getestet)
- [x] „Neues Team erstellen" → neues Team wird sofort aktiv

#### Projekte anzeigen
- [x] Team ohne Projekte → Empty State mit „Erstes Projekt anlegen"-CTA
- [x] Team mit Projekten → Name + Beschreibung werden angezeigt

#### Projekt anlegen
- [x] Gültiger Name (+ optionale Beschreibung) → Projekt erstellt, erscheint sofort in der Liste
- [x] Leeres Namensfeld → Validierungsfehler, kein Request
- [x] Name > 100 Zeichen bzw. Beschreibung > 500 Zeichen → Validierungsfehler (beide Grenzen live im Browser UND per Unit-Test bestätigt)

#### Projekt bearbeiten
- [x] Gültige Änderung an Name/Beschreibung → übernommen, sofort sichtbar
- [x] Namensfeld beim Bearbeiten geleert → Validierungsfehler, Dialog bleibt offen (durch dieselbe Zod-Regel wie beim Anlegen abgedeckt, Formular teilt sich die Logik)

#### Projekt löschen
- [x] Klick auf „Löschen" → Bestätigungsdialog mit explizitem Hinweis auf mitgelöschte Aufgaben
- [x] Bestätigung → Projekt entfernt, verschwindet aus der Liste
- [x] Abbrechen → Projekt bleibt unverändert erhalten

### Multi-User- und Berechtigungstests (mit drei echten Test-Usern: Owner, Member, Outsider)
- [x] **Owner** kann Team + Projekt anlegen
- [x] **Member** (per SQL zum Team hinzugefügt, simuliert künftige PROJ-11-Einladung) sieht dasselbe Team/Projekt und kann es erfolgreich bearbeiten — bestätigt „alle Mitglieder dürfen verwalten"
- [x] **Outsider** (kein Teammitglied) sieht beim Login den eigenen leeren Onboarding-Screen, keinerlei Spur des fremden Teams/Projekts

### Security Audit Results (Red Team, echte API-Calls mit gültigem Token)
- [x] Direkter `SELECT` auf ein fremdes Team per REST-API (gültiger Auth-Token, fremde `team_id`) → `200 OK`, leeres Array (RLS filtert korrekt)
- [x] Direkter `INSERT` eines Projekts in ein fremdes Team → `403`, „new row violates row-level security policy"
- [x] Direkter `UPDATE`/`DELETE` auf ein fremdes Projekt (per `team_id`-Filter) → Request „erfolgreich" (200/204), aber **0 Zeilen betroffen** — per SQL verifiziert, dass das Projekt unverändert blieb (RLS macht die Zeile für den Outsider unsichtbar, bevor die Aktion greifen kann)
- [x] Team-Erstellung mit gespoofter `created_by`-ID (Identitätsvortäuschung) → `403`, RLS blockiert korrekt
- [x] XSS-Versuch (`<img src=x onerror=...>`) im Projektnamen → als inerter Text gerendert, keine Skriptausführung
- [x] Keine Secrets im Client-Bundle (nur Publishable Key, Code-Review)

### Regressionstest
- [x] PROJ-2-Routenschutz weiterhin intakt: Logout → Aufruf von `/` leitet korrekt zu `/login` um (Startseite wurde in PROJ-3 komplett neu aufgebaut, keine Regression)

### Automatisierte Tests
- **Unit-Tests (Vitest):** 10 neue Tests für `team.ts`- und `project.ts`-Zod-Schemas (Grenzwerte exakt bei 100/500 Zeichen getestet), alle grün. Zusammen mit den bestehenden 14 Auth-Tests: 24/24 grün.
- **BUG-1 gefunden:** `npm test` schlägt fehl (siehe unten) — Tests wurden stattdessen gezielt mit `npx vitest run src/lib/validations` ausgeführt, um das Problem zu umgehen.
- **E2E-Tests (Playwright):** Bewusst **keine neue Spec-Datei** für PROJ-3 geschrieben. Fast die gesamte Funktionalität (Team-Onboarding, Projekt-CRUD, Team-Switcher) setzt eine eingeloggte Session voraus, und es existiert noch keine Playwright-Test-Fixture für programmatischen Login. Ohne diese wäre eine PROJ-3-Spec-Datei entweder leer (nur der bereits in PROJ-2 abgedeckte Routenschutz-Test) oder würde Auth-Umgehungen simulieren, die keine echten Nutzerpfade abbilden. Empfehlung: Playwright-`globalSetup` mit einem Test-User-Login einführen, sobald mehrere Features davon profitieren (z. B. mit PROJ-4).

### Bugs Found

#### BUG-1: `npm test` schlägt fehl, weil Vitest die Playwright-E2E-Datei einliest — RESOLVED
- **Severity:** Medium
- **Steps to Reproduce:**
  1. `npm test` ausführen
  2. Erwartet: Alle Vitest-Unit-Tests laufen durch
  3. Tatsächlich: `tests/PROJ-2-login-signup.spec.ts` wird von Vitest eingelesen (passt auf dessen Standard-Glob `**/*.spec.ts`) und schlägt mit `Error: Playwright Test did not expect test.describe() to be called here` fehl — die eigentlichen Unit-Tests (14/14) laufen zwar trotzdem durch, aber der Gesamt-Exit-Code von `npm test` ist fehlerhaft (1 failed Test File)
  4. Workaround: `npx vitest run src/lib` (oder ein anderer eingeschränkter Pfad) statt `npm test`
- **Ursache:** `vitest.config.ts` hat kein `exclude` für das `tests/`-Verzeichnis (dort liegen ausschließlich Playwright-Specs); Vitest übernimmt sein Standard-Include-Muster, das auch `*.spec.ts` außerhalb von `src/` erfasst
- **Priority:** Fix before deployment empfohlen — bricht den in `CLAUDE.md` dokumentierten Standard-Befehl `npm test` und würde in einer echten CI-Pipeline den Build fälschlich als fehlgeschlagen markieren, obwohl alle Unit-Tests grün sind
- **Fix:** `vitest.config.ts` ergänzt um `exclude: [...configDefaults.exclude, 'tests/**']` (Vitests eingebaute Standard-Ausschlüsse bleiben erhalten, `tests/` kommt explizit dazu).
- **Re-Test:** `npm test` läuft jetzt sauber durch — 3 Test-Dateien, 24/24 Tests grün, kein Fehlschlag mehr durch die Playwright-Datei.

### Summary
- **Acceptance Criteria:** 15/15 vollständig bestanden
- **Bugs Found:** 1 total, gefixt und re-verifiziert (0 Critical, 0 High, 0 Medium offen, 0 Low)
- **Security:** Keine Sicherheitslücken gefunden — RLS-Isolation zwischen Teams unter echtem Red-Team-Beschuss (SELECT/INSERT/UPDATE/DELETE/Spoofing-Versuche) vollständig standhaft; XSS blockiert
- **Production Ready:** YES
- **Recommendation:** Freigegeben. Playwright-Test-Fixture für Login als Follow-up vormerken, sobald mehrere Features davon profitieren.

## Deployment

**Deployed:** 2026-09-21
**Art:** Lokaler Produktions-Build (`npm run build` + `npm run start`), zusammen mit PROJ-4 deployed — beide Features laufen im selben Next.js-Build/-Deployment, PROJ-3 wurde nach seinem eigenen `/qa`-Approval nicht separat deployed, bevor die Arbeit an PROJ-4 begann
**URL:** http://localhost:3000 (nur lokal erreichbar)
**Backend:** Supabase-Projekt `my-first-app` — keine neuen Migrationen für PROJ-3 selbst (nutzt PROJ-1-Infrastruktur)
