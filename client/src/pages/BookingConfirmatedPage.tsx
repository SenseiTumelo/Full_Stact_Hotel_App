import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import StepIndicator from '../components/bookings/StepIndicator';
import { formatDate, formatPrice } from '../utils/booking';
import { ArrowRight, Check } from 'lucide-react';

export default function BookingConfirmedPage() {
  const { confirmed: booking, paidOnline } = useAppSelector((state) => state.booking);

  if (!booking) return <Navigate to="/my-trips" replace />;

  return (
    <main className="container section">
      <StepIndicator current={4} />

      <div className="confirm-card">
        <div className="confirm-icon" aria-hidden="true"><Check size={30} /></div>
        <h1 style={{ margin: 0 }}>{paidOnline ? 'Payment received' : 'Booking received'}</h1>
        <p className="summary-muted">
          {paidOnline
            ? 'Thank you. Your payment went through and the hotel will confirm your stay shortly.'
            : 'The hotel will confirm your stay shortly. You pay at the hotel when you arrive.'}
        </p>

        <div className="reference-box">
          <span className="eyebrow">Booking reference</span>
          <span className="reference-code">{booking.booking_reference}</span>
          <span>{booking.hotel_name} · {booking.room_name}</span>
          <span className="summary-muted">
            {formatDate(booking.check_in)} <ArrowRight size={14} /> {formatDate(booking.check_out)}
          </span>
          <span className="summary-muted">
            Total {formatPrice(booking.total_price)} · {paidOnline ? 'Paid online' : 'Pay at the hotel'}
          </span>
        </div>

        <Link to="/my-trips" className="btn btn-dark">View my bookings</Link>
      </div>
    </main>
  );
}
