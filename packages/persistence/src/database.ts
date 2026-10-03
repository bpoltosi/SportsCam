import { DatabaseSync } from "node:sqlite";
import { runMigrations } from "./migrations.js";

export function openDatabase(filename = process.env.DATABASE_PATH ?? "sportscam.db"): DatabaseSync {
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA foreign_keys = ON;");
  runMigrations(db);
  return db;
}
