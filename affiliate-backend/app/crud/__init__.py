import random
import string
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException, status
from app.models import (
    User, Review, Referral, Payout, Transaction, TierConfig,
    UserRole, AmbassadorTier, ReviewStatus, ReferralStatus,
    PayoutStatus, TransactionType, TransactionCategory
)
from app.schemas import UserCreate, ReviewCreate, ReferralCreate, PayoutCreate
from app.core.security import get_password_hash

# --- User CRUD ---

def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_referral_code(db: Session, referral_code: str):
    return db.query(User).filter(User.referral_code == referral_code.upper()).first()

def generate_unique_referral_code(db: Session, full_name: str) -> str:
    # Use initials + random digits
    clean_name = "".join([c for c in full_name if c.isalpha()]).upper()
    prefix = clean_name[:4] if len(clean_name) >= 4 else clean_name.ljust(4, 'X')
    
    while True:
        suffix = "".join(random.choices(string.digits, k=3))
        code = f"{prefix}{suffix}"
        # Check uniqueness
        exists = db.query(User).filter(User.referral_code == code).first()
        if not exists:
            return code

def create_user(db: Session, user: UserCreate, is_first_admin: bool = False):
    hashed_pwd = get_password_hash(user.password)
    ref_code = generate_unique_referral_code(db, user.full_name)
    
    # Assign admin role to first user or if specified (in dev scenario)
    role = UserRole.student
    if is_first_admin:
        role = UserRole.admin
        
    db_user = User(
        email=user.email,
        password_hash=hashed_pwd,
        full_name=user.full_name,
        role=role,
        referral_code=ref_code
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# --- TierConfig CRUD ---

DEFAULT_TIER_CONFIGS = [
    (AmbassadorTier.bronze,   10,  Decimal("25.00")),
    (AmbassadorTier.silver,   25,  Decimal("100.00")),
    (AmbassadorTier.gold,     50,  Decimal("250.00")),
    (AmbassadorTier.platinum, 100, Decimal("500.00")),
]

def get_tier_configs(db: Session):
    """Return all tier configs ordered by leads_required. Seeds defaults if none exist."""
    configs = db.query(TierConfig).all()
    if not configs:
        # Auto-seed defaults on first access
        for tier, leads, bonus in DEFAULT_TIER_CONFIGS:
            tc = TierConfig(tier=tier, leads_required=str(leads), bonus_amount=bonus)
            db.add(tc)
        db.commit()
        configs = db.query(TierConfig).all()
    return sorted(configs, key=lambda c: int(c.leads_required))

def recalculate_all_users_tiers(db: Session):
    """Recalculate tiers for all student users based on new configuration thresholds."""
    users = db.query(User).filter(User.role == UserRole.student).all()
    for user in users:
        update_user_tier(db, user)

def update_tier_config(db: Session, tier: AmbassadorTier, leads_required: int, bonus_amount: Decimal, admin_id: str):
    """Update the leads threshold and bonus amount for a given tier."""
    tc = db.query(TierConfig).filter(TierConfig.tier == tier).first()
    if not tc:
        tc = TierConfig(tier=tier, leads_required=str(leads_required), bonus_amount=bonus_amount)
        db.add(tc)
    else:
        tc.leads_required = str(leads_required)
        tc.bonus_amount = bonus_amount
        db.add(tc)
    db.commit()
    db.refresh(tc)
    
    # Trigger recalculation for all student users under the new tier parameters
    recalculate_all_users_tiers(db)
    
    return tc

def _get_tier_thresholds(db: Session):
    """Return a dict of tier -> (leads_required, bonus_amount) from DB config."""
    configs = get_tier_configs(db)
    return {c.tier: (int(c.leads_required), Decimal(str(c.bonus_amount))) for c in configs}

# Dynamic tier update helper
def update_user_tier(db: Session, user: User):
    # Count the number of valid leads
    valid_leads_count = db.query(Referral).filter(
        Referral.referrer_id == user.id,
        Referral.status.in_([
            ReferralStatus.validated,
            ReferralStatus.application_submitted,
            ReferralStatus.offer_made,
            ReferralStatus.enrolled_home,
            ReferralStatus.enrolled_international
        ])
    ).count()

    # Load configurable thresholds from DB
    thresholds = _get_tier_thresholds(db)

    bronze_leads,   bronze_bonus   = thresholds.get(AmbassadorTier.bronze,   (10,  Decimal("25.00")))
    silver_leads,   silver_bonus   = thresholds.get(AmbassadorTier.silver,   (25,  Decimal("100.00")))
    gold_leads,     gold_bonus     = thresholds.get(AmbassadorTier.gold,     (50,  Decimal("250.00")))
    platinum_leads, platinum_bonus = thresholds.get(AmbassadorTier.platinum, (100, Decimal("500.00")))

    # Determine new tier based on configurable thresholds
    new_tier = AmbassadorTier.standard
    if valid_leads_count >= platinum_leads:
        new_tier = AmbassadorTier.platinum
    elif valid_leads_count >= gold_leads:
        new_tier = AmbassadorTier.gold
    elif valid_leads_count >= silver_leads:
        new_tier = AmbassadorTier.silver
    elif valid_leads_count >= bronze_leads:
        new_tier = AmbassadorTier.bronze

    # Build qualifying tier map using DB values
    tier_bonuses = {
        AmbassadorTier.bronze:   (bronze_bonus,   "BRONZE"),
        AmbassadorTier.silver:   (silver_bonus,   "SILVER"),
        AmbassadorTier.gold:     (gold_bonus,     "GOLD"),
        AmbassadorTier.platinum: (platinum_bonus, "PLATINUM"),
    }

    qualifying_tiers = []
    if valid_leads_count >= bronze_leads:
        qualifying_tiers.append(AmbassadorTier.bronze)
    if valid_leads_count >= silver_leads:
        qualifying_tiers.append(AmbassadorTier.silver)
    if valid_leads_count >= gold_leads:
        qualifying_tiers.append(AmbassadorTier.gold)
    if valid_leads_count >= platinum_leads:
        qualifying_tiers.append(AmbassadorTier.platinum)

    for tier_enum in qualifying_tiers:
        bonus_amount, tier_name = tier_bonuses[tier_enum]
        already_awarded = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.category == TransactionCategory.bonus_reward,
            Transaction.description.like(f"%{tier_name}%")
        ).first()
        if not already_awarded:
            user.wallet_balance += bonus_amount
            user.total_earned += bonus_amount
            tx = Transaction(
                user_id=user.id,
                type=TransactionType.credit,
                amount=bonus_amount,
                category=TransactionCategory.bonus_reward,
                description=f"Bonus reward for reaching {tier_name} tier!"
            )
            db.add(tx)

    if user.tier != new_tier:
        user.tier = new_tier

    db.add(user)
    db.commit()
    db.refresh(user)


