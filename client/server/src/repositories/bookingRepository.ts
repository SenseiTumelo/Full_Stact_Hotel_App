import crypto from 'crypto';
import { pool } from '../config/db';
import { HttpError } from '../utils/httpError';
import { nightsBetween } from '../utils/dates';

/* ---------- Availability ---------- */

// Rooms still free = total rooms minus the BUSIEST night's bookings.
// We count per night, because two bookings that don't overlap shouldn't block each other.
export const availabilitySql = (roomFilter: string) => `
  SELECT rt.id AS room_type_id,
         rt.total_rooms - COALESCE((
           SELECT MAX(booked) FROM (
             SELECT COALESCE(SUM(b.rooms), 0) AS booked
             FROM generate_series($2::date::timestamp, ($3::date - 1)::timestamp, interval '1 day') AS night
             LEFT JOIN bookings b
               ON b.room_type_id = rt.id
              AND b.status IN ('pending', 'approved')
              AND b.check_in <= night::date
              AND b.check_out > night::date
              AND ($4::uuid IS NULL OR b.id <> $4::uuid)
             GROUP BY night
           ) per_night
         ), 0) AS available
  FROM room_types rt
  WHERE ${roomFilter}`;

export async function findAvailability(hotelId: string, checkIn: string, checkOut: string) {
 const result = await pool.query(availabilitySql('rt.hotel_id = $1'), [hotelId, checkIn, checkOut, null]);
  return result.rows.map((row) => ({
    room_type_id: row.room_type_id as string,
    available: Math.max(0, Number(row.available)), // SUM() comes back as text, so convert it
  }));
}

/* ---------- Reading bookings ---------- */

export const BOOKING_SELECT = `
  SELECT b.id, b.booking_reference, b.status, b.check_in, b.check_out, b.rooms, b.guests,
         b.total_price, b.guest_name, b.guest_email, b.guest_phone, b.special_request, b.created_at,
         rt.name AS room_name, rt.currency,
         h.id AS hotel_id, h.name AS hotel_name, h.city AS hotel_city,
         (SELECT url FROM hotel_images WHERE hotel_id = h.id ORDER BY position LIMIT 1) AS cover_image,
         (SELECT status FROM payments WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) AS payment_status,
         (SELECT status FROM payments WHERE booking_id = b.id ORDER BY created_at DESC LIMIT 1) AS payment_status,
         EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = b.id) AS has_review
  FROM bookings b
  JOIN room_types rt ON rt.id = b.room_type_id
  JOIN hotels h ON h.id = rt.hotel_id`;

export async function findBookingForUser(id: string, userId: string) {
  const result = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1 AND b.user_id = $2`, [id, userId]);
  return result.rows[0] ?? null;
}

export async function findBookingsByUser(userId: string) {
  const result = await pool.query(
    `${BOOKING_SELECT} WHERE b.user_id = $1 ORDER BY b.check_in DESC`,
    [userId]
  );
  return result.rows;
}

/* ---------- Creating a booking ---------- */

export type NewBooking = {
  userId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequest?: string;
};

// No 0/O or 1/I, so references are easy to read out loud
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeReference() {
  let code = '';
  for (let i = 0; i < 6; i++) code += REF_ALPHABET[crypto.randomInt(REF_ALPHABET.length)];
  return `STY-${code}`;
}

export async function createBooking(input: NewBooking) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock this room type until we finish. Two people booking the last room at the same
    // moment now queue up one behind the other, instead of both succeeding.
    const roomResult = await client.query(
      'SELECT id, capacity, price_per_night FROM room_types WHERE id = $1 FOR UPDATE',
      [input.roomTypeId]
    );
    const room = roomResult.rows[0];
    if (!room) throw new HttpError(404, 'Room type not found');

    if (input.guests > room.capacity * input.rooms) {
      throw new HttpError(400, `This room sleeps ${room.capacity} guests per room`);
    }

    const availability = await client.query(availabilitySql('rt.id = $1'), [
      input.roomTypeId,
      input.checkIn,
      input.checkOut,
      null
    ]);
    if (Number(availability.rows[0].available) < input.rooms) {
      throw new HttpError(409, 'Not enough rooms are available for those dates');
    }

    // Price in whole cents, so we never get floating point errors like 0.1 + 0.2
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const cents = Math.round(Number(room.price_per_night) * 100);
    const total = ((cents * nights * input.rooms) / 100).toFixed(2);

    const inserted = await client.query(
      `INSERT INTO bookings
         (user_id, room_type_id, check_in, check_out, rooms, guests, total_price,
          booking_reference, guest_name, guest_email, guest_phone, special_request)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        input.userId, input.roomTypeId, input.checkIn, input.checkOut, input.rooms, input.guests,
        total, makeReference(), input.guestName, input.guestEmail, input.guestPhone,
        input.specialRequest || null,
      ]
    );

    await client.query('COMMIT');
    return findBookingForUser(inserted.rows[0].id, input.userId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/* ---------- Cancelling ---------- */

export async function cancelBooking(id: string, userId: string) {
  const result = await pool.query(
    `UPDATE bookings SET status = 'cancelled'
     WHERE id = $1 AND user_id = $2
       AND status IN ('pending', 'approved')
       AND check_in > CURRENT_DATE
       AND NOT EXISTS (
         SELECT 1 FROM payments p WHERE p.booking_id = bookings.id AND p.status = 'paid'
       )
     RETURNING id`,
    [id, userId]
  );

  if (!result.rowCount) {
    const exists = await pool.query('SELECT 1 FROM bookings WHERE id = $1 AND user_id = $2', [id, userId]);
    if (exists.rows.length === 0) throw new HttpError(404, 'Booking not found');

    const paid = await pool.query(`SELECT 1 FROM payments WHERE booking_id = $1 AND status = 'paid'`, [id]);
    if (paid.rows.length > 0) {
      throw new HttpError(409, 'This booking was paid online. Please contact the hotel to cancel and arrange a refund.');
    }
    throw new HttpError(409, 'This booking can no longer be cancelled');
  }

  return findBookingForUser(id, userId);
}