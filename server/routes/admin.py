from flask import Blueprint, jsonify, session, request
from ..utils.decorators import require_admin
from ..routes.api import get_current, tally_for_day
from ..models import WorldState, Vote, Telemetry, Event, CustomEvent
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
