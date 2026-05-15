ALTER TABLE workshops
ADD COLUMN IF NOT EXISTS registration_start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registration_end_time TIMESTAMPTZ;

UPDATE workshops
SET
  registration_end_time = COALESCE(registration_end_time, start_time),
  registration_start_time = COALESCE(
    registration_start_time,
    COALESCE(registration_end_time, start_time) - INTERVAL '3 days'
  )
WHERE registration_start_time IS NULL
   OR registration_end_time IS NULL;

ALTER TABLE workshops
ALTER COLUMN registration_start_time SET NOT NULL,
ALTER COLUMN registration_end_time SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'workshops_registration_window_check'
  ) THEN
    ALTER TABLE workshops
    ADD CONSTRAINT workshops_registration_window_check
    CHECK (
      registration_start_time < registration_end_time
      AND registration_end_time <= start_time
    );
  END IF;
END $$;
