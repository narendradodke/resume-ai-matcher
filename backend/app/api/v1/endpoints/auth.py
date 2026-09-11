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
    verify_google_id_token,
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
    Sign in or register a user with cryptographically verified Google OAuth ID token.
    """
    try:
        idinfo = verify_google_id_token(auth_in.id_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    target_email = idinfo["email"].lower()
    target_name = idinfo.get("name") or target_email.split("@")[0]
    google_sub = idinfo["sub"]

    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        # Create new user via verified Google OAuth
        user = User(
            name=target_name,
            email=target_email,
            password_hash=None,
            oauth_provider="google",
            oauth_id=google_sub,
            plan="free",
            is_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Existing user found
        if user.oauth_provider == "google":
            # Already linked to Google: verify subject match if present
            if user.oauth_id and user.oauth_id != google_sub:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Google account mismatch for this email address.",
                )
        elif user.oauth_provider is None:
            # Safe linking: User originally signed up with password.
            # Link Google OAuth to existing account
            user.oauth_provider = "google"
            user.oauth_id = google_sub
            user.is_verified = True
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Different OAuth provider
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Account is already associated with another login provider: {user.oauth_provider}",
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