# --- Review CRUD ---

def get_reviews_by_user(db: Session, user_id: str):
    return db.query(Review).filter(Review.user_id == user_id).all()

def get_all_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Review).offset(skip).limit(limit).all()

def create_review(db: Session, review: ReviewCreate, user_id: str):
    # Enforce check: One review per platform per student
    existing = db.query(Review).filter(
        Review.user_id == user_id,
        Review.platform == review.platform
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You have already submitted a review for {review.platform.value}."
        )
        
    db_review = Review(
        user_id=user_id,
        platform=review.platform,
        review_link=review.review_link,
        screenshot_url=review.screenshot_url
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def update_review_status(db: Session, review_id: str, new_status: ReviewStatus, admin_id: str):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if db_review.status != ReviewStatus.pending:
        raise HTTPException(status_code=400, detail="Review has already been processed")
        
    db_review.status = new_status
    db_review.verified_by = admin_id
    db_review.verified_at = func.now()
    
    # If approved, reward the student
    if new_status == ReviewStatus.approved:
        user = db.query(User).filter(User.id == db_review.user_id).first()
        if user:
            user.wallet_balance += Decimal(str(db_review.reward_amount))
            user.total_earned += Decimal(str(db_review.reward_amount))
            
            # Record audit trail transaction
            tx = Transaction(
                user_id=user.id,
                type=TransactionType.credit,
                amount=db_review.reward_amount,
                category=TransactionCategory.review_reward,
                reference_id=db_review.id,
                description=f"Reward for approved {db_review.platform.value} review."
            )
            db.add(tx)
            db.add(user)
            
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


# --- Referral CRUD ---

def get_referrals_by_user(db: Session, user_id: str):
    return db.query(Referral).filter(Referral.referrer_id == user_id).all()

def get_all_referrals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Referral).offset(skip).limit(limit).all()

