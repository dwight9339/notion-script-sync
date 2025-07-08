// TODO: Implement storyboard caching
import { getDb } from "./db.cache";

const db = getDb();

db.exec(`
  CREATE TABLE IF NOT EXISTS storyboard (
    row_id             TEXT PRIMARY KEY,  -- stable per storyboard row
    project_id         TEXT NOT NULL,     -- FK to projects
    beat_id            TEXT,              -- maps back to beat cache
    idx                INTEGER,           -- numeric ordering (01.02.03 → 10203)
    beat_text          TEXT,
    visual_description TEXT,

    -- One JSON blob for *anything* else
    extras        TEXT                   -- JSON string, nullable
  );

  CREATE INDEX IF NOT EXISTS idx_storyboard_project
    ON storyboard (project_id);
`);

db.exec(`CREATE INDEX IF NOT EXISTS scripts_project_idx ON scripts (project_page_id);`);