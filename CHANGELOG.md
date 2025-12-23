# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2025-12-23

### Fixed
- **Admin Tick Logic**: Manual "Tick Day" now correctly executes all game mechanics (decay, disasters, projects) instead of just advancing the day.
- **Base Command**: System now automatically starts construction on the winning project when the previous one finishes or voting concludes.
- **Project List**: Hidden obsolete legacy projects from the UI to prevent confusion.
- **Game Over Detection**: Added explicit logging for "Game Over" states (Morale/Supplies <= 0 or Threat >= 100) in the daily event log.

## [0.3.0] - 2025-12-14 - MAJOR GAME BALANCE OVERHAUL

### Added - Game Mechanics
- Passive Decay System: Stats decline daily (-4 supplies, -2 morale, +2 threat base)
- Random Disaster System: 15% daily chance (8 disaster types)
- Cascade Failure Mechanics: Critical stats trigger compound penalties
- Population System: Community size affects consumption and production
- Project Buff Application: Completed projects provide daily bonuses
- 6 New Extreme Crisis Events: plague, raid, betrayal, famine, collapse, winter
- 15 Balanced Projects: All essential for survival with meaningful buffs

### Changed - Balance
- ALL event deltas amplified 2-3x (much bigger impact per choice)
- Production formula increased from 0.1x to 0.15x
- Crisis triggers now at 25-30 instead of 20 (more frequent)
- Projects changed from optional to essential for survival

### Added - Technical
- New `server/game_mechanics.py` module with 6 core functions
- Population field in world_states table
- Migration script and project initialization script
- Comprehensive documentation (3 new markdown files)

### Changed - Code
- Completely rewrote `finalize_day()` with all new mechanics
- Updated `/state` API endpoint to return population
- Enhanced telemetry to track all new systems

**See GAME_BALANCE_OVERHAUL.md for complete technical details**
**See SURVIVAL_GUIDE.md for player-facing guide**

---

## [Unreleased]

### Added
- Initial release with core gameplay
- 38+ dynamic events across 4 categories
- OAuth authentication via KeyN
- Admin dashboard with event management
- Custom event creation system
- Real-time vote tallies
- Dynamic background effects based on world state
- Stat information modals
- Glass-morphism UI design
- Mobile responsive design

### Features
- **Event System**: Crisis, Opportunity, Narrative, and General events
- **World Stats**: Morale, Supplies, Threat tracking
- **Admin Tools**: Create/edit/delete custom events, view metrics, manual day tick
- **Authentication**: Secure OAuth 2.0 login
- **UI/UX**: Modern design with hover effects, animations, responsive layout

## [0.1.0] - 2025-11-08

### Added
- Project initialization
- Basic gameplay loop
- Database schema
- Frontend and backend structure

---

## Version History Notes

### Upcoming Features (Planned)
- [ ] Public history/timeline page
- [ ] User profile with voting history
- [ ] Countdown timer to next day
- [ ] Email/push notifications
- [ ] Statistics dashboard
- [ ] Comments/discussion system
- [ ] Achievement system
- [ ] Special rare events
