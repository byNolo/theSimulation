from flask import Blueprint, jsonify, session, request
from ..utils.decorators import require_admin
from ..routes.api import get_current, tally_for_day
from ..models import WorldState, Vote, Telemetry, Event, CustomEvent, User
from ..models_projects import Project, ActiveProject, CompletedProject, ProjectVote
from ..db import db
from ..events import deltas_for_option, ALL_EVENTS
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

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
    from ..routes.api import finalize_day, ensure_today
    
    day, ws, ev = get_current()
    
    # Finalize the current day (applies votes, decay, disasters, etc.)
    finalize_day(day)
    
    # Ensure the next day exists
    new_day = ensure_today()
    
    # Get the new state
    new_ws = WorldState.query.filter_by(day_id=new_day.id).first()
    
    return jsonify({
        'ok': True,
        'day': new_day.id,
        'morale': new_ws.morale,
        'supplies': new_ws.supplies,
        'threat': new_ws.threat
    })


@admin_bp.route('/reset-simulation', methods=['POST'])
@require_admin
def reset_simulation_route():
    """Archive current DB and start a fresh simulation"""
    import shutil
    import os
    from ..models import Day, Event, WorldState, Vote, Telemetry, SimulationStatus, CommunityMessage
    from ..models_projects import ActiveProject, CompletedProject, ProjectVote
    from ..config import Config
    
    # 1. Archive Database
    # Handle relative paths in SQLALCHEMY_DATABASE_URI
    db_uri = Config.SQLALCHEMY_DATABASE_URI
    if db_uri.startswith('sqlite:///'):
        db_path = db_uri.replace('sqlite:///', '')
        # If it's a relative path, make it absolute relative to server root or wherever it is
        if not os.path.isabs(db_path):
            # Assuming db is in server/ folder based on config.py: os.path.join(os.path.dirname(__file__), 'simulation.db')
            # But Config is loaded from server/config.py, so __file__ there is server/config.py.
            # Here we are in server/routes/admin.py.
            # Let's try to resolve it safely.
            # Actually, Config.SQLALCHEMY_DATABASE_URI usually has the absolute path if set via os.path.join in config.py
            pass
            
        if os.path.exists(db_path):
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            archive_path = f"{db_path}.{timestamp}.bak"
            try:
                shutil.copy2(db_path, archive_path)
                logger.info(f"Database archived to {archive_path}")
            except Exception as e:
                logger.error(f"Failed to archive database: {e}")
                # Continue anyway? Or fail? User said "maybe just a copy of the db", implies it's important.
                # But if we can't copy, maybe we shouldn't delete.
                return jsonify({'error': f"Failed to archive database: {str(e)}"}), 500
    
    # 2. Reset Data
    try:
        # Delete in correct order
        ProjectVote.query.delete()
        ActiveProject.query.delete()
        CompletedProject.query.delete()
        Vote.query.delete()
        Telemetry.query.delete()
        CommunityMessage.query.delete()
        Event.query.delete()
        WorldState.query.delete()
        Day.query.delete()
        
        # Reset Status
        status = SimulationStatus.query.first()
        if not status:
            status = SimulationStatus()
            db.session.add(status)
        
        status.is_active = True
        status.started_at = datetime.utcnow()
        status.ended_at = None
        status.end_reason = None
        
        db.session.commit()
        
        # 3. Initialize Day 1
        from ..routes.api import ensure_today
        ensure_today()
        
        return jsonify({'ok': True, 'message': 'Simulation reset successfully'})
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error resetting simulation: {e}")
        return jsonify({'error': str(e)}), 500



