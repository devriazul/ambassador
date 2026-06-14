from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app import crud, models, schemas
from app.api.auth import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])

# All routes in this router require admin validation
@router.get("/reviews", response_model=List[schemas.ReviewResponse])
def read_reviews(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.get_all_reviews(db, skip=skip, limit=limit)


@router.put("/reviews/{review_id}/status", response_model=schemas.ReviewResponse)
def update_review(
    review_id: str,
    status_update: schemas.ReviewUpdateStatus,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.update_review_status(db, review_id=review_id, new_status=status_update.status, admin_id=current_admin.id)


@router.get("/referrals", response_model=List[schemas.ReferralResponse])
def read_referrals(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.get_all_referrals(db, skip=skip, limit=limit)


@router.put("/referrals/{referral_id}/status", response_model=schemas.ReferralResponse)
def update_referral(
    referral_id: str,
    status_update: schemas.ReferralUpdateStatus,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.update_referral_status(db, referral_id=referral_id, new_status=status_update.status, admin_id=current_admin.id)


@router.get("/payouts", response_model=List[schemas.PayoutResponse])
def read_payouts(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.get_all_payouts(db, skip=skip, limit=limit)


@router.put("/payouts/{payout_id}/status", response_model=schemas.PayoutResponse)
def update_payout(
    payout_id: str,
    status_update: schemas.PayoutUpdateStatus,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.update_payout_status(db, payout_id=payout_id, new_status=status_update.status, admin_id=current_admin.id)


@router.get("/users", response_model=List[schemas.UserResponse])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/stats")
def read_admin_stats(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return crud.get_admin_dashboard_stats(db)


@router.post("/leads/cleanup")
def cleanup_leads(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Runs lead expiry rules per business spec:
    - Submitted > 7 days → auto-rejected
    - Contacted/Validated > 30 days → rejected
    - Application Started > 90 days → closed
    - Offer Issued > 60 days → expired
    """
    return crud.cleanup_expired_leads(db)


@router.post("/referrals/{referral_id}/clawback", response_model=schemas.ReferralResponse)
def apply_clawback(
    referral_id: str,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Reverses enrolment reward if referred student withdraws within 14-day cooling-off period.
    Lead reward (£5) remains with the ambassador per business policy.
    """
    return crud.apply_enrolment_clawback(db, referral_id=referral_id, admin_id=current_admin.id)

@router.put("/users/{user_id}/tier", response_model=schemas.UserResponse)
def set_user_tier(
    user_id: str,
    tier_update: schemas.TierUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Manually override an ambassador's tier. Bypasses the automatic lead-count
    calculation and persists the change immediately to the database.
    An audit transaction is recorded for traceability.
    """
    return crud.set_user_tier_manually(
        db,
        user_id=user_id,
        new_tier=tier_update.tier,
        admin_id=current_admin.id,
        note=tier_update.note
    )

# --- Tier Config Endpoints ---

@router.get("/tier-configs", response_model=list[schemas.TierConfigResponse])
def get_tier_configs(
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Return all configurable tier parameters (leads required + bonus amounts)."""
    return crud.get_tier_configs(db)


@router.put("/tier-configs/{tier}", response_model=schemas.TierConfigResponse)
def update_tier_config(
    tier: models.AmbassadorTier,
    update: schemas.TierConfigUpdate,
    current_admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update the leads threshold and bonus amount for a specific tier.
    Ambassador tier status is recalculated automatically when leads are validated.
    """
    from decimal import Decimal
    return crud.update_tier_config(
        db,
        tier=tier,
        leads_required=update.leads_required,
        bonus_amount=Decimal(str(update.bonus_amount)),
        admin_id=current_admin.id
    )
