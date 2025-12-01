"""
Nolofication integration service for theSimulation.
Sends notifications to users via the centralized Nolofication platform.
"""
import requests
import os
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class NoloficationService:
    def __init__(self):
        self.base_url = os.getenv('NOLOFICATION_URL', 'https://nolofication.bynolo.ca')
        self.site_id = os.getenv('NOLOFICATION_SITE_ID', 'thesimulation')
        self.api_key = os.getenv('NOLOFICATION_API_KEY')
        
        if not self.api_key:
            logger.warning("NOLOFICATION_API_KEY environment variable not set - notifications disabled")
    
    def is_configured(self) -> bool:
        """Check if Nolofication is properly configured."""
        return bool(self.api_key)
    
    def send_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = 'info',
        category: Optional[str] = None,
        html_message: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> dict:
        """
        Send notification to a single user.
        
        Args:
            user_id: KeyN user ID (provider_user_id from User model)
            title: Notification title
            message: Plain text message (fallback)
            notification_type: 'info', 'success', 'warning', or 'error'
            category: Notification category (e.g., 'day_results', 'vote_reminders')
            html_message: Optional HTML version of message
            metadata: Optional additional data
        
        Returns:
            Response from Nolofication API
        """
        if not self.is_configured():
            logger.warning("Nolofication not configured - skipping notification")
            return {'success': False, 'error': 'Not configured'}
        
        url = f"{self.base_url}/api/sites/{self.site_id}/notify"
        
        payload = {
            'user_id': user_id,
            'title': title,
            'message': message,
            'type': notification_type
        }
        
        if category:
            payload['category'] = category
        
        if html_message:
            payload['html_message'] = html_message
        
        if metadata:
            payload['metadata'] = metadata
        
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send notification to {user_id}: {e}")
            return {'success': False, 'error': str(e)}
    
    def send_bulk_notification(
        self,
        user_ids: List[str],
        title: str,
        message: str,
        notification_type: str = 'info',
        category: Optional[str] = None,
        html_message: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> dict:
        """
        Send notification to multiple users.
        
        Args:
            user_ids: List of KeyN user IDs
            title: Notification title
            message: Plain text message (fallback)
            notification_type: 'info', 'success', 'warning', or 'error'
            category: Notification category (e.g., 'day_results', 'vote_reminders')
            html_message: Optional HTML version of message
            metadata: Optional additional data
        
        Returns:
            Response from Nolofication API
        """
        if not self.is_configured():
            logger.warning("Nolofication not configured - skipping bulk notification")
            return {'success': False, 'error': 'Not configured'}
        
        if not user_ids:
            return {'success': True, 'sent': 0}
        
        # Same endpoint as single notification, but with user_ids array instead of user_id string
        url = f"{self.base_url}/api/sites/{self.site_id}/notify"
        
        payload = {
            'user_ids': user_ids,
            'title': title,
            'message': message,
            'type': notification_type
        }
        
        if category:
            payload['category'] = category
        
        if html_message:
            payload['html_message'] = html_message
        
        if metadata:
            payload['metadata'] = metadata
        
        headers = {
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send bulk notification to {len(user_ids)} users: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_pending_notifications(
        self,
        user_id: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> dict:
        """
        Get pending scheduled notifications for this site.
        
        Args:
            user_id: Optional KeyN user ID to filter by
            category: Optional category key to filter by
            limit: Maximum results (default 100, max 1000)
            offset: Pagination offset (default 0)
        
        Returns:
            Response with pending notifications list
        """
        if not self.is_configured():
            logger.warning("Nolofication not configured - skipping get pending")
            return {'error': 'Not configured', 'pending_notifications': []}
        
        url = f"{self.base_url}/api/sites/{self.site_id}/pending-notifications"
        params = {}
        
        if user_id:
            params['user_id'] = user_id
        if category:
            params['category'] = category
        params['limit'] = limit
        params['offset'] = offset
        
        headers = {
            'X-API-Key': self.api_key
        }
        
        try:
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get pending notifications: {e}")
            return {'error': str(e), 'pending_notifications': []}
    
    def cancel_pending_notification(self, notification_id: int) -> dict:
        """
        Cancel a pending scheduled notification.
        
        Args:
            notification_id: ID of the pending notification to cancel
        
        Returns:
            Response from Nolofication API
        """
        if not self.is_configured():
            logger.warning("Nolofication not configured - skipping cancel")
            return {'success': False, 'error': 'Not configured'}
        
        url = f"{self.base_url}/api/sites/{self.site_id}/pending-notifications/{notification_id}"
        headers = {
            'X-API-Key': self.api_key
        }
        
        try:
            response = requests.delete(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to cancel notification {notification_id}: {e}")
            return {'success': False, 'error': str(e)}


# Global instance
nolofication = NoloficationService()
