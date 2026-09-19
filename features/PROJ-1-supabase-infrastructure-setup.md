# PROJ-1: Supabase Infrastructure Setup

## Status: Deployed
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

## Implementation Notes (Backend Developer)

- Supabase-Projekt `my-first-app` (ref `yiyddydbkxycswmyisvi`) verbunden, drei Migrationen angewendet:
  - `proj1_core_schema` — Tabellen `teams`, `team_members`, `projects`, `tasks`; RLS auf allen vier aktiviert; Policies für SELECT/INSERT/UPDATE/DELETE je Team-Mitgliedschaft bzw. Owner-Rolle; Indizes auf allen Fremdschlüssel-Spalten; Trigger `on_team_created` fügt den Ersteller automatisch als `owner` in `team_members` ein; Trigger `on_task_updated` pflegt `updated_at`.
  - `proj1_security_hardening` — Security-Advisor-Findings behoben: `search_path` auf Trigger-Funktion fixiert, `EXECUTE`-Rechte der `SECURITY DEFINER`-Hilfsfunktionen (`is_team_member`, `is_team_owner`, `handle_new_team`) von `anon`/`public` entzogen.
  - `proj1_perf_fixes` — fehlende Indizes auf `created_by`-Spalten ergänzt, RLS-Policies auf `(select auth.uid())` umgestellt (vermeidet Re-Evaluation pro Zeile).
  - Security- und Performance-Advisors danach sauber (verbleibende Warnungen sind beabsichtigt: Helper-Funktionen müssen für `authenticated` ausführbar bleiben, damit RLS-Policies funktionieren).
