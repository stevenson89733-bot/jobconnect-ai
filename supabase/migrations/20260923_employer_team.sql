-- Employer team members table
-- An employer (growth+) can invite up to 5 team members who share recruiter access.
CREATE TABLE IF NOT EXISTS employer_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  member_user_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'removed')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(employer_id, invited_email)
);

-- Index for looking up a member's employer
CREATE INDEX IF NOT EXISTS idx_employer_team_member_user ON employer_team_members(member_user_id);
CREATE INDEX IF NOT EXISTS idx_employer_team_employer ON employer_team_members(employer_id);

-- RLS
ALTER TABLE employer_team_members ENABLE ROW LEVEL SECURITY;

-- Employer can read/manage their own team
CREATE POLICY "employer_team_employer_all" ON employer_team_members
  FOR ALL USING (employer_id = auth.uid());

-- Members can read their own row (to accept invite)
CREATE POLICY "employer_team_member_read" ON employer_team_members
  FOR SELECT USING (member_user_id = auth.uid());