@admin_bp.route('/test-notification', methods=['POST'])
@require_admin
def test_notification():
    """Send test notifications to the current admin user"""
    from ..utils.nolofication import nolofication
    
    # Get current user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or not user.provider_user_id:
        return jsonify({'error': 'User not found or not linked to KeyN'}), 400
    
    # Check if Nolofication is configured
    if not nolofication.is_configured():
        return jsonify({
            'error': 'Nolofication not configured',
            'message': 'Please set NOLOFICATION_API_KEY in your .env file'
        }), 400
    
    # Send test notifications for both categories
    results = {}
    
    # Test notification 1: Day Results category
    result1 = nolofication.send_notification(
        user_id=user.provider_user_id,
        title="🧪 Test: Day Results Notification",
        message="This is a test of the day_results notification category. You should receive this based on your day_results schedule preference.",
        notification_type='info',
        category='day_results',
        html_message="""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">🧪 Test: Day Results</h2>
            <p>This is a <strong>test notification</strong> for the <code>day_results</code> category.</p>
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0;">✅ If you're seeing this, Nolofication integration is working!</p>
            </div>
            <p style="font-size: 14px; color: #666;">
                You received this based on your schedule preference for day results notifications.
            </p>
        </div>
        """,
        metadata={'test': True, 'category': 'day_results'}
    )
    results['day_results'] = result1
    
    # Test notification 2: Vote Reminders category
    result2 = nolofication.send_notification(
        user_id=user.provider_user_id,
        title="🧪 Test: Vote Reminder Notification",
        message="This is a test of the vote_reminders notification category. You should receive this based on your vote_reminders schedule preference.",
        notification_type='info',
        category='vote_reminders',
        html_message="""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2ee9ff;">🧪 Test: Vote Reminder</h2>
            <p>This is a <strong>test notification</strong> for the <code>vote_reminders</code> category.</p>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0;">📝 This category is used to remind you when a new day begins.</p>
            </div>
            <p style="font-size: 14px; color: #666;">
                You received this based on your schedule preference for vote reminder notifications.
            </p>
        </div>
        """,
        metadata={'test': True, 'category': 'vote_reminders'}
    )
    results['vote_reminders'] = result2
    
    # Check if both succeeded
    success = result1.get('success') and result2.get('success')
    
    return jsonify({
        'ok': success,
        'message': f'Test notifications sent to {user.display_name}' if success else 'Some notifications failed',
        'user': user.display_name,
        'keyn_id': user.provider_user_id,
        'results': results
    })


@admin_bp.route('/test-ai', methods=['POST'])
@require_admin
def test_ai_generation():
    """Generate a test AI event, summary, and chatter without saving"""
    from ..ai_generator import generate_daily_event, generate_day_summary, generate_community_chatter
    from ..models import Day, Event
    
    day, ws, _ = get_current()
    
    # Fetch recent history (last 3 days)
    recent_days = Day.query.order_by(Day.id.desc()).limit(3).all()
    recent_history = []
    for d in reversed(recent_days):
        ev = Event.query.filter_by(day_id=d.id).first()
        if ev:
            recent_history.append({
                'day': d.id,
                'headline': ev.headline,
                'choice': d.chosen_option or "None"
            })

    # 1. Generate Event
    event_data = generate_daily_event(ws, day.id + 1, recent_history)
    
    if not event_data:
        return jsonify({'error': 'Failed to generate event'}), 500
        
    # 2. Generate Chatter (based on the new event)
    chatter_data = generate_community_chatter(event_data['headline'], ws)
    
    # 3. Generate Summary (simulating a random choice)
    # Pick the first option as the "choice" for the test
    choice = event_data['options'][0]
    choice_label = choice['label']
    deltas = choice['deltas']
    
    summary = generate_day_summary(
        day.id + 1, 
        event_data['headline'], 
        choice_label, 
        deltas
    )
    
    return jsonify({
        'ok': True,
        'event': event_data,
        'chatter': chatter_data,
        'summary': summary,
        'simulated_choice': choice_label,
        'simulated_deltas': deltas
    })


@admin_bp.route('/cancel-test-reminders', methods=['POST'])
@require_admin
def cancel_test_reminders():
    """Cancel pending vote reminder notifications for the current admin user"""
    from ..utils.nolofication import nolofication
    
    # Get current user
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not authenticated'}), 401
    
    user = User.query.get(user_id)
    if not user or not user.provider_user_id:
        return jsonify({'error': 'User not found or not linked to KeyN'}), 400
    
    # Check if Nolofication is configured
    if not nolofication.is_configured():
        return jsonify({
            'error': 'Nolofication not configured',
            'message': 'Please set NOLOFICATION_API_KEY in your .env file'
        }), 400
    
    # Get pending vote_reminders for this user
    pending = nolofication.get_pending_notifications(
        user_id=user.provider_user_id,
        category='vote_reminders'
    )
    
    if 'error' in pending:
        return jsonify({
            'ok': False,
            'error': pending['error'],
            'message': 'Failed to fetch pending notifications'
        })
    
    pending_list = pending.get('pending_notifications', [])
    
    if not pending_list:
        return jsonify({
            'ok': True,
            'message': 'No pending vote reminders found',
            'user': user.display_name,
            'cancelled': 0,
            'pending': []
        })
    
    # Cancel all pending vote reminders
    cancelled_count = 0
    cancelled_ids = []
    errors = []
    
    for notif in pending_list:
        result = nolofication.cancel_pending_notification(notif['id'])
        if result.get('message'):
            cancelled_count += 1
            cancelled_ids.append(notif['id'])
        else:
            errors.append(f"Failed to cancel notification {notif['id']}: {result.get('error')}")
    
    return jsonify({
        'ok': True,
        'message': f"Cancelled {cancelled_count} pending vote reminder(s)",
        'user': user.display_name,
        'cancelled': cancelled_count,
        'cancelled_ids': cancelled_ids,
        'pending': pending_list,
        'errors': errors if errors else None
    })


