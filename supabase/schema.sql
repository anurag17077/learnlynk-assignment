-- EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SUPPORT TABLES
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  stage TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_applications_lead ON applications(lead_id);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  related_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_task_type CHECK (type IN ('call', 'email', 'review')),
  CONSTRAINT due_after_created CHECK (due_at >= created_at)
);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);

-- RLS on leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_leads" ON leads
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
  OR owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_teams ut
    WHERE ut.user_id = auth.uid()
      AND ut.team_id IN (
        SELECT ut2.team_id
        FROM user_teams ut2
        WHERE ut2.user_id = leads.owner_id
      )
  )
);

CREATE POLICY "insert_leads" ON leads
FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
  OR owner_id = auth.uid()
);

-- Allow update of tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_update_tasks" ON tasks
FOR UPDATE
USING ( true )
WITH CHECK ( true );
