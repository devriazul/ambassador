import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import app
from app.core.config import settings

# Setup isolated test database (SQLite in memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create test tables
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_register_and_login_flow():
    # 1. Register student (since database is empty, the first user becomes Admin)
    admin_payload = {
        "email": "admin@bheuni.ac.uk",
        "full_name": "Admin User",
        "password": "strongpassword123"
    }
    response = client.post("/auth/register", json=admin_payload)
    assert response.status_code == 201
    assert response.json()["email"] == "admin@bheuni.ac.uk"
    assert response.json()["role"] == "admin"
    
    # 2. Register normal student
    student_payload = {
        "email": "student@bheuni.ac.uk",
        "full_name": "Student User",
        "password": "studentpassword123"
    }
    response = client.post("/auth/register", json=student_payload)
    assert response.status_code == 201
    assert response.json()["role"] == "student"
    ref_code = response.json()["referral_code"]
    assert ref_code is not None

    # 3. Login as student
    login_payload = {
        "email": "student@bheuni.ac.uk",
        "password": "studentpassword123"
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    token = response.json()["access_token"]
    
    # Login as admin
    admin_login_payload = {
        "email": "admin@bheuni.ac.uk",
        "password": "strongpassword123"
    }
    admin_response = client.post("/auth/login", json=admin_login_payload)
    admin_token = admin_response.json()["access_token"]

    # 4. Check profile with auth headers
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Student User"

    # 5. Check dashboard stats
    response = client.get("/ambassador/stats", headers=headers)
    assert response.status_code == 200
    assert float(response.json()["wallet_balance"]) == 0.00
    assert response.json()["tier"] == "standard"

    # 6. Submit a review reward request with file upload
    import io
    review_data = {
        "platform": "google",
        "review_link": "https://google.com/review/bheuni"
    }
    mock_file = {"screenshot": ("test_screenshot.png", io.BytesIO(b"dummy image data"), "image/png")}
    response = client.post("/ambassador/reviews", data=review_data, files=mock_file, headers=headers)
    assert response.status_code == 201
    assert response.json()["status"] == "pending"
    assert response.json()["screenshot_url"].startswith("/uploads/")
    review_id = response.json()["id"]

    # 7. Try submitting duplicate platform review (should fail)
    response = client.post("/ambassador/reviews", data=review_data, files=mock_file, headers=headers)
    assert response.status_code == 400

    # 8. Approve review as admin
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.put(f"/admin/reviews/{review_id}/status", json={"status": "approved"}, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

    # 9. Verify student stats updated with review reward
    response = client.get("/ambassador/stats", headers=headers)
    assert response.status_code == 200
    assert float(response.json()["wallet_balance"]) == 10.00
    assert float(response.json()["total_earned"]) == 10.00
    assert len(response.json()["recent_activity"]) == 1
    assert response.json()["recent_activity"][0]["category"] == "review_reward"

    # 10. Submit a referral lead
    referral_payload = {
        "lead_name": "Prospective Lead",
        "lead_email": "lead@gmail.com",
        "lead_phone": "07123456789",
        "education_interest": "Computer Science BSc"
    }
    response = client.post("/ambassador/referrals", json=referral_payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["status"] == "submitted"
    referral_id = response.json()["id"]

    # 11. Validate referral lead (reward £5)
    response = client.put(f"/admin/referrals/{referral_id}/status", json={"status": "validated"}, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "validated"

    # Verify wallet has £10 + £5 = £15
    response = client.get("/ambassador/stats", headers=headers)
    assert response.status_code == 200
    assert float(response.json()["wallet_balance"]) == 15.00

    # 12. Complete enrolment as International Student (reward £750)
    response = client.put(f"/admin/referrals/{referral_id}/status", json={"status": "enrolled_international"}, headers=admin_headers)
    assert response.status_code == 200
    
    # Verify wallet has £15 + £750 = £765
    response = client.get("/ambassador/stats", headers=headers)
    assert response.status_code == 200
    assert float(response.json()["wallet_balance"]) == 765.00


def test_dynamic_tier_parameter_change():
    # 1. Register Admin
    admin_payload = {
        "email": "admin2@bheuni.ac.uk",
        "full_name": "Admin User 2",
        "password": "strongpassword123"
    }
    response = client.post("/auth/register", json=admin_payload)
    assert response.status_code == 201
    
    # 2. Register normal student
    student_payload = {
        "email": "student2@bheuni.ac.uk",
        "full_name": "Student User 2",
        "password": "studentpassword123"
    }
    response = client.post("/auth/register", json=student_payload)
    assert response.status_code == 201

    # Login admin & student
    admin_token = client.post("/auth/login", json={"email": "admin2@bheuni.ac.uk", "password": "strongpassword123"}).json()["access_token"]
    student_token = client.post("/auth/login", json={"email": "student2@bheuni.ac.uk", "password": "studentpassword123"}).json()["access_token"]

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 3. Submit a referral lead & validate it (validated lead count = 1)
    referral_payload = {
        "lead_name": "Prospective Lead 2",
        "lead_email": "lead2@gmail.com",
        "lead_phone": "07123456789",
        "education_interest": "Computer Science BSc"
    }
    resp_ref = client.post("/ambassador/referrals", json=referral_payload, headers=student_headers)
    ref_id = resp_ref.json()["id"]
    client.put(f"/admin/referrals/{ref_id}/status", json={"status": "validated"}, headers=admin_headers)

    # 4. Verify student is Standard tier (since Bronze threshold is default 10 leads)
    stats_resp = client.get("/ambassador/stats", headers=student_headers)
    assert stats_resp.json()["tier"] == "standard"
    assert float(stats_resp.json()["wallet_balance"]) == 5.00  # Lead validation reward is £5

    # 5. Fetch current tier configs
    configs_resp = client.get("/admin/tier-configs", headers=admin_headers)
    assert configs_resp.status_code == 200
    configs = configs_resp.json()
    # Find Bronze config
    bronze_cfg = next(c for c in configs if c["tier"] == "bronze")
    assert bronze_cfg["leads_required"] == 10
    assert float(bronze_cfg["bonus_amount"]) == 25.00

    # 6. Admin updates Bronze threshold from 10 to 1 lead
    update_payload = {
        "leads_required": 1,
        "bonus_amount": 25.00
    }
    update_resp = client.put("/admin/tier-configs/bronze", json=update_payload, headers=admin_headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["leads_required"] == 1

    # 7. Student tier should be automatically recalculated to Bronze, awarding the £25 bonus!
    stats_resp = client.get("/ambassador/stats", headers=student_headers)
    assert stats_resp.json()["tier"] == "bronze"
    # Balance should be £5 (validated lead) + £25 (Bronze bonus) = £30
    assert float(stats_resp.json()["wallet_balance"]) == 30.00
    assert float(stats_resp.json()["total_earned"]) == 30.00

def test_compliance_clawback_and_cleanup():
    # 1. Register admin and student
    admin_payload = {
        "email": "admin_comp@bheuni.ac.uk",
        "full_name": "Admin Compliance",
        "password": "strongpassword123"
    }
    client.post("/auth/register", json=admin_payload)
    
    student_payload = {
        "email": "student_comp@bheuni.ac.uk",
        "full_name": "Student Compliance",
        "password": "studentpassword123"
    }
    client.post("/auth/register", json=student_payload)

    admin_token = client.post("/auth/login", json={"email": "admin_comp@bheuni.ac.uk", "password": "strongpassword123"}).json()["access_token"]
    student_token = client.post("/auth/login", json={"email": "student_comp@bheuni.ac.uk", "password": "studentpassword123"}).json()["access_token"]

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 2. Submit referral lead
    referral_payload = {
        "lead_name": "Clawback Lead",
        "lead_email": "clawback@gmail.com",
        "lead_phone": "07123456789",
        "education_interest": "Business Management BA"
    }
    resp = client.post("/ambassador/referrals", json=referral_payload, headers=student_headers)
    ref_id = resp.json()["id"]

    # 3. Set to enrolled_home
    client.put(f"/admin/referrals/{ref_id}/status", json={"status": "enrolled_home"}, headers=admin_headers)

    # 4. Verify wallet balance has lead reward (£5) + enrolment reward (£500) = £505
    stats_resp = client.get("/ambassador/stats", headers=student_headers)
    assert float(stats_resp.json()["wallet_balance"]) == 505.00

    # 5. Apply clawback (within 14 days)
    clawback_resp = client.post(f"/admin/referrals/{ref_id}/clawback", headers=admin_headers)
    assert clawback_resp.status_code == 200

    # 6. Verify wallet balance debited to £5 (lead reward remains)
    stats_resp = client.get("/ambassador/stats", headers=student_headers)
    assert float(stats_resp.json()["wallet_balance"]) == 5.00
    assert float(stats_resp.json()["total_earned"]) == 5.00

    # 7. Test cleanup logic by backdating a referral
    from datetime import datetime, timedelta
    from app.models import Referral
    
    db = next(override_get_db())
    # Submit another referral
    ref_payload_2 = {
        "lead_name": "Expired Lead",
        "lead_email": "expired@gmail.com",
        "lead_phone": "07123456789",
        "education_interest": "Business Management BA"
    }
    resp_2 = client.post("/ambassador/referrals", json=ref_payload_2, headers=student_headers)
    ref_id_2 = resp_2.json()["id"]

    # Backdate it by 8 days so it expires under the 7 days rule
    db_ref = db.query(Referral).filter(Referral.id == ref_id_2).first()
    db_ref.created_at = datetime.utcnow() - timedelta(days=8)
    db.commit()

    # Call cleanup endpoint
    cleanup_resp = client.post("/admin/leads/cleanup", headers=admin_headers)
    assert cleanup_resp.status_code == 200
    assert cleanup_resp.json()["expired_submitted"] == 1

    # Verify referral status is now rejected
    ref_check = client.get("/ambassador/referrals", headers=student_headers).json()
    ref_status = next(r for r in ref_check if r["id"] == ref_id_2)["status"]
    assert ref_status == "rejected"


def test_google_login_flow():
    # Register first user (admin) so the Google user will be a student
    client.post("/auth/register", json={
        "email": "system_admin@bheuni.ac.uk",
        "full_name": "System Admin",
        "password": "strongpassword123"
    })

    # 1. Google sign-in/up (new user)
    google_payload = {
        "credential": "mock_google-user@example.com_Google User Name"
    }
    response = client.post("/auth/google", json=google_payload)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None

    # 2. Verify /auth/me info
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "google-user@example.com"
    assert response.json()["full_name"] == "Google User Name"
    assert response.json()["role"] == "student"

    # 3. Google sign-in again (existing user)
    response2 = client.post("/auth/google", json=google_payload)
    assert response2.status_code == 200
    token2 = response2.json()["access_token"]
    assert token2 is not None


def test_otp_registration_flow():
    # Register first user (admin) so that the subsequent registrants will be standard students
    client.post("/auth/register", json={
        "email": "system_admin_otp@bheuni.ac.uk",
        "full_name": "System Admin OTP",
        "password": "strongpassword123"
    })

    email = "ambassador_otp@bheuni.ac.uk"
    full_name = "Ambassador OTP User"

    # 1. Initiate registration
    response = client.post("/auth/register/initiate", json={
        "email": email,
        "full_name": full_name
    })
    assert response.status_code == 200

    # 2. Query DB to get the generated OTP code
    db = next(override_get_db())
    from app.models import OTPVerification
    otp_entry = db.query(OTPVerification).filter(OTPVerification.email == email).first()
    assert otp_entry is not None
    otp_code = otp_entry.otp_code

    # 3. Verify OTP
    response = client.post("/auth/register/verify", json={
        "email": email,
        "otp": otp_code
    })
    assert response.status_code == 200
    verification_token = response.json()["verification_token"]
    assert verification_token is not None

    # 4. Complete registration (Set Password)
    response = client.post("/auth/register/complete", json={
        "email": email,
        "verification_token": verification_token,
        "password": "securepassword123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None

    # 5. Check user details
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == email
    assert response.json()["full_name"] == full_name
    assert response.json()["role"] == "student"


