# PROJ-2: Login/Signup (Auth)

## Status: Planned
**Created:** 2026-09-20
**Last Updated:** 2026-09-20

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — Supabase Auth mit E-Mail-Bestätigung, Env-Vars, Client-Setup

## User Stories
- Als neuer Nutzer möchte ich mich mit E-Mail und Passwort registrieren, damit ich einen Account erhalte.
- Als registrierter Nutzer möchte ich mich einloggen, damit ich auf die App zugreifen kann.
- Als Nutzer, der sein Passwort vergessen hat, möchte ich es zurücksetzen können, damit ich nicht dauerhaft ausgesperrt bin.
- Als Nutzer mit unbestätigter E-Mail möchte ich die Bestätigungs-E-Mail erneut anfordern können, damit ich nicht im Spam-Ordner suchen oder mich neu registrieren muss.
- Als eingeloggter Nutzer möchte ich mich ausloggen können, damit meine Session sicher beendet wird.
- Als nicht eingeloggter Nutzer möchte ich automatisch zum Login umgeleitet werden, wenn ich eine geschützte Seite aufrufe, damit meine Daten geschützt bleiben.

## Out of Scope
- Team-Mitglieder einladen, entfernen, Rollen ändern — verschoben nach PROJ-11 (Team-Mitglieder einladen/verwalten)
- Dashboard-/Team-Ansicht nach dem Login — kommt mit PROJ-3 (Projekte anlegen/verwalten); PROJ-2 zeigt nach Login nur einen minimalen eingeloggten Platzhalter-Zustand
- OAuth-Login (z. B. Google) — Non-Goal lt. PRD
- Profil-Bearbeitung (Name, Avatar, E-Mail ändern) — nicht spezifiziert, eigenes künftiges Ticket falls benötigt
- Schutz „letzter Owner darf Team nicht verlassen" — gehört inhaltlich zu PROJ-11, nicht zu Login/Signup
- Custom Rate-Limiting für Login/Signup/Reset-Requests — verlässt sich für das MVP auf Supabase Auths eingebauten Schutz
- „Angemeldet bleiben"/Remember-Me-Option — Supabase-Standard-Session-Verhalten reicht fürs MVP

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Registrierung
- [ ] Angenommen ein Besucher füllt das Registrierungsformular mit gültiger E-Mail, Passwort und Passwort-Bestätigung aus, wenn er absendet, dann wird eine Bestätigungs-E-Mail versendet und eine Erfolgsmeldung angezeigt, dass der Account bis zur Bestätigung inaktiv bleibt
- [ ] Angenommen ein Besucher gibt ein Passwort mit weniger als 10 Zeichen ein, wenn er das Formular absendet, dann wird ein Validierungsfehler „Passwort muss mindestens 10 Zeichen lang sein" angezeigt
- [ ] Angenommen ein Besucher gibt ein Passwort ohne Großbuchstabe, Kleinbuchstabe oder Zahl ein, wenn er das Formular absendet, dann wird ein entsprechender Validierungsfehler angezeigt
- [ ] Angenommen Passwort und Passwort-Bestätigung stimmen nicht überein, wenn der Besucher absendet, dann wird ein Validierungsfehler „Passwörter stimmen nicht überein" angezeigt, ohne den Request abzusenden
- [ ] Angenommen die eingegebene E-Mail ist bereits registriert, wenn der Besucher das Formular absendet, dann wird dieselbe generische Erfolgsmeldung wie bei einer neuen Registrierung angezeigt (kein Hinweis, dass die E-Mail bereits existiert)
- [ ] Angenommen das Registrierungsformular wird leer abgeschickt, wenn der Besucher absendet, dann wird für jedes Pflichtfeld eine Validierungsfehlermeldung angezeigt

### E-Mail-Bestätigung
- [ ] Angenommen ein Nutzer hat sich registriert aber seine E-Mail noch nicht bestätigt, wenn er versucht sich einzuloggen, dann wird die Fehlermeldung „Bitte bestätige zuerst deine E-Mail-Adresse" mit einem Button „Bestätigungs-E-Mail erneut senden" angezeigt
- [ ] Angenommen ein Nutzer mit unbestätigter E-Mail klickt auf „Bestätigungs-E-Mail erneut senden", wenn der Request erfolgreich ist, dann wird eine neue Bestätigungs-E-Mail versendet und eine Bestätigung angezeigt
- [ ] Angenommen ein Nutzer klickt auf einen gültigen Bestätigungslink, wenn die Bestätigung verarbeitet wird, dann wird der Account aktiviert und der Nutzer zur Login-Seite mit Erfolgsmeldung weitergeleitet

