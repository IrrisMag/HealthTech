"""
Notification service client for sending SMS credentials
"""

import os
import httpx
import logging
from typing import Optional
from app.models.user import UserRole

logger = logging.getLogger(__name__)

# Configuration
NOTIFICATION_SERVICE_URL = os.getenv(
    "NOTIFICATION_SERVICE_URL", 
    "http://notification:8000"
)

class NotificationService:
    """Client for notification service"""
    
    @staticmethod
    async def send_user_credentials(
        phone_number: str,
        full_name: str,
        email: str,
        temporary_password: str,
        role: UserRole,
        language: str = "en"
    ) -> bool:
        """
        Send login credentials to new user via SMS
        
        Args:
            phone_number: User's phone number (with country code)
            full_name: User's full name
            email: User's email address
            temporary_password: Temporary password for first login
            role: User's role
            language: Language for SMS (en/fr)
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{NOTIFICATION_SERVICE_URL}/notifications/send-credentials",
                    json={
                        "to": phone_number,
                        "full_name": full_name,
                        "email": email,
                        "temporary_password": temporary_password,
                        "role": role.value,
                        "language": language
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Credentials sent successfully to {phone_number}, SID: {result.get('sid')}")
                    return True
                else:
                    logger.error(f"Failed to send credentials: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending credentials to {phone_number}: {str(e)}")
            return False
    
    @staticmethod
    async def send_account_approval(
        phone_number: str,
        full_name: str,
        email: str,
        role: UserRole,
        language: str = "en"
    ) -> bool:
        """
        Send account approval notification via SMS
        
        Args:
            phone_number: User's phone number (with country code)
            full_name: User's full name
            email: User's email address
            role: User's role
            language: Language for SMS (en/fr)
            
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{NOTIFICATION_SERVICE_URL}/notifications/send-approval",
                    json={
                        "to": phone_number,
                        "full_name": full_name,
                        "email": email,
                        "temporary_password": "",  # Not needed for approval
                        "role": role.value,
                        "language": language
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"Approval notification sent to {phone_number}, SID: {result.get('sid')}")
                    return True
                else:
                    logger.error(f"Failed to send approval: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending approval to {phone_number}: {str(e)}")
            return False
    
    @staticmethod
    def format_phone_number(phone: str, country_code: str = "+237") -> str:
        """
        Format phone number with country code for Cameroon
        
        Args:
            phone: Phone number (can be with or without country code)
            country_code: Default country code for Cameroon
            
        Returns:
            str: Formatted phone number with country code
        """
        # Remove any spaces, dashes, or parentheses
        clean_phone = ''.join(filter(str.isdigit, phone))
        
        # If phone starts with country code digits, assume it's already formatted
        if clean_phone.startswith("237") and len(clean_phone) == 12:
            return f"+{clean_phone}"
        
        # If phone starts with 0, remove it (local format)
        if clean_phone.startswith("0"):
            clean_phone = clean_phone[1:]
        
        # Add Cameroon country code if not present
        if len(clean_phone) == 9:  # Standard Cameroon mobile number length
            return f"{country_code}{clean_phone}"
        
        # If already has + sign, return as is
        if phone.startswith("+"):
            return phone
            
        # Default: add country code
        return f"{country_code}{clean_phone}"

# Create singleton instance
notification_service = NotificationService()
