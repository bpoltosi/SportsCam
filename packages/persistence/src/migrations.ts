import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { DatabaseSync } from "node:sqlite";

export function runMigrations(db: DatabaseSync, directory = join(process.cwd(), "db", "migrations")) {
  db.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
  const files=readdirSync(directory).filter(f=>/^\d+_.+\.sql$/.test(f)).sort();
  for(const file of files){
    const version=file.split("_")[0]!;
    const exists=db.prepare("SELECT version FROM schema_migrations WHERE version=?").get(version);
    if(exists) continue;
    const sql=readFileSync(join(directory,file),"utf8");
    db.exec("BEGIN");
    try { db.exec(sql); db.prepare("INSERT INTO schema_migrations VALUES (?,?)").run(version,new Date().toISOString()); db.exec("COMMIT"); }
    catch(error){ db.exec("ROLLBACK"); throw error; }
  }
}
