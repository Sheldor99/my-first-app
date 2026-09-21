# PROJ-11: Team-Mitglieder einladen/verwalten

## Status: Planned
**Created:** 2026-09-21
**Last Updated:** 2026-09-21

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — `teams`/`team_members`-Schema mit RLS (Owner-Rechte, Cascade Delete) bereits vorhanden
- PROJ-2 (Login/Signup) — eingeloggter Nutzer als Voraussetzung
- PROJ-4 (Aufgaben) — `profiles`-Tabelle (E-Mail pro Nutzer) wird für die E-Mail-Suche beim Hinzufügen wiederverwendet

## User Stories
- Als Team-Owner möchte ich eine bereits registrierte Person per E-Mail zum Team hinzufügen, damit sie sofort mitarbeiten kann.
- Als Team-Owner möchte ich ein Mitglied aus dem Team entfernen, damit ich die Team-Zusammensetzung kontrollieren kann.
- Als Team-Owner möchte ich die Rolle eines Mitglieds ändern (zum Owner machen oder zurückstufen), damit ich Verantwortung teilen oder abgeben kann.
- Als Team-Mitglied möchte ich das Team freiwillig verlassen können, wenn ich nicht mehr mitarbeite.
- Als Team-Owner möchte ich das gesamte Team löschen können, wenn es nicht mehr gebraucht wird.
- Als Team-Mitglied möchte ich sehen, wer sonst noch im Team ist, damit ich weiß, mit wem ich zusammenarbeite.
- Als letzter verbleibender Owner möchte ich daran gehindert werden, das Team zu verlassen oder meine Owner-Rolle abzugeben, ohne vorher einen Nachfolger zu bestimmen, damit das Team nicht führungslos zurückbleibt.