### Login
- [ ] Angenommen ein Nutzer mit bestätigtem Account gibt korrekte Zugangsdaten ein, wenn er sich einloggt, dann wird er zu `/` weitergeleitet und sieht dort einen minimalen eingeloggten Zustand (z. B. „Eingeloggt als [E-Mail]" + Logout-Button)
- [ ] Angenommen ein Nutzer gibt eine falsche E-Mail oder ein falsches Passwort ein, wenn er sich einloggt, dann wird die generische Fehlermeldung „E-Mail oder Passwort ist falsch" angezeigt (keine Unterscheidung zwischen unbekannter E-Mail und falschem Passwort)
- [ ] Angenommen das Login-Formular wird leer abgeschickt, wenn der Nutzer absendet, dann wird für jedes Pflichtfeld eine Validierungsfehlermeldung angezeigt
- [ ] Angenommen ein bereits eingeloggter Nutzer ruft `/login` oder `/signup` auf, wenn die Seite lädt, dann wird er automatisch zu `/` umgeleitet

### Passwort-Reset
- [ ] Angenommen ein Nutzer fordert einen Passwort-Reset über seine E-Mail-Adresse an, wenn er absendet, dann wird immer dieselbe generische Meldung „Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet" angezeigt, unabhängig davon, ob die E-Mail existiert
- [ ] Angenommen ein Nutzer klickt auf einen gültigen, nicht abgelaufenen Reset-Link, wenn er ein neues Passwort setzt, das die Passwort-Regeln erfüllt, dann wird das Passwort aktualisiert und er wird mit Erfolgsmeldung zur Login-Seite weitergeleitet
- [ ] Angenommen ein Nutzer klickt auf einen abgelaufenen oder bereits verwendeten Reset-Link, wenn die Seite lädt, dann wird eine Fehlermeldung mit einem Link „Neuen Reset-Link anfordern" angezeigt

### Logout & Routenschutz
- [ ] Angenommen ein Nutzer ist eingeloggt, wenn er auf „Logout" klickt, dann wird seine Session beendet und er wird zu `/login` weitergeleitet
- [ ] Angenommen ein nicht eingeloggter Nutzer ruft eine geschützte Route auf, wenn die Middleware den Request verarbeitet, dann wird er automatisch zu `/login` umgeleitet

## Edge Cases
- Netzwerkfehler/API nicht erreichbar beim Absenden eines Formulars → Fehlermeldung anzeigen, Eingaben bleiben erhalten (kein Datenverlust)
- Doppeltes schnelles Klicken auf den Submit-Button → Button wird während des laufenden Requests deaktiviert, kein Doppel-Request
- Nutzer schließt den Tab im Warte-Zustand nach der Registrierung und kommt später zurück → Login-Versuch zeigt weiterhin die „E-Mail nicht bestätigt"-Fehlermeldung mit Resend-Option
- Reset-Link wird ein zweites Mal verwendet, nachdem das Passwort bereits geändert wurde → Fehlermeldung wie bei abgelaufenem Link
- Nutzer fordert mehrfach hintereinander eine neue Bestätigungs- oder Reset-E-Mail an → verlässt sich auf Supabase Auths eingebautes Rate-Limiting (keine eigene Sperre)
- Sehr lange Eingaben in E-Mail-/Passwort-Feldern → serverseitige Zod-Validierung greift, kein Crash

## Technical Requirements
- Security: Passwort-Policy — mindestens 10 Zeichen, mindestens ein Großbuchstabe, ein Kleinbuchstabe, eine Zahl (kein Pflicht-Sonderzeichen); Validierung mit Zod client- und serverseitig
- Security: Generische Fehlermeldungen bei Login, Registrierung (bereits vorhandene E-Mail) und Passwort-Reset-Request zur Vermeidung von User-Enumeration
- Security: Routenschutz zentral über Next.js Middleware basierend auf der Supabase-Session, nicht pro Seite einzeln
- Rate-Limiting: kein Custom-Rate-Limiting im MVP, verlässt sich auf Supabase Auths eingebauten Schutz

## Open Questions
_Keine offenen Fragen — im Interview geklärt._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Team-Mitglieder-Einladung/-Verwaltung aus PROJ-2 herausgelöst, jetzt PROJ-11 | Unterschiedliche UI-Screens, unabhängig testbar/deploybar (Single Responsibility) | 2026-09-20 |
| Passwort-Reset in PROJ-2 statt separatem Ticket | Ohne Reset-Flow wären ausgesperrte Nutzer ein zu hohes Risiko fürs MVP; Supabase bringt den Flow bereits eingebaut mit | 2026-09-20 |
| Nach Login/Signup Redirect auf `/` mit minimalem eingeloggten Platzhalter statt vollem Dashboard | Dashboard/Team-Ansicht ist Scope von PROJ-3; PROJ-2 bleibt auf reine Auth-Funktionalität fokussiert | 2026-09-20 |
| Passwort-Policy: min. 10 Zeichen + Groß-/Kleinbuchstabe + Zahl, kein Pflicht-Sonderzeichen | Nutzerwunsch nach strengerer Regel als Standard-Empfehlung, ohne durch Sonderzeichen-Pflicht die UX unnötig zu verschlechtern | 2026-09-20 |
| Login vor E-Mail-Bestätigung: Fehlermeldung + „Bestätigung erneut senden"-Option | Bessere UX als Sackgasse oder erzwungene Neu-Registrierung | 2026-09-20 |
| Routenschutz über Next.js Middleware statt Client-seitiger Prüfung pro Seite | Zentraler, nicht umgehbarer Schutzpunkt für alle aktuellen und künftigen geschützten Routen | 2026-09-20 |
| Generische Fehlermeldung bei falschem Login („E-Mail oder Passwort falsch") | Verhindert User-Enumeration, Standard-Sicherheitspraxis | 2026-09-20 |
| Generische Bestätigungsmeldung bei Passwort-Reset-Request, unabhängig von E-Mail-Existenz | Konsistenter Enumeration-Schutz wie beim Login | 2026-09-20 |
| Generische Erfolgsmeldung bei Registrierung mit bereits existierender E-Mail | Konsistenter Enumeration-Schutz wie bei Login/Reset; verhindert, dass Angreifer registrierte E-Mails identifizieren können | 2026-09-20 |
| Passwort-bestätigen-Feld im Signup-Formular | Verhindert Tippfehler beim Passwort, Standard-UX-Praxis | 2026-09-20 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| `@supabase/ssr` statt nur `@supabase/supabase-js` | Middleware muss serverseitig prüfen können, ob ein Nutzer eingeloggt ist; dafür muss die Session cookie-basiert und vom Server lesbar sein, nicht nur im Browser-localStorage | 2026-09-20 |
| Bestätigungs-/Reset-Links laufen über eine technische Route `/auth/confirm` statt direkt auf die Zielseite | Supabase-Links enthalten einen Code, der serverseitig gegen eine Session getauscht werden muss, bevor der Nutzer sinnvoll weitergeleitet werden kann | 2026-09-20 |
| Kein eigenes API-Backend für Login/Signup/Reset | Formulare sprechen Supabase Auth direkt über den öffentlichen Schlüssel an; das ist von Supabase als sicher vorgesehen und spart eine unnötige Zwischenschicht | 2026-09-20 |
| Routenschutz zentral in `middleware.ts`, nicht pro Seite | Ein einziger, nicht umgehbarer Prüfpunkt für alle aktuellen und künftigen geschützten Routen | 2026-09-20 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Component Structure
```
/login (Seite)
├── LoginForm
│   ├── E-Mail-Feld, Passwort-Feld
│   ├── "Passwort vergessen?"-Link → /forgot-password
│   ├── "Noch kein Konto? Registrieren"-Link → /signup
│   └── Fehleranzeige (generische Meldung / "E-Mail nicht bestätigt" + Resend-Button)

/signup (Seite)
├── SignupForm
│   ├── E-Mail-, Passwort-, Passwort-bestätigen-Feld
│   ├── "Bereits ein Konto? Login"-Link → /login
│   └── Erfolgsanzeige ("Prüfe deine E-Mails")

/forgot-password (Seite)
├── ForgotPasswordForm (E-Mail-Feld)
└── Generische Bestätigungsanzeige nach Absenden

/reset-password (Seite, aufgerufen über Link aus der E-Mail)
├── ResetPasswordForm (neues Passwort + Bestätigung)
└── Fehleranzeige bei abgelaufenem/ungültigem Link + "Neuen Link anfordern"

/auth/confirm (technische Route, kein sichtbares UI)
└── Verarbeitet Bestätigungs-/Reset-Links von Supabase, leitet dann passend weiter

middleware.ts (kein UI)
└── Prüft bei jedem Seitenaufruf die Session, leitet um wenn nötig

/ (Startseite, angepasst)
└── Eingeloggt-Zustand: "Eingeloggt als [E-Mail]" + Logout-Button (Platzhalter bis PROJ-3)
```

### Data Model (plain language)
Für PROJ-2 wird keine neue Datenbanktabelle benötigt. Nutzerkonten (E-Mail, Passwort-Hash, Bestätigungsstatus) werden komplett von Supabase Auth intern verwaltet — das ist bereits seit PROJ-1 eingerichtet. PROJ-2 baut nur die Oberfläche und die Verbindungslogik dazu.

### Tech Decisions
- Neues Paket `@supabase/ssr` nötig: Das bisher installierte Supabase-Paket funktioniert nur im Browser. Da die Middleware serverseitig prüfen muss, ob jemand eingeloggt ist, brauchen wir eine Variante, die den Login-Status sicher in einem Cookie speichert, das auch der Server lesen kann.
- Formulare mit react-hook-form + Zod: Wie im Projekt-Standard festgelegt — Zod definiert die Passwort-Regeln einmal, wird für Client- und Server-Validierung wiederverwendet.
- Bestätigungs-/Reset-Links laufen über eine technische Zwischenseite (`/auth/confirm`): Supabase schickt Links, die zuerst serverseitig verarbeitet werden müssen, bevor der Nutzer zur richtigen Seite weitergeleitet wird.
- Kein eigenes Backend/API für Login/Signup nötig: Die Formulare sprechen Supabase Auth direkt an — spart Entwicklungsaufwand ohne Sicherheitsnachteil.

### Dependencies
- `@supabase/ssr` — ermöglicht serverseitiges Session-Handling (Middleware, geschützte Seiten)

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
