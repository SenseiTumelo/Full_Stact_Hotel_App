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