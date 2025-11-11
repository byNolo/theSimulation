#!/usr/bin/env python3
"""
Migration script to add updated_at column to votes table
"""
import sys
import os

# Add parent directories to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
grandparent_dir = os.path.dirname(parent_dir)
sys.path.insert(0, parent_dir)
sys.path.insert(0, grandparent_dir)

from datetime import datetime
from sqlalchemy import inspect, text


def add_updated_at_column():
    """Add updated_at column to votes table if it doesn't exist"""
    # Import here to get the app with proper initialization
    from server import create_app
    from server.db import db
    
    app = create_app()
    
    with app.app_context():
        # Check if column exists
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('votes')]
        
        if 'updated_at' in columns:
            print("✓ updated_at column already exists in votes table")
            return
        
        print("Adding updated_at column to votes table...")
        
        # Add the column (SQLite doesn't support non-constant defaults in ALTER TABLE)
        with db.engine.connect() as conn:
            # Add column with NULL first
            conn.execute(text("""
                ALTER TABLE votes 
                ADD COLUMN updated_at TIMESTAMP
            """))
            
            # Set updated_at to created_at for all rows
            conn.execute(text("""
                UPDATE votes 
                SET updated_at = created_at
            """))
            
            conn.commit()
        
        print("✓ Successfully added updated_at column to votes table")


if __name__ == '__main__':
    add_updated_at_column()
