# The Simulation

A multiplayer social experiment where collective choices shape a persistent world. Each day, players vote on how their community responds to events, with consequences that ripple through time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 Features

- **Daily Events**: 38+ dynamic events across 4 categories (Crisis, Opportunity, Narrative, General)
- **Collective Decision Making**: Community votes determine the outcome
- **Persistent World**: Morale, Supplies, and Threat levels evolve based on choices
- **Smart Event System**: Events appear based on world conditions and day progression
- **OAuth Authentication**: Secure login via KeyN
- **Admin Dashboard**: Event management, metrics, history tracking, and telemetry
- **Custom Events**: Admins can create/edit/toggle custom events via UI
- **Responsive Design**: Modern glass-morphism UI with dynamic backgrounds
- **Real-time Updates**: Live vote tallies and stat changes

## 🛠️ Tech Stack

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

## 🚀 Quick Start

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
- Adjust ports if needed

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

## 📖 Documentation

- [Gameplay Documentation](GAMEPLAY.md) - Event system, mechanics, win/lose conditions
- [Fresh Start Guide](FRESH_START.md) - Reset and initialize the simulation
- [OAuth Integration](KeyN%20Docs/OAUTH_INTEGRATION_GUIDE.md) - KeyN OAuth setup
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to the project
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Changelog](CHANGELOG.md) - Version history and updates
- [Terms of Use](TERMS_OF_USE.md) - Legal terms and conditions
- [Privacy Policy](PRIVACY_POLICY.md) - How we handle your data
- [Security Policy](SECURITY.md) - Security practices and reporting vulnerabilities

## 🎯 Game Mechanics

### Stats

- **Morale** (0-100): Community mental well-being. Game over at 0.
- **Supplies** (0-100): Food, water, resources. Game over at 0.
- **Threat** (0-100): External danger. Game over at 100.

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

## 📁 Project Structure

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

## 🔧 Development

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

### Database Reset

```bash
cd server
source .venv/bin/activate
python scripts/reset_simulation.py
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- KeyN OAuth for authentication system
- Tailwind CSS for styling framework
- Flask and React communities

## 📧 Contact

Project Link: [https://github.com/yourusername/theSimulation](https://github.com/yourusername/theSimulation)

---

**Note**: This is a social experiment and game. Have fun making tough choices! 🎲


1. Persistence layer (SQLite initial vs Postgres for production?)
2. Authentication & identity (anonymous session vs account system?)
3. Daily schedule (UTC rollover time, cron job, or manual trigger?)
4. Content pipeline for events (JSON scriptable vs AI generated?)
5. Vote mechanics (single vote per day enforcement?)
6. Scaling considerations (stateless API + caching?)
7. Visual world representation (canvas/webgl/dynamic backgrounds?)

## License

(Choose a license, e.g. MIT) Placeholder.
