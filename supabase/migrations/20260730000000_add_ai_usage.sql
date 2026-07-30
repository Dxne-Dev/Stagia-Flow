CREATE TABLE org_usage_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  ai_calls integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, date)
);

CREATE INDEX IF NOT EXISTS idx_org_usage_daily_org_date ON org_usage_daily(organization_id, date);

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS analysis_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION increment_ai_calls(org_id uuid, max_calls int)
RETURNS TABLE(allowed boolean, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_calls int;
BEGIN
  INSERT INTO org_usage_daily (organization_id, date, ai_calls)
  VALUES (org_id, CURRENT_DATE, 0)
  ON CONFLICT (organization_id, date) DO NOTHING;

  SELECT ai_calls INTO current_calls
  FROM org_usage_daily
  WHERE organization_id = org_id AND date = CURRENT_DATE
  FOR UPDATE;

  IF current_calls >= max_calls THEN
    RETURN QUERY SELECT false, max_calls - current_calls;
  ELSE
    UPDATE org_usage_daily
    SET ai_calls = ai_calls + 1, updated_at = now()
    WHERE organization_id = org_id AND date = CURRENT_DATE;

    RETURN QUERY SELECT true, max_calls - current_calls - 1;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION check_ai_credits(org_id uuid, max_calls int)
RETURNS TABLE(remaining int)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  current_calls int;
BEGIN
  INSERT INTO org_usage_daily (organization_id, date, ai_calls)
  VALUES (org_id, CURRENT_DATE, 0)
  ON CONFLICT (organization_id, date) DO NOTHING;

  SELECT ai_calls INTO current_calls
  FROM org_usage_daily
  WHERE organization_id = org_id AND date = CURRENT_DATE;

  RETURN QUERY SELECT max_calls - current_calls;
END;
$$;

ALTER TABLE org_usage_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_can_read_usage"
  ON org_usage_daily
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );
