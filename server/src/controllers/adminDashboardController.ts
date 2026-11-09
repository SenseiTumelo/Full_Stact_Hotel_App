import type { Request, Response } from 'express';
import { z } from 'zod';
import { getAdminDashboard, listAdminReviews } from '../repositories/adminBookingRepository';
import { sendError } from '../utils/httpError';

const reviewQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  q: z.string().trim().max(100).optional(),
});
const PAGE_SIZE = 20;

export async function getAdminDashboardHandler(_req: Request, res: Response) {
  try {
    res.json(await getAdminDashboard());
  } catch (err) {
    sendError(err, res);
  }
}

export async function listAdminReviewsHandler(req: Request, res: Response) {
  const parsed = reviewQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid filter' });
    return;
  }
  try {
    res.json(await listAdminReviews(parsed.data.page, PAGE_SIZE, parsed.data.q || undefined));
  } catch (err) {
    sendError(err, res);
  }
}