- `src/lib/supabase.ts` aktiviert: echter `createClient`-Aufruf statt Platzhalter, wirft beim Start einen klaren Fehler, wenn `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` fehlen (deckt Edge Case „fehlende Umgebungsvariablen" ab).
- Keine eigenen API-Routen in `/src/app/api/` angelegt: PROJ-1 ist reine Infrastruktur, CRUD-Zugriffe laufen über den Supabase-Client direkt (durch RLS abgesichert) und werden erst mit den UI-Features PROJ-2/3/4 konsumiert.
- Deviation: `.env.local` konnte nicht automatisiert befüllt werden (Env-Dateien sind per Projekt-Policy für Read/Write gesperrt) — Nutzer hat URL + Publishable Key erhalten und muss `.env.local` manuell anlegen.
- Offen / manuell zu prüfen: E-Mail-Bestätigung (Confirm Email) im Supabase Dashboard unter Authentication → Providers → Email verifizieren, da dies über keinen MCP-Tool-Aufruf einsehbar/setzbar ist.

### Bugfix-Runde (nach /qa)
- `proj1_fix_returning_rls` — behebt BUG-1: Die SELECT-Policy „Members can view their teams" prüfte nur `is_team_member(id)`, was direkt nach dem `INSERT` noch nicht zutraf (der `AFTER INSERT`-Trigger, der den Ersteller als Owner einträgt, ist zu diesem Zeitpunkt der `RETURNING`-Sichtbarkeitsprüfung noch nicht abgeschlossen). Policy erweitert um `OR created_by = (select auth.uid())`, sodass die eigene, gerade erstellte Zeile unabhängig vom Trigger-Timing sichtbar ist.
- Verifiziert: `INSERT INTO teams (...) RETURNING *` (= Standard-Client-Pattern `.insert().select()`) liefert jetzt die neue Zeile zurück, ohne RLS-Fehler. Security-Advisor weiterhin sauber (0 Findings), Cross-Team-Isolation für Outsider unverändert intakt (Regressionstest bestanden).
- `proj1_fix_anon_rls_error` — behebt BUG-2: `EXECUTE` auf `is_team_member`/`is_team_owner` wieder an `anon` gewährt (war in `proj1_security_hardening` zu strikt entzogen worden). Die Funktionen geben nur einen Boolean basierend auf der eigenen `auth.uid()` der Session zurück (für `anon` immer `false`), daher unschädlich.
- Verifiziert: `GET /rest/v1/teams` mit `anon`-Key liefert jetzt `200 OK` mit `[]` statt `401`/rohem Postgres-Fehler; direkter RPC-Aufruf `/rest/v1/rpc/is_team_member` liefert `200 OK` mit `false`. Security-Advisor zeigt erwartungsgemäß wieder die (beabsichtigte, dokumentierte) WARN „anon kann SECURITY-DEFINER-Funktion ausführen" — unkritisch, da nur ein Boolean ohne Dateninhalt zurückgegeben wird.
- Beide QA-Bugs (BUG-1, BUG-2) sind damit gefixt und verifiziert. Status bleibt „In Review" bis zur offiziellen erneuten `/qa`-Abnahme.

## QA Test Results

**Tested:** 2026-09-19
**Environment:** Live Supabase project `my-first-app` (`yiyddydbkxycswmyisvi`), tested directly against Postgres/PostgREST via simulated `authenticated`/`anon` sessions (`SET LOCAL ROLE` + `request.jwt.claims`) and live REST/RPC calls. Three throwaway test users (`qa-owner-a`, `qa-member-b`, `qa-outsider-c`) were created for the duration of the test and fully deleted afterward; final state verified clean (0 rows in all four tables).
**Tester:** QA Engineer (AI)

### Acceptance Criteria Status

#### AC-1: Supabase-Client verbindet sich erfolgreich ohne Fehler
- [x] Backend erreichbar: REST-Endpoint antwortet korrekt auf gültige Requests (verifiziert per curl gegen `/rest/v1/`)
- [x] `src/lib/supabase.ts` wirft beim Fehlen der Env-Vars einen klaren Fehler statt stillschweigend zu scheitern
- [ ] Nicht verifiziert: tatsächlicher `npm run dev`-Start mit befüllter `.env.local`, da QA `.env.local` aus Policy-Gründen nicht lesen/schreiben darf (env-abhängiger Teil liegt beim Nutzer)

#### AC-2: Registrierung mit E-Mail-Bestätigung
- [ ] Nicht getestet: Ein echter Signup-Flow hätte einen weiteren dauerhaften Auth-User im Projekt angelegt; auf Wunsch des Nutzers wurde der Testumfang auf die drei klar markierten `qa-*`-Testnutzer begrenzt. Ob „Confirm email" im Dashboard aktiviert ist, konnte über keinen verfügbaren Tool-Aufruf verifiziert werden (siehe Implementation Notes).

#### AC-3: RLS verweigert Zugriff auf fremde Team-Daten
- [x] Authentifizierter Außenstehender (`qa-outsider-c`, kein Team-Mitglied): `SELECT` auf `teams`, `projects`, `tasks` liefert sauber leeres Ergebnis (kein Fehler)
- [x] Außenstehender kann keine `projects`/`team_members`-Zeilen für ein fremdes Team einfügen (RLS-Fehler 42501, Insert wird verworfen)
- [x] Außenstehender kann fremde `tasks` nicht per `UPDATE` verändern (0 betroffene Zeilen, Daten nachweislich unverändert)
- [ ] BUG-2: Unauthentifizierte (`anon`-Rolle) Requests gegen dieselben Tabellen/Funktionen werfen einen rohen Postgres-Fehler statt eines sauberen leeren Ergebnisses (siehe Bug unten)

#### AC-4: Cascade Delete bei Team-Löschung
- [x] Schema-Ebene: `ON DELETE CASCADE` korrekt gesetzt für `team_members.team_id`, `projects.team_id`, `tasks.project_id`
- [x] Verhalten live bestätigt: Löschen eines Teams durch den Owner entfernt automatisch alle zugehörigen `team_members`, `projects` und `tasks` (0 verbleibende Zeilen nach Löschung)

#### AC-5: Owner-exklusive Aktionen
- [x] Owner kann Mitglieder hinzufügen (`INSERT team_members`) — erlaubt
- [x] Member kann Owner NICHT entfernen (`DELETE team_members`) — 0 betroffene Zeilen, RLS blockiert still
- [x] Member kann sich selbst aus dem Team entfernen (Leave-Funktion) — erlaubt, betrifft nur die eigene Zeile
- [x] Outsider kann sich nicht selbst als `owner` in ein fremdes Team einfügen (Privilege-Escalation-Versuch) — RLS-Fehler, blockiert

#### AC-6: Indizes auf allen Fremdschlüssel-Spalten
- [x] Vollständig verifiziert per `pg_indexes`: alle 8 FK-Spalten (`teams.created_by`, `team_members.team_id`/`user_id`, `projects.team_id`/`created_by`, `tasks.project_id`/`assignee_id`/`created_by`) besitzen einen Index

### Security Audit Results
- [x] Autorisierung: Cross-Team-Datenzugriff vollständig durch RLS blockiert (SELECT/INSERT/UPDATE/DELETE getestet)
- [x] Privilege Escalation: Outsider kann sich nicht selbst Mitgliedschaft/Owner-Rolle verschaffen
- [x] Rollen-Eskalation innerhalb des Teams: Member kann keine Owner-exklusiven Aktionen ausführen
- [x] Keine SQL-Injection-Angriffsfläche: alle Policy-Funktionen sind typisiert (uuid-Parameter), keine dynamische SQL-Konstruktion
- [ ] BUG-1: `INSERT ... RETURNING` auf `teams` schlägt für den Ersteller selbst fehl (siehe unten) — Critical, da dies der Standard-Client-Pattern ist
- [ ] BUG-2: Anon-Requests erhalten rohe DB-Fehler statt leerer Ergebnisse (siehe unten) — Medium
- [ ] Nicht getestet: Vollständiger Signup/Email-Bestätigungs-Flow (siehe AC-2)

### Bugs Found

#### BUG-1: Team-Erstellung mit `RETURNING`/`.select()` schlägt für den erstellenden Nutzer fehl
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Als authentifizierter Nutzer (`auth.uid()` gesetzt) `INSERT INTO teams (name, created_by) VALUES (...) RETURNING *` ausführen (entspricht exakt dem Standard-Supabase-JS-Pattern `supabase.from('teams').insert({...}).select()`, das in der Praxis fast immer verwendet wird, um die neu generierte `id` fürs Redirect/UI zu erhalten)
  2. Erwartet: Der neu erstellte Team-Datensatz wird zurückgegeben
  3. Tatsächlich: `ERROR 42501: new row violates row-level security policy for table "teams"` — obwohl der Insert selbst inkl. Owner-Trigger korrekt durchläuft (verifiziert: Team + `team_members`-Eintrag mit Rolle `owner` existieren danach in der DB), schlägt die Query komplett fehl und der Client bekommt gar keine Antwort/ein Fehlerobjekt statt der Daten
  4. Ursache (vermutet): Bei `RETURNING` prüft Postgres zusätzlich zur `WITH CHECK`-Klausel der INSERT-Policy auch die `SELECT`-Policy (`is_team_member(id)`) auf die neue Zeile. Der `AFTER INSERT`-Trigger, der den Ersteller als `owner` in `team_members` einträgt, läuft aber offenbar zu spät, um die `RETURNING`-Sichtbarkeitsprüfung noch zu erfüllen — reines `INSERT` ohne `RETURNING` funktioniert einwandfrei.
- **Priority:** Fix before deployment (blockiert den zentralen "Team anlegen"-Flow, auf dem PROJ-3 aufbaut)
- **Hinweis für Backend-Fix (kein Fix durch QA):** Naheliegender Fix wäre, die `SELECT`-Policy auf `teams` zusätzlich um `OR created_by = (select auth.uid())` zu erweitern, damit die Sichtbarkeit der eigenen, gerade erstellten Zeile nicht vom Trigger-Timing abhängt.

#### BUG-2: Unauthentifizierte Requests werfen rohen DB-Fehler statt leerem Ergebnis
- **Severity:** Medium
- **Steps to Reproduce:**
  1. `GET /rest/v1/teams?select=id` mit dem `anon`-Key (kein eingeloggter Nutzer) aufrufen
  2. Erwartet: `200 OK` mit leerem Array `[]` (Standard-Supabase-Verhalten, wenn RLS alle Zeilen herausfiltert) — oder zumindest ein sauberer, generischer 401
  3. Tatsächlich: `401` mit `{"code":"42501","message":"permission denied for function is_team_member"}` — ein interner Postgres-Fehler inkl. Funktionsname wird direkt an den Client durchgereicht
  4. Gleiches passiert bei direktem RPC-Aufruf `/rest/v1/rpc/is_team_member`
- **Ursache:** In der Migration `proj1_security_hardening` wurde `EXECUTE` auf `is_team_member`/`is_team_owner` von der `anon`-Rolle entzogen (als Reaktion auf eine Security-Advisor-Warnung). Dadurch kann die `anon`-Rolle die Funktion innerhalb der RLS-Policy gar nicht mehr aufrufen, sobald sie in einer Query auf `teams`/`team_members`/`projects`/`tasks` referenziert wird — Postgres bricht mit Permission-Fehler ab, statt die Zeilen einfach herauszufiltern.
- **Priority:** Fix before deployment (kein Datenleck, aber unsauberes/inkonsistentes Fehlerverhalten für alle nicht eingeloggten Zugriffe, relevant für spätere Frontend-Fehlerbehandlung in PROJ-2+)
- **Hinweis für Backend-Fix (kein Fix durch QA):** `GRANT EXECUTE ON FUNCTION is_team_member(uuid), is_team_owner(uuid) TO anon;` — unschädlich, da die Funktionen nur einen Boolean basierend auf der eigenen `auth.uid()` der Session zurückgeben (für `anon` immer `NULL`/`false`), keine fremden Daten preisgeben.

### Summary
- **Acceptance Criteria:** 4/6 vollständig bestanden, 2 mit offenen Punkten (AC-1: env-abhängiger Teil nicht testbar; AC-2: bewusst nicht getestet, siehe oben)
- **Bugs Found:** 2 total (1 Critical, 1 Medium)
- **Security:** Autorisierung/RLS-Isolation zwischen Teams ist robust und wurde mit echten simulierten Multi-User-Szenarien verifiziert; die zwei gefundenen Bugs betreffen Fehlerverhalten/Robustheit, nicht Daten-Leaks zwischen Teams
- **Production Ready:** NO
- **Recommendation:** BUG-1 zuerst fixen (blockiert den kompletten Team-Erstellungs-Flow für PROJ-3), danach BUG-2. Nach Fix: `/qa` erneut ausführen, um beide Fixes zu verifizieren.

---

## QA Re-Test (nach Bugfixes)

**Tested:** 2026-09-19
**Environment:** Dieselbe Live-Supabase-Umgebung, erneut mit drei frischen, klar markierten Testnutzern (`qa2-owner-a`, `qa2-member-b`, `qa2-outsider-c`), nach dem Test vollständig gelöscht (0 verbleibende `qa*`-Nutzer, 0 Zeilen in allen vier Tabellen danach).
**Tester:** QA Engineer (AI)

### BUG-1 Re-Test — RESOLVED
- [x] `INSERT INTO teams (...) RETURNING *` als Ersteller liefert jetzt die neue Zeile zurück (kein RLS-Fehler mehr), verifiziert mit frischem Testnutzer
- [x] Owner-Trigger weiterhin korrekt (Ersteller landet automatisch als `owner` in `team_members`)
- [x] `INSERT INTO projects (...) RETURNING *` durch ein Team-Mitglied funktioniert ebenfalls weiterhin fehlerfrei (keine Nebenwirkung durch die Policy-Änderung)
- [x] Regression: Outsider sieht das Team weiterhin nicht (Policy-Erweiterung `created_by = auth.uid()` führt zu keinem Datenleck an Dritte)

### BUG-2 Re-Test — RESOLVED
- [x] `GET /rest/v1/teams` mit `anon`-Key: `200 OK`, `[]` (vorher `401` + roher Postgres-Fehler)
- [x] `GET /rest/v1/projects` und `/rest/v1/tasks` mit `anon`-Key: ebenfalls `200 OK`, `[]`
- [x] `POST /rest/v1/rpc/is_team_member` mit `anon`-Key: `200 OK`, `false` (vorher Fehler)
- [x] Security-Advisor zeigt nur noch die erwartete, bewusst akzeptierte WARN (anon kann Boolean-Hilfsfunktion aufrufen) — kein neues Finding

### Regressions- und Vollständigkeitscheck (komplettes Szenario erneut durchgespielt)
- [x] AC-3 (Cross-Team-Isolation): Outsider sieht weder Team noch Projekt, kann keine Rolle vortäuschen
- [x] AC-4 (Cascade Delete): Team-Löschung entfernt `team_members` und `projects` vollständig (0 verbleibend)
- [x] AC-5 (Owner-exklusive Aktionen): Member kann Owner nicht entfernen (0 betroffene Zeilen); Owner-Aktionen weiterhin uneingeschränkt möglich
- [x] AC-6 (FK-Indizes): unverändert vollständig vorhanden

### Summary
- **Bugs Found in Re-Test:** 0 (beide vorherigen Bugs verifiziert behoben, keine neuen Regressionen)
- **Production Ready:** YES
- **Recommendation:** Freigegeben für `/deploy`. Weiterhin offen (kein Blocker für PROJ-1, für Folge-Features vormerken): AC-2 (Signup/E-Mail-Bestätigung) wurde nie end-to-end getestet, da dies einen dauerhaften Auth-User angelegt hätte — sollte spätestens bei PROJ-2 (Login/Signup-UI) mitgetestet werden. Die manuelle Prüfung des „Confirm email"-Toggles im Supabase Dashboard steht ebenfalls noch aus.

## Deployment

**Deployed:** 2026-09-19
**Art:** Lokaler Produktions-Build (`npm run build` + `npm run start`), bewusst **kein** Vercel-Deployment auf Nutzerwunsch — kein Vercel-Account vorhanden/gewünscht
**URL:** http://localhost:3000 (nur lokal erreichbar, keine öffentliche URL)
**Backend:** Supabase-Projekt `my-first-app` (`yiyddydbkxycswmyisvi`), live, alle Migrationen angewendet

### Durchgeführte Checks
- [x] `npm run build` erfolgreich (Turbopack, keine TypeScript-Fehler)
- [x] Lokaler Produktions-Server (`next start`) startet und antwortet mit `200 OK` im echten Production-Modus (kein Dev-/HMR-Modus)
- [x] Keine Secrets im Git-Repo (`git ls-files` geprüft — nur `.env.local.example` getrackt)
- [x] Alle Datenbank-Migrationen in Supabase angewendet und per QA verifiziert
- [x] Code committed und nach `origin/main` gepusht (GitHub: `Sheldor99/my-first-app`)
- [ ] `npm run lint` schlägt fehl — vorbestehendes Problem (Next.js 16 + ESLint 9 ohne `eslint.config.js`), unabhängig von PROJ-1, auf Nutzerwunsch zurückgestellt (separates Ticket)

### Nicht zutreffend (kein Vercel-Deployment)
- Vercel-Projekt-Setup, Environment-Variablen im Vercel-Dashboard, Domain-Konfiguration, Error-Tracking/Security-Headers/Lighthouse-Check — diese Schritte sind für einen späteren echten Produktiv-Launch relevant, wurden für dieses lokale Deployment übersprungen.

### Bekannte offene Punkte für einen späteren echten Launch
- ESLint-Konfiguration reparieren (`eslint.config.js` fehlt)
- AC-2 (Signup/E-Mail-Bestätigung) end-to-end testen, sobald PROJ-2 die UI liefert
- „Confirm email"-Einstellung im Supabase Dashboard manuell verifizieren

## Deployment
_To be added by /deploy_
