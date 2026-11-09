import { pool } from '../config/db';

export type Role = 'guest' | 'admin';

type GoogleProfile = {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
};

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Has this Google account signed in before?
    const existingLink = await client.query(
      `SELECT u.id, u.role FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
       WHERE oa.provider = 'google' AND oa.provider_user_id = $1 AND u.deleted_at IS NULL`,
      [profile.googleId]
    );
    if (existingLink.rows.length > 0) {
      await client.query('COMMIT');
      return existingLink.rows[0] as { id: string; role: Role };
    }

    // 2. Is there already a user with this email? Then link Google to it.
    const byEmail = await client.query(
      'SELECT id, role, deleted_at FROM users WHERE email = $1',
      [profile.email]
    );

    let user: { id: string; role: Role };

    if (byEmail.rows.length > 0) {
      if (byEmail.rows[0].deleted_at) throw new Error('This account has been disabled');
      user = { id: byEmail.rows[0].id, role: byEmail.rows[0].role };
    } else {
      // 3. Brand new user
      const created = await client.query(
        `INSERT INTO users (email, full_name, avatar_url)
         VALUES ($1, $2, $3) RETURNING id, role`,
        [profile.email, profile.fullName, profile.avatarUrl]
      );
      user = created.rows[0];
    }

    await client.query(
      `INSERT INTO oauth_accounts (user_id, provider, provider_user_id)
       VALUES ($1, 'google', $2)`,
      [user.id, profile.googleId]
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findUserById(id: string) {
  const result = await pool.query(
    `SELECT id, email, full_name, phone, avatar_url, role
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function updateUserProfile(id: string, input: { fullName: string; phone: string | null }) {
  const result = await pool.query(
    `UPDATE users SET full_name = $1, phone = $2
     WHERE id = $3 AND deleted_at IS NULL
     RETURNING id, email, full_name, phone, avatar_url, role`,
    [input.fullName, input.phone, id]
  );
  return result.rows[0] ?? null;
}

export async function createPasswordUser(input: { email: string; fullName: string; passwordHash: string }) {
  const result = await pool.query(
    `INSERT INTO users (email, full_name, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, phone, avatar_url, role`,
    [input.email, input.fullName, input.passwordHash]
  );
  return result.rows[0];
}

export async function findPasswordUserByEmail(email: string) {
  const result = await pool.query(
    `SELECT id, email, full_name, phone, avatar_url, role, password_hash
     FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return result.rows[0] ?? null;
}