def create_referral(db: Session, referral: ReferralCreate, referrer_id: str):
    db_referral = Referral(
        referrer_id=referrer_id,
        lead_name=referral.lead_name,
        lead_email=referral.lead_email,
        lead_phone=referral.lead_phone,
        education_interest=referral.education_interest
    )
    db.add(db_referral)
    db.commit()
    db.refresh(db_referral)
    return db_referral

def update_referral_status(db: Session, referral_id: str, new_status: ReferralStatus, admin_id: str):
    db_referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    db_referral.status = new_status
    db_referral.verified_by = admin_id
    
    user = db.query(User).filter(User.id == db_referral.referrer_id).first()
    if not user:
         raise HTTPException(status_code=404, detail="Referrer student not found")

    # Level 2 Lead Validation Reward (£5)
    # Status transitions to validated, app submitted, offer made, or enrolled
    is_valid_lead = new_status in [
        ReferralStatus.validated,
        ReferralStatus.application_submitted,
        ReferralStatus.offer_made,
        ReferralStatus.enrolled_home,
        ReferralStatus.enrolled_international
    ]
    
    if is_valid_lead and not db_referral.lead_reward_paid:
        db_referral.lead_reward_paid = True
        reward = Decimal("5.00")
        user.wallet_balance += reward
        user.total_earned += reward
        
        tx = Transaction(
            user_id=user.id,
            type=TransactionType.credit,
            amount=reward,
            category=TransactionCategory.lead_reward,
            reference_id=db_referral.id,
            description=f"Reward for validated lead referral: {db_referral.lead_name}."
        )
        db.add(tx)
        
    # Level 3 Enrolment Reward (£500 or £750)
    if new_status == ReferralStatus.enrolled_home and not db_referral.enrolment_reward_paid:
        db_referral.enrolment_reward_paid = True
        reward = Decimal("500.00")
        user.wallet_balance += reward
        user.total_earned += reward
        
        tx = Transaction(
            user_id=user.id,
            type=TransactionType.credit,
            amount=reward,
            category=TransactionCategory.enrolment_reward,
            reference_id=db_referral.id,
            description=f"Reward for successful UK Home Student Enrolment: {db_referral.lead_name}."
        )
        db.add(tx)
        
    elif new_status == ReferralStatus.enrolled_international and not db_referral.enrolment_reward_paid:
        db_referral.enrolment_reward_paid = True
        reward = Decimal("750.00")
        user.wallet_balance += reward
        user.total_earned += reward
        
        tx = Transaction(
            user_id=user.id,
            type=TransactionType.credit,
            amount=reward,
            category=TransactionCategory.enrolment_reward,
            reference_id=db_referral.id,
            description=f"Reward for successful International/Master's Student Enrolment: {db_referral.lead_name}."
        )
        db.add(tx)

    db.add(db_referral)
    db.add(user)
    db.commit()
    db.refresh(db_referral)
    
    # Recalculate user tier dynamically
    update_user_tier(db, user)
    
    return db_referral


# --- Payout CRUD ---

def get_payouts_by_user(db: Session, user_id: str):
    return db.query(Payout).filter(Payout.user_id == user_id).all()

def get_all_payouts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Payout).offset(skip).limit(limit).all()

