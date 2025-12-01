import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from .db import db


def create_app():
    # Load .env from project root if present
    env_path_root = os.path.join(os.path.dirname(__file__), '..', '.env')
    env_path_cwd = os.path.join(os.getcwd(), '.env')
    for p in [env_path_root, env_path_cwd]:
        if os.path.exists(p):
            load_dotenv(p)

    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or f"sqlite:///{os.path.join(os.path.dirname(__file__), 'simulation.db')}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # CORS - allow production domain and localhost
    allowed_origins = [
        'https://thesim.bynolo.ca',
        'https://localhost:5160',
        'http://localhost:5160',
    ]
    CORS(app, supports_credentials=True, origins=allowed_origins)

    db.init_app(app)

    # assign anon id for visitors
    import uuid
    @app.before_request
    def assign_anon():
        from flask import session
        if 'anon_id' not in session:
            session['anon_id'] = uuid.uuid4().hex[:16]

    # register blueprints
    from .routes.api import api_bp, ensure_today
    from .routes.auth import auth_bp
    from .routes.admin import admin_bp

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    with app.app_context():
        db.create_all()
        # ensure today's day exists
        ensure_today()

    return app

