-- Add columns if not exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_cross_border boolean DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cross_border_confidence text DEFAULT 'low';

-- Backfill function
CREATE OR REPLACE FUNCTION backfill_cross_border_jobs()
RETURNS integer AS $$
DECLARE updated_count integer;
BEGIN
  UPDATE jobs SET
    is_cross_border = true,
    cross_border_confidence = CASE
      WHEN (
        description ILIKE '%visa sponsor%' OR
        description ILIKE '%employer of record%' OR
        description ILIKE '%EOR%' OR
        description ILIKE '%work permit%' OR
        description ILIKE '%relocation package%'
      ) THEN 'high'
      WHEN (
        description ILIKE '%worldwide%' OR
        description ILIKE '%global team%' OR
        description ILIKE '%international%' OR
        description ILIKE '%any timezone%' OR
        description ILIKE '%async%'
      ) THEN 'medium'
      ELSE 'low'
    END
  WHERE
    location ILIKE '%remote%' OR
    location ILIKE '%worldwide%' OR
    location ILIKE '%anywhere%' OR
    description ILIKE '%remote%' OR
    description ILIKE '%worldwide%' OR
    description ILIKE '%visa sponsor%' OR
    description ILIKE '%international%' OR
    description ILIKE '%open to international%' OR
    description ILIKE '%global team%' OR
    description ILIKE '%work from anywhere%';

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Execute immediately on migration run
SELECT backfill_cross_border_jobs();
