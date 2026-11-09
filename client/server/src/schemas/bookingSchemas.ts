import { z } from 'zod';

const uuid = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  'Invalid id'
);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');

export const createBookingSchema = z.object({
  roomTypeId: uuid,
  checkIn: isoDate,
  checkOut: isoDate,
  rooms: z.number().int().min(1).max(10),
  guests: z.number().int().min(1).max(20),
  guestName: z.string().trim().min(2).max(100),
  guestEmail: z.string().trim().max(254).email(),
  guestPhone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number'),
  specialRequest: z.string().trim().max(500).optional(),
});