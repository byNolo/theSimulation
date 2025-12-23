# The Simulation

> **v0.4.1 AI NARRATIVE UPDATE** - The simulation is now powered by a sophisticated AI Storyteller. Events, summaries, and community chatter are dynamically generated based on your history and choices. See [CHANGELOG.md](CHANGELOG.md) for details.

A multiplayer social experiment where collective choices shape a persistent world. Each day, players vote on how their community responds to events, with consequences that ripple through time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **AI Storyteller**: Powered by DeepSeek V3 via OpenRouter. (Optional)
  - **Context-Aware Events**: Daily crises generated based on the last 3 days of history.
  - **Narrative Summaries**: Atmospheric journal entries summarizing the day's outcome.
  - **Community Chatter**: AI-generated citizens debate choices and react to morale/events.
- **Announcement System**: Broadcast updates via site popups and Nolofication (email/push).
- **Daily Events**: Dynamic events across 4 categories (Crisis, Opportunity, Narrative, General).
- **Collective Decision Making**: Community votes determine the outcome.
- **Persistent World**: Morale, Supplies, Threat, and Population evolve based on choices.
- **Passive Decay System**: Stats naturally decline without action - projects are essential.
- **Random Disasters**: 15% daily chance of unexpected events outside player control.
- **Cascade Failures**: Critical stats trigger additional penalties.
- **Base Building**: 15 projects with meaningful buffs to counter decay.
- **OAuth Authentication**: Secure login via KeyN.
- **Admin Dashboard**: Event management, metrics, history tracking, and telemetry.
- **Responsive Design**: Modern glass-morphism UI with dynamic backgrounds.
- **Real-time Updates**: Live vote tallies and stat changes.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Glass-morphism design

**Backend:**
- Flask (Python)
- SQLAlchemy ORM
- SQLite database
- Session-based authentication
- OAuth 2.0 (KeyN)

## Quick Start

### Configuration

Create a `.env` file in the `server` directory (or root) with the following:

```bash
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///simulation.db
ADMIN_TOKEN=your_admin_token
OPENROUTER_API_KEY=your_openrouter_key  # Optional: Enables AI generation
```

### Automated Setup (Recommended)

```bash
git clone https://github.com/yourusername/theSimulation.git
cd theSimulation
./setup.sh
```

The script will:
1. Create `.env` from template
2. Set up Python virtual environment
3. Install backend dependencies
4. Install frontend dependencies
5. Generate SSL certificates for HTTPS

Then follow the prompts to configure OAuth and start the servers.

