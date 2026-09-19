# PROJ-1: Supabase Infrastructure Setup

## Status: Architected
**Created:** 2026-09-19
**Last Updated:** 2026-09-19

## Dependencies
- None

## User Stories
- Als Entwickler möchte ich eine funktionierende Supabase-Verbindung haben, damit ich Auth- und Datenfunktionen für alle nachfolgenden Features nutzen kann.
- Als Team-Mitglied möchte ich, dass meine Team-Daten (Projekte, Aufgaben) für andere Teams unsichtbar sind, damit Datenisolation zwischen Kunden/Teams gewährleistet ist.
- Als neuer Nutzer möchte ich mich per E-Mail und Passwort registrieren und meine E-Mail bestätigen, damit mein Account gesichert ist.
- Als Team-Owner möchte ich, dass beim Löschen eines Teams alle zugehörigen Daten konsistent entfernt werden, damit keine verwaisten Datensätze zurückbleiben.

## Out of Scope
- Login/Signup-UI (deferred to PROJ-2)
- Einladungs-Mechanismus / Einladungs-E-Mails (deferred to PROJ-2)
- Passwort-Reset-Flow (siehe Open Questions)
- OAuth-Login, z. B. Google (Non-Goal lt. PRD)
- Erweiterte Rollen über owner/member hinaus (Non-Goal lt. PRD)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

- [ ] Angenommen die Umgebungsvariablen `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` sind korrekt gesetzt, wenn die App startet, dann verbindet sich der Supabase-Client erfolgreich ohne Fehler
- [ ] Angenommen ein neuer Nutzer registriert sich mit E-Mail und Passwort, wenn die Registrierung abgeschickt wird, dann wird eine Bestätigungs-E-Mail versendet und der Account bleibt bis zur Bestätigung inaktiv
- [ ] Angenommen ein Nutzer ist Mitglied von Team A, wenn er per API auf Projekte/Aufgaben von Team B zugreifen will, dann verweigert die RLS-Policy den Zugriff
- [ ] Angenommen ein Team wird gelöscht, wenn der Löschvorgang ausgeführt wird, dann werden alle zugehörigen `team_members`, `projects` und `tasks` automatisch mit gelöscht (Cascade)
- [ ] Angenommen ein Nutzer hat die Rolle „owner" in einem Team, wenn er eine owner-exklusive Aktion ausführt (z. B. Mitglied entfernen), dann erlaubt die RLS-Policy dies; bei der Rolle „member" wird dies verweigert
- [ ] Angenommen alle Tabellen sind angelegt, wenn ein Entwickler das Schema inspiziert, dann besitzen `teams`, `team_members`, `projects`, `tasks` jeweils Indizes auf den Fremdschlüssel-Spalten

## Edge Cases
- Fehlende/fehlerhafte Umgebungsvariablen → App soll beim Start einen klaren Fehler werfen statt stillschweigend zu scheitern
- Doppelte Registrierung mit derselben E-Mail → wird von Supabase Auth nativ verhindert (unique constraint)
- Zugriff ohne Team-Mitgliedschaft per direktem API-Call → wird durch RLS blockiert
- Löschung eines Projekts, das noch Aufgaben enthält → Cascade Delete auf `project_id`
- Letzter verbleibender „owner" eines Teams verlässt/wird entfernt → noch offen (siehe Open Questions)

## Technical Requirements
- Security: RLS auf allen Tabellen aktiviert, alle Datenzugriffe erfordern Authentifizierung
- Schema-Entitäten:
  - `teams` (id, name, created_by, created_at)
  - `team_members` (id, team_id, user_id, role: owner/member, joined_at) — viele-zu-viele zwischen Nutzern und Teams
  - `projects` (id, team_id, name, description, created_by, created_at)
  - `tasks` (id, project_id, title, description, status: todo/in_progress/done, assignee_id, due_date, created_by, created_at, updated_at)
- Auth: E-Mail + Passwort über Supabase Auth, E-Mail-Verifizierung aktiviert

