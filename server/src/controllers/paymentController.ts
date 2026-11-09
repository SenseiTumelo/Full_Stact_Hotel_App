import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { z } from 'zod';
import { env } from '../config/env';
import { stripe } from '../config/stripe';
import {
  findPayableBooking,
  findPaymentByRef,
  hasPaidPayment,
  savePendingPayment,
  updatePaymentStatus,
} from '../repositories/paymentRepository';

const bodySchema = z.object({
  bookingId: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
});

// POST /payments/intent  (logged-in users only)
export async function createPaymentIntent(req: Request, res: Response) {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid booking id' });
    return;
  }
  const { bookingId } = parsed.data;

  try {
    const booking = await findPayableBooking(bookingId, req.user!.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    if (booking.status !== 'pending' && booking.status !== 'approved') {
      res.status(409).json({ message: 'This booking can no longer be paid' });
      return;
    }
    if (await hasPaidPayment(bookingId)) {
      res.status(409).json({ message: 'This booking has already been paid' });
      return;
    }

    // Stripe works in the smallest currency unit (cents), as a whole number
    const amount = Math.round(Number(booking.total_price) * 100);
    const currency = String(booking.currency).toLowerCase();

    const intent = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        allowed_payment_method_types: ['card'],
        metadata: { booking_id: bookingId },
      },
      // Same key = same PaymentIntent, so a double click never creates two payments
      { idempotencyKey: `booking-${bookingId}-payment` }
    );

    await savePendingPayment(bookingId, intent.id, amount);
    res.json({ clientSecret: intent.client_secret, amount, currency });
  } catch (err) {
    console.error(err);
    res.status(502).json({ message: 'Could not start the payment. Please try again.' });
  }
}

/* ---------- Webhook ---------- */

async function handleSucceeded(intent: Stripe.PaymentIntent) {
  const payment = await findPaymentByRef(intent.id);
  // Not ours, or Stripe sent this event twice: nothing to do
  if (!payment || payment.status === 'paid' || payment.status === 'refunded') return;

  // The guest cancelled while the payment was in progress: give the money back
  if (payment.booking_status === 'cancelled') {
    await stripe.refunds.create({ payment_intent: intent.id });
    await updatePaymentStatus(intent.id, 'refunded');
    return;
  }

  await updatePaymentStatus(intent.id, 'paid');
}

async function handleFailed(intent: Stripe.PaymentIntent) {
  const payment = await findPaymentByRef(intent.id);
  if (!payment || payment.status !== 'pending') return;
  await updatePaymentStatus(intent.id, 'failed');
}

// POST /payments/webhook  (called by Stripe, not by our React app)
export async function stripeWebhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    res.status(400).send('Missing signature');
    return;
  }

  let event: Stripe.Event;
  try {
    // Proves the request really came from Stripe and was not changed on the way
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch {
    res.status(400).send('Invalid signature');
    return;
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      await handleSucceeded(event.data.object as Stripe.PaymentIntent);
    } else if (event.type === 'payment_intent.payment_failed') {
      await handleFailed(event.data.object as Stripe.PaymentIntent);
    }
    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).send('Webhook handler failed'); // Stripe will retry later
  }
}
