import { pool } from '../config/db';
import { HttpError } from '../utils/httpError';
import { nightsBetween, todayIso } from '../utils/dates';
import { BOOKING_SELECT, availabilitySql } from './bookingRepository';

/* ---------- Reading ---------- */

type ListFilters = { status?: string; search?: string; page: number; pageSize: number };

export async function listBookings(filters: ListFilters) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`b.status = $${values.length}`);
  }
  if (filters.search) {
    // Escape % and _ so they are searched for literally, not used as wildcards
    values.push(`%${filters.search.replace(/[\\%_]/g, '\\$&')}%`);
    const n = values.length;
    conditions.push(`(b.guest_name ILIKE $${n} OR b.guest_email ILIKE $${n} OR b.booking_reference ILIKE $${n})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const count = await pool.query(`SELECT COUNT(*) AS total FROM bookings b ${where}`, values);

  const rows = await pool.query(
    `${BOOKING_SELECT} ${where}
     ORDER BY (b.status = 'pending') DESC, b.created_at DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, filters.pageSize, (filters.page - 1) * filters.pageSize]
  );

  return {
    items: rows.rows,
    total: Number(count.rows[0].total),
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function findBookingAdmin(id: string) {
  const result = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function findPaidPayment(bookingId: string): Promise<{ provider_ref: string } | null> {
  const result = await pool.query(
    `SELECT provider_ref FROM payments WHERE booking_id = $1 AND status = 'paid' LIMIT 1`,
    [bookingId]
  );
  return result.rows[0] ?? null;
}

/* ---------- Status changes ---------- */

async function bookingExists(id: string) {
  const result = await pool.query('SELECT 1 FROM bookings WHERE id = $1', [id]);
  return result.rows.length > 0;
}

export async function approveBooking(id: string) {
  // The status check is inside the UPDATE, so two admins clicking at once cannot both succeed
  const result = await pool.query(
    `UPDATE bookings SET status = 'approved' WHERE id = $1 AND status = 'pending'`,
    [id]
  );
  if (!result.rowCount) {
    if (!(await bookingExists(id))) throw new HttpError(404, 'Booking not found');
    throw new HttpError(409, 'Only pending bookings can be approved');
  }
}

export async function markCancelled(id: string) {
  const result = await pool.query(
    `UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND status IN ('pending', 'approved')`,
    [id]
  );
  if (!result.rowCount) throw new HttpError(409, 'This booking can no longer be cancelled');
}

/* ---------- Modifying ---------- */

export type ModifyInput = { checkIn: string; checkOut: string; rooms: number; guests: number };

export async function modifyBooking(id: string, input: ModifyInput) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the room type first (the same order createBooking uses), so changes to
    // bookings of one room type queue up instead of racing each other
    await client.query(
      'SELECT id FROM room_types WHERE id = (SELECT room_type_id FROM bookings WHERE id = $1) FOR UPDATE',
      [id]
    );

    const found = await client.query(
      `SELECT b.status, b.room_type_id, b.check_in, b.check_out, b.rooms, b.total_price, rt.capacity
       FROM bookings b
       JOIN room_types rt ON rt.id = b.room_type_id
       WHERE b.id = $1
       FOR UPDATE OF b`,
      [id]
    );
    const current = found.rows[0];
    if (!current) throw new HttpError(404, 'Booking not found');
    if (current.status !== 'pending' && current.status !== 'approved') {
      throw new HttpError(409, 'Only pending or approved bookings can be modified');
    }
    if (current.check_in < todayIso()) {
      throw new HttpError(409, 'This stay has already started and cannot be changed');
    }
    if (input.guests > current.capacity * input.rooms) {
      throw new HttpError(400, `This room type sleeps ${current.capacity} guests per room`);
    }

    // Availability, ignoring this booking's own rooms
    const availability = await client.query(availabilitySql('rt.id = $1'), [
      current.room_type_id,
      input.checkIn,
      input.checkOut,
      id,
    ]);
    if (Number(availability.rows[0].available) < input.rooms) {
      throw new HttpError(409, 'Not enough rooms are available for the new dates');
    }

    // Keep the booking's original nightly rate (in cents), so changes never silently re-price it
    const oldCents = Math.round(Number(current.total_price) * 100);
    const oldNights = nightsBetween(current.check_in, current.check_out);
    const rateCents = oldCents / (oldNights * current.rooms);
    const newCents = Math.round(
      rateCents * nightsBetween(input.checkIn, input.checkOut) * input.rooms
    );

    if (newCents !== oldCents) {
      const payments = await client.query('SELECT 1 FROM payments WHERE booking_id = $1 LIMIT 1', [id]);
      if (payments.rows.length > 0) {
        throw new HttpError(
          409,
          'This booking has a payment attached, so changes that alter the total are not allowed. Cancel it and create a new booking instead.'
        );
      }
    }

    await client.query(
      `UPDATE bookings
       SET check_in = $2, check_out = $3, rooms = $4, guests = $5, total_price = $6
       WHERE id = $1`,
      [id, input.checkIn, input.checkOut, input.rooms, input.guests, (newCents / 100).toFixed(2)]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return findBookingAdmin(id);
}