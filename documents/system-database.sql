
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(100),
    university VARCHAR(255),
    country VARCHAR(100) NOT NULL,
    course_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'ambassador',
    identity_verified BOOLEAN DEFAULT FALSE,
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_sort_code VARCHAR(20),
    paypal_email VARCHAR(255),
    fraud_flag BOOLEAN DEFAULT FALSE,
    fraud_flag_reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100),
    study_interest VARCHAR(255),
    intended_intake VARCHAR(50),
    consent_given BOOLEAN DEFAULT FALSE,
    consent_timestamp TIMESTAMP,
    status VARCHAR(50) DEFAULT 'submitted',
    crm_lead_id VARCHAR(255),
    university_app_id VARCHAR(255),
    fraud_score INTEGER DEFAULT 0,
    ai_lead_score INTEGER,
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    contacted_at TIMESTAMP,
    application_started_at TIMESTAMP,
    offer_issued_at TIMESTAMP,
    enrolled_at TIMESTAMP,
    expires_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enrolments table
CREATE TABLE enrolments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL UNIQUE REFERENCES leads(id),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    student_category VARCHAR(50) NOT NULL,
    tuition_fees DECIMAL(10,2),
    commission_earned DECIMAL(10,2),
    enrolment_date TIMESTAMP NOT NULL,
    withdrawal_date TIMESTAMP,
    reward_paid BOOLEAN DEFAULT FALSE,
    reward_paid_at TIMESTAMP,
    clawback_applied BOOLEAN DEFAULT FALSE,
    clawback_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- REWARDS & FINANCIAL TABLES
-- =============================================

-- Rewards table
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    lead_id UUID REFERENCES leads(id),
    reward_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL UNIQUE REFERENCES users(id),
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    pending_balance DECIMAL(10,2) DEFAULT 0.00,
    lifetime_earned DECIMAL(10,2) DEFAULT 0.00,
    lifetime_withdrawn DECIMAL(10,2) DEFAULT 0.00,
    negative_balance BOOLEAN DEFAULT FALSE,
    last_updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'requested',
    payment_method VARCHAR(50) NOT NULL,
    bank_account_name VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_sort_code VARCHAR(20),
    paypal_email VARCHAR(255),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,
    notes TEXT,
    requested_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- GAMIFICATION TABLES
-- =============================================

-- User levels table
CREATE TABLE user_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    level VARCHAR(50) NOT NULL,
    leads_required INTEGER NOT NULL,
    cumulative_leads INTEGER NOT NULL,
    bonus_amount DECIMAL(10,2) NOT NULL,
    reward_id UUID REFERENCES rewards(id),
    certificate_generated BOOLEAN DEFAULT FALSE,
    certificate_url VARCHAR(500),
    merchandise_shipped BOOLEAN DEFAULT FALSE,
    merchandise_tracking VARCHAR(255),
    social_media_featured BOOLEAN DEFAULT FALSE,
    hall_of_fame_added BOOLEAN DEFAULT FALSE,
    achieved_at TIMESTAMP DEFAULT NOW()
);

-- Ambassador stats table
CREATE TABLE ambassador_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL UNIQUE REFERENCES users(id),
    total_leads INTEGER DEFAULT 0,
    valid_leads INTEGER DEFAULT 0,
    rejected_leads INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    offers INTEGER DEFAULT 0,
    enrolments INTEGER DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    current_level VARCHAR(50) DEFAULT 'none',
    next_level_leads_needed INTEGER,
    current_month_leads INTEGER DEFAULT 0,
    current_quarter_leads INTEGER DEFAULT 0,
    rank_global INTEGER,
    rank_monthly INTEGER,
    last_updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    platform VARCHAR(50) NOT NULL,
    review_url VARCHAR(500),
    screenshot_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    reward_id UUID REFERENCES rewards(id),
    submitted_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- =============================================
-- AUDIT & LOGGING TABLES
-- =============================================

-- Lead status history
CREATE TABLE lead_status_history (
    id BIGSERIAL PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    notes TEXT
);

-- Audit logs
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fraud alerts
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID NOT NULL REFERENCES users(id),
    lead_id UUID REFERENCES leads(id),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- REFERENCE TABLES
-- =============================================

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    api_endpoint VARCHAR(500),
    api_key VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    prize VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES (Performance)
-- =============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_university ON users(university);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_leads_ambassador_id ON leads(ambassador_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_crm_lead_id ON leads(crm_lead_id);
CREATE INDEX idx_leads_submitted_at ON leads(submitted_at);
CREATE INDEX idx_leads_expires_at ON leads(expires_at);

CREATE INDEX idx_enrolments_ambassador_id ON enrolments(ambassador_id);
CREATE INDEX idx_enrolments_lead_id ON enrolments(lead_id);
CREATE INDEX idx_enrolments_enrolment_date ON enrolments(enrolment_date);

CREATE INDEX idx_rewards_ambassador_id ON rewards(ambassador_id);
CREATE INDEX idx_rewards_lead_id ON rewards(lead_id);
CREATE INDEX idx_rewards_status ON rewards(status);
CREATE INDEX idx_rewards_created_at ON rewards(created_at);

CREATE INDEX idx_wallets_ambassador_id ON wallets(ambassador_id);
CREATE INDEX idx_wallets_current_balance ON wallets(current_balance);

CREATE INDEX idx_withdrawals_ambassador_id ON withdrawals(ambassador_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_requested_at ON withdrawals(requested_at);

CREATE INDEX idx_user_levels_ambassador_id ON user_levels(ambassador_id);
CREATE INDEX idx_user_levels_level ON user_levels(level);

CREATE INDEX idx_ambassador_stats_total_leads ON ambassador_stats(total_leads DESC);
CREATE INDEX idx_ambassador_stats_current_level ON ambassador_stats(current_level);

CREATE INDEX idx_reviews_ambassador_id ON reviews(ambassador_id);
CREATE INDEX idx_reviews_verification_status ON reviews(verification_status);

CREATE INDEX idx_lead_status_history_lead_id ON lead_status_history(lead_id);
CREATE INDEX idx_lead_status_history_changed_at ON lead_status_history(changed_at);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_fraud_alerts_ambassador_id ON fraud_alerts(ambassador_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_created_at ON fraud_alerts(created_at);

