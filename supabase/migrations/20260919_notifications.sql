-- Notifications table for in-app bell
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('job_match', 'application_status', 'interview')),
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  href          TEXT NOT NULL DEFAULT '/candidate',
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
  ON notifications (user_id, created_at DESC);

-- RLS: users see only their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: insert notification on application status change
CREATE OR REPLACE FUNCTION notify_on_application_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_title TEXT;
  v_body  TEXT;
  v_href  TEXT := '/candidate/applications';
  v_type  TEXT;
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  CASE NEW.status
    WHEN 'interview' THEN
      v_type  := 'interview';
      v_title := 'Interview scheduled';
      v_body  := 'You have been invited to an interview. Check your applications.';
    WHEN 'offer' THEN
      v_type  := 'application_status';
      v_title := 'Offer received 🎉';
      v_body  := 'Congratulations! You received a job offer.';
    WHEN 'rejected' THEN
      v_type  := 'application_status';
      v_title := 'Application update';
      v_body  := 'One of your applications has been updated.';
    ELSE
      v_type  := 'application_status';
      v_title := 'Application update';
      v_body  := 'Your application status changed to: ' || NEW.status;
  END CASE;

  INSERT INTO notifications (user_id, type, title, body, href)
  VALUES (NEW.candidate_id, v_type, v_title, v_body, v_href);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status_notify ON applications;
CREATE TRIGGER trg_application_status_notify
  AFTER UPDATE OF status ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_on_application_status_change();
