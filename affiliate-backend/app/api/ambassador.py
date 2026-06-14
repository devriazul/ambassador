from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil
from app.core.database import get_db
from app import crud, models, schemas
from app.api.auth import get_current_user

router = APIRouter(prefix="/ambassador", tags=["ambassador"])

@router.get("/stats", response_model=schemas.AmbassadorStats)
def get_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_ambassador_dashboard_stats(db, user_id=current_user.id)


@router.post("/reviews", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    platform: models.ReviewPlatform = Form(...),
    review_link: str = Form(...),
    screenshot: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    UPLOAD_DIR = "uploads"
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    file_ext = os.path.splitext(screenshot.filename)[1] if screenshot.filename else ".png"
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(screenshot.file, buffer)
        
    screenshot_url = f"/uploads/{unique_filename}"
    
    review_in = schemas.ReviewCreate(
        platform=platform,
        review_link=review_link,
        screenshot_url=screenshot_url
    )
    return crud.create_review(db, review=review_in, user_id=current_user.id)



@router.get("/reviews", response_model=List[schemas.ReviewResponse])
def get_user_reviews(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_reviews_by_user(db, user_id=current_user.id)


@router.post("/referrals", response_model=schemas.ReferralResponse, status_code=status.HTTP_201_CREATED)
def submit_referral(
    referral_in: schemas.ReferralCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_referral(db, referral=referral_in, referrer_id=current_user.id)


@router.get("/referrals", response_model=List[schemas.ReferralResponse])
def get_user_referrals(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_referrals_by_user(db, user_id=current_user.id)


@router.post("/payouts", response_model=schemas.PayoutResponse, status_code=status.HTTP_201_CREATED)
def request_payout(
    payout_in: schemas.PayoutCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_payout_request(db, payout=payout_in, user_id=current_user.id)


@router.get("/payouts", response_model=List[schemas.PayoutResponse])
def get_user_payouts(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_payouts_by_user(db, user_id=current_user.id)


@router.get("/transactions", response_model=List[schemas.TransactionResponse])
def get_user_transactions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_transactions_by_user(db, user_id=current_user.id)
