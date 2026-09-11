import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.api.deps import get_current_user
from backend.app.schemas.user_schema import (
    UserResponse,
    UserUpdate,
    PasswordChange,
    ResponseEnvelope,
)
from backend.app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile", response_model=ResponseEnvelope[UserResponse])
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated user profile information.
    """
    return {
        "success": True,
        "data": UserResponse.model_validate(current_user),
        "error": None,
    }


@router.put("/profile", response_model=ResponseEnvelope[UserResponse])
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update authenticated user's name or email.
    """
    if user_update.email and user_update.email.lower() != current_user.email:
        existing = db.query(User).filter(User.email == user_update.email.lower()).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This email address is already in use.",
            )
        current_user.email = user_update.email.lower()

    if user_update.name is not None:
        current_user.name = user_update.name.strip()

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "data": UserResponse.model_validate(current_user),
        "error": None,
    }


@router.put("/password", response_model=ResponseEnvelope[dict])
def change_user_password(
    password_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change user password after verifying current password.
    """
    if not current_user.password_hash or not verify_password(password_in.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed.",
        )

    current_user.password_hash = get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()

    return {
        "success": True,
        "data": {"message": "Password changed successfully."},
        "error": None,
    }


@router.delete("/account", response_model=ResponseEnvelope[dict])
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Delete authenticated user's account and cascade delete all associated resumes and analyses.
    """
    # 1. Clean up file upload directory if exists
    user_upload_dir = Path(settings.UPLOAD_DIR) / str(current_user.id)
    if user_upload_dir.exists():
        try:
            shutil.rmtree(user_upload_dir)
        except OSError:
            pass

    # 2. Delete user (SQLAlchemy cascade deletes resumes and analyses)
    db.delete(current_user)
    db.commit()

    return {
        "success": True,
        "data": {"message": "Account and all associated data deleted successfully."},
        "error": None,
    }
