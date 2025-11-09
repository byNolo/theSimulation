import os
import requests
from flask import session
from ..models import User
from ..db import db


def fetch_user_data(token: str):
    try:
        resp = requests.get(
            f"{os.getenv('KEYN_AUTH_SERVER_URL', 'https://auth-keyn.bynolo.ca')}/api/user-scoped",
            headers={'Authorization': f'Bearer {token}'},
            timeout=5,
        )
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        return None
    return None


def upsert_user_from_token(token: str):
    data = fetch_user_data(token)
    if not data:
        return None
    user = User.query.filter_by(provider='keyn', provider_user_id=str(data.get('id'))).first()
    if not user:
        user = User(
            provider='keyn', 
            provider_user_id=str(data.get('id')), 
            display_name=data.get('display_name') or data.get('username'),
            email=data.get('email')
        )
        db.session.add(user)
        db.session.flush()
    else:
        user.display_name = data.get('display_name') or data.get('username') or user.display_name
        # Update email if available
        if data.get('email'):
            user.email = data.get('email')
    db.session.commit()
    session['user_id'] = user.id
    return user
