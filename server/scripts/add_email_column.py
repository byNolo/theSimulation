#!/usr/bin/env python3
"""
Migration script to add email column to users table.
Run this from the server directory:
  .venv/bin/python scripts/add_email_column.py
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from sqlalchemy import text

def migrate():
    # Import app and db correctly
    from server import create_app
    from server.db import db
    
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column already exists (SQLite-specific query)
            result = db.session.execute(text(
                "PRAGMA table_info(users)"
            ))
            columns = [row[1] for row in result.fetchall()]
            if 'email' in columns:
                print("✓ Email column already exists in users table")
                return
            
            # Add email column
            print("Adding email column to users table...")
            db.session.execute(text(
                "ALTER TABLE users ADD COLUMN email VARCHAR(255) NULL"
            ))
            db.session.commit()
            print("✓ Email column added successfully")
            
        except Exception as e:
            print(f"✗ Error during migration: {e}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    migrate()
