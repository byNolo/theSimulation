import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'theSimulation.db')
# Fix path - db is in server/simulation.db
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'simulation.db'))

def add_hidden_column():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(projects)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'hidden' not in columns:
            print("Adding 'hidden' column to projects table...")
            cursor.execute("ALTER TABLE projects ADD COLUMN hidden BOOLEAN DEFAULT 0")
            conn.commit()
            print("Column added successfully.")
        else:
            print("'hidden' column already exists.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_hidden_column()
