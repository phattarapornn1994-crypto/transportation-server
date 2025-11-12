// Database adapter that supports both SQLite (local) and Vercel Postgres (production)
import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { join } from 'path';

// Check if we're using Vercel Postgres
const usePostgres = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;

let db: any;
let postgresSql: any = null;

if (usePostgres) {
  // Will be initialized when needed
  console.log('Will use Vercel Postgres database');
} else {
  // Use SQLite for local development
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const dbPath = isVercel 
    ? '/tmp/transportation.db'
    : join(process.cwd(), 'transportation.db');
  db = new Database(dbPath);
  console.log('Using SQLite database:', dbPath);
}

// Initialize Postgres connection
async function initPostgres() {
  if (!usePostgres || postgresSql) return;
  
  try {
    const postgres = await import('@vercel/postgres');
    postgresSql = postgres.sql;
    console.log('Postgres connection initialized');
  } catch (error) {
    console.error('Failed to initialize Postgres:', error);
    throw error;
  }
}

// Database interface for compatibility
interface PreparedStatement {
  all: (params?: any) => Promise<any[]> | any[];
  get: (params?: any) => Promise<any> | any;
  run: (params?: any) => Promise<{ lastInsertRowid: number; changes: number }> | { lastInsertRowid: number; changes: number };
}

interface DatabaseAdapter {
  prepare: (sql: string) => PreparedStatement;
  exec: (sql: string) => Promise<void> | void;
  transaction: (fn: (items: any[]) => void) => (items: any[]) => void | Promise<void>;
}

let dbAdapter: DatabaseAdapter;

if (usePostgres) {
  // Postgres adapter using @vercel/postgres
  dbAdapter = {
    prepare: (sql: string) => {
      // Convert SQLite syntax to Postgres
      let pgSql = sql
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
        .replace(/AUTOINCREMENT/g, '')
        .replace(/DATETIME/g, 'TIMESTAMP')
        .replace(/INTEGER/g, 'INTEGER')
        .replace(/\?/g, (match, offset) => {
          // Count previous ? to determine parameter number
          const before = sql.substring(0, offset);
          const paramNum = (before.match(/\?/g) || []).length + 1;
          return `$${paramNum}`;
        });

      return {
        all: async (params?: any) => {
          await initPostgres();
          if (Array.isArray(params)) {
            return await postgresSql.query(pgSql, params);
          } else if (params !== undefined) {
            return await postgresSql.query(pgSql, [params]);
          } else {
            return await postgresSql.query(pgSql);
          }
        },
        get: async (params?: any) => {
          await initPostgres();
          let result;
          if (Array.isArray(params)) {
            result = await postgresSql.query(pgSql, params);
          } else if (params !== undefined) {
            result = await postgresSql.query(pgSql, [params]);
          } else {
            result = await postgresSql.query(pgSql);
          }
          return result.rows?.[0] || result[0] || null;
        },
        run: async (params?: any) => {
          await initPostgres();
          let result;
          if (Array.isArray(params)) {
            result = await postgresSql.query(pgSql, params);
          } else if (params !== undefined) {
            result = await postgresSql.query(pgSql, [params]);
          } else {
            result = await postgresSql.query(pgSql);
          }
          // For INSERT, get the last inserted ID
          const lastInsertRowid = result.rows?.[0]?.id || result.insertId || 0;
          const changes = result.rowCount || result.affectedRows || 0;
          return { lastInsertRowid, changes };
        }
      };
    },
    exec: async (sql: string) => {
      await initPostgres();
      let pgSql = sql
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'SERIAL PRIMARY KEY')
        .replace(/AUTOINCREMENT/g, '')
        .replace(/DATETIME/g, 'TIMESTAMP');
      await postgresSql.query(pgSql);
    },
    transaction: (fn: (items: any[]) => void) => {
      return async (items: any[]) => {
        // For Postgres, execute sequentially
        // In production, wrap in a transaction if needed
        fn(items);
      };
    }
  };
} else {
  // SQLite adapter
  dbAdapter = {
    prepare: (sql: string) => db.prepare(sql),
    exec: (sql: string) => db.exec(sql),
    transaction: (fn: (items: any[]) => void) => {
      return db.transaction(fn);
    }
  };
}

