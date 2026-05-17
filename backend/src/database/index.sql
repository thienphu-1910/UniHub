-- UniHub Workshop Database Indexes
-- Chạy file này SAU KHI đã tạo xong bảng và insert dữ liệu mẫu (seed data)

-- 1. Indexes for Foreign Keys (Tối ưu tốc độ JOIN)
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_workshop_id ON registrations(workshop_id);
CREATE INDEX idx_payments_registration_id ON payments(registration_id);
CREATE INDEX idx_workshops_created_by ON workshops(created_by);
CREATE INDEX idx_checkins_checked_in_by ON checkins(checked_in_by);

-- 2. Indexes for Filters (Tối ưu tốc độ SELECT WHERE)
CREATE INDEX idx_workshops_status ON workshops(status);
CREATE INDEX idx_workshops_start_time ON workshops(start_time);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_payments_status ON payments(status);

CREATE UNIQUE INDEX student_imports_completed_file_sha256_idx
ON student_imports(file_sha256)
WHERE status = 'completed' AND file_sha256 IS NOT NULL;

CREATE INDEX idx_student_imports_started_at ON student_imports(started_at DESC);
CREATE INDEX idx_users_student_active ON users(student_id) WHERE role = 'student' AND is_active = true;
