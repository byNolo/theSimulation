from flask import Blueprint, jsonify, session, request
from ..utils.decorators import require_admin
from ..routes.api import get_current, tally_for_day
from ..models import WorldState, Vote, Telemetry, Event, CustomEvent, User
from ..db import db
from ..events import deltas_for_option, ALL_EVENTS
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


def find_event_template_by_options(options):
    """Find the event template that matches the current event's options"""
    if not options:
        return None
    
    # Get option keys from the stored event
    option_keys = set([opt['key'] if isinstance(opt, dict) else opt for opt in options])
    
    # Find matching template
    for template in ALL_EVENTS:
        template_keys = set([opt.key for opt in template.options])
        if template_keys == option_keys:
            return template
    
    return None


@admin_bp.route('/tick', methods=['POST'])
@require_admin
def api_tick():
    """Finalize current day and advance to next day"""
    day, ws, ev = get_current()
    votes = Vote.query.filter_by(day_id=day.id).all()
    tally = {}
    for v in votes:
        tally[v.option] = tally.get(v.option, 0) + 1
    
    # Determine winning option
    if tally:
        max_count = max(tally.values())
        top_options = sorted([opt for opt, c in tally.items() if c == max_count])
        top = top_options[0]  # If tie, alphabetically first
    else:
        # No votes - pick first option
        top = ev.options[0]['key'] if isinstance(ev.options[0], dict) else ev.options[0]
    
    # Find the event template to get correct deltas
    template = find_event_template_by_options(ev.options)
    deltas = deltas_for_option(top, template)
    
    # Apply changes with bounds checking
    new_morale = max(0, min(100, ws.morale + deltas.get('morale', 0)))
    new_supplies = max(0, min(100, ws.supplies + deltas.get('supplies', 0)))
    new_threat = max(0, min(100, ws.threat + deltas.get('threat', 0)))
    
    # Check for game over conditions
    game_over = False
    game_over_reason = None
    
    if new_morale <= 0:
        game_over = True
        game_over_reason = "The community has lost all hope and disbanded."
    elif new_supplies <= 0:
        game_over = True
        game_over_reason = "The community has run out of supplies and perished."
    elif new_threat >= 100:
        game_over = True
        game_over_reason = "The threat has overwhelmed the community."
    
    # Update world state
    ws.morale = new_morale
    ws.supplies = new_supplies
    ws.threat = new_threat
    
    # Get the option label if available
    option_label = top
    for opt in ev.options:
        if isinstance(opt, dict) and opt.get('key') == top:
            option_label = opt.get('label', top)
            break
    
    ws.last_event = f"Community chose: {option_label}"
    day.chosen_option = top
    
    user_id = session.get('user_id')
    
    # Log the tick event
    telemetry_payload = {
        'chosen': top,
        'tally': tally,
        'deltas': deltas,
        'new_state': {
            'morale': new_morale,
            'supplies': new_supplies,
            'threat': new_threat
        }
    }
    
    if game_over:
        telemetry_payload['game_over'] = True
        telemetry_payload['reason'] = game_over_reason
        ws.last_event = game_over_reason
    
    # Mark objects as modified and add telemetry
    db.session.add(ws)
    db.session.add(day)
    db.session.add(Telemetry(event_type='tick', payload=telemetry_payload, user_id=user_id))
    db.session.commit()
    
    # Create next day for preview (unless game over)
    if not game_over:
        from ..routes.api import ensure_today
        ensure_today()
    
    response = {
        'ok': True,
        'chosen': top,
        'tally': tally,
        'deltas': deltas,
        'new_state': {
            'morale': new_morale,
            'supplies': new_supplies,
            'threat': new_threat
        }
    }
    
    if game_over:
        response['game_over'] = True
        response['reason'] = game_over_reason
    
    return jsonify(response)


