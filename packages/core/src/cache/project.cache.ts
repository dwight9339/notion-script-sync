// TODO: Flesh out a project cache record schema and fix this file

import { getDb } from "./db.cache";

export interface ProjectCacheRecord {
  alias: string;
  projectId: string;
  scriptConfig: unknown;
  storyboardConfig: unknown;
  auxTableConfig?: Record<string, unknown>;
}

const db = getDb();

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    project_page_id TEXT PRIMARY KEY,
    alias TEXT UNIQUE,
    project_title TEXT,
    script_page_id TEXT,
    script_block_id TEXT,
    storyboard_db_id TEXT,
    assets_db_id TEXT,
    citations_db_id TEXT,
    last_updated TEXT
  );
`);

export function upsertProjectRecord(record: ProjectCacheRecord): void {
  const {
    alias,
    projectPageId,
    projectTitle,
    scriptPageId,
    scriptBlockId,
    storyboardDbId,
    assetsDbId,
    citationsDbId
  } = record;

  const stmt = db.prepare(`
    INSERT INTO projects (
      project_page_id,
      alias,
      project_title,
      script_page_id,
      script_block_id,
      storyboard_db_id,
      assets_db_id,
      citations_db_id,
      last_updated
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(project_page_id) DO UPDATE SET
      alias = excluded.alias,
      project_title = excluded.project_title,
      script_page_id = excluded.script_page_id,
      script_block_id = excluded.script_block_id,
      storyboard_db_id = excluded.storyboard_db_id,
      assets_db_id = excluded.assets_db_id,
      citations_db_id = excluded.citations_db_id,
      last_updated = excluded.last_updated
  `);

  stmt.run(
    projectPageId,
    alias,
    projectTitle ?? null,
    scriptPageId ?? null,
    scriptBlockId ?? null,
    storyboardDbId ?? null,
    assetsDbId ?? null,
    citationsDbId ?? null
  );
}

export function getProjectByAlias(alias: string): ProjectCacheRecord | undefined {
  const row = db.prepare(`SELECT * FROM projects WHERE alias = ?`).get(alias);
  return row ? mapRow(row) : undefined;
}

export function getProjectByPageId(pageId: string): ProjectCacheRecord | undefined {
  const row = db.prepare(`SELECT * FROM projects WHERE project_page_id = ?`).get(pageId);
  return row ? mapRow(row) : undefined;
}

export function listAllProjects(): ProjectCacheRecord[] {
  const rows = db.prepare(`SELECT * FROM projects ORDER BY alias`).all();
  return rows.map(mapRow);
}


export function mapRow(row: any): ProjectCacheRecord {
  if (!row) {
    throw new Error("Row is undefined or null.");
  }

  return {
    projectPageId: row.project_page_id,
    alias: row.alias,
    projectTitle: row.project_title ?? undefined,
    scriptPageId: row.script_page_id ?? undefined,
    scriptBlockId: row.script_block_id ?? undefined,
    storyboardDbId: row.storyboard_db_id ?? undefined,
    assetsDbId: row.assets_db_id ?? undefined,
    citationsDbId: row.citations_db_id ?? undefined,
    lastUpdated: row.last_updated ?? undefined
  };
}

export function removeProjectRecord(alias: string): boolean {
  const stmt = db.prepare("DELETE FROM projects WHERE alias = ?");
  const result = stmt.run(alias);

  return result.changes > 0;
}