// Initialize database tables
export async function initializeDatabase() {
  if (usePostgres) {
    await initializePostgres();
  } else {
    initializeSQLite();
  }
}

async function initializePostgres() {
  await initPostgres();
  
  // Convert SQLite schema to Postgres
  const tables = [
    `CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      latitude REAL,
      longitude REAL,
      phone TEXT,
      email TEXT,
      customer_type TEXT,
      working_hours_start TEXT,
      working_hours_end TEXT,
      special_constraints TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS vehicles (
      id SERIAL PRIMARY KEY,
      license_plate TEXT UNIQUE NOT NULL,
      vehicle_type TEXT NOT NULL,
      capacity_weight REAL,
      capacity_volume REAL,
      ownership_type TEXT,
      cost_per_km REAL,
      status TEXT DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS transportation_plans (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      plan_date TEXT NOT NULL,
      origin_address TEXT,
      origin_latitude REAL,
      origin_longitude REAL,
      status TEXT DEFAULT 'draft',
      total_distance REAL,
      total_cost REAL,
      total_vehicles INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS plan_items (
      id SERIAL PRIMARY KEY,
      plan_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      quantity REAL,
      weight REAL,
      volume REAL,
      delivery_type TEXT,
      FOREIGN KEY (plan_id) REFERENCES transportation_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      plan_id INTEGER NOT NULL,
      vehicle_id INTEGER NOT NULL,
      route_sequence INTEGER,
      total_distance REAL,
      total_cost REAL,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (plan_id) REFERENCES transportation_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )`,
    `CREATE TABLE IF NOT EXISTS route_stops (
      id SERIAL PRIMARY KEY,
      route_id INTEGER NOT NULL,
      customer_id INTEGER,
      stop_sequence INTEGER NOT NULL,
      stop_type TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      report_type TEXT NOT NULL,
      plan_id INTEGER,
      file_path TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES transportation_plans(id)
    )`
  ];

  for (const tableSql of tables) {
    try {
      await postgresSql.query(tableSql);
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message?.includes('already exists')) {
        console.error('Error creating table:', error);
      }
    }
  }

  console.log('Postgres database initialized successfully');
}

function initializeSQLite() {
  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      latitude REAL,
      longitude REAL,
      phone TEXT,
      email TEXT,
      customer_type TEXT,
      working_hours_start TEXT,
      working_hours_end TEXT,
      special_constraints TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vehicles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_plate TEXT UNIQUE NOT NULL,
      vehicle_type TEXT NOT NULL,
      capacity_weight REAL,
      capacity_volume REAL,
      ownership_type TEXT,
      cost_per_km REAL,
      status TEXT DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transportation plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transportation_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      plan_date TEXT NOT NULL,
      origin_address TEXT,
      origin_latitude REAL,
      origin_longitude REAL,
      status TEXT DEFAULT 'draft',
      total_distance REAL,
      total_cost REAL,
      total_vehicles INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Plan items (customers in a plan)
  db.exec(`
    CREATE TABLE IF NOT EXISTS plan_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      customer_id INTEGER NOT NULL,
      quantity REAL,
      weight REAL,
      volume REAL,
      delivery_type TEXT,
      FOREIGN KEY (plan_id) REFERENCES transportation_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )
  `);

  // Routes (optimized routes for each vehicle)
  db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      vehicle_id INTEGER NOT NULL,
      route_sequence INTEGER,
      total_distance REAL,
      total_cost REAL,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (plan_id) REFERENCES transportation_plans(id) ON DELETE CASCADE,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
  `);

  // Route stops (sequence of stops in a route)
  db.exec(`
    CREATE TABLE IF NOT EXISTS route_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_id INTEGER NOT NULL,
      customer_id INTEGER,
      stop_sequence INTEGER NOT NULL,
      stop_type TEXT,
      latitude REAL,
      longitude REAL,
      address TEXT,
      FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  // Reports history
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type TEXT NOT NULL,
      plan_id INTEGER,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES transportation_plans(id)
    )
  `);

  console.log('SQLite database initialized successfully');
}

// Export database adapter
export default dbAdapter;
