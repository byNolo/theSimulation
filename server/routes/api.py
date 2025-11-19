from flask import Blueprint, jsonify, request, session
from zoneinfo import ZoneInfo
from datetime import datetime
from ..db import db
from ..models import Day, WorldState, Event, Vote, Telemetry, User
from ..events import choose_template
from sqlalchemy.exc import IntegrityError

api_bp = Blueprint('api', __name__)


def est_today():
    return datetime.now(ZoneInfo('America/New_York')).date()


def finalize_day(day):
    """Apply the winning vote and update stats for a completed day"""
    from ..events import deltas_for_option, ALL_EVENTS
    
    ws = WorldState.query.filter_by(day_id=day.id).first()
    ev = Event.query.filter_by(day_id=day.id).first()
    
    if not ws or not ev:
        return
    
    # Count votes
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
    option_keys = set([opt['key'] if isinstance(opt, dict) else opt for opt in ev.options])
    template = None
    for t in ALL_EVENTS:
        template_keys = set([opt.key for opt in t.options])
        if template_keys == option_keys:
            template = t
            break
    
    deltas = deltas_for_option(top, template)
    
    # Apply changes with bounds checking
    new_morale = max(0, min(100, ws.morale + deltas.get('morale', 0)))
    new_supplies = max(0, min(100, ws.supplies + deltas.get('supplies', 0)))
    new_threat = max(0, min(100, ws.threat + deltas.get('threat', 0)))
    
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
    
    # Save changes
    db.session.add(ws)
    db.session.add(day)
    db.session.add(Telemetry(
        event_type='auto_tick',
        payload={
            'day_id': day.id,
            'chosen': top,
            'tally': tally,
            'deltas': deltas,
            'new_state': {'morale': new_morale, 'supplies': new_supplies, 'threat': new_threat}
        },
        user_id=None
    ))
    
    # Generate reaction messages for the finalized day
    from ..utils.message_generator import generate_messages_for_day
    from ..models import CommunityMessage
    
    # We want to generate some messages reacting to the decision
    # Use the NEXT day's ID if we were creating it, but here we are just finalizing the current day.
    # Actually, reactions usually happen on the NEXT day or late in the current day.
    # Let's add them to the current day for now, or maybe they should belong to the next day?
    # Usually "Day X" messages appear on Day X.
    # If we finalize Day X, we are about to start Day X+1.
    # So these reactions should probably be the first messages of Day X+1.
    # But finalize_day is called before ensure_today creates the new day.
    # So we can't add them to Day X+1 yet.
    # Let's add them to Day X as "late night" reactions.
    
    reaction_msgs = generate_messages_for_day(
        day.id, 
        ev.category if hasattr(ev, 'category') else 'general', 
        ws, 
        event_headline=ev.headline,
        chosen_option_label=option_label
    )
    
    for msg_data in reaction_msgs:
        replies_data = msg_data.pop('replies', [])
        msg = CommunityMessage(**msg_data)
        db.session.add(msg)
        db.session.flush()
        
        for reply_data in replies_data:
            reply_data['parent_id'] = msg.id
            reply = CommunityMessage(**reply_data)
            db.session.add(reply)

    db.session.commit()


def ensure_today():
    today = est_today()
    day = Day.query.filter_by(est_date=today).first()
    if day:
        return day
    
    # Before creating new day, check if we need to finalize yesterday
    yesterday = Day.query.order_by(Day.id.desc()).first()
    if yesterday and yesterday.chosen_option is None:
        # Yesterday ended but wasn't ticked - auto-finalize it
        finalize_day(yesterday)
    
    # Get last state and count total days
    last_state = WorldState.query.order_by(WorldState.id.desc()).first()
    day_count = Day.query.count()
    
    if last_state:
        morale = last_state.morale
        supplies = last_state.supplies
        threat = last_state.threat
        last_event = last_state.last_event
    else:
        morale, supplies, threat, last_event = 70, 80, 30, 'Genesis'
    
    template = choose_template(morale, supplies, threat, day_count + 1)
    day = Day(est_date=today)
    db.session.add(day)
    db.session.flush()
    
    # Store option labels for display
    option_data = [{"key": o.key, "label": o.label, "description": o.description} for o in template.options]
    
    ws = WorldState(day_id=day.id, morale=morale, supplies=supplies, threat=threat, last_event=last_event)
    ev = Event(day_id=day.id, headline=template.headline, description=template.description, options=option_data)
    db.session.add_all([ws, ev])
    
    # Generate community messages
    from ..utils.message_generator import generate_messages_for_day
    from ..models import CommunityMessage
    
    # Get context for messages
    # For a new day, we might not have a chosen option yet (it's the start of the day)
    # But we have the event headline
    msgs_data = generate_messages_for_day(day.id, template.category, ws, event_headline=template.headline)
    
    for msg_data in msgs_data:
        replies_data = msg_data.pop('replies', [])
        msg = CommunityMessage(**msg_data)
        db.session.add(msg)
        db.session.flush() # Flush to get ID
        
        for reply_data in replies_data:
            reply_data['parent_id'] = msg.id
            reply = CommunityMessage(**reply_data)
            db.session.add(reply)
        
    db.session.commit()
    return day


