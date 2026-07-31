from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.session import get_db
from models.models import User
from schemas.auth import UserCreate, UserLogin
from utils.hashing import hash_password, verify_hash
from datetime import datetime, timedelta
from schemas.token import generate_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED, tags=["Authentication"])
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_pwd = hash_password(user_data.password)

    # Create the user (using hashed_pwd, NOT the function reference)
    new_user = User(email=user_data.email, password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "email": new_user.email
    }


@router.post("/login", tags=["Authentication"])
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials"
        )

    # Verify password against database hash using credentials instance
    if not verify_hash(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Credentials"
        )

    # Generate JWT token
    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(minutes=120)  
    }
    token = generate_token(payload)

    return {
        "access_token": token,
        "token_type": "bearer"
    }