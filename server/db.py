import os
from flask_sqlalchemy import SQLAlchemy

# Initialized in app factory

db = SQLAlchemy()


def sqlite_uri():
    # DB file in server folder by default
    path = os.path.join(os.path.dirname(__file__), 'simulation.db')
    return f'sqlite:///{path}'
