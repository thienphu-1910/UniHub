ALTER TABLE student_imports
ADD COLUMN IF NOT EXISTS file_sha256 TEXT,
ADD COLUMN IF NOT EXISTS source_path TEXT,
ADD COLUMN IF NOT EXISTS report_path TEXT,
ADD COLUMN IF NOT EXISTS rejected_path TEXT,
ADD COLUMN IF NOT EXISTS created_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS password_reset_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS inactive_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancelled_registration_count INTEGER DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS student_imports_completed_file_sha256_idx
ON student_imports (file_sha256)
WHERE status = 'completed' AND file_sha256 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_imports_started_at
ON student_imports (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_student_active
ON users (student_id)
WHERE role = 'student' AND is_active = true;