def create_payout_request(db: Session, payout: PayoutCreate, user_id: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    payout_amt = Decimal(str(payout.amount))
    
    # Enforce minimum £20 and maximum £5,000 limits
    if payout_amt < Decimal("20.00") or payout_amt > Decimal("5000.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Withdrawal amount must be between £20.00 and £5,000.00."
        )
        
    if user.wallet_balance < payout_amt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient wallet balance for withdrawal."
        )
        
    # Deduct wallet balance
    user.wallet_balance -= payout_amt
    
    # Auto-approve if under £1,000
    is_auto_approved = payout_amt < Decimal("1000.00")
    payout_status = PayoutStatus.paid if is_auto_approved else PayoutStatus.pending
    processed_at = func.now() if is_auto_approved else None
    
    db_payout = Payout(
        user_id=user_id,
        amount=payout_amt,
        payment_method=payout.payment_method,
        bank_details=payout.bank_details,
        gift_card_email=payout.gift_card_email,
        status=payout_status,
        processed_at=processed_at
    )
    db.add(db_payout)
    db.add(user)
    db.commit()
    db.refresh(db_payout)
    
    # Add audit log
    tx = Transaction(
        user_id=user_id,
        type=TransactionType.debit,
        amount=payout_amt,
        category=TransactionCategory.payout_withdrawal,
        reference_id=db_payout.id,
        description=f"Payout withdrawal request ({payout.payment_method.value}) {'auto-approved and paid' if is_auto_approved else 'created' }."
    )
    db.add(tx)
    db.commit()
    
    return db_payout

def update_payout_status(db: Session, payout_id: str, new_status: PayoutStatus, admin_id: str):
    db_payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not db_payout:
        raise HTTPException(status_code=404, detail="Payout request not found")
        
    if db_payout.status != PayoutStatus.pending:
        raise HTTPException(status_code=400, detail="Payout has already been processed")
        
    db_payout.status = new_status
    db_payout.processed_by = admin_id
    db_payout.processed_at = func.now()
    
    # If cancelled, refund back to student's wallet balance
    if new_status == PayoutStatus.cancelled:
        user = db.query(User).filter(User.id == db_payout.user_id).first()
        if user:
            user.wallet_balance += Decimal(str(db_payout.amount))
            
            tx = Transaction(
                user_id=user.id,
                type=TransactionType.credit,
                amount=db_payout.amount,
                category=TransactionCategory.bonus_reward,
                reference_id=db_payout.id,
                description=f"Refunded {db_payout.amount} due to cancelled payout withdrawal."
            )
            db.add(tx)
            db.add(user)
            
    db.add(db_payout)
    db.commit()
    db.refresh(db_payout)
    return db_payout


# --- Transactions CRUD ---

def get_transactions_by_user(db: Session, user_id: str):
    return db.query(Transaction).filter(Transaction.user_id == user_id).order_by(Transaction.created_at.desc()).all()


# --- Dashboard Stats Assembly ---

def get_ambassador_dashboard_stats(db: Session, user_id: str):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Count total leads and enrolments
    leads_count = db.query(Referral).filter(
        Referral.referrer_id == user_id
    ).count()
    
    enrolments_count = db.query(Referral).filter(
        Referral.referrer_id == user_id,
        Referral.status.in_([ReferralStatus.enrolled_home, ReferralStatus.enrolled_international])
    ).count()
    
    valid_leads_count = db.query(Referral).filter(
        Referral.referrer_id == user_id,
        Referral.status.in_([
            ReferralStatus.validated,
            ReferralStatus.application_submitted,
            ReferralStatus.offer_made,
            ReferralStatus.enrolled_home,
            ReferralStatus.enrolled_international
        ])
    ).count()
    
    # Load configurable thresholds from DB
    configs = get_tier_configs(db)
    thresholds = {c.tier: int(c.leads_required) for c in configs}

    bronze_leads = thresholds.get(AmbassadorTier.bronze, 10)
    silver_leads = thresholds.get(AmbassadorTier.silver, 25)
    gold_leads = thresholds.get(AmbassadorTier.gold, 50)
    platinum_leads = thresholds.get(AmbassadorTier.platinum, 100)

    # Calculate leads to next tier dynamically
    leads_to_next = 0
    if valid_leads_count < bronze_leads:
        leads_to_next = bronze_leads - valid_leads_count
    elif valid_leads_count < silver_leads:
        leads_to_next = silver_leads - valid_leads_count
    elif valid_leads_count < gold_leads:
        leads_to_next = gold_leads - valid_leads_count
    elif valid_leads_count < platinum_leads:
        leads_to_next = platinum_leads - valid_leads_count
        
    # Build activities list
    txs = get_transactions_by_user(db, user_id)
    recent_activity = []
    for tx in txs[:10]: # Limit to last 10
        recent_activity.append({
            "id": tx.id,
            "type": tx.type.value,
            "category": tx.category.value,
            "amount": float(tx.amount),
            "description": tx.description,
            "created_at": tx.created_at.isoformat() if tx.created_at else None
        })
        
    return {
        "total_earned": user.total_earned,
        "wallet_balance": user.wallet_balance,
        "total_leads": leads_count,
        "total_enrolments": enrolments_count,
        "tier": user.tier,
        "leads_to_next_tier": leads_to_next,
        "referral_code": user.referral_code,
        "recent_activity": recent_activity,
        "tier_configs": configs
    }

