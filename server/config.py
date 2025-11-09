import os


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or f"sqlite:///{os.path.join(os.path.dirname(__file__), 'simulation.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_TOKEN = os.getenv('ADMIN_TOKEN')


class DevConfig(Config):
    DEBUG = True