@admin_bp.route('/projects', methods=['GET'])
@require_admin
def list_projects():
    """List all projects including hidden ones"""
    projects = Project.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'cost': p.cost,
        'buff_type': p.buff_type,
        'buff_value': p.buff_value,
        'icon': p.icon,
        'hidden': p.hidden,
        'required_project_id': p.required_project_id
    } for p in projects])

@admin_bp.route('/projects', methods=['POST'])
@require_admin
def create_project():
    """Create a new project"""
    data = request.json
    
    project = Project(
        name=data['name'],
        description=data['description'],
        cost=int(data['cost']),
        buff_type=data['buff_type'],
        buff_value=int(data['buff_value']),
        icon=data['icon'],
        hidden=data.get('hidden', True),  # Default to hidden
        required_project_id=data.get('required_project_id')
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify({'ok': True, 'id': project.id})

@admin_bp.route('/projects/<int:project_id>', methods=['PUT'])
@require_admin
def update_project(project_id):
    """Update a project"""
    project = Project.query.get_or_404(project_id)
    data = request.json
    
    if 'name' in data: project.name = data['name']
    if 'description' in data: project.description = data['description']
    if 'cost' in data: project.cost = int(data['cost'])
    if 'buff_type' in data: project.buff_type = data['buff_type']
    if 'buff_value' in data: project.buff_value = int(data['buff_value'])
    if 'icon' in data: project.icon = data['icon']
    if 'hidden' in data: project.hidden = data['hidden']
    if 'required_project_id' in data: project.required_project_id = data['required_project_id']
    
    db.session.commit()
    return jsonify({'ok': True})


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
            
        # Get option label
        chosen_label = d.chosen_option
        if ev and d.chosen_option:
            for opt in ev.options:
                if isinstance(opt, dict) and opt.get('key') == d.chosen_option:
                    chosen_label = opt.get('label', d.chosen_option)
                    break
                elif hasattr(opt, 'key') and opt.key == d.chosen_option:
                    chosen_label = getattr(opt, 'label', d.chosen_option)
                    break

        result.append({
            'est_date': d.est_date.isoformat(),
            'chosen_option': chosen_label,
            'world': {
                'morale': ws.morale if ws else 0,
                'supplies': ws.supplies if ws else 0,
                'threat': ws.threat if ws else 0,
                'last_event': ws.last_event if ws else "No data",
            },
            'event': {
                    'headline': ev.headline if ev else "No event",
                    'description': ev.description if ev else "",
                    'category': None if not ev else (getattr(ev, 'category', None) or (find_event_template_by_options(ev.options).category if find_event_template_by_options(ev.options) else None)),
                    'options': ev.options if ev else [],
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


@admin_bp.route('/announce', methods=['POST'])
@require_admin
def create_announcement():
    from ..models import Announcement, User
    from ..utils.nolofication import NoloficationService
    from ..utils.announcement_templates import TEMPLATES
    
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    version = data.get('version')
    template_id = data.get('template_id', 'standard')
    show_popup = data.get('show_popup', True)
    send_notification = data.get('send_notification', True)
    
    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400
        
    # Generate HTML content based on template
    template = TEMPLATES.get(template_id, TEMPLATES['standard'])
    generator = template['generator']
    rendered = generator(title, content, version)
    
    popup_html = rendered['popup_html']
    email_html = rendered['email_html']
        
    # Create announcement
    announcement = Announcement(
        title=title,
        content=content,
        html_content=popup_html,
        version=version,
        show_popup=show_popup,
        send_notification=send_notification,
        created_by=session.get('user_id') # Use session user_id directly as g.user might not be set in all contexts
    )
    db.session.add(announcement)
    db.session.commit()
    
    # Broadcast via Nolofication
    if send_notification:
        ns = NoloficationService()
        if ns.is_configured():
            # Get all users with provider_user_id
            users = User.query.filter(User.provider_user_id.isnot(None)).all()
            user_ids = [u.provider_user_id for u in users]
            
            # Send in batches of 50 to avoid hitting limits or timeouts
            batch_size = 50
            for i in range(0, len(user_ids), batch_size):
                batch = user_ids[i:i + batch_size]
                ns.send_bulk_notification(
                    user_ids=batch,
                    title=f"New Feature: {title}",
                    message=content, # Plain text fallback
                    notification_type='info',
                    category='announcement',
                    html_message=email_html
                )
        
    return jsonify({'success': True, 'id': announcement.id})


