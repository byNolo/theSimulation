# Run this from the project root with: python -m server.scripts.init_projects

from server.app import create_app
from server.db import db
from server.models_projects import Project, ActiveProject, CompletedProject, ProjectVote

def init_projects():
    app = create_app()
    with app.app_context():
        # Create tables
        print("Creating project tables...")
        db.create_all()
        
        # Seed initial projects if they don't exist
        if Project.query.count() == 0:
            print("Seeding initial projects...")
            projects = [
                Project(
                    name="Hydroponics Bay",
                    description="A dedicated facility for growing food. Increases daily Supplies generation.",
                    cost=100,
                    buff_type="supplies_gen",
                    buff_value=5,
                    icon="leaf"
                ),
                Project(
                    name="Radio Tower",
                    description="Long-range communication array. Increases daily Morale generation.",
                    cost=150,
                    buff_type="morale_gen",
                    buff_value=3,
                    icon="radio"
                ),
                Project(
                    name="Perimeter Wall",
                    description="Reinforced concrete barriers. Reduces daily Threat increase.",
                    cost=200,
                    buff_type="threat_reduction",
                    buff_value=2,
                    icon="shield"
                ),
                Project(
                    name="Medical Lab",
                    description="Advanced medical facilities. Prevents disease events.",
                    cost=250,
                    buff_type="event_prevention",
                    buff_value=1,
                    icon="medical"
                ),
                 Project(
                    name="Solar Array",
                    description="Sustainable energy source. Increases overall Production efficiency.",
                    cost=300,
                    buff_type="production_mult",
                    buff_value=10, # 10%
                    icon="sun"
                )
            ]
            
            for p in projects:
                db.session.add(p)
            
            db.session.commit()
            print("Seeded 5 projects.")
        else:
            print("Projects already seeded.")

if __name__ == "__main__":
    init_projects()
