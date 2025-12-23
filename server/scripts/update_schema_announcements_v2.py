
import sys
import os
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from server import create_app
from server.db import db

def update_schema():
    app = create_app()
    with app.app_context():
        print("Updating announcements table...")
        with db.engine.connect() as conn:
            # Add new columns
            try:
                conn.execute(text("ALTER TABLE announcements ADD COLUMN html_content TEXT"))
                print("Added html_content")
            except Exception as e:
                print(f"html_content might exist: {e}")

            try:
                conn.execute(text("ALTER TABLE announcements ADD COLUMN show_popup BOOLEAN DEFAULT 1"))
                print("Added show_popup")
            except Exception as e:
                print(f"show_popup might exist: {e}")

            try:
                conn.execute(text("ALTER TABLE announcements ADD COLUMN send_notification BOOLEAN DEFAULT 1"))
                print("Added send_notification")
            except Exception as e:
                print(f"send_notification might exist: {e}")
                
            conn.commit()
        print("Done!")

if __name__ == '__main__':
    update_schema()
