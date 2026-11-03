import { Pool, types } from 'pg';

// 1082 is the PostgreSQL DATE type. Return it as plain text like "2026-12-01".
types.setTypeParser(1082, (value: string) => value);


export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

});
