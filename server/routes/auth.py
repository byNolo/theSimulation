from flask import Blueprint, redirect, request, session, jsonify, current_app
import os
import uuid
import requests
from ..db import db
from ..models import Telemetry
from ..utils.auth import fetch_user_data, upsert_user_from_token

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login')
def auth_login():
    state = uuid.uuid4().hex
    session['oauth_state'] = state
    scopes = os.getenv('KEYN_SCOPES', 'id,username,email,full_name,display_name,created_at,is_verified')
    params = {
        'client_id': os.getenv('KEYN_CLIENT_ID', ''),
        'redirect_uri': os.getenv('KEYN_REDIRECT_URI', 'https://localhost:5160/auth/callback'),
        'scope': scopes,
        'state': state,
        'response_type': 'code',
    }
    auth_server = os.getenv('KEYN_AUTH_SERVER_URL', 'https://auth-keyn.bynolo.ca')
    url = f"{auth_server}/oauth/authorize"
    from urllib.parse import urlencode
    return redirect(f"{url}?{urlencode(params)}")


@auth_bp.route('/callback')
def auth_callback():
    error = request.args.get('error')
    if error:
        return redirect('/')
    state = request.args.get('state')
    if not state or session.get('oauth_state') != state:
        return redirect('/')
    code = request.args.get('code')
    if not code:
        return redirect('/')
    token_endpoint = f"{os.getenv('KEYN_AUTH_SERVER_URL', 'https://auth-keyn.bynolo.ca')}/oauth/token"
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': os.getenv('KEYN_CLIENT_ID', ''),
        'client_secret': os.getenv('KEYN_CLIENT_SECRET', ''),
        'redirect_uri': os.getenv('KEYN_REDIRECT_URI', 'https://localhost:5160/auth/callback'),
    }
    try:
        resp = requests.post(token_endpoint, data=data, timeout=10)
        if resp.status_code == 200:
            token = resp.json().get('access_token')
            session['access_token'] = token
            session['authenticated'] = True
            db.session.add(Telemetry(event_type='auth_login', payload={'provider': 'keyn'}, user_id=None))
            db.session.commit()
            # upsert user now or defer until /api/me
            upsert_user_from_token(token)
    except Exception:
        pass
    finally:
        session.pop('oauth_state', None)
    frontend = os.getenv('CLIENT_URL', 'https://localhost:5160')
    return redirect(frontend)


@auth_bp.route('/logout', methods=['POST'])
def auth_logout():
    session.clear()
    db.session.add(Telemetry(event_type='auth_logout', payload={}, user_id=None))
    db.session.commit()
    return jsonify({'ok': True})
