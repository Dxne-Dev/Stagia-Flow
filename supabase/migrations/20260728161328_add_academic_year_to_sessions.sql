ALTER TABLE sessions ADD COLUMN IF NOT EXISTS academic_year integer;

ALTER TABLE sessions DROP CONSTRAINT IF EXISTS valid_academic_year;
ALTER TABLE sessions ADD CONSTRAINT valid_academic_year CHECK (
  (academic_level = 'licence' AND (academic_year IS NULL OR academic_year BETWEEN 1 AND 3)) OR
  (academic_level = 'master' AND (academic_year IS NULL OR academic_year BETWEEN 1 AND 2)) OR
  (academic_level = 'doctorat' AND (academic_year IS NULL OR academic_year BETWEEN 1 AND 3))
);
