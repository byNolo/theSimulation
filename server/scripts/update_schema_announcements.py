
import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from server import create_app
from server.db import db

def update_schema():
    app = create_app()
    with app.app_context():
        print("Creating announcements table...")
        with db.engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS announcements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title VARCHAR(200) NOT NULL,
                    content TEXT NOT NULL,
                    version VARCHAR(50),
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_by INTEGER,
                    FOREIGN KEY(created_by) REFERENCES users(id)
                )
            """))
            conn.commit()
        print("Done!")

if __name__ == '__main__':
    update_schema()
