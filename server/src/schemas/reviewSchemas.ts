import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid id'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});