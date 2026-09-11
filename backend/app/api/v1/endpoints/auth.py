from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user_schema import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    ResponseEnvelope,
)
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=ResponseEnvelope[UserResponse], status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account with email and password.
    """
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        plan="free",
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "data": UserResponse.model_validate(user),
        "error": None,
    }


@router.post("/login", response_model=ResponseEnvelope[TokenResponse])
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate user and issue JWT access and refresh tokens.
    """
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    token_data = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

    return {
        "success": True,
        "data": token_data,
        "error": None,
    }