@admin_bp.route('/metrics', methods=['GET'])
@require_admin
def api_metrics():
    """Get current day metrics for admin"""
    day, _, ev = get_current()
    votes = Vote.query.filter_by(day_id=day.id).all()
    tally = {}
    anon_set = set()
    user_set = set()
    for v in votes:
        tally[v.option] = tally.get(v.option, 0) + 1
        if v.anon_id:
            anon_set.add(v.anon_id)
        if v.user_id:
            user_set.add(v.user_id)
    
    return jsonify({
        'est_date': day.est_date.isoformat(),
        'event': {
            'headline': ev.headline,
            'description': ev.description,
            'options': ev.options,
        },
        'tally': tally,
        'unique_anon_voters': len(anon_set),
        'unique_user_voters': len(user_set),
        'total_votes': len(votes),
    })


@admin_bp.route('/history', methods=['GET'])
@require_admin
def api_history():
    """Get full history for admin"""
    from ..models import Day
    days = Day.query.order_by(Day.id.asc()).all()
    result = []
    for d in days:
        ws = WorldState.query.filter_by(day_id=d.id).first()
        ev = Event.query.filter_by(day_id=d.id).first()
        votes = Vote.query.filter_by(day_id=d.id).all()
        tally = {}
        for v in votes:
            tally[v.option] = tally.get(v.option, 0) + 1
        result.append({
            'est_date': d.est_date.isoformat(),
            'chosen_option': d.chosen_option,
            'world': {
                'morale': ws.morale,
                'supplies': ws.supplies,
                'threat': ws.threat,
                'last_event': ws.last_event,
            },
            'event': {
                'headline': ev.headline,
                'options': ev.options,
            },
            'tally': tally,
        })
    return jsonify(result)


@admin_bp.route('/telemetry', methods=['GET'])
@require_admin
def api_telemetry():
    """Get telemetry logs for admin"""
    logs = Telemetry.query.order_by(Telemetry.id.desc()).limit(100).all()
    return jsonify([
        {'event_type': l.event_type, 'payload': l.payload, 'created_at': l.created_at.isoformat()} 
        for l in logs
    ])


# ====== EVENT MANAGEMENT ENDPOINTS ======

@admin_bp.route('/events', methods=['GET'])
@require_admin
def list_events():
    """List all events (built-in + custom)"""
    # Get built-in events
    builtin_events = []
    for event in ALL_EVENTS:
        builtin_events.append({
            'id': event.id,
            'headline': event.headline,
            'description': event.description,
            'category': event.category,
            'weight': event.weight,
            'min_morale': event.min_morale,
            'max_morale': event.max_morale,
            'min_supplies': event.min_supplies,
            'max_supplies': event.max_supplies,
            'min_threat': event.min_threat,
            'max_threat': event.max_threat,
            'requires_day': event.requires_day,
            'options': [
                {
                    'key': opt.key,
                    'label': opt.label,
                    'description': opt.description,
                    'deltas': opt.deltas
                }
                for opt in event.options
            ],
            'is_builtin': True,
            'is_active': True
        })
    
    # Get custom events
    custom_events = CustomEvent.query.all()
    custom_list = []
    for event in custom_events:
        custom_list.append({
            'id': event.event_id,
            'db_id': event.id,
            'headline': event.headline,
            'description': event.description,
            'category': event.category,
            'weight': event.weight,
            'min_morale': event.min_morale,
            'max_morale': event.max_morale,
            'min_supplies': event.min_supplies,
            'max_supplies': event.max_supplies,
            'min_threat': event.min_threat,
            'max_threat': event.max_threat,
            'requires_day': event.requires_day,
            'options': event.options,
            'is_builtin': False,
            'is_active': event.is_active,
            'created_at': event.created_at.isoformat(),
            'updated_at': event.updated_at.isoformat()
        })
    
    return jsonify({
        'builtin': builtin_events,
        'custom': custom_list,
        'total': len(builtin_events) + len(custom_list)
    })


