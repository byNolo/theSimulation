#!/usr/bin/env python3
"""
DEPRECATED: This script is deprecated and no longer used.

Use send_day_notifications.py instead, which supports Nolofication v2
with categories and user-controlled scheduling.

Old functionality:
- Send vote reminder notifications to users who haven't voted yet.
- This script was run daily at 10pm EST by APScheduler.

New functionality (send_day_notifications.py):
- Sends notifications on day transitions (not scheduled)
- Supports categories: 'day_results' and 'vote_reminders'
- Users control their own notification schedule
- Sends both day results AND vote reminders
"""
import sys
import os

print("=" * 80)
print("DEPRECATION WARNING")
print("=" * 80)
print("This script (send_vote_reminders.py) is deprecated.")
print("Please use send_day_notifications.py instead.")
print()
print("The new notification system:")
print("  - Sends notifications on day transitions (not scheduled)")
print("  - Supports Nolofication v2 categories")
print("  - Lets users control their own notification schedule")
print("=" * 80)
print()

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from server.db import db
from server.models import User, Day, Vote
from server.utils.nolofication import nolofication
from datetime import datetime
from zoneinfo import ZoneInfo
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_est_today():
    """Get today's date in EST timezone."""
    return datetime.now(ZoneInfo('America/New_York')).date()


def send_vote_reminders(app):
    """
    Send reminder notifications to users who haven't voted today.
    
    Args:
        app: Flask application instance (for app context)
    """
    with app.app_context():
        # Check if Nolofication is configured
        if not nolofication.is_configured():
            logger.warning("Nolofication not configured - skipping vote reminders")
            return
        
        # Get today's day
        today = get_est_today()
        day = Day.query.filter_by(est_date=today).first()
        
        if not day:
            logger.info(f"No day record found for {today} - skipping vote reminders")
            return
        
        # Get all users who are registered
        all_users = User.query.filter(User.provider_user_id.isnot(None)).all()
        
        if not all_users:
            logger.info("No registered users found - skipping vote reminders")
            return
        
        # Get all votes for today
        votes_today = Vote.query.filter_by(day_id=day.id).all()
        voted_user_ids = {v.user_id for v in votes_today if v.user_id is not None}
        
        # Find users who haven't voted
        users_to_remind = [u for u in all_users if u.id not in voted_user_ids]
        
        if not users_to_remind:
            logger.info(f"All {len(all_users)} registered users have voted - no reminders needed")
            return
        
        logger.info(f"Sending vote reminders to {len(users_to_remind)} users (out of {len(all_users)} total)")
        
        # Get KeyN user IDs for bulk notification
        keyn_user_ids = [u.provider_user_id for u in users_to_remind]
        
        # Create notification content
        title = "⏰ Don't Forget to Vote in The Simulation!"
        message = "Today's event is still waiting for your vote! Shape the future of the simulation before midnight EST."
        
        html_message = """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2ee9ff;">⏰ Don't Forget to Vote!</h2>
            <p>The Simulation needs your voice! Today's event is still waiting for your vote.</p>
            <p>Your decision will help shape the future of the community. Every vote matters!</p>
            <p style="margin: 20px 0;">
                <a href="https://thesim.bynolo.ca" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Vote Now
                </a>
            </p>
            <p style="font-size: 14px; color: #666;">
                Voting closes at midnight EST. Make your choice count!
            </p>
        </div>
        """
        
        # Send bulk notification
        result = nolofication.send_bulk_notification(
            user_ids=keyn_user_ids,
            title=title,
            message=message,
            notification_type='info',
            html_message=html_message,
            metadata={
                'day_id': day.id,
                'action_url': 'https://thesim.bynolo.ca',
                'reminder_type': 'vote_reminder'
            }
        )
        
        if result.get('success'):
            logger.info(f"Successfully sent vote reminders to {len(keyn_user_ids)} users")
        else:
            logger.error(f"Failed to send vote reminders: {result.get('error')}")
        
        return result


if __name__ == '__main__':
    # When run directly (for testing)
    from server import create_app
    app = create_app()
    send_vote_reminders(app)
