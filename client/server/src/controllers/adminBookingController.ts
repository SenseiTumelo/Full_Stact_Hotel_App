import type { Request, Response } from 'express';
import { bookingListQuerySchema, modifyBookingSchema } from '../schemas/adminBookingSchemas';
import {
  approveBooking,
  findBookingAdmin,
  findPaidPayment,
  listBookings,
  markCompleted,
  markCancelled,
  modifyBooking,
} from '../repositories/adminBookingRepository';
import { updatePaymentStatus } from '../repositories/paymentRepository';
import { stripe } from '../config/stripe';
import { validateStay } from '../utils/dates';
import { HttpError, sendError } from '../utils/httpError';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 20;

function readId(req: Request, res: Response): string | null {
  const id = String(req.params.id);
  if (!UUID_REGEX.test(id)) {
    res.status(400).json({ message: 'Invalid booking id' });
    return null;
  }
  return id;
}

export async function listBookingsHandler(req: Request, res: Response) {
  const parsed = bookingListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid filter' });
    return;
  }
  try {
    res.json(
      await listBookings({
        status: parsed.data.status,
        search: parsed.data.q || undefined,
        page: parsed.data.page,
        pageSize: PAGE_SIZE,
      })
    );
  } catch (err) {
    sendError(err, res);
  }
}

export async function getBookingHandler(req: Request, res: Response) {
  const id = readId(req, res);
  if (!id) return;
  try {
    const booking = await findBookingAdmin(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (err) {
    sendError(err, res);
  }
}

export async function approveBookingHandler(req: Request, res: Response) {
  const id = readId(req, res);
  if (!id) return;
  try {
    await approveBooking(id);
    res.json(await findBookingAdmin(id));
  } catch (err) {
    sendError(err, res);
  }
}

export async function completeBookingHandler(req: Request, res: Response) {
  const id = readId(req, res);
  if (!id) return;
  try {
    await markCompleted(id);
    res.json(await findBookingAdmin(id));
  } catch (err) {
    sendError(err, res);
  }
}

export async function cancelBookingHandler(req: Request, res: Response) {
  const id = readId(req, res);
  if (!id) return;

  try {
    const booking = await findBookingAdmin(id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      res.status(409).json({ message: 'This booking can no longer be cancelled' });
      return;
    }

    // Refund FIRST. If Stripe fails we stop here and nothing has changed.
    const paid = await findPaidPayment(id);
    if (paid) {
      if (!stripe) {
        throw new HttpError(502, 'Online payments are not configured, so this booking cannot be refunded or cancelled.');
      }
      try {
        await stripe.refunds.create(
          { payment_intent: paid.provider_ref },
          // Same key = the same refund, so a retry can never refund twice
          { idempotencyKey: `refund-${paid.provider_ref}` }
        );
      } catch (err) {
        // Already refunded (for example from the Stripe dashboard): carry on and update our records
        if ((err as { code?: string }).code !== 'charge_already_refunded') {
          console.error(err);
          throw new HttpError(
            502,
            'The refund could not be processed, so the booking was not cancelled. Please try again, or refund it from the Stripe dashboard.'
          );
        }
      }
      await updatePaymentStatus(paid.provider_ref, 'refunded');
    }

    await markCancelled(id);
    res.json(await findBookingAdmin(id));
  } catch (err) {
    sendError(err, res);
  }
}

export async function modifyBookingHandler(req: Request, res: Response) {
  const id = readId(req, res);
  if (!id) return;

  const parsed = modifyBookingSchema.safeParse(req.body);
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
    res.json(await modifyBooking(id, parsed.data));
  } catch (err) {
    sendError(err, res);
  }
}