@admin_bp.route('/events', methods=['POST'])
@require_admin
def create_event():
    """Create a new custom event"""
    data = request.get_json()
    user_id = session.get('user_id')
    
    # Validate required fields
    required = ['event_id', 'headline', 'description', 'options']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if event_id already exists
    existing = CustomEvent.query.filter_by(event_id=data['event_id']).first()
    if existing:
        return jsonify({'error': 'Event ID already exists'}), 409
    
    # Validate options
    if not isinstance(data['options'], list) or len(data['options']) < 2:
        return jsonify({'error': 'Must have at least 2 options'}), 400
    
    for opt in data['options']:
        if not all(k in opt for k in ['key', 'label', 'deltas']):
            return jsonify({'error': 'Each option must have key, label, and deltas'}), 400
        if not all(k in opt['deltas'] for k in ['morale', 'supplies', 'threat']):
            return jsonify({'error': 'Deltas must include morale, supplies, and threat'}), 400
    
    # Create event
    event = CustomEvent(
        event_id=data['event_id'],
        headline=data['headline'],
        description=data['description'],
        category=data.get('category', 'general'),
        weight=data.get('weight', 1),
        min_morale=data.get('min_morale', 0),
        max_morale=data.get('max_morale', 100),
        min_supplies=data.get('min_supplies', 0),
        max_supplies=data.get('max_supplies', 100),
        min_threat=data.get('min_threat', 0),
        max_threat=data.get('max_threat', 100),
        requires_day=data.get('requires_day', 0),
        options=data['options'],
        is_active=data.get('is_active', True),
        created_by=user_id
    )
    
    db.session.add(event)
    db.session.commit()
    
    return jsonify({
        'ok': True,
        'event_id': event.event_id,
        'db_id': event.id,
        'message': 'Event created successfully'
    }), 201


@admin_bp.route('/events/<int:event_db_id>', methods=['PUT'])
@require_admin
def update_event(event_db_id):
    """Update an existing custom event"""
    event = CustomEvent.query.get(event_db_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'headline' in data:
        event.headline = data['headline']
    if 'description' in data:
        event.description = data['description']
    if 'category' in data:
        event.category = data['category']
    if 'weight' in data:
        event.weight = data['weight']
    if 'min_morale' in data:
        event.min_morale = data['min_morale']
    if 'max_morale' in data:
        event.max_morale = data['max_morale']
    if 'min_supplies' in data:
        event.min_supplies = data['min_supplies']
    if 'max_supplies' in data:
        event.max_supplies = data['max_supplies']
    if 'min_threat' in data:
        event.min_threat = data['min_threat']
    if 'max_threat' in data:
        event.max_threat = data['max_threat']
    if 'requires_day' in data:
        event.requires_day = data['requires_day']
    if 'options' in data:
        # Validate options
        for opt in data['options']:
            if not all(k in opt for k in ['key', 'label', 'deltas']):
                return jsonify({'error': 'Each option must have key, label, and deltas'}), 400
        event.options = data['options']
    if 'is_active' in data:
        event.is_active = data['is_active']
    
    event.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'ok': True,
        'message': 'Event updated successfully'
    })


@admin_bp.route('/events/<int:event_db_id>', methods=['DELETE'])
@require_admin
def delete_event(event_db_id):
    """Delete a custom event"""
    event = CustomEvent.query.get(event_db_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    db.session.delete(event)
    db.session.commit()
    
    return jsonify({
        'ok': True,
        'message': 'Event deleted successfully'
    })


@admin_bp.route('/events/<int:event_db_id>/toggle', methods=['POST'])
@require_admin
def toggle_event(event_db_id):
    """Toggle event active status"""
    event = CustomEvent.query.get(event_db_id)
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    event.is_active = not event.is_active
    event.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'ok': True,
        'is_active': event.is_active,
        'message': f'Event {"activated" if event.is_active else "deactivated"}'
    })


# ====== USER MANAGEMENT ENDPOINTS ======

