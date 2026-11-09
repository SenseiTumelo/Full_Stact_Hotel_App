import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000 })
  : null;

export default async function health(_request, response) {
  if (!pool) {
    return response.status(503).json({ status: 'error', database: 'unconfigured' });
  }

  try {
    await pool.query('SELECT 1');
    return response.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check database query failed:', error instanceof Error ? error.name : 'UnknownError');
    return response.status(503).json({ status: 'error', database: 'unavailable' });
  }
}
