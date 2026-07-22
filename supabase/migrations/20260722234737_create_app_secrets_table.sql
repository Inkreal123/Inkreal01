/*
# Create app_secrets table for storing API keys securely

1. New Tables
- `app_secrets`: Stores third-party API keys (Resend, Twilio, etc.)
  - id (uuid, PK)
  - key_name (text, unique) — e.g. "RESEND_API_KEY"
  - key_value (text) — the actual secret value
  - created_at (timestamptz)
  - updated_at (timestamptz)

2. Security
- RLS ENABLED with NO policies — means anon and authenticated roles get zero access.
- Only the service role (used by edge functions) can read/write, since it bypasses RLS.
- The frontend (anon key) can never access this table.

3. Seed Data
- Inserts RESEND_API_KEY for email delivery via Resend.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

-- No policies = table is locked to anon/authenticated. Only service role can access.

INSERT INTO app_secrets (key_name, key_value) VALUES
  ('RESEND_API_KEY', 're_i1M6DmRk_MEpCxkPasfep1s6qBVyaMzD4')
ON CONFLICT (key_name) DO UPDATE SET key_value = EXCLUDED.key_value, updated_at = now();