def get_current():
    today = est_today()
    day = Day.query.filter_by(est_date=today).first()
    if not day:
        day = ensure_today()
    ws = WorldState.query.filter_by(day_id=day.id).first()
    ev = Event.query.filter_by(day_id=day.id).first()
    return day, ws, ev


def tally_for_day(day_id: int):
    votes = Vote.query.filter_by(day_id=day_id).all()
    t = {}
    for v in votes:
        t[v.option] = t.get(v.option, 0) + 1
    return t


@api_bp.route('/state')
def api_state():
    day, ws, _ = get_current()
    return jsonify({
        'day': day.id,
        'morale': ws.morale,
        'supplies': ws.supplies,
        'threat': ws.threat,
        'last_event': ws.last_event,
        'est_date': day.est_date.isoformat(),
    })


@api_bp.route('/me')
def api_me():
    token = session.get('access_token')
    if not token:
        return jsonify({'authenticated': False})
    # upsert user
    from ..utils.auth import upsert_user_from_token
    user = upsert_user_from_token(token)
    if not user:
        return jsonify({'authenticated': False})
    return jsonify({'authenticated': True, 'user': {'id': user.id, 'display_name': user.display_name, 'is_admin': bool(user.is_admin)}})


@api_bp.route('/event')
def api_event():
    day, _, ev = get_current()
    return jsonify({
        'day': day.id,
        'headline': ev.headline,
        'description': ev.description,
        'options': ev.options,  # Now includes label and description
    })


@api_bp.route('/tally')
def api_tally():
    """Get current day vote tally (public endpoint)"""
    day, _, _ = get_current()
    tally = tally_for_day(day.id)
    return jsonify(tally)


@api_bp.route('/vote', methods=['POST'])
def api_vote():
    # Require authentication to vote
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Authentication required to vote'}), 401
    
    day, _, ev = get_current()
    data = request.get_json(force=True)
    choice = data.get('choice')
    
    # Validate choice exists in current event options
    valid_options = [opt['key'] if isinstance(opt, dict) else opt for opt in ev.options]
    if choice not in valid_options:
        return jsonify({'error': 'Invalid choice'}), 400
    
    # Check if user already voted
    existing = Vote.query.filter_by(day_id=day.id, user_id=user_id).first()
    if existing:
        # Allow vote change
        old_choice = existing.option
        existing.option = choice
        existing.updated_at = datetime.utcnow()
        db.session.add(Telemetry(
            event_type='vote_changed', 
            payload={'old_choice': old_choice, 'new_choice': choice}, 
            user_id=user_id
        ))
        db.session.commit()
        tally = tally_for_day(day.id)
        return jsonify({'ok': True, 'choice': choice, 'tally': tally, 'changed': True})
    
    vote = Vote(day_id=day.id, option=choice, user_id=user_id, anon_id=None)
    db.session.add(vote)
    db.session.add(Telemetry(event_type='vote', payload={'choice': choice}, user_id=user_id))
    
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Already voted today'}), 409
    
    tally = tally_for_day(day.id)
    return jsonify({'ok': True, 'choice': choice, 'tally': tally})


