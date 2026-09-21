# Product Requirements Document

## Vision
Eine einfache, fokussierte Projekt-Management-App für kleine Teams (3–10 Personen), die Aufgaben, Projekte und Zuständigkeiten ohne Onboarding-Aufwand und ohne Preis-pro-Kopf-Explosion organisiert. Statt der Komplexität von Jira oder den fehlenden Team-Features von Trello bietet sie genau das, was kleine Agenturteams mit mehreren parallelen Kundenprojekten brauchen.

## Target Users
Kleine Software-/Kreativ-Agenturteams (3–10 Personen), die mehrere Kundenprojekte gleichzeitig betreuen. Pain Points: bestehende Tools sind entweder zu simpel (keine echte Team-/Multi-Projekt-Übersicht) oder zu komplex und teuer für kleine Teams.

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | Supabase Infrastructure Setup | Deployed |
| P0 (MVP) | Login/Signup (Auth) | Deployed |
| P0 (MVP) | Projekte anlegen/verwalten | Planned |
| P0 (MVP) | Team-Mitglieder einladen/verwalten | Roadmap |
| P0 (MVP) | Aufgaben (Tasks) mit Status, Zuweisung, Fälligkeitsdatum | Planned |
| P0 (MVP) | Kanban-Board-Ansicht pro Projekt | Roadmap |
| P1 | Kommentare zu Aufgaben | Roadmap |
| P1 | Dateianhänge an Aufgaben | Roadmap |
| P2 | Zeiterfassung | Roadmap |
| P2 | Reporting/Analytics-Dashboard | Roadmap |
| P2 | Benachrichtigungen | Roadmap |

## Success Metrics
- Ein Team kann in unter 5 Minuten ein Projekt anlegen und die erste Aufgabe zuweisen
- Aktive wöchentliche Nutzung durch mind. 1 Test-Team über 2+ Wochen
- Kernaktionen (Task erstellen, Status ändern, zuweisen) funktionieren fehlerfrei

## Constraints
- Solo-Entwicklung, kein festes Budget, kein harter Deadline-Termin
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Design: Template-Defaults (Tailwind + shadcn/ui Standard-Theme)

## Non-Goals
- Keine native mobile App (nur responsive Web-App, mobil-optimiert)
- Keine Zeiterfassung/Abrechnung/Invoicing (im MVP)
- Keine erweiterten Reportings/Analytics-Dashboards (im MVP)
- Keine Integrationen mit Drittsystemen (Slack, GitHub, etc.)
- Keine erweiterte Rechte-/Rollenverwaltung über Owner/Member hinaus

---

Use `/write-spec` to create detailed feature specifications for each item in the roadmap above.
