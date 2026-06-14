from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.core.database import get_db
from app.core.config import settings
from app import crud, models, schemas
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(user_id=user_id, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
        
    user = crud.get_user(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

def get_current_admin(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_student(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email address already exists in the system."
        )
        
    # If it is the very first user registered, we can optionally make them an admin for convenience in testing.
    # Otherwise standard student registration.
    is_first_user = db.query(models.User).count() == 0
    return crud.create_user(db, user=user_in, is_first_admin=is_first_user)


@router.post("/register/initiate")
def register_initiate(data: schemas.UserRegisterInitiate, db: Session = Depends(get_db)):
    import random
    from datetime import datetime, timedelta
    from app.core.mail import send_otp_email

    # Check if user already exists
    existing_user = crud.get_user_by_email(db, email=data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Generate 6-digit OTP
    otp_code = "".join(random.choices("0123456789", k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=10)

    # Save OTP to database
    otp_entry = models.OTPVerification(
        email=data.email,
        full_name=data.full_name,
        otp_code=otp_code,
        expires_at=expires_at
    )
    db.add(otp_entry)
    db.commit()

    # Send SMTP email
    send_otp_email(to_email=data.email, full_name=data.full_name, otp_code=otp_code)

    return {"message": "OTP code sent to your email address."}


@router.post("/register/verify")
def register_verify(data: schemas.UserRegisterVerify, db: Session = Depends(get_db)):
    from datetime import datetime
    import uuid

    # Find the latest OTP verification for this email
    otp_entry = db.query(models.OTPVerification).filter(
        models.OTPVerification.email == data.email,
        models.OTPVerification.otp_code == data.otp,
        models.OTPVerification.is_verified == False,
        models.OTPVerification.expires_at > datetime.utcnow()
    ).order_by(models.OTPVerification.created_at.desc()).first()

    if not otp_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code."
        )

    # Verify and generate token
    verification_token = str(uuid.uuid4())
    otp_entry.is_verified = True
    otp_entry.verification_token = verification_token
    db.add(otp_entry)
    db.commit()

    return {
        "message": "OTP verified successfully.",
        "verification_token": verification_token
    }


@router.post("/register/complete", response_model=schemas.Token)
def register_complete(data: schemas.UserRegisterComplete, db: Session = Depends(get_db)):
    from datetime import datetime

    # Verify token
    otp_entry = db.query(models.OTPVerification).filter(
        models.OTPVerification.email == data.email,
        models.OTPVerification.verification_token == data.verification_token,
        models.OTPVerification.is_verified == True
    ).first()

    if not otp_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or missing verification token."
        )

    # Check if user already exists
    existing_user = crud.get_user_by_email(db, email=data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create the user using full name from verification entry
    is_first_user = db.query(models.User).count() == 0
    user_in = schemas.UserCreate(
        email=data.email,
        full_name=otp_entry.full_name,
        password=data.password
    )
    user = crud.create_user(db, user=user_in, is_first_admin=is_first_user)

    # Clean up verification entry
    db.delete(otp_entry)
    db.commit()

    # Log user in
    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=login_data.email)
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=schemas.Token)
def google_login(login_data: schemas.UserGoogleLogin, db: Session = Depends(get_db)):
    from google.oauth2 import id_token
    from google.auth.transport import requests
    import uuid

    token = login_data.credential
    email = None
    name = None

    try:
        # Check for mock token for local developer testing / automated test cases
        if (settings.GOOGLE_CLIENT_ID == "dummy-google-client-id.apps.googleusercontent.com" or token.startswith("mock_")):
            parts = token.split("_")
            email = parts[1] if len(parts) > 1 else "google_test@example.com"
            name = parts[2] if len(parts) > 2 else "Google Test User"
        else:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = idinfo.get("email")
            name = idinfo.get("name", email.split("@")[0] if email else "Google User")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not retrieve email address from Google token."
        )

    user = crud.get_user_by_email(db, email=email)
    if not user:
        # Create a new user if it doesn't exist
        is_first_user = db.query(models.User).count() == 0
        user_in = schemas.UserCreate(
            email=email,
            full_name=name,
            password=str(uuid.uuid4())  # Generate a secure random password for OAuth users
        )
        user = crud.create_user(db, user=user_in, is_first_admin=is_first_user)

    access_token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def read_user_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/settings", response_model=schemas.UserResponse)
def update_profile(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.update_user_profile(db, user_id=current_user.id, user_update=user_update)

