from functools import wraps
from flask import jsonify, session
from ..models import User


def require_admin(func):
    """Require authenticated user with is_admin=True"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        return func(*args, **kwargs)
    return wrapper
