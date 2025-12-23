#!/usr/bin/env python3
"""
Initialize balanced projects that counter game decay and provide meaningful buffs.
Projects are now essential to survival rather than optional luxuries.
"""
import sys
import os

# Add parent directory to path to import server modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from server import create_app
from server.db import db
from server.models_projects import Project

# Define meaningful projects that counter the harsh game mechanics
PROJECTS = [
    {
        'name': 'Sustainable Farm',
        'description': 'Establishes reliable food production. Significantly reduces supply decay from population needs.',
        'cost': 150,
        'buff_type': 'supplies_buff',
        'buff_value': 3,  # +3 supplies per day
        'icon': 'farm'
    },
    {
        'name': 'Medical Clinic',
        'description': 'Basic healthcare facilities. Reduces morale decay and helps prevent disease outbreaks.',
        'cost': 180,
        'buff_type': 'morale_buff',
        'buff_value': 2,  # +2 morale per day
        'icon': 'clinic'
    },
    {
        'name': 'Defensive Walls',
        'description': 'Fortified perimeter. Significantly reduces threat growth and improves security.',
        'cost': 200,
        'buff_type': 'threat_reduction',
        'buff_value': 3,  # -3 threat per day
        'icon': 'walls'
    },
    {
        'name': 'Workshop',
        'description': 'Tool repair and creation facility. Increases production rate for all projects.',
        'cost': 140,
        'buff_type': 'production_bonus',
        'buff_value': 8,  # +8 production per day
        'icon': 'workshop'
    },
    {
        'name': 'Water Purification',
        'description': 'Clean water system. Reduces decay from environmental hazards and improves health.',
        'cost': 160,
        'buff_type': 'decay_reduction',
        'buff_value': 15,  # 15% reduction to all decay
        'icon': 'water'
    },
    {
        'name': 'Community Center',
        'description': 'Social gathering space. Boosts morale and helps prevent psychological collapse.',
        'cost': 130,
        'buff_type': 'morale_buff',
        'buff_value': 3,  # +3 morale per day
        'icon': 'community'
    },
    {
        'name': 'Storage Depot',
        'description': 'Organized storage prevents spoilage and theft. Reduces supply decay.',
        'cost': 120,
        'buff_type': 'supplies_buff',
        'buff_value': 2,  # +2 supplies per day
        'icon': 'storage'
    },
    {
        'name': 'Guard Tower',
        'description': 'Watchtower with patrol schedule. Reduces threat and enables early warning.',
        'cost': 170,
        'buff_type': 'threat_reduction',
        'buff_value': 4,  # -4 threat per day
        'icon': 'tower'
    },
    {
        'name': 'Greenhouse',
        'description': 'Year-round growing facility. Major boost to food production.',
        'cost': 220,
        'buff_type': 'supplies_buff',
        'buff_value': 5,  # +5 supplies per day
        'icon': 'greenhouse'
    },
    {
        'name': 'Training Ground',
        'description': 'Combat and survival training area. Reduces decay and improves defense.',
        'cost': 190,
        'buff_type': 'decay_reduction',
        'buff_value': 20,  # 20% reduction to all decay
        'icon': 'training'
    },
    {
        'name': 'Radio Tower',
        'description': 'Long-range communication. Can call for help, trade, and warn of dangers.',
        'cost': 250,
        'buff_type': 'threat_reduction',
        'buff_value': 5,  # -5 threat per day
        'icon': 'radio'
    },
    {
        'name': 'Housing Expansion',
        'description': 'Additional living quarters. Allows population to grow beyond base limits.',
        'cost': 180,
        'buff_type': 'population_capacity',
        'buff_value': 20,  # +20 max population
        'icon': 'housing'
    },
    {
        'name': 'Armory',
        'description': 'Weapons storage and maintenance. Greatly improves defensive capability.',
        'cost': 240,
        'buff_type': 'threat_reduction',
        'buff_value': 6,  # -6 threat per day
        'icon': 'armory'
    },
    {
        'name': 'School',
        'description': 'Education for next generation. Boosts morale and long-term survival prospects.',
        'cost': 200,
        'buff_type': 'morale_buff',
        'buff_value': 4,  # +4 morale per day
        'icon': 'school'
    },
    {
        'name': 'Power Generator',
        'description': 'Reliable electricity. Massively improves production and quality of life.',
        'cost': 300,
        'buff_type': 'production_bonus',
        'buff_value': 15,  # +15 production per day
        'icon': 'generator'
    },
]


def init_projects():
    """Initialize or update projects in database"""
    app = create_app()
    with app.app_context():
        print("Initializing balanced projects...")
        
        for proj_data in PROJECTS:
            existing = Project.query.filter_by(name=proj_data['name']).first()
            
            if existing:
                # Update existing project
                existing.description = proj_data['description']
                existing.cost = proj_data['cost']
                existing.buff_type = proj_data['buff_type']
                existing.buff_value = proj_data['buff_value']
                existing.icon = proj_data['icon']
                existing.is_active = True
                existing.hidden = False
                print(f"  Updated: {proj_data['name']}")
            else:
                # Create new project
                project = Project(
                    name=proj_data['name'],
                    description=proj_data['description'],
                    cost=proj_data['cost'],
                    buff_type=proj_data['buff_type'],
                    buff_value=proj_data['buff_value'],
                    icon=proj_data['icon'],
                    is_active=True,
                    hidden=False
                )
                db.session.add(project)
                print(f"  Created: {proj_data['name']}")
        
        # Hide projects that are not in the balanced list
        balanced_names = [p['name'] for p in PROJECTS]
        obsolete = Project.query.filter(Project.name.notin_(balanced_names)).all()
        
        if obsolete:
            print("\nHiding obsolete projects:")
            for p in obsolete:
                p.hidden = True
                print(f"  Hidden: {p.name}")
        
        db.session.commit()
        print(f"\n✅ Successfully initialized {len(PROJECTS)} projects!")
        print("\nProjects are now ESSENTIAL for survival:")
        print("- Without projects, stats will decay rapidly")
        print("- Each project provides daily buffs to counter decay")
        print("- Multiple projects stack their effects")
        print("- Choose wisely based on your current crisis!")


if __name__ == '__main__':
    init_projects()
