import sys
import os
from sqlalchemy.orm import Session

# Add current folder to python path for standalone execution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.models import User, Referral, Review, Payout, Transaction, UserRole, AmbassadorTier, ReviewStatus, ReferralStatus, PayoutStatus, PayoutMethod, TransactionType, TransactionCategory
from app.core.security import get_password_hash
from decimal import Decimal

def seed_db():
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Seeding users...")
        # 1. Create Admin
        admin = User(
            email="admin@bheuni.ac.uk",
            password_hash=get_password_hash("adminpassword123"),
            full_name="Admin Director",
            role=UserRole.admin,
            referral_code="ADMN101"
        )
        db.add(admin)

        # 2. Create Student / Ambassador
        student = User(
            email="student@bheuni.ac.uk",
            password_hash=get_password_hash("studentpassword123"),
            full_name="Alex Morgan",
            role=UserRole.student,
            referral_code="ALEX888",
            wallet_balance=Decimal("125.00"),
            total_earned=Decimal("2150.00"),
            tier=AmbassadorTier.gold
        )
        db.add(student)
        db.commit()
        db.refresh(admin)
        db.refresh(student)

        print("Seeding reviews...")
        # Add Google Review (Approved) -> rewarded £10
        google_review = Review(
            user_id=student.id,
            platform="google",
            review_link="https://maps.google.com/review/bheuni",
            status=ReviewStatus.approved,
            reward_amount=Decimal("10.00"),
            verified_by=admin.id
        )
        db.add(google_review)

        # Add Trustpilot Review (Pending)
        trustpilot_review = Review(
            user_id=student.id,
            platform="trustpilot",
            review_link="https://trustpilot.com/review/bheuni",
            status=ReviewStatus.pending,
            reward_amount=Decimal("10.00")
        )
        db.add(trustpilot_review)

        print("Seeding referrals...")
        # 1. Enrolled UK Home student referral (Sarah Jenkins) -> rewarded £5 (lead) + £500 (enrolment)
        ref1 = Referral(
            referrer_id=student.id,
            lead_name="Sarah Jenkins",
            lead_email="sarah.jenkins@gmail.com",
            lead_phone="07222334455",
            education_interest="BSc Computer Science",
            status=ReferralStatus.enrolled_home,
            lead_reward_paid=True,
            enrolment_reward_paid=True,
            verified_by=admin.id
        )
        db.add(ref1)

        # 2. Enrolled International student referral (David Chen) -> rewarded £5 (lead) + £750 (enrolment)
        ref2 = Referral(
            referrer_id=student.id,
            lead_name="David Chen",
            lead_email="david.chen@yahoo.com",
            lead_phone="+8613912345678",
            education_interest="MSc Finance",
            status=ReferralStatus.enrolled_international,
            lead_reward_paid=True,
            enrolment_reward_paid=True,
            verified_by=admin.id
        )
        db.add(ref2)

        # 3. Validated Lead Referral (James Smith) -> rewarded £5 (lead)
        ref3 = Referral(
            referrer_id=student.id,
            lead_name="James Smith",
            lead_email="james.smith@hotmail.com",
            education_interest="BA Marketing",
            status=ReferralStatus.validated,
            lead_reward_paid=True,
            verified_by=admin.id
        )
        db.add(ref3)

        # 4. Submitted Lead (Chloe Kim) -> pending reward
        ref4 = Referral(
            referrer_id=student.id,
            lead_name="Chloe Kim",
            lead_email="chloe.kim@gmail.com",
            education_interest="BSc Psychology",
            status=ReferralStatus.submitted
        )
        db.add(ref4)

        print("Seeding payouts...")
        # Processed Payout withdrawal -> £1000
        payout1 = Payout(
            user_id=student.id,
            amount=Decimal("1000.00"),
            payment_method=PayoutMethod.bank_transfer,
            status=PayoutStatus.paid,
            bank_details={
                "holder_name": "Alex Morgan",
                "sort_code": "20-45-14",
                "account_number": "12345678"
            },
            processed_by=admin.id
        )
        db.add(payout1)

        # Pending Payout withdrawal -> £20
        payout2 = Payout(
            user_id=student.id,
            amount=Decimal("20.00"),
            payment_method=PayoutMethod.gift_card,
            gift_card_email="student@bheuni.ac.uk",
            status=PayoutStatus.pending
        )
        db.add(payout2)

        print("Seeding audit transaction logs...")
        # Google review reward
        tx1 = Transaction(
            user_id=student.id,
            type=TransactionType.credit,
            amount=Decimal("10.00"),
            category=TransactionCategory.review_reward,
            description="Reward for approved google review."
        )
        db.add(tx1)

        # Sarah Jenkins Lead
        tx2 = Transaction(
            user_id=student.id,
            type=TransactionType.credit,
            amount=Decimal("5.00"),
            category=TransactionCategory.lead_reward,
            description="Reward for validated lead referral: Sarah Jenkins."
        )
        db.add(tx2)

        # Sarah Jenkins Enrolment
        tx3 = Transaction(
            user_id=student.id,
            type=TransactionType.credit,
            amount=Decimal("500.00"),
            category=TransactionCategory.enrolment_reward,
            description="Reward for successful UK Home Student Enrolment: Sarah Jenkins."
        )
        db.add(tx3)

        # David Chen Lead
        tx4 = Transaction(
            user_id=student.id,
            type=TransactionType.credit,
            amount=Decimal("5.00"),
            category=TransactionCategory.lead_reward,
            description="Reward for validated lead referral: David Chen."
        )
        db.add(tx4)

        # David Chen Enrolment
        tx5 = Transaction(
            user_id=student.id,
            type=TransactionType.credit,
            amount=Decimal("750.00"),
            category=TransactionCategory.enrolment_reward,
            description="Reward for successful International/Master's Student Enrolment: David Chen."
        )
        db.add(tx5)

        # James Smith Lead
        tx6 = Transaction(
            user_id=student.id,
            type=TransactionType.credit,
            amount=Decimal("5.00"),
            category=TransactionCategory.lead_reward,
            description="Reward for validated lead referral: James Smith."
        )
        db.add(tx6)

        # Payout Debit
        tx7 = Transaction(
            user_id=student.id,
            type=TransactionType.debit,
            amount=Decimal("1000.00"),
            category=TransactionCategory.payout_withdrawal,
            description="Payout withdrawal request (bank_transfer) created."
        )
        db.add(tx7)

        # Payout Debit 2
        tx8 = Transaction(
            user_id=student.id,
            type=TransactionType.debit,
            amount=Decimal("20.00"),
            category=TransactionCategory.payout_withdrawal,
            description="Payout withdrawal request (gift_card) created."
        )
        db.add(tx8)

        # Seed initial bonus credits to balance out the totals (Total = 1275, Available = 125, Processed = 1020)
        # Total Credits: 10 + 5 + 500 + 5 + 750 + 5 = 1275. Debits: 1020. Available: 255. Let's adjust student balance.
        # We set wallet_balance=125, so we add a debit adjustment to keep things completely synced.
        student.wallet_balance = Decimal("255.00")
        student.total_earned = Decimal("1275.00")
        db.add(student)

        db.commit()
        print("Database seeded successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
