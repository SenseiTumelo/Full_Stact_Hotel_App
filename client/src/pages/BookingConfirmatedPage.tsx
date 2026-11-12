import { Link, Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import StepIndicator from '../components/bookings/StepIndicator';
import { formatDate, formatPrice, nightsBetween } from '../utils/booking';
import { imageUrl } from '../utils/imageUrl';
import { useFeedback } from '../components/ui/FeedbackProvider';
import { ArrowRight, BedDouble, CalendarDays, Check, Clock3, Copy, MapPin, Printer, Users } from 'lucide-react';

export default function BookingConfirmedPage() {
  const { confirmed: booking, paidOnline } = useAppSelector((state) => state.booking);
  const { notify } = useFeedback();

  if (!booking) return <Navigate to="/my-trips" replace />;

  const bookingReference = booking.booking_reference;
  const approved = booking.status === 'approved';
  const statusLabel = approved ? 'Confirmed by the hotel' : 'Awaiting hotel confirmation';
  const paymentLabel = paidOnline || booking.payment_status === 'paid' ? 'Paid online' : 'Pay at the hotel';

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(bookingReference);
      notify('Booking reference copied.');
    } catch {
      notify('Could not copy the reference. You can select it and copy it manually.', 'error');
    }
  }

  return (
    <main className="container section booking-success-page">
      <StepIndicator current={4} />

      <header className="booking-success-heading">
        <div className="booking-success-icon" aria-hidden="true"><Check size={25} /></div>
        <p className="eyebrow">Reservation complete</p>
        <h1>{paidOnline ? 'Payment received' : 'Your booking request is in'}</h1>
        <p>{approved ? 'Your stay is confirmed. We look forward to welcoming you.' : 'Your booking is saved. The hotel will confirm your stay shortly.'}</p>
      </header>

      <article className="reservation-card">
        <div className="reservation-card-top">
          <span className="reservation-brand"><span className="brand-monogram">S</span><span><strong>Sensei</strong><small>Hotels & stays</small></span></span>
          <span className={`reservation-status${approved ? ' reservation-status-confirmed' : ''}`}><span />{statusLabel}</span>
        </div>

        <div className="reservation-hotel">
          {booking.cover_image ? <img src={imageUrl(booking.cover_image)} alt={`${booking.hotel_name} exterior`} /> : <div className="reservation-image-placeholder"><BedDouble size={28} /></div>}
          <div className="reservation-hotel-copy">
            <p className="eyebrow">Your stay</p>
            <h2>{booking.hotel_name}</h2>
            <p><MapPin size={15} /> {booking.hotel_city}</p>
            <span className="reservation-room"><BedDouble size={15} /> {booking.room_name}</span>
          </div>
        </div>

        <div className="reservation-dates">
          <div><span>Check-in</span><strong>{formatDate(booking.check_in)}</strong><small>From 3:00 in the afternoon</small></div>
          <div className="reservation-date-arrow"><ArrowRight size={18} /><small>{nightsBetween(booking.check_in, booking.check_out)} nights</small></div>
          <div><span>Check-out</span><strong>{formatDate(booking.check_out)}</strong><small>By 11:00 AM</small></div>
        </div>

        <div className="reservation-facts">
          <div><Users size={17} /><span>{booking.guests} guest{booking.guests === 1 ? '' : 's'}</span></div>
          <div><BedDouble size={17} /><span>{booking.rooms} room{booking.rooms === 1 ? '' : 's'}</span></div>
          <div><Clock3 size={17} /><span>{paymentLabel}</span></div>
        </div>

        <div className="reservation-total-row"><span>Total stay price</span><strong>{formatPrice(booking.total_price)} <small>{booking.currency}</small></strong></div>

        <div className="reservation-reference-row">
          <div><span>Booking reference</span><strong>{booking.booking_reference}</strong></div>
          <button type="button" onClick={copyReference} aria-label="Copy booking reference"><Copy size={16} /><span>Copy</span></button>
        </div>
      </article>

      <div className="booking-success-actions">
        <Link to="/my-trips" className="btn btn-dark">View my bookings</Link>
        <Link to={`/hotels/${booking.hotel_id}`} className="btn btn-secondary">View hotel</Link>
        <button type="button" className="btn btn-secondary booking-print-button" onClick={() => window.print()}><Printer size={16} /> Print confirmation</button>
      </div>
      <p className="booking-success-note"><CalendarDays size={15} /> Your reservation details are available anytime in My trips.</p>
    </main>
  );
}