@api_bp.route('/my-vote')
def api_my_vote():
    """Get current user's vote for today"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'voted': False})
    
    day, _, _ = get_current()
    vote = Vote.query.filter_by(day_id=day.id, user_id=user_id).first()
    
    if vote:
        return jsonify({'voted': True, 'choice': vote.option, 'created_at': vote.created_at.isoformat(), 'updated_at': vote.updated_at.isoformat()})
    else:
        return jsonify({'voted': False})


@api_bp.route('/history')
def api_history():
    """Get history of past events and outcomes"""
    # Get all days that have been finalized (chosen_option is not null)
    days = Day.query.filter(Day.chosen_option.isnot(None)).order_by(Day.id.desc()).limit(30).all()
    
    history = []
    for day in days:
        ws = WorldState.query.filter_by(day_id=day.id).first()
        ev = Event.query.filter_by(day_id=day.id).first()
        
        if not ws or not ev:
            continue
        
        # Get vote tally for this day
        tally = tally_for_day(day.id)
        
        # Find the chosen option details
        chosen_option_label = day.chosen_option
        chosen_option_desc = None
        for opt in ev.options:
            if isinstance(opt, dict) and opt.get('key') == day.chosen_option:
                chosen_option_label = opt.get('label', day.chosen_option)
                chosen_option_desc = opt.get('description')
                break
        
        history.append({
            'day': day.id,
            'date': day.est_date.isoformat(),
            'headline': ev.headline,
            'description': ev.description,
            'options': ev.options,
            'chosen_option': day.chosen_option,
            'chosen_option_label': chosen_option_label,
            'chosen_option_description': chosen_option_desc,
            'tally': tally,
            'state': {
                'morale': ws.morale,
                'supplies': ws.supplies,
                'threat': ws.threat,
                'last_event': ws.last_event
            }
        })
    
    return jsonify(history)


@api_bp.route('/messages')
def api_messages():
    """Get community messages for the last 4 days"""
    day, _, _ = get_current()
    
    # Get messages for the last 4 days (top-level only)
    # We want messages where day_id >= current_day_id - 3
    from ..models import CommunityMessage, Day, Event
    
    start_day_id = max(1, day.id - 3)
    messages = CommunityMessage.query.filter(
        CommunityMessage.day_id >= start_day_id,
        CommunityMessage.parent_id == None
    ).order_by(CommunityMessage.created_at.desc()).all()
    
    # Check if we need to generate messages for TODAY
    # We only generate if there are NO messages for the current day
    today_messages = [m for m in messages if m.day_id == day.id]
    
    if not today_messages:
        # Lazy generation for today
        # User wants today's messages to be about YESTERDAY's vote/event
        # So we need to find yesterday's day_id
        yesterday_id = day.id - 1
        yesterday_day = Day.query.get(yesterday_id) if yesterday_id > 0 else None
        
        # Default context
        event_headline = None
        chosen_option = None
        category = "general"
        
        if yesterday_day:
            # Get yesterday's event and chosen option
            if yesterday_day.event:
                event_headline = yesterday_day.event.headline
                # We need to find the category from the template if possible, or just guess
                # The Event model doesn't store category directly, but we can try to infer or just use general
                # Ideally we should store category on Event, but for now let's default to general or try to match
                pass
            
            chosen_option_key = yesterday_day.chosen_option
            chosen_option = chosen_option_key
            
            # Try to find the label
            if yesterday_day.event and yesterday_day.event.options:
                for opt in yesterday_day.event.options:
                    # Options can be dicts or objects depending on how they are loaded/stored
                    if isinstance(opt, dict):
                        if opt.get('key') == chosen_option_key:
                            chosen_option = opt.get('label', chosen_option_key)
                            break
                    elif hasattr(opt, 'key') and opt.key == chosen_option_key:
                        chosen_option = getattr(opt, 'label', chosen_option_key)
                        break
            
        # Get current world state for stats
        _, ws, ev = get_current()
        
        # Generate messages for TODAY (day.id) but using YESTERDAY's context
        from ..utils.message_generator import generate_messages_for_day
        
        msgs_data = generate_messages_for_day(
            day.id, 
            category, 
            ws, 
            event_headline=event_headline,
            chosen_option_label=chosen_option
        )
        
        new_messages = []
        for msg_data in msgs_data:
            replies_data = msg_data.pop('replies', [])
            msg = CommunityMessage(**msg_data)
            db.session.add(msg)
            db.session.flush()
            new_messages.append(msg)
            
            for reply_data in replies_data:
                reply_data['parent_id'] = msg.id
                reply = CommunityMessage(**reply_data)
                db.session.add(reply)
                
        db.session.commit()
        
        # Add new messages to the list
        messages.extend(new_messages)
        # Re-sort
        messages.sort(key=lambda x: x.created_at, reverse=True)
        
    # Format response with replies
    result = []
    for m in messages:
        msg_dict = {
            'id': m.id,
            'day_id': m.day_id, # Include day_id for frontend
            'author': m.author_name,
            'avatar': m.avatar_seed,
            'content': m.content,
            'sentiment': m.sentiment,
            'created_at': m.created_at.isoformat(),
            'replies': []
        }
        
        # Fetch replies
        for r in m.replies:
            msg_dict['replies'].append({
                'id': r.id,
                'day_id': r.day_id,
                'author': r.author_name,
                'avatar': r.avatar_seed,
                'content': r.content,
                'sentiment': r.sentiment,
                'created_at': r.created_at.isoformat()
            })
            
        result.append(msg_dict)
        
    return jsonify(result)