def update_user_profile(db: Session, user_id: str, user_update):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.bank_details is not None:
        user.bank_details = user_update.bank_details
    if user_update.password is not None:
        user.password_hash = get_password_hash(user_update.password)
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def set_user_tier_manually(db: Session, user_id: str, new_tier: AmbassadorTier, admin_id: str, note: str = None):
    """Admin override: manually set an ambassador's tier, bypassing auto lead-count logic."""
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot change tier of an admin user")

    old_tier = user.tier.value if user.tier else "standard"
    user.tier = new_tier

    audit_note = note or f"Admin manually set tier from {old_tier} to {new_tier.value}."
    tx = Transaction(
        user_id=user.id,
        type=TransactionType.credit,
        amount=Decimal("0.00"),
        category=TransactionCategory.bonus_reward,
        reference_id=admin_id,
        description=f"[ADMIN OVERRIDE] {audit_note}"
    )
    db.add(tx)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_admin_dashboard_stats(db: Session):
    total_referrals = db.query(Referral).count()
    
    import datetime
    one_week_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    referrals_this_week = db.query(Referral).filter(Referral.created_at >= one_week_ago).count()
    
    pending_reviews = db.query(Review).filter(Review.status == ReviewStatus.pending).count()
    
    # Payouts processed this month
    first_day_of_month = datetime.datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    payouts_this_month = db.query(func.sum(Payout.amount)).filter(
        Payout.status == PayoutStatus.paid,
        Payout.processed_at >= first_day_of_month
    ).scalar() or 0.00
    
    new_ambassadors = db.query(User).filter(
        User.role == UserRole.student,
        User.created_at >= one_week_ago
    ).count()
    
    # Recent activities (last 5 referrals, 5 paid payouts, 5 reviews)
    recent_referrals = db.query(Referral).order_by(Referral.created_at.desc()).limit(5).all()
    recent_payouts = db.query(Payout).filter(Payout.status == PayoutStatus.paid).order_by(Payout.processed_at.desc()).limit(5).all()
    recent_reviews = db.query(Review).order_by(Review.created_at.desc()).limit(5).all()
    
    activities = []
    for r in recent_referrals:
        activities.append({
            "type": "referral",
            "title": f"New Lead Submitted" if r.status == ReferralStatus.submitted else f"Lead: {r.status.value}",
            "description": f"Referred {r.lead_name}.",
            "time": r.created_at.isoformat() if r.created_at else None,
            "timestamp": r.created_at
        })
        
    for p in recent_payouts:
        activities.append({
            "type": "payout",
            "title": f"Payout Processed: £{p.amount}",
            "description": f"Paid to user ID: {p.user_id}",
            "time": p.processed_at.isoformat() if p.processed_at else None,
            "timestamp": p.processed_at
        })
        
    for rv in recent_reviews:
        activities.append({
            "type": "review",
            "title": f"New Review Submitted",
            "description": f"On {rv.platform.value} by user ID: {rv.user_id}",
            "time": rv.created_at.isoformat() if rv.created_at else None,
            "timestamp": rv.created_at
        })
        
    activities.sort(key=lambda x: x["timestamp"] if x["timestamp"] else datetime.datetime.min, reverse=True)
    
    top_ambassadors = db.query(User).filter(User.role == UserRole.student).order_by(User.total_earned.desc()).limit(5).all()
    top_ambassadors_list = []
    for amb in top_ambassadors:
        top_ambassadors_list.append({
            "full_name": amb.full_name,
            "email": amb.email,
            "total_earned": float(amb.total_earned),
            "tier": amb.tier.value,
            "wallet_balance": float(amb.wallet_balance)
        })
        
    return {
        "total_referrals": total_referrals,
        "referrals_this_week": referrals_this_week,
        "pending_reviews": pending_reviews,
        "payouts_this_month": float(payouts_this_month),
        "new_ambassadors": new_ambassadors,
        "recent_activity": activities[:10],
        "top_ambassadors": top_ambassadors_list
    }


