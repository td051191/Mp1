#!/usr/bin/env node

import { Pool } from "pg";
import sqlite3 from "sqlite3";
import fs from "fs";

const SQLITE_PATH = "./data/database.sqlite";
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!fs.existsSync(SQLITE_PATH)) {
  console.error("❌ SQLite database not found at:", SQLITE_PATH);
  process.exit(1);
}

const pgPool = new Pool({
  connectionString: POSTGRES_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const sqliteDb = new sqlite3.Database(SQLITE_PATH);

async function createPostgresSchema() {
  console.log("📝 Creating PostgreSQL schema...");

  const schema = `
    -- Products table
    CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_en TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        description_en TEXT NOT NULL,
        description_vi TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        image TEXT NOT NULL,
        images JSONB,
        category TEXT NOT NULL,
        in_stock BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3,2) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        weight TEXT,
        origin TEXT,
        harvest_date TEXT,
        shelf_life TEXT,
        nutrition JSONB,
        organic BOOLEAN DEFAULT FALSE,
        seasonal BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name_en TEXT NOT NULL,
        name_vi TEXT NOT NULL,
        description_en TEXT,
        description_vi TEXT,
        slug TEXT UNIQUE NOT NULL,
        image TEXT,
        count INTEGER DEFAULT 0,
        parent_id UUID,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id)
    );

    -- Content table
    CREATE TABLE IF NOT EXISTS content (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT NOT NULL,
        value_en TEXT,
        value_vi TEXT,
        type TEXT NOT NULL DEFAULT 'text',
        section TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(key, section)
    );

    -- Newsletter subscriptions table
    CREATE TABLE IF NOT EXISTS newsletters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'active',
        preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin users table
    CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'admin',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin sessions table
    CREATE TABLE IF NOT EXISTS admin_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_organic ON products(organic);
    CREATE INDEX IF NOT EXISTS idx_products_seasonal ON products(seasonal);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_content_key ON content(key);
    CREATE INDEX IF NOT EXISTS idx_content_section ON content(section);
    CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
  `;

  await pgPool.query(schema);
  console.log("✅ PostgreSQL schema created");
}

async function migrateTable(tableName, transform = null) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Migrating ${tableName}...`);

    sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
      if (err) {
        console.error(`❌ Error reading ${tableName}:`, err);
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log(`📭 No data in ${tableName}`);
        resolve();
        return;
      }

      try {
        for (const row of rows) {
          const data = transform ? transform(row) : row;
          const columns = Object.keys(data).join(", ");
          const placeholders = Object.keys(data)
            .map((_, i) => `$${i + 1}`)
            .join(", ");
          const values = Object.values(data);

          await pgPool.query(
            `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values,
          );
        }
        console.log(`✅ Migrated ${rows.length} rows from ${tableName}`);
        resolve();
      } catch (error) {
        console.error(`❌ Error migrating ${tableName}:`, error);
        reject(error);
      }
    });
  });
}

async function migrate() {
  try {
    console.log("🚀 Starting migration from SQLite to PostgreSQL...");

    // Test PostgreSQL connection
    await pgPool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connection successful");

    // Create schema
    await createPostgresSchema();

    // Migrate data
    await migrateTable("admin_users");
    await migrateTable("categories");
    await migrateTable("products", (row) => ({
      ...row,
      images: row.images ? JSON.stringify(JSON.parse(row.images)) : null,
      nutrition: row.nutrition
        ? JSON.stringify(JSON.parse(row.nutrition))
        : null,
    }));
    await migrateTable("content");
    await migrateTable("newsletters", (row) => ({
      ...row,
      preferences: row.preferences
        ? JSON.stringify(JSON.parse(row.preferences))
        : null,
    }));

    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Update your app to use PostgreSQL instead of SQLite");
    console.log("2. Test all functionality");
    console.log("3. Deploy to production");
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  } finally {
    await pgPool.end();
    sqliteDb.close();
  }
}

migrate();
