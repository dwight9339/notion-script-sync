import Database, { Database as DB } from "better-sqlite3";
import path from "path";
import fs from "fs";
import envPaths from "env-paths";

let dbInstance: DB | undefined;

export function getDb(): DB {
  if (!dbInstance) {
    const paths = envPaths("sprongus"); // follows OS conventions
    const dbPath = path.join(paths.data, "sprongus.db");

    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    dbInstance = new Database(dbPath);
  }

  return dbInstance;
}
