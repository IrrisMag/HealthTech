from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas.user import User, UserStats, UserApproval, PermissionGrant
from app.schemas.auth import AuditLogEntry, SecurityEvent
from app.models.user import UserRole, Permission, ApprovalStatus
from app.models.audit import AuditSeverity
from app.services.user_service import (
    get_all_users, approve_user, grant_permission, 
    deactivate_user, get_user_by_id
)
from app.services.audit_service import audit_service
from app.middleware.auth_middleware import require_roles, require_permissions, get_current_user
from app.database.connection import db

router = APIRouter(prefix="/admin", tags=["administration"])

# Collections
users_collection = db["users"]
audit_collection = db["audit_logs"]
security_events_collection = db["security_events"]


@router.get("/users/stats", response_model=UserStats)
async def get_user_statistics(
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Get user statistics for admin dashboard"""
    
    # Count users by status
    total_users = users_collection.count_documents({})
    active_users = users_collection.count_documents({"is_active": True})
    pending_approvals = users_collection.count_documents({
        "approval_status": ApprovalStatus.PENDING.value
    })
    locked_accounts = users_collection.count_documents({
        "locked_until": {"$gt": datetime.utcnow()}
    })
    
    # Count by role
    role_pipeline = [
        {"$group": {"_id": "$role", "count": {"$sum": 1}}}
    ]
    by_role = {item["_id"]: item["count"] for item in users_collection.aggregate(role_pipeline)}
    
    # Count by department
    dept_pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    by_department = {item["_id"]: item["count"] for item in users_collection.aggregate(dept_pipeline)}
    
    return UserStats(
        total_users=total_users,
        active_users=active_users,
        pending_approvals=pending_approvals,
        locked_accounts=locked_accounts,
        by_role=by_role,
        by_department=by_department
    )


@router.get("/users/pending", response_model=List[User])
async def get_pending_users(
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Get users pending approval"""
    
    pending_users = []
    cursor = users_collection.find({"approval_status": ApprovalStatus.PENDING.value})
    
    for user_data in cursor:
        user_data["id"] = str(user_data["_id"])
        pending_users.append(User(**user_data))
    
    return pending_users


@router.post("/users/approve")
async def approve_user_account(
    approval: UserApproval,
    request: Request,
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Approve or reject user account"""
    
    target_user = get_user_by_id(approval.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if approval.approved:
        success = await approve_user(approval.user_id, current_user.id)
        action = "approved"
    else:
        success = await deactivate_user(approval.user_id, current_user.id)
        action = "rejected"
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update user status"
        )
    
    await audit_service.log_event(
        action=f"user_{action}",
        user_id=current_user.id,
        user_email=current_user.email,
        resource="user",
        resource_id=approval.user_id,
        severity=AuditSeverity.HIGH,
        request=request,
        success=True,
        additional_data={
            "target_user": target_user.email,
            "reason": approval.reason
        }
    )
    
    return {"message": f"User {action} successfully"}


@router.post("/users/grant-permission")
async def grant_user_permission(
    permission_grant: PermissionGrant,
    request: Request,
    current_user: User = Depends(require_permissions([Permission.MANAGE_USERS]))
):
    """Grant permission to user"""
    
    target_user = get_user_by_id(permission_grant.user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    success = await grant_permission(
        permission_grant.user_id,
        permission_grant.permission,
        current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to grant permission"
        )
    
    return {"message": "Permission granted successfully"}


@router.get("/audit/logs", response_model=List[AuditLogEntry])
async def get_audit_logs(
    limit: int = Query(100, le=1000),
    skip: int = Query(0, ge=0),
    user_email: Optional[str] = None,
    action: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(require_permissions([Permission.VIEW_AUDIT_LOGS]))
):
    """Get audit logs with filtering"""
    
    # Build filter query
    filter_query = {}
    
    if user_email:
        filter_query["user_email"] = {"$regex": user_email, "$options": "i"}
    
    if action:
        filter_query["action"] = action
    
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            date_filter["$lte"] = end_date
        filter_query["timestamp"] = date_filter
    
    # Query audit logs
    cursor = audit_collection.find(filter_query).sort("timestamp", -1).skip(skip).limit(limit)
    
    logs = []
    for log_data in cursor:
        logs.append(AuditLogEntry(
            id=str(log_data["_id"]),
            timestamp=log_data["timestamp"],
            user_email=log_data.get("user_email"),
            action=log_data["action"],
            resource=log_data.get("resource"),
            success=log_data["success"],
            ip_address=log_data.get("ip_address"),
            details=log_data.get("additional_data")
        ))
    
    return logs


@router.get("/security/events", response_model=List[SecurityEvent])
async def get_security_events(
    limit: int = Query(50, le=500),
    skip: int = Query(0, ge=0),
    severity: Optional[str] = None,
    resolved: Optional[bool] = None,
    current_user: User = Depends(require_permissions([Permission.VIEW_AUDIT_LOGS]))
):
    """Get security events"""
    
    filter_query = {}
    
    if severity:
        filter_query["severity"] = severity
    
    if resolved is not None:
        filter_query["resolved"] = resolved
    
    cursor = security_events_collection.find(filter_query).sort("timestamp", -1).skip(skip).limit(limit)
    
    events = []
    for event_data in cursor:
        events.append(SecurityEvent(
            event_type=event_data["event_type"],
            timestamp=event_data["timestamp"],
            description=event_data["description"],
            severity=event_data["severity"],
            ip_address=event_data.get("ip_address")
        ))
    
    return events


@router.get("/users/{user_id}/audit", response_model=List[AuditLogEntry])
async def get_user_audit_logs(
    user_id: str,
    limit: int = Query(100, le=500),
    current_user: User = Depends(require_permissions([Permission.VIEW_AUDIT_LOGS]))
):
    """Get audit logs for specific user"""
    
    logs = await audit_service.get_user_audit_logs(user_id, limit=limit)
    
    return [
        AuditLogEntry(
            id=log.id,
            timestamp=log.timestamp,
            user_email=log.user_email,
            action=log.action,
            resource=log.resource,
            success=log.success,
            ip_address=log.ip_address,
            details=log.additional_data
        )
        for log in logs
    ]
