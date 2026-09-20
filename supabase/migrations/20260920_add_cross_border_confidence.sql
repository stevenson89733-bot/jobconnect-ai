ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS cross_border_confidence TEXT
    CHECK (cross_border_confidence IN ('low', 'medium', 'high'));
