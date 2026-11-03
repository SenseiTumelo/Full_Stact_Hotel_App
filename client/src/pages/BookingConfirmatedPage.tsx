import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearDraft } from '../store/slices/bookingSlice';
import StepIndicator from '../components/bookings/StepIndicator';
import { formatDate, formatPrice } from '../utils/booking';

export default function BookingConfirmedPage() {
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => state.booking.confirmed);

  // The booking is saved, so the draft is finished. Clearing it stops a second submit via the Back button.
  useEffect(() => {
    dispatch(clearDraft());
  }, [dispatch]);

  if (!booking) return <Navigate to="/my-trips" replace />;

  return (
    <main className="container section">
      <StepIndicator current={3} />

      <div className="confirm-card">
        <div className="confirm-icon" aria-hidden="true">✓</div>
        <h1 style={{ margin: 0 }}>Booking received</h1>
        <p className="summary-muted">
          We have sent your booking details to {booking.guest_email}. The hotel will confirm your stay shortly.
        </p>

        <div className="reference-box">
          <span className="eyebrow">Booking reference</span>
          <span className="reference-code">{booking.booking_reference}</span>
          <span>{booking.hotel_name} · {booking.room_name}</span>
          <span className="summary-muted">
            {formatDate(booking.check_in)} → {formatDate(booking.check_out)} · Total {formatPrice(booking.total_price)}
          </span>
        </div>

        <Link to="/my-trips" className="btn btn-dark">View my bookings</Link>
      </div>
    </main>
  );
}