import type { Request, Response } from 'express';
import { createBookingSchema } from '../schemas/bookingSchemas';
import { validateStay } from '../utils/dates';
import { HttpError } from '../utils/httpError';
import {
  cancelBooking,
  createBooking,
  findAvailability,
  findBookingsByUser,
} from '../repositories/bookingRepository';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function handleError(err: unknown, res: Response) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
}

// GET /hotels/:id/availability?checkIn=...&checkOut=...   (public)
export async function getAvailability(req: Request, res: Response) {
  const id = String(req.params.id);
  const checkIn = String(req.query.checkIn ?? '');
  const checkOut = String(req.query.checkOut ?? '');

  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid hotel id' });
    return;
  }
  const problem = validateStay(checkIn, checkOut);
  if (problem) {
    res.status(400).json({ message: problem });
    return;
  }

  try {
    res.json(await findAvailability(id, checkIn, checkOut));
  } catch (err) {
    handleError(err, res);
  }
}

// POST /bookings
export async function createMyBooking(req: Request, res: Response) {
  const parsed = createBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    res.status(400).json({ message: `${issue.path.join('.')}: ${issue.message}` });
    return;
  }

  const problem = validateStay(parsed.data.checkIn, parsed.data.checkOut);
  if (problem) {
    res.status(400).json({ message: problem });
    return;
  }

  try {
    const booking = await createBooking({ userId: req.user!.id, ...parsed.data });
    res.status(201).json(booking);
  } catch (err) {
    handleError(err, res);
  }
}

// GET /bookings/me
export async function getMyBookings(req: Request, res: Response) {
  try {
    res.json(await findBookingsByUser(req.user!.id));
  } catch (err) {
    handleError(err, res);
  }
}

// PATCH /bookings/:id/cancel
export async function cancelMyBooking(req: Request, res: Response) {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid booking id' });
    return;
  }

  try {
    res.json(await cancelBooking(id, req.user!.id));
  } catch (err) {
    handleError(err, res);
  }
}