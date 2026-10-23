-- One-off upgrade for a demo database created before school sign-in existed.
-- Fresh databases get these columns from create_all; run this only on an older one:
--   docker compose exec -T db psql -U hunchpot hunchpot < api/sql/2026-10-23-campus-auth.sql
BEGIN;
CREATE TYPE schoolkind AS ENUM ('university', 'school');
CREATE TYPE schoolstatus AS ENUM ('live', 'waitlist');
ALTER TABLE schools
  ADD COLUMN domains varchar(120)[] NOT NULL DEFAULT '{}',
  ADD COLUMN kind schoolkind NOT NULL DEFAULT 'university',
  ADD COLUMN status schoolstatus NOT NULL DEFAULT 'waitlist',
  ADD COLUMN unlock_at integer NOT NULL DEFAULT 100;
UPDATE schools SET domains = '{northgate.edu}', status = 'live' WHERE slug = 'northgate';
INSERT INTO schools (name, slug, domains, status, unlock_at)
  VALUES ('Ridgeview College', 'ridgeview', '{ridgeview.edu}', 'waitlist', 100) ON CONFLICT (slug) DO NOTHING;
ALTER TABLE users ADD COLUMN email varchar(254), ADD COLUMN verified_at timestamptz;
UPDATE users SET email = handle || '@northgate.edu', verified_at = now();
ALTER TABLE users ALTER COLUMN email SET NOT NULL, ADD CONSTRAINT users_email_key UNIQUE (email);
COMMIT;
