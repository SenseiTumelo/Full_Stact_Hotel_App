require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Set DATABASE_URL in server/.env before initializing the database.');
}

const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    if (rows[0].count > 0) {
      throw new Error('Refusing to initialize a database that already contains tables.');
    }

    const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await client.query('BEGIN');
    await client.query(schema);
    await client.query('COMMIT');

    const result = await client.query(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    console.log(`Database initialized successfully (${result.rows[0].count} tables).`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Database initialization failed.');
  process.exitCode = 1;
});