@admin_bp.route('/users', methods=['GET'])
@require_admin
def list_users():
    """List all users with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Get all users with pagination
    pagination = User.query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    users_list = []
    for user in pagination.items:
        # Get user's vote count
        vote_count = Vote.query.filter_by(user_id=user.id).count()
        
        users_list.append({
            'id': user.id,
            'provider': user.provider,
            'provider_user_id': user.provider_user_id,
            'display_name': user.display_name,
            'email': user.email,
            'is_admin': user.is_admin,
            'created_at': user.created_at.isoformat(),
            'vote_count': vote_count
        })
    
    return jsonify({
        'users': users_list,
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    })


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@require_admin
def get_user(user_id):
    """Get detailed user information"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's voting history
    votes = Vote.query.filter_by(user_id=user.id).order_by(Vote.created_at.desc()).limit(50).all()
    vote_history = []
    for vote in votes:
        from ..models import Day
        day = Day.query.get(vote.day_id)
        vote_history.append({
            'day_id': vote.day_id,
            'date': day.est_date.isoformat() if day else None,
            'option': vote.option,
            'created_at': vote.created_at.isoformat()
        })
    
    # Get telemetry for this user
    telemetry = Telemetry.query.filter_by(user_id=user.id).order_by(Telemetry.created_at.desc()).limit(20).all()
    telemetry_list = [{
        'event_type': t.event_type,
        'payload': t.payload,
        'created_at': t.created_at.isoformat()
    } for t in telemetry]
    
    return jsonify({
        'id': user.id,
        'provider': user.provider,
        'provider_user_id': user.provider_user_id,
        'display_name': user.display_name,
        'email': user.email,
        'is_admin': user.is_admin,
        'created_at': user.created_at.isoformat(),
        'vote_count': len(votes),
        'vote_history': vote_history,
        'telemetry': telemetry_list
    })


@admin_bp.route('/users/<int:user_id>/admin', methods=['POST'])
@require_admin
def toggle_admin(user_id):
    """Toggle user admin status"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent self-demotion
    current_user_id = session.get('user_id')
    if user.id == current_user_id:
        return jsonify({'error': 'Cannot modify your own admin status'}), 400
    
    user.is_admin = not user.is_admin
    db.session.commit()
    
    # Log this action
    admin_user_id = session.get('user_id')
    db.session.add(Telemetry(
        event_type='admin_toggle',
        payload={
            'target_user_id': user.id,
            'new_admin_status': user.is_admin,
            'display_name': user.display_name
        },
        user_id=admin_user_id
    ))
    db.session.commit()
    
    return jsonify({
        'ok': True,
        'user_id': user.id,
        'is_admin': user.is_admin,
        'message': f'User {"promoted to" if user.is_admin else "demoted from"} admin'
    })


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    """Delete a user (soft delete - anonymize their data)"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent self-deletion
    current_user_id = session.get('user_id')
    if user.id == current_user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    # Log this action before deletion
    admin_user_id = session.get('user_id')
    db.session.add(Telemetry(
        event_type='user_delete',
        payload={
            'target_user_id': user.id,
            'display_name': user.display_name,
            'provider': user.provider
        },
        user_id=admin_user_id
    ))
    
    # Delete the user (this will cascade to their votes and telemetry based on foreign key settings)
    # Or we could anonymize instead
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({
        'ok': True,
        'message': 'User deleted successfully'
    })


@admin_bp.route('/users/stats', methods=['GET'])
@require_admin
def user_stats():
    """Get overall user statistics"""
    total_users = User.query.count()
    admin_users = User.query.filter_by(is_admin=True).count()
    
    # Provider breakdown
    from sqlalchemy import func
    provider_stats = db.session.query(
        User.provider,
        func.count(User.id).label('count')
    ).group_by(User.provider).all()
    
    provider_breakdown = {provider: count for provider, count in provider_stats}
    
    # Recent signups (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_signups = User.query.filter(User.created_at >= thirty_days_ago).count()
    
    # Active users (users who have voted)
    active_users = db.session.query(Vote.user_id).distinct().count()
    
    return jsonify({
        'total_users': total_users,
        'admin_users': admin_users,
        'regular_users': total_users - admin_users,
        'provider_breakdown': provider_breakdown,
        'recent_signups_30d': recent_signups,
        'active_users': active_users,
        'inactive_users': total_users - active_users
    })

