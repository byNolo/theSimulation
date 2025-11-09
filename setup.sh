#!/bin/bash

# The Simulation - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🎮 The Simulation - Setup Script"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your KeyN OAuth credentials"
    echo "   Register at: https://auth-keyn.bynolo.ca"
    echo ""
    read -p "Press enter when you've configured .env..."
else
    echo "✓ .env file already exists"
fi

# Backend setup
echo ""
echo "🐍 Setting up Python backend..."
cd server

if [ ! -d ".venv" ]; then
    echo "  Creating virtual environment..."
    python3 -m venv .venv
fi

echo "  Activating virtual environment..."
source .venv/bin/activate

echo "  Installing dependencies..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo "✓ Backend setup complete"

cd ..

# Frontend setup
echo ""
echo "⚛️  Setting up React frontend..."
cd web

if [ ! -d "node_modules" ]; then
    echo "  Installing npm dependencies..."
    npm install
else
    echo "✓ Dependencies already installed"
fi

# Check for SSL certificates
if [ ! -f "certs/localhost-cert.pem" ]; then
    echo ""
    echo "🔐 SSL certificates not found"
    echo "   Generating self-signed certificates for HTTPS..."
    mkdir -p certs
    openssl req -x509 -newkey rsa:4096 \
        -keyout certs/localhost-key.pem \
        -out certs/localhost-cert.pem \
        -days 365 -nodes \
        -subj "/CN=localhost"
    echo "✓ SSL certificates generated"
else
    echo "✓ SSL certificates already exist"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Make sure .env has your KeyN OAuth credentials"
echo "   2. Run the backend: cd server && source .venv/bin/activate && python app.py"
echo "   3. Run the frontend: cd web && npm run dev"
echo "   4. Open https://localhost:5160 in your browser"
echo "   5. After first login, set admin: cd server && python scripts/set_admin.py YOUR_USERNAME"
echo ""
echo "📚 Documentation:"
echo "   - README.md - General overview"
echo "   - GAMEPLAY.md - Game mechanics"
echo "   - CONTRIBUTING.md - How to contribute"
echo ""
echo "Happy simulating! 🚀"
