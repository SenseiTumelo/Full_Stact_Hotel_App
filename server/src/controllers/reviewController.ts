import type { Request, Response } from 'express';
import { createReviewSchema } from '../schemas/reviewSchemas';
import { hotelExists } from '../repositories/hotelRepository';
import { createReview, deleteReview, listHotelReviews } from '../repositories/reviewRepository';
import { sendError } from '../utils/httpError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /reviews  (logged-in guests)
export async function createReviewHandler(req: Request, res: Response) {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    res.status(400).json({ message: `${issue.path.join('.')}: ${issue.message}` });
    return;
  }
  try {
    const created = await createReview(req.user!.id, parsed.data);
    res.status(201).json({ id: created.id, hotelId: created.hotel_id });
  } catch (err) {
    sendError(err, res);
  }
}

// GET /hotels/:id/reviews  (public)
export async function getHotelReviewsHandler(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }
  try {
    if (!(await hotelExists(id))) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }
    res.json(await listHotelReviews(id));
  } catch (err) {
    sendError(err, res);
  }
}

// DELETE /admin/reviews/:id  (admins only, for moderation)
export async function deleteReviewHandler(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid review id' });
    return;
  }
  try {
    if (!(await deleteReview(id))) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    sendError(err, res);
  }
}