## Open Questions
- [ ] Soll verhindert werden, dass der letzte verbleibende Owner ein Team verlässt (kein Team ohne Owner)? Zu klären in PROJ-2.
- [ ] Passwort-Reset-Flow: eigenes Ticket oder Teil von PROJ-2?

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Komplettes DB-Schema (teams, team_members, projects, tasks) in PROJ-1 statt schrittweise | Vermeidet mehrfache Migrationen in nachfolgenden Features (PROJ-2/3/4) | 2026-09-19 |
| E-Mail+Passwort statt OAuth | Einfachste Methode ohne externe Provider-Abhängigkeit für B2B-MVP | 2026-09-19 |
| Nutzer können mehreren Teams angehören (Many-to-Many) | Freelancer/Berater arbeiten oft für mehrere Kundenteams gleichzeitig | 2026-09-19 |
| Zwei Rollen: owner/member | Deckt sich mit PRD Non-Goal „keine erweiterte Rechteverwaltung" | 2026-09-19 |
| PROJ-1 ist reine Infrastruktur ohne UI | Single Responsibility; Login/Signup-UI gehört zu PROJ-2 | 2026-09-19 |
| Task-Status: todo/in_progress/done | Deckt MVP-Kanban-Workflow ab | 2026-09-19 |
| E-Mail-Verifizierung aktiviert | Verhindert Spam-Accounts, stellt Zustellbarkeit für Einladungen sicher | 2026-09-19 |
| Cascade Delete bei Team-Löschung | Verhindert verwaiste Datensätze | 2026-09-19 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Row Level Security (RLS) statt Prüfung im Anwendungscode für Datenisolation | Datenbank-erzwungene Sicherheit, unabhängig von Bugs in der Business-Logik | 2026-09-19 |
| Supabase Auth mit eingebautem E-Mail-Bestätigungs-Flow | Nutzt vorhandene Infrastruktur, kein zusätzlicher E-Mail-Versand-Dienst nötig | 2026-09-19 |
| Datenbank-Migrationen versioniert im Repository statt manueller Änderungen im Supabase-Dashboard | Nachvollziehbarkeit und Reproduzierbarkeit für Team-Mitglieder und Deployments | 2026-09-19 |
| Nur der öffentliche Anon-Key wird clientseitig verwendet (kein Service-Role-Key in PROJ-1) | RLS reicht für aktuelle Zugriffsmuster aus; Service-Role erst nötig für spätere Admin-Funktionen ohne Nutzerkontext | 2026-09-19 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
Keine UI-Komponenten — dies ist ein reines Backend-/Infrastruktur-Feature. Die Supabase-Verbindung wird intern von allen nachfolgenden Features (PROJ-2 bis PROJ-10) genutzt.

### Data Model (plain language)
```
Teams
- Name
- Erstellt von (Nutzer)
- Erstellungsdatum

Team-Mitgliedschaft (verbindet eine Person mit einem Team)
- Welches Team
- Welche Person
- Rolle: Owner oder Member
- Beitrittsdatum
(eine Person kann in mehreren Teams gleichzeitig Mitglied sein)

Projekte
- Gehört zu genau einem Team
- Name, Beschreibung
- Erstellt von, Erstellungsdatum

Aufgaben
- Gehört zu genau einem Projekt
- Titel, Beschreibung
- Status: To Do / In Progress / Done
- Zugewiesen an (optional, ein Team-Mitglied)
- Fälligkeitsdatum (optional)
- Erstellt von, Erstellungs-/Änderungsdatum
```

Gespeichert in: Supabase (PostgreSQL), abgesichert durch Row Level Security (RLS).

### Tech Decisions
- Supabase als Backend: bereits im Starter-Kit vorbereitet (Auth + PostgreSQL + Storage), erspart eigene Backend-Infrastruktur
- Row Level Security statt Prüfung im Anwendungscode: Datenbank erzwingt Datentrennung zwischen Teams, unabhängig von der App-Logik
- Supabase Auth mit eingebauter E-Mail-Bestätigung: keine zusätzliche Infrastruktur nötig
- Versionierte Datenbank-Migrationen im Repository: nachvollziehbare, reproduzierbare Schema-Änderungen
- Nur Anon-Key clientseitig verwendet: RLS reicht für aktuelle Zugriffsmuster aus

### Dependencies
- `@supabase/supabase-js` — bereits installiert, offizielle Supabase-Client-Bibliothek
- Keine weiteren Pakete nötig

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
