#!/usr/bin/env python3
"""
Send notifications when a day is finalized.
This includes:
- Day results to all users
- Vote reminders to users who haven't voted yet for the NEW day
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from server.db import db
from server.models import User, Day, Vote, Event, WorldState
from server.utils.nolofication import nolofication
from datetime import datetime
from zoneinfo import ZoneInfo
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def send_day_result_notifications(day_id: int, chosen_option_label: str, new_state: dict):
    """
    Send notification about the day's results to all users.
    Uses 'day_results' category which users can schedule.
    
    Args:
        day_id: ID of the completed day
        chosen_option_label: Label of the winning option
        new_state: Dict with morale, supplies, threat values
    """
    if not nolofication.is_configured():
        logger.warning("Nolofication not configured - skipping day result notifications")
        return
    
    # Get all registered users
    all_users = User.query.filter(User.provider_user_id.isnot(None)).all()
    
    if not all_users:
        logger.info("No registered users found - skipping day result notifications")
        return
    
    # Get day info
    day = Day.query.get(day_id)
    event = Event.query.filter_by(day_id=day_id).first()
    
    if not day or not event:
        logger.warning(f"Missing day or event data for day {day_id}")
        return
    
    # Get KeyN user IDs
    keyn_user_ids = [u.provider_user_id for u in all_users]
    
    # Create notification content
    title = "📊 The Simulation Day Results"
    message = f"Day {day_id} results: Community chose '{chosen_option_label}'. Morale: {new_state['morale']}, Supplies: {new_state['supplies']}, Threat: {new_state['threat']}"
    
    # Format stat changes with emojis
    def format_stat(name, value):
        if value >= 70:
            emoji = "🟢"
        elif value >= 40:
            emoji = "🟡"
        else:
            emoji = "🔴"
        return f"{emoji} {name}: {value}/100"
    
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2px; border-radius: 12px;">
        <div style="background: white; border-radius: 10px; padding: 30px;">
            <h2 style="color: #667eea; margin-top: 0; font-size: 24px;">📊 Day {day_id} Results</h2>
            
            <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333; font-size: 18px;">Event: {event.headline}</h3>
                <p style="color: #666; margin: 10px 0;">{event.description}</p>
            </div>
            
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
                <strong style="color: #2e7d32; font-size: 16px;">Community Decision:</strong>
                <p style="margin: 8px 0 0 0; color: #333; font-size: 18px;">✅ {chosen_option_label}</p>
            </div>
            
            <h3 style="color: #333; margin: 25px 0 15px 0;">Current State:</h3>
            <div style="display: grid; gap: 10px;">
                <div style="background: #f0f0f0; padding: 12px; border-radius: 6px;">
                    {format_stat('Morale', new_state['morale'])}
                </div>
                <div style="background: #f0f0f0; padding: 12px; border-radius: 6px;">
                    {format_stat('Supplies', new_state['supplies'])}
                </div>
                <div style="background: #f0f0f0; padding: 12px; border-radius: 6px;">
                    {format_stat('Threat', new_state['threat'])}
                </div>
            </div>
            
            <div style="margin: 30px 0 10px 0; text-align: center;">
                <a href="https://thesim.bynolo.ca" 
                   style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Full Details
                </a>
            </div>
            
            <p style="text-align: center; font-size: 14px; color: #999; margin-top: 25px; margin-bottom: 0;">
                Keep shaping the future of The Simulation!
            </p>
        </div>
    </div>
    """
    
    # Send bulk notification with 'day_results' category
    # Users can configure when they want to receive these (instant, daily digest, weekly, etc.)
    result = nolofication.send_bulk_notification(
        user_ids=keyn_user_ids,
        title=title,
        message=message,
        notification_type='info',
        category='day_results',  # Nolofication will schedule based on user preferences
        html_message=html_message,
        metadata={
            'day_id': day_id,
            'chosen_option': chosen_option_label,
            'morale': new_state['morale'],
            'supplies': new_state['supplies'],
            'threat': new_state['threat']
        }
    )
    
    # Check if notifications were sent/scheduled successfully
    if result.get('scheduled', 0) > 0 or result.get('successful', 0) > 0:
        total_sent = result.get('scheduled', 0) + result.get('successful', 0)
        logger.info(f"Sent day {day_id} results - {total_sent} scheduled/sent, {result.get('failed', 0)} failed")
    else:
        logger.error(f"Failed to send day results: {result}")
    
    return result