## Out of Scope
- Volles Einladungssystem mit E-Mail-Versand und Annahme-Link — stattdessen sofortiges Hinzufügen per E-Mail bei bereits registrierten Nutzern (siehe Decision Log)
- Team umbenennen — eigenes künftiges Ticket, nicht Teil von PROJ-11
- Erweiterte Rollen über Owner/Member hinaus — Non-Goal lt. PRD
- Automatisches Aufräumen/Neuzuweisen von Aufgaben eines entfernten Mitglieds — bleibt wie in PROJ-4 beschrieben (verwaiste Zuweisung, zeigt „Niemand zugewiesen", kein Absturz)
- Mehrere Teams gleichzeitig verwalten / Bulk-Aktionen — nicht MVP-relevant

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Mitgliederliste anzeigen
- [ ] Angenommen ein Nutzer ist Mitglied eines Teams, wenn er die Mitgliederliste öffnet, dann sieht er alle Mitglieder mit E-Mail und Rolle (Owner/Member)
- [ ] Angenommen ein Nutzer hat die Rolle „Member", wenn er die Mitgliederliste öffnet, dann sieht er keine Verwalten-Aktionen (Hinzufügen, Entfernen, Rolle ändern, Team löschen)
- [ ] Angenommen ein Nutzer hat die Rolle „Owner", wenn er die Mitgliederliste öffnet, dann sieht er die Verwalten-Aktionen für die Mitglieder sowie die Option, das Team zu löschen

### Mitglied hinzufügen
- [ ] Angenommen ein Owner gibt die E-Mail einer bereits registrierten, noch nicht im Team befindlichen Person ein, wenn er absendet, dann wird die Person sofort als „Member" hinzugefügt und erscheint in der Liste
- [ ] Angenommen die eingegebene E-Mail gehört zu keinem registrierten Nutzer, wenn abgesendet wird, dann erscheint die Fehlermeldung „Diese Person muss sich zuerst registrieren"
- [ ] Angenommen die eingegebene E-Mail gehört bereits zu einem Mitglied dieses Teams, wenn abgesendet wird, dann erscheint die Fehlermeldung „Diese Person ist bereits Mitglied"
- [ ] Angenommen das E-Mail-Feld ist leer oder ungültig formatiert, wenn abgesendet wird, dann erscheint ein Validierungsfehler

### Mitglied entfernen
- [ ] Angenommen ein Owner klickt „Entfernen" bei einem Mitglied, wenn der Klick verarbeitet wird, dann erscheint ein Bestätigungsdialog
- [ ] Angenommen die Entfernung wird bestätigt, wenn sie verarbeitet wird, dann verliert die Person die Team-Mitgliedschaft und verschwindet aus der Liste
- [ ] Angenommen ein Owner ist der einzige verbleibende Owner, wenn er versucht sich selbst zu entfernen, dann wird dies blockiert mit einer Fehlermeldung

### Rolle ändern
- [ ] Angenommen ein Owner ändert die Rolle eines Members zu „Owner", wenn gespeichert wird, dann hat die Person ab sofort Owner-Rechte
- [ ] Angenommen ein Owner stuft einen anderen Owner zu „Member" zurück, wenn gespeichert wird, dann verliert die Person die Owner-Rechte
- [ ] Angenommen ein Owner ist der einzige verbleibende Owner, wenn er versucht die eigene Rolle zu „Member" zu ändern, dann wird dies blockiert mit einer Fehlermeldung

### Team verlassen
- [ ] Angenommen ein Mitglied klickt „Team verlassen", wenn es bestätigt, dann verliert es die Mitgliedschaft in diesem Team
- [ ] Angenommen ein Owner ist der einzige verbleibende Owner, wenn er versucht das Team zu verlassen, dann wird dies blockiert mit derselben Fehlermeldung wie beim Selbst-Entfernen

### Team löschen
- [ ] Angenommen ein Owner klickt „Team löschen", wenn der Klick verarbeitet wird, dann erscheint ein Bestätigungsdialog mit dem Hinweis, dass alle Projekte und Aufgaben des Teams unwiderruflich mitgelöscht werden
- [ ] Angenommen die Löschung wird bestätigt, wenn sie verarbeitet wird, dann werden Team, alle zugehörigen Projekte, Aufgaben und Mitgliedschaften entfernt

## Edge Cases
- Owner gibt seine eigene E-Mail-Adresse beim Hinzufügen ein → Fehlermeldung „Diese Person ist bereits Mitglied" (Owner ist selbst bereits Mitglied)
- Zwei Owner führen gleichzeitig widersprüchliche Aktionen aus (z. B. beide entfernen sich gegenseitig) → serverseitige Regeln verhindern einen Zustand ohne Owner; die zuerst verarbeitete Aktion gewinnt, die zweite schlägt ggf. fehl und zeigt eine Fehlermeldung
- Ein Nutzer hat die Team-Detailseite/Mitgliederliste offen, während das Team von einem Owner gelöscht wird → die nächste Aktion dieses Nutzers schlägt fehl und zeigt eine klare Fehlermeldung statt eines Absturzes
- Netzwerkfehler beim Hinzufügen/Entfernen/Rolle ändern/Team löschen → Fehlermeldung anzeigen, Formulareingaben bleiben wo sinnvoll erhalten
- Doppeltes schnelles Klicken auf eine Verwalten-Aktion → Button wird während des laufenden Requests deaktiviert, kein Doppel-Request

## Technical Requirements
- Security: Die E-Mail-Suche beim Hinzufügen ist auf Team-Owner beschränkt und gibt nur das Minimum preis, das zur Entscheidung „gefunden/nicht gefunden/bereits Mitglied" nötig ist
- Security: Alle Aktionen (Hinzufügen, Entfernen, Rolle ändern, Team löschen) bleiben zusätzlich durch die bestehenden RLS-Policies aus PROJ-1 serverseitig abgesichert, unabhängig von der UI
- Validierung: E-Mail-Format-Validierung beim Hinzufügen eines Mitglieds

## Open Questions
_Keine offenen Fragen — im Interview geklärt._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Sofortiges Hinzufügen per E-Mail statt vollem Einladungssystem mit E-Mail-Versand/Annahme-Link | Deutlich weniger Aufwand (keine neue Tabelle, kein zusätzlicher E-Mail-Versand nötig); passt zum PRD-Ziel „ohne Onboarding-Aufwand" | 2026-09-21 |
| Letzter verbleibender Owner kann weder das Team verlassen noch die eigene Rolle abgeben | Verhindert ein Team ohne Owner, das dann von niemandem mehr verwaltet werden könnte — löst die in PROJ-1 offen gelassene Frage | 2026-09-21 |
| Rollenänderung (Owner ↔ Member) als Teil von PROJ-11 aufgenommen | Notwendige Voraussetzung, damit der letzte-Owner-Schutz überhaupt eine Lösung hat (jemand anderen zum Owner machen) | 2026-09-21 |
| Team löschen aus PROJ-3 nach PROJ-11 verschoben, nur für Owner, mit Bestätigungsdialog analog zum Projekt-Löschen | Konsistentes Muster; Team-Löschen betrifft alle Mitglieder und ist noch drastischer als Projekt-Löschen | 2026-09-21 |
| Mitgliederliste für alle sichtbar, Verwalten-Aktionen nur für Owner sichtbar | Entspricht der bestehenden RLS aus PROJ-1 (nur Owner darf diese Aktionen serverseitig ausführen); UI soll das widerspiegeln statt nutzlose Buttons anzuzeigen | 2026-09-21 |
| Team umbenennen bleibt out of scope | Wurde bereits in PROJ-3 als eigenes künftiges Ticket vermerkt, nicht Teil dieses Tickets | 2026-09-21 |

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
