
import sys
import os

# Add parent directory to path to import server modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from server import create_app
from server.db import db
from server.models import SimulationStatus

def init_sim_status():
    # Create a minimal app to avoid triggering ensure_today() in create_app()
    from flask import Flask
    from server.config import Config
    
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        # Drop table if exists to ensure correct schema
        from sqlalchemy import text
        try:
            db.session.execute(text("DROP TABLE IF EXISTS simulation_status"))
            db.session.commit()
            print("Dropped existing simulation_status table.")
        except Exception as e:
            print(f"Error dropping table: {e}")

        # Create table
        db.create_all()
        
        # Check if a status row exists
        status = SimulationStatus.query.first()
        if not status:
            print("Creating initial SimulationStatus...")
            status = SimulationStatus(is_active=True)
            db.session.add(status)
            db.session.commit()
            print("SimulationStatus initialized.")
        else:
            print(f"SimulationStatus already exists: Active={status.is_active}")


        if not status:
            print("Creating initial SimulationStatus...")
            status = SimulationStatus(is_active=True)
            db.session.add(status)
            db.session.commit()
            print("SimulationStatus initialized.")
        else:
            print(f"SimulationStatus already exists: Active={status.is_active}")

if __name__ == '__main__':
    init_sim_status()
