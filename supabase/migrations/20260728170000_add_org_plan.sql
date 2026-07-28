-- Add plan and subscription_status to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'essentiel'
  CHECK (plan IN ('essentiel', 'pro', 'entreprise'));

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active'
  CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'expired'));

-- Function: enforce plan limits on sessions
CREATE OR REPLACE FUNCTION check_session_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  org_plan text;
  session_count int;
BEGIN
  SELECT plan INTO org_plan FROM public.organizations WHERE id = NEW.organization_id;
  IF org_plan = 'essentiel' THEN
    SELECT COUNT(*) INTO session_count FROM public.sessions WHERE organization_id = NEW.organization_id;
    IF session_count >= 3 THEN
      RAISE EXCEPTION 'LIMIT_REACHED:Vous avez atteint la limite de 3 sessions sur le plan Essentiel. Passez à Pro pour des sessions illimitées.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_session_limit_before_insert
  BEFORE INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION check_session_limit();

-- Function: enforce plan limits on projects per session
CREATE OR REPLACE FUNCTION check_project_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  org_plan text;
  project_count int;
BEGIN
  SELECT o.plan INTO org_plan
  FROM public.sessions s
  JOIN public.organizations o ON o.id = s.organization_id
  WHERE s.id = NEW.session_id;

  IF org_plan = 'essentiel' THEN
    SELECT COUNT(*) INTO project_count FROM public.projects WHERE session_id = NEW.session_id;
    IF project_count >= 5 THEN
      RAISE EXCEPTION 'LIMIT_REACHED:Vous avez atteint la limite de 5 projets par session sur le plan Essentiel.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_project_limit_before_insert
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION check_project_limit();

-- Function: enforce stagiaire limit on user_profiles
CREATE OR REPLACE FUNCTION check_stagiaire_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  org_plan text;
  stagiaire_count int;
BEGIN
  IF NEW.role = 'stagiaire' AND NEW.organization_id IS NOT NULL THEN
    SELECT plan INTO org_plan FROM public.organizations WHERE id = NEW.organization_id;
    IF org_plan = 'essentiel' THEN
      -- On UPDATE, exclude the current user so reassignment doesn't double-count
      IF TG_OP = 'UPDATE' THEN
        SELECT COUNT(*) INTO stagiaire_count
        FROM public.user_profiles
        WHERE organization_id = NEW.organization_id AND role = 'stagiaire'
          AND id != NEW.id;
      ELSE
        SELECT COUNT(*) INTO stagiaire_count
        FROM public.user_profiles
        WHERE organization_id = NEW.organization_id AND role = 'stagiaire';
      END IF;
      IF stagiaire_count >= 10 THEN
        RAISE EXCEPTION 'LIMIT_REACHED:Vous avez atteint la limite de 10 stagiaires sur le plan Essentiel. Passez à Pro pour des stagiaires illimités.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_stagiaire_limit_before_upsert
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION check_stagiaire_limit();
