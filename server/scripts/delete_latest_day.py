import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from server import create_app
from server.db import db
from server.models import Day, Event, WorldState, CommunityMessage, Vote
from server.models_projects import ProjectVote

def delete_latest():
    app = create_app()
    with app.app_context():
        # Get latest day
        day = Day.query.order_by(Day.id.desc()).first()
        if not day:
            print("No days found.")
            return

        print(f"Deleting Day {day.id} ({day.est_date})...")
        
        # Delete related data
        Event.query.filter_by(day_id=day.id).delete()
        WorldState.query.filter_by(day_id=day.id).delete()
        CommunityMessage.query.filter_by(day_id=day.id).delete()
        Vote.query.filter_by(day_id=day.id).delete()
        ProjectVote.query.filter_by(day_id=day.id).delete()
        
        # Delete day
        db.session.delete(day)
        db.session.commit()
        print("Done.")

if __name__ == '__main__':
    delete_latest()
