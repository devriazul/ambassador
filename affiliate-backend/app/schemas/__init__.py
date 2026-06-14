from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime
from app.models import UserRole, AmbassadorTier, ReviewPlatform, ReviewStatus, ReferralStatus, PayoutStatus, PayoutMethod, TransactionType, TransactionCategory

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserGoogleLogin(BaseModel):
    credential: str

class UserRegisterInitiate(BaseModel):
    email: EmailStr
    full_name: str

class UserRegisterVerify(BaseModel):
    email: EmailStr
    otp: str

class UserRegisterComplete(BaseModel):
    email: EmailStr
    verification_token: str
    password: str

class UserResponse(UserBase):
    id: str
    role: UserRole
    tier: AmbassadorTier
    referral_code: str
    wallet_balance: Decimal
    total_earned: Decimal
    bank_details: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bank_details: Optional[Dict[str, Any]] = None
    password: Optional[str] = None


class TierUpdate(BaseModel):
    tier: AmbassadorTier
    note: Optional[str] = None  # Optional admin note for audit trail


# Review Schemas
class ReviewBase(BaseModel):
    platform: ReviewPlatform
    review_link: str
    screenshot_url: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    status: ReviewStatus
    reward_amount: Decimal
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewUpdateStatus(BaseModel):
    status: ReviewStatus

# Referral Schemas
class ReferralBase(BaseModel):
    lead_name: str
    lead_email: EmailStr
    lead_phone: Optional[str] = None
    education_interest: Optional[str] = None

class ReferralCreate(ReferralBase):
    pass

class ReferralResponse(ReferralBase):
    id: str
    referrer_id: str
    status: ReferralStatus
    lead_reward_paid: bool
    enrolment_reward_paid: bool
    verified_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReferralUpdateStatus(BaseModel):
    status: ReferralStatus

# Payout Schemas
class PayoutBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    payment_method: PayoutMethod
    bank_details: Optional[Dict[str, Any]] = None
    gift_card_email: Optional[EmailStr] = None

class PayoutCreate(PayoutBase):
    pass

class PayoutResponse(PayoutBase):
    id: str
    user_id: str
    status: PayoutStatus
    processed_by: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PayoutUpdateStatus(BaseModel):
    status: PayoutStatus

# Transaction Schemas
class TransactionResponse(BaseModel):
    id: str
    user_id: str
    type: TransactionType
    amount: Decimal
    category: TransactionCategory
    reference_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Tier Config Schemas
class TierConfigResponse(BaseModel):
    tier: AmbassadorTier
    leads_required: int
    bonus_amount: Decimal
    updated_at: datetime

    class Config:
        from_attributes = True

class TierConfigUpdate(BaseModel):
    leads_required: int = Field(..., gt=0, description="Number of valid leads required to reach this tier")
    bonus_amount: Decimal = Field(..., ge=0, description="Bonus amount credited when tier is achieved")

# Dashboard Stats Schemas
class AmbassadorStats(BaseModel):
    total_earned: Decimal
    wallet_balance: Decimal
    total_leads: int
    total_enrolments: int
    tier: AmbassadorTier
    leads_to_next_tier: int
    referral_code: str
    recent_activity: List[Dict[str, Any]]
    tier_configs: List[TierConfigResponse]

