// Helper functions for database operations that work with both SQLite and Postgres
import db from '../database.js';

export async function dbAll(sql: string, params?: any): Promise<any[]> {
  const stmt = db.prepare(sql);
  const result = stmt.all(params);
  return Array.isArray(result) ? result : await result;
}

export async function dbGet(sql: string, params?: any): Promise<any> {
  const stmt = db.prepare(sql);
  const result = stmt.get(params);
  return result instanceof Promise ? await result : result;
}

export async function dbRun(sql: string, params?: any): Promise<{ lastInsertRowid: number; changes: number }> {
  const stmt = db.prepare(sql);
  const result = stmt.run(params);
  return result instanceof Promise ? await result : result;
}

export async function dbExec(sql: string): Promise<void> {
  const result = db.exec(sql);
  if (result instanceof Promise) {
    await result;
  }
}

