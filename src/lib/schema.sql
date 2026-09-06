-- Supabase / PostgreSQL Schema for IEEE Event Character Card System (ShrIEEEk '26)

-- 1. Participants Table
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  powers TEXT NOT NULL DEFAULT '',
  character_id TEXT,
  reroll_count INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  qr_token TEXT UNIQUE NOT NULL,
  manual_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_scan_at TIMESTAMPTZ
);

-- 2. Scan Events Table (with unique scan pair constraint and clash outcome)
CREATE TABLE IF NOT EXISTS scan_events (
  id TEXT PRIMARY KEY,
  scanner_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  scanned_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  xp_awarded INTEGER NOT NULL DEFAULT 10,
  clash_outcome TEXT DEFAULT 'DRAW',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_scanner_scanned_pair UNIQUE (scanner_id, scanned_id)
);

-- 3. Event Config Table
CREATE TABLE IF NOT EXISTS event_config (
  id TEXT PRIMARY KEY DEFAULT 'config_main',
  is_event_active BOOLEAN DEFAULT TRUE,
  is_leaderboard_public BOOLEAN DEFAULT FALSE,
  admin_password_hash TEXT DEFAULT '', -- Set via ADMIN_PASSWORD env var or update this row directly
  active_announcement JSONB DEFAULT NULL
);

-- Insert default event config if not present
INSERT INTO event_config (id, is_event_active, is_leaderboard_public, admin_password_hash, active_announcement)
VALUES ('config_main', TRUE, FALSE, '', NULL)
ON CONFLICT (id) DO UPDATE SET
  is_event_active = EXCLUDED.is_event_active;

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_participants_phone ON participants(phone_number);
CREATE INDEX IF NOT EXISTS idx_participants_qr_token ON participants(qr_token);
CREATE INDEX IF NOT EXISTS idx_participants_manual_code ON participants(manual_code);
CREATE INDEX IF NOT EXISTS idx_scan_events_scanner ON scan_events(scanner_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_scanned ON scan_events(scanned_id);

-- Optional: Initial Seed Participants
INSERT INTO participants (id, phone_number, display_name, powers, character_id, reroll_count, xp, level, qr_token, manual_code, created_at)
VALUES 
  ('part_1', '9876543210', 'Tony S.', 'Genius Intellect, Micro-Drones & Arc Tech', 'iron-man', 0, 60, 2, 'qr_tok_9876543210_ironman', 'SHK-IRON', NOW()),
  ('part_2', '9123456780', 'Thor O.', 'Thunder Calling, Lightning Shield & Storm Flight', 'thor', 0, 120, 3, 'qr_tok_9123456780_thor', 'SHK-THOR', NOW()),
  ('part_3', '9988776655', 'Bruce B.', 'Limitless Kinetic Might & Shockwaves', 'hulk', 0, 40, 1, 'qr_tok_9988776655_hulk', 'SHK-HULK', NOW()),
  ('part_4', '9000011111', 'Peter P.', 'Acrobatic Web Traversal & Danger Sense', 'spiderman', 0, 180, 4, 'qr_tok_9000011111_spidey', 'SHK-SPDR', NOW()),
  ('part_5', '9555544444', 'T''Challa', 'Vibranium Kinetic Claws & Panther Agility', 'black-panther', 0, 260, 6, 'qr_tok_9555544444_panther', 'SHK-PNTH', NOW()),
  ('part_6', '9777788888', 'Carol D.', 'Photon Beams & Lightspeed Flight', 'captain-marvel', 0, 10, 1, 'qr_tok_9777788888_marvel', 'SHK-MRVL', NOW()),
  ('part_7', '9222233333', 'New Recruit', 'Super Speed & Reflexes', NULL, 0, 0, 1, 'qr_tok_9222233333_recruit', 'SHK-RC01', NOW())
ON CONFLICT (phone_number) DO NOTHING;
