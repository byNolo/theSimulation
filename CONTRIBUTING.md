# Contributing to The Simulation

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/theSimulation.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit: `git commit -m "Add: your feature description"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Pull Request Guidelines

- **One feature per PR** - Keep PRs focused and manageable
- **Clear description** - Explain what and why, not just how
- **Test your changes** - Ensure nothing breaks
- **Follow code style** - Match existing patterns
- **Update documentation** - If you change functionality

## 🎨 Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints where appropriate
- Docstrings for functions/classes
- Keep functions focused and small

### TypeScript/React (Frontend)
- Use TypeScript strictly
- Functional components with hooks
- Props interfaces for components
- Descriptive variable names

## 🧪 Testing

Before submitting:
- Test backend endpoints with sample data
- Test frontend UI changes in browser
- Check mobile responsiveness
- Verify no console errors

## 🎯 Areas for Contribution

### High Priority
- [ ] Public history/timeline page
- [ ] User profile with voting history
- [ ] Countdown timer for next day
- [ ] Mobile UX improvements
- [ ] Email/push notifications
- [ ] Statistics dashboard

### Events & Content
- [ ] New event ideas (Crisis, Opportunity, Narrative, General)
- [ ] Event balancing (delta adjustments)
- [ ] Special rare events
- [ ] Holiday/milestone events

### Features
- [ ] Comments/discussion system
- [ ] Search and filters for event history
- [ ] Export simulation data
- [ ] Achievements/badges
- [ ] Leaderboards

### Bug Fixes
- Check GitHub Issues for bugs to fix
- Report new bugs with reproduction steps

## 💡 Event Contributions

To add new events, modify `server/events.py`:

```python
EventTemplate(
    id="unique_event_id",
    headline="Event Headline",
    description="What's happening?",
    category="crisis|opportunity|narrative|general",
    weight=1,  # How likely to appear
    min_morale=0,  # Conditions
    max_morale=100,
    min_supplies=0,
    max_supplies=100,
    min_threat=0,
    max_threat=100,
    requires_day=0,  # Minimum day number
    options=[
        Option("option_key", "Display Label", 
               {"morale": +5, "supplies": -3, "threat": 0},
               "Optional description"),
        # 2-3 options per event
    ],
)
```

**Event Guidelines:**
- 2-3 meaningful choices
- Clear trade-offs between options
- Deltas should sum to roughly neutral across options
- Description should set the scene
- Test for balance (avoid instant game over)

## 🐛 Bug Reports

Include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/OS information

## 💬 Questions?

- Open a GitHub Discussion
- Check existing Issues and PRs
- Review documentation in `/docs`

## 📝 Commit Message Format

```
Type: Brief description

Longer explanation if needed.

- Bullet points for details
- Reference issues with #123
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Change existing feature
- `Refactor:` Code restructuring
- `Docs:` Documentation only
- `Style:` Formatting, no code change
- `Test:` Adding tests

## 🎉 Recognition

Contributors will be acknowledged in:
- GitHub contributors page
- Release notes for significant contributions
- README credits section (for major features)

Thank you for helping make The Simulation better! 🚀
