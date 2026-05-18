-- ================================================================
-- Portfolio Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ================================================================

-- ── Tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id          BIGINT PRIMARY KEY,
  "order"     INTEGER DEFAULT 0,
  title       TEXT,
  description TEXT,
  details     TEXT,
  link        TEXT,
  tags        JSONB DEFAULT '[]',
  images      JSONB DEFAULT '[]',
  visibility  TEXT DEFAULT 'public',
  highlight   BOOLEAN DEFAULT false,
  status      TEXT,
  icon        TEXT
);

CREATE TABLE IF NOT EXISTS experience (
  id          BIGINT PRIMARY KEY,
  "order"     INTEGER DEFAULT 0,
  role        TEXT,
  company     TEXT,
  period      TEXT,
  highlights  JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS education (
  id               BIGINT PRIMARY KEY,
  "order"          INTEGER DEFAULT 0,
  degree           TEXT,
  field            TEXT,
  institution      TEXT,
  year             TEXT,
  "contentBlocks"  JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS skills (
  id          BIGINT PRIMARY KEY,
  "order"     INTEGER DEFAULT 0,
  category    TEXT,
  icon        TEXT,
  items       JSONB DEFAULT '[]'
);

-- "references" is a SQL reserved word — quotes are required
CREATE TABLE IF NOT EXISTS "references" (
  id          BIGINT PRIMARY KEY,
  "order"     INTEGER DEFAULT 0,
  name        TEXT,
  role        TEXT,
  company     TEXT,
  relation    TEXT,
  image       TEXT,
  quote       TEXT,
  linkedin    TEXT,
  email       TEXT
);

CREATE TABLE IF NOT EXISTS personal (
  id               BIGINT PRIMARY KEY,
  "order"          INTEGER DEFAULT 0,
  category         TEXT,
  title            TEXT,
  summary          TEXT,
  thumbnail        TEXT,
  images           JSONB DEFAULT '[]',
  "contentBlocks"  JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS edu_stories (
  id               BIGINT PRIMARY KEY,
  "order"          INTEGER DEFAULT 0,
  "parentId"       TEXT,
  category         TEXT,
  title            TEXT,
  summary          TEXT,
  thumbnail        TEXT,
  images           JSONB DEFAULT '[]',
  "contentBlocks"  JSONB DEFAULT '[]'
);

-- settings: single row, id is the text string 'config'
CREATE TABLE IF NOT EXISTS settings (
  id                    TEXT PRIMARY KEY DEFAULT 'config',
  "resumeUrl"           TEXT,
  "heroBadge"           TEXT,
  "heroTitle"           TEXT,
  "heroDesc"            TEXT,
  "stat1Num"            TEXT,
  "stat1Label"          TEXT,
  "stat2Num"            TEXT,
  "stat2Label"          TEXT,
  "stat3Num"            TEXT,
  "stat3Label"          TEXT,
  "visitorPasswordHash" TEXT
);

-- ── Row-Level Security ──────────────────────────────────────────

ALTER TABLE projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience   ENABLE ROW LEVEL SECURITY;
ALTER TABLE education    ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "references" ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal     ENABLE ROW LEVEL SECURITY;
ALTER TABLE edu_stories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings     ENABLE ROW LEVEL SECURITY;

-- Public read (anon key can select)
CREATE POLICY "anon_read" ON projects     FOR SELECT USING (true);
CREATE POLICY "anon_read" ON experience   FOR SELECT USING (true);
CREATE POLICY "anon_read" ON education    FOR SELECT USING (true);
CREATE POLICY "anon_read" ON skills       FOR SELECT USING (true);
CREATE POLICY "anon_read" ON "references" FOR SELECT USING (true);
CREATE POLICY "anon_read" ON personal     FOR SELECT USING (true);
CREATE POLICY "anon_read" ON edu_stories  FOR SELECT USING (true);
CREATE POLICY "anon_read" ON settings     FOR SELECT USING (true);

-- Authenticated write (admin Google login can mutate)
CREATE POLICY "auth_write" ON projects     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON experience   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON education    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON skills       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON "references" FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON personal     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON edu_stories  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write" ON settings     FOR ALL TO authenticated USING (true) WITH CHECK (true);
