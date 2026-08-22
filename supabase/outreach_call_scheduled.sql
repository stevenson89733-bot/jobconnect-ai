-- Migration: add call scheduling to outreach_contacts
ALTER TABLE outreach_contacts
ADD COLUMN IF NOT EXISTS call_scheduled_at timestamptz;

ALTER TABLE outreach_contacts
ADD COLUMN IF NOT EXISTS call_timezone text;

-- Test contact SP
INSERT INTO outreach_contacts (name, channel, status, call_scheduled_at, call_timezone, notes)
VALUES (
  'SP',
  'LinkedIn',
  'call_scheduled',
  '2026-08-25 14:15:00+00',
  'Montréal',
  'Premier early adopter — 15 min call'
);
