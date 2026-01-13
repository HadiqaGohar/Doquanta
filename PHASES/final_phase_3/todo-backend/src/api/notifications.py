from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from pydantic import BaseModel
from ..db.session import get_session
from ..models.models import User, Notification as NotificationModel
from ..core.security import get_current_user_id
from uuid import uuid4



router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"  # 'info', 'success', 'warning', 'error'
    user_id: Optional[str] = None  # If None, send to current user


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


@router.post("/", response_model=NotificationModel)
def create_notification(
    *,
    notification_data: NotificationCreate,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Create a new notification."""
    # Determine the target user - if not specified, use the current user
    target_user_id = notification_data.user_id or current_user_id

    # Verify that the current user has permission to send notification to the target user
    if current_user_id != target_user_id:
        # In a real implementation, you might have specific permissions for sending notifications
        # For now, we'll allow it only if it's the same user
        raise HTTPException(status_code=403, detail="Cannot send notification to another user")

    notification_id = str(uuid4())

    notification = NotificationModel(
        id=notification_id,
        user_id=target_user_id,
        title=notification_data.title,
        message=notification_data.message,
        type=notification_data.type,
        is_read=False,
        created_at=datetime.now()
    )

    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    return notification


@router.get("/", response_model=List[NotificationModel])
def list_notifications(
    *,
    current_user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    is_read: Optional[bool] = Query(None),
    db_session: Session = Depends(get_session)
):
    """List all notifications for the authenticated user."""
    statement = select(NotificationModel).where(NotificationModel.user_id == current_user_id)

    # Filter by read status if specified
    if is_read is not None:
        statement = statement.where(NotificationModel.is_read == is_read)

    # Apply pagination
    statement = statement.offset(skip).limit(limit).order_by(NotificationModel.created_at.desc())
    notifications = db_session.exec(statement).all()
    return notifications


@router.get("/{notification_id}", response_model=NotificationModel)
def get_notification(
    *,
    notification_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Get a specific notification."""
    statement = select(NotificationModel).where(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == current_user_id
    )
    notification = db_session.exec(statement).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    return notification


@router.put("/{notification_id}", response_model=NotificationModel)
def update_notification(
    *,
    notification_id: str,
    notification_update: NotificationUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Update a notification."""
    statement = select(NotificationModel).where(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == current_user_id
    )
    notification = db_session.exec(statement).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Update fields if provided
    if notification_update.is_read is not None:
        notification.is_read = notification_update.is_read
        if notification_update.is_read:
            notification.read_at = datetime.now()

    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    return notification


@router.delete("/{notification_id}")
def delete_notification(
    *,
    notification_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Delete a notification."""
    statement = select(NotificationModel).where(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == current_user_id
    )
    notification = db_session.exec(statement).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db_session.delete(notification)
    db_session.commit()

    return {"message": "Notification deleted successfully"}


@router.post("/{notification_id}/read")
def mark_notification_as_read(
    *,
    notification_id: str,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Mark a notification as read."""
    statement = select(NotificationModel).where(
        NotificationModel.id == notification_id,
        NotificationModel.user_id == current_user_id
    )
    notification = db_session.exec(statement).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    notification.read_at = datetime.now()

    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    return {"message": "Notification marked as read"}


@router.post("/read-all")
def mark_all_notifications_as_read(
    *,
    current_user_id: str = Depends(get_current_user_id),
    db_session: Session = Depends(get_session)
):
    """Mark all notifications for the user as read."""
    statement = select(NotificationModel).where(
        NotificationModel.user_id == current_user_id,
        NotificationModel.is_read == False
    )
    notifications = db_session.exec(statement).all()

    updated_count = 0
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.now()
        db_session.add(notification)
        updated_count += 1

    db_session.commit()

    return {"message": f"Marked {updated_count} notifications as read"}