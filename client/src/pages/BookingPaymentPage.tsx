import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { createPaymentIntentRequest } from '../services/api';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearDraft, markPaidOnline } from '../store/slices/bookingSlice';
import Breadcrumbs from '../components/layout/Breadcrumbs';
import StepIndicator from '../components/bookings/StepIndicator';
import CheckoutForm from '../components/bookings/CheckoutForm';
import Button from '../components/ui/Button';
import { getErrorMessage } from '../utils/errors';
import { formatDate, formatPrice } from '../utils/booking';
import { ArrowRight } from 'lucide-react';

type Method = 'online' | 'hotel';

export default function BookingPaymentPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { confirmed: booking, paidOnline } = useAppSelector((state) => state.booking);

  const [method, setMethod] = useState<Method>('online');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState('');

  // The booking exists now, so the draft is finished. Clearing it stops the Back button
  // from creating a second booking.
  useEffect(() => {
    dispatch(clearDraft());
  }, [dispatch]);

  const bookingId = booking?.id;

  useEffect(() => {
    if (!bookingId || method !== 'online') return;

    let cancelled = false;
    setError('');
    createPaymentIntentRequest(bookingId)
      .then((data) => {
        if (!cancelled) setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });

    // If the effect runs again (or the page closes), ignore the old answer
    return () => {
      cancelled = true;
    };
  }, [bookingId, method]);

  if (!booking) return <Navigate to="/my-trips" replace />;
  if (paidOnline) return <Navigate to="/booking/confirmed" replace />;

  return (
    <main className="container section">
      <Breadcrumbs
        items={[
          { label: 'Hotels', to: '/' },
          { label: booking.hotel_name, to: `/hotels/${booking.hotel_id}` },
          { label: 'Payment' },
        ]}
      />
      <h1 className="page-title">Payment</h1>
      <p className="page-subtitle">Your booking {booking.booking_reference} is saved. Choose how to pay.</p>

      <StepIndicator current={3} />

      <div className="booking-layout">
        <div className="form-card">
          <h2>How would you like to pay?</h2>

          <label className="pay-option">
            <input
              type="radio"
              name="method"
              checked={method === 'online'}
              onChange={() => setMethod('online')}
            />
            <span>
              <strong>Pay online now</strong>
              <span className="summary-muted" style={{ display: 'block' }}>
                Secure card payment, processed by Stripe.
              </span>
            </span>
          </label>

          <label className="pay-option">
            <input
              type="radio"
              name="method"
              checked={method === 'hotel'}
              onChange={() => setMethod('hotel')}
            />
            <span>
              <strong>Pay at the hotel</strong>
              <span className="summary-muted" style={{ display: 'block' }}>
                No payment now. You pay when you arrive.
              </span>
            </span>
          </label>

          {method === 'online' && (
            <>
              {error && <p role="alert" className="form-error">{error}</p>}
              {!clientSecret && !error && <p className="summary-muted">Loading secure payment form...</p>}
              {clientSecret && (
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#4b3f2a',
                        fontFamily: 'Inter, sans-serif',
                        borderRadius: '12px',
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    total={booking.total_price}
                    onPaid={() => {
                      dispatch(markPaidOnline());
                      navigate('/booking/confirmed');
                    }}
                  />
                </Elements>
              )}
            </>
          )}

          {method === 'hotel' && (
            <Button variant="dark" onClick={() => navigate('/booking/confirmed')}>
              Confirm without paying now
            </Button>
          )}
        </div>

        <aside className="summary-card" aria-label="Booking summary">
          <p className="eyebrow">Your booking</p>
          <h2>{booking.hotel_name}</h2>
          <p className="summary-muted">{booking.room_name}</p>
          <hr />
          <p style={{ margin: 0 }}>
            {formatDate(booking.check_in)} <ArrowRight size={14} /> {formatDate(booking.check_out)}
          </p>
          <p className="summary-muted">
            {booking.rooms} room{booking.rooms === 1 ? '' : 's'} · {booking.guests} guest{booking.guests === 1 ? '' : 's'}
          </p>
          <hr />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(booking.total_price)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