def send_vote_reminder_for_new_day(new_day_id: int):
    """
    Send vote reminder for the NEW day to users who haven't voted yet.
    Uses 'vote_reminders' category which users can schedule.
    
    Args:
        new_day_id: ID of the new day that needs votes
    """
    if not nolofication.is_configured():
        logger.warning("Nolofication not configured - skipping vote reminders")
        return
    
    # Get the new day and event
    day = Day.query.get(new_day_id)
    event = Event.query.filter_by(day_id=new_day_id).first()
    
    if not day or not event:
        logger.warning(f"Missing day or event data for new day {new_day_id}")
        return
    
    # Get all registered users
    all_users = User.query.filter(User.provider_user_id.isnot(None)).all()
    
    if not all_users:
        logger.info("No registered users found - skipping vote reminders")
        return
    
    # For a brand new day, nobody has voted yet, so send to everyone
    # Later in the day, this could be called again to only remind non-voters
    keyn_user_ids = [u.provider_user_id for u in all_users]
    
    # Create notification content
    title = "🗳️ New Day in The Simulation - Vote Now!"
    message = f"A new challenge awaits! {event.headline}. Cast your vote to shape the community's future."
    
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2ee9ff 0%, #1a73e8 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 28px;">🗳️ A New Day Begins!</h2>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <strong style="color: #856404;">Day {new_day_id}</strong>
            </div>
            
            <h3 style="color: #333; margin-top: 0;">{event.headline}</h3>
            <p style="color: #666; line-height: 1.6; font-size: 15px;">{event.description}</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; color: #1565c0; font-size: 16px; text-align: center;">
                    <strong>Your vote matters!</strong><br>
                    <span style="font-size: 14px;">Help decide the community's path forward.</span>
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://thesim.bynolo.ca" 
                   style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2ee9ff 0%, #1a73e8 100%); 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; 
                          box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
                    Cast Your Vote
                </a>
            </div>
            
            <p style="text-align: center; font-size: 13px; color: #999; margin-bottom: 0;">
                Voting is open until the day ends. Every voice counts!
            </p>
        </div>
    </div>
    """
    
    # Send bulk notification with 'vote_reminders' category
    # Users can configure when they want to receive these
    result = nolofication.send_bulk_notification(
        user_ids=keyn_user_ids,
        title=title,
        message=message,
        notification_type='info',
        category='vote_reminders',  # Nolofication handles scheduling
        html_message=html_message,
        metadata={
            'day_id': new_day_id,
            'event_headline': event.headline,
            'action_url': 'https://thesim.bynolo.ca'
        }
    )
    
    # Check if notifications were sent/scheduled successfully
    if result.get('scheduled', 0) > 0 or result.get('successful', 0) > 0:
        total_sent = result.get('scheduled', 0) + result.get('successful', 0)
        logger.info(f"Sent vote reminders for day {new_day_id} - {total_sent} scheduled/sent, {result.get('failed', 0)} failed")
    else:
        logger.error(f"Failed to send vote reminders: {result}")
    
    return result


if __name__ == '__main__':
    # For testing - send notifications for the current day
    from server import create_app
    app = create_app()
    
    with app.app_context():
        current_day = Day.query.order_by(Day.id.desc()).first()
        if current_day:
            print(f"Testing notifications for day {current_day.id}")
            
            # Simulate a finalized day
            ws = WorldState.query.filter_by(day_id=current_day.id).first()
            if ws:
                send_day_result_notifications(
                    current_day.id,
                    chosen_option_label="Test Option",
                    new_state={
                        'morale': ws.morale,
                        'supplies': ws.supplies,
                        'threat': ws.threat
                    }
                )
            
            # Send vote reminder
            send_vote_reminder_for_new_day(current_day.id)
        else:
            print("No days found in database")
