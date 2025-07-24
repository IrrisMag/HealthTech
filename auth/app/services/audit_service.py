import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import Request
from app.models.audit import AuditLog, AuditAction, AuditSeverity, SecurityEvent, LoginAttempt
from app.database.connection import db
from app.config import settings

# Configure logging
logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Collections
audit_collection = db["audit_logs"]
security_events_collection = db["security_events"]
login_attempts_collection = db["login_attempts"]


class AuditService:
    @staticmethod
    async def log_event(
        action: AuditAction,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        user_role: Optional[str] = None,
        resource: Optional[str] = None,
        resource_id: Optional[str] = None,
        severity: AuditSeverity = AuditSeverity.LOW,
        request: Optional[Request] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Log an audit event"""
        
        # Extract request information
        ip_address = None
        user_agent = None
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
        
        audit_log = AuditLog(
            timestamp=datetime.utcnow(),
            user_id=user_id,
            user_email=user_email,
            user_role=user_role,
            action=action,
            resource=resource,
            resource_id=resource_id,
            severity=severity,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=None,  # Add session_id field
            success=success,
            error_message=error_message,
            additional_data=additional_data
        )
        
        # Insert into database
        result = audit_collection.insert_one(audit_log.dict())
        
        # Log to application logs for critical events
        if severity in [AuditSeverity.HIGH, AuditSeverity.CRITICAL]:
            logger.warning(f"AUDIT: {action} - User: {user_email} - Success: {success}")
        
        return str(result.inserted_id)
    
    @staticmethod
    async def log_login_attempt(
        email: str,
        success: bool,
        request: Optional[Request] = None,
        failure_reason: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> str:
        """Log a login attempt"""
        
        ip_address = request.client.host if request and request.client else None
        user_agent = request.headers.get("user-agent") if request else None
        
        login_attempt = LoginAttempt(
            email=email,
            ip_address=ip_address or "unknown",
            user_agent=user_agent or "unknown",
            timestamp=datetime.utcnow(),
            success=success,
            failure_reason=failure_reason,
            user_id=user_id
        )
        
        result = login_attempts_collection.insert_one(login_attempt.dict())
        
        # Also log as audit event
        await AuditService.log_event(
            action=AuditAction.LOGIN_SUCCESS if success else AuditAction.LOGIN_FAILED,
            user_id=user_id,
            user_email=email,
            severity=AuditSeverity.MEDIUM if not success else AuditSeverity.LOW,
            request=request,
            success=success,
            error_message=failure_reason
        )
        
        return str(result.inserted_id)
    
    @staticmethod
    async def log_security_event(
        event_type: str,
        description: str,
        severity: AuditSeverity = AuditSeverity.MEDIUM,
        user_id: Optional[str] = None,
        request: Optional[Request] = None
    ) -> str:
        """Log a security event"""
        
        ip_address = request.client.host if request and request.client else None
        
        security_event = SecurityEvent(
            timestamp=datetime.utcnow(),
            event_type=event_type,
            severity=severity,
            user_id=user_id,
            ip_address=ip_address,
            description=description
        )
        
        result = security_events_collection.insert_one(security_event.dict())
        
        # Log critical security events
        if severity == AuditSeverity.CRITICAL:
            logger.critical(f"SECURITY EVENT: {event_type} - {description}")
        
        return str(result.inserted_id)
    
    @staticmethod
    async def get_user_audit_logs(
        user_id: str,
        limit: int = 100,
        skip: int = 0
    ) -> List[AuditLog]:
        """Get audit logs for a specific user"""
        
        cursor = audit_collection.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).skip(skip).limit(limit)
        
        logs = []
        for log_data in cursor:
            log_data["id"] = str(log_data["_id"])
            logs.append(AuditLog(**log_data))
        
        return logs
    
    @staticmethod
    async def get_failed_login_attempts(
        email: str,
        hours: int = 24
    ) -> int:
        """Get count of failed login attempts for an email in the last X hours"""
        
        from datetime import timedelta
        since = datetime.utcnow() - timedelta(hours=hours)
        
        count = login_attempts_collection.count_documents({
            "email": email,
            "success": False,
            "timestamp": {"$gte": since}
        })
        
        return count


# Global audit service instance
audit_service = AuditService()
