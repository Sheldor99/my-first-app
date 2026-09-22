# Feature Index

> Central tracking for all features. Updated by skills automatically.

## Status Legend
- **Roadmap** - `/init` done, feature identified in feature map, no spec file yet
- **Planned** - `/write-spec` done, full spec written, architecture not yet designed
- **Architected** - `/architecture` done, tech design approved, ready to build
- **In Progress** - `/frontend` or `/backend` active or completed, not yet in QA
- **In Review** - `/qa` active, testing in progress
- **Approved** - `/qa` passed, no critical/high bugs, ready to deploy
- **Deployed** - `/deploy` done, live in production

## Features

| ID | Feature | Priority | Dependencies | Status | Spec | Created |
|----|---------|----------|--------------|--------|------|---------|
| PROJ-1 | Supabase Infrastructure Setup | P0 | None | Deployed | [PROJ-1](PROJ-1-supabase-infrastructure-setup.md) | 2026-09-18 |
| PROJ-2 | Login/Signup (Auth) | P0 | PROJ-1 | Deployed | [PROJ-2](PROJ-2-login-signup.md) | 2026-09-18 |
| PROJ-3 | Projekte anlegen/verwalten | P0 | PROJ-1, PROJ-2 | Deployed | [PROJ-3](PROJ-3-projekte-anlegen-verwalten.md) | 2026-09-18 |
| PROJ-4 | Aufgaben (Tasks): Status, Zuweisung, Fälligkeitsdatum | P0 | PROJ-1, PROJ-3 | Deployed | [PROJ-4](PROJ-4-aufgaben-tasks.md) | 2026-09-18 |
| PROJ-5 | Kanban-Board-Ansicht pro Projekt | P0 | PROJ-1, PROJ-4 | Deployed | [PROJ-5](PROJ-5-kanban-board-ansicht.md) | 2026-09-18 |
| PROJ-6 | Kommentare zu Aufgaben | P1 | PROJ-1, PROJ-4 | In Progress | [PROJ-6](PROJ-6-kommentare-zu-aufgaben.md) | 2026-09-18 |
| PROJ-7 | Dateianhänge an Aufgaben | P1 | PROJ-1, PROJ-4 | Roadmap | - | 2026-09-18 |
| PROJ-8 | Zeiterfassung | P2 | PROJ-4 | Roadmap | - | 2026-09-18 |
| PROJ-9 | Reporting/Analytics-Dashboard | P2 | PROJ-3, PROJ-4 | Roadmap | - | 2026-09-18 |
| PROJ-10 | Benachrichtigungen | P2 | PROJ-4, PROJ-6 | Roadmap | - | 2026-09-18 |
| PROJ-11 | Team-Mitglieder einladen/verwalten | P0 | PROJ-1, PROJ-2, PROJ-4 | Deployed | [PROJ-11](PROJ-11-team-mitglieder-verwalten.md) | 2026-09-20 |

<!-- Add features above this line -->

## Next Available ID: PROJ-12
