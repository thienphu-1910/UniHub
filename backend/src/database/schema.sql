-- UniHub Workshop Database Schema (PostgreSQL)
-- Chỉ bao gồm cấu trúc bảng (Tables), kiểu dữ liệu (ENUMs) và ràng buộc (Constraints)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CREATE ENUM TYPES
CREATE TYPE user_role_enum AS ENUM ('student', 'organizer', 'checkin_staff');
CREATE TYPE summary_status_enum AS ENUM ('none', 'processing', 'completed', 'failed');
CREATE TYPE workshop_status_enum AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE registration_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'checked_in');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'success', 'failed');
CREATE TYPE import_status_enum AS ENUM ('running', 'completed', 'failed');

-- 2. CREATE TABLES

-- Bảng: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    password_hash TEXT,
    fcm_token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: workshops
CREATE TABLE workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    ai_summary TEXT,
    summary_status summary_status_enum DEFAULT 'none',
    speaker JSONB,
    room VARCHAR(100) NOT NULL,
    room_diagram JSONB,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL,
    available_slots INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    price DECIMAL(12,2) DEFAULT 0,
    status workshop_status_enum DEFAULT 'scheduled',
    pdf_file_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN default true,
    registration_start_time TIMESTAMPTZ NOT NULL,
    registration_end_time TIMESTAMPTZ NOT NULL,
    
    CONSTRAINT check_available_slots CHECK (available_slots >= 0 AND available_slots <= capacity)
);

-- Bảng: registrations
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
    status registration_status_enum NOT NULL DEFAULT 'pending',
    qr_code TEXT UNIQUE,
    qr_code_url TEXT,
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    CONSTRAINT unique_user_workshop UNIQUE (user_id, workshop_id)
);

-- Bảng: payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'VND',
    status payment_status_enum NOT NULL DEFAULT 'pending',
    gateway VARCHAR(50),
    gateway_txn_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: checkins
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID UNIQUE NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_offline BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ
);

-- Bảng: student_imports
CREATE TABLE student_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_sha256 TEXT,
    source_path TEXT,
    status import_status_enum DEFAULT 'running',
    total_rows INTEGER,
    success INTEGER,
    failed INTEGER,
    created_count INTEGER DEFAULT 0,
    updated_count INTEGER DEFAULT 0,
    password_reset_count INTEGER DEFAULT 0,
    inactive_count INTEGER DEFAULT 0,
    cancelled_registration_count INTEGER DEFAULT 0,
    report_path TEXT,
    rejected_path TEXT,
    errors JSONB,
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMPTZ
);