def cleanup_expired_leads(db: Session):
    import datetime
    now = datetime.datetime.utcnow()
    
    # 1. Submitted > 7 days -> Auto-reject
    submitted_expiry = now - datetime.timedelta(days=7)
    expired_submitted = db.query(Referral).filter(
        Referral.status == ReferralStatus.submitted,
        Referral.created_at <= submitted_expiry
    ).all()
    for ref in expired_submitted:
        ref.status = ReferralStatus.rejected
        # We can store notes if needed, let's append to a notes string or just set the status.
        # Since Referral doesn't have a notes field, wait...
        # Let's check Referral fields in models.py: it does NOT have a notes field.
        # So we just update status to rejected.
        db.add(ref)
        
    # 2. Contacted (validated) > 30 days -> Move to Dormant/Rejected
    validated_expiry = now - datetime.timedelta(days=30)
    expired_validated = db.query(Referral).filter(
        Referral.status == ReferralStatus.validated,
        Referral.updated_at <= validated_expiry
    ).all()
    for ref in expired_validated:
        ref.status = ReferralStatus.rejected
        db.add(ref)
        
    # 3. Application Started (application_submitted) > 90 days -> Close
    app_expiry = now - datetime.timedelta(days=90)
    expired_apps = db.query(Referral).filter(
        Referral.status == ReferralStatus.application_submitted,
        Referral.updated_at <= app_expiry
    ).all()
    for ref in expired_apps:
        ref.status = ReferralStatus.rejected
        db.add(ref)
        
    # 4. Offer Issued (offer_made) > 60 days -> Expire
    offer_expiry = now - datetime.timedelta(days=60)
    expired_offers = db.query(Referral).filter(
        Referral.status == ReferralStatus.offer_made,
        Referral.updated_at <= offer_expiry
    ).all()
    for ref in expired_offers:
        ref.status = ReferralStatus.rejected
        db.add(ref)
        
    db.commit()
    return {
        "expired_submitted": len(expired_submitted),
        "expired_validated": len(expired_validated),
        "expired_applications": len(expired_apps),
        "expired_offers": len(expired_offers)
    }


def apply_enrolment_clawback(db: Session, referral_id: str, admin_id: str):
    db_referral = db.query(Referral).filter(Referral.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")
        
    if not db_referral.enrolment_reward_paid:
        raise HTTPException(status_code=400, detail="Enrolment reward has not been paid for this referral")
        
    # Verify if it was enrolled within the 14 days statutory cooling-off period
    import datetime
    now = datetime.datetime.utcnow()
    # We use updated_at as the enrolment date since it was updated when status was set to enrolled
    enrolment_date = db_referral.updated_at
    if enrolment_date and (now - enrolment_date).days > 14:
        raise HTTPException(status_code=400, detail="Cannot apply clawback after 14 days of enrolment")
        
    user = db.query(User).filter(User.id == db_referral.referrer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Referrer student not found")
        
    # Determine the reward amount to reverse
    reward_to_reverse = Decimal("0.00")
    if db_referral.status == ReferralStatus.enrolled_home:
        reward_to_reverse = Decimal("500.00")
    elif db_referral.status == ReferralStatus.enrolled_international:
        reward_to_reverse = Decimal("750.00")
        
    # Debit the user wallet and total_earned
    user.wallet_balance -= reward_to_reverse
    user.total_earned -= reward_to_reverse
    db_referral.enrolment_reward_paid = False
    db_referral.status = ReferralStatus.rejected  # Reverse status to rejected/clawed back
    db_referral.verified_by = admin_id
    
    tx = Transaction(
        user_id=user.id,
        type=TransactionType.debit,
        amount=reward_to_reverse,
        category=TransactionCategory.enrolment_reward,
        reference_id=db_referral.id,
        description=f"Clawback: Enrolment reward reversed for {db_referral.lead_name} (withdrew within 14 days)."
    )
    db.add(tx)
    db.add(user)
    db.add(db_referral)
    db.commit()
    db.refresh(db_referral)
    
    # Recalculate tier
    update_user_tier(db, user)
    
    return db_referral

