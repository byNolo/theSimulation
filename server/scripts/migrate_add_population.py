#!/usr/bin/env python3
"""
Add population column to world_states table.
Safe migration that preserves existing data.
"""
import sys
import os

# Add parent directory to path to import server modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from server import create_app
from server.db import db

def migrate_add_population():
    """Add population column to world_states"""
    app = create_app()
    with app.app_context():
        try:
            # Check if column already exists
            from sqlalchemy import inspect, Integer
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('world_states')]
            
            if 'population' in columns:
                print("✓ Population column already exists")
                return
            
            print("Adding population column to world_states...")
            
            # Add the column with default value
            with db.engine.connect() as conn:
                conn.execute(db.text(
                    "ALTER TABLE world_states ADD COLUMN population INTEGER DEFAULT 20"
                ))
                conn.commit()
            
            print("✅ Successfully added population column!")
            print("   Default value: 20 (starting population)")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")
            raise


if __name__ == '__main__':
    migrate_add_population()
