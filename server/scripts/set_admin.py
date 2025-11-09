#!/usr/bin/env python3
"""
Utility to mark a user as admin in the SQLite DB.

Usage:
  python server/scripts/set_admin.py --user-id 3
  python server/scripts/set_admin.py --provider-id 123456

If the `is_admin` column is missing (older DB), this script will attempt to add it.
"""
import argparse
import os
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(ROOT, 'simulation.db')
DB_URI = f'sqlite:///{DB_PATH}'

def ensure_column():
    # Add is_admin column if missing (SQLite)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(users)")
    cols = [r[1] for r in cur.fetchall()]
    if 'is_admin' not in cols:
        print('Adding is_admin column to users table')
        cur.execute('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0')
        conn.commit()
    conn.close()

def mark_admin_by_user_id(user_id: int):
    engine = create_engine(DB_URI)
    with Session(engine) as s:
        s.execute(text("UPDATE users SET is_admin = 1 WHERE id = :id"), {'id': user_id})
        s.commit()
    print(f'Marked user id={user_id} as admin (if existed)')

def mark_admin_by_provider(provider_id: str):
    engine = create_engine(DB_URI)
    with Session(engine) as s:
        s.execute(text("UPDATE users SET is_admin = 1 WHERE provider_user_id = :pid"), {'pid': provider_id})
        s.commit()
    print(f'Marked provider_user_id={provider_id} as admin (if existed)')

def main():
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--user-id', type=int)
    group.add_argument('--provider-id')
    args = parser.parse_args()
    if not os.path.exists(DB_PATH):
        print('Database not found at', DB_PATH)
        return
    ensure_column()
    if args.user_id:
        mark_admin_by_user_id(args.user_id)
    else:
        mark_admin_by_provider(args.provider_id)

if __name__ == '__main__':
    main()
