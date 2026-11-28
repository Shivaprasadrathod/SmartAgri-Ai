from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.farm import UserSettings
from app.models.user import User
from app.schemas.user import AuthResponse, UserCreate, UserLogin, UserOut
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    new_user = User(
        name=user.name.strip(),
        email=normalized_email,
        hashed_password=hash_password(user.password),
    )
    db.add(new_user)
    db.flush()

    db.add(
        UserSettings(
            user_id=new_user.id,
            name=new_user.name,
            email=new_user.email,
        )
    )
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, {"email": new_user.email})
    return AuthResponse(
        message="User registered successfully",
        access_token=token,
        user=UserOut.model_validate(new_user),
    )


@router.post("/login", response_model=AuthResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    normalized_email = user.email.strip().lower()
    existing_user = db.query(User).filter(User.email == normalized_email).first()

    if not existing_user or not verify_password(user.password, existing_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(existing_user.id, {"email": existing_user.email})
    return AuthResponse(
        message="Login successful",
        access_token=token,
        user=UserOut.model_validate(existing_user),
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
