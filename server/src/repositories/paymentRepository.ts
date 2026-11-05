import { pool } from '../config/db';

export async function findPayableBooking(bookingId: string, userId: string) {
  const result = await pool.query(
    `SELECT b.id, b.status, b.total_price, rt.currency
     FROM bookings b
     JOIN room_types rt ON rt.id = b.room_type_id
     WHERE b.id = $1 AND b.user_id = $2`,
    [bookingId, userId]
  );
  return result.rows[0] ?? null;
}

export async function hasPaidPayment(bookingId: string) {
  const result = await pool.query(
    `SELECT 1 FROM payments WHERE booking_id = $1 AND status = 'paid'`,
    [bookingId]
  );
  return result.rows.length > 0;
}

export async function savePendingPayment(bookingId: string, providerRef: string, amountCents: number) {
  await pool.query(
    `INSERT INTO payments (booking_id, provider, provider_ref, amount)
     VALUES ($1, 'stripe', $2, $3)
     ON CONFLICT (provider_ref) DO NOTHING`,
    [bookingId, providerRef, (amountCents / 100).toFixed(2)]
  );
}

export async function findPaymentByRef(providerRef: string) {
  const result = await pool.query(
    `SELECT p.id, p.status, p.booking_id, b.status AS booking_status
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     WHERE p.provider_ref = $1`,
    [providerRef]
  );
  return result.rows[0] ?? null;
}

export async function updatePaymentStatus(providerRef: string, status: 'paid' | 'failed' | 'refunded') {
  await pool.query('UPDATE payments SET status = $2 WHERE provider_ref = $1', [providerRef, status]);
}