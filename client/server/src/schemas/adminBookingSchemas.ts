import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');

export const bookingListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'cancelled', 'completed']).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});

export const modifyBookingSchema = z.object({
  checkIn: isoDate,
  checkOut: isoDate,
  rooms: z.number().int().min(1).max(10),
  guests: z.number().int().min(1).max(20),
});