### Manual Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/theSimulation.git
cd theSimulation
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `KEYN_CLIENT_ID` and `KEYN_CLIENT_SECRET` (register at https://auth-keyn.bynolo.ca)
- `SECRET_KEY` (generate with `python -c "import secrets; print(secrets.token_hex(32))"`)
- **Nolofication Integration (Optional)**:
  - `NOLOFICATION_URL` - URL of Nolofication service (default: https://nolofication.bynolo.ca)
  - `NOLOFICATION_SITE_ID` - Your site ID in Nolofication (default: thesimulation)
  - `NOLOFICATION_API_KEY` - API key from Nolofication registration (required for notifications)
- Adjust ports if needed

**Note**: If you don't configure Nolofication, the app will work normally but won't send vote reminder notifications.

### 3. Backend Setup

```bash
cd server
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at `http://localhost:5060`

### 4. Frontend Setup

```bash
cd web
npm install
npm run dev
```

Frontend runs at `https://localhost:5160` (HTTPS required for OAuth)

### 5. Set Admin User

After logging in once, set yourself as admin:

```bash
cd server
source .venv/bin/activate
python scripts/set_admin.py YOUR_USERNAME
```

## Documentation

- [Gameplay Documentation](GAMEPLAY.md) - Event system, mechanics, win/lose conditions
- [Fresh Start Guide](FRESH_START.md) - Reset and initialize the simulation
- [OAuth Integration](KeyN%20Docs/OAUTH_INTEGRATION_GUIDE.md) - KeyN OAuth setup
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Changelog](CHANGELOG.md) - Version history and updates
- [Terms of Use](TERMS_OF_USE.md) - Legal terms and conditions
- [Privacy Policy](PRIVACY_POLICY.md) - How we handle your data
- [Security Policy](SECURITY.md) - Security practices and reporting vulnerabilities

## Game Mechanics

### Stats

- **Morale** (0-100): Community mental well-being. Game over at 0.
- **Supplies** (0-100): Food, water, resources. Game over at 0.
- **Threat** (0-100): External danger. Game over at 100.
- **Population** (0-1000): Number of survivors. Game over at 0.
- **Production** (0-100): Building rate for projects.

### Event Categories

- 🔴 **Crisis**: Appear when stats are critical (8 events)
- 🟢 **Opportunity**: Appear when stable (11 events)
- 🟣 **Narrative**: Story progression (9 events)
- 🔵 **General**: Daily routine choices (10 events)

### Admin Features

- Create/edit/delete custom events
- View metrics, history, and telemetry
- Manually tick days
- Toggle event activation

## Project Structure

```
theSimulation/
├── server/                 # Flask backend
│   ├── app.py             # Main application
│   ├── models.py          # Database models
│   ├── events.py          # Event system (38+ events)
│   ├── routes/            # API endpoints
│   │   ├── api.py         # Public endpoints
│   │   ├── admin.py       # Admin endpoints
│   │   └── auth.py        # OAuth authentication
│   ├── utils/             # Helper functions
│   └── scripts/           # Utilities (set_admin, reset)
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API layer
│   │   └── hooks/         # Custom hooks
│   └── certs/             # SSL certificates
├── .env.example           # Environment template
└── README.md
```

## Development

### Backend Tasks

Available VS Code tasks:
- `Backend: Create venv` - Initialize virtual environment
- `Backend: Install deps` - Install Python packages
- `Backend: Start` - Run Flask server

### Frontend Tasks

- `Frontend: Install` - Install npm packages
- `Frontend: Start` - Run Vite dev server

### Run Both

Use the `Run Both` task to start backend and frontend simultaneously.

### Production run (simple local / small production)

A helper script for running a small production-style deployment locally (recommended for staging or simple deployments).

Usage:

```bash
# from the repository root
./run_prod.sh
# Optional environment overrides:
PORT=5060 WEB_PORT=5160 WORKERS=4 ./run_prod.sh
```

What it does:
- Ensures `server/.venv` exists and installs backend requirements if missing
- Installs `gunicorn` into the venv if not present and starts the backend
- Builds the frontend and serves it with `vite preview` (on `WEB_PORT`)
- Writes logs to `logs/backend.log` and `logs/frontend.log` and PID files at `server/gunicorn.pid` and `web/preview.pid`

Notes:
- This script is intended for simple/staging use. For production-grade deployments use a process manager (systemd, supervisor, or containers) and a reverse proxy (nginx) with TLS terminated externally.

## Notifications

The Simulation integrates with [Nolofication](https://nolofication.bynolo.ca) v2 to send automated notifications with user-controlled scheduling.

### Notification Categories

The Simulation uses two notification categories:

1. **Day Results** (`day_results`): Sent when a day finalizes with the community's decision and updated stats
2. **Vote Reminders** (`vote_reminders`): Sent when a new day begins to remind users to vote

Users can configure when they receive each category:
- **Instant**: Receive immediately (default for important updates)
- **Daily Digest**: Batch notifications sent once per day at preferred time
- **Weekly Summary**: Batch notifications sent once per week

### How It Works

1. **Day Tick**: When a day ends (automatically at midnight EST), the system:
   - Finalizes the previous day's results
   - Sends **Day Results** notifications to all users
   - Creates the new day
   - Sends **Vote Reminders** to all users

2. **Scheduling**: Nolofication handles delivery timing based on each user's preferences
   - Users control their schedule at [Nolofication Dashboard](https://nolofication.bynolo.ca)
   - Can choose different schedules for different categories
   - Can disable categories they don't want

3. **Multi-Channel**: Users receive notifications via their preferred channels:
   - Email (with rich HTML formatting)
   - Web push notifications
   - Discord (if configured)
   - Webhooks (if configured)

### Setup

To enable notifications:

1. Register your site at Nolofication (contact admin or use CLI)
2. Add environment variables to `.env`:
   ```
   NOLOFICATION_URL=https://nolofication.bynolo.ca
   NOLOFICATION_SITE_ID=thesimulation
   NOLOFICATION_API_KEY=your-api-key-here
   ```
3. Restart the server

Notifications are sent automatically when day transitions occur. No scheduler needed!

For more details on Nolofication integration, see [Nolofication_INTEGRATION_GUIDE.md](Nolofication_INTEGRATION_GUIDE.md).

## Production Deployment

For deploying to production with Cloudflare Tunnel at `thesim.bynolo.ca`, see the comprehensive [DEPLOYMENT.md](DEPLOYMENT.md) guide.

Quick production start:
1. Configure `.env` with production OAuth settings
2. Run `./run_prod.sh` on the application server
3. Set up Cloudflare Tunnel from another machine pointing to this server
4. Access at `https://thesim.bynolo.ca`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps, troubleshooting, and maintenance.

### Database Reset

```bash
cd server
source .venv/bin/activate
python scripts/reset_simulation.py
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- KeyN OAuth byNolo for authentication system
- Nolofication byNolo for notification service
- Tailwind CSS for styling framework
- Flask and React communities

## Contact

Project Link: [https://github.com/byNolo/theSimulation](https://github.com/byNolo/theSimulation)

---

**Note**: This is a social experiment and game. Have fun making tough choices! 


1. Persistence layer (SQLite initial vs Postgres for production?)
2. Authentication & identity (anonymous session vs account system?)
3. Daily schedule (UTC rollover time, cron job, or manual trigger?)
4. Content pipeline for events (JSON scriptable vs AI generated?)
5. Vote mechanics (single vote per day enforcement?)
6. Scaling considerations (stateless API + caching?)
7. Visual world representation (canvas/webgl/dynamic backgrounds?)
