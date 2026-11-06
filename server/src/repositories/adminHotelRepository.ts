import type { PoolClient } from 'pg';
import { pool } from '../config/db';
import { HttpError } from '../utils/httpError';
import type { HotelInput, HotelUpdate, RoomTypeInput, RoomTypeUpdate } from '../schemas/hotelSchemas';

/* ---------- Hotels ---------- */

// Replace a hotel's amenity list with exactly the ids given
async function setAmenities(client: PoolClient, hotelId: string, amenityIds: number[]) {
  await client.query('DELETE FROM hotel_amenities WHERE hotel_id = $1', [hotelId]);
  if (amenityIds.length === 0) return;
  try {
    await client.query(
      'INSERT INTO hotel_amenities (hotel_id, amenity_id) SELECT $1::uuid, unnest($2::int[])',
      [hotelId, amenityIds]
    );
  } catch (err) {
    // 23503 = foreign key violation: one of the ids is not in the amenities table
    if ((err as { code?: string }).code === '23503') {
      throw new HttpError(400, 'One of the selected amenities does not exist');
    }
    throw err;
  }
}

export async function createHotel(input: HotelInput): Promise<string> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const created = await client.query(
      `INSERT INTO hotels
         (name, description, address, city, country, latitude, longitude, star_rating, policies)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        input.name, input.description || null, input.address, input.city, input.country,
        input.latitude, input.longitude, input.starRating, input.policies || null,
      ]
    );
    const id = created.rows[0].id as string;
    await setAmenities(client, id, input.amenityIds);
    await client.query('COMMIT');
    return id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Our own list of editable fields, mapped to column names. User input never becomes SQL text.
const HOTEL_COLUMNS = {
  name: 'name',
  description: 'description',
  address: 'address',
  city: 'city',
  country: 'country',
  latitude: 'latitude',
  longitude: 'longitude',
  starRating: 'star_rating',
  policies: 'policies',
} as const;

export async function updateHotel(id: string, input: HotelUpdate): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const exists = await client.query('SELECT id FROM hotels WHERE id = $1 FOR UPDATE', [id]);
    if (exists.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const sets: string[] = [];
    const values: unknown[] = [];
    for (const [key, column] of Object.entries(HOTEL_COLUMNS)) {
      const value = input[key as keyof typeof HOTEL_COLUMNS];
      if (value !== undefined) {
        values.push(value === '' ? null : value); // an empty text box clears the field
        sets.push(`${column} = $${values.length}`);
      }
    }
    if (sets.length > 0) {
      values.push(id);
      await client.query(`UPDATE hotels SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
    }

    if (input.amenityIds) await setAmenities(client, id, input.amenityIds);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Returns the image urls (so the files can be deleted), or null if the hotel does not exist
export async function deleteHotel(id: string): Promise<string[] | null> {
  const booked = await pool.query(
    `SELECT 1 FROM bookings b JOIN room_types rt ON rt.id = b.room_type_id
     WHERE rt.hotel_id = $1 LIMIT 1`,
    [id]
  );
  if (booked.rows.length > 0) {
    throw new HttpError(409, 'This hotel has bookings, so it cannot be deleted.');
  }

  const images = await pool.query('SELECT url FROM hotel_images WHERE hotel_id = $1', [id]);
  const result = await pool.query('DELETE FROM hotels WHERE id = $1', [id]);
  if (!result.rowCount) return null;
  return images.rows.map((row) => row.url as string);
}

export async function deleteHotelImage(hotelId: string, imageId: string): Promise<string | null> {
  const result = await pool.query(
    'DELETE FROM hotel_images WHERE id = $1 AND hotel_id = $2 RETURNING url',
    [imageId, hotelId]
  );
  return result.rows[0]?.url ?? null;
}

/* ---------- Room types ---------- */

export async function createRoomType(hotelId: string, input: RoomTypeInput): Promise<string | null> {
  const hotel = await pool.query('SELECT 1 FROM hotels WHERE id = $1', [hotelId]);
  if (hotel.rows.length === 0) return null;

  const result = await pool.query(
    `INSERT INTO room_types (hotel_id, name, description, capacity, price_per_night, total_rooms)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [
      hotelId, input.name, input.description || null, input.capacity,
      input.pricePerNight.toFixed(2), input.totalRooms,
    ]
  );
  return result.rows[0].id as string;
}

// The most rooms of this type that are booked on any single future night
const PEAK_BOOKED_SQL = `
  SELECT COALESCE(MAX(booked), 0) AS peak FROM (
    SELECT SUM(b.rooms) AS booked
    FROM bookings b
    CROSS JOIN LATERAL generate_series(
      b.check_in::timestamp, (b.check_out - 1)::timestamp, interval '1 day'
    ) AS night
    WHERE b.room_type_id = $1
      AND b.status IN ('pending', 'approved')
      AND b.check_out > CURRENT_DATE
    GROUP BY night
  ) per_night`;

const ROOM_COLUMNS = {
  name: 'name',
  description: 'description',
  capacity: 'capacity',
  pricePerNight: 'price_per_night',
  totalRooms: 'total_rooms',
} as const;

// Returns the hotel id, or null if the room type does not exist
export async function updateRoomType(id: string, input: RoomTypeUpdate): Promise<string | null> {
  const room = await pool.query('SELECT hotel_id FROM room_types WHERE id = $1', [id]);
  if (room.rows.length === 0) return null;

  // Never allow fewer rooms than guests have already booked on one night
  if (input.totalRooms !== undefined) {
    const peak = Number((await pool.query(PEAK_BOOKED_SQL, [id])).rows[0].peak);
    if (input.totalRooms < peak) {
      throw new HttpError(409, `${peak} rooms are already booked on one night, so you cannot go below ${peak}.`);
    }
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, column] of Object.entries(ROOM_COLUMNS)) {
    const value = input[key as keyof typeof ROOM_COLUMNS];
    if (value !== undefined) {
      values.push(key === 'pricePerNight' ? Number(value).toFixed(2) : value === '' ? null : value);
      sets.push(`${column} = $${values.length}`);
    }
  }
  if (sets.length > 0) {
    values.push(id);
    await pool.query(`UPDATE room_types SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
  }

  return room.rows[0].hotel_id as string;
}

export async function deleteRoomType(id: string): Promise<boolean> {
  const booked = await pool.query('SELECT 1 FROM bookings WHERE room_type_id = $1 LIMIT 1', [id]);
  if (booked.rows.length > 0) {
    throw new HttpError(409, 'This room type has bookings, so it cannot be deleted. Reduce its rooms instead.');
  }
  const result = await pool.query('DELETE FROM room_types WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}