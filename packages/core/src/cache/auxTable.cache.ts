// TODO: Implement aux table caching
import { getDb } from "./db.cache";

const db = getDb();

db.exec(`
  CREATE TABLE IF NOT EXISTS aux_entries (
    id             TEXT PRIMARY KEY,
    project_id     TEXT NOT NULL,
    table_name     TEXT NOT NULL,   -- "assets" | "citations" | custom
    payload        TEXT,            -- JSON blob with arbitrary columns
    last_updated   TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_aux_project_table
    ON aux_entries (project_id, table_name);
`);