"""
Reset the simulation database to start fresh.
Clears all days, events, votes, world states, and telemetry.
Preserves user accounts.
"""

import sys
import os

# Add parent directory to path to import server modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from server import create_app
from server.db import db
from server.models import Day, Event, WorldState, Vote, Telemetry

def reset_simulation():
    """Clear all simulation data but keep users"""
    app = create_app()
    
    with app.app_context():
        print("Resetting simulation...")
        
        # Delete in correct order (foreign key constraints)
        deleted_votes = Vote.query.delete()
        print(f"  ✓ Deleted {deleted_votes} votes")
        
        deleted_telemetry = Telemetry.query.delete()
        print(f"  ✓ Deleted {deleted_telemetry} telemetry entries")
        
        deleted_events = Event.query.delete()
        print(f"  ✓ Deleted {deleted_events} events")
        
        deleted_states = WorldState.query.delete()
        print(f"  ✓ Deleted {deleted_states} world states")
        
        deleted_days = Day.query.delete()
        print(f"  ✓ Deleted {deleted_days} days")
        
        db.session.commit()
        
        print("\n✓ Simulation reset complete!")
        print("  Starting stats: Morale 70, Supplies 80, Threat 30")
        print("  Next server start will create Day 1 with a fresh event")
        print("  User accounts preserved")

if __name__ == '__main__':
    confirm = input("This will delete all simulation data. Continue? (yes/no): ")
    if confirm.lower() in ['yes', 'y']:
        reset_simulation()
    else:
        print("Reset cancelled")
