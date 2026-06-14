import uuid
import enum
from sqlalchemy import Column, String, Numeric, Enum, ForeignKey, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Enums matching the database design
class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"

class AmbassadorTier(str, enum.Enum):
    standard = "standard"
    bronze = "bronze"
    silver = "silver"
    gold = "gold"
    platinum = "platinum"

class ReviewPlatform(str, enum.Enum):
    google = "google"
    trustpilot = "trustpilot"
    facebook = "facebook"

class ReviewStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class ReferralStatus(str, enum.Enum):
    submitted = "submitted"
    validated = "validated"
    application_submitted = "application_submitted"
    offer_made = "offer_made"
    enrolled_home = "enrolled_home"
    enrolled_international = "enrolled_international"
    rejected = "rejected"

class PayoutStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    cancelled = "cancelled"

class PayoutMethod(str, enum.Enum):
    bank_transfer = "bank_transfer"
    gift_card = "gift_card"

class TransactionType(str, enum.Enum):
    credit = "credit"
    debit = "debit"

class TransactionCategory(str, enum.Enum):
    review_reward = "review_reward"
    lead_reward = "lead_reward"
    enrolment_reward = "enrolment_reward"
    payout_withdrawal = "payout_withdrawal"
    bonus_reward = "bonus_reward"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student, nullable=False)
    tier = Column(Enum(AmbassadorTier), default=AmbassadorTier.standard, nullable=False)
    referral_code = Column(String(50), unique=True, index=True, nullable=False)
    wallet_balance = Column(Numeric(10, 2), default=0.00, nullable=False)
    total_earned = Column(Numeric(10, 2), default=0.00, nullable=False)
    bank_details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    reviews = relationship("Review", foreign_keys="Review.user_id", back_populates="user", cascade="all, delete-orphan")
    referrals = relationship("Referral", foreign_keys="Referral.referrer_id", back_populates="referrer", cascade="all, delete-orphan")
    payouts = relationship("Payout", foreign_keys="Payout.user_id", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    platform = Column(Enum(ReviewPlatform), nullable=False)
    review_link = Column(Text, nullable=False)
    screenshot_url = Column(Text, nullable=True)
    status = Column(Enum(ReviewStatus), default=ReviewStatus.pending, nullable=False)
    reward_amount = Column(Numeric(10, 2), default=10.00, nullable=False)
    verified_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="reviews")
    verifier = relationship("User", foreign_keys=[verified_by])


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    referrer_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lead_name = Column(String(150), nullable=False)
    lead_email = Column(String(255), nullable=False)
    lead_phone = Column(String(50), nullable=True)
    education_interest = Column(String(255), nullable=True)
    status = Column(Enum(ReferralStatus), default=ReferralStatus.submitted, nullable=False)
    lead_reward_paid = Column(Boolean, default=False, nullable=False)
    enrolment_reward_paid = Column(Boolean, default=False, nullable=False)
    verified_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], back_populates="referrals")
    verifier = relationship("User", foreign_keys=[verified_by])


class Payout(Base):
    __tablename__ = "payouts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(Enum(PayoutMethod), nullable=False)
    status = Column(Enum(PayoutStatus), default=PayoutStatus.pending, nullable=False)
    bank_details = Column(JSON, nullable=True)
    gift_card_email = Column(String(255), nullable=True)
    processed_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="payouts")
    processor = relationship("User", foreign_keys=[processed_by])


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    category = Column(Enum(TransactionCategory), nullable=False)
    reference_id = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")

class TierConfig(Base):
    """Stores configurable thresholds and bonus amounts for each ambassador tier level."""
    __tablename__ = "tier_configs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tier = Column(Enum(AmbassadorTier), unique=True, nullable=False)
    leads_required = Column(String, nullable=False)  # stored as string to support int in SQLite
    bonus_amount = Column(Numeric(10, 2), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    otp_code = Column(String(10), nullable=False)
    verification_token = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)

