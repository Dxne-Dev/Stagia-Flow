
/*
# StagePilot — Core Schema (Part 1)

Creates the base tables without cross-table RLS dependencies.
Part 2 will add the full cross-table policies.

## Tables
- organizations: companies using the platform
- sessions: intern cohorts per academic level
- user_profiles: role + org assignment per auth user
- projects: AI-generated briefs per session
- deliverables: files submitted by interns
*/

-- ORGANIZATIONS
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website_url text,
  ai_context_json jsonb,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  academic_level text NOT NULL CHECK (academic_level IN ('licence', 'master', 'doctorat')),
  department text,
  invite_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'stagiaire' CHECK (role IN ('admin', 'manager', 'stagiaire')),
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title text NOT NULL,
  context_objective text,
  instructions text,
  deliverable_type text NOT NULL DEFAULT 'pdf' CHECK (deliverable_type IN ('pdf', 'git', 'spreadsheet', 'presentation', 'other')),
  deadline date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- DELIVERABLES
CREATE TABLE IF NOT EXISTS deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  file_url text,
  notes text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'validated', 'rejected')),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id)
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_sessions_org ON sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_session ON user_profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_projects_session ON projects(session_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON deliverables(project_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_user ON deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_invite_token ON sessions(invite_token);
