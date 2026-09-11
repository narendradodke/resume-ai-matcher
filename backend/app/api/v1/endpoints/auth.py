from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session
from uuid import UUID

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.api.deps import get_current_user
from backend.app.schemas.user_schema import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenRefresh,
    TokenResponse,
    TokenRefreshResponse,
    GoogleAuthRequest,
    ResponseEnvelope,
)
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
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


@router.post("/refresh", response_model=ResponseEnvelope[TokenRefreshResponse])
def refresh_token(token_in: TokenRefresh, db: Session = Depends(get_db)):
    """
    Validate a refresh token and return a new access token.
    """
    try:
        payload = decode_token(token_in.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Expected refresh token.",
            )
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token subject missing.",
            )
        user_id = UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token not found.",
        )

    new_access_token = create_access_token(user.id)

    return {
        "success": True,
        "data": TokenRefreshResponse(
            access_token=new_access_token,
            token_type="bearer",
        ),
        "error": None,
    }


@router.get("/me", response_model=ResponseEnvelope[UserResponse])
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated user's profile info.
    """
    return {
        "success": True,
        "data": UserResponse.model_validate(current_user),
        "error": None,
    }


@router.post("/google", response_model=ResponseEnvelope[TokenResponse])
def google_auth(auth_in: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Sign in or register a user with Google OAuth credentials.
    """
    target_email = auth_in.email
    target_name = auth_in.name or "Google User"
    oauth_id = auth_in.id_token or "google_default_id"

    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email is required for OAuth authentication.",
        )

    user = db.query(User).filter(User.email == target_email.lower()).first()
    if not user:
        # Create user with Google OAuth
        user = User(
            name=target_name,
            email=target_email.lower(),
            password_hash=None,
            oauth_provider="google",
            oauth_id=oauth_id,
            plan="free",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user OAuth info if not previously linked
        if not user.oauth_provider:
            user.oauth_provider = "google"
            user.oauth_id = oauth_id
            user.is_verified = True
            db.add(user)
            db.commit()
            db.refresh(user)

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
