// server/database/postgres-db.ts
import { Pool } from "pg";

class PostgreSQLDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });
    this.initializeDatabase();
  }

  async query(text: string, params: any[] = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Convert all your existing SQLite methods to PostgreSQL
}
