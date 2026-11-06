import { pool } from '../config/db';
import { HttpError } from '../utils/httpError';

export type ReviewInput = { bookingId: string; rating: number; comment?: string };

export async function createReview(userId: string, input: ReviewInput) {
  try {
    // One statement does the insert AND the permission check: the SELECT only returns a row
    // when this booking belongs to this user, is confirmed, and the stay has ended.
    const result = await pool.query(
      `INSERT INTO reviews (user_id, hotel_id, booking_id, rating, comment)
       SELECT b.user_id, rt.hotel_id, b.id, $3::smallint, $4::text
       FROM bookings b
       JOIN room_types rt ON rt.id = b.room_type_id
       WHERE b.id = $1 AND b.user_id = $2
         AND b.status IN ('approved', 'completed')
         AND b.check_out <= CURRENT_DATE
       RETURNING id, hotel_id`,
      [input.bookingId, userId, input.rating, input.comment || null]
    );
    if (result.rowCount) return result.rows[0] as { id: string; hotel_id: string };
  } catch (err) {
    // 23505 = unique violation: this booking already has a review
    if ((err as { code?: string }).code === '23505') {
      throw new HttpError(409, 'You have already reviewed this stay');
    }
    throw err;
  }

  // Nothing was inserted. Work out why, so the guest gets a useful message.
  const booking = await pool.query(
    `SELECT status, check_out <= CURRENT_DATE AS ended
     FROM bookings WHERE id = $1 AND user_id = $2`,
    [input.bookingId, userId]
  );
  if (booking.rows.length === 0) throw new HttpError(404, 'Booking not found');

  const { status, ended } = booking.rows[0];
  if (status !== 'approved' && status !== 'completed') {
    throw new HttpError(409, 'Only confirmed stays can be reviewed');
  }
  if (!ended) throw new HttpError(409, 'You can leave a review after your check-out date');
  throw new HttpError(409, 'This stay cannot be reviewed');
}

// "Thabo Mokoena" becomes "Thabo M."
function displayName(fullName: string, deleted: boolean) {
  if (deleted) return 'Former guest';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export async function listHotelReviews(hotelId: string, limit = 10) {
  const summary = await pool.query(
    `SELECT COUNT(*)::int AS count, COALESCE(ROUND(AVG(rating), 1), 0) AS average
     FROM reviews WHERE hotel_id = $1`,
    [hotelId]
  );

  const rows = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name, (u.deleted_at IS NOT NULL) AS deleted
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.hotel_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2`,
    [hotelId, limit]
  );

  return {
    count: summary.rows[0].count as number,
    average: Number(summary.rows[0].average), // AVG comes back as text from PostgreSQL
    items: rows.rows.map((row) => ({
      id: row.id as string,
      rating: row.rating as number,
      comment: row.comment as string | null,
      created_at: row.created_at as string,
      author: displayName(row.full_name, row.deleted),
    })),
  };
}

export async function deleteReview(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM reviews WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}