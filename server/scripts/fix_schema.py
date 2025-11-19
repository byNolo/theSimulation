import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'instance', 'simulation.db')

# Check if instance db exists, if not check root
if not os.path.exists(DB_PATH):
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'simulation.db')

print(f"Connecting to database at {DB_PATH}")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    print("Attempting to add parent_id column...")
    cursor.execute("ALTER TABLE community_messages ADD COLUMN parent_id INTEGER REFERENCES community_messages(id)")
    conn.commit()
    print("Successfully added parent_id column.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column parent_id already exists.")
    else:
        print(f"Error adding column: {e}")

conn.close()
