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
            MIN(rt.price_per_night) AS min_price
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
      `SELECT a.name FROM amenities a
       JOIN hotel_amenities ha ON ha.amenity_id = a.id
       WHERE ha.hotel_id = $1 ORDER BY a.name`,
      [id]
    ),
    pool.query(
      `SELECT id, name, capacity, price_per_night, currency, description
       FROM room_types WHERE hotel_id = $1 ORDER BY price_per_night`,
      [id]
    ),
  ]);

  return {
    ...hotelResult.rows[0],
    images: images.rows,
    amenities: amenities.rows.map((row) => row.name),
    room_types: rooms.rows,
  };
}