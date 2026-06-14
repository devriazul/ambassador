# BHE Uni Ambassador & Rewards Programme - Backend API

The backend API for the **BHE Uni Ambassador & Rewards Programme Affiliate Platform**. This application is built using **FastAPI**, **SQLAlchemy**, and **SQLite** (or PostgreSQL/MySQL in production) to handle user registrations, referral submissions, rewards calculations, payout processing, and administrator-level compliance tasks.

---

## 🚀 Key Features

- **Robust Authentication**: JWT-based login and signup for ambassadors and administrators.
- **Ambassador Dashboard Endpoints**: 
  - Submitting lead referrals.
  - Fetching personalized statistics (total earned, pending, approved, and progress toward next tier).
  - Requesting reward payouts.
- **Admin Management Portal**:
  - Global overview of ambassadors, referral leads, and payout requests.
  - Interactive tier settings configuration.
- **System Compliance & Maintenance**:
  - **Statutory 14-Day Reversal (Clawback)**: Admins can reverse enrolment rewards if a student withdraws/cancels within the statutory cooling-off window.
  - **Automated Expired Lead Cleanup**: Removes or transitions expired, dormant, and closed leads to maintain database health.

---

## 🛠 Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database ORM**: SQLAlchemy & Alembic
- **Database**: SQLite (default for development), support for PostgreSQL/MySQL
- **Testing**: Pytest & HTTPX

---

## 📂 Project Structure

```
affiliate-backend/
├── app/
│   ├── api/            # API Endpoints (auth, ambassador, admin)
│   ├── core/           # Configuration, security, and database engine
│   ├── crud/           # Database operations helper modules
│   ├── models/         # SQLAlchemy DB models (User, Referral, PayoutRequest, etc.)
│   ├── schemas/        # Pydantic schemas for request/response validation
│   ├── main.py         # Application entry point
│   └── seed.py         # Database seeding script for development
├── tests/              # Test suite (integration & compliance tests)
├── requirements.txt    # Python dependencies
└── README.md           # Backend Documentation
```

---

## ⚙️ Installation & Setup

### 1. Clone & Set Up Environment
Create a virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Database Seeding
To populate your database with dummy admin, ambassador, and referral data:
```bash
python3 -m app.seed
```

### 4. Running the Development Server
Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Access the API homepage: [http://localhost:8000/](http://localhost:8000/)
- Access interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Integration Tests

To run the automated compliance and integration test suite (covering lead expiry cleanup, payout processes, and reward clawbacks):
```bash
PYTHONPATH=. pytest
```
