import { pool } from '../config/db';

export type HotelFilters = {
  city?: string;
  minStars?: number;
  maxPrice?: number;
};

export async function findAllHotels(filters: HotelFilters = {}) {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.city) {
    values.push(`%${filters.city}%`);
    conditions.push(`h.city ILIKE $${values.length}`);
  }
  if (filters.minStars) {
    values.push(filters.minStars);
    conditions.push(`h.star_rating >= $${values.length}`);
  }
  if (filters.maxPrice) {
    values.push(filters.maxPrice);
    conditions.push(`rt.price_per_night <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await pool.query(
    `SELECT h.id, h.name, h.city, h.country, h.star_rating,
        MIN(rt.price_per_night) AS min_price,
        (SELECT url FROM hotel_images WHERE hotel_id = h.id ORDER BY position LIMIT 1) AS cover_image,
        (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE hotel_id = h.id) AS avg_rating,
        (SELECT COUNT(*)::int FROM reviews WHERE hotel_id = h.id) AS review_count
     FROM hotels h
     LEFT JOIN room_types rt ON rt.hotel_id = h.id
     ${where}
     GROUP BY h.id
     ORDER BY h.name`,
    values
  );
  return result.rows;
}

export async function findHotelById(id: string) {
  const hotelResult = await pool.query(
    `SELECT id, name, description, address, city, country,
            latitude, longitude, star_rating, policies
     FROM hotels WHERE id = $1`,
    [id]
  );

  if (hotelResult.rows.length === 0) return null;

  // Run the three related queries at the same time
  const [images, amenities, rooms] = await Promise.all([
    pool.query('SELECT id, url FROM hotel_images WHERE hotel_id = $1 ORDER BY position', [id]),
    pool.query(
      `SELECT a.id, a.name FROM amenities a
       JOIN hotel_amenities ha ON ha.amenity_id = a.id
       WHERE ha.hotel_id = $1 ORDER BY a.name`,
      [id]
    ),
    pool.query(
      `SELECT rt.id, rt.name, rt.capacity, rt.price_per_night, rt.currency, rt.description, rt.total_rooms,
         COALESCE((SELECT json_agg(json_build_object('id', rti.id, 'url', rti.url) ORDER BY rti.position)
                   FROM room_type_images rti WHERE rti.room_type_id = rt.id), '[]'::json) AS images
       FROM room_types rt WHERE rt.hotel_id = $1 ORDER BY rt.price_per_night`,
      [id]
    ),
  ]);

  return {
    ...hotelResult.rows[0],
    images: images.rows,
    amenities: amenities.rows.map((row) => row.name),
    amenity_ids: amenities.rows.map((row) => row.id),
    room_types: rooms.rows,
    
  };
}

export async function hotelExists(id: string) {
  const result = await pool.query('SELECT 1 FROM hotels WHERE id = $1', [id]);
  return result.rows.length > 0;
}

export async function addHotelImages(hotelId: string, urls: string[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const last = await client.query(
      'SELECT COALESCE(MAX(position), -1) AS last FROM hotel_images WHERE hotel_id = $1',
      [hotelId]
    );
    let position = Number(last.rows[0].last);

    const inserted = [];
    for (const url of urls) {
      position += 1;
      const result = await client.query(
        `INSERT INTO hotel_images (hotel_id, url, position)
         VALUES ($1, $2, $3) RETURNING id, url, position`,
        [hotelId, url, position]
      );
      inserted.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return inserted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function findAllAmenities() {
  const result = await pool.query('SELECT id, name FROM amenities ORDER BY name');
  return result.rows;
